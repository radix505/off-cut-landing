import { db } from './db.js';

const BARBERS = [
  {
    slug: 'nico', name: 'Nico',
    photo: '/team/Nico.jpeg',
    titlePL: 'Barber', titleEN: 'Barber',
    delay: 1,
    keys: ['NICO'],
    bioPL: 'Opis Nico pojawi się tutaj wkrótce. Pasjonat klasycznych technik barberskich z wieloletnim doświadczeniem.',
    bioEN: "Nico's description coming soon. A passionate barber with years of experience in classic techniques.",
    longBioPL: 'Pełny opis Nico pojawi się tutaj. Tutaj możesz opisać jego historię, doświadczenie, pasje i specjalizacje. Ten tekst jest placeholderem — wypełnij go kiedy będziesz gotowy.',
    longBioEN: "Full bio coming soon. Here you can describe his story, experience, passions and specialisations. This text is a placeholder — fill it in when you're ready.",
    tags: [
      { pl: 'Klasyczne strzyżenie', en: 'Classic Cut' },
      { pl: 'Broda', en: 'Beard' },
      { pl: 'Gorący ręcznik', en: 'Hot Towel' },
    ],
  },
  {
    slug: 'aleksander', name: 'Aleksander',
    photo: '/team/Aleksander.jpeg',
    titlePL: 'Senior Barber', titleEN: 'Senior Barber',
    delay: 2,
    keys: ['OLEK', 'ALEKSANDER'],
    bioPL: 'Opis Aleksandra pojawi się tutaj wkrótce. Specjalista od fadesów i precyzyjnych technik strzyżenia.',
    bioEN: "Aleksander's description coming soon. A specialist in fades and precision cutting techniques.",
    longBioPL: 'Pełny opis Aleksandra pojawi się tutaj. Tutaj możesz opisać jego historię, doświadczenie, pasje i specjalizacje. Ten tekst jest placeholderem — wypełnij go kiedy będziesz gotowy.',
    longBioEN: "Full bio coming soon. Here you can describe his story, experience, passions and specialisations. This text is a placeholder — fill it in when you're ready.",
    tags: [
      { pl: 'Fade', en: 'Fade' },
      { pl: 'Broda', en: 'Beard' },
      { pl: 'Skin Fade', en: 'Skin Fade' },
    ],
  },
  {
    slug: 'julia', name: 'Julia',
    photo: '/team/Julia.jpeg',
    titlePL: 'Senior Barber', titleEN: 'Senior Barber',
    delay: 3,
    keys: ['JULIA'],
    bioPL: 'Opis Julii pojawi się tutaj wkrótce. Ekspertka od pracy nożyczkami i włosów teksturowanych.',
    bioEN: "Julia's description coming soon. An expert in scissor work and textured hair styling.",
    longBioPL: 'Pełny opis Julii pojawi się tutaj. Tutaj możesz opisać jej historię, doświadczenie, pasje i specjalizacje. Ten tekst jest placeholderem — wypełnij go kiedy będziesz gotowy.',
    longBioEN: "Full bio coming soon. Here you can describe her story, experience, passions and specialisations. This text is a placeholder — fill it in when you're ready.",
    tags: [
      { pl: 'Praca nożyczkami', en: 'Scissor Work' },
      { pl: 'Włosy teksturowane', en: 'Textured Hair' },
      { pl: 'Skin Fade', en: 'Skin Fade' },
    ],
  },
];

