import { buildSlotsForISODate } from '../src/data/booking-config.js';
import { SLOT_STEP_MIN } from '../src/data/businessHours.js';

export function expandBlock(slot, durationMin, slotGrid) {
  const idx = slotGrid.indexOf(slot);
  if (idx === -1) return [];
  const blocks = Math.ceil(durationMin / SLOT_STEP_MIN);
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

// Whether a service occupying `blocks` 10-minute units starting at `startIdx`
// would extend past the salon's closing time. The grid's last entry represents
// the closing instant itself, so it is not a usable block.
export function serviceOverflowsClosing(startIdx, blocks, gridLength) {
  return startIdx + blocks >= gridLength;
}

// Start slots where a new booking of `durationMin` cannot begin - either it
// would overlap an existing booking or run past end-of-day.
export function computeUnavailableStarts(bookings, isoDate, durationMin) {
  const grid = buildSlotsForISODate(isoDate);
  const blocks = Math.ceil(durationMin / SLOT_STEP_MIN);
  const unavailable = new Set();
  for (let i = 0; i < grid.length; i++) {
    if (serviceOverflowsClosing(i, blocks, grid.length)) {
      unavailable.add(grid[i]);
      continue;
    }
    if (blockOverlapsExisting(grid[i], durationMin, bookings, isoDate)) {
      unavailable.add(grid[i]);
    }
  }
  return unavailable;
}
