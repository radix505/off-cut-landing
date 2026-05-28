// iCalendar (RFC 5545) builder for booking confirmations.
// Uses Europe/Warsaw with an explicit VTIMEZONE block so Outlook, Apple Mail,
// Gmail and Google Calendar all render the slot at the correct wall-clock time.

const CRLF = '\r\n';

function pad2(n) { return String(n).padStart(2, '0'); }

function utcStamp(date) {
  return `${date.getUTCFullYear()}${pad2(date.getUTCMonth() + 1)}${pad2(date.getUTCDate())}` +
         `T${pad2(date.getUTCHours())}${pad2(date.getUTCMinutes())}${pad2(date.getUTCSeconds())}Z`;
}

function localStamp(isoDate, hh, mm) {
  const [y, m, d] = isoDate.split('-').map(Number);
  return `${y}${pad2(m)}${pad2(d)}T${pad2(hh)}${pad2(mm)}00`;
}

function addMinutes(slot, minutes) {
  const [h, m] = slot.split(':').map(Number);
  const total = h * 60 + m + minutes;
  return { hh: Math.floor(total / 60) % 24, mm: total % 60 };
}

function escapeIcs(s) {
  return String(s ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

// Fold lines at 75 octets per RFC 5545. Continuation lines start with a single
// space. Safer than relying on the mail relay not to re-wrap.
function foldLine(line) {
  if (line.length <= 75) return line;
  const out = [line.slice(0, 75)];
  let i = 75;
  while (i < line.length) {
    out.push(` ${line.slice(i, i + 74)}`);
    i += 74;
  }
  return out.join(CRLF);
}

const VTIMEZONE_EUROPE_WARSAW = [
  'BEGIN:VTIMEZONE',
  'TZID:Europe/Warsaw',
  'BEGIN:STANDARD',
  'DTSTART:19701025T030000',
  'RRULE:FREQ=YEARLY;BYDAY=-1SU;BYMONTH=10',
  'TZOFFSETFROM:+0200',
  'TZOFFSETTO:+0100',
  'TZNAME:CET',
  'END:STANDARD',
  'BEGIN:DAYLIGHT',
  'DTSTART:19700329T020000',
  'RRULE:FREQ=YEARLY;BYDAY=-1SU;BYMONTH=3',
  'TZOFFSETFROM:+0100',
  'TZOFFSETTO:+0200',
  'TZNAME:CEST',
  'END:DAYLIGHT',
  'END:VTIMEZONE',
];

export function buildBookingIcs({
  id,
  date,
  slot,
  durationMin,
  summary,
  description,
  location,
  organizerName,
  organizerEmail,
  attendeeEmail,
  attendeeName,
  uidDomain = 'offcut.pl',
  sequence = 0,
  method = 'REQUEST',
}) {
  const [startH, startM] = slot.split(':').map(Number);
  const end = addMinutes(slot, durationMin);
  // METHOD:CANCEL with STATUS:CANCELLED + same UID + bumped SEQUENCE is how
  // RFC 5546 tells calendar clients (Google / Apple / Outlook) to drop the
  // existing event for that UID. METHOD:REQUEST keeps STATUS:CONFIRMED for
  // creates and updates.
  const isCancel = method === 'CANCEL';

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Off Cut//Booking//PL',
    'CALSCALE:GREGORIAN',
    `METHOD:${method}`,
    ...VTIMEZONE_EUROPE_WARSAW,
    'BEGIN:VEVENT',
    `UID:offcut-booking-${id}@${uidDomain}`,
    `DTSTAMP:${utcStamp(new Date())}`,
    `DTSTART;TZID=Europe/Warsaw:${localStamp(date, startH, startM)}`,
    `DTEND;TZID=Europe/Warsaw:${localStamp(date, end.hh, end.mm)}`,
    `SUMMARY:${escapeIcs(summary)}`,
    `DESCRIPTION:${escapeIcs(description)}`,
    `LOCATION:${escapeIcs(location)}`,
    sequence > 0 ? `SEQUENCE:${sequence}` : null,
    isCancel ? 'STATUS:CANCELLED' : 'STATUS:CONFIRMED',
    'TRANSP:OPAQUE',
    `ORGANIZER;CN=${escapeIcs(organizerName)}:mailto:${organizerEmail}`,
    attendeeEmail
      ? `ATTENDEE;CN=${escapeIcs(attendeeName ?? attendeeEmail)};RSVP=FALSE;PARTSTAT=ACCEPTED:mailto:${attendeeEmail}`
      : null,
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean);

  return lines.map(foldLine).join(CRLF) + CRLF;
}