const SERVICES = [
  { num: '001', namePL: 'Strzyżenie Męskie Włosy Krótkie', nameEN: 'Short Hair Cut',
    descPL: 'Precyzyjne strzyżenie krótkich włosów. Czyste linie, dopasowane do kształtu głowy.',
    descEN: 'Precise short hair cut. Clean lines, shaped to your head.',
    duration: '50 min', durationMin: 50, pricePLN: 100, delay: 1, category: 'hair', barbers: ['OLEK', 'JULIA'] },
  { num: '002', namePL: 'Strzyżenie Męskie Włosy Długie', nameEN: 'Long Hair Cut',
    descPL: 'Strzyżenie długich włosów z dbałością o teksturę i ruch.',
    descEN: 'Long hair cut with attention to texture and movement.',
    duration: '1h', durationMin: 60, pricePLN: 110, delay: 2, category: 'hair', barbers: ['OLEK', 'JULIA'] },
  { num: '003', namePL: 'Trymowanie Brody', nameEN: 'Beard Trim',
    descPL: 'Kształt, krawędzie, definicja. Broda pod kontrolą.',
    descEN: 'Shape, edge, define. Beard back in line.',
    duration: '20 min', durationMin: 20, pricePLN: 80, delay: 3, category: 'beard', barbers: ['OLEK', 'JULIA'] },
  { num: '004', namePL: 'Strzyżenie Głowy i Brody', nameEN: 'Cut & Beard',
    descPL: 'Kompletna wizyta. Włosy i broda w jednym czasie, przez jednego rzemieślnika.',
    descEN: 'Full visit. Hair and beard in one sitting, by one craftsman.',
    duration: '1h 10min', durationMin: 70, pricePLN: 140, delay: 1, category: 'combo', barbers: ['OLEK', 'JULIA'] },
  { num: '005', namePL: 'Golenie Głowy Maszynką', nameEN: 'Clipper Head Shave',
    descPL: 'Gładkie golenie maszynką na jedną długość. Szybko, czysto, równo.',
    descEN: 'Clean machine shave at one length. Fast, precise, even.',
    duration: '10 min', durationMin: 10, pricePLN: 50, delay: 2, category: 'hair', barbers: ['OLEK', 'JULIA'] },
  { num: '006', namePL: 'Golenie Głowy Maszynką + Broda', nameEN: 'Head Shave + Beard',
    descPL: 'Golenie głowy maszynką z pełnym trymowaniem brody.',
    descEN: 'Machine head shave with full beard trim.',
    duration: '30 min', durationMin: 30, pricePLN: 100, delay: 3, category: 'combo', barbers: ['OLEK', 'JULIA'] },
  { num: '007', namePL: 'Strzyżenie Głowy i Brody + Brzytwa', nameEN: 'Cut & Beard + Straight Razor',
    descPL: 'Pełne doświadczenie. Strzyżenie, broda i wykończenie brzytwą.',
    descEN: 'The full experience. Cut, beard, and straight razor finish.',
    duration: '1h 15min', durationMin: 75, pricePLN: 170, delay: 2, category: 'combo', barbers: ['OLEK', 'JULIA'] },
  { num: '008', namePL: 'Strzyżenie Męskie Włosy Krótkie', nameEN: 'Short Hair Cut',
    descPL: 'Precyzyjne strzyżenie krótkich włosów. Czyste linie, dopasowane do kształtu głowy.',
    descEN: 'Precise short hair cut. Clean lines, shaped to your head.',
    duration: '1h', durationMin: 60, pricePLN: 80, delay: 3, category: 'hair', barbers: ['NICO'] },
  { num: '009', namePL: 'Strzyżenie Męskie Włosy Długie', nameEN: 'Long Hair Cut',
    descPL: 'Strzyżenie długich włosów z dbałością o teksturę i ruch.',
    descEN: 'Long hair cut with attention to texture and movement.',
    duration: '1h 20min', durationMin: 80, pricePLN: 90, delay: 1, category: 'hair', barbers: ['NICO'] },
  { num: '010', namePL: 'Trymowanie Brody', nameEN: 'Beard Trim',
    descPL: 'Kształt, krawędzie, definicja. Broda pod kontrolą.',
    descEN: 'Shape, edge, define. Beard back in line.',
    duration: '40 min', durationMin: 40, pricePLN: 60, delay: 2, category: 'beard', barbers: ['NICO'] },
  { num: '011', namePL: 'Strzyżenie Głowy i Brody', nameEN: 'Cut & Beard',
    descPL: 'Kompletna wizyta. Włosy i broda w jednym czasie, przez jednego rzemieślnika.',
    descEN: 'Full visit. Hair and beard in one sitting, by one craftsman.',
    duration: '1h 30min', durationMin: 90, pricePLN: 130, delay: 3, category: 'combo', barbers: ['NICO'] },
  { num: '012', namePL: 'Golenie Głowy Maszynką', nameEN: 'Clipper Head Shave',
    descPL: 'Gładkie golenie maszynką na jedną długość. Szybko, czysto, równo.',
    descEN: 'Clean machine shave at one length. Fast, precise, even.',
    duration: '30 min', durationMin: 30, pricePLN: 40, delay: 1, category: 'hair', barbers: ['NICO'] },
  { num: '013', namePL: 'Golenie Głowy Maszynką + Broda', nameEN: 'Head Shave + Beard',
    descPL: 'Golenie głowy maszynką z pełnym trymowaniem brody.',
    descEN: 'Machine head shave with full beard trim.',
    duration: '1h', durationMin: 60, pricePLN: 100, delay: 2, category: 'combo', barbers: ['NICO'] },
];

