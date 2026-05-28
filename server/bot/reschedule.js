import { InlineKeyboard } from 'grammy';
import * as bookingsRepo from '../data/bookingsRepo.js';
import { withTransaction } from '../db.js';
import { blockOverlapsExisting, computeUnavailable, serviceOverflowsClosing } from '../availability.js';
import { buildSlotsForISODate } from '../../src/data/booking-config.js';
import { BUSINESS_HOURS, SLOT_STEP_MIN } from '../../src/data/businessHours.js';
import { sendBookingReschedule } from '../mail/index.js';
import { bookingKeyboard } from './handlers.js';
import {
  formatBookingCard,
  formatRescheduleConfirm,
  monthHeaderPl,
  dowHeaderRowPl,
  todayInWarsaw,
  daysInMonth,
  jsDayOfWeek,
  buildIso,
  escapeHtml,
  isoToHumanPl,
} from './format.js';

const HTML = { parse_mode: 'HTML' };
const NOOP = 'rs:noop';

const slotToCb = (slot) => slot.replace(':', '');             // "09:30" -> "0930"
const cbToSlot = (s) => `${s.slice(0, 2)}:${s.slice(2)}`;     // "0930"  -> "09:30"

// ─────────────────────────── Renderers ────────────────────────────────────────

async function renderMonth(ctx, booking, year, month, { edit = true } = {}) {
  const firstDay = buildIso(year, month, 1);
  const lastDay  = buildIso(year, month, daysInMonth(year, month));
  const counts = await bookingsRepo.countByDateForBarber(booking.barber_id, firstDay, lastDay);
  const today = todayInWarsaw();

  const byDate = new Map();
  for (const r of counts) byDate.set(r.date, r);

  const kb = new InlineKeyboard();
  const prev = prevMonth(year, month);
  const next = nextMonth(year, month);
  const pad = ' '.repeat(6);
  kb.text('‹', `rs:m:${booking.id}:${prev.y}:${prev.m}`)
    .text(`${pad}${monthHeaderPl(year, month)}${pad}`, NOOP)
    .text('›', `rs:m:${booking.id}:${next.y}:${next.m}`)
    .row();

  for (const dow of dowHeaderRowPl()) kb.text(dow, NOOP);
  kb.row();

  const firstDow = jsDayOfWeek(year, month, 1);
  const lead = (firstDow + 6) % 7; // Mon=0..Sun=6
  for (let i = 0; i < lead; i++) kb.text(' ', NOOP);

  const total = daysInMonth(year, month);
  let col = lead;
  for (let d = 1; d <= total; d++) {
    const iso = buildIso(year, month, d);
    const dow = jsDayOfWeek(year, month, d);
    const isClosed = !BUSINESS_HOURS[dow];
    const isPast = iso < today;
    const row = byDate.get(iso);
    const hasBookings = !!row && row.bookings > 0;
    const hasBlocks = !!row && row.blocks > 0;
    const isCurrent = iso === booking.date;

    let label = String(d);
    if (isCurrent) {
      label = `📍${d}`;
    } else if (isPast) {
      label = `·${d}`;
    } else if (isClosed) {
      label = `${d}✕`;
    } else if (hasBlocks && hasBookings) {
      label = `${d}•🚫`;
    } else if (hasBlocks) {
      label = `${d}🚫`;
    } else if (hasBookings) {
      label = `${d}•`;
    }

    if (isPast || (isClosed && !isCurrent)) {
      kb.text(label, NOOP);
    } else {
      kb.text(label, `rs:d:${booking.id}:${year}:${month}:${d}`);
    }

    col++;
    if (col % 7 === 0) kb.row();
  }
  while (col % 7 !== 0) {
    kb.text(' ', NOOP);
    col++;
  }
  kb.row();

  kb.text('↩️ Anuluj', `rs:x:${booking.id}`);

  const text = [
    `🔄 <b>Przełożenie rezerwacji #${booking.id}</b>`,
    `Obecnie: <b>${escapeHtml(isoToHumanPl(booking.date))} · ${escapeHtml(booking.slot)}</b> (${booking.duration_min}min)`,
    `✂️ ${escapeHtml(booking.barber_name)} · 👤 ${escapeHtml(booking.customer_name)}${booking.email ? ` · 📧 <code>${escapeHtml(booking.email)}</code>` : ''}`,
    ``,
    `📅 <b>${escapeHtml(monthHeaderPl(year, month))}</b> - wybierz nowy dzień`,
    `<i>📍 obecny dzień</i>`,
    `<i>• rezerwacje</i>`,
    `<i>🚫 blokady</i>`,
    `<i>✕ zamknięte</i>`,
    `<i>· przeszłe</i>`,
  ].join('\n');

  return reply(ctx, text, kb, edit);
}

