// Single source of truth for opening hours.
// Day index per Date.getDay(): 0=Sun, 1=Mon, ..., 6=Sat.
// `null` = closed. start/end are integer hours (24h).
//
// NOTE: this file is imported by both the React app AND the Node server
// (via src/data/booking-config.js → server/routes/bookings.js). Keep it
// React-free — no JSX, no .jsx imports — or `node server/index.js` will
// crash with ERR_UNKNOWN_FILE_EXTENSION.

export const BUSINESS_HOURS = {
  0: null,                   // Sunday — closed
  1: { start: 10, end: 19 }, // Monday
  2: { start: 9,  end: 19 }, // Tuesday
  3: { start: 9,  end: 19 }, // Wednesday
  4: { start: 9,  end: 19 }, // Thursday
  5: { start: 9,  end: 19 }, // Friday
  6: { start: 8,  end: 18 }, // Saturday
};



export const SLOT_STEP_MIN = 10;

const DAYS = [
  { idx: 1, pl: 'Poniedziałek', en: 'Monday' },
  { idx: 2, pl: 'Wtorek',       en: 'Tuesday' },
  { idx: 3, pl: 'Środa',        en: 'Wednesday' },
  { idx: 4, pl: 'Czwartek',     en: 'Thursday' },
  { idx: 5, pl: 'Piątek',       en: 'Friday' },
  { idx: 6, pl: 'Sobota',       en: 'Saturday' },
  { idx: 0, pl: 'Niedziela',    en: 'Sunday' },
];

const fmt = (h) => `${String(h).padStart(2, '0')}:00`;

// One row per day for Footer + Contact page tables. Order: Mon → Sun.
export const HOURS_DISPLAY = DAYS.map(({ idx, pl, en }) => {
  const h = BUSINESS_HOURS[idx];
  return {
    dayPL: pl,
    dayEN: en,
    rangePL: h ? `${fmt(h.start)} – ${fmt(h.end)}` : 'Zamknięte',
    rangeEN: h ? `${fmt(h.start)} – ${fmt(h.end)}` : 'Closed',
  };
});

// Compact summary for Map + Booking sidebar.
// Hand-authored copy — rewrite when the underlying hours change shape.
// Only open windows are listed; closed days are implied by omission
// (the Footer + Contact tables render the full week including closures).
export const HOURS_SUMMARY = [
  {
    labelPL: 'Poniedziałek',
    labelEN: 'Monday',
    range: '10:00 – 19:00',
    shortPL: 'Pon 10–19',
    shortEN: 'Mon 10–19',
  },
  {
    labelPL: 'Wt – Pt',
    labelEN: 'Tue – Fri',
    range: '09:00 – 19:00',
    shortPL: 'Wt–Pt 9–19',
    shortEN: 'Tue–Fri 9–19',
  },
  {
    labelPL: 'Sobota',
    labelEN: 'Saturday',
    range: '08:00 – 18:00',
    shortPL: 'Sob 8–18',
    shortEN: 'Sat 8–18',
  },
];

const SCHEMA_DAYS = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
};

// schema.org OpeningHoursSpecification entries, used to inject JSON-LD at build time.
export function openingHoursSpecification() {
  return Object.entries(BUSINESS_HOURS)
    .filter(([, h]) => h)
    .map(([d, h]) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: SCHEMA_DAYS[d],
      opens: fmt(h.start),
      closes: fmt(h.end),
    }));
}
