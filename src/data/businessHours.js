// Single source of truth for opening hours.
// Day index per Date.getDay(): 0=Sun, 1=Mon, ..., 6=Sat.
// `null` = closed. start/end are integer hours (24h).
export const BUSINESS_HOURS = {
  0: { start: 10, end: 16 }, // Sunday
  1: { start: 9,  end: 20 }, // Monday
  2: { start: 9,  end: 20 }, // Tuesday
  3: { start: 9,  end: 20 }, // Wednesday
  4: { start: 9,  end: 20 }, // Thursday
  5: { start: 9,  end: 20 }, // Friday
  6: { start: 9,  end: 20 }, // Saturday
};

export const SLOT_STEP_MIN = 30;

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
// Hand-authored copy — if hours change shape (e.g. Monday becomes the exception),
// rewrite this object to reflect the new grouping.
export const HOURS_SUMMARY = {
  primary: {
    labelPL: 'Pon – Sob',
    labelEN: 'Mon – Sat',
    range: '09:00 – 20:00',
    shortPL: 'Pon–Sob 9–20',
    shortEN: 'Mon–Sat 9–20',
  },
  secondary: {
    labelPL: 'Niedziela',
    labelEN: 'Sunday',
    range: '10:00 – 16:00',
    shortPL: 'Nie 10–16',
    shortEN: 'Sun 10–16',
  },
};

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
