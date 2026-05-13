import { InlineKeyboard } from 'grammy';
import * as bookingsRepo from '../data/bookingsRepo.js';
import * as barbersRepo from '../data/barbersRepo.js';
import { withTransaction } from '../db.js';
import { computeUnavailable, blockOverlapsExisting } from '../availability.js';
import { buildSlotsForISODate } from '../../src/data/booking-config.js';
import { BUSINESS_HOURS, SLOT_STEP_MIN } from '../../src/data/businessHours.js';
import {
  monthHeaderPl, dowHeaderRowPl, formatCalendarDayView, formatBlockConfirm,
  todayInWarsaw, daysInMonth, jsDayOfWeek, buildIso, escapeHtml,
} from './format.js';

const HTML = { parse_mode: 'HTML' };
const NOOP = 'cal:noop';
const BLOCK_DURATIONS = [30, 60, 90, 120, 180, 240]; // minutes

const slotToCb = (slot) => slot.replace(':', '');               // "09:30" -> "0930"
const cbToSlot = (s) => `${s.slice(0, 2)}:${s.slice(2)}`;       // "0930"  -> "09:30"

// ─────────────────────────── Renderers ────────────────────────────────────────

async function renderBarberPicker(ctx, { edit = false } = {}) {
  const barbers = await barbersRepo.listActiveBrief();
  if (barbers.length === 0) {
    return reply(ctx, '<i>Brak aktywnych fryzjerów.</i>', null, edit);
  }
  if (barbers.length === 1) {
    return renderCurrentMonth(ctx, barbers[0].id, { edit });
  }
  const kb = new InlineKeyboard();
  for (const b of barbers) {
    kb.text(`✂️ ${b.name}`, `cal:b:${b.id}`).row();
  }
  kb.text('✕ Zamknij', 'cal:x');
  return reply(ctx, '📅 <b>Wybierz fryzjera</b>', kb, edit);
}

async function renderCurrentMonth(ctx, barberId, { edit = false } = {}) {
  const today = todayInWarsaw();
  const [y, m] = today.split('-').map(Number);
  return renderMonth(ctx, barberId, y, m, { edit });
}

async function renderMonth(ctx, barberId, year, month, { edit = false } = {}) {
  const barber = await getBarberOrFallback(barberId);
  if (!barber) return reply(ctx, '<i>Nie znaleziono fryzjera.</i>', null, edit);

  const firstDay = buildIso(year, month, 1);
  const lastDay  = buildIso(year, month, daysInMonth(year, month));
  const counts = await bookingsRepo.countByDateForBarber(barberId, firstDay, lastDay);
  const today = todayInWarsaw();

  const byDate = new Map();
  for (const r of counts) byDate.set(r.date, r);

  const kb = new InlineKeyboard();

  // Nav row: ‹ prev · header · next ›
  const prev = prevMonth(year, month);
  const next = nextMonth(year, month);
  kb.text('‹', `cal:m:${barberId}:${prev.y}:${prev.m}`)
    .text(`${monthHeaderPl(year, month)}`, NOOP)
    .text('›', `cal:m:${barberId}:${next.y}:${next.m}`)
    .row();

  // Weekday header
  for (const dow of dowHeaderRowPl()) kb.text(dow, NOOP);
  kb.row();

  // Pad leading cells so Monday is first column.
  // Date.getDay(): 0=Sun..6=Sat. We want Monday=0..Sunday=6.
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

    let label = String(d);
    if (isPast) {
      // Past day, but still tappable to view (read-only-ish).
      // Mark with subtle prefix.
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

    if (isClosed && !hasBookings && !hasBlocks) {
      kb.text(label, NOOP);
    } else {
      kb.text(label, `cal:d:${barberId}:${year}:${month}:${d}`);
    }

    col++;
    if (col % 7 === 0) kb.row();
  }
  // Pad trailing cells of last row
  while (col % 7 !== 0) {
    kb.text(' ', NOOP);
    col++;
  }
  kb.row();

  kb.text('⟵ Zmień fryzjera', 'cal:bp').text('✕ Zamknij', 'cal:x');

  const text = [
    `📅 <b>${escapeHtml(monthHeaderPl(year, month))}</b>`,
    `✂️ ${escapeHtml(barber.name)}`,
    ``,
    `<i>• rezerwacje &nbsp; 🚫 blokady &nbsp; ✕ zamknięte &nbsp; · przeszłe</i>`,
  ].join('\n');

  return reply(ctx, text, kb, edit);
}

