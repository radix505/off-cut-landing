import { Bot, GrammyError, HttpError } from 'grammy';
import { registerHandlers } from './handlers.js';
import { registerCalendar } from './calendar.js';
import { formatNewBookingNotification } from './format.js';

let bot = null;
let managerIds = new Set();
let logger = console;

function parseManagerIds(raw) {
  if (!raw) return new Set();
  return new Set(
      raw.split(',')
          .map((s) => s.trim())
          .filter(Boolean)
          .map(Number)
          .filter((n) => Number.isInteger(n) && n > 0),
  );
}

export async function startBot({ log } = {}) {
  if (bot) return bot;
  if (log) logger = log;

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    logger.info?.('telegram bot disabled (TELEGRAM_BOT_TOKEN not set)');
    return null;
  }

  managerIds = parseManagerIds(process.env.TELEGRAM_MANAGER_IDS);
  if (managerIds.size === 0) {
    logger.warn?.('TELEGRAM_MANAGER_IDS is empty — bot will reject every user');
  }

  bot = new Bot(token);

  bot.use(async (ctx, next) => {
    const uid = ctx.from?.id;
    if (uid && managerIds.has(uid)) return next();
    if (ctx.callbackQuery) {
      await ctx.answerCallbackQuery({ text: 'Brak dostępu.', show_alert: true });
      return;
    }
    if (ctx.message) {
      await ctx.reply(`⛔ Brak dostępu.\nTwój ID: <code>${uid ?? '?'}</code>`, { parse_mode: 'HTML' });
    }
  });

  registerCalendar(bot);
  registerHandlers(bot);

  bot.catch((err) => {
    const ctx = err.ctx;
    const e = err.error;
    const meta = { update_id: ctx?.update?.update_id, user_id: ctx?.from?.id };
    if (e instanceof GrammyError) {
      logger.error?.({ ...meta, err: e }, 'telegram api error');
    } else if (e instanceof HttpError) {
      logger.error?.({ ...meta, err: e }, 'telegram network error');
    } else {
      logger.error?.({ ...meta, err: e }, 'bot handler error');
    }
  });

  const me = await bot.api.getMe();
  bot.start({
    drop_pending_updates: true,
    onStart: () => logger.info?.({ username: me.username, id: me.id }, 'telegram bot started (polling)'),
  }).catch((err) => logger.error?.({ err }, 'bot.start failed'));

  return bot;
}

export async function stopBot() {
  if (!bot) return;
  await bot.stop().catch(() => {});
  bot = null;
}

export async function notifyManagers(text, opts = {}) {
  if (!bot || managerIds.size === 0) return;
  const payload = { parse_mode: 'HTML', ...opts };
  await Promise.all(
      [...managerIds].map((id) =>
          bot.api.sendMessage(id, text, payload).catch((err) =>
              logger.warn?.({ err, manager_id: id }, 'failed to notify manager'),
          ),
      ),
  );
}

export async function notifyNewBooking(booking) {
  if (!bot) return;
  await notifyManagers(formatNewBookingNotification(booking));
}
