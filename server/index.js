import 'dotenv/config';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import bookingsRoutes from './routes/bookings.js';
import catalogRoutes from './routes/catalog.js';
import { seedCatalogIfEmpty, backfillBarberDetailsIfMissing } from './seed-catalog.js';
import { startBot, stopBot } from './bot/index.js';

const here = dirname(fileURLToPath(import.meta.url));
const isProd = process.env.NODE_ENV === 'production';

const fastify = Fastify({
  logger: { level: process.env.LOG_LEVEL ?? 'info' },
});

seedCatalogIfEmpty(fastify.log);
backfillBarberDetailsIfMissing(fastify.log);

if (!isProd) {
  await fastify.register(cors, { origin: true });
}

await fastify.register(catalogRoutes);
await fastify.register(bookingsRoutes);

fastify.get('/api/health', () => ({ ok: true }));

if (isProd) {
  const distRoot = resolve(here, '..', 'dist');
  if (!existsSync(distRoot)) {
    fastify.log.error({ distRoot }, 'dist/ not found — run `npm run build` before starting in production');
    process.exit(1);
  }
  await fastify.register(fastifyStatic, { root: distRoot, wildcard: false });
  fastify.setNotFoundHandler((req, reply) => {
    if (req.raw.url?.startsWith('/api/')) {
      return reply.code(404).send({ error: 'not_found' });
    }
    return reply.sendFile('index.html');
  });
}

const PORT = Number(process.env.PORT ?? 3001);
const HOST = process.env.HOST ?? (isProd ? '0.0.0.0' : '127.0.0.1');

try {
  await fastify.listen({ port: PORT, host: HOST });
  await startBot({ log: fastify.log });
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}

for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, async () => {
    fastify.log.info({ sig }, 'shutting down');
    await stopBot();
    await fastify.close();
    process.exit(0);
  });
}
