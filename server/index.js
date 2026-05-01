import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import bookingsRoutes from './routes/bookings.js';

const fastify = Fastify({
  logger: { level: process.env.LOG_LEVEL ?? 'info' },
});

if (process.env.NODE_ENV !== 'production') {
  await fastify.register(cors, { origin: true });
}

await fastify.register(bookingsRoutes);

fastify.get('/api/health', () => ({ ok: true }));

const PORT = Number(process.env.PORT ?? 3001);
const HOST = process.env.HOST ?? '127.0.0.1';

try {
  await fastify.listen({ port: PORT, host: HOST });
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
