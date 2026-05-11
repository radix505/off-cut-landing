# Deep Dive: How the Off-Cut Landing Project Is Built

**Date**: 2026-05-03
**Repo**: `/Users/radix/Workspace/corelaners.eu/projects/off-cut-landing`
**Branch**: `booking-backend`

## Strategic Summary

Off-Cut is a bilingual (PL/EN) marketing landing page for a barbershop, fused with a self-hosted booking system. The frontend is a Vite + React 19 SPA with a hand-rolled router and language splash; the backend is a single Fastify process backed by SQLite (better-sqlite3) that both serves the static build and exposes a small `/api` for availability + booking. Deployment is a single Node 20 process on Nixpacks — no external auth, no third-party booking SaaS, no DB server.

## Key Questions Answered

- What stack and conventions drive the project?
- How does the frontend route, transition, and load pages?
- How is booking modeled and made concurrency-safe?
- How is it deployed?

## Overview

The project is a **monorepo-shaped single app**: one `package.json`, one Node process. Frontend code lives in `src/`, backend in `server/`, and a critical detail — the backend imports from the frontend's `src/data/booking-config.js` so service definitions, durations, and slot grids stay in sync between client and server (single source of truth for catalog + slot math).

The branding, content, and craft-shop aesthetic dominate the design system: custom fonts under `public/fonts`, an SVG-based scissors transition between routes, a language-splash on first paint, and route-level code-splitting via `React.lazy` to keep first paint cheap.

The booking flow is the only stateful surface. Everything else (hero, services, barbers, gallery, reviews, blog, map, legal pages) is static React.

## How It Works

### Build & Runtime
- **Bundler**: Vite 8 + `@vitejs/plugin-react` (Oxc). React 19 with `StrictMode` in `src/main.jsx`.
- **Server**: Fastify 5 (`server/index.js`). In dev: `node --watch server/index.js` runs the API on `127.0.0.1:3001` with CORS open. In prod: same process, binds `0.0.0.0`, serves `dist/` via `@fastify/static`, falls back to `index.html` for SPA routes, and 404s anything under `/api/*` that isn't matched.
- **Lint**: ESLint 9 flat config with `eslint-plugin-react-hooks` and `react-refresh`.
- **Node**: pinned `>=20.19.0`, enforced via `nixpacks.toml` (`nodejs_20`, `npm-9_x`).

### Frontend Architecture
- **Routing** is custom (`src/context/RouterContext.jsx`): `parsePath` maps `window.location.pathname` to a `{ page, crewSlug }` tuple; `navigate()` triggers a scripted timeline — fade out page (450ms), push history + swap state, fade in (620ms), end "cutting" overlay (1050ms). The scissors animation is wired through the router's `cutting`/`direction` flags so the route change *is* the animation.
- **Pages** in `src/pages/` (Home, Blog, Prices, Booking, Gallery, Crew, Barber, Privacy, Cookies). All except `HomePage` are lazy-loaded.
- **i18n** via `LangContext` + a `LangSplash` first-visit picker. Strings live inline as `*PL`/`*EN` fields on data objects (no i18n framework).
- **Hooks**: `useReveal` (intersection-observer reveal), `useIsDark` (theme detection driving inline style overrides).
- **State**: only Context + `useState`. No Redux/Zustand/Query.

