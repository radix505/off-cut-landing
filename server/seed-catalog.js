import { withTransaction } from './db.js';
import * as barbersRepo from './data/barbersRepo.js';
import * as servicesRepo from './data/servicesRepo.js';

const BARBERS = [
  {
    slug: 'nico', name: 'Nico',
    photo: '/team/Nico.jpeg',
    titlePL: 'Barber', titleEN: 'Barber',
    delay: 1,
    keys: ['NICO'],
    bioPL: 'Opis Nico pojawi się tutaj wkrótce. Pasjonat klasycznych technik barberskich z wieloletnim doświadczeniem.',
    bioEN: "Nico's description coming soon. A passionate barber with years of experience in classic techniques.",
    longBioPL: 'Pełny opis Nico pojawi się tutaj. Tutaj możesz opisać jej historię, doświadczenie, pasje i specjalizacje. Ten tekst jest placeholderem — wypełnij go kiedy będziesz gotowy.',
    longBioEN: "Full bio coming soon. Here you can describe her story, experience, passions and specialisations. This text is a placeholder — fill it in when you're ready.",
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

async function writeBarberTags(client, barberId, barber) {
  await barbersRepo.deleteTags(barberId, { client });
  for (let i = 0; i < barber.tags.length; i++) {
    const t = barber.tags[i];
    await barbersRepo.insertTag(
      { barberId, pl: t.pl, en: t.en, sortOrder: i },
      { client },
    );
  }
}

async function buildSlugToIdMap(client) {
  const map = new Map();
  for (const b of BARBERS) {
    const id = await barbersRepo.getIdBySlug(b.slug, { client });
    if (id != null) map.set(b.slug, id);
  }
  return map;
}

function resolveBarberIds(keys, slugToId) {
  return keys.map((key) => {
    const match = BARBERS.find((b) => b.keys.includes(key));
    if (!match) throw new Error(`seed-catalog: unknown barber key "${key}"`);
    const id = slugToId.get(match.slug);
    if (id == null) throw new Error(`seed-catalog: no id for slug "${match.slug}"`);
    return id;
  });
}

export async function seedCatalogIfEmpty(logger) {
  if ((await servicesRepo.count()) > 0) return false;

  await withTransaction(async (client) => {
    for (const [i, b] of BARBERS.entries()) {
      const barberId = await barbersRepo.insert(
        {
          name: b.name,
          photo: b.photo,
          titlePL: b.titlePL,
          titleEN: b.titleEN,
          sortOrder: i,
          slug: b.slug,
          bioPL: b.bioPL,
          bioEN: b.bioEN,
          longBioPL: b.longBioPL,
          longBioEN: b.longBioEN,
          delay: b.delay,
        },
        { client },
      );
      await writeBarberTags(client, barberId, b);
    }
    const slugToId = await buildSlugToIdMap(client);
    for (const [i, s] of SERVICES.entries()) {
      await servicesRepo.insert(
        {
          id: s.num,
          namePL: s.namePL,
          nameEN: s.nameEN,
          descPL: s.descPL,
          descEN: s.descEN,
          durationMin: s.durationMin,
          durationLabel: s.duration,
          pricePLN: s.pricePLN,
          delay: s.delay,
          sortOrder: i,
          category: s.category,
        },
        { client },
      );
      for (const id of resolveBarberIds(s.barbers, slugToId)) {
        await servicesRepo.linkBarber(s.num, id, { client });
      }
    }
  });

  logger?.info?.({ barbers: BARBERS.length, services: SERVICES.length }, 'catalog seeded');
  return true;
}

// Idempotent: rewrites EN service names that still carry the legacy em-dash form.
export async function cleanServiceCopyIfNeeded(logger) {
  const stale = await servicesRepo.countLegacyNameEn();
  if (stale === 0) return false;

  await withTransaction(async (client) => {
    for (const s of SERVICES) {
      await servicesRepo.updateNameEn(s.num, s.nameEN, { client });
    }
  });

  logger?.info?.({ rows: stale }, 'service EN names cleaned');
  return true;
}

// Run-once: mark the barbers that were previously hardcoded as suspended in the
// frontend as "visible but not bookable" (active = 1, suspended = 1), preserving
// current live behavior under the two-flag model. Forcing active = 1 also corrects
// any environment where the earlier v1 backfill set active = 0 on these ids.
// Guarded by app_meta so a later manual change is never overridden.
export async function suspendInitialBarbersIfNeeded(logger) {
  return withTransaction(async (client) => {
    const { rows } = await client.query(
      `INSERT INTO app_meta (key, value)
       VALUES ('suspend_initial_barbers_v2', '1,3')
       ON CONFLICT (key) DO NOTHING
       RETURNING key`,
    );
    if (rows.length === 0) return false;

    await client.query('UPDATE barbers SET suspended = 1, active = 1 WHERE id IN (1, 3)');
    logger?.info?.({ ids: [1, 3] }, 'initial barbers suspended');
    return true;
  });
}

export async function backfillBarberDetailsIfMissing(logger) {
  const missing = await barbersRepo.countMissingDetails();
  if (missing === 0) return false;

  await withTransaction(async (client) => {
    for (const b of BARBERS) {
      await barbersRepo.updateDetailsBySlug(
        {
          slug: b.slug,
          bioPL: b.bioPL,
          bioEN: b.bioEN,
          longBioPL: b.longBioPL,
          longBioEN: b.longBioEN,
          delay: b.delay,
        },
        { client },
      );
      const id = await barbersRepo.getIdBySlug(b.slug, { client });
      if (id != null) await writeBarberTags(client, id, b);
    }
  });

  logger?.info?.({ barbers: BARBERS.length }, 'barber details backfilled');
  return true;
}
