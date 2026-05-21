import { Resend } from 'resend';

let client = null;

export function getMailClient() {
  if (client) return client;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  client = new Resend(apiKey);
  return client;
}

export function isMailEnabled() {
  return !!process.env.RESEND_API_KEY && !!process.env.MAIL_FROM;
}

export function mailFromAddress() {
  return process.env.MAIL_FROM ?? 'Off Cut <onboarding@resend.dev>';
}

export function mailReplyTo() {
  return process.env.MAIL_REPLY_TO ?? null;
}

export function isMailDryRun() {
  return process.env.MAIL_DRY_RUN === '1' || process.env.MAIL_DRY_RUN === 'true';
}
