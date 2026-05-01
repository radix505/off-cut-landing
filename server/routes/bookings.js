import { stmts, beginImmediate, commit, rollback } from '../db.js';
import { computeUnavailable, blockOverlapsExisting } from '../availability.js';
import { BARBERS, SERVICES, buildSlotsForISODate } from '../../src/data/booking-config.js';

const BARBER_IDS = new Set(BARBERS.map(b => b.id));
const SERVICE_BY_ID = Object.fromEntries(SERVICES.map(s => [s.id, s]));

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
          barberId: { type: 'string', minLength: 1 },
          date:     { type: 'string', pattern: ISO_DATE.source },
        },
      },
    },
    handler: (req, reply) => {
      const { barberId, date } = req.query;
      if (!BARBER_IDS.has(barberId)) {
        return reply.code(422).send({ error: 'unknown_barber' });
      }
      const rows = stmts.bookingsForBarberDate.all(barberId, date);
      const unavailable = [...computeUnavailable(rows, date)].sort();
      return { unavailable };
    },
  });

  fastify.post('/api/bookings', {
    schema: {
      body: {
        type: 'object',
        required: ['barberId', 'serviceId', 'date', 'slot', 'name', 'phone'],
        additionalProperties: false,
        properties: {
          barberId:  { type: 'string', minLength: 1 },
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

      if (!BARBER_IDS.has(barberId)) return reply.code(422).send({ error: 'unknown_barber' });
      const service = SERVICE_BY_ID[serviceId];
      if (!service) return reply.code(422).send({ error: 'unknown_service' });

      if (date < todayInWarsaw()) {
        return reply.code(400).send({ error: 'date_in_past' });
      }

      const grid = buildSlotsForISODate(date);
      if (!grid.includes(slot)) {
        return reply.code(400).send({ error: 'slot_outside_hours' });
      }
      const blocks = Math.ceil(service.durationMin / 30);
      const startIdx = grid.indexOf(slot);
      if (startIdx + blocks > grid.length) {
        return reply.code(400).send({ error: 'service_exceeds_hours' });
      }

      beginImmediate.run();
      try {
        const existing = stmts.bookingsForBarberDate.all(barberId, date);
        if (blockOverlapsExisting(slot, service.durationMin, existing, date)) {
          rollback.run();
          return reply.code(409).send({ error: 'slot_taken' });
        }
        const result = stmts.insertBooking.run(
          barberId, serviceId, service.durationMin, date, slot, name.trim(), phone.trim()
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
