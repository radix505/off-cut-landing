# Off Cut — Tag & Deploy TODO

Stan implementacji emaili Resend i analityki GTM/GA4. Co zrobione, co zostało do dokończenia przed produkcją.

---

## STATUS OGÓLNY

| Obszar | Kod | Konfiguracja zewnętrzna | Deploy |
|---|---|---|---|
| Resend — mail #1 (zgłoszenie) | ✅ | ⏳ env vars w Dokploy | ⏳ rebuild |
| Resend — mail #2 (potwierdzenie + ICS) | ✅ | ⏳ env vars w Dokploy | ⏳ rebuild |
| Email logo (PNG via CID) | ✅ | — | ✅ (w repo) |
| GTM container — `GTM-K4CZZ5XR` | ✅ index.html | 🟡 2/3 tagi gotowe (page_view tag czeka na zamianę na built-in vars) | ⏳ Submit + Publish |
| GA4 property — `G-TPK9NC9ZPC` | ✅ kod | ⏳ wyłączyć Enhanced Measurement page changes | ⏳ |
| Consent Mode v2 | ✅ | ✅ default=denied | ✅ |
| Booking conversion event | ✅ kod | ⏳ tag w GTM | ⏳ Mark as conversion w GA4 |

---

## ✅ CO ZOSTAŁO ZROBIONE

### 1. Mailer Resend (server-side)

- **Schema DB** — `bookings` dostała 3 nowe kolumny (idempotentna migracja przy starcie):
  - `email TEXT` — adres klienta
  - `lang TEXT NOT NULL DEFAULT 'pl'` — język z formularza
  - `received_email_sent_at TIMESTAMPTZ` — guard idempotencji dla maila #1
  - `confirmation_email_sent_at TIMESTAMPTZ` — guard idempotencji dla maila #2
- **`server/mail/`** (nowy katalog):
  - `resend.js` — Resend SDK client + helpery konfiguracji
  - `ics.js` — generator iCal RFC 5545 z VTIMEZONE Europe/Warsaw (DST-aware)
  - `templates/confirmation.js` — szablon HTML+text+subject, state-aware (`received` vs `confirmed`), PL/EN
  - `index.js` — `sendBookingReceived()` + `sendBookingConfirmation()`, atomiczna rezerwacja przez `markReceivedEmailSent` / `markConfirmationEmailSent`, idempotency-key dla Resenda
  - `assets/wordmark-dark.png` + `wordmark-light.png` — Off Cut logo (bearded icon + Let Me Ride wordmark), 2× DPI dla retina, attachowane jako CID inline w każdym mailu
  - `assets/build-logos.mjs` — build script logo (re-run gdy zmieni się font/ikona)
  - `preview.mjs` — `node server/mail/preview.mjs` renderuje 4 warianty do `artifacts/mail-preview/`
- **Route `POST /api/bookings`** — `email` wymagane w body schema; po insert woła `sendBookingReceived(created)` fire-and-forget
- **Bot `bk:confirm` callback** — po `updateStatus → 'confirmed'` woła `sendBookingConfirmation(after)` fire-and-forget
- **Frontend `Booking.jsx`** — submit wysyła `lang` w body; success copy odzwierciedla dwa maile

### 2. Analityka GTM/GA4 (client-side)

- **`index.html`** — Consent Mode v2 default=denied (lub `granted` jeśli `localStorage['offcut-consent']==='accepted'`); GTM script + noscript gated na `%VITE_GTM_ID%`
- **`src/lib/analytics.js`** — `updateConsent(granted)`, `trackPageview(path, title)`, `trackEvent(name, params)`. Wszystko przez `window.dataLayer.push`.
- **`src/hooks/useAnalyticsPageview.js`** — strzela `page_view` event przy każdej zmianie route'a z RouterContext (dedup na `prevKey`).
- **`src/App.jsx`** — `useAnalyticsPageview()` w `AppRoutes`.
- **`src/components/CookieBanner.jsx`** — accept/decline woła `updateConsent(true/false)`. Copy zaktualizowane na "Używamy plików cookie do działania strony i — za Twoją zgodą — do anonimowej statystyki ruchu (Google Analytics)".
- **`src/components/Booking.jsx`** — po `res.ok` strzela `trackEvent('booking_submitted', { barber_id, barber_name, service_id, service_name, value, currency: 'PLN' })`.
- **`src/pages/CookiesPage.jsx`** — sekcja 2, 3, 5 (PL + EN) przepisane, opisują Consent Mode v2 i kategoryzację cookies.