### Backend Architecture
- **Persistence**: `better-sqlite3` at `data/bookings.sqlite`, WAL mode, foreign keys on. Schema (`server/db.js`) is a single `bookings` table with a `UNIQUE(barber_id, date, slot)` constraint and a composite lookup index. Statements are pre-prepared at import time.
- **Concurrency**: writes use `BEGIN IMMEDIATE` → re-check existing bookings → insert → `COMMIT`. Catches `SQLITE_CONSTRAINT_UNIQUE` to return `409 slot_taken` even if the immediate-tx race loses. Belt-and-suspenders: app-level `blockOverlapsExisting` + DB unique index.
- **Slot math** (`server/availability.js`) shares `buildSlotsForISODate` with the client. Multi-block services (durations > 30min) expand to multiple consecutive grid slots; `computeUnavailable` returns the union for a given `(barber, date)`.
- **Validation**: Fastify JSON-schema on every route (`/api/availability`, `/api/bookings`). ISO date / `HH:MM` / phone regex enforced before handler runs. Past dates and out-of-hours slots rejected with specific error codes.
- **Auth**: none. There is no admin UI in this codebase — bookings start as `pending` and presumably get confirmed manually by the owner via direct SQLite access or a separate tool.

### Data Model
`booking-config.js` is the canonical service catalog: each service has a `num` ID, PL/EN copy, `durationMin`, price string, and a `barbers` whitelist (e.g. some services only `NICO`, others `OLEK`+`JULIA`). `BARBERS` enumerate stylists with their photos and key aliases. The server imports this directly, ensuring the price list, the booking form's service options, and the duration-to-slot expansion are all driven by one file.

## History & Context

Inferred from git log (most recent first):
1. **`6b0294e`** — bundled feature batch: booking preselect, price list redesign, gallery lightbox, legal pages, UI polish.
2. **`296744a`** — replaced custom razor scrollbar with simple CSS (cleanup of an over-engineered detail).
3. **`9efebd6`** — typographic and layout polish across nav/splash/footer.
4. **`d9107ae`** — removed barbers nav link, swapped footer logo, **filtered booking services by barber** (the `barbers` whitelist on services landed here).
5. **`a7ải7d`** — pinned Node 20 for Nixpacks.

The current branch `booking-backend` (vs. `master`) suggests the SQLite + Fastify booking surface is the active workstream. The README is still the unedited Vite+React template — documentation is intentionally absent in favor of code-as-spec.

## Patterns & Best Practices

- **Shared catalog between client/server**: server imports `src/data/booking-config.js`. Use this whenever business rules (durations, allowed barbers, slot grid) need to match on both ends — instead of duplicating constants.
- **Defense-in-depth for booking writes**: app-side overlap check inside `BEGIN IMMEDIATE` *plus* DB unique index. Either layer alone leaks; together they're race-safe.
- **Route-level code splitting via lazy + Suspense**: keeps Home (the only landing surface most visitors hit) in the initial chunk; everything else loads on navigation.
- **Animations are state, not CSS**: scissors transition is driven by router flags, not detached classes — easier to coordinate with history pushes.
- **Prepared statements at module init**: `db.js` prepares once and reuses. Don't `db.prepare()` per request.
- **JSON-schema validation in Fastify route options**: rejects malformed input before the handler — keep handlers focused on business logic.

## Limitations & Edge Cases

- **No admin / confirmation surface**: bookings stay `pending` forever unless someone touches the DB. Mitigation: build a minimal protected `/admin` route or a CLI script.
- **No notifications**: insertions don't email/SMS the customer or shop. The booking endpoint returns `201` and that's it.
- **SQLite in `data/`**: the data directory is mounted from the deployment filesystem. On Nixpacks/Railway-style ephemeral hosts, `data/bookings.sqlite` will vanish on redeploy unless a persistent volume is mounted. Verify deployment env before going live.
- **Timezone hard-coded to Europe/Warsaw** (`todayInWarsaw()`). Single-tenant assumption — fine here, will break if reused elsewhere.
- **Phone regex is permissive** (`/^[+\d\s\-()]{7,20}$/`) — accepts non-routable formats. Fine for owner-callback flow, not for SMS automation.
- **No rate limiting / captcha**: `/api/bookings` is open. A bot could fill the calendar. Add Fastify rate-limit plugin or a turnstile if abuse appears.
- **Custom router has no nested routes / params beyond `/crew/:slug`**: scaling URL surface means editing `parsePath` directly.
- **`StrictMode` + custom timers in router**: double-invocation in dev could fire navigation timers twice; the `timers.current.forEach(clearTimeout)` cleanup mostly handles it.

