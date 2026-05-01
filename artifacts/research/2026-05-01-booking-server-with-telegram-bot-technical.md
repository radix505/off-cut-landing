# Technical Research: Booking Server + Telegram Owner Bot

## Strategic Summary

Three real options for adding a backend to the existing Vite/React landing page so web bookings persist and the shop owner gets notified + can manage them via Telegram. **Recommended: a single Node + Fastify process running grammY in long-polling mode with better-sqlite3 storage, deployed beside the static site on the same VPS.** Tradeoff: long-polling uses one always-on process (a few MB RAM); the alternative — webhook mode — is "purer" but forces you to put HTTPS + a public route in front of your bot, which is overkill for a one-shop barbershop.

---

## Requirements (from intake)

- **Frontend**: existing Vite + React 19 SPA at `/booking` (`src/components/Booking.jsx`) — submit currently does nothing; replace with real POST.
- **Bot scope**: shop-owner-facing only.
  - Push notification to owner on every new web booking, with inline **Confirm / Cancel** buttons.
  - Owner can run `/list`, `/today`, `/confirm <id>`, `/cancel <id>` to manage from the bot.
  - **Not** customer-facing — customers book on the website only.
- **Hosting**: same host as the landing page (single VPS / single box). One process to manage.
- **Stack**: open — recommend the lowest-friction option for this codebase.
- **Implicit constraints from `Booking.jsx`**:
  - Service durations are display strings (`'1h 15min'`) — server needs them as minutes.
  - Currently 5 hardcoded "unavailable" slots applied globally — must become real per-(barber,date) data.
  - Phone validation is loose; no auth; no spam protection.

---

## Approach 1: Fastify + grammY (long-polling) + better-sqlite3 — single Node process

**How it works**
One Node process boots Fastify (HTTP API for the React app) and grammY (Telegram bot in long-polling mode) side by side. SQLite file lives on the same disk. The Fastify route `POST /api/bookings` inserts a row, then calls `bot.api.sendMessage(OWNER_CHAT_ID, …, { reply_markup: inlineKeyboard })`. The bot's button handlers update the same SQLite row's `status`. No webhook plumbing — grammY's `bot.start()` opens a single `getUpdates` HTTP connection to Telegram and yields updates. Vite serves the built SPA either via Fastify's `@fastify/static` or via a separate Caddy/Nginx in front (recommended).

**Libraries / tools**
- `fastify` ^5 — HTTP server + JSON schema validation
- `@fastify/cors` — only needed in dev; in prod the SPA and API share an origin
- `better-sqlite3` ^11 — sync SQLite, single file, very fast for this workload
- `grammY` ^1.30 — modern Telegram bot framework, first-class TypeScript types, smaller and cleaner API than Telegraf
- `dotenv` for `BOT_TOKEN` and `OWNER_CHAT_ID`
- Process supervisor: `systemd` unit (one-time setup) or `pm2`

**Pros**
- One process, one repo, one deploy. Trivial mental model.
- Long-polling needs **no inbound HTTPS** for the bot — your firewall can stay closed to Telegram. Only your existing 80/443 for the website is exposed.
- better-sqlite3 is sync, so the booking insert + Telegram notify happen in a clean transaction-then-side-effect order with no callback gymnastics.
- grammY has clean middleware, sessions, and inline-keyboard helpers; docs are excellent.
- Backups = `cp data/bookings.sqlite`.

**Cons**
- Long-polling holds an open HTTP connection to Telegram constantly. For a single-shop bot this is a non-issue (negligible bandwidth, one socket), but it does mean the process must always be alive — `systemd` restart on crash matters.
- Single process = single point of failure. Acceptable for one barbershop; unacceptable for a SaaS.
- `better-sqlite3` requires native compilation on deploy (one `npm rebuild` after install on the VPS); not exotic but worth noting.

**Best when**: small business, single host, single owner, you want to ship this week and forget about it.
**Complexity**: **S**

---

## Approach 2: Fastify + grammY (webhook mode) + better-sqlite3

**How it works**
Same stack as Approach 1, but instead of long-polling, you register a Telegram webhook with `bot.api.setWebhook('https://offcut.eu/tg/<secret>')` and mount grammY's webhook handler as a Fastify route. Telegram POSTs each update to that URL. Requires a public HTTPS endpoint, which you already have for the landing page — so reuse it.

**Libraries / tools**
Same as Approach 1, plus `grammy` webhook adapter (`webhookCallback(bot, 'fastify')`). No long-polling loop.

