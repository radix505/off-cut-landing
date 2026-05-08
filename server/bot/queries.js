import { db } from '../db.js';

const SELECT_BOOKING_BASE = `
  SELECT b.id, b.barber_id, ba.name AS barber_name,
         b.service_id, s.name_pl AS service_name,
         b.duration_min, b.date, b.slot,
         b.name AS customer_name, b.phone, b.status, b.created_at
  FROM bookings b
  JOIN barbers ba ON ba.id = b.barber_id
  LEFT JOIN services s ON s.id = b.service_id
`;

const stmts = {
  byId: db.prepare(`${SELECT_BOOKING_BASE} WHERE b.id = ?`),

  byDate: db.prepare(`
    ${SELECT_BOOKING_BASE}
    WHERE b.date = ?
    ORDER BY ba.sort_order, ba.id, b.slot
  `),

  byDateRange: db.prepare(`
    ${SELECT_BOOKING_BASE}
    WHERE b.date BETWEEN ? AND ?
    ORDER BY b.date, ba.sort_order, ba.id, b.slot
  `),

  pendingFromDate: db.prepare(`
    ${SELECT_BOOKING_BASE}
    WHERE b.status = 'pending' AND b.date >= ?
    ORDER BY b.date, b.slot
  `),

  searchFromDate: db.prepare(`
    ${SELECT_BOOKING_BASE}
    WHERE b.date >= ?
      AND (LOWER(b.name) LIKE ? OR REPLACE(REPLACE(REPLACE(b.phone,' ',''),'-',''),'(','') LIKE ?)
    ORDER BY b.date, b.slot
    LIMIT 20
  `),

  countByStatusInRange: db.prepare(`
    SELECT status, COUNT(*) AS n
    FROM bookings
    WHERE date BETWEEN ? AND ?
    GROUP BY status
  `),

  totalRevenueInRange: db.prepare(`
    SELECT COALESCE(SUM(s.price_pln), 0) AS pln
    FROM bookings b
    LEFT JOIN services s ON s.id = b.service_id
    WHERE b.date BETWEEN ? AND ? AND b.status IN ('pending','confirmed')
  `),

  setStatus: db.prepare(`UPDATE bookings SET status = ? WHERE id = ?`),

  barbersList: db.prepare(`
    SELECT id, name, title_pl FROM barbers WHERE active = 1 ORDER BY sort_order, id
  `),

  servicesList: db.prepare(`
    SELECT id, name_pl, duration_label, price_pln FROM services
    WHERE active = 1 ORDER BY sort_order, id
  `),
};

export function getBookingById(id) {
  return stmts.byId.get(id) ?? null;
}

export function getBookingsByDate(isoDate) {
  return stmts.byDate.all(isoDate);
}

export function getBookingsByRange(fromIso, toIso) {
  return stmts.byDateRange.all(fromIso, toIso);
}

export function getPendingFrom(isoDate) {
  return stmts.pendingFromDate.all(isoDate);
}

export function searchBookings(query, fromIso) {
  const q = query.trim().toLowerCase();
  const namePat = `%${q}%`;
  const phoneClean = q.replace(/[\s\-()]/g, '');
  const phonePat = `%${phoneClean}%`;
  return stmts.searchFromDate.all(fromIso, namePat, phonePat);
}

export function getStats(fromIso, toIso) {
  const rows = stmts.countByStatusInRange.all(fromIso, toIso);
  const counts = { pending: 0, confirmed: 0, cancelled: 0 };
  for (const r of rows) counts[r.status] = r.n;
  const { pln } = stmts.totalRevenueInRange.get(fromIso, toIso);
  return { ...counts, revenuePln: pln };
}

export function setBookingStatus(id, status) {
  if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
    throw new Error(`invalid status: ${status}`);
  }
  return stmts.setStatus.run(status, id);
}

export function listBarbers() {
  return stmts.barbersList.all();
}

export function listServices() {
  return stmts.servicesList.all();
}
