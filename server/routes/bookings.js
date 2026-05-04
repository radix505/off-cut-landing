import { stmts, beginImmediate, commit, rollback } from '../db.js';
import { computeUnavailable, blockOverlapsExisting } from '../availability.js';
import { getBarberIdSet, getServiceById } from '../catalog.js';
import { buildSlotsForISODate } from '../../src/data/booking-config.js';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const SLOT     = /^\d{2}:\d{2}$/;
const PHONE    = /^[+\d\s\-()]{7,20}$/;

function todayInWarsaw() {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Warsaw',
    year: 'numeric', month: '2-digit', day: '2-digit',
  });
  return fmt.format(new Date());
}

export default async function bookingsRoutes(fastify) {
  fastify.get('/api/availability', {
    schema: {
      querystring: {
        type: 'object',
        required: ['barberId', 'date'],
        properties: {
          barberId: { type: 'integer', minimum: 1 },
          date:     { type: 'string', pattern: ISO_DATE.source },
        },
      },
    },
    handler: (req, reply) => {
      const { barberId, date } = req.query;
      if (!getBarberIdSet().has(barberId)) {
        return reply.code(422).send({ error: 'unknown_barber' });
      }
      const rows = stmts.bookingsForBarberDate.all(barberId, date);
      const unavailable = [...computeUnavailable(rows, date)].sort();
      return { unavailable };
    },
  });

  fastify.get('/api/availability/month', {
    schema: {
      querystring: {
        type: 'object',
        required: ['barberId', 'serviceId', 'year', 'month'],
        properties: {
          barberId:  { type: 'integer', minimum: 1 },
          serviceId: { type: 'string', minLength: 1 },
          year:      { type: 'integer', minimum: 2020, maximum: 2100 },
          month:     { type: 'integer', minimum: 1, maximum: 12 },
        },
      },
    },
    handler: (req, reply) => {
      const { barberId, serviceId, year, month } = req.query;
      if (!getBarberIdSet().has(barberId)) return reply.code(422).send({ error: 'unknown_barber' });
      const service = getServiceById(serviceId);
      if (!service) return reply.code(422).send({ error: 'unknown_service' });

      const mm = String(month).padStart(2, '0');
      const lastDay = new Date(year, month, 0).getDate();
      const firstISO = `${year}-${mm}-01`;
      const lastISO  = `${year}-${mm}-${String(lastDay).padStart(2, '0')}`;

      const rows = stmts.bookingsForBarberRange.all(barberId, firstISO, lastISO);
      const byDate = new Map();
      for (const r of rows) {
        if (!byDate.has(r.date)) byDate.set(r.date, []);
        byDate.get(r.date).push(r);
      }

      const today = todayInWarsaw();
      const blocks = Math.ceil(service.duration_min / 30);
      const fullyBookedDates = [];

      for (let d = 1; d <= lastDay; d++) {
        const iso = `${year}-${mm}-${String(d).padStart(2, '0')}`;
        if (iso < today) continue;
        const grid = buildSlotsForISODate(iso);
        if (grid.length === 0) continue; // closed day; FE handles
        const dayBookings = byDate.get(iso) ?? [];
        let hasFreeStart = false;
        for (let i = 0; i + blocks <= grid.length; i++) {
          if (!blockOverlapsExisting(grid[i], service.duration_min, dayBookings, iso)) {
            hasFreeStart = true;
            break;
          }
        }
        if (!hasFreeStart) fullyBookedDates.push(iso);
      }

      return { fullyBookedDates };
    },
  });

  fastify.post('/api/bookings', {
    schema: {
      body: {
        type: 'object',
        required: ['barberId', 'serviceId', 'date', 'slot', 'name', 'phone'],
        additionalProperties: false,
        properties: {
          barberId:  { type: 'integer', minimum: 1 },
          serviceId: { type: 'string', minLength: 1 },
          date:      { type: 'string', pattern: ISO_DATE.source },
          slot:      { type: 'string', pattern: SLOT.source },
          name:      { type: 'string', minLength: 2, maxLength: 100 },
          phone:     { type: 'string', pattern: PHONE.source },
        },
      },
    },
    handler: (req, reply) => {
      const { barberId, serviceId, date, slot, name, phone } = req.body;

      if (!getBarberIdSet().has(barberId)) return reply.code(422).send({ error: 'unknown_barber' });
      const service = getServiceById(serviceId);
      if (!service) return reply.code(422).send({ error: 'unknown_service' });

      if (date < todayInWarsaw()) {
        return reply.code(400).send({ error: 'date_in_past' });
      }

      const grid = buildSlotsForISODate(date);
      if (!grid.includes(slot)) {
        return reply.code(400).send({ error: 'slot_outside_hours' });
      }
      const blocks = Math.ceil(service.duration_min / 30);
      const startIdx = grid.indexOf(slot);
      if (startIdx + blocks > grid.length) {
        return reply.code(400).send({ error: 'service_exceeds_hours' });
      }

      beginImmediate.run();
      try {
        const existing = stmts.bookingsForBarberDate.all(barberId, date);
        if (blockOverlapsExisting(slot, service.duration_min, existing, date)) {
          rollback.run();
          return reply.code(409).send({ error: 'slot_taken' });
        }
        const result = stmts.insertBooking.run(
          barberId, serviceId, service.duration_min, date, slot, name.trim(), phone.trim()
        );
        commit.run();
        return reply.code(201).send({ id: result.lastInsertRowid, status: 'pending' });
      } catch (err) {
        try { rollback.run(); } catch {}
        if (err && err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
          return reply.code(409).send({ error: 'slot_taken' });
        }
        req.log.error(err);
        return reply.code(500).send({ error: 'internal' });
      }
    },
  });
}
