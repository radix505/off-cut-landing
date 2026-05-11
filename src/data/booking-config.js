import { BUSINESS_HOURS, SLOT_STEP_MIN } from './businessHours.js';

export function buildSlots(date) {
  if (!date) return [];
  const h = BUSINESS_HOURS[date.getDay()];
  if (!h) return [];
  const slots = [];
  for (let hr = h.start; hr <= h.end; hr++) {
    for (let m = 0; m < 60; m += SLOT_STEP_MIN) {
      if (hr === h.end && m > 0) break;
      slots.push(`${String(hr).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
  }
  return slots;
}

export function buildSlotsForISODate(isoDate) {
  const [y, m, d] = isoDate.split('-').map(Number);
  return buildSlots(new Date(y, m - 1, d));
}