async function renderDay(ctx, booking, year, month, day, { edit = true } = {}) {
  const iso = buildIso(year, month, day);
  const dow = jsDayOfWeek(year, month, day);
  const isClosed = !BUSINESS_HOURS[dow];
  const isPast = iso < todayInWarsaw();

  const kb = new InlineKeyboard();

  if (isPast) {
    kb.text('⟵ Wróć', `rs:m:${booking.id}:${year}:${month}`)
      .text('↩️ Anuluj', `rs:x:${booking.id}`);
    return reply(ctx, [
      `🔄 <b>Przełożenie rezerwacji #${booking.id}</b>`,
      `📅 <b>${escapeHtml(isoToHumanPl(iso))}</b>`,
      ``,
      `<i>Nie można przełożyć na przeszłą datę.</i>`,
    ].join('\n'), kb, edit);
  }

  if (isClosed) {
    kb.text('⟵ Wróć', `rs:m:${booking.id}:${year}:${month}`)
      .text('↩️ Anuluj', `rs:x:${booking.id}`);
    return reply(ctx, [
      `🔄 <b>Przełożenie rezerwacji #${booking.id}</b>`,
      `📅 <b>${escapeHtml(isoToHumanPl(iso))}</b>`,
      ``,
      `<i>Lokal zamknięty tego dnia.</i>`,
    ].join('\n'), kb, edit);
  }

  const others = await bookingsRepo.findActiveByBarberAndDateExcluding(
    booking.barber_id, iso, booking.id,
  );
  const grid = buildSlotsForISODate(iso);
  const blocks = Math.ceil(booking.duration_min / SLOT_STEP_MIN);
  const unavailable = computeUnavailable(others, iso);

  // Valid start slots: not in `unavailable`, range fits within closing, and
  // doesn't overlap any other booking when expanded by duration.
  const valid = [];
  for (let i = 0; i < grid.length; i++) {
    const s = grid[i];
    if (unavailable.has(s)) continue;
    if (serviceOverflowsClosing(i, blocks, grid.length)) continue;
    if (blockOverlapsExisting(s, booking.duration_min, others, iso)) continue;
    valid.push(s);
  }

  // Render the existing day occupancy summary so the admin has context.
  const occupancyLines = [];
  if (others.length === 0) {
    occupancyLines.push('<i>Brak innych rezerwacji ani blokad.</i>');
  } else {
    occupancyLines.push(`<i>Zajęte w tym dniu:</i> ${others.length}`);
  }

  if (valid.length === 0) {
    kb.text('⟵ Wróć', `rs:m:${booking.id}:${year}:${month}`)
      .text('↩️ Anuluj', `rs:x:${booking.id}`);
    return reply(ctx, [
      `🔄 <b>Przełożenie rezerwacji #${booking.id}</b>`,
      `📅 <b>${escapeHtml(isoToHumanPl(iso))}</b>`,
      ``,
      ...occupancyLines,
      ``,
      `<i>Brak slotów pasujących do ${booking.duration_min}min.</i>`,
    ].join('\n'), kb, edit);
  }

  let col = 0;
  for (const s of valid) {
    const isCurrent = iso === booking.date && s === booking.slot;
    const label = isCurrent ? `📍${s}` : s;
    kb.text(label, `rs:s:${booking.id}:${year}:${month}:${day}:${slotToCb(s)}`);
    col++;
    if (col % 4 === 0) kb.row();
  }
  if (col % 4 !== 0) kb.row();
  kb.text('⟵ Wróć', `rs:m:${booking.id}:${year}:${month}`)
    .text('↩️ Anuluj', `rs:x:${booking.id}`);

  const text = [
    `🔄 <b>Przełożenie rezerwacji #${booking.id}</b>`,
    `Obecnie: <b>${escapeHtml(isoToHumanPl(booking.date))} · ${escapeHtml(booking.slot)}</b> (${booking.duration_min}min)`,
    `✂️ ${escapeHtml(booking.barber_name)} · 👤 ${escapeHtml(booking.customer_name)}${booking.email ? ` · 📧 <code>${escapeHtml(booking.email)}</code>` : ''}`,
    ``,
    `📅 <b>${escapeHtml(isoToHumanPl(iso))}</b>`,
    ...occupancyLines,
    ``,
    `🟢 <b>Wybierz nowy slot</b> (${valid.length})`,
  ].join('\n');

  return reply(ctx, text, kb, edit);
}

