# Off Cut - VPS deployment runbook

Production stack: **Caddy v2 + Fastify/Vite app + Postgres 16 + nightly pg_dump sidecar**, all in `docker-compose.prod.yml`.

Canonical domain: **off-cut-barbershop.pl**. `www.off-cut-barbershop.pl` 301-redirects to it. Caddy auto-issues + renews Let's Encrypt certs for both hostnames, and HTTP→HTTPS redirects are on by default.

> The Caddyfile previously listed `off-cut.pl` and `offcut.pl` (+ www variants) too. Those domains are not currently DNS'd at the VPS and have been dropped from the Caddyfile to keep cert issuance clean. Add them back (as redirects to `off-cut-barbershop.pl`) once their A records point here.

## 0. VPS prerequisites

- Docker Engine + the compose plugin (`docker compose version` works).
- Ports `80`, `443/tcp` and `443/udp` open. (`/udp` is for HTTP/3.)
- A non-root user in the `docker` group.

```sh
sudo ufw allow 22
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 443/udp
sudo ufw enable
```

## 1. DNS

Add A records pointing both hostnames at the VPS IP:

```
off-cut-barbershop.pl       A   <VPS_IP>
www.off-cut-barbershop.pl   A   <VPS_IP>
```

Verify before you start the stack - Let's Encrypt fails fast if a hostname doesn't resolve:

```sh
for h in off-cut-barbershop.pl www.off-cut-barbershop.pl; do
  echo "$h -> $(dig +short A "$h" | head -n1)"
done
```

## 2. First deploy

```sh
git clone https://github.com/<you>/off-cut-landing.git
cd off-cut-landing

# Env
cp .env.production.example .env
$EDITOR .env                                # fill POSTGRES_PASSWORD + secrets

# Backups dir (Caddy stores certs in a named volume; no host paths needed)
mkdir -p backups

# Bring it up
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml logs -f caddy
# Watch for: "certificate obtained successfully" lines for each hostname.
# First issuance takes 10–60s per domain.
```

Smoke test:

```sh
curl -sI https://off-cut-barbershop.pl/api/health   # → 200 OK, body {"ok":true}
curl -sI http://off-cut-barbershop.pl/              # → 308 to https (Caddy default)
curl -sI https://www.off-cut-barbershop.pl/         # → 301 to https://off-cut-barbershop.pl/

# Confirm HTTP/3 is advertised
curl -sI https://off-cut-barbershop.pl/ | grep -i alt-svc   # → alt-svc: h3=":443"; ma=...
```

## 3. Subsequent deploys

App code changes:

```sh
cd off-cut-landing
git pull
docker compose -f docker-compose.prod.yml up -d --build app
docker image prune -f                          # optional, reclaim space
```

Caddyfile-only changes (zero-downtime reload, no container restart):

```sh
$EDITOR Caddyfile
docker compose -f docker-compose.prod.yml exec caddy \
  caddy reload --config /etc/caddy/Caddyfile
```

The Postgres volume and `caddy-data` (cert storage) volume persist, so certs aren't re-issued and bookings aren't lost across rebuilds.

## 4. Logs & ops

```sh
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f app
docker compose -f docker-compose.prod.yml logs -f caddy     # access log + cert events
docker compose -f docker-compose.prod.yml logs -f backup

# Inspect Caddy's live, adapted JSON config (admin API, container-local only)
docker compose -f docker-compose.prod.yml exec caddy \
  wget -qO- http://localhost:2019/config/

# Shell into the app
docker compose -f docker-compose.prod.yml exec app sh

# psql in the DB
docker compose -f docker-compose.prod.yml exec postgres \
  psql -U offcut -d offcut
```

## 5. Backups

The `backup` sidecar runs an infinite loop: every 24h it writes `backups/offcut-YYYYMMDD-HHMMSS.dump` (Postgres custom format) and prunes anything older than 14 days. Files appear on the host in `./backups/`.

Trigger an immediate backup:

```sh
docker compose -f docker-compose.prod.yml exec backup sh -c \
  'pg_dump -h postgres -U offcut -d offcut -F c -f /backups/manual-$(date +%s).dump'
ls -lh backups/
```

Restore a dump (destructive - drops & recreates objects):

```sh
# Copy the file into the postgres container
docker compose -f docker-compose.prod.yml cp \
  backups/offcut-20260101-030000.dump postgres:/tmp/restore.dump

# Run pg_restore inside the postgres container
docker compose -f docker-compose.prod.yml exec postgres \
  pg_restore -U offcut -d offcut --clean --if-exists /tmp/restore.dump
```

## 6. Rollback

```sh
git log --oneline -n 10
git checkout <previous-sha>
docker compose -f docker-compose.prod.yml up -d --build
```

If a deploy ships a broken DB migration, restore the most recent dump *before* rolling back app code.

## 7. Cert renewal

Automatic. Caddy renews ~30 days before expiry over HTTP-01. Verify any time:

```sh
openssl s_client -servername off-cut-barbershop.pl -connect off-cut-barbershop.pl:443 </dev/null 2>/dev/null \
  | openssl x509 -noout -dates
```

Cert state lives in the `caddy-data` named volume - back it up if you're nervous about Let's Encrypt rate limits during a recovery (5 duplicate certs/week/account):

```sh
docker run --rm -v off-cut-landing_caddy-data:/data -v "$PWD/backups":/backups \
  alpine tar czf /backups/caddy-data-$(date +%Y%m%d).tgz -C /data .
```

## 8. Hardening checklist (do before you forget)

- [ ] Set a real `VITE_GTM_ID` and rebuild (`docker compose -f docker-compose.prod.yml up -d --build app`).
- [ ] Confirm `RESEND_API_KEY` is set and `mail.offcutszczecin.pl` has SPF + DKIM verified in Resend.
- [ ] Add an off-site copy of `./backups/` (rclone to R2/B2/S3, or `rsync` to a second machine).
- [ ] Consider a Caddy `rate_limit` directive on `POST /api/bookings` once you see real traffic (needs Caddy build with the `caddyserver/rate-limit` plugin, or front it with fail2ban on the host).
- [ ] For log inspection, either tail `docker compose logs caddy app` or drop a `Dozzle` container in front of the Docker socket for a web UI.
