// Off Cut booking confirmation email.
//
// Brand register (see DESIGN.md): paper #f5f3ef + ink #0a0a0a + a single
// baby-blue #8FD9FB accent. Bebas Neue for display via Google Fonts
// (Apple Mail / Gmail render it; Outlook desktop falls back to a condensed
// system stack and still reads industrial). Hairlines render as 1px in mail
// clients, so the brand line color carries the workshop-tag detail.
//
// The OFF CUT wordmark itself is rendered in Let Me Ride (the brand's custom
// stencil face) and shipped as an inline PNG attachment with a known CID -
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

// Wordmark images are served as hosted PNGs at <SITE>/email/wordmark-*.png.
// Gmail strips `cid:` references that aren't perfectly multipart/related, so
// hosted HTTPS URLs are the only reliable cross-client approach. The PNGs
// live in `public/email/` (committed) and Vite copies them into `dist/email/`
// at build time; fastify-static serves them in production. Override via
// MAIL_ASSETS_BASE_URL if a CDN is added later.
function wordmarkBaseUrl() {
  return process.env.MAIL_ASSETS_BASE_URL ?? `${SITE_URL}/email`;
}

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

// Notification format - full day name capitalized + DD.MM (PL) or DD MMM (EN).
// Lives on the second visible line of the inbox / iOS notification, paired
// with the slot time. Examples: "Piątek 29.05" (PL), "Friday 29 May" (EN).
const MONTHS_SHORT_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function capFirst(s) {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}

