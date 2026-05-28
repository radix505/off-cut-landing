import { pool } from '../db.js';

const SQL_LIST_ACTIVE_FOR_CATALOG = `
  SELECT id, name_pl, name_en, desc_pl, desc_en,
         duration_min, duration_label, price_pln, delay, sort_order, category
  FROM services
  WHERE active = 1
  ORDER BY sort_order, id
`;

const SQL_LIST_ACTIVE_BRIEF = `
  SELECT id, name_pl, duration_label, price_pln
  FROM services
  WHERE active = 1
  ORDER BY sort_order, id
`;

const SQL_LIST_SERVICE_BARBER_LINKS = `
  SELECT sb.service_id, sb.barber_id
  FROM service_barbers sb
  JOIN barbers b ON b.id = sb.barber_id
  WHERE b.active = 1
  ORDER BY b.sort_order
`;

const SQL_GET_BY_ID = `
  SELECT id, duration_min
  FROM services
  WHERE id = $1 AND active = 1
`;

const SQL_IS_BARBER_LINKED = `
  SELECT 1
  FROM service_barbers sb
  JOIN barbers b ON b.id = sb.barber_id
  WHERE sb.service_id = $1 AND sb.barber_id = $2 AND b.active = 1
`;

const SQL_COUNT_ALL = `SELECT COUNT(*)::int AS n FROM services`;

const SQL_COUNT_LEGACY_NAME_EN = `
  SELECT COUNT(*)::int AS n
  FROM services
  WHERE name_en LIKE '% - %'
`;

const SQL_INSERT_SERVICE = `
  INSERT INTO services
    (id, name_pl, name_en, desc_pl, desc_en, duration_min, duration_label, price_pln, delay, sort_order, category)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
`;

const SQL_INSERT_SERVICE_BARBER_LINK = `
  INSERT INTO service_barbers (service_id, barber_id) VALUES ($1, $2)
`;

const SQL_UPDATE_NAME_EN = `UPDATE services SET name_en = $1 WHERE id = $2`;

const runner = (client) => client ?? pool;

export async function listActiveForCatalog({ client } = {}) {
  const { rows } = await runner(client).query(SQL_LIST_ACTIVE_FOR_CATALOG);
  return rows;
}

export async function listActiveBrief({ client } = {}) {
  const { rows } = await runner(client).query(SQL_LIST_ACTIVE_BRIEF);
  return rows;
}

export async function listServiceBarberLinks({ client } = {}) {
  const { rows } = await runner(client).query(SQL_LIST_SERVICE_BARBER_LINKS);
  return rows;
}

export async function getById(id, { client } = {}) {
  const { rows } = await runner(client).query(SQL_GET_BY_ID, [id]);
  return rows[0] ?? null;
}

export async function isBarberLinked(barberId, serviceId, { client } = {}) {
  const { rowCount } = await runner(client).query(SQL_IS_BARBER_LINKED, [serviceId, barberId]);
  return rowCount > 0;
}

export async function count({ client } = {}) {
  const { rows } = await runner(client).query(SQL_COUNT_ALL);
  return rows[0].n;
}

export async function countLegacyNameEn({ client } = {}) {
  const { rows } = await runner(client).query(SQL_COUNT_LEGACY_NAME_EN);
  return rows[0].n;
}

export async function insert(service, { client } = {}) {
  await runner(client).query(SQL_INSERT_SERVICE, [
    service.id,
    service.namePL,
    service.nameEN,
    service.descPL,
    service.descEN,
    service.durationMin,
    service.durationLabel,
    service.pricePLN,
    service.delay,
    service.sortOrder,
    service.category,
  ]);
}

export async function linkBarber(serviceId, barberId, { client } = {}) {
  await runner(client).query(SQL_INSERT_SERVICE_BARBER_LINK, [serviceId, barberId]);
}

export async function updateNameEn(id, nameEn, { client } = {}) {
  await runner(client).query(SQL_UPDATE_NAME_EN, [nameEn, id]);
}