**Pros**
- No idle HTTP connection to Telegram; updates are pushed instantly.
- Slightly lower latency on bot interactions (no polling interval).
- Process can in principle be stateless — friendlier to future scaling.

**Cons**
- Requires correct HTTPS termination + reverse-proxy config (Caddy/Nginx routing `/tg/<secret>` to the Node process). One more thing to misconfigure.
- The webhook URL must include a **secret token** in the path or `X-Telegram-Bot-Api-Secret-Token` header — easy to forget.
- If Telegram retries fail (your server is down), updates pile up in their queue and may be dropped after some hours. Long-polling silently catches up on reconnect.
- For a single shop, none of these benefits matter.

**Best when**: you already terminate TLS for the API, want sub-second bot latency, or expect to scale to many bots/instances.
**Complexity**: **M**

---

## Approach 3: Express + Telegraf + Postgres on Neon (serverless-friendly Node)

**How it works**
Replace SQLite with hosted Postgres (Neon free tier), use Telegraf instead of grammY, deploy as a long-running Node process on the same VPS — but the data layer is portable enough that you could later move to Vercel functions if hosting plans change.

**Libraries / tools**
- `express` ^4
- `telegraf` ^4 — older but very widely used Telegram framework
- `pg` + `drizzle-orm` or `kysely` for typed queries
- Neon (managed Postgres, generous free tier)

**Pros**
- Postgres scales further than SQLite if the business expands to multiple shops.
- Drizzle/Kysely give compile-time type safety on queries.
- No native compile step on deploy.

**Cons**
- More moving parts: a second hosted service (Neon) with its own auth, connection limits, and free-tier "scale-to-zero" cold starts that hurt API latency.
- Telegraf is fine but its TypeScript story is messier than grammY's; docs lag a bit.
- Express is showing its age vs Fastify (slower, weaker schema validation).
- Overkill for one barbershop — you're paying complexity tax for scale you don't need.

**Best when**: you expect to expand to multiple locations or sell this as a product.
**Complexity**: **M-L**

---

## Comparison

| Aspect | 1: Fastify+grammY (poll) | 2: Fastify+grammY (webhook) | 3: Express+Telegraf+Neon |
|---|---|---|---|
| Complexity | **S** | M | M-L |
| Time to first booking | ~1 day | ~1.5 days | ~2-3 days |
| Pieces to deploy | 1 process | 1 process + reverse proxy rule | 1 process + external DB |
| Bot latency | ~1 s (polling interval) | <300 ms | <300 ms |
| Backup | `cp` one file | `cp` one file | DB dump / managed |
| Cost | $5/mo VPS only | $5/mo VPS only | $5/mo VPS + Neon free tier |
| Failure modes | Process down → bot offline | Process or proxy down → bot offline + Telegram drops updates after hours | Process or Neon down |
| Future scaling | Migrate to Postgres later if needed | Same | Already scalable |

---

## Recommendation

**Approach 1 — Fastify + grammY (long-polling) + better-sqlite3.**

For a single Szczecin barbershop with one owner, the simplicity wins decisively. You ship in a day, the entire system is one Node process plus one `.sqlite` file, and you never have to think about webhook secrets or reverse-proxy paths. If/when the shop opens a second location or you want sub-second bot latency, switching grammY from `bot.start()` to `webhookCallback()` is a 10-line change — the rest of the architecture stays the same. SQLite handles thousands of bookings/day comfortably; you'll never outgrow it for this use case.

The one place to be careful: do the Telegram notification **after** the SQLite insert commits, but **don't fail the HTTP response if Telegram is down** — log it, return 200 to the customer, and let the owner check `/list` later. Customer-facing reliability shouldn't depend on Telegram's uptime.

---

## Implementation Context

<claude_context>
<chosen_approach>
- name: Fastify + grammY (long-polling) + better-sqlite3, single Node process
- libraries:
  - fastify ^5
  - @fastify/cors ^10 (dev only)
  - @fastify/static ^8 (optional — only if Node also serves the built SPA)
  - better-sqlite3 ^11
  - grammy ^1.30
  - dotenv ^16
- install: |
    npm install fastify @fastify/cors better-sqlite3 grammy dotenv
    npm install --save-dev @types/better-sqlite3
</chosen_approach>