async function renderConfirm(ctx, booking, year, month, day, slot) {
  const iso = buildIso(year, month, day);
  const text = formatRescheduleConfirm(booking, iso, slot);
  const kb = new InlineKeyboard()
    .text('✅ Przenieś', `rs:ok:${booking.id}:${year}:${month}:${day}:${slotToCb(slot)}`)
    .text('↩️ Anuluj', `rs:x:${booking.id}`);
  return reply(ctx, text, kb, true);
}

async function commitReschedule(ctx, booking, year, month, day, newSlot) {
  const newDate = buildIso(year, month, day);

  // No-op if nothing changes.
  if (newDate === booking.date && newSlot === booking.slot) {
    await ctx.answerCallbackQuery({ text: 'Bez zmian.' });
    return renderBookingCard(ctx, booking, { edit: true });
  }

  // Past-date guard (mirrors public booking validation).
  if (newDate < todayInWarsaw()) {
    await ctx.answerCallbackQuery({ text: 'Nie można przełożyć w przeszłość.', show_alert: true });
    return renderDay(ctx, booking, year, month, day);
  }

  // Business-hours + duration-fit guard.
  const dow = jsDayOfWeek(year, month, day);
  if (!BUSINESS_HOURS[dow]) {
    await ctx.answerCallbackQuery({ text: 'Dzień zamknięty.', show_alert: true });
    return renderDay(ctx, booking, year, month, day);
  }
  const grid = buildSlotsForISODate(newDate);
  const startIdx = grid.indexOf(newSlot);
  const blocks = Math.ceil(booking.duration_min / SLOT_STEP_MIN);
  if (startIdx < 0) {
    await ctx.answerCallbackQuery({ text: 'Slot poza godzinami otwarcia.', show_alert: true });
    return renderDay(ctx, booking, year, month, day);
  }
  if (serviceOverflowsClosing(startIdx, blocks, grid.length)) {
    await ctx.answerCallbackQuery({ text: 'Usługa nie mieści się przed zamknięciem.', show_alert: true });
    return renderDay(ctx, booking, year, month, day);
  }

  try {
    await withTransaction(async (client) => {
      const locked = await bookingsRepo.lockById(booking.id, { client });
      if (!locked) {
        const e = new Error('gone'); e.code = 'GONE'; throw e;
      }
      const others = await bookingsRepo.findActiveByBarberAndDateExcluding(
        locked.barber_id, newDate, locked.id, { client },
      );
      if (blockOverlapsExisting(newSlot, locked.duration_min, others, newDate)) {
        const e = new Error('overlap'); e.code = 'SLOT_TAKEN'; throw e;
      }
      await bookingsRepo.updateDateAndSlot(locked.id, newDate, newSlot, { client });
    });
  } catch (err) {
    if (err?.code === 'GONE') {
      await ctx.answerCallbackQuery({ text: `Brak rezerwacji #${booking.id}`, show_alert: true });
      return;
    }
    if (err?.code === 'SLOT_TAKEN' || err?.code === '23505') {
      await ctx.answerCallbackQuery({ text: 'Slot zajęty.', show_alert: true });
      return renderDay(ctx, booking, year, month, day);
    }
    await ctx.answerCallbackQuery({ text: 'Błąd przy przekładaniu.', show_alert: true });
    throw err;
  }

  const refreshed = await bookingsRepo.findById(booking.id);

  // The customer's mental model is anchored to the old time - whether the
  // booking was pending or already confirmed, they expected something else.
  // Notify them so they don't show up at the wrong hour. If we don't have
  // an email on file the barber needs to fall back to phone, so surface
  // that on the manager's banner instead of staying silent.
  const hasEmail = Boolean(refreshed?.email);
  const bannerText = hasEmail
    ? 'Przeniesiono ✓'
    : 'Przeniesiono ✓ · klient bez maila — zadzwoń';
  await ctx.answerCallbackQuery({ text: bannerText });

  if (hasEmail) {
    // Fire-and-forget; matches the pattern used for confirmation mail in
    // handlers.js. `booking` still holds the pre-update date/slot so the
    // template can render the "PRZENIESIONO Z" diff line.
    sendBookingReschedule(booking, refreshed).catch(() => {});
  }

  return renderBookingCard(ctx, refreshed, { edit: true });
}

