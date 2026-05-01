import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DB_PATH ?? resolve(here, '..', 'data', 'bookings.sqlite');

mkdirSync(dirname(DB_PATH), { recursive: true });

export const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS bookings (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    barber_id    TEXT NOT NULL,
    service_id   TEXT NOT NULL,
    duration_min INTEGER NOT NULL,
    date         TEXT NOT NULL,
    slot         TEXT NOT NULL,
    name         TEXT NOT NULL,
    phone        TEXT NOT NULL,
    status       TEXT NOT NULL DEFAULT 'pending'
                   CHECK(status IN ('pending','confirmed','cancelled')),
    created_at   TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(barber_id, date, slot)
  )`,
  `CREATE INDEX IF NOT EXISTS idx_bookings_lookup ON bookings(barber_id, date)`,
];
for (const sql of SCHEMA) db.prepare(sql).run();

export const stmts = {
  bookingsForBarberDate: db.prepare(`
    SELECT id, service_id, duration_min, slot, status
    FROM bookings
    WHERE barber_id = ? AND date = ? AND status IN ('pending','confirmed')
  `),
  insertBooking: db.prepare(`
    INSERT INTO bookings (barber_id, service_id, duration_min, date, slot, name, phone)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `),
};

export const beginImmediate = db.prepare('BEGIN IMMEDIATE');
export const commit = db.prepare('COMMIT');
export const rollback = db.prepare('ROLLBACK');
