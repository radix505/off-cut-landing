# Technical Research: Wiring Booking Form → Backend → Telegram Bot

**Date**: 2026-05-03
**Project**: off-cut-landing (Fastify 5 + better-sqlite3 + React 19)

## Strategic Summary

Three viable patterns: (1) **inline `fetch` to Telegram Bot API** from inside the existing `POST /api/bookings` handler — simplest, zero dependencies, but loses notifications if Telegram is down; (2) **grammY-based bot with webhook + inline keyboards** for confirm/cancel — moderate complexity, gives the owner two-way control from chat; (3) **outbox pattern** — a `notifications` table polled by a worker, durable across outages. **Recommendation: Approach 2 (grammY + webhook + inline keyboards)** because the project already has `bookings.status = pending|confirmed|cancelled` and no admin UI — Telegram becomes the admin UI essentially for free, and grammY's webhook mode plugs into Fastify as a single route.

## Requirements

- The form already POSTs to `/api/bookings` — that handler is the integration point (`server/routes/bookings.js`).
- Booking row is created with `status = 'pending'`. There is no confirmation surface today. Telegram bot should fix that.
- Single owner / small team. Single-process Fastify on a single host. SQLite is the source of truth.
- Backend must work behind whatever Nixpacks/Railway-style deploy is in use — needs HTTPS for Telegram webhooks, or fall back to long polling.
- Constraints: Node 20+, ESM, no TypeScript currently.

## Approach 1: Inline `fetch` to Telegram Bot API (no library)

**How it works:** After successful insert in `bookings.js`, `await fetch('https://api.telegram.org/bot<TOKEN>/sendMessage', { method: 'POST', body: JSON.stringify({ chat_id, text, parse_mode: 'HTML' }) })`. Fire-and-forget (or `void` the promise) so booking response isn't blocked.

**Libraries/tools:** None. Native `fetch` in Node 20.

**Pros:**
- Zero new dependencies.
- ~15 lines of code total.
- Works immediately with a chat ID and bot token.

**Cons:**
- One-way. Owner can't confirm/cancel from chat — would need to open the DB or build a separate admin UI.
- If Telegram is down or the request fails, the notification is lost (booking still saved, but owner never told).
- No retry, no idempotency.
- Plain text (or HTML) only — building inline keyboards by hand against the raw Bot API gets ugly fast.

**Best when:** You only need a one-way "ping me when a booking comes in" and accept that occasional drops are fine.

**Complexity:** S

## Approach 2: grammY bot with Fastify webhook + inline keyboards (RECOMMENDED)

**How it works:**
1. Create bot via `@BotFather`, get token.
2. Add a `/api/telegram/webhook/<secret>` route in Fastify that calls `bot.handleUpdate(req.body)`.
3. Set webhook once via `setWebhook` to your public HTTPS URL.
4. In `POST /api/bookings`, after the insert, call `bot.api.sendMessage(OWNER_CHAT_ID, summary, { reply_markup: inline keyboard with Confirm + Cancel buttons containing `booking:<id>:confirm` callback data })`.
5. Bot's `bot.callbackQuery(/^booking:(\d+):(confirm|cancel)$/, handler)` updates `bookings.status` and edits the message to show new state.

**Libraries/tools:**
- `grammy@^1.30` — modern (2022+), ESM-first, actively maintained, lightweight (~80 KB), official-feeling alternative to `node-telegram-bot-api`. TypeScript types included but works fine in plain JS.
- Native Fastify HTTPS / reverse proxy for the webhook endpoint. No `@fastify/http-proxy` etc. needed.