async function renderDay(ctx, barberId, year, month, day, { edit = true } = {}) {
  const iso = buildIso(year, month, day);
  const barber = await getBarberOrFallback(barberId);
  if (!barber) return reply(ctx, '<i>Nie znaleziono fryzjera.</i>', null, edit);

  const dow = jsDayOfWeek(year, month, day);
  const isClosed = !BUSINESS_HOURS[dow];

  const bookings = await bookingsRepo.findByBarberAndDate(barberId, iso);
  const grid = buildSlotsForISODate(iso);
  const unavailable = computeUnavailable(bookings, iso);
  const freeSlots = grid.filter((s) => !unavailable.has(s));

  const text = formatCalendarDayView({
    isoDate: iso,
    barberName: barber.name,
    bookings,
    freeSlots,
    isClosed,
  });

  const isPast = iso < todayInWarsaw();
  const kb = new InlineKeyboard();
  if (!isClosed && !isPast) {
    if (freeSlots.length > 0) {
      kb.text('🚫 Zablokuj czas', `cal:blk:${barberId}:${year}:${month}:${day}`)
        .text('🚫 Cały dzień', `cal:blkday:${barberId}:${year}:${month}:${day}`)
        .row();
    }
    const blocks = bookings.filter((b) => b.is_block);
    if (blocks.length > 0) {
      kb.text(`🗑 Odblokuj (${blocks.length})`, `cal:ulist:${barberId}:${year}:${month}:${day}`)
        .row();
    }
  }
  kb.text('🔄 Odśwież', `cal:d:${barberId}:${year}:${month}:${day}`)
    .text('⟵ Wróć', `cal:m:${barberId}:${year}:${month}`)
    .row()
    .text('✕ Zamknij', 'cal:x');

  return reply(ctx, text, kb, edit);
}

async function renderBlockSlotPicker(ctx, barberId, year, month, day) {
  const iso = buildIso(year, month, day);
  const barber = await getBarberOrFallback(barberId);
  if (!barber) return reply(ctx, '<i>Nie znaleziono fryzjera.</i>', null, true);

  const bookings = await bookingsRepo.findByBarberAndDate(barberId, iso);
  const grid = buildSlotsForISODate(iso);
  const unavailable = computeUnavailable(bookings, iso);
  const freeSlots = grid.filter((s) => !unavailable.has(s));

  if (freeSlots.length === 0) {
    return ctx.answerCallbackQuery({ text: 'Brak wolnych slotów.', show_alert: true });
  }

  const kb = new InlineKeyboard();
  let col = 0;
  for (const s of freeSlots) {
    kb.text(s, `cal:bks:${barberId}:${year}:${month}:${day}:${slotToCb(s)}`);
    col++;
    if (col % 4 === 0) kb.row();
  }
  if (col % 4 !== 0) kb.row();
  kb.text('⟵ Wróć', `cal:d:${barberId}:${year}:${month}:${day}`);

  const text = [
    `🚫 <b>Zablokuj czas — wybierz początek</b>`,
    ``,
    `📅 <b>${escapeHtml(barber.name)}</b> · ${escapeHtml(iso)}`,
  ].join('\n');

  return reply(ctx, text, kb, true);
}

async function renderBlockDurationPicker(ctx, barberId, year, month, day, slot) {
  const iso = buildIso(year, month, day);
  const barber = await getBarberOrFallback(barberId);
  if (!barber) return reply(ctx, '<i>Nie znaleziono fryzjera.</i>', null, true);

  const bookings = await bookingsRepo.findByBarberAndDate(barberId, iso);
  const grid = buildSlotsForISODate(iso);
  const startIdx = grid.indexOf(slot);
  if (startIdx < 0) {
    return ctx.answerCallbackQuery({ text: 'Slot poza godzinami otwarcia.', show_alert: true });
  }

  // Compute which durations actually fit and don't overlap.
  const validDurations = BLOCK_DURATIONS.filter((dur) => {
    const blocks = Math.ceil(dur / SLOT_STEP_MIN);
    if (startIdx + blocks > grid.length) return false;
    return !blockOverlapsExisting(slot, dur, bookings, iso);
  });

  if (validDurations.length === 0) {
    return ctx.answerCallbackQuery({ text: 'Żadna długość nie pasuje.', show_alert: true });
  }

  const kb = new InlineKeyboard();
  let col = 0;
  for (const dur of validDurations) {
    const label = dur >= 60 ? `${dur / 60}h${dur % 60 ? '30' : ''}` : `${dur}m`;
    kb.text(label, `cal:bkc:${barberId}:${year}:${month}:${day}:${slotToCb(slot)}:${dur}`);
    col++;
    if (col % 4 === 0) kb.row();
  }
  if (col % 4 !== 0) kb.row();
  kb.text('⟵ Wróć', `cal:blk:${barberId}:${year}:${month}:${day}`);

  const text = [
    `🚫 <b>Długość blokady</b>`,
    ``,
    `✂️ ${escapeHtml(barber.name)} · ${escapeHtml(iso)} · ⏰ <b>${escapeHtml(slot)}</b>`,
  ].join('\n');

  return reply(ctx, text, kb, true);
}

