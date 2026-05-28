// Render received + confirmation + reschedule emails (PL + EN) to
// ./artifacts/mail-preview/ for design review.
// Run with: `node server/mail/preview.mjs`.
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildConfirmationEmail, buildReceivedEmail, buildRescheduleEmail,
  buildCancellationEmail,
} from './templates/confirmation.js';
import { buildBookingIcs } from './ics.js';

const here = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(here, '../..', 'artifacts', 'mail-preview');
mkdirSync(outDir, { recursive: true });

const sample = {
  id: 1234,
  date: '2026-05-22',
  slot: '18:30',
  duration_min: 60,
  barber_name: 'Krzysztof',
  service_name: 'Strzyżenie + Broda',
  service_name_en: 'Cut + Beard',
  service_price_pln: 200,
  customer_name: 'Jan Kowalski',
  email: 'jan@example.com',
  lang: 'pl',
  status: 'confirmed',
  is_block: false,
};

const builders = {
  received: buildReceivedEmail,
  confirmation: buildConfirmationEmail,
  cancellation: buildCancellationEmail,
};

for (const [state, build] of Object.entries(builders)) {
  for (const lang of ['pl', 'en']) {
    // Preview mode: inline the wordmark PNG as a data URL so the static file
    // opens correctly off disk (production mailer uses CID attachments).
    const tpl = build({ ...sample, lang }, { wordmarkMode: 'data' });
    writeFileSync(resolve(outDir, `${state}-${lang}.html`), tpl.html);
    writeFileSync(resolve(outDir, `${state}-${lang}.txt`), tpl.text);
    console.log(`${state.padEnd(12)} ${lang.toUpperCase()} subject: ${tpl.subject}`);
  }
}

// Reschedule mail (#3) needs both the old and new appointment rows so the
// template can render the "PRZENIESIONO Z" diff line.
const oldBookingSample = {
  ...sample,
  date: '2026-05-18',
  slot: '14:00',
};
for (const lang of ['pl', 'en']) {
  const newSample = { ...sample, lang };
  const oldSample = { ...oldBookingSample, lang };
  const tpl = buildRescheduleEmail(newSample, oldSample, { wordmarkMode: 'data' });
  writeFileSync(resolve(outDir, `reschedule-${lang}.html`), tpl.html);
  writeFileSync(resolve(outDir, `reschedule-${lang}.txt`), tpl.text);
  console.log(`${'reschedule'.padEnd(12)} ${lang.toUpperCase()} subject: ${tpl.subject}`);
}

const tpl = buildConfirmationEmail({ ...sample, lang: 'pl' });
const ics = buildBookingIcs({
  id: sample.id,
  date: sample.date,
  slot: sample.slot,
  durationMin: sample.duration_min,
  summary: tpl.icsSummary,
  description: tpl.icsDescription,
  location: tpl.icsLocation,
  organizerName: 'Off Cut',
  organizerEmail: 'rezerwacje@offcutszczecin.pl',
  attendeeEmail: sample.email,
  attendeeName: sample.customer_name,
});
writeFileSync(resolve(outDir, 'off-cut.ics'), ics);

// Reschedule ICS: same UID as the confirmation .ics above, but with a
// bumped SEQUENCE and new date/slot - exactly what production sends.
const rescheduleTpl = buildRescheduleEmail({ ...sample, lang: 'pl' }, { ...oldBookingSample, lang: 'pl' });
const icsReschedule = buildBookingIcs({
  id: sample.id,
  date: sample.date,
  slot: sample.slot,
  durationMin: sample.duration_min,
  summary: rescheduleTpl.icsSummary,
  description: rescheduleTpl.icsDescription,
  location: rescheduleTpl.icsLocation,
  organizerName: 'Off Cut',
  organizerEmail: 'rezerwacje@offcutszczecin.pl',
  attendeeEmail: sample.email,
  attendeeName: sample.customer_name,
  sequence: Math.floor(Date.now() / 1000),
});
writeFileSync(resolve(outDir, 'off-cut-reschedule.ics'), icsReschedule);

// Cancellation ICS: METHOD:CANCEL + STATUS:CANCELLED for the same UID -
// calendar clients drop the event from the customer's calendar.
const cancelTpl = buildCancellationEmail({ ...sample, lang: 'pl' });
const icsCancel = buildBookingIcs({
  id: sample.id,
  date: sample.date,
  slot: sample.slot,
  durationMin: sample.duration_min,
  summary: cancelTpl.icsSummary,
  description: cancelTpl.icsDescription,
  location: cancelTpl.icsLocation,
  organizerName: 'Off Cut',
  organizerEmail: 'rezerwacje@offcutszczecin.pl',
  attendeeEmail: sample.email,
  attendeeName: sample.customer_name,
  sequence: Math.floor(Date.now() / 1000),
  method: 'CANCEL',
});
writeFileSync(resolve(outDir, 'off-cut-cancel.ics'), icsCancel);

console.log(`Wrote previews to ${outDir}`);
