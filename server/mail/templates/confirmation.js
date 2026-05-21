// Off Cut booking confirmation email.
//
// Brand register (see DESIGN.md): paper #f5f3ef + ink #0a0a0a + a single
// baby-blue #8FD9FB accent. Bebas Neue for display via Google Fonts
// (Apple Mail / Gmail render it; Outlook desktop falls back to a condensed
// system stack and still reads industrial). Hairlines render as 1px in mail
// clients, so the brand line color carries the workshop-tag detail.
//
// The OFF CUT wordmark itself is rendered in Let Me Ride (the brand's custom
// stencil face) and shipped as an inline PNG attachment with a known CID —
// the only reliable way to surface a custom typeface across all email
// clients including Outlook desktop. See server/mail/assets/build-logos.mjs
// for how the PNG is generated.
//
// Layout is table-based for Outlook desktop compatibility. Every cell pins
// bgcolor/background to defeat Gmail/Outlook dark-mode auto-invert.

import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __here = dirname(fileURLToPath(import.meta.url));

export const WORDMARK_DARK_CID = 'offcut-wordmark-dark@offcut';
export const WORDMARK_LIGHT_CID = 'offcut-wordmark-light@offcut';

// For static previews (file:// HTML) the wordmark is inlined as a data URL.
// In production the mailer attaches the PNGs as CIDs.
let cachedDataUrls = null;
function loadWordmarkDataUrls() {
  if (cachedDataUrls) return cachedDataUrls;
  try {
    const dark = readFileSync(resolve(__here, '..', 'assets', 'wordmark-dark.png'));
    const light = readFileSync(resolve(__here, '..', 'assets', 'wordmark-light.png'));
    cachedDataUrls = {
      dark: `data:image/png;base64,${dark.toString('base64')}`,
      light: `data:image/png;base64,${light.toString('base64')}`,
    };
  } catch {
    cachedDataUrls = { dark: null, light: null };
  }
  return cachedDataUrls;
}

const ADDRESS_LINE = 'ul. Bolesława Krzywoustego 27 U4, 70-316 Szczecin';
const PHONE_DISPLAY = '+48 513 340 013';
const PHONE_TEL = '+48513340013';
const MAP_URL = 'https://maps.google.com/?q=Off+Cut+Barbershop+Szczecin';
const SITE_URL = 'https://off-cut.pl';
const INSTAGRAM_URL = 'https://www.instagram.com/off_cut_barbershop/';
const FACEBOOK_URL = 'https://www.facebook.com/offcutbarbershopszczecin';

const DOW_PL = ['niedziela', 'poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota'];
const DOW_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS_PL = ['stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca',
  'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'];
const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

