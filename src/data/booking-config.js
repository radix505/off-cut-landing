export const BARBERS = [
  { id: 'aleksander', name: 'Aleksander', photo: '/team/Aleksander.jpeg', titlePL: 'Senior Barber', titleEN: 'Senior Barber' },
  { id: 'julia',      name: 'Julia',      photo: '/team/Julia.jpeg',      titlePL: 'Barber & Broda', titleEN: 'Barber & Beard' },
  { id: 'nico',       name: 'Nico',       photo: '/team/Nico.jpeg',       titlePL: 'Master Barber',  titleEN: 'Master Barber' },
];

export const SERVICES = [
  { id: 's1', namePL: 'Strzyżenie Krótkie',       nameEN: 'Short Cut',           durationMin: 45, duration: '45 min',   price: '100 PLN' },
  { id: 's2', namePL: 'Strzyżenie Długie',         nameEN: 'Long Cut',            durationMin: 55, duration: '55 min',   price: '110 PLN' },
  { id: 's3', namePL: 'Trymowanie Brody',          nameEN: 'Beard Trim',          durationMin: 30, duration: '30 min',   price: '80 PLN'  },
  { id: 's4', namePL: 'Strzyżenie + Broda',        nameEN: 'Cut & Beard',         durationMin: 75, duration: '1h 15min', price: '140 PLN' },
  { id: 's5', namePL: 'Golenie Głowy',             nameEN: 'Head Shave',          durationMin: 30, duration: '30 min',   price: '50 PLN'  },
  { id: 's6', namePL: 'Golenie Głowy + Broda',     nameEN: 'Head Shave + Beard',  durationMin: 50, duration: '50 min',   price: '100 PLN' },
  { id: 's7', namePL: 'Cięcie + Broda + Brzytwa',  nameEN: 'Cut + Beard + Razor', durationMin: 80, duration: '1h 20min', price: '170 PLN' },
];

export function buildSlots(date) {
  if (!date) return [];
  const sun = date.getDay() === 0;
  const [sh, eh] = sun ? [10, 15] : [9, 19];
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
