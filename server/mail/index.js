import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  getMailClient, isMailEnabled, mailFromAddress, mailReplyTo, isMailDryRun,
} from './resend.js';
import {
  buildConfirmationEmail, buildReceivedEmail, ADDRESS_LINE, PHONE_DISPLAY,
  WORDMARK_DARK_CID, WORDMARK_LIGHT_CID,
} from './templates/confirmation.js';
import { buildBookingIcs } from './ics.js';
import * as bookingsRepo from '../data/bookingsRepo.js';

const here = dirname(fileURLToPath(import.meta.url));

// Inline-image attachments for the OFF CUT wordmark, loaded once at module
// init. Built by `node server/mail/assets/build-logos.mjs` - re-run that if
// the brand mark ever changes.
let wordmarkAttachments = null;
function getWordmarkAttachments() {
  if (wordmarkAttachments) return wordmarkAttachments;
  try {
    const dark = readFileSync(resolve(here, 'assets', 'wordmark-dark.png'));
    const light = readFileSync(resolve(here, 'assets', 'wordmark-light.png'));
    wordmarkAttachments = [
      {
        filename: 'offcut-wordmark.png',
        content: dark,
        content_type: 'image/png',
        content_id: WORDMARK_DARK_CID,
      },
      {
        filename: 'offcut-wordmark-light.png',
        content: light,
        content_type: 'image/png',
        content_id: WORDMARK_LIGHT_CID,
      },
    ];
  } catch {
    wordmarkAttachments = [];
  }
  return wordmarkAttachments;
}

const ORG_NAME = 'Off Cut';
const ICS_ORGANIZER_EMAIL_FALLBACK = 'rezerwacje@offcutszczecin.pl';

function organizerEmailFromConfig() {
  const replyTo = mailReplyTo();
  if (replyTo) return replyTo;
  const from = mailFromAddress();
  const m = /<([^>]+)>/.exec(from);
  return m?.[1] ?? from ?? ICS_ORGANIZER_EMAIL_FALLBACK;
}

// Send the booking confirmation. Safe to call multiple times - the DB guard
// (markConfirmationEmailSent) and Resend's Idempotency-Key both prevent
// duplicate deliveries.
export async function sendBookingConfirmation(booking, { log = console } = {}) {
  if (!booking) return { skipped: 'no_booking' };
  if (booking.is_block) return { skipped: 'block' };
  if (booking.status !== 'confirmed') return { skipped: 'not_confirmed' };
  if (!booking.email) return { skipped: 'no_email' };
  if (booking.confirmation_email_sent_at) return { skipped: 'already_sent' };

  if (!isMailEnabled()) {
    log.warn?.({ id: booking.id }, 'mail disabled (RESEND_API_KEY or MAIL_FROM missing); skipping confirmation email');
    return { skipped: 'mail_disabled' };
  }

  // Reserve the send slot atomically. If another process already took it,
  // bail before hitting the upstream API.
  const reserved = await bookingsRepo.markConfirmationEmailSent(booking.id);
  if (!reserved) return { skipped: 'race' };

  const tpl = buildConfirmationEmail(booking);
  const organizerEmail = organizerEmailFromConfig();
  const ics = buildBookingIcs({
    id: booking.id,
    date: booking.date,
    slot: booking.slot,
    durationMin: booking.duration_min,
    summary: tpl.icsSummary,
    description: tpl.icsDescription,
    location: tpl.icsLocation,
    organizerName: ORG_NAME,
    organizerEmail,
    attendeeEmail: booking.email,
    attendeeName: booking.customer_name,
  });

  const payload = {
    from: mailFromAddress(),
    to: [booking.email],
    subject: tpl.subject,
    html: tpl.html,
    text: tpl.text,
    attachments: [
      ...getWordmarkAttachments(),
      {
        filename: 'off-cut.ics',
        content: Buffer.from(ics, 'utf8'),
        content_type: 'text/calendar; method=REQUEST; charset=utf-8',
      },
    ],
    headers: {
      'X-Entity-Ref-ID': `booking-${booking.id}`,
    },
  };
  const replyTo = mailReplyTo();
  if (replyTo) payload.replyTo = replyTo;

  if (isMailDryRun()) {
    log.info?.({ id: booking.id, to: booking.email, subject: tpl.subject }, 'mail dry-run: would send confirmation');
    return { sent: false, dryRun: true };
  }

  const resend = getMailClient();
  if (!resend) {
    log.warn?.({ id: booking.id }, 'resend client unavailable; leaving reservation in place');
    return { skipped: 'client_unavailable' };
  }

  try {
    const result = await resend.emails.send(payload, {
      idempotencyKey: `booking-confirmation:${booking.id}`,
    });
    if (result?.error) {
      log.error?.({ id: booking.id, err: result.error }, 'resend rejected confirmation email');
      return { sent: false, error: result.error };
    }
    log.info?.({ id: booking.id, messageId: result?.data?.id, to: booking.email }, 'confirmation email sent');
    return { sent: true, messageId: result?.data?.id };
  } catch (err) {
    log.error?.({ id: booking.id, err }, 'confirmation email threw');
    return { sent: false, error: err };
  }
}

// Fire-and-forget "we received your booking" email. Sent immediately after
// POST /api/bookings succeeds, before the manager has confirmed. No ICS
// attachment - the calendar file only goes out with the confirmation mail
// once the barber has actually committed to the slot.
export async function sendBookingReceived(booking, { log = console } = {}) {
  if (!booking) return { skipped: 'no_booking' };
  if (booking.is_block) return { skipped: 'block' };
  if (!booking.email) return { skipped: 'no_email' };
  if (booking.received_email_sent_at) return { skipped: 'already_sent' };

  if (!isMailEnabled()) {
    log.warn?.({ id: booking.id }, 'mail disabled (RESEND_API_KEY or MAIL_FROM missing); skipping received email');
    return { skipped: 'mail_disabled' };
  }

  const reserved = await bookingsRepo.markReceivedEmailSent(booking.id);
  if (!reserved) return { skipped: 'race' };

  const tpl = buildReceivedEmail(booking);
  const payload = {
    from: mailFromAddress(),
    to: [booking.email],
    subject: tpl.subject,
    html: tpl.html,
    text: tpl.text,
    attachments: [...getWordmarkAttachments()],
    headers: {
      'X-Entity-Ref-ID': `booking-${booking.id}-received`,
    },
  };
  const replyTo = mailReplyTo();
  if (replyTo) payload.replyTo = replyTo;

  if (isMailDryRun()) {
    log.info?.({ id: booking.id, to: booking.email, subject: tpl.subject }, 'mail dry-run: would send received email');
    return { sent: false, dryRun: true };
  }

  const resend = getMailClient();
  if (!resend) {
    log.warn?.({ id: booking.id }, 'resend client unavailable; leaving reservation in place');
    return { skipped: 'client_unavailable' };
  }

  try {
    const result = await resend.emails.send(payload, {
      idempotencyKey: `booking-received:${booking.id}`,
    });
    if (result?.error) {
      log.error?.({ id: booking.id, err: result.error }, 'resend rejected received email');
      return { sent: false, error: result.error };
    }
    log.info?.({ id: booking.id, messageId: result?.data?.id, to: booking.email }, 'received email sent');
    return { sent: true, messageId: result?.data?.id };
  } catch (err) {
    log.error?.({ id: booking.id, err }, 'received email threw');
    return { sent: false, error: err };
  }
}

export { ADDRESS_LINE, PHONE_DISPLAY };
