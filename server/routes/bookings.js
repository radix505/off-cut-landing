import { withTransaction } from '../db.js';
import { computeUnavailableStarts, blockOverlapsExisting } from '../availability.js';
import { getBarberIdSet, getServiceById, isBarberLinkedToService } from '../catalog.js';
import { buildSlotsForISODate } from '../../src/data/booking-config.js';
import { SLOT_STEP_MIN } from '../../src/data/businessHours.js';
import * as bookingsRepo from '../data/bookingsRepo.js';
import { notifyNewBooking } from '../bot/index.js';

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
        required: ['barberId', 'date', 'serviceId'],
        properties: {
          barberId:  { type: 'integer', minimum: 1 },
          date:      { type: 'string', pattern: ISO_DATE.source },
          serviceId: { type: 'string', minLength: 1 },
        },
      },
    },
    handler: async (req, reply) => {
      const { barberId, date, serviceId } = req.query;
      const ids = await getBarberIdSet();
      if (!ids.has(barberId)) {
        return reply.code(422).send({ error: 'unknown_barber' });
      }
      const service = await getServiceById(serviceId);
      if (!service) {
        return reply.code(422).send({ error: 'unknown_service' });
      }
      const rows = await bookingsRepo.findActiveByBarberAndDate(barberId, date);
      const unavailable = [...computeUnavailableStarts(rows, date, service.duration_min)].sort();
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
    handler: async (req, reply) => {
      const { barberId, serviceId, year, month } = req.query;
      const ids = await getBarberIdSet();
      if (!ids.has(barberId)) return reply.code(422).send({ error: 'unknown_barber' });
      const service = await getServiceById(serviceId);
      if (!service) return reply.code(422).send({ error: 'unknown_service' });

      const mm = String(month).padStart(2, '0');
      const lastDay = new Date(year, month, 0).getDate();
      const firstISO = `${year}-${mm}-01`;
      const lastISO  = `${year}-${mm}-${String(lastDay).padStart(2, '0')}`;

      const rows = await bookingsRepo.findActiveByBarberAndRange(barberId, firstISO, lastISO);
      const byDate = new Map();
      for (const r of rows) {
        if (!byDate.has(r.date)) byDate.set(r.date, []);
        byDate.get(r.date).push(r);
      }

      const today = todayInWarsaw();
      const blocks = Math.ceil(service.duration_min / SLOT_STEP_MIN);
      const fullyBookedDates = [];

      for (let d = 1; d <= lastDay; d++) {
        const iso = `${year}-${mm}-${String(d).padStart(2, '0')}`;
        if (iso < today) continue;
        const grid = buildSlotsForISODate(iso);
        if (grid.length === 0) continue;
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
    handler: async (req, reply) => {
      const { barberId, serviceId, date, slot, name, phone } = req.body;

      const ids = await getBarberIdSet();
      if (!ids.has(barberId)) return reply.code(422).send({ error: 'unknown_barber' });
      const service = await getServiceById(serviceId);
      if (!service) return reply.code(422).send({ error: 'unknown_service' });
      if (!(await isBarberLinkedToService(barberId, serviceId))) {
        return reply.code(422).send({ error: 'barber_service_mismatch' });
      }

      if (date < todayInWarsaw()) {
        return reply.code(400).send({ error: 'date_in_past' });
      }

      const grid = buildSlotsForISODate(date);
      if (!grid.includes(slot)) {
        return reply.code(400).send({ error: 'slot_outside_hours' });
      }
      const blocks = Math.ceil(service.duration_min / SLOT_STEP_MIN);
      const startIdx = grid.indexOf(slot);
      if (startIdx + blocks > grid.length) {
        return reply.code(400).send({ error: 'service_exceeds_hours' });
      }

      try {
        const newId = await withTransaction(async (client) => {
          const existing = await bookingsRepo.findActiveByBarberAndDate(barberId, date, { client });
          if (blockOverlapsExisting(slot, service.duration_min, existing, date)) {
            const err = new Error('slot_taken');
            err.code = 'SLOT_TAKEN';
            throw err;
          }
          return bookingsRepo.insert(
            {
              barberId,
              serviceId,
              durationMin: service.duration_min,
              date,
              slot,
              name: name.trim(),
              phone: phone.trim(),
            },
            { client },
          );
        });

        const created = await bookingsRepo.findById(newId);
        if (created) {
          notifyNewBooking(created).catch((err) => req.log.warn({ err }, 'notifyNewBooking failed'));
        }
        return reply.code(201).send({ id: newId, status: 'pending' });
      } catch (err) {
        if (err?.code === 'SLOT_TAKEN' || err?.code === '23505') {
          return reply.code(409).send({ error: 'slot_taken' });
        }
        req.log.error(err);
        return reply.code(500).send({ error: 'internal' });
      }
    },
  });
}
