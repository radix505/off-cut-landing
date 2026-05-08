import { InlineKeyboard } from 'grammy';
import {
  getBookingById, getBookingsByDate, getBookingsByRange,
  getPendingFrom, searchBookings, getStats, setBookingStatus,
  listBarbers, listServices,
} from './queries.js';
import {
  helpMessage, formatDayOverview, formatRangeOverview,
  formatBookingCard, formatStats, formatBarbers, formatServices,
  todayInWarsaw, addDaysIso, isoToHumanPl, formatStatus,
} from './format.js';

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const HTML = { parse_mode: 'HTML' };

function bookingKeyboard(b) {
  const kb = new InlineKeyboard();
  if (b.status === 'pending') {
    kb.text('✅ Potwierdź', `bk:confirm:${b.id}`).text('❌ Anuluj', `bk:cancel:${b.id}`);
  } else if (b.status === 'confirmed') {
    kb.text('❌ Anuluj', `bk:cancel:${b.id}`).text('↩️ Cofnij', `bk:pending:${b.id}`);
  } else if (b.status === 'cancelled') {
    kb.text('↩️ Przywróć (oczekuje)', `bk:pending:${b.id}`);
  }
  return kb;
}

async function sendBookingCard(ctx, b) {
  return ctx.reply(formatBookingCard(b), {
    ...HTML,
    reply_markup: bookingKeyboard(b),
  });
}

async function sendOverviewWithCards(ctx, headerText, bookings) {
  await ctx.reply(headerText, HTML);
  for (const b of bookings) await sendBookingCard(ctx, b);
}

export function registerHandlers(bot) {
  bot.command('start', async (ctx) => {
    await ctx.reply(`👋 Cześć, ${ctx.from?.first_name ?? 'managerze'}!\n\n${helpMessage()}`, HTML);
  });

  bot.command('help', async (ctx) => ctx.reply(helpMessage(), HTML));

  bot.command('today', async (ctx) => {
    const date = todayInWarsaw();
    const rows = getBookingsByDate(date);
    await ctx.reply(formatDayOverview(date, rows), HTML);
  });

  bot.command('tomorrow', async (ctx) => {
    const date = addDaysIso(todayInWarsaw(), 1);
    const rows = getBookingsByDate(date);
    await ctx.reply(formatDayOverview(date, rows), HTML);
  });

  bot.command('week', async (ctx) => {
    const from = todayInWarsaw();
    const to = addDaysIso(from, 6);
    const rows = getBookingsByRange(from, to);
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
    const rows = getBookingsByDate(arg);
    await ctx.reply(formatDayOverview(arg, rows), HTML);
  });

  bot.command('pending', async (ctx) => {
    const rows = getPendingFrom(todayInWarsaw());
    if (rows.length === 0) {
      return ctx.reply('🎉 Brak oczekujących rezerwacji.', HTML);
    }
    await sendOverviewWithCards(ctx, `🕒 <b>Oczekujące — ${rows.length}</b>`, rows);
  });

  bot.command('find', async (ctx) => {
    const q = ctx.match.trim();
    if (q.length < 2) {
      return ctx.reply('Użycie: <code>/find &lt;imię lub telefon&gt;</code>', HTML);
    }
    const rows = searchBookings(q, todayInWarsaw());
    if (rows.length === 0) {
      return ctx.reply(`Brak wyników dla: <b>${q}</b>`, HTML);
    }
    await sendOverviewWithCards(ctx, `🔎 <b>Wyniki: ${rows.length}</b>`, rows);
  });

  bot.command('booking', async (ctx) => {
    const id = Number(ctx.match.trim());
    if (!Number.isInteger(id) || id <= 0) {
      return ctx.reply('Użycie: <code>/booking &lt;id&gt;</code>', HTML);
    }
    const b = getBookingById(id);
    if (!b) return ctx.reply(`Nie znaleziono rezerwacji #${id}.`);
    await sendBookingCard(ctx, b);
  });

  bot.command('stats', async (ctx) => {
    const today = todayInWarsaw();
    const weekTo = addDaysIso(today, 6);
    const todayStats = getStats(today, today);
    const weekStats = getStats(today, weekTo);
    await ctx.reply(
      `${formatStats('Dziś', todayStats)}\n\n${formatStats('Następne 7 dni', weekStats)}`,
      HTML,
    );
  });

  bot.command('barbers', async (ctx) => ctx.reply(formatBarbers(listBarbers()), HTML));
  bot.command('services', async (ctx) => ctx.reply(formatServices(listServices()), HTML));

  bot.callbackQuery(/^bk:(confirm|cancel|pending):(\d+)$/, async (ctx) => {
    const action = ctx.match[1];
    const id = Number(ctx.match[2]);
    const status =
      action === 'confirm' ? 'confirmed' :
      action === 'cancel' ? 'cancelled' : 'pending';

    const before = getBookingById(id);
    if (!before) {
      await ctx.answerCallbackQuery({ text: `Brak rezerwacji #${id}`, show_alert: true });
      return;
    }
    if (before.status === status) {
      await ctx.answerCallbackQuery({ text: `Już ${formatStatus(status)}`, show_alert: false });
      return;
    }

    setBookingStatus(id, status);
    const after = getBookingById(id);
    await ctx.editMessageText(formatBookingCard(after), {
      ...HTML,
      reply_markup: bookingKeyboard(after),
    });
    await ctx.answerCallbackQuery({ text: `Status: ${formatStatus(status)}` });
  });

  bot.on('message:text', async (ctx) => {
    const txt = ctx.message.text.trim();
    if (txt.startsWith('/')) {
      return ctx.reply('Nieznana komenda. Wpisz /help.');
    }
    if (ISO_DATE_RE.test(txt)) {
      const rows = getBookingsByDate(txt);
      return ctx.reply(formatDayOverview(txt, rows), HTML);
    }
    if (txt.length >= 2) {
      const rows = searchBookings(txt, todayInWarsaw());
      if (rows.length === 0) {
        return ctx.reply(`Brak wyników dla: <b>${txt}</b>\n\nWpisz /help, aby zobaczyć komendy.`, HTML);
      }
      await sendOverviewWithCards(ctx, `🔎 <b>Wyniki: ${rows.length}</b>`, rows);
    }
  });
}