const insertBarber = db.prepare(`
  INSERT INTO barbers
    (name, photo, title_pl, title_en, sort_order, slug, bio_pl, bio_en, long_bio_pl, long_bio_en, delay)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
const updateBarberDetailsBySlug = db.prepare(`
  UPDATE barbers
  SET slug = ?, bio_pl = ?, bio_en = ?, long_bio_pl = ?, long_bio_en = ?, delay = ?
  WHERE slug = ?
`);
const selectBarberIdBySlug = db.prepare(`SELECT id FROM barbers WHERE slug = ?`);
const deleteBarberTags = db.prepare(`DELETE FROM barber_tags WHERE barber_id = ?`);
const insertBarberTag  = db.prepare(`
  INSERT INTO barber_tags (barber_id, tag_pl, tag_en, sort_order) VALUES (?, ?, ?, ?)
`);
const insertService = db.prepare(`
  INSERT INTO services
    (id, name_pl, name_en, desc_pl, desc_en, duration_min, duration_label, price_pln, delay, sort_order, category)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
const insertServiceLink = db.prepare(`
  INSERT INTO service_barbers (service_id, barber_id) VALUES (?, ?)
`);

function writeBarberTags(barberId, barber) {
  deleteBarberTags.run(barberId);
  barber.tags.forEach((t, i) => insertBarberTag.run(barberId, t.pl, t.en, i));
}

function buildSlugToIdMap() {
  const map = new Map();
  for (const b of BARBERS) {
    const row = selectBarberIdBySlug.get(b.slug);
    if (row) map.set(b.slug, row.id);
  }
  return map;
}

function resolveBarberIds(keys, slugToId) {
  return keys.map(key => {
    const match = BARBERS.find(b => b.keys.includes(key));
    if (!match) throw new Error(`seed-catalog: unknown barber key "${key}"`);
    const id = slugToId.get(match.slug);
    if (id == null) throw new Error(`seed-catalog: no id for slug "${match.slug}"`);
    return id;
  });
}

export function seedCatalogIfEmpty(logger) {
  const count = db.prepare('SELECT COUNT(*) AS n FROM services').get().n;
  if (count > 0) return false;

  const tx = db.transaction(() => {
    for (const [i, b] of BARBERS.entries()) {
      const result = insertBarber.run(
        b.name, b.photo, b.titlePL, b.titleEN, i,
        b.slug, b.bioPL, b.bioEN, b.longBioPL, b.longBioEN, b.delay
      );
      writeBarberTags(result.lastInsertRowid, b);
    }
    const slugToId = buildSlugToIdMap();
    for (const [i, s] of SERVICES.entries()) {
      insertService.run(s.num, s.namePL, s.nameEN, s.descPL, s.descEN, s.durationMin, s.duration, s.pricePLN, s.delay, i, s.category);
      for (const id of resolveBarberIds(s.barbers, slugToId)) insertServiceLink.run(s.num, id);
    }
  });
  tx();

  logger?.info({ barbers: BARBERS.length, services: SERVICES.length }, 'catalog seeded');
  return true;
}

// Idempotent: rewrites EN service names that still carry the legacy em-dash form.
// Source-of-truth is the SERVICES array above; this just propagates source edits
// to a previously-seeded database without forcing a full reseed.
export function cleanServiceCopyIfNeeded(logger) {
  const stale = db.prepare(`SELECT COUNT(*) AS n FROM services WHERE name_en LIKE '% — %'`).get().n;
  if (stale === 0) return false;

  const update = db.prepare('UPDATE services SET name_en = ? WHERE id = ?');
  const tx = db.transaction(() => {
    for (const s of SERVICES) update.run(s.nameEN, s.num);
  });
  tx();

  logger?.info({ rows: stale }, 'service EN names cleaned');
  return true;
}

export function backfillBarberDetailsIfMissing(logger) {
  const missing = db.prepare(`SELECT COUNT(*) AS n FROM barbers WHERE slug IS NULL OR bio_pl IS NULL`).get().n;
  if (missing === 0) return false;

  const tx = db.transaction(() => {
    for (const b of BARBERS) {
      updateBarberDetailsBySlug.run(b.slug, b.bioPL, b.bioEN, b.longBioPL, b.longBioEN, b.delay, b.slug);
      const row = selectBarberIdBySlug.get(b.slug);
      if (row) writeBarberTags(row.id, b);
    }
  });
  tx();

  logger?.info({ barbers: BARBERS.length }, 'barber details backfilled');
  return true;
}
