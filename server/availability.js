import { buildSlotsForISODate } from '../src/data/booking-config.js';

export function expandBlock(slot, durationMin, slotGrid) {
  const idx = slotGrid.indexOf(slot);
  if (idx === -1) return [];
  const blocks = Math.ceil(durationMin / 30);
  return slotGrid.slice(idx, idx + blocks);
}

export function computeUnavailable(bookings, isoDate) {
  const grid = buildSlotsForISODate(isoDate);
  const unavailable = new Set();
  for (const b of bookings) {
    for (const s of expandBlock(b.slot, b.duration_min, grid)) {
      unavailable.add(s);
    }
  }
  return unavailable;
}

export function blockOverlapsExisting(newSlot, newDurationMin, existingBookings, isoDate) {
  const grid = buildSlotsForISODate(isoDate);
  const newBlock = new Set(expandBlock(newSlot, newDurationMin, grid));
  for (const b of existingBookings) {
    for (const s of expandBlock(b.slot, b.duration_min, grid)) {
      if (newBlock.has(s)) return true;
    }
  }
  return false;
}
