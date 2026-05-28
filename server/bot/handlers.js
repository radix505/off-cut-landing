import { InlineKeyboard } from 'grammy';
import * as bookingsRepo from '../data/bookingsRepo.js';
import {
  helpMessage, formatDayOverview, formatRangeOverview,
  formatBookingCard, formatStats,
  todayInWarsaw, addDaysIso, isoToHumanPl, formatStatus,
} from './format.js';
import { sendBookingConfirmation } from '../mail/index.js';

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const HTML = { parse_mode: 'HTML' };

export function bookingKeyboard(b, { hideUndo = false } = {}) {
  const kb = new InlineKeyboard();
  const hu = hideUndo ? 1 : 0;
  if (b.status === 'pending') {
    kb.text('✅ Potwierdź', `bk:confirm:${b.id}`).text('❌ Anuluj', `bk:cancelq:${b.id}:${hu}`);
  } else if (b.status === 'confirmed') {
    kb.text('❌ Anuluj', `bk:cancelq:${b.id}:${hu}`);
    if (!hideUndo) kb.text('↩️ Cofnij', `bk:pending:${b.id}`);
  } else if (b.status === 'cancelled') {
    kb.text('↩️ Przywróć (oczekuje)', `bk:pending:${b.id}`);
  }
  if (!b.is_block && (b.status === 'pending' || b.status === 'confirmed')) {
    kb.row().text('🔄 Przełóż', `bk:rs:${b.id}`);
  }
  return kb;
}

async function sendBookingCard(ctx, b, kbOpts) {
  return ctx.reply(formatBookingCard(b), {
    ...HTML,
    reply_markup: bookingKeyboard(b, kbOpts),
  });
}

async function sendOverviewWithCards(ctx, headerText, bookings, kbOpts) {
  await ctx.reply(headerText, HTML);
  for (const b of bookings) await sendBookingCard(ctx, b, kbOpts);
}