function escapeHtml(s) {
  return String(s ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function parts(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return { y, m, d, dow: dt.getUTCDay() };
}

function formatLongDate(iso, lang) {
  const { y, m, d, dow } = parts(iso);
  if (lang === 'en') return `${DOW_EN[dow]}, ${d} ${MONTHS_EN[m - 1]} ${y}`;
  return `${DOW_PL[dow]}, ${d} ${MONTHS_PL[m - 1]} ${y}`;
}

// Big "WTOREK 22 MAJA" lockup for the hero stamp.
function formatHeroDate(iso, lang) {
  const { m, d, dow } = parts(iso);
  if (lang === 'en') return `${DOW_EN[dow].toUpperCase()} ${d} ${MONTHS_EN[m - 1].toUpperCase()}`;
  return `${DOW_PL[dow].toUpperCase()} ${d} ${MONTHS_PL[m - 1].toUpperCase()}`;
}

function pickServiceName(booking, lang) {
  if (lang === 'en') return booking.service_name_en ?? booking.service_name ?? booking.service_id;
  return booking.service_name ?? booking.service_id;
}

// Copy table. Shared keys at each lang root; state-specific copy nested under
// `received` (mail #1, fires on submit) and `confirmed` (mail #2, fires after
// the manager taps ✅ on Telegram).
const T = {
  pl: {
    subjectPrefix: 'Off Cut',
    labels: {
      barber: 'BARBER',
      service: 'USŁUGA',
      duration: 'CZAS',
      price: 'CENA',
      date: 'TERMIN',
      time: 'GODZINA',
      address: 'ADRES',
    },
    durationSuffix: 'min',
    priceSuffix: 'PLN',
    callCta: 'ZADZWOŃ',
    mapCta: 'ZOBACZ NA MAPIE',
    walkInNote: 'Spóźnienie powyżej 10 minut może skrócić wizytę.',
    footerTagline: 'EST. 2019 — PREMIUM GROOMING — SZCZECIN',
    bookingNumber: (id) => `REZERWACJA #${id}`,
    received: {
      preheader: (slot, date) => `Mamy Twoje zgłoszenie — ${date}, ${slot}. Czekamy na potwierdzenie barbera.`,
      subject: 'Wizyta zgłoszona',
      eyebrow: 'ZGŁOSZENIE OTRZYMANE',
      sectionNumber: '00',
      slotEyebrow: 'OCZEKUJE NA POTWIERDZENIE',
      headline: 'Zanotowane.',
      intro: (name) => `${name}, mamy Twoje zgłoszenie. Barber zatwierdzi termin w ciągu kilku godzin. Wtedy dostaniesz drugą wiadomość z plikiem do kalendarza i pełnym potwierdzeniem.`,
      infoCardTitle: 'CO DALEJ',
      infoCardBody: 'Czekamy aż barber zatwierdzi termin. Mail z plikiem .ics przyjdzie zaraz po tym.',
      needToChangeTitle: 'Pomyłka?',
      needToChangeBody: 'Zadzwoń, jeśli chcesz coś zmienić zanim termin zostanie zatwierdzony.',
      showOnArrival: 'Trzymamy dla Ciebie termin. Po potwierdzeniu dostaniesz drugi mail.',
      footerLegal: 'Otrzymujesz tę wiadomość, ponieważ złożono zgłoszenie rezerwacji w Off Cut.',
    },
    confirmed: {
      preheader: (slot, date) => `Wizyta potwierdzona — ${date}, ${slot}. Do zobaczenia w warsztacie.`,
      subject: 'Wizyta potwierdzona',
      eyebrow: 'WIZYTA POTWIERDZONA',
      sectionNumber: '01',
      slotEyebrow: null,
      headline: 'Do zobaczenia.',
      intro: (name) => `${name}, Twoja wizyta jest potwierdzona. Termin i szczegóły poniżej.`,
      infoCardTitle: 'DODAJ DO KALENDARZA',
      infoCardBody: 'Plik .ics dołączony do tej wiadomości; otwórz go na telefonie lub w kalendarzu.',
      needToChangeTitle: 'Coś się zmieniło?',
      needToChangeBody: 'Zadzwoń bezpośrednio do barbershopu. Załatwimy to człowiek z człowiekiem.',
      showOnArrival: 'Przy wejściu wystarczy podać imię. Zalecamy być 5 minut przed czasem.',
      footerLegal: 'Otrzymujesz tę wiadomość, ponieważ została potwierdzona Twoja rezerwacja w Off Cut.',
    },
  },
  en: {
    subjectPrefix: 'Off Cut',
    labels: {
      barber: 'BARBER',
      service: 'SERVICE',
      duration: 'DURATION',
      price: 'PRICE',
      date: 'DATE',
      time: 'TIME',
      address: 'ADDRESS',
    },
    durationSuffix: 'min',
    priceSuffix: 'PLN',
    callCta: 'CALL THE SHOP',
    mapCta: 'OPEN MAP',
    walkInNote: 'Arriving more than 10 minutes late may shorten the appointment.',
    footerTagline: 'EST. 2019 — PREMIUM GROOMING — SZCZECIN',
    bookingNumber: (id) => `BOOKING #${id}`,
    received: {
      preheader: (slot, date) => `Booking received — ${date}, ${slot}. Waiting for the barber to confirm.`,
      subject: 'Booking received',
      eyebrow: 'BOOKING RECEIVED',
      sectionNumber: '00',
      slotEyebrow: 'AWAITING CONFIRMATION',
      headline: 'Noted.',
      intro: (name) => `${name}, we have your booking. The barber confirms slots within a few hours. A second email will follow with a calendar file and the full confirmation.`,
      infoCardTitle: 'WHAT NEXT',
      infoCardBody: 'We are waiting for the barber to confirm. The .ics calendar email follows right after.',
      needToChangeTitle: 'Mistake?',
      needToChangeBody: 'Call us if you need to change anything before we confirm.',
      showOnArrival: 'We are holding the slot for you. A second email follows when the barber confirms.',
      footerLegal: 'You are receiving this because a booking request was submitted at Off Cut.',
    },
    confirmed: {
      preheader: (slot, date) => `Appointment confirmed — ${date}, ${slot}. See you at the workshop.`,
      subject: 'Appointment confirmed',
      eyebrow: 'APPOINTMENT CONFIRMED',
      sectionNumber: '01',
      slotEyebrow: null,
      headline: 'See you soon.',
      intro: (name) => `${name}, your appointment is confirmed. Details below.`,
      infoCardTitle: 'ADD TO CALENDAR',
      infoCardBody: 'The .ics file is attached; open it on your phone or in your calendar app.',
      needToChangeTitle: 'Something changed?',
      needToChangeBody: 'Call the shop directly. We sort it human to human.',
      showOnArrival: 'Just give your name at the door. We recommend arriving 5 minutes early.',
      footerLegal: 'You are receiving this because a booking under this address has been confirmed at Off Cut.',
    },
  },
};

// ── Inline style tokens (kept tight so client renderers don't strip them).
const PAPER = '#f5f3ef';
const PAPER_STRONG = '#fcfaf6';
const INK = '#0a0a0a';
const INK_WEAK = '#4a463f';
const TEXT_MUTED_LIGHT = '#7a766f';
const TEXT_MUTED_DARK = '#b3afa8';
const LINE_PAPER = '#ddd9d0';
const LINE_PAPER_SOFT = '#e8e5df';
const LINE_INK = '#1a1a1a';
// Off Cut's live accent: baby blue. Source of truth is src/index.css
// (--color-accent: #8FD9FB). Used on the hero rule, the slot time stamp,
// the primary CTA fill and the phone-number underline in section 02.
const ACCENT = '#8FD9FB';
const ACCENT_HOVER = '#A8E1FC';
const ACCENT_GLOW = 'rgba(143,217,251,0.45)';

const DISPLAY_STACK = "'Bebas Neue', 'Oswald', 'Impact', 'Arial Narrow', sans-serif";
const BODY_STACK = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";

function buildPlainText(booking, lang, state) {
  const t = T[lang];
  const s = t[state];
  const svc = pickServiceName(booking, lang);
  const longDate = formatLongDate(booking.date, lang);
  const lines = [
    `OFF CUT — ${s.subject.toUpperCase()}`,
    '',
    s.intro(booking.customer_name),
    '',
    `${t.labels.barber}: ${booking.barber_name}`,
    `${t.labels.service}: ${svc}`,
    `${t.labels.date}: ${longDate}`,
    `${t.labels.time}: ${booking.slot} (${booking.duration_min} ${t.durationSuffix})`,
    booking.service_price_pln ? `${t.labels.price}: ${booking.service_price_pln} ${t.priceSuffix}` : null,
    '',
    `${t.labels.address}: ${ADDRESS_LINE}`,
    `${MAP_URL}`,
    '',
    `${s.needToChangeTitle}`,
    `${s.needToChangeBody}`,
    `${PHONE_DISPLAY}`,
    '',
    s.showOnArrival,
    '',
    '— Off Cut, Szczecin',
    t.footerTagline,
  ].filter((line) => line !== null);
  return lines.join('\n');
}

function buildHtml(booking, lang, state, { wordmarkMode = 'cid' } = {}) {
  const t = T[lang];
  const s = t[state];
  const isConfirmed = state === 'confirmed';
  // Resolve wordmark refs. CID for real mail (Resend attaches the PNGs),
  // data: URL for static HTML previews so the same image appears on disk.
  const dataUrls = wordmarkMode === 'data' ? loadWordmarkDataUrls() : null;
  const wordmarkDarkSrc = wordmarkMode === 'data'
    ? (dataUrls?.dark ?? '')
    : `cid:${WORDMARK_DARK_CID}`;
  const wordmarkLightSrc = wordmarkMode === 'data'
    ? (dataUrls?.light ?? '')
    : `cid:${WORDMARK_LIGHT_CID}`;
  const svc = pickServiceName(booking, lang);
  const longDate = formatLongDate(booking.date, lang);
  const heroDate = formatHeroDate(booking.date, lang);
  const customerName = escapeHtml(booking.customer_name);
  const barberName = escapeHtml(booking.barber_name);
  const serviceName = escapeHtml(svc);
  const slot = escapeHtml(booking.slot);
  const duration = `${booking.duration_min} ${t.durationSuffix}`;
  const price = booking.service_price_pln ? `${booking.service_price_pln} ${t.priceSuffix}` : null;
  const preheader = escapeHtml(s.preheader(booking.slot, longDate));
  const bookingNumberLabel = escapeHtml(t.bookingNumber(booking.id));
  // Slot lights up only when the booking is confirmed. On received state the
  // slot stays in paper-strong so the "00 / ZGŁOSZONE" eyebrow reads as
  // not-yet-active. The colour shift between mail #1 and mail #2 is the
  // visual story of the booking lifecycle.
  const slotColor = isConfirmed ? ACCENT : PAPER_STRONG;
  const sectionTwoEyebrow = lang === 'pl' ? 'ZMIANA' : 'CHANGES';

  // Detail row — workshop tag layout: small uppercase label on the left,
  // value in larger body type on the right, hairline rule beneath.
  const detailRow = (label, value, opts = {}) => `
    <tr>
      <td style="padding:14px 0 14px 0;border-bottom:1px solid ${LINE_PAPER_SOFT};font-family:${BODY_STACK};font-size:11px;letter-spacing:0.25em;text-transform:uppercase;color:${TEXT_MUTED_LIGHT};font-weight:500;width:38%;vertical-align:top;" align="left">${escapeHtml(label)}</td>
      <td style="padding:14px 0 14px 0;border-bottom:1px solid ${LINE_PAPER_SOFT};font-family:${BODY_STACK};font-size:15px;line-height:1.5;color:${INK};font-weight:400;letter-spacing:0.01em;vertical-align:top;" align="right">${opts.allowHtml ? value : escapeHtml(value)}</td>
    </tr>`;

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="${lang}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="color-scheme" content="light only" />
  <meta name="supported-color-schemes" content="light" />
  <title>${escapeHtml(`${t.subjectPrefix} — ${t.subjectConfirmed}`)}</title>
  <!--[if mso]>
  <style>
    .display { font-family: 'Arial Narrow', Impact, sans-serif !important; }
    .body    { font-family: Helvetica, Arial, sans-serif !important; }
  </style>
  <![endif]-->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600&display=swap');
    body { margin:0 !important; padding:0 !important; background:${PAPER}; }
    .display { font-family: ${DISPLAY_STACK}; }
    .body    { font-family: ${BODY_STACK}; }
    a { text-decoration: none; color: inherit; }
    .btn-primary:hover { background:${ACCENT_HOVER} !important; }
    .btn-ghost:hover { color:${INK} !important; border-color:${INK} !important; }
    @media (max-width:600px) {
      .container { width:100% !important; }
      .pad-x { padding-left:24px !important; padding-right:24px !important; }
      .hero-date { font-size:44px !important; line-height:1 !important; }
      .hero-headline { font-size:64px !important; line-height:0.92 !important; }
      .stack-btns td { display:block !important; width:100% !important; padding:0 0 12px 0 !important; }
      .stack-btns a { display:block !important; width:100% !important; box-sizing:border-box !important; }
    }
  </style>
</head>
<body class="body" style="margin:0;padding:0;background:${PAPER};-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;">

  <!-- Preheader (hidden, shown in inbox preview) -->
  <div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;color:${PAPER};">${preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>

  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="${PAPER}" style="background:${PAPER};">
    <tr>
      <td align="center" style="padding:32px 16px 48px 16px;">

        <!-- ─── Container ─────────────────────────────────────────── -->
        <table role="presentation" class="container" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;max-width:600px;background:${PAPER};">

          <!-- ─── Wordmark row ─── -->
          <tr>
            <td class="pad-x" style="padding:0 8px 24px 8px;font-family:${BODY_STACK};font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:${TEXT_MUTED_LIGHT};font-weight:500;" align="left">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td align="left" valign="middle" style="line-height:0;">
                    <img src="${wordmarkDarkSrc}" alt="Off Cut" width="180" height="40" style="display:block;border:0;outline:none;text-decoration:none;height:40px;width:180px;max-width:180px;" />
                  </td>
                  <td align="right" valign="middle" style="font-family:${BODY_STACK};font-size:10px;letter-spacing:0.3em;color:${TEXT_MUTED_LIGHT};font-weight:500;text-transform:uppercase;">${bookingNumberLabel}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ─── INK BAND (hero) ─── -->
          <tr>
            <td bgcolor="${INK}" style="background:${INK};padding:0;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="${INK}" style="background:${INK};">
                <tr>
                  <td class="pad-x" style="padding:52px 48px 48px 48px;">

                    <!-- Section number row -->
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td align="left" style="font-family:${BODY_STACK};font-size:10px;letter-spacing:0.35em;text-transform:uppercase;color:${TEXT_MUTED_DARK};font-weight:500;padding:0 0 6px 0;">${s.sectionNumber} / ${escapeHtml(s.eyebrow)}</td>
                      </tr>
                      <tr>
                        <td align="left" style="padding:0 0 32px 0;line-height:0;">
                          <!-- Orange foreman-mark rule (the only accent) -->
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                            <tr><td height="2" bgcolor="${ACCENT}" style="background:${ACCENT};font-size:0;line-height:0;width:48px;">&nbsp;</td></tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- Hero lockup -->
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td align="left" class="display hero-headline" style="font-family:${DISPLAY_STACK};font-size:84px;line-height:0.88;letter-spacing:0.02em;color:${PAPER_STRONG};font-weight:400;text-transform:uppercase;padding:0 0 28px 0;">${escapeHtml(s.headline)}</td>
                      </tr>
                      <tr>
                        <td align="left" class="display hero-date" style="font-family:${DISPLAY_STACK};font-size:54px;line-height:1;letter-spacing:0.04em;color:${PAPER_STRONG};font-weight:400;text-transform:uppercase;padding:0 0 6px 0;">${escapeHtml(heroDate)}</td>
                      </tr>
                      <tr>
                        <td align="left" class="display" style="font-family:${DISPLAY_STACK};font-size:54px;line-height:1;letter-spacing:0.06em;color:${slotColor};font-weight:400;text-transform:uppercase;padding:0 0 0 0;">${slot}</td>
                      </tr>
                      ${s.slotEyebrow ? `<tr>
                        <td align="left" style="font-family:${BODY_STACK};font-size:10px;letter-spacing:0.35em;text-transform:uppercase;color:${TEXT_MUTED_DARK};font-weight:500;padding:14px 0 0 0;">${escapeHtml(s.slotEyebrow)}</td>
                      </tr>` : ''}
                    </table>

                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ─── Body card on paper ─── -->
          <tr>
            <td bgcolor="${PAPER}" style="background:${PAPER};padding:0;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="${PAPER}" style="background:${PAPER};">
                <tr>
                  <td class="pad-x" style="padding:40px 48px 8px 48px;font-family:${BODY_STACK};font-size:15px;line-height:1.7;color:${INK_WEAK};font-weight:300;letter-spacing:0.01em;">
                    ${escapeHtml(s.intro(customerName))}
                  </td>
                </tr>

                <!-- Detail table -->
                <tr>
                  <td class="pad-x" style="padding:24px 48px 12px 48px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-top:1px solid ${LINE_PAPER};">
                      ${detailRow(t.labels.barber, barberName, { allowHtml: true })}
                      ${detailRow(t.labels.service, serviceName, { allowHtml: true })}
                      ${detailRow(t.labels.date, longDate)}
                      ${detailRow(t.labels.time, `${booking.slot}  ·  ${duration}`)}
                      ${price ? detailRow(t.labels.price, price) : ''}
                      ${detailRow(t.labels.address, `${escapeHtml(ADDRESS_LINE)}<br/><span style="font-family:${BODY_STACK};font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:${TEXT_MUTED_LIGHT};">Szczecin</span>`, { allowHtml: true })}
                    </table>
                  </td>
                </tr>

                <!-- CTAs -->
                <tr>
                  <td class="pad-x" style="padding:32px 48px 8px 48px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" class="stack-btns">
                      <tr>
                        <td align="left" style="padding:0 10px 0 0;">
                          <!--[if mso]>
                          <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${MAP_URL}" style="height:44px;v-text-anchor:middle;width:180px;" arcsize="50%" strokecolor="${INK}" fillcolor="${PAPER_STRONG}">
                            <w:anchorlock/>
                            <center style="color:${INK};font-family:Helvetica,Arial,sans-serif;font-size:11px;font-weight:600;letter-spacing:0.25em;text-transform:uppercase;">${escapeHtml(t.mapCta)}</center>
                          </v:roundrect>
                          <![endif]-->
                          <!--[if !mso]><!-- -->
                          <a href="${MAP_URL}" target="_blank" class="btn-ghost" style="display:inline-block;font-family:${BODY_STACK};font-size:11px;letter-spacing:0.25em;text-transform:uppercase;color:${INK};font-weight:600;background:${PAPER_STRONG};border:1px solid ${INK};padding:14px 26px;border-radius:999px;mso-line-height-rule:exactly;">${escapeHtml(t.mapCta)}</a>
                          <!--<![endif]-->
                        </td>
                        <td align="left" style="padding:0;">
                          <!--[if mso]>
                          <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="tel:${PHONE_TEL}" style="height:44px;v-text-anchor:middle;width:260px;" arcsize="50%" strokecolor="${ACCENT}" fillcolor="${ACCENT}">
                            <w:anchorlock/>
                            <center style="color:${INK};font-family:Helvetica,Arial,sans-serif;font-size:11px;font-weight:600;letter-spacing:0.25em;text-transform:uppercase;">${escapeHtml(t.callCta)} ${escapeHtml(PHONE_DISPLAY)}</center>
                          </v:roundrect>
                          <![endif]-->
                          <!--[if !mso]><!-- -->
                          <a href="tel:${PHONE_TEL}" target="_blank" class="btn-primary" style="display:inline-block;font-family:${BODY_STACK};font-size:11px;letter-spacing:0.25em;text-transform:uppercase;color:${INK};font-weight:600;background:${ACCENT};border:1px solid ${ACCENT};padding:14px 26px;border-radius:999px;box-shadow:0 0 22px 4px ${ACCENT_GLOW};mso-line-height-rule:exactly;">${escapeHtml(t.callCta)} ${escapeHtml(PHONE_DISPLAY)}</a>
                          <!--<![endif]-->
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Info card (state-aware): on received this is the
                     "what next" explainer; on confirmed it points at the
                     attached .ics. Same shell, different copy. -->
                <tr>
                  <td class="pad-x" style="padding:28px 48px 0 48px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border:1px solid ${LINE_PAPER};background:${PAPER_STRONG};">
                      <tr>
                        <td style="padding:18px 22px 18px 22px;font-family:${BODY_STACK};font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:${TEXT_MUTED_LIGHT};font-weight:500;">${escapeHtml(s.infoCardTitle)}</td>
                      </tr>
                      <tr>
                        <td style="padding:0 22px 18px 22px;font-family:${BODY_STACK};font-size:13px;line-height:1.6;color:${INK_WEAK};font-weight:300;letter-spacing:0.01em;">${escapeHtml(s.infoCardBody)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Need-to-change block -->
                <tr>
                  <td class="pad-x" style="padding:36px 48px 0 48px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="padding:0 0 8px 0;font-family:${BODY_STACK};font-size:10px;letter-spacing:0.35em;text-transform:uppercase;color:${TEXT_MUTED_LIGHT};font-weight:500;">02 / ${sectionTwoEyebrow}</td>
                      </tr>
                      <tr>
                        <td class="display" style="font-family:${DISPLAY_STACK};font-size:28px;line-height:1.05;letter-spacing:0.04em;color:${INK};font-weight:400;text-transform:uppercase;padding:0 0 12px 0;">${escapeHtml(s.needToChangeTitle)}</td>
                      </tr>
                      <tr>
                        <td style="font-family:${BODY_STACK};font-size:14px;line-height:1.7;color:${INK_WEAK};font-weight:300;letter-spacing:0.01em;padding:0 0 18px 0;">${escapeHtml(s.needToChangeBody)}</td>
                      </tr>
                      <tr>
                        <td style="font-family:${BODY_STACK};font-size:11px;letter-spacing:0.25em;text-transform:uppercase;color:${INK};font-weight:600;padding:0 0 0 0;"><a href="tel:${PHONE_TEL}" style="color:${INK};text-decoration:none;border-bottom:1px solid ${ACCENT};padding-bottom:2px;">${escapeHtml(PHONE_DISPLAY)}</a></td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Closing notes -->
                <tr>
                  <td class="pad-x" style="padding:36px 48px 8px 48px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-top:1px solid ${LINE_PAPER};">
                      <tr>
                        <td style="padding:20px 0 6px 0;font-family:${BODY_STACK};font-size:13px;line-height:1.6;color:${INK_WEAK};font-weight:300;letter-spacing:0.01em;">${escapeHtml(s.showOnArrival)}</td>
                      </tr>
                      <tr>
                        <td style="padding:0 0 0 0;font-family:${BODY_STACK};font-size:12px;line-height:1.6;color:${TEXT_MUTED_LIGHT};font-weight:300;letter-spacing:0.01em;">${escapeHtml(t.walkInNote)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- ─── Footer ink band ─── -->
          <tr>
            <td bgcolor="${INK}" style="background:${INK};padding:0;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="${INK}" style="background:${INK};">
                <tr>
                  <td class="pad-x" style="padding:36px 48px 12px 48px;border-top:1px solid ${LINE_INK};">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td align="left" valign="middle" style="line-height:0;">
                          <img src="${wordmarkLightSrc}" alt="Off Cut" width="150" height="34" style="display:block;border:0;outline:none;text-decoration:none;height:34px;width:150px;max-width:150px;" />
                        </td>
                        <td align="right" valign="middle" style="font-family:${BODY_STACK};font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:${TEXT_MUTED_DARK};font-weight:500;">${escapeHtml(t.footerTagline)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td class="pad-x" style="padding:18px 48px 36px 48px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td align="left" style="font-family:${BODY_STACK};font-size:12px;line-height:1.6;color:${TEXT_MUTED_DARK};font-weight:300;letter-spacing:0.02em;">
                          ${escapeHtml(ADDRESS_LINE)}<br/>
                          <a href="tel:${PHONE_TEL}" style="color:${TEXT_MUTED_DARK};text-decoration:none;">${escapeHtml(PHONE_DISPLAY)}</a>
                        </td>
                        <td align="right" style="font-family:${BODY_STACK};font-size:11px;letter-spacing:0.25em;text-transform:uppercase;color:${TEXT_MUTED_DARK};font-weight:500;">
                          <a href="${SITE_URL}" style="color:${TEXT_MUTED_DARK};text-decoration:none;">Off&nbsp;Cut</a>&nbsp;&nbsp;·&nbsp;&nbsp;
                          <a href="${INSTAGRAM_URL}" style="color:${TEXT_MUTED_DARK};text-decoration:none;">IG</a>&nbsp;&nbsp;·&nbsp;&nbsp;
                          <a href="${FACEBOOK_URL}" style="color:${TEXT_MUTED_DARK};text-decoration:none;">FB</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td class="pad-x" style="padding:0 48px 28px 48px;font-family:${BODY_STACK};font-size:10px;line-height:1.6;color:#5e5a54;font-weight:300;letter-spacing:0.05em;" align="left">
                    ${escapeHtml(s.footerLegal)}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>`;
}

function buildEmail(booking, state, opts = {}) {
  const lang = booking.lang === 'en' ? 'en' : 'pl';
  const t = T[lang];
  const s = t[state];
  const longDate = formatLongDate(booking.date, lang);
  const subject = `${t.subjectPrefix} · ${s.subject} — ${longDate}, ${booking.slot}`;
  return {
    subject,
    html: buildHtml(booking, lang, state, opts),
    text: buildPlainText(booking, lang, state),
  };
}

export function buildConfirmationEmail(booking, opts = {}) {
  const lang = booking.lang === 'en' ? 'en' : 'pl';
  const out = buildEmail(booking, 'confirmed', opts);
  const summary = lang === 'en'
    ? `Off Cut — ${pickServiceName(booking, 'en')} with ${booking.barber_name}`
    : `Off Cut — ${pickServiceName(booking, 'pl')} u ${booking.barber_name}`;
  const description = lang === 'en'
    ? `Barber: ${booking.barber_name}\nService: ${pickServiceName(booking, 'en')}\nDuration: ${booking.duration_min} min\nAddress: ${ADDRESS_LINE}\nPhone: ${PHONE_DISPLAY}`
    : `Barber: ${booking.barber_name}\nUsługa: ${pickServiceName(booking, 'pl')}\nCzas: ${booking.duration_min} min\nAdres: ${ADDRESS_LINE}\nTelefon: ${PHONE_DISPLAY}`;
  return {
    ...out,
    icsSummary: summary,
    icsDescription: description,
    icsLocation: ADDRESS_LINE,
  };
}

export function buildReceivedEmail(booking, opts = {}) {
  return buildEmail(booking, 'received', opts);
}

export { ADDRESS_LINE, PHONE_DISPLAY };