async function renderBookingCard(ctx, b, { edit = true } = {}) {
  return reply(ctx, formatBookingCard(b), bookingKeyboard(b), edit);
}

// ─────────────────────────── Helpers ──────────────────────────────────────────

function prevMonth(y, m) { return m === 1 ? { y: y - 1, m: 12 } : { y, m: m - 1 }; }
function nextMonth(y, m) { return m === 12 ? { y: y + 1, m: 1 } : { y, m: m + 1 }; }

async function reply(ctx, text, kb, edit) {
  const opts = { ...HTML };
  if (kb) opts.reply_markup = kb;
  if (edit && ctx.callbackQuery) {
    try {
      return await ctx.editMessageText(text, opts);
    } catch (err) {
      if (String(err?.description ?? '').includes('not modified')) return;
      throw err;
    }
  }
  return ctx.reply(text, opts);
}

async function loadBookingOrReject(ctx, id) {
  const b = await bookingsRepo.findById(id);
  if (!b) {
    await ctx.answerCallbackQuery({ text: `Brak rezerwacji #${id}`, show_alert: true });
    return null;
  }
  if (b.is_block) {
    await ctx.answerCallbackQuery({ text: 'Blokad nie można przekładać.', show_alert: true });
    return null;
  }
  if (b.status === 'cancelled') {
    await ctx.answerCallbackQuery({ text: 'Najpierw przywróć rezerwację.', show_alert: true });
    return null;
  }
  return b;
}

// ─────────────────────────── Registration ─────────────────────────────────────

export function registerReschedule(bot) {
  // Entry from booking card.
  bot.callbackQuery(/^bk:rs:(\d+)$/, async (ctx) => {
    const id = Number(ctx.match[1]);
    const b = await loadBookingOrReject(ctx, id);
    if (!b) return;
    await ctx.answerCallbackQuery();
    const [y, m] = b.date.split('-').map(Number);
    await renderMonth(ctx, b, y, m, { edit: true });
  });

  // Month nav.
  bot.callbackQuery(/^rs:m:(\d+):(\d{4}):(\d{1,2})$/, async (ctx) => {
    const id = Number(ctx.match[1]);
    const b = await loadBookingOrReject(ctx, id);
    if (!b) return;
    await ctx.answerCallbackQuery();
    await renderMonth(ctx, b, Number(ctx.match[2]), Number(ctx.match[3]));
  });

  // Day view.
  bot.callbackQuery(/^rs:d:(\d+):(\d{4}):(\d{1,2}):(\d{1,2})$/, async (ctx) => {
    const id = Number(ctx.match[1]);
    const b = await loadBookingOrReject(ctx, id);
    if (!b) return;
    await ctx.answerCallbackQuery();
    await renderDay(ctx, b, Number(ctx.match[2]), Number(ctx.match[3]), Number(ctx.match[4]));
  });

  // Slot picked → confirm.
  bot.callbackQuery(/^rs:s:(\d+):(\d{4}):(\d{1,2}):(\d{1,2}):(\d{4})$/, async (ctx) => {
    const id = Number(ctx.match[1]);
    const b = await loadBookingOrReject(ctx, id);
    if (!b) return;
    await ctx.answerCallbackQuery();
    await renderConfirm(
      ctx, b,
      Number(ctx.match[2]), Number(ctx.match[3]), Number(ctx.match[4]),
      cbToSlot(ctx.match[5]),
    );
  });

  // Commit.
  bot.callbackQuery(/^rs:ok:(\d+):(\d{4}):(\d{1,2}):(\d{1,2}):(\d{4})$/, async (ctx) => {
    const id = Number(ctx.match[1]);
    const b = await loadBookingOrReject(ctx, id);
    if (!b) return;
    await commitReschedule(
      ctx, b,
      Number(ctx.match[2]), Number(ctx.match[3]), Number(ctx.match[4]),
      cbToSlot(ctx.match[5]),
    );
  });

  // Cancel → re-render the booking card unchanged.
  bot.callbackQuery(/^rs:x:(\d+)$/, async (ctx) => {
    const id = Number(ctx.match[1]);
    const b = await bookingsRepo.findById(id);
    await ctx.answerCallbackQuery({ text: 'Anulowano.' });
    if (b) await renderBookingCard(ctx, b, { edit: true });
  });

  // No-op (weekday headers, padding, past days).
  bot.callbackQuery(/^rs:noop$/, async (ctx) => {
    await ctx.answerCallbackQuery();
  });
}