export function registerHandlers(bot) {
  bot.command('start', async (ctx) => {
    await ctx.reply(`👋 Cześć, ${ctx.from?.first_name ?? 'managerze'}!\n\n${helpMessage()}`, HTML);
  });

  bot.command('help', async (ctx) => ctx.reply(helpMessage(), HTML));

  bot.command('today', async (ctx) => {
    const date = todayInWarsaw();
    const rows = await bookingsRepo.findByDate(date);
    await ctx.reply(formatDayOverview(date, rows), HTML);
  });

  bot.command('tomorrow', async (ctx) => {
    const date = addDaysIso(todayInWarsaw(), 1);
    const rows = await bookingsRepo.findByDate(date);
    await ctx.reply(formatDayOverview(date, rows), HTML);
  });

  bot.command('week', async (ctx) => {
    const from = todayInWarsaw();
    const to = addDaysIso(from, 6);
    const rows = await bookingsRepo.findByRange(from, to);
    await ctx.reply(
      formatRangeOverview(rows, `Następne 7 dni (${isoToHumanPl(from)} → ${isoToHumanPl(to)})`),
      HTML,
    );
  });

  bot.command('date', async (ctx) => {
    const arg = ctx.match.trim();
    if (!ISO_DATE_RE.test(arg)) {
      return ctx.reply('Użycie: <code>/date YYYY-MM-DD</code>', HTML);
    }
    const rows = await bookingsRepo.findByDate(arg);
    await ctx.reply(formatDayOverview(arg, rows), HTML);
  });

  bot.command('pending', async (ctx) => {
    const rows = await bookingsRepo.findPendingFrom(todayInWarsaw());
    if (rows.length === 0) {
      return ctx.reply('🎉 Brak oczekujących rezerwacji.', HTML);
    }
    await sendOverviewWithCards(ctx, `🕒 <b>Oczekujące - ${rows.length}</b>`, rows);
  });

  bot.command('find', async (ctx) => {
    const q = ctx.match.trim();
    if (q.length < 2) {
      return ctx.reply('Użycie: <code>/find &lt;imię lub telefon&gt;</code>', HTML);
    }
    const rows = await bookingsRepo.search(q, todayInWarsaw());
    if (rows.length === 0) {
      return ctx.reply(`Brak wyników dla: <b>${q}</b>`, HTML);
    }
    await sendOverviewWithCards(ctx, `🔎 <b>Wyniki: ${rows.length}</b>`, rows, { hideUndo: true });
  });

  bot.command('booking', async (ctx) => {
    const id = Number(ctx.match.trim());
    if (!Number.isInteger(id) || id <= 0) {
      return ctx.reply('Użycie: <code>/booking &lt;id&gt;</code>', HTML);
    }
    const b = await bookingsRepo.findById(id);
    if (!b) return ctx.reply(`Nie znaleziono rezerwacji #${id}.`);
    await sendBookingCard(ctx, b);
  });

  bot.command('stats', async (ctx) => {
    const today = todayInWarsaw();
    const weekTo = addDaysIso(today, 6);
    const [todayStats, weekStats] = await Promise.all([
      bookingsRepo.getStats(today, today),
      bookingsRepo.getStats(today, weekTo),
    ]);
    await ctx.reply(
      `${formatStats('Dziś', todayStats)}\n\n${formatStats('Następne 7 dni', weekStats)}`,
      HTML,
    );
  });

  // Tapping ❌ Anuluj asks for confirmation instead of cancelling immediately.
  bot.callbackQuery(/^bk:cancelq:(\d+):(0|1)$/, async (ctx) => {
    const id = Number(ctx.match[1]);
    const hu = ctx.match[2];
    const b = await bookingsRepo.findById(id);
    if (!b) {
      await ctx.answerCallbackQuery({ text: `Brak rezerwacji #${id}`, show_alert: true });
      return;
    }
    if (b.status === 'cancelled') {
      await ctx.answerCallbackQuery({ text: 'Już anulowana', show_alert: false });
      return;
    }
    const kb = new InlineKeyboard()
      .text(`⚠️ Anulować rezerwację #${id}?`, 'bk:noop').row()
      .text('✅ Tak, anuluj', `bk:cancel:${id}`)
      .text('↩️ Nie', `bk:kb:${id}:${hu}`);
    await ctx.editMessageReplyMarkup({ reply_markup: kb });
    await ctx.answerCallbackQuery();
  });

  // "Nie" - restore the original card keyboard (hideUndo preserved).
  bot.callbackQuery(/^bk:kb:(\d+):(0|1)$/, async (ctx) => {
    const id = Number(ctx.match[1]);
    const hideUndo = ctx.match[2] === '1';
    const b = await bookingsRepo.findById(id);
    if (!b) {
      await ctx.answerCallbackQuery({ text: `Brak rezerwacji #${id}`, show_alert: true });
      return;
    }
    await ctx.editMessageReplyMarkup({ reply_markup: bookingKeyboard(b, { hideUndo }) });
    await ctx.answerCallbackQuery();
  });

  bot.callbackQuery('bk:noop', (ctx) => ctx.answerCallbackQuery());

  bot.callbackQuery(/^bk:(confirm|cancel|pending):(\d+)$/, async (ctx) => {
    const action = ctx.match[1];
    const id = Number(ctx.match[2]);
    const status =
      action === 'confirm' ? 'confirmed' :
      action === 'cancel' ? 'cancelled' : 'pending';

    const before = await bookingsRepo.findById(id);
    if (!before) {
      await ctx.answerCallbackQuery({ text: `Brak rezerwacji #${id}`, show_alert: true });
      return;
    }
    if (before.status === status) {
      await ctx.answerCallbackQuery({ text: `Już ${formatStatus(status)}`, show_alert: false });
      return;
    }

    await bookingsRepo.updateStatus(id, status);
    const after = await bookingsRepo.findById(id);
    await ctx.editMessageText(formatBookingCard(after), {
      ...HTML,
      reply_markup: bookingKeyboard(after),
    });
    await ctx.answerCallbackQuery({ text: `Status: ${formatStatus(status)}` });

    if (action === 'confirm' && after?.status === 'confirmed') {
      sendBookingConfirmation(after).catch(() => {});
    }
  });

  // Tapping a booking in the /calendar day view - open the full card (like /find).
  bot.callbackQuery(/^bk:show:(\d+)$/, async (ctx) => {
    const id = Number(ctx.match[1]);
    const b = await bookingsRepo.findById(id);
    if (!b) {
      await ctx.answerCallbackQuery({ text: `Brak rezerwacji #${id}`, show_alert: true });
      return;
    }
    await ctx.answerCallbackQuery();
    await sendBookingCard(ctx, b, { hideUndo: true });
  });

  bot.on('message:text', async (ctx) => {
    const txt = ctx.message.text.trim();
    if (txt.startsWith('/')) {
      return ctx.reply('Nieznana komenda. Wpisz /help.');
    }
    if (ISO_DATE_RE.test(txt)) {
      const rows = await bookingsRepo.findByDate(txt);
      return ctx.reply(formatDayOverview(txt, rows), HTML);
    }
    if (txt.length >= 2) {
      const rows = await bookingsRepo.search(txt, todayInWarsaw());
      if (rows.length === 0) {
        return ctx.reply(`Brak wyników dla: <b>${txt}</b>\n\nWpisz /help, aby zobaczyć komendy.`, HTML);
      }
      await sendOverviewWithCards(ctx, `🔎 <b>Wyniki: ${rows.length}</b>`, rows, { hideUndo: true });
    }
  });
}