### 3. Infrastruktura / build

- **`.env.example`** — uzupełniony o `RESEND_API_KEY`, `MAIL_FROM`, `MAIL_REPLY_TO`, `MAIL_DRY_RUN`, `VITE_GTM_ID` + komentarze
- **`Dockerfile`** — `ARG VITE_GTM_ID + ENV VITE_GTM_ID=$VITE_GTM_ID` w build stage (Vite czyta przy `npm run build`)
- **`docker-compose.prod.yml`** — przekazuje `RESEND_API_KEY`, `MAIL_FROM`, `MAIL_REPLY_TO`, `MAIL_DRY_RUN` jako runtime env i `VITE_GTM_ID` jako build-arg
- **`eslint.config.js`** — node globals dla `server/**/*.js`
- **`package.json`** — dependency `resend@^6.12.3`

### 4. GTM workspace (w panelu)

- ✅ **Tag Google `G-TPK9NC9ZPC`** — typ "Tag Google", trigger **Consent Initialization — All Pages**, parametr `send_page_view = false`
- ✅ **GA4** (event tag) — typ "GA4 Event", measurement ID inherited z Tag Google, event name `page_view`, parametr `page_path = {{Page Path}}` (built-in GTM variable), trigger **Custom Event: page_view**
- ✅ Built-in Variables włączone: Page Path, Page URL
- ✅ Trigger Custom Event: `page_view`

> **Uwaga o page_view:** używamy wbudowanej zmiennej GTM `{{Page Path}}` zamiast custom Data Layer Variable, bo nasz React hook strzela `page_view` PO tym jak router zaktualizował URL przez `pushState` — w tym momencie wbudowana `{{Page Path}}` czyta z `window.location.pathname` poprawną wartość.
>
> **`page_title` w ogóle pomijamy** — GA4 auto-zbiera `document.title` z każdym hitem przez bibliotekę gtag, więc parametr jest redundantny. Plus na Off Cut tytuł strony nie zmienia się między route'ami (zawsze "OFF CUT Barbershop"), więc i tak nie nosi informacji.
>
> Custom Data Layer Variables są potrzebne tylko dla `booking_submitted` (bo barber_id, service_id itp. nie są w URL).

---

## ⏳ CO ZOSTAŁO DO ZROBIENIA

### A. GTM workspace — dokończenie

#### A0. (Najpierw) Włącz wbudowane zmienne + popraw tag page_view

1. **Variables → Built-In Variables → Configure** → zaznacz:
   - `Page Path`
   - `Page URL` (na zapas, dla future events)
   - (`Page Title` NIE istnieje jako built-in w GTM — pomijamy)
2. Wejdź w tag **GA4** (ten z trigger `page_view`)
3. W sekcji "Parametry zdarzenia":
   - `page_path` → kliknij ikonę `{{ }}` → wybierz `{{Page Path}}` (zamiast aktualnego `{{dlv_page_path}}`)
   - `page_title` → **USUŃ ten wiersz** (klik kosz/minus). GA4 auto-zbiera `document.title` przez gtag — parametr redundantny, plus tytuł i tak nie zmienia się między route'ami w SPA.
4. Save tag

To wystarczy — custom `dlv_page_path` / `dlv_page_title` możesz potem usunąć z Variables (albo zostawić, nie szkodzą).

#### A1. Stwórz brakujące zmienne Data Layer (6 sztuk, tylko dla booking_submitted)

> Te zmienne są potrzebne wyłącznie dla tagu `booking_submitted` — dane biznesowe (barber, usługa, cena) nie są w URL, więc wbudowane variables ich nie ogarną. Dla page_view używamy `{{Page Path}}` + `{{Page Title}}` (built-in).

**Variables → User-Defined Variables → New** dla każdej:

| Nazwa | Typ | Data Layer Variable Name |
|---|---|---|
| `dlv_barber_id` | Data Layer Variable | `barber_id` |
| `dlv_barber_name` | Data Layer Variable | `barber_name` |
| `dlv_service_id` | Data Layer Variable | `service_id` |
| `dlv_service_name` | Data Layer Variable | `service_name` |
| `dlv_value` | Data Layer Variable | `value` |
| `dlv_currency` | Data Layer Variable | `currency` |

Każda: Data Layer Version = 2, Default Value puste.

