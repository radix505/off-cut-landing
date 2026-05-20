import { pool } from '../db.js';

const SQL_LIST_FOR_CATALOG = `
  SELECT id, name, photo, title_pl, title_en, slug, delay,
         bio_pl, bio_en, long_bio_pl, long_bio_en, suspended
  FROM barbers
  WHERE active = 1
  ORDER BY sort_order, id
`;

const SQL_LIST_ACTIVE_BRIEF = `
  SELECT id, name, title_pl
  FROM barbers
  WHERE active = 1 AND suspended = false
  ORDER BY sort_order, id
`;

const SQL_ACTIVE_IDS = `SELECT id FROM barbers WHERE active = 1 AND suspended = false`;

const SQL_LIST_TAGS = `
  SELECT barber_id, tag_pl, tag_en
  FROM barber_tags
  ORDER BY barber_id, sort_order
`;

const SQL_GET_ID_BY_SLUG = `SELECT id FROM barbers WHERE slug = $1`;

const SQL_COUNT_MISSING_DETAILS = `
  SELECT COUNT(*)::int AS n
  FROM barbers
  WHERE slug IS NULL OR bio_pl IS NULL
`;

const SQL_INSERT_BARBER = `
  INSERT INTO barbers
    (name, photo, title_pl, title_en, sort_order, slug, bio_pl, bio_en, long_bio_pl, long_bio_en, delay)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
  RETURNING id
`;

const SQL_UPDATE_DETAILS_BY_SLUG = `
  UPDATE barbers
  SET slug = $1, bio_pl = $2, bio_en = $3, long_bio_pl = $4, long_bio_en = $5, delay = $6
  WHERE slug = $7
`;

const SQL_DELETE_TAGS = `DELETE FROM barber_tags WHERE barber_id = $1`;

const SQL_INSERT_TAG = `
  INSERT INTO barber_tags (barber_id, tag_pl, tag_en, sort_order)
  VALUES ($1, $2, $3, $4)
`;

const runner = (client) => client ?? pool;

export async function listForCatalog({ client } = {}) {
  const { rows } = await runner(client).query(SQL_LIST_FOR_CATALOG);
  return rows;
}

export async function listActiveBrief({ client } = {}) {
  const { rows } = await runner(client).query(SQL_LIST_ACTIVE_BRIEF);
  return rows;
}

export async function getActiveIdSet({ client } = {}) {
  const { rows } = await runner(client).query(SQL_ACTIVE_IDS);
  return new Set(rows.map((r) => r.id));
}

export async function listTags({ client } = {}) {
  const { rows } = await runner(client).query(SQL_LIST_TAGS);
  return rows;
}

export async function getIdBySlug(slug, { client } = {}) {
  const { rows } = await runner(client).query(SQL_GET_ID_BY_SLUG, [slug]);
  return rows[0]?.id ?? null;
}

export async function countMissingDetails({ client } = {}) {
  const { rows } = await runner(client).query(SQL_COUNT_MISSING_DETAILS);
  return rows[0].n;
}

export async function insert(barber, { client } = {}) {
  const { rows } = await runner(client).query(SQL_INSERT_BARBER, [
    barber.name,
    barber.photo,
    barber.titlePL,
    barber.titleEN,
    barber.sortOrder,
    barber.slug,
    barber.bioPL,
    barber.bioEN,
    barber.longBioPL,
    barber.longBioEN,
    barber.delay,
  ]);
  return rows[0].id;
}

export async function updateDetailsBySlug(barber, { client } = {}) {
  await runner(client).query(SQL_UPDATE_DETAILS_BY_SLUG, [
    barber.slug,
    barber.bioPL,
    barber.bioEN,
    barber.longBioPL,
    barber.longBioEN,
    barber.delay,
    barber.slug,
  ]);
}

export async function deleteTags(barberId, { client } = {}) {
  await runner(client).query(SQL_DELETE_TAGS, [barberId]);
}

export async function insertTag(tag, { client } = {}) {
  await runner(client).query(SQL_INSERT_TAG, [
    tag.barberId,
    tag.pl,
    tag.en,
    tag.sortOrder,
  ]);
}
