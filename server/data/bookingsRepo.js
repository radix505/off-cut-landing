import { pool } from '../db.js';

const SELECT_BOOKING_BASE = `
  SELECT b.id, b.barber_id, ba.name AS barber_name,
         b.service_id, s.name_pl AS service_name,
         b.duration_min, b.date, b.slot,
         b.name AS customer_name, b.phone, b.status, b.is_block, b.created_at
  FROM bookings b
         JOIN barbers ba ON ba.id = b.barber_id
         LEFT JOIN services s ON s.id = b.service_id
`;

const SQL_ACTIVE_BY_BARBER_DATE = `
  SELECT id, service_id, duration_min, slot, status, is_block
  FROM bookings
  WHERE barber_id = $1 AND date = $2 AND status IN ('pending','confirmed')
`;

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
  INSERT INTO bookings (barber_id, service_id, duration_min, date, slot, name, phone)
  VALUES ($1, $2, $3, $4, $5, $6, $7)
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

export async function findActiveByBarberAndRange(barberId, fromIso, toIso, { client } = {}) {
  const { rows } = await runner(client).query(SQL_ACTIVE_BY_BARBER_RANGE, [barberId, fromIso, toIso]);
  return rows;
}