async function commitBlock(ctx, barberId, year, month, day, slot, durationMin) {
  const iso = buildIso(year, month, day);
  if (iso < todayInWarsaw()) {
    await ctx.answerCallbackQuery({ text: 'Nie można blokować w przeszłości.', show_alert: true });
    return renderDay(ctx, barberId, year, month, day);
  }
  try {
    await withTransaction(async (client) => {
      const existing = await bookingsRepo.findActiveByBarberAndDate(barberId, iso, { client });
      if (blockOverlapsExisting(slot, durationMin, existing, iso)) {
        const e = new Error('overlap'); e.code = 'SLOT_TAKEN'; throw e;
      }
      await bookingsRepo.insertBlock(
        { barberId, durationMin, date: iso, slot },
        { client },
      );
    });
  } catch (err) {
    if (err?.code === 'SLOT_TAKEN' || err?.code === '23505') {
      await ctx.answerCallbackQuery({ text: 'Slot zajęty.', show_alert: true });
      return renderDay(ctx, barberId, year, month, day);
    }
    await ctx.answerCallbackQuery({ text: 'Błąd przy blokowaniu.', show_alert: true });
    throw err;
  }
  await ctx.answerCallbackQuery({ text: 'Zablokowano ✓' });
  return renderDay(ctx, barberId, year, month, day);
}

async function commitBlockEntireDay(ctx, barberId, year, month, day) {
  const iso = buildIso(year, month, day);
  if (iso < todayInWarsaw()) {
    await ctx.answerCallbackQuery({ text: 'Nie można blokować w przeszłości.', show_alert: true });
    return renderDay(ctx, barberId, year, month, day);
  }
  const dow = jsDayOfWeek(year, month, day);
  if (!BUSINESS_HOURS[dow]) {
    await ctx.answerCallbackQuery({ text: 'Dzień zamknięty.', show_alert: true });
    return renderDay(ctx, barberId, year, month, day);
  }

  let runsBlocked = 0;
  try {
    await withTransaction(async (client) => {
      const existing = await bookingsRepo.findActiveByBarberAndDate(barberId, iso, { client });
      const grid = buildSlotsForISODate(iso);
      const unavailable = computeUnavailable(existing, iso);

      const runs = [];
      let current = null;
      for (const s of grid) {
        if (!unavailable.has(s)) {
          if (!current) current = { start: s, count: 1 };
          else current.count++;
        } else if (current) {
          runs.push(current);
          current = null;
        }
      }
      if (current) runs.push(current);

      if (runs.length === 0) {
        const e = new Error('no-free'); e.code = 'NO_FREE'; throw e;
      }

      for (const r of runs) {
        await bookingsRepo.insertBlock(
          { barberId, durationMin: r.count * SLOT_STEP_MIN, date: iso, slot: r.start },
          { client },
        );
        runsBlocked++;
      }
    });
  } catch (err) {
    if (err?.code === 'NO_FREE') {
      await ctx.answerCallbackQuery({ text: 'Brak wolnych slotów.', show_alert: true });
      return renderDay(ctx, barberId, year, month, day);
    }
    await ctx.answerCallbackQuery({ text: 'Błąd przy blokowaniu.', show_alert: true });
    throw err;
  }
  await ctx.answerCallbackQuery({
    text: runsBlocked === 1 ? 'Zablokowano cały dzień ✓' : `Zablokowano cały dzień ✓ (${runsBlocked} przedziały)`,
  });
  return renderDay(ctx, barberId, year, month, day);
}

async function renderUnblockList(ctx, barberId, year, month, day) {
  const iso = buildIso(year, month, day);
  const bookings = await bookingsRepo.findByBarberAndDate(barberId, iso);
  const blocks = bookings.filter((b) => b.is_block);
  if (blocks.length === 0) {
    return renderDay(ctx, barberId, year, month, day);
  }
  const kb = new InlineKeyboard();
  for (const b of blocks) {
    kb.text(`🗑 ${b.slot} (${b.duration_min}min) #${b.id}`,
            `cal:ulc:${barberId}:${year}:${month}:${day}:${b.id}`).row();
  }
  kb.text('⟵ Wróć', `cal:d:${barberId}:${year}:${month}:${day}`);
  const text = `🗑 <b>Wybierz blokadę do usunięcia</b>\n📅 ${escapeHtml(iso)}`;
  return reply(ctx, text, kb, true);
}