<architecture>
- pattern: monolithic Node process — Fastify (REST API) + grammY (Telegram bot) sharing one SQLite database via the better-sqlite3 module. Vite-built static SPA served by the same Fastify (or by Caddy/Nginx in front, the latter is preferred in prod).
- components:
  - server/db.js — opens better-sqlite3 connection, runs migrations on boot, exports prepared statements
  - server/services-data.js — single source of truth for service id → durationMin (mirrors client SERVICES; later expose via GET /api/services)
  - server/availability.js — pure function that takes (barberId, dateISO, allBookingsForThatDay, allServiceDurations) and returns Set<"HH:MM"> of unavailable slots, including blocks covered by multi-slot services
  - server/routes/bookings.js — POST /api/bookings (validate → insert → notify owner), GET /api/availability
  - server/bot.js — grammY Bot instance, /list, /today, /confirm, /cancel commands, inline-keyboard handlers for Confirm/Cancel buttons sent in notifications
  - server/index.js — wire it all together, bot.start(), fastify.listen(3001)
- data_flow:
  1. React Booking.jsx step 3: useEffect fetches /api/availability?barberId&date when both set, populates a state Set replacing the hardcoded UNAVAILABLE constant
  2. React Booking.jsx step 4 Send: POST /api/bookings with {barberId, serviceId, date, slot, durationMin, name, phone}
  3. Fastify validates body (schema), checks availability inside a transaction, inserts row with status='pending'
  4. After commit, bot.api.sendMessage(OWNER_CHAT_ID, "...summary...", {reply_markup: InlineKeyboard.text("Confirm","cf:<id>").text("Cancel","cx:<id>")}) — wrapped in try/catch so Telegram failure doesn't fail the response
  5. Owner taps Confirm → callback "cf:<id>" handler updates row status, edits the message to ✓ Confirmed
  6. Owner can also DM the bot /list, /today, /confirm 42, /cancel 42 — same DB, same updates
</architecture>

<files>
- create:
  - server/index.js — entrypoint
  - server/db.js — better-sqlite3 + schema migration (idempotent CREATE TABLE IF NOT EXISTS)
  - server/services-data.js — { s1: { durationMin: 45 }, s2: { durationMin: 55 }, ... } matching SERVICES in Booking.jsx
  - server/availability.js — slot-block computation
  - server/routes/bookings.js — Fastify plugin with two routes
  - server/bot.js — grammY Bot, command + callback handlers
  - .env — BOT_TOKEN, OWNER_CHAT_ID, PORT=3001
  - data/.gitkeep — directory for bookings.sqlite (gitignore the .sqlite file itself)
- modify:
  - vite.config.js — add server.proxy: { '/api': 'http://localhost:3001' }
  - package.json — add scripts: "server": "node server/index.js", "dev:all": "node --run server & npm run dev"
  - src/components/Booking.jsx —
    1. Add durationMin to each SERVICES entry: 45, 55, 30, 75, 30, 50, 80
    2. Replace `const UNAVAILABLE = new Set([...])` with state: `const [unavailable, setUnavailable] = useState(new Set())`
    3. Add useEffect([barber?.id, date]) that fetches /api/availability and populates that state
    4. Replace `setSubmitted(true)` in the Send handler with an async submitBooking() that POSTs and only flips `submitted` on 2xx; surface errors via a new `error` state
    5. Add `isSubmitting` state to disable the Send button while in flight
  - .gitignore — add `data/*.sqlite`, `.env`
- structure: |
    off-cut-landing/
      src/                  ← unchanged React app
      server/               ← NEW
        index.js
        db.js
        bot.js
        services-data.js
        availability.js
        routes/
          bookings.js
      data/
        bookings.sqlite     ← gitignored
      .env                  ← gitignored
- reference:
  - src/components/Booking.jsx (lines 5-19): hardcoded BARBERS and SERVICES — keep as-is for v1, mirror in server/services-data.js for duration math
  - src/components/Booking.jsx (line 26): UNAVAILABLE — this is the constant to replace with fetched data
  - src/components/Booking.jsx (lines 37-48): buildSlots — server's availability.js mirrors this slot grid logic so client and server agree
  - src/components/Booking.jsx (line 299): the setSubmitted(true) call — replace with await fetch
</files>

