import { pool } from '../db.js';

const SELECT_BOOKING_BASE = `
  SELECT b.id, b.barber_id, ba.name AS barber_name,
         b.service_id, s.name_pl AS service_name,
         b.duration_min, b.date, b.slot,
         b.name AS customer_name, b.phone, b.status, b.created_at
  FROM bookings b
  JOIN barbers ba ON ba.id = b.barber_id
  LEFT JOIN services s ON s.id = b.service_id
`;

const SQL_ACTIVE_BY_BARBER_DATE = `
  SELECT id, service_id, duration_min, slot, status
  FROM bookings
  WHERE barber_id = $1 AND date = $2 AND status IN ('pending','confirmed')
`;

const SQL_ACTIVE_BY_BARBER_RANGE = `
  SELECT date, slot, duration_min
  FROM bookings
  WHERE barber_id = $1 AND date BETWEEN $2 AND $3 AND status IN ('pending','confirmed')
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
  WHERE b.status = 'pending' AND b.date >= $1
  ORDER BY b.date, b.slot
`;

const SQL_SEARCH_FROM = `
  ${SELECT_BOOKING_BASE}
  WHERE b.date >= $1
    AND (LOWER(b.name) LIKE $2 OR REPLACE(REPLACE(REPLACE(b.phone,' ',''),'-',''),'(','') LIKE $3)
  ORDER BY b.date, b.slot
  LIMIT 20
`;

const SQL_COUNT_BY_STATUS_IN_RANGE = `
  SELECT status, COUNT(*)::int AS n
  FROM bookings
  WHERE date BETWEEN $1 AND $2
  GROUP BY status
`;

const SQL_TOTAL_REVENUE_IN_RANGE = `
  SELECT COALESCE(SUM(s.price_pln), 0)::int AS pln
  FROM bookings b
  LEFT JOIN services s ON s.id = b.service_id
  WHERE b.date BETWEEN $1 AND $2 AND b.status IN ('pending','confirmed')
`;

const SQL_UPDATE_STATUS = `UPDATE bookings SET status = $1 WHERE id = $2`;

const SQL_INSERT = `
  INSERT INTO bookings (barber_id, service_id, duration_min, date, slot, name, phone)
  VALUES ($1, $2, $3, $4, $5, $6, $7)
  RETURNING id
`;

const ALLOWED_STATUSES = new Set(['pending', 'confirmed', 'cancelled']);

const runner = (client) => client ?? pool;

export async function findActiveByBarberAndDate(barberId, date, { client } = {}) {
  const { rows } = await runner(client).query(SQL_ACTIVE_BY_BARBER_DATE, [barberId, date]);
  return rows;
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
  { barberId, serviceId, durationMin, date, slot, name, phone },
  { client } = {},
) {
  const { rows } = await runner(client).query(SQL_INSERT, [
    barberId, serviceId, durationMin, date, slot, name, phone,
  ]);
  return rows[0].id;
}