async function commitUnblock(ctx, barberId, year, month, day, blockId) {
  const ok = await bookingsRepo.deleteBlock(blockId);
  await ctx.answerCallbackQuery({ text: ok ? 'Odblokowano ✓' : 'Nie znaleziono.' });
  return renderDay(ctx, barberId, year, month, day);
}

// ─────────────────────────── Helpers ──────────────────────────────────────────

async function getBarberOrFallback(barberId) {
  const list = await barbersRepo.listActiveBrief();
  return list.find((b) => b.id === barberId) ?? null;
}

function prevMonth(y, m) { return m === 1 ? { y: y - 1, m: 12 } : { y, m: m - 1 }; }
function nextMonth(y, m) { return m === 12 ? { y: y + 1, m: 1 } : { y, m: m + 1 }; }

async function reply(ctx, text, kb, edit) {
  const opts = { ...HTML };
  if (kb) opts.reply_markup = kb;
  if (edit && ctx.callbackQuery) {
    try {
      return await ctx.editMessageText(text, opts);
    } catch (err) {
      // If "message is not modified" or similar, ignore.
      if (String(err?.description ?? '').includes('not modified')) return;
      throw err;
    }
  }
  return ctx.reply(text, opts);
}

// ─────────────────────────── Registration ─────────────────────────────────────

export function registerCalendar(bot) {
  bot.command('calendar', async (ctx) => {
    await renderBarberPicker(ctx, { edit: false });
  });

  // Barber picker (return)
  bot.callbackQuery(/^cal:bp$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    await renderBarberPicker(ctx, { edit: true });
  });

  // Pick barber
  bot.callbackQuery(/^cal:b:(\d+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const barberId = Number(ctx.match[1]);
    await renderCurrentMonth(ctx, barberId, { edit: true });
  });

  // Month grid
  bot.callbackQuery(/^cal:m:(\d+):(\d{4}):(\d{1,2})$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const barberId = Number(ctx.match[1]);
    const year = Number(ctx.match[2]);
    const month = Number(ctx.match[3]);
    await renderMonth(ctx, barberId, year, month, { edit: true });
  });

  // Day view
  bot.callbackQuery(/^cal:d:(\d+):(\d{4}):(\d{1,2}):(\d{1,2})$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const [, b, y, m, d] = ctx.match;
    await renderDay(ctx, Number(b), Number(y), Number(m), Number(d));
  });

  // Block flow: slot picker
  bot.callbackQuery(/^cal:blk:(\d+):(\d{4}):(\d{1,2}):(\d{1,2})$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const [, b, y, m, d] = ctx.match;
    await renderBlockSlotPicker(ctx, Number(b), Number(y), Number(m), Number(d));
  });

  // Block flow: duration picker (after slot)
  bot.callbackQuery(/^cal:bks:(\d+):(\d{4}):(\d{1,2}):(\d{1,2}):(\d{4})$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const [, b, y, m, d, s] = ctx.match;
    await renderBlockDurationPicker(ctx, Number(b), Number(y), Number(m), Number(d), cbToSlot(s));
  });

  // Block flow: commit
  bot.callbackQuery(/^cal:bkc:(\d+):(\d{4}):(\d{1,2}):(\d{1,2}):(\d{4}):(\d+)$/, async (ctx) => {
    const [, b, y, m, d, s, dur] = ctx.match;
    await commitBlock(ctx, Number(b), Number(y), Number(m), Number(d), cbToSlot(s), Number(dur));
  });

  // Block entire day (one-tap)
  bot.callbackQuery(/^cal:blkday:(\d+):(\d{4}):(\d{1,2}):(\d{1,2})$/, async (ctx) => {
    const [, b, y, m, d] = ctx.match;
    await commitBlockEntireDay(ctx, Number(b), Number(y), Number(m), Number(d));
  });

  // Unblock list
  bot.callbackQuery(/^cal:ulist:(\d+):(\d{4}):(\d{1,2}):(\d{1,2})$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const [, b, y, m, d] = ctx.match;
    await renderUnblockList(ctx, Number(b), Number(y), Number(m), Number(d));
  });

  // Unblock commit
  bot.callbackQuery(/^cal:ulc:(\d+):(\d{4}):(\d{1,2}):(\d{1,2}):(\d+)$/, async (ctx) => {
    const [, b, y, m, d, id] = ctx.match;
    await commitUnblock(ctx, Number(b), Number(y), Number(m), Number(d), Number(id));
  });

  // Close
  bot.callbackQuery(/^cal:x$/, async (ctx) => {
    await ctx.answerCallbackQuery({ text: 'Zamknięto.' });
    try { await ctx.deleteMessage(); } catch { /* may be too old */ }
  });

  // No-op (weekday headers, padding, past days that are inert)
  bot.callbackQuery(/^cal:noop$/, async (ctx) => {
    await ctx.answerCallbackQuery();
  });
}
