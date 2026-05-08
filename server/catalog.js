import { db } from './db.js';

const selectBarbers = db.prepare(`
  SELECT id, name, photo, title_pl, title_en, slug, delay,
         bio_pl, bio_en, long_bio_pl, long_bio_en
  FROM barbers
  WHERE active = 1
  ORDER BY sort_order, id
`);

const selectBarberTags = db.prepare(`
  SELECT barber_id, tag_pl, tag_en
  FROM barber_tags
  ORDER BY barber_id, sort_order
`);

const selectServices = db.prepare(`
  SELECT id, name_pl, name_en, desc_pl, desc_en,
         duration_min, duration_label, price_pln, delay, sort_order, category
  FROM services
  WHERE active = 1
  ORDER BY sort_order, id
`);

const selectServiceBarbers = db.prepare(`
  SELECT sb.service_id, sb.barber_id
  FROM service_barbers sb
  JOIN barbers b ON b.id = sb.barber_id
  WHERE b.active = 1
  ORDER BY b.sort_order
`);

const selectServiceById = db.prepare(`
  SELECT id, duration_min FROM services WHERE id = ? AND active = 1
`);

const selectActiveBarberIds = db.prepare(`
  SELECT id FROM barbers WHERE active = 1
`);

function formatPrice(pln) {
  return `${pln} PLN`;
}

export function getCatalog() {
  const tagsByBarber = new Map();
  for (const t of selectBarberTags.all()) {
    if (!tagsByBarber.has(t.barber_id)) tagsByBarber.set(t.barber_id, []);
    tagsByBarber.get(t.barber_id).push({ pl: t.tag_pl, en: t.tag_en });
  }

  const barbers = selectBarbers.all().map(r => ({
    id: r.id,
    slug: r.slug ?? r.id,
    name: r.name,
    photo: r.photo,
    titlePL: r.title_pl,
    titleEN: r.title_en,
    delay: r.delay ?? 0,
    bio: { pl: r.bio_pl ?? '', en: r.bio_en ?? '' },
    longBio: { pl: r.long_bio_pl ?? '', en: r.long_bio_en ?? '' },
    tags: tagsByBarber.get(r.id) ?? [],
  }));

  const linksByService = new Map();
  for (const { service_id, barber_id } of selectServiceBarbers.all()) {
    if (!linksByService.has(service_id)) linksByService.set(service_id, []);
    linksByService.get(service_id).push(barber_id);
  }

  const services = selectServices.all().map(r => ({
    id: r.id,
    namePL: r.name_pl,
    nameEN: r.name_en,
    descPL: r.desc_pl,
    descEN: r.desc_en,
    duration: r.duration_label,
    durationMin: r.duration_min,
    price: formatPrice(r.price_pln),
    delay: r.delay,
    category: r.category,
    barberIds: linksByService.get(r.id) ?? [],
  }));

  return { barbers, services };
}

export function getBarberIdSet() {
  return new Set(selectActiveBarberIds.all().map(r => r.id));
}

export function getServiceById(id) {
  return selectServiceById.get(id) ?? null;
}