function formatShortDate(iso, lang) {
  const { m, d, dow } = parts(iso);
  if (lang === 'en') return `${DOW_EN[dow]} ${d} ${MONTHS_SHORT_EN[m - 1]}`;
  const dd = String(d).padStart(2, '0');
  const mm = String(m).padStart(2, '0');
  return `${capFirst(DOW_PL[dow])} ${dd}.${mm}`;
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
    footerTagline: 'EST. 2019 - PREMIUM GROOMING - SZCZECIN',
    bookingNumber: (id) => `REZERWACJA #${id}`,
    received: {
      subjectStatus: 'Wizyta zapisana',
      eyebrow: 'ZGŁOSZENIE OTRZYMANE',
      sectionNumber: '00',
      slotEyebrow: 'OCZEKUJE NA POTWIERDZENIE',
      headline: 'Zanotowane.',
      intro: (name) => `${name}, mamy Twoje zgłoszenie. Barber zatwierdzi termin w ciągu kilku miunt. Wtedy dostaniesz drugą wiadomość z pełnym potwierdzeniem.`,
      infoCardTitle: 'CO DALEJ',
      infoCardBody: 'Czekamy aż barber zatwierdzi termin. Mail z plikiem .ics przyjdzie zaraz po tym.',
      needToChangeTitle: 'Pomyłka?',
      needToChangeBody: 'Zadzwoń, jeśli chcesz coś zmienić zanim termin zostanie zatwierdzony.',
      showOnArrival: 'Trzymamy dla Ciebie termin. Po potwierdzeniu dostaniesz drugi mail.',
      footerLegal: 'Otrzymujesz tę wiadomość, ponieważ złożono zgłoszenie rezerwacji w Off Cut.',
    },
    confirmed: {
      subjectStatus: 'Wizyta potwierdzona',
      eyebrow: 'WIZYTA POTWIERDZONA',
      sectionNumber: '01',
      slotEyebrow: null,
      headline: 'Do zobaczenia.',
      intro: (name) => `${name}, Twoja wizyta została potwierdzona. Termin i szczegóły poniżej.`,
      infoCardTitle: 'DODAJ DO KALENDARZA',
      infoCardBody: 'Plik .ics dołączony do tej wiadomości; otwórz go na telefonie lub w kalendarzu.',
      needToChangeTitle: 'Coś się zmieniło?',
      needToChangeBody: 'Zadzwoń do nas bezpośrednio.',
      showOnArrival: 'Zalecamy być 5 minut przed czasem.',
      footerLegal: 'Otrzymujesz tę wiadomość, ponieważ została potwierdzona Twoja rezerwacja w Off Cut.',
    },
    rescheduled: {
      subjectStatus: 'Wizyta przełożona',
      eyebrow: 'WIZYTA PRZENIESIONA',
      sectionNumber: '02',
      slotEyebrow: null,
      headline: 'Nowy termin.',
      intro: (name) => `${name}, Twoja wizyta została przełożona na nowy termin. Pełne szczegóły poniżej.`,
      infoCardTitle: 'ZAKTUALIZUJ KALENDARZ',
      infoCardBody: 'Załączony plik .ics zaktualizuje istniejący wpis w Twoim kalendarzu na nowy termin - wystarczy go otworzyć.',
      needToChangeTitle: 'Coś się zmieniło?',
      needToChangeBody: 'Zadzwoń do nas bezpośrednio.',
      showOnArrival: 'Zalecamy być 5 minut przed czasem.',
      footerLegal: 'Otrzymujesz tę wiadomość, ponieważ Twoja rezerwacja w Off Cut została przełożona na nowy termin.',
    },
    cancelled: {
      subjectStatus: 'Wizyta anulowana',
      eyebrow: 'WIZYTA ANULOWANA',
      sectionNumber: '03',
      slotEyebrow: 'TERMIN ZWOLNIONY',
      headline: 'Do następnego razu.',
      intro: (name) => `${name}, Twoja wizyta została anulowana. Termin został zwolniony. Jeśli chcesz umówić się ponownie - zadzwoń lub zarezerwuj online.`,
      infoCardTitle: 'CHCESZ UMÓWIĆ SIĘ PONOWNIE?',
      infoCardBody: 'Zarezerwuj nowy termin na off-cut.pl lub zadzwoń. Załączony plik .ics usuwa anulowaną wizytę z Twojego kalendarza.',
      needToChangeTitle: 'Pomyłka?',
      needToChangeBody: 'Jeśli anulowanie było błędem, zadzwoń od razu - w miarę możliwości przywrócimy ten sam termin.',
      showOnArrival: 'Czekamy na Ciebie następnym razem.',
      footerLegal: 'Otrzymujesz tę wiadomość, ponieważ Twoja rezerwacja w Off Cut została anulowana.',
    },
  },
  en: {
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
    footerTagline: 'EST. 2019 - PREMIUM GROOMING - SZCZECIN',
    bookingNumber: (id) => `BOOKING #${id}`,
    received: {
      subjectStatus: 'Booking saved',
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
      subjectStatus: 'Booking confirmed',
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
    rescheduled: {
      subjectStatus: 'Booking rescheduled',
      eyebrow: 'APPOINTMENT RESCHEDULED',
      sectionNumber: '02',
      slotEyebrow: null,
      headline: 'New date.',
      intro: (name) => `${name}, your appointment has been moved to a new time. The previous slot no longer applies - full details below.`,
      infoCardTitle: 'UPDATE YOUR CALENDAR',
      infoCardBody: 'The attached .ics file will update your existing calendar entry to the new time - just open it.',
      needToChangeTitle: 'Something changed?',
      needToChangeBody: 'Call the shop directly. We sort it human to human.',
      showOnArrival: 'Just give your name at the door. We recommend arriving 5 minutes early.',
      footerLegal: 'You are receiving this because your booking at Off Cut has been moved to a new time.',
    },
    cancelled: {
      subjectStatus: 'Booking cancelled',
      eyebrow: 'APPOINTMENT CANCELLED',
      sectionNumber: '03',
      slotEyebrow: 'SLOT RELEASED',
      headline: 'Until next time.',
      intro: (name) => `${name}, your appointment has been cancelled and the slot is now released. To book again - call us or reserve online.`,
      infoCardTitle: 'WANT TO BOOK AGAIN?',
      infoCardBody: 'Reserve a new slot at off-cut.pl or give us a call. The attached .ics file removes the cancelled appointment from your calendar.',
      needToChangeTitle: 'Mistake?',
      needToChangeBody: 'If this cancellation was an accident, call right away - we will try to restore the same slot.',
      showOnArrival: 'See you next time.',
      footerLegal: 'You are receiving this because your booking at Off Cut has been cancelled.',
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

// Invisible padding appended to the preheader so Gmail / Apple Mail run out
// of preview budget inside the hidden block instead of pulling body content
// ("Zanotowane. PIĄTEK 29 MAJA 16:30 OCZEKUJE NA …") into the inbox preview.
//
// `&nbsp;` alone collapses to a single space in some extractors; alternating
// with `&zwnj;` (zero-width non-joiner, U+200C) and `&#847;` (combining
// grapheme joiner, U+034F) gives each triplet 3 "real" Unicode codepoints
// that don't collapse, while still being invisible to the human eye. We need
// to overflow Gmail iOS's preview budget (~120 visible chars) so 180 triplets
// = ~540 codepoints, comfortably beyond what any known mobile client samples.
const PREHEADER_PADDING = '&zwnj;&nbsp;&#847;'.repeat(180);

function buildPlainText(booking, lang, state, { oldBooking = null } = {}) {
  const t = T[lang];
  const s = t[state];
  const svc = pickServiceName(booking, lang);
  const longDate = formatLongDate(booking.date, lang);
  const previouslyLine = (state === 'rescheduled' && oldBooking)
    ? (lang === 'en'
      ? `PREVIOUSLY: ${formatLongDate(oldBooking.date, lang)}, ${oldBooking.slot}`
      : `PRZENIESIONO Z: ${formatLongDate(oldBooking.date, lang)}, ${oldBooking.slot}`)
    : null;
  const lines = [
    `OFF CUT · ${s.subjectStatus.toUpperCase()}`,
    `${longDate}, ${booking.slot} · ${svc}`,
    previouslyLine,
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
    '- Off Cut, Szczecin',
    t.footerTagline,
  ].filter((line) => line !== null);
  return lines.join('\n');
}

function buildHtml(booking, lang, state, { wordmarkMode = 'url', oldBooking = null } = {}) {
  const t = T[lang];
  const s = t[state];
  // Slot lights up in ACCENT once the appointment is "active" - both the
  // initial confirmation and any subsequent reschedule represent a slot the
  // customer can show up at. Received still shows paper-strong (not yet
  // active).
  const isActive = state === 'confirmed' || state === 'rescheduled';
  // Cancelled emails reshape the body card: "Pomyłka?" jumps above the
  // details (so a misclick can be corrected at a glance) and the map CTA
  // is suppressed entirely (there's nothing to show up to).
  const isCancelled = state === 'cancelled';
  // Resolve wordmark refs. Three modes:
  //   'url'  - hosted HTTPS image (production default; works in Gmail/Apple/Outlook)
  //   'data' - base64 data URL so file:// HTML previews render off disk
  //   'cid'  - inline CID attachment (legacy; Gmail strips broken cid: refs)
  const dataUrls = wordmarkMode === 'data' ? loadWordmarkDataUrls() : null;
  const base = wordmarkBaseUrl();
  const resolveWordmark = (which) => {
    if (wordmarkMode === 'data') {
      return dataUrls?.[which] ?? '';
    }
    if (wordmarkMode === 'cid') {
      return `cid:${which === 'dark' ? WORDMARK_DARK_CID : WORDMARK_LIGHT_CID}`;
    }
    return `${base}/wordmark-${which}.png`;
  };
  const wordmarkDarkSrc = resolveWordmark('dark');
  const wordmarkLightSrc = resolveWordmark('light');
  const svc = pickServiceName(booking, lang);
  const longDate = formatLongDate(booking.date, lang);
  const heroDate = formatHeroDate(booking.date, lang);
  const customerName = escapeHtml(booking.customer_name);
  const barberName = escapeHtml(booking.barber_name);
  const serviceName = escapeHtml(svc);
  const slot = escapeHtml(booking.slot);
  const duration = `${booking.duration_min} ${t.durationSuffix}`;
  const price = booking.service_price_pln ? `${booking.service_price_pln} ${t.priceSuffix}` : null;
  // Preheader carries date + time on line 1 and the service name on line 2
  // so the iOS / Gmail notification reads as a three-line stack:
  //   Off Cut · Wizyta zapisana        <- subject
  //   Piątek 29.05, 16:30              <- preheader line 1
  //   Trymowanie Brody                 <- preheader line 2
  // `<br/>` inside a single hidden div is stripped by Gmail iOS - it joins
  // the two segments with a space. The only reliable cross-client way to
  // force the line break is to render each segment as its own display:none
  // block, which extractors treat as a paragraph boundary. See the two
  // `preheader-segment` divs further down in the template.
  const preheaderLine1 = escapeHtml(`${formatShortDate(booking.date, lang)}, ${booking.slot}`);
  const preheaderLine2 = escapeHtml(svc);
  // Slot lights up only when the booking is "active" (confirmed OR
  // rescheduled). On received state the slot stays in paper-strong so the
  // "00 / ZGŁOSZONE" eyebrow reads as not-yet-active. The colour shift
  // between mail #1 and mail #2/#3 is the visual story of the booking
  // lifecycle.
  const slotColor = isActive ? ACCENT : PAPER_STRONG;

  // For the reschedule mail, the eyebrow under the slot carries the visual
  // diff: "PRZENIESIONO Z: <old long date>, <old slot>". For other states
  // we use the static slotEyebrow defined in the copy table.
  let slotEyebrowText = s.slotEyebrow;
  if (state === 'rescheduled' && oldBooking) {
    const oldLong = formatLongDate(oldBooking.date, lang);
    slotEyebrowText = lang === 'en'
      ? `PREVIOUSLY: ${oldLong}, ${oldBooking.slot}`
      : `PRZENIESIONO Z: ${oldLong}, ${oldBooking.slot}`;
  }

  // Detail row - workshop tag layout: small uppercase label on the left,
  // value in larger body type on the right, hairline rule beneath.
  const detailRow = (label, value, opts = {}) => `
    <tr>
      <td style="padding:14px 0 14px 0;border-bottom:1px solid ${LINE_PAPER_SOFT};font-family:${BODY_STACK};font-size:11px;letter-spacing:0.25em;text-transform:uppercase;color:${TEXT_MUTED_LIGHT};font-weight:500;width:38%;vertical-align:top;" align="left">${escapeHtml(label)}</td>
      <td style="padding:14px 0 14px 0;border-bottom:1px solid ${LINE_PAPER_SOFT};font-family:${BODY_STACK};font-size:15px;line-height:1.5;color:${INK};font-weight:400;letter-spacing:0.01em;vertical-align:top;" align="right">${opts.allowHtml ? value : escapeHtml(value)}</td>
    </tr>`;

  // "Pomyłka? / Coś się zmieniło?" headline + body + ZADZWOŃ ghost button.
  // Rendered as a string so the cancelled email can hoist it above the
  // appointment details (a misclick on Anuluj should let the customer
  // undo immediately, without scrolling past a closed slot).
  const needToChangeBlock = `
                <tr>
                  <td class="pad-x" style="padding:36px 48px 0 48px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td class="display" style="font-family:${DISPLAY_STACK};font-size:28px;line-height:1.05;letter-spacing:0.04em;color:${INK};font-weight:400;text-transform:uppercase;padding:0 0 12px 0;">${escapeHtml(s.needToChangeTitle)}</td>
                      </tr>
                      <tr>
                        <td style="font-family:${BODY_STACK};font-size:14px;line-height:1.7;color:${INK_WEAK};font-weight:300;letter-spacing:0.01em;padding:0 0 18px 0;">${escapeHtml(s.needToChangeBody)}</td>
                      </tr>
                      <tr>
                        <td align="center" style="padding:0;text-align:center;">
                          <!--[if mso]>
                          <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="tel:${PHONE_TEL}" style="height:44px;v-text-anchor:middle;width:260px;" arcsize="50%" strokecolor="${INK}" fillcolor="${PAPER_STRONG}">
                            <w:anchorlock/>
                            <center style="color:${INK};font-family:Helvetica,Arial,sans-serif;font-size:11px;font-weight:600;letter-spacing:0.25em;text-transform:uppercase;">${escapeHtml(t.callCta)} ${escapeHtml(PHONE_DISPLAY)}</center>
                          </v:roundrect>
                          <![endif]-->
                          <!--[if !mso]><!-- -->
                          <a href="tel:${PHONE_TEL}" target="_blank" class="btn-ghost" style="display:inline-block;font-family:${BODY_STACK};font-size:11px;letter-spacing:0.25em;text-transform:uppercase;color:${INK};font-weight:600;background:${PAPER_STRONG};background-image:linear-gradient(${PAPER_STRONG},${PAPER_STRONG});border:1px solid ${INK};padding:14px 26px;border-radius:999px;mso-line-height-rule:exactly;">${escapeHtml(t.callCta)} ${escapeHtml(PHONE_DISPLAY)}</a>
                          <!--<![endif]-->
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>`;

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="${lang}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="color-scheme" content="light dark" />
  <meta name="supported-color-schemes" content="light dark" />
  <title>${escapeHtml(`Off Cut - ${s.subjectStatus}`)}</title>
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
    /* Dark-mode strategy: "paper card on ink canvas".
       The brand simply does not survive inversion - ink text on auto-inverted
       paper looks negative-photo broken. So we keep every element inside the
       600px card in its light-mode colors, but flip the outer body + the
       full-width wrapper table to ink. The result is a brand-correct paper
       card sitting on a dark canvas, which blends with Gmail's dark chrome
       and stops burning eyes at night.
       Specificity trick: table[width="100%"] is more specific than the
       generic [style*="background:#f5f3ef"] attribute selector so the outer
       wrapper darkens while the inner .container card stays paper. */
    @media (prefers-color-scheme: dark) {
      body, body[style] { background:${INK} !important; }
      table[width="100%"][bgcolor="${PAPER}"],
      table[width="100%"][style*="background:${PAPER}"] { background-color:${INK} !important; background:${INK} !important; }
      /* Re-pin every interior element to its light-mode value so partial
         auto-invert can't recolor them. */
      table.container,
      [bgcolor="${PAPER}"]:not([width="100%"]),
      [style*="background:${PAPER}"]:not([width="100%"]) { background-color:${PAPER} !important; background:${PAPER} !important; }
      [bgcolor="${PAPER_STRONG}"],
      [style*="background:${PAPER_STRONG}"] { background-color:${PAPER_STRONG} !important; background:${PAPER_STRONG} !important; }
      [bgcolor="${INK}"],
      [style*="background:${INK}"] { background-color:${INK} !important; background:${INK} !important; }
      [style*="color:${INK}"] { color:${INK} !important; }
      [style*="color:${INK_WEAK}"] { color:${INK_WEAK} !important; }
      [style*="color:${TEXT_MUTED_LIGHT}"] { color:${TEXT_MUTED_LIGHT} !important; }
      [style*="color:${PAPER}"] { color:${PAPER} !important; }
      [style*="color:${PAPER_STRONG}"] { color:${PAPER_STRONG} !important; }
      [style*="color:${TEXT_MUTED_DARK}"] { color:${TEXT_MUTED_DARK} !important; }
    }
    /* Gmail Android dark-mode hook - mirror of the @media block above. */
    [data-ogsc] body { background:${INK} !important; }
    [data-ogsc] table[width="100%"][bgcolor="${PAPER}"],
    [data-ogsc] table[width="100%"][style*="background:${PAPER}"] { background-color:${INK} !important; background:${INK} !important; }
    [data-ogsc] table.container,
    [data-ogsc] [bgcolor="${PAPER}"]:not([width="100%"]),
    [data-ogsc] [style*="background:${PAPER}"]:not([width="100%"]) { background-color:${PAPER} !important; background:${PAPER} !important; }
    [data-ogsc] [bgcolor="${PAPER_STRONG}"],
    [data-ogsc] [style*="background:${PAPER_STRONG}"] { background-color:${PAPER_STRONG} !important; background:${PAPER_STRONG} !important; }
    [data-ogsc] [bgcolor="${INK}"],
    [data-ogsc] [style*="background:${INK}"] { background-color:${INK} !important; background:${INK} !important; }
    [data-ogsc] [style*="color:${INK}"] { color:${INK} !important; }
    [data-ogsc] [style*="color:${INK_WEAK}"] { color:${INK_WEAK} !important; }
    [data-ogsc] [style*="color:${TEXT_MUTED_LIGHT}"] { color:${TEXT_MUTED_LIGHT} !important; }
    [data-ogsc] [style*="color:${PAPER}"] { color:${PAPER} !important; }
    [data-ogsc] [style*="color:${PAPER_STRONG}"] { color:${PAPER_STRONG} !important; }
    [data-ogsc] [style*="color:${TEXT_MUTED_DARK}"] { color:${TEXT_MUTED_DARK} !important; }
  </style>
</head>
<body class="body" style="margin:0;padding:0;background:${PAPER};-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;">
  <div style="max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:${PAPER};mso-hide:all;">${preheaderLine1}</div>
  <div style="max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:${PAPER};mso-hide:all;">${preheaderLine2}</div>
  <div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;color:${PAPER};">${PREHEADER_PADDING}</div>

  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="${PAPER}" style="background:${PAPER};">
    <tr>
      <td align="center" style="padding:32px 16px 48px 16px;">
        <table role="presentation" class="container" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;max-width:600px;background:${PAPER};background-image:linear-gradient(${PAPER},${PAPER});">
          <tr>
            <td class="pad-x" align="center" style="padding:8px 8px 28px 8px;text-align:center;">
              <img src="${wordmarkDarkSrc}" alt="Off Cut" width="260" height="60" style="display:inline-block;border:0;outline:none;text-decoration:none;height:60px;width:260px;max-width:260px;" />
            </td>
          </tr>
          <tr>
            <td bgcolor="${INK}" style="background:${INK};background-image:linear-gradient(${INK},${INK});padding:0;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="${INK}" style="background:${INK};background-image:linear-gradient(${INK},${INK});">
                <tr>
                  <td class="pad-x" style="padding:52px 48px 48px 48px;">

                    <!-- Section number row -->
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td align="left" style="padding:0 0 32px 0;line-height:0;">
                          <!-- Orange foreman-mark rule (the only accent) -->
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                            <tr><td height="2" bgcolor="${ACCENT}" style="background:${ACCENT};font-size:0;line-height:0;width:48px;">&nbsp;</td></tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td align="left" class="display hero-headline" style="font-family:${DISPLAY_STACK};font-size:84px;line-height:0.88;letter-spacing:0.02em;color:${PAPER_STRONG};font-weight:400;text-transform:uppercase;padding:0 0 28px 0;">${escapeHtml(s.headline)}</td>
                      </tr>
                      <tr>
                        <td align="left" class="display hero-date" style="font-family:${DISPLAY_STACK};font-size:54px;line-height:1;letter-spacing:0.04em;color:${PAPER_STRONG};font-weight:400;text-transform:uppercase;padding:0 0 6px 0;${isCancelled ? 'text-decoration:line-through;' : ''}">${escapeHtml(heroDate)}</td>
                      </tr>
                      <tr>
                        <td align="left" class="display" style="font-family:${DISPLAY_STACK};font-size:54px;line-height:1;letter-spacing:0.06em;color:${slotColor};font-weight:400;text-transform:uppercase;padding:0 0 0 0;${isCancelled ? 'text-decoration:line-through;' : ''}">${slot}</td>
                      </tr>
                      ${slotEyebrowText ? `<tr>
                        <td align="left" style="font-family:${BODY_STACK};font-size:10px;letter-spacing:0.35em;text-transform:uppercase;color:${TEXT_MUTED_DARK};font-weight:500;padding:14px 0 0 0;">${escapeHtml(slotEyebrowText)}</td>
                      </tr>` : ''}
                    </table>

                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td bgcolor="${PAPER}" style="background:${PAPER};background-image:linear-gradient(${PAPER},${PAPER});padding:0;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="${PAPER}" style="background:${PAPER};background-image:linear-gradient(${PAPER},${PAPER});">
                <tr>
                  <td class="pad-x" style="padding:40px 48px 8px 48px;font-family:${BODY_STACK};font-size:15px;line-height:1.7;color:${INK_WEAK};font-weight:300;letter-spacing:0.01em;">
                    ${escapeHtml(s.intro(customerName))}
                  </td>
                </tr>
                ${isCancelled ? needToChangeBlock : ''}
                <tr>
                  <td class="pad-x" style="padding:24px 48px 12px 48px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-top:1px solid ${LINE_PAPER};">
                      ${detailRow(t.labels.barber, barberName, { allowHtml: true })}
                      ${detailRow(t.labels.service, serviceName, { allowHtml: true })}
                      ${detailRow(t.labels.date, isCancelled ? `<s>${escapeHtml(longDate)}</s>` : longDate, { allowHtml: isCancelled })}
                      ${detailRow(t.labels.time, isCancelled ? `<s>${escapeHtml(`${booking.slot}  ·  ${duration}`)}</s>` : `${booking.slot}  ·  ${duration}`, { allowHtml: isCancelled })}
                      ${price ? detailRow(t.labels.price, price) : ''}
                      ${detailRow(t.labels.address, `${escapeHtml(ADDRESS_LINE)}<br/><span style="font-family:${BODY_STACK};font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:${TEXT_MUTED_LIGHT};">Szczecin</span>`, { allowHtml: true })}
                    </table>
                  </td>
                </tr>

                <!-- Map CTA (centered, accent fill - the primary visit
                     action). Call CTA lives below the "Coś się zmieniło?"
                     copy and stays ghost since it's the secondary path.
                     Suppressed on cancelled emails - nothing to show up to. -->
                ${isCancelled ? '' : `<tr>
                  <td class="pad-x" align="center" style="padding:32px 48px 8px 48px;text-align:center;">
                    <!--[if mso]>
                    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${MAP_URL}" style="height:44px;v-text-anchor:middle;width:220px;" arcsize="50%" strokecolor="${ACCENT}" fillcolor="${ACCENT}">
                      <w:anchorlock/>
                      <center style="color:${INK};font-family:Helvetica,Arial,sans-serif;font-size:11px;font-weight:600;letter-spacing:0.25em;text-transform:uppercase;">${escapeHtml(t.mapCta)}</center>
                    </v:roundrect>
                    <![endif]-->
                    <!--[if !mso]><!-- -->
                    <a href="${MAP_URL}" target="_blank" class="btn-primary" style="display:inline-block;font-family:${BODY_STACK};font-size:11px;letter-spacing:0.25em;text-transform:uppercase;color:${INK};font-weight:600;background:${ACCENT};background-image:linear-gradient(${ACCENT},${ACCENT});border:1px solid ${ACCENT};padding:14px 26px;border-radius:999px;box-shadow:0 0 22px 4px ${ACCENT_GLOW};mso-line-height-rule:exactly;">${escapeHtml(t.mapCta)}</a>
                    <!--<![endif]-->
                  </td>
                </tr>`}
                <tr>
                  <td class="pad-x" style="padding:28px 48px 0 48px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border:1px solid ${LINE_PAPER};background:${PAPER_STRONG};background-image:linear-gradient(${PAPER_STRONG},${PAPER_STRONG});">
                      <tr>
                        <td style="padding:18px 22px 18px 22px;font-family:${BODY_STACK};font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:${TEXT_MUTED_LIGHT};font-weight:500;">${escapeHtml(s.infoCardTitle)}</td>
                      </tr>
                      <tr>
                        <td style="padding:0 22px 18px 22px;font-family:${BODY_STACK};font-size:13px;line-height:1.6;color:${INK_WEAK};font-weight:300;letter-spacing:0.01em;">${escapeHtml(s.infoCardBody)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>

                ${isCancelled ? '' : needToChangeBlock}

                <tr>
                  <td class="pad-x" style="padding:36px 48px 8px 48px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-top:1px solid ${LINE_PAPER};">
                      <tr>
                        <td style="padding:20px 0 6px 0;font-family:${BODY_STACK};font-size:13px;line-height:1.6;color:${INK_WEAK};font-weight:300;letter-spacing:0.01em;">${escapeHtml(s.showOnArrival)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <tr>
            <td bgcolor="${INK}" style="background:${INK};background-image:linear-gradient(${INK},${INK});padding:0;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="${INK}" style="background:${INK};background-image:linear-gradient(${INK},${INK});">
                <tr>
                  <td class="pad-x" align="center" style="padding:44px 48px 16px 48px;border-top:1px solid ${LINE_INK};text-align:center;">
                    <img src="${wordmarkLightSrc}" alt="Off Cut" width="260" height="60" style="display:inline-block;border:0;outline:none;text-decoration:none;height:60px;width:260px;max-width:260px;" />
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
  const subject = `Off Cut · ${s.subjectStatus}`;
  return {
    subject,
    html: buildHtml(booking, lang, state, opts),
    text: buildPlainText(booking, lang, state, opts),
  };
}

export function buildConfirmationEmail(booking, opts = {}) {
  const lang = booking.lang === 'en' ? 'en' : 'pl';
  const out = buildEmail(booking, 'confirmed', opts);
  const summary = lang === 'en'
    ? `Off Cut - ${pickServiceName(booking, 'en')} with ${booking.barber_name}`
    : `Off Cut - ${pickServiceName(booking, 'pl')} u ${booking.barber_name}`;
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

export function buildCancellationEmail(booking, opts = {}) {
  const lang = booking.lang === 'en' ? 'en' : 'pl';
  const out = buildEmail(booking, 'cancelled', opts);

  const summary = lang === 'en'
    ? `Off Cut - ${pickServiceName(booking, 'en')} with ${booking.barber_name}`
    : `Off Cut - ${pickServiceName(booking, 'pl')} u ${booking.barber_name}`;
  const description = lang === 'en'
    ? `Cancelled\nBarber: ${booking.barber_name}\nService: ${pickServiceName(booking, 'en')}\nAddress: ${ADDRESS_LINE}\nPhone: ${PHONE_DISPLAY}`
    : `Anulowane\nBarber: ${booking.barber_name}\nUsługa: ${pickServiceName(booking, 'pl')}\nAdres: ${ADDRESS_LINE}\nTelefon: ${PHONE_DISPLAY}`;
  return {
    ...out,
    icsSummary: summary,
    icsDescription: description,
    icsLocation: ADDRESS_LINE,
  };
}

export function buildRescheduleEmail(newBooking, oldBooking, opts = {}) {
  const lang = newBooking.lang === 'en' ? 'en' : 'pl';
  const out = buildEmail(newBooking, 'rescheduled', { ...opts, oldBooking });
  const summary = lang === 'en'
    ? `Off Cut - ${pickServiceName(newBooking, 'en')} with ${newBooking.barber_name}`
    : `Off Cut - ${pickServiceName(newBooking, 'pl')} u ${newBooking.barber_name}`;
  const description = lang === 'en'
    ? `Barber: ${newBooking.barber_name}\nService: ${pickServiceName(newBooking, 'en')}\nDuration: ${newBooking.duration_min} min\nAddress: ${ADDRESS_LINE}\nPhone: ${PHONE_DISPLAY}`
    : `Barber: ${newBooking.barber_name}\nUsługa: ${pickServiceName(newBooking, 'pl')}\nCzas: ${newBooking.duration_min} min\nAdres: ${ADDRESS_LINE}\nTelefon: ${PHONE_DISPLAY}`;
  return {
    ...out,
    icsSummary: summary,
    icsDescription: description,
    icsLocation: ADDRESS_LINE,
  };
}

export { ADDRESS_LINE, PHONE_DISPLAY };