## Current State & Trends

- React 19 + Vite 8 are bleeding-edge — version pins are aggressive (e.g. `vite ^8.0.9`, `eslint ^9.39.4`).
- Deliberately framework-light: no Next.js, no Remix, no React Router. The team chose to own the routing primitives to make the scissors transition feel inseparable from navigation.
- The booking surface is small enough that "Fastify + SQLite + JSON-schema" is the right ceiling — moving to Postgres or a SaaS calendar would be premature.

## Key Takeaways

1. **One process, one DB file, one shared config module.** The whole system's coherence comes from `server/index.js` (serves API + static), `data/bookings.sqlite` (single store), and `src/data/booking-config.js` (single catalog).
2. **Concurrency on bookings is solved correctly** via `BEGIN IMMEDIATE` + a `UNIQUE(barber_id, date, slot)` index. Don't refactor either layer away.
3. **The custom router exists to choreograph the scissors transition.** Replacing it with React Router would break the brand-defining animation timing.

## Remaining Unknowns

- [ ] How are `pending` bookings confirmed in production today? (CLI? Direct SQLite? Owner phone callback?)
- [ ] Is `data/` mounted on a persistent volume in the actual deployment target?
- [ ] Is there a notification pipeline planned (email/SMS/Telegram)?
- [ ] What rate-limiting / anti-abuse exists at the proxy layer (if any)?

## Implementation Context

<claude_context>
<application>
- when_to_use: editing booking flow, services catalog, barber roster, route surface, or transition timing in this repo
- when_not_to_use: don't import this stack as a template for multi-tenant or non-trivially-stateful apps — SQLite + custom router won't scale past single-shop use
- prerequisites: Node >= 20.19, sqlite write access on `data/`, env vars `PORT`, `HOST`, `DB_PATH`, `LOG_LEVEL`, `NODE_ENV`
</application>
<technical>
- libraries: fastify@5, @fastify/static, @fastify/cors, better-sqlite3@11, react@19, vite@8, dotenv
- patterns: shared client/server config module; prepared statements at import; BEGIN IMMEDIATE + unique index for slot uniqueness; lazy + Suspense per page; router-state-driven CSS transitions; JSON-schema validation per route
- gotchas: mutating `booking-config.js` affects both client UI and server validation simultaneously; service `durationMin` must be a multiple of 30 or `Math.ceil` rounding will silently consume an extra slot; `todayInWarsaw()` hard-codes timezone; production server expects `dist/` to exist (process exits otherwise)
</technical>
<integration>
- works_with: Nixpacks/Railway-style Node deploys with persistent volume for `data/`; reverse proxy in front for TLS + rate-limit
- conflicts_with: serverless/edge runtimes (better-sqlite3 needs a persistent FS and native binding); React Router (would replace the custom router that drives the transition)
- alternatives: replace SQLite with Postgres if multi-instance is needed; replace custom router with TanStack Router if richer routing is needed (at the cost of redoing the scissors choreography)
</integration>
</claude_context>

**Next Action:** If touching the booking flow, read `server/routes/bookings.js`, `server/availability.js`, `server/db.js`, and `src/data/booking-config.js` together — they're a tightly coupled unit.

### Sources
- `package.json`, `nixpacks.toml`, `vite.config.js` — accessed 2026-05-03
- `server/index.js`, `server/db.js`, `server/availability.js`, `server/routes/bookings.js` — accessed 2026-05-03
- `src/main.jsx`, `src/App.jsx`, `src/context/RouterContext.jsx`, `src/data/booking-config.js`, `src/pages/HomePage.jsx` — accessed 2026-05-03
- `git log` (most recent 5 commits on `booking-backend`) — accessed 2026-05-03