**Pros:**
- **Bot becomes the admin UI.** Owner taps "Confirm" or "Cancel" right in chat — the booking moves out of `pending` without ever opening the DB.
- Inline-keyboard ergonomics + message editing handled by the library.
- Webhook mode is push-based: instant delivery, no polling cost on free hosts.
- grammY has middleware, sessions, conversation plugins — room to grow (e.g., "/today" command listing today's bookings).
- One process — fits the existing single-Fastify deploy.

**Cons:**
- Requires public HTTPS endpoint (or fall back to `bot.start()` long polling, which works locally and on hosts without ingress but adds an outbound long-lived connection).
- Notification is still inside the request path unless you `void` the promise — handle failures so the user-facing booking response doesn't fail because Telegram blipped.
- One library to learn (small surface).
- Need a webhook secret (Telegram supports `secret_token` header) so randoms can't POST fake updates.

**Best when:** You want the bot to be both the notifier *and* the lightweight admin tool, and you're OK with one well-maintained dependency.

**Complexity:** M

### Sketch (drop-in for this repo)

```js
// server/telegram.js
import { Bot } from 'grammy';
import { db } from './db.js';

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const OWNER_CHAT_ID = process.env.TELEGRAM_OWNER_CHAT_ID;
export const bot = TOKEN ? new Bot(TOKEN) : null;

if (bot) {
  const updateStatus = db.prepare(`UPDATE bookings SET status = ? WHERE id = ? AND status = 'pending'`);

  bot.callbackQuery(/^booking:(\d+):(confirm|cancel)$/, async (ctx) => {
    const [, id, action] = ctx.match;
    const next = action === 'confirm' ? 'confirmed' : 'cancelled';
    const res = updateStatus.run(next, Number(id));
    await ctx.answerCallbackQuery(res.changes ? `Marked ${next}` : 'Already handled');
    await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [[{ text: `✓ ${next}`, callback_data: 'noop' }]] } });
  });
}

export async function notifyBooking({ id, barberId, serviceId, date, slot, name, phone }) {
  if (!bot || !OWNER_CHAT_ID) return;
  const text = `<b>New booking #${id}</b>\n${date} ${slot}\n${barberId} · ${serviceId}\n${name} · ${phone}`;
  try {
    await bot.api.sendMessage(OWNER_CHAT_ID, text, {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [[
          { text: 'Confirm', callback_data: `booking:${id}:confirm` },
          { text: 'Cancel',  callback_data: `booking:${id}:cancel`  },
        ]],
      },
    });
  } catch (err) {
    // log; never throw — booking already saved
  }
}
```

```js
// server/index.js — additions
import { webhookCallback } from 'grammy';
import { bot } from './telegram.js';

if (bot && process.env.TELEGRAM_WEBHOOK_SECRET) {
  fastify.post(`/api/telegram/${process.env.TELEGRAM_WEBHOOK_SECRET}`, webhookCallback(bot, 'fastify'));
}
```

```js
// server/routes/bookings.js — after the successful insert / commit.run()
void notifyBooking({ id: result.lastInsertRowid, barberId, serviceId, date, slot, name, phone });
```

One-time setup (run locally):
```js
await bot.api.setWebhook(`https://yourdomain/api/telegram/${SECRET}`, { secret_token: SECRET });
```

## Approach 3: Outbox pattern (`notifications` table + worker)

**How it works:** Booking handler INSERTs into `bookings` AND `notifications(booking_id, channel, status)` in the same transaction. A small in-process worker (or `setInterval`) polls `notifications WHERE status='pending'`, sends via Telegram, marks `sent`/`failed` with retry counter and backoff.

**Libraries/tools:** Same `grammy` (or raw `fetch`), plus a tiny scheduler — no new deps, just a `setInterval` and a prepared statement.

**Pros:**
- **Durable.** Survives Telegram outages, deploys, server restarts.
- Decouples user-facing booking response from external API.
- Trivial to extend to email/SMS channels by adding new rows.
- Easy to retry / inspect / replay.

**Cons:**
- Most code of the three. New table, schema migration, worker loop, retry logic.
- Polling adds steady CPU/IO (mitigate with 5–15s interval — fine for a barbershop).
- For two-way control (confirm/cancel) you still need Approach 2's webhook layer on top.

**Best when:** Notifications are critical (lost = lost revenue) or you need multi-channel delivery, OR your host has rough networking.

**Complexity:** L

## Comparison

| Aspect | 1: inline fetch | 2: grammY webhook | 3: outbox |
|--------|------------|------------|------------|
| Complexity | S | M | L |
| Dependencies | 0 | 1 (`grammy`) | 1 + scheduler code |
| Two-way control (confirm/cancel from chat) | ✗ | ✓ | needs +Approach 2 |
| Survives Telegram outage | ✗ | partial (booking saves, ping lost) | ✓ |
| Admin UI required separately | yes | **no** | yes |
| Fits current architecture | ✓ | ✓ | ✓ but adds table |
| Cost on idle host | $0 | $0 | small constant poll |
| Time to ship | 30 min | 2–3 h | 1 day |

## Recommendation

**Approach 2 (grammY webhook + inline keyboards).** The project's existing schema already has `status IN ('pending','confirmed','cancelled')` but no surface to flip them. Telegram callback buttons close that loop in the same effort it would take to send a plain notification, and grammY is the cleanest modern Telegram SDK for Node. Use webhook mode behind your existing HTTPS reverse proxy (Telegram requires TLS); long-polling fallback (`bot.start()`) is one line if your deployment can't expose a webhook.

If you later need bulletproof delivery (e.g., notifications start dropping during deploys), layer Approach 3's outbox table *under* the same grammY instance — the bot definition doesn't change, only the trigger point.

Skip Approach 1 unless you genuinely just want a 30-minute "ping me" with no plans to grow.

## Implementation Context

<claude_context>
<chosen_approach>
- name: grammY webhook bot with inline-keyboard confirm/cancel
- libraries: grammy@^1.30
- install: `npm install grammy`
- env_vars_needed: TELEGRAM_BOT_TOKEN, TELEGRAM_OWNER_CHAT_ID, TELEGRAM_WEBHOOK_SECRET, PUBLIC_BASE_URL
</chosen_approach>
<architecture>
- pattern: thin notifier module + Fastify webhook route + callback handler that mutates SQLite
- components:
  - server/telegram.js — bot instance, notifyBooking(), callback handlers
  - server/index.js — register webhook route
  - server/routes/bookings.js — call notifyBooking() after successful commit (fire-and-forget via `void`)
  - one-shot script (or admin route) to call bot.api.setWebhook on deploy
- data_flow: form POST → /api/bookings inserts row (status=pending) → notifyBooking sends Telegram message with Confirm/Cancel buttons → owner taps → Telegram POSTs to /api/telegram/<secret> → grammY routes to callback handler → UPDATE bookings SET status=... → editMessageReplyMarkup to show outcome
</architecture>
<files>
- create:
  - server/telegram.js (bot instance + notifyBooking + callback handler)
- modify:
  - server/index.js (register webhookCallback route, guarded by env presence)
  - server/routes/bookings.js (call notifyBooking after commit.run(), inside try; fire-and-forget)
  - .env.example (TELEGRAM_BOT_TOKEN, TELEGRAM_OWNER_CHAT_ID, TELEGRAM_WEBHOOK_SECRET)
- structure: keep telegram.js sibling to db.js — same "infra module" tier
- reference: server/db.js for the prepared-statement-at-import pattern; reuse db export
</files>
<implementation>
- start_with: create bot via @BotFather; capture token; send /start to bot; get OWNER_CHAT_ID by hitting `https://api.telegram.org/bot<TOKEN>/getUpdates`
- order:
  1. add grammy dep
  2. write server/telegram.js with notifyBooking() (no callbacks yet) — verify message arrives
  3. add inline keyboard + callbackQuery handler — verify status flips in DB
  4. wire setWebhook (one-off script or boot-time call guarded by env)
  5. add `void notifyBooking(...)` in routes/bookings.js
  6. add Fastify rate limit on /api/bookings (recommended regardless — open endpoint)
