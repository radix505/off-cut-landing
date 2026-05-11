import pg from 'pg';
import { initSchema as runInitSchema, ping } from './data/schema.js';

const { Pool } = pg;

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

export const pool = new Pool({
  connectionString: DATABASE_URL,
  max: Number(process.env.PG_POOL_MAX ?? 10),
  idleTimeoutMillis: 30_000,
});

pool.on('error', (err) => {
  console.error('pg pool error', err);
});

export { ping };

export async function waitForDb({ retries = 30, delayMs = 1000, log } = {}) {
  for (let i = 0; i < retries; i++) {
    try {
      const client = await pool.connect();
      try {
        await ping(client);
      } finally {
        client.release();
      }
      return;
    } catch (err) {
      log?.warn?.({ err: err.message, attempt: i + 1 }, 'postgres not ready, retrying');
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  throw new Error(`postgres unreachable after ${retries} attempts`);
}

export async function initSchema() {
  await runInitSchema(pool);
}

export async function query(text, params) {
  return pool.query(text, params);
}

export async function withTransaction(fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    try { await client.query('ROLLBACK'); } catch {}
    throw err;
  } finally {
    client.release();
  }
}