#### A2. Stwórz trigger `CE - booking_submitted`

**Triggers → New**:
- Typ: **Zdarzenie niestandardowe** (Custom Event)
- Event name: `booking_submitted` (lower-case, dokładnie)
- Use regex matching: odznaczone
- This trigger fires on: All Custom Events

#### A3. Stwórz tag `GA4 - booking_submitted`

**Tags → New**:
- Typ: **Google Analytics: zdarzenie GA4** (GA4 Event)
- Measurement ID: `G-TPK9NC9ZPC` lub "Use Measurement ID configured in Google tag"
- Event Name: `booking_submitted`
- Event Parameters:
  - `barber_id` → `{{dlv_barber_id}}`
  - `barber_name` → `{{dlv_barber_name}}`
  - `service_id` → `{{dlv_service_id}}`
  - `service_name` → `{{dlv_service_name}}`
  - `value` → `{{dlv_value}}`
  - `currency` → `{{dlv_currency}}`
- Advanced Settings → Consent Settings → Additional consent checks: `analytics_storage`
- Trigger: `CE - booking_submitted`

#### A4. Submit + Publish workspace GTM

- Górny prawy róg → **Submit**
- Version name: `Add booking_submitted event`
- Publish

**Bez Publish nic nie trafia na produkcję.**

### B. GA4 admin (analytics.google.com → property G-TPK9NC9ZPC)

#### B1. Wyłącz Enhanced Measurement Page changes (KRYTYCZNE)

Inaczej GA4 sam zlicza pageviews przy `pushState` (SPA navigation) i mamy DUPLIKATY obok naszego eventu z hooka.

- **Admin → Data Streams → Web stream**
- Sekcja **Enhanced Measurement** → kliknij zębatkę
- Odznacz **"Page changes based on browser history events"**
- Pozostałe measurements (scroll, outbound clicks, site search, file downloads) zostaw — nie kolidują

#### B2. Po pierwszych prod-eventach: oznacz `booking_submitted` jako Key Event

- **Admin → Events** (poczekaj 24h lub dopóki pierwsze eventy nie spłyną)
- Znajdź `booking_submitted` na liście
- Przełącznik **Mark as key event** → on
- (W GA4 terminologia zmieniła się z "Conversions" na "Key Events" pod koniec 2024)

### C. Resend (resend.com)

#### C1. Weryfikacja domeny nadawczej

- W panelu Resend → **Domains** → status powinien być **Verified** (zielony check)
- Wymagane rekordy DNS (Resend pokaże dokładne wartości):
  - **MX** (dla bounces)
  - **TXT (SPF)** — np. `v=spf1 include:amazonses.com ~all`
  - **TXT (DKIM)** — 1-3 selektory
- Opcjonalnie ale zalecane: **DMARC** — `_dmarc.offcutszczecin.pl  TXT  v=DMARC1; p=none; rua=mailto:offcutszczecin@gmail.com`

#### C2. API key

- Wygeneruj klucz API w **API Keys** w panelu Resend
- Skopiuj — będzie potrzebny do Dokploya

### D. Dokploy — environment variables (serwis `app`)

#### D1. Dodaj w panelu Dokploy → Environment:

```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
MAIL_FROM=Off Cut <rezerwacje@mail.offcutszczecin.pl>
MAIL_REPLY_TO=offcutszczecin@gmail.com
MAIL_DRY_RUN=
VITE_GTM_ID=GTM-K4CZZ5XR
```

**Uwaga:** `VITE_GTM_ID` jest build-time — Dokploy musi przebudować obraz po dodaniu zmiennej. Sam restart kontenera nie zadziała.

#### D2. Rebuild + redeploy

- W Dokploy: **Deploy** (force rebuild, nie tylko restart) po dodaniu env vars
- Po deployu sprawdź w devtools źródło strony — w `<head>` powinien być GTM snippet z `GTM-K4CZZ5XR`

### E. Git workflow

#### E1. Pull remote master (1 commit behind: `hamburger 2nd X button remove and booking improvements`)

```bash
git stash push -u -m "wip: resend + gtm + email logo"
git pull --ff-only
git stash pop
```

#### E2. Commit + push

```bash
git add -A
git commit -m "feat(booking): Resend transactional emails + GTM analytics

- Two-stage emails: booking_received (immediately) + booking_confirmed (after Telegram ✅) with ICS attachment
- Off Cut wordmark + Let Me Ride font baked into PNGs, CID-attached
- GTM container GTM-K4CZZ5XR + GA4 G-TPK9NC9ZPC, Consent Mode v2 default=denied
- booking_submitted conversion event on submit
- CookiesPage updated to reflect actual cookie usage"
git push
```

