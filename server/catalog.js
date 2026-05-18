import * as barbersRepo from './data/barbersRepo.js';
import * as servicesRepo from './data/servicesRepo.js';

function formatPrice(pln) {
  return `${pln} PLN`;
}

export async function getCatalog() {
  const [barberRows, tagRows, serviceRows, linkRows] = await Promise.all([
    barbersRepo.listForCatalog(),
    barbersRepo.listTags(),
    servicesRepo.listActiveForCatalog(),
    servicesRepo.listServiceBarberLinks(),
  ]);

  const tagsByBarber = new Map();
  for (const t of tagRows) {
    if (!tagsByBarber.has(t.barber_id)) tagsByBarber.set(t.barber_id, []);
    tagsByBarber.get(t.barber_id).push({ pl: t.tag_pl, en: t.tag_en });
  }

  const barbers = barberRows.map((r) => ({
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
    suspended: r.suspended === 1,
  }));

  const linksByService = new Map();
  for (const { service_id, barber_id } of linkRows) {
    if (!linksByService.has(service_id)) linksByService.set(service_id, []);
    linksByService.get(service_id).push(barber_id);
  }

  const services = serviceRows.map((r) => ({
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

export const getBarberIdSet = (opts) => barbersRepo.getActiveIdSet(opts);
export const getServiceById = (id, opts) => servicesRepo.getById(id, opts);
export const isBarberLinkedToService = (barberId, serviceId, opts) =>
  servicesRepo.isBarberLinked(barberId, serviceId, opts);