- gotchas:
  - never `await notifyBooking()` inside the booking handler — Telegram failure must NOT 5xx the booking; use `void` and log inside notifyBooking
  - validate Telegram webhook with `secret_token` header (grammY's webhookCallback supports this when you pass options); without it, anyone who guesses the URL can forge updates
  - better-sqlite3 statements are sync — fine inside async callback handler, no await needed for db writes
  - in dev (no public HTTPS), use `bot.start()` polling instead of webhook — guard with `if (process.env.NODE_ENV !== 'production')`
  - Bot Father → /setjoingroups OFF, /setprivacy ON for an owner-only bot
  - if you ever scale to >1 instance, polling fights itself — only one process should own the bot; webhook mode is safer for HA
  - parse_mode HTML requires escaping user input (name, phone) — small util: replace &<>" before interpolating
- testing:
  - manual: submit booking form locally with bot in polling mode → verify message arrives → tap Confirm → verify `sqlite3 data/bookings.sqlite "SELECT status FROM bookings WHERE id=…"` returns confirmed
  - integration: mock grammY's bot.api.sendMessage and assert it was called with expected args after POST /api/bookings
  - failure: set TELEGRAM_BOT_TOKEN to garbage, POST /api/bookings — must still return 201 (notifier swallows error)
</implementation>
</claude_context>

**Next Action:** Implement Approach 2 — start by creating the bot in @BotFather and adding `grammy` to deps; then ship `server/telegram.js` and the webhook route.

### Sources
- grammY docs (Fastify integration + webhookCallback): https://grammy.dev/guide/deployment-types — accessed 2026-05-03
- Telegram Bot API (sendMessage, inline keyboards, secret_token): https://core.telegram.org/bots/api — accessed 2026-05-03
- Existing repo: `server/routes/bookings.js`, `server/db.js` — accessed 2026-05-03