### F. Post-deploy smoke tests

#### F1. GTM Preview Mode

- tagassistant.google.com → Add domain `https://offcutszczecin.pl`
- Otwórz stronę w Preview, klikaj:
  - Banner cookie → Accept → sprawdź w Tag Assistant: tag "Tag Google" odpalił się (consent granted)
  - Nawigacja po stronie → tag "GA4" (page_view) odpala się przy każdej zmianie route'a
  - Booking flow → po submit tag "GA4 - booking_submitted" odpalił się z parametrami (nie undefined)
- W incognito: Decline → tag "Tag Google" NIE odpalił się (Consent Mode blokuje)

#### F2. GA4 DebugView

- W GTM dodaj tymczasowo parametr `debug_mode=true` w tagu Tag Google (lub dla testowego ruchu z `?gtm_debug=1`)
- GA4 → **Admin → DebugView** — natychmiastowy podgląd eventów
- Sprawdź że `page_view` i `booking_submitted` lecą z poprawnymi parametrami

#### F3. Resend dashboard

- Po pierwszej rzeczywistej rezerwacji: **Resend → Emails** powinien pokazywać dwa wysłane maile (received + confirmation)
- Sprawdź status: `delivered`, nie `bounced` / `complained`
- Otwórz oba w Outlooku + Apple Mail + Gmail żeby zweryfikować: logo widoczne, ICS attachment otwiera się w Apple Calendar

#### F4. End-to-end test

1. Otwórz stronę w incognito
2. Zaakceptuj banner cookie
3. Zrób rezerwację na swój email (Gmail + Outlook żeby zobaczyć 2 renderingi)
4. Sprawdź skrzynkę — przyjść powinien **mail #1** w ~3s z tematem "Off Cut · Wizyta zgłoszona…"
5. Na Telegramie tapnij ✅ Potwierdź
6. Sprawdź skrzynkę — **mail #2** w ~3s z tematem "Off Cut · Wizyta potwierdzona…" + załącznik `off-cut.ics`
7. Otwórz `.ics` → event w kalendarzu na poprawnej godzinie w Europe/Warsaw
8. Cofnij + ponów potwierdzenie w Telegramie → drugi mail #2 **NIE powinien** wyjść (idempotency)
9. GA4 Realtime → Twoja sesja widoczna z eventami `page_view` (kilka) + `booking_submitted` (jeden)

---

## CO MOŻNA DOROBIĆ PÓŹNIEJ (out of scope)

- **Outbound click tracking** (tel: / mailto: / IG / FB) — trigger "Just Links" w GTM, hostname filter, jeden tag GA4 Event. Bez deploya.
- **booking_confirmed** server-side event — gdy Telegram potwierdzi, push przez GA4 Measurement Protocol z `server/bot/handlers.js`. Lepszy attribution (bo wynik jest finalny, nie tylko intent).
- **Reschedule/cancel emails** — analogicznie do confirmation, dla `bk:rs` (przełóż) i `bk:cancel` (anuluj) flow.
- **A11Y banner** — current CookieBanner accept/decline jest minimum compliance. Granular consent (osobno analytics / marketing / functional) byłby lepszy gdy dojdą Meta Pixel itp.
- **GA4 → Looker Studio dashboard** — proste raporty: rezerwacje per barber, per service, per dzień tygodnia.
- **Banner consent re-prompt po 13 miesiącach** — PUODO zalecenie. Obecnie banner pokazuje się raz, lockowanie się w localStorage bez TTL.

---

## SHORTCUT: minimalne kroki przed pójściem na produkcję

W kolejności:

1. **Dokończ 3-ci tag w GTM** (sekcja A)
2. **Publish workspace GTM** (A4)
3. **Wyłącz Enhanced Measurement page changes w GA4** (B1)
4. **Zweryfikuj domenę Resend + wygeneruj API key** (C)
5. **Dodaj env vars w Dokploy + force rebuild** (D)
6. **Pull master + commit + push** (E)
7. **Smoke test e2e** (F4)

Czas: ~1-2h przy spokojnym tempie. Najwięcej zajmie weryfikacja domeny w Resendzie (czeka się na DNS propagation, 5min-1h zwykle).
