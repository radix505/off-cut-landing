import { pool } from '../db.js';

const SELECT_BOOKING_BASE = `
  SELECT b.id, b.barber_id, ba.name AS barber_name,
         b.service_id, s.name_pl AS service_name, s.name_en AS service_name_en,
         s.duration_label AS service_duration_label, s.price_pln AS service_price_pln,
         b.duration_min, b.date, b.slot,
         b.name AS customer_name, b.phone, b.email, b.lang,
         b.status, b.is_block, b.created_at,
         b.confirmation_email_sent_at, b.received_email_sent_at
  FROM bookings b
         JOIN barbers ba ON ba.id = b.barber_id
         LEFT JOIN services s ON s.id = b.service_id
`;

const SQL_ACTIVE_BY_BARBER_DATE = `
  SELECT id, service_id, duration_min, slot, status, is_block
  FROM bookings
  WHERE barber_id = $1 AND date = $2 AND status IN ('pending','confirmed')
`;

const SQL_ACTIVE_BY_BARBER_DATE_EXCLUDING = `
  SELECT id, service_id, duration_min, slot, status, is_block
  FROM bookings
  WHERE barber_id = $1 AND date = $2 AND status IN ('pending','confirmed') AND id <> $3
`;

const SQL_LOCK_BY_ID = `SELECT * FROM bookings WHERE id = $1 FOR UPDATE`;
const SQL_UPDATE_DATE_SLOT = `UPDATE bookings SET date = $1, slot = $2 WHERE id = $3`;

const SQL_ACTIVE_BY_BARBER_RANGE = `
  SELECT date, slot, duration_min, is_block
  FROM bookings
  WHERE barber_id = $1 AND date BETWEEN $2 AND $3 AND status IN ('pending','confirmed')
`;

const SQL_COUNT_BY_DATE_FOR_BARBER = `
  SELECT date,
         COUNT(*) FILTER (WHERE NOT is_block)::int AS bookings,
         COUNT(*) FILTER (WHERE is_block)::int AS blocks
  FROM bookings
  WHERE barber_id = $1
    AND date BETWEEN $2 AND $3
    AND status IN ('pending','confirmed')
  GROUP BY date
`;

const SQL_BY_ID = `${SELECT_BOOKING_BASE} WHERE b.id = $1`;

const SQL_BY_DATE = `
  ${SELECT_BOOKING_BASE}
  WHERE b.date = $1
  ORDER BY ba.sort_order, ba.id, b.slot
`;

const SQL_BY_DATE_RANGE = `
  ${SELECT_BOOKING_BASE}
  WHERE b.date BETWEEN $1 AND $2
  ORDER BY b.date, ba.sort_order, ba.id, b.slot
`;

const SQL_PENDING_FROM = `
  ${SELECT_BOOKING_BASE}
  WHERE b.status = 'pending' AND b.is_block = false AND b.date >= $1
  ORDER BY b.date, b.slot
`;

const SQL_SEARCH_FROM = `
  ${SELECT_BOOKING_BASE}
  WHERE b.date >= $1
    AND b.is_block = false
    AND (LOWER(b.name) LIKE $2 OR REPLACE(REPLACE(REPLACE(b.phone,' ',''),'-',''),'(','') LIKE $3)
  ORDER BY b.date, b.slot
  LIMIT 20
`;

const SQL_BY_BARBER_DATE_FULL = `
  ${SELECT_BOOKING_BASE}
  WHERE b.barber_id = $1 AND b.date = $2 AND b.status IN ('pending','confirmed')
  ORDER BY b.slot
`;

const SQL_COUNT_BY_STATUS_IN_RANGE = `
  SELECT status, COUNT(*)::int AS n
  FROM bookings
  WHERE date BETWEEN $1 AND $2 AND is_block = false
  GROUP BY status
`;

const SQL_TOTAL_REVENUE_IN_RANGE = `
  SELECT COALESCE(SUM(s.price_pln), 0)::int AS pln
  FROM bookings b
         LEFT JOIN services s ON s.id = b.service_id
  WHERE b.date BETWEEN $1 AND $2 AND b.status IN ('pending','confirmed') AND b.is_block = false
`;

const SQL_UPDATE_STATUS = `UPDATE bookings SET status = $1 WHERE id = $2`;

const SQL_INSERT = `
  INSERT INTO bookings (barber_id, service_id, duration_min, date, slot, name, phone, email, lang)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
  RETURNING id
`;

const SQL_MARK_CONFIRMATION_EMAIL_SENT = `
  UPDATE bookings
     SET confirmation_email_sent_at = now()
   WHERE id = $1 AND confirmation_email_sent_at IS NULL
  RETURNING id
`;

const SQL_MARK_RECEIVED_EMAIL_SENT = `
  UPDATE bookings
     SET received_email_sent_at = now()
   WHERE id = $1 AND received_email_sent_at IS NULL
  RETURNING id
`;

const SQL_INSERT_BLOCK = `
  INSERT INTO bookings
    (barber_id, service_id, duration_min, date, slot, name, phone, status, is_block)
  VALUES ($1, '__block__', $2, $3, $4, 'BLOCK', '-', 'confirmed', true)
  RETURNING id
`;

