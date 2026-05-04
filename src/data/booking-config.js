export function buildSlots(date) {
  if (!date) return [];
  const day = date.getDay(); // 0=Sun,1=Mon,2=Tue,...,6=Sat
  if (day === 0) return [];  // Sunday closed
  const [sh, eh] = day === 1 ? [10, 19] : day === 6 ? [8, 18] : [9, 19];
  const slots = [];
  for (let h = sh; h <= eh; h++)
    for (let m = 0; m < 60; m += 30) {
      if (h === eh && m > 0) break;
      slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
  return slots;
}

export function buildSlotsForISODate(isoDate) {
  const [y, m, d] = isoDate.split('-').map(Number);
  return buildSlots(new Date(y, m - 1, d));
}
