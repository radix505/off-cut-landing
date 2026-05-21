// Render received + confirmation emails (PL + EN) to ./artifacts/mail-preview/
// for design review. Run with: `node server/mail/preview.mjs`.
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildConfirmationEmail, buildReceivedEmail } from './templates/confirmation.js';
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
console.log(`Wrote previews to ${outDir}`);