const SQL_DELETE_BLOCK = `
  DELETE FROM bookings WHERE id = $1 AND is_block = true
`;

const ALLOWED_STATUSES = new Set(['pending', 'confirmed', 'cancelled']);

const runner = (client) => client ?? pool;

export async function findActiveByBarberAndDate(barberId, date, { client } = {}) {
  const { rows } = await runner(client).query(SQL_ACTIVE_BY_BARBER_DATE, [barberId, date]);
  return rows;
}

export async function findActiveByBarberAndDateExcluding(
  barberId, date, excludeId, { client } = {},
) {
  const { rows } = await runner(client).query(
    SQL_ACTIVE_BY_BARBER_DATE_EXCLUDING,
    [barberId, date, excludeId],
  );
  return rows;
}

export async function lockById(id, { client } = {}) {
  if (!client) throw new Error('lockById requires a transaction client');
  const { rows } = await client.query(SQL_LOCK_BY_ID, [id]);
  return rows[0] ?? null;
}

export async function updateDateAndSlot(id, date, slot, { client } = {}) {
  const { rowCount } = await runner(client).query(SQL_UPDATE_DATE_SLOT, [date, slot, id]);
  return rowCount > 0;
}

export async function findActiveByBarberAndRange(barberId, fromIso, toIso, { client } = {}) {
  const { rows } = await runner(client).query(SQL_ACTIVE_BY_BARBER_RANGE, [barberId, fromIso, toIso]);
  return rows;
}

export async function findById(id, { client } = {}) {
  const { rows } = await runner(client).query(SQL_BY_ID, [id]);
  return rows[0] ?? null;
}

export async function findByDate(isoDate, { client } = {}) {
  const { rows } = await runner(client).query(SQL_BY_DATE, [isoDate]);
  return rows;
}

export async function findByRange(fromIso, toIso, { client } = {}) {
  const { rows } = await runner(client).query(SQL_BY_DATE_RANGE, [fromIso, toIso]);
  return rows;
}

export async function findPendingFrom(isoDate, { client } = {}) {
  const { rows } = await runner(client).query(SQL_PENDING_FROM, [isoDate]);
  return rows;
}

export async function search(query, fromIso, { client } = {}) {
  const q = query.trim().toLowerCase();
  const namePat = `%${q}%`;
  const phoneClean = q.replace(/[\s\-()]/g, '');
  const phonePat = `%${phoneClean}%`;
  const { rows } = await runner(client).query(SQL_SEARCH_FROM, [fromIso, namePat, phonePat]);
  return rows;
}

export async function findByBarberAndDate(barberId, isoDate, { client } = {}) {
  const { rows } = await runner(client).query(SQL_BY_BARBER_DATE_FULL, [barberId, isoDate]);
  return rows;
}

export async function countByDateForBarber(barberId, fromIso, toIso, { client } = {}) {
  const { rows } = await runner(client).query(SQL_COUNT_BY_DATE_FOR_BARBER, [barberId, fromIso, toIso]);
  return rows;
}

export async function getStats(fromIso, toIso, { client } = {}) {
  const r = runner(client);
  const { rows: counts } = await r.query(SQL_COUNT_BY_STATUS_IN_RANGE, [fromIso, toIso]);
  const out = { pending: 0, confirmed: 0, cancelled: 0 };
  for (const row of counts) out[row.status] = row.n;
  const { rows: revRows } = await r.query(SQL_TOTAL_REVENUE_IN_RANGE, [fromIso, toIso]);
  return { ...out, revenuePln: revRows[0]?.pln ?? 0 };
}

export async function updateStatus(id, status, { client } = {}) {
  if (!ALLOWED_STATUSES.has(status)) {
    throw new Error(`invalid status: ${status}`);
  }
  return runner(client).query(SQL_UPDATE_STATUS, [status, id]);
}

export async function insert(
  { barberId, serviceId, durationMin, date, slot, name, phone, email, lang },
  { client } = {},
) {
  const { rows } = await runner(client).query(SQL_INSERT, [
    barberId, serviceId, durationMin, date, slot, name, phone,
    email ?? null, lang ?? 'pl',
  ]);
  return rows[0].id;
}

export async function markConfirmationEmailSent(id, { client } = {}) {
  const { rows } = await runner(client).query(SQL_MARK_CONFIRMATION_EMAIL_SENT, [id]);
  return rows.length > 0;
}

export async function markReceivedEmailSent(id, { client } = {}) {
  const { rows } = await runner(client).query(SQL_MARK_RECEIVED_EMAIL_SENT, [id]);
  return rows.length > 0;
}

export async function insertBlock(
  { barberId, durationMin, date, slot },
  { client } = {},
) {
  const { rows } = await runner(client).query(SQL_INSERT_BLOCK, [
    barberId, durationMin, date, slot,
  ]);
  return rows[0].id;
}

export async function deleteBlock(id, { client } = {}) {
  const { rowCount } = await runner(client).query(SQL_DELETE_BLOCK, [id]);
  return rowCount > 0;
}