<implementation>
- start_with: server/db.js + the SQLite schema. Get the file created and a single hand-written INSERT working via a node REPL before touching Fastify. This isolates the most error-prone piece (schema, native module compile) first.
- order:
  1. server/db.js — schema, prepared statements, manual smoke test
  2. server/services-data.js + server/availability.js — pure functions, easiest to unit test with node --test
  3. server/routes/bookings.js — POST /api/bookings (without bot wiring), test with curl
  4. server/index.js — Fastify boot, register routes, listen on :3001; verify curl POST persists to SQLite
  5. Wire Booking.jsx — durationMin field, replace UNAVAILABLE with fetch, replace setSubmitted with POST. End-to-end browser test of the full happy path before adding the bot.
  6. server/bot.js — get a hello-world bot responding to /start in your DM. Confirm OWNER_CHAT_ID by sending yourself a message and reading bot.on('message') logs.
  7. Wire bot notifications into POST /api/bookings (try/catch so it never breaks the customer response).
  8. Add /list, /today, /confirm, /cancel commands. Add inline-keyboard callback handlers for "cf:<id>" / "cx:<id>".
  9. systemd unit (or pm2) on the VPS, point Caddy/Nginx so / serves Vite's dist and /api proxies to :3001.
- gotchas:
  - The `UNIQUE(barber_id, date, slot)` index only catches exact-slot collisions. A 75-minute service starting at 14:30 also occupies 15:00, 15:30, 16:00. Compute the slot-block server-side from durationMin and check ALL of them inside a single SQLite transaction (BEGIN IMMEDIATE) before inserting. Otherwise two concurrent submissions can double-book.
  - Service durations on the client are display strings like "1h 15min". Don't parse them — add explicit `durationMin: 75` fields to SERVICES and send that number in the POST body. Server still re-validates the duration against services-data.js so a malicious client can't claim a 5-minute booking.
  - Timezone: store date as plain "YYYY-MM-DD" and slot as "HH:MM" in Europe/Warsaw (the shop's local time). Do NOT use Date toISOString — it converts to UTC and you'll get off-by-one errors near midnight. The browser builds the date from year+month+day, which is local-time, which matches.
  - Long-polling auto-recovers from network blips, but a crashed Node process won't. Use systemd with Restart=always or pm2.
  - grammY callback queries: always answer them with ctx.answerCallbackQuery() even if you ignore them, otherwise Telegram shows a loading spinner forever on the owner's button.
  - OWNER_CHAT_ID must be your numeric Telegram user id (not @username). Easiest way: temporarily log every incoming update's chat.id, message yourself, copy the number, set in .env, remove the log.
  - Don't expose the SQLite file via @fastify/static — keep data/ outside any served path.
  - Vite dev: the proxy hot-reloads the SPA, but server/ files don't auto-restart. Use `node --watch server/index.js` in dev.
  - Phone field validation on the client (length > 5) is too loose — validate on server with a simple regex like /^[+\d\s\-()]{7,20}$/. Don't try to validate "real" phones; SMS confirmation is the only reliable check.
  - When sending the booking notification message, make sure to MarkdownV2-escape special chars (-, ., (, etc.) or just use plain text mode. The customer name is user-controlled.
- testing:
  - Unit: node --test server/availability.test.js — feed sample bookings + service durations, assert the unavailable Set
  - Integration: curl -X POST localhost:3001/api/bookings with valid + invalid bodies; verify SQLite row + 4xx on bad input
  - Conflict: fire two simultaneous curls at the same slot; expect exactly one 200 and one 409
  - End-to-end: complete the wizard in the browser, verify Telegram message arrives in your DM, click Confirm, verify SQLite status flips to 'confirmed' and message edits to ✓
  - Bot: DM /list, /today, /cancel <bad-id>, /confirm <good-id>; verify each
  - Disaster drill: kill the bot process during a wizard submission; the POST should still 200 (Telegram failure swallowed), and on bot restart, /list should show the orphaned pending booking
</implementation>
</claude_context>

**Next Action**: Begin implementation in the order listed. Start with `server/db.js` and verify a manual INSERT works before adding any framework on top.

---

## Sources

- grammY official docs (intro, deployment modes, inline keyboards): https://grammy.dev/ — accessed 2026-05-01
- grammY vs Telegraf comparison (grammY docs "About"): https://grammy.dev/resources/comparison — accessed 2026-05-01
- Fastify v5 docs (plugins, schema validation): https://fastify.dev/docs/latest/ — accessed 2026-05-01
- better-sqlite3 README (sync API, performance, prepared statements): https://github.com/WiseLibs/better-sqlite3 — accessed 2026-05-01
- Telegram Bot API — getUpdates vs setWebhook tradeoffs: https://core.telegram.org/bots/api#getting-updates — accessed 2026-05-01
- Telegram Bot API — answerCallbackQuery requirement: https://core.telegram.org/bots/api#answercallbackquery — accessed 2026-05-01
- Project source: src/components/Booking.jsx (off-cut-landing repo, lines 5-309) — read 2026-05-01
