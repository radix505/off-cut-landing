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

const run = (sql) => db.prepare(sql).run();

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS barbers (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    name         TEXT NOT NULL,
    photo        TEXT NOT NULL,
    title_pl     TEXT NOT NULL,
    title_en     TEXT NOT NULL,
    sort_order   INTEGER NOT NULL DEFAULT 0,
    active       INTEGER NOT NULL DEFAULT 1,
    slug         TEXT,
    bio_pl       TEXT,
    bio_en       TEXT,
    long_bio_pl  TEXT,
    long_bio_en  TEXT,
    delay        INTEGER NOT NULL DEFAULT 0
  )`,
  `CREATE INDEX IF NOT EXISTS idx_barbers_slug ON barbers(slug)`,

  `CREATE TABLE IF NOT EXISTS services (
    id             TEXT PRIMARY KEY,
    name_pl        TEXT NOT NULL,
    name_en        TEXT NOT NULL,
    desc_pl        TEXT NOT NULL,
    desc_en        TEXT NOT NULL,
    duration_min   INTEGER NOT NULL,
    duration_label TEXT NOT NULL,
    price_pln      INTEGER NOT NULL,
    delay          INTEGER NOT NULL DEFAULT 0,
    sort_order     INTEGER NOT NULL,
    active         INTEGER NOT NULL DEFAULT 1
  )`,

  `CREATE TABLE IF NOT EXISTS bookings (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    barber_id    INTEGER NOT NULL REFERENCES barbers(id),
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

  `CREATE TABLE IF NOT EXISTS service_barbers (
    service_id TEXT    NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    barber_id  INTEGER NOT NULL REFERENCES barbers(id)  ON DELETE CASCADE,
    PRIMARY KEY (service_id, barber_id)
  )`,

  `CREATE TABLE IF NOT EXISTS barber_tags (
    barber_id  INTEGER NOT NULL REFERENCES barbers(id) ON DELETE CASCADE,
    tag_pl     TEXT NOT NULL,
    tag_en     TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (barber_id, tag_en)
  )`,
];
for (const sql of SCHEMA) run(sql);

migrateBarbersToIntegerId();

function migrateBarbersToIntegerId() {
  const probe = db.prepare(`SELECT typeof(id) AS t FROM barbers LIMIT 1`).get();
  if (!probe || probe.t === 'integer') return;

  db.pragma('foreign_keys = OFF');
  try {
    db.transaction(() => {
      const oldBarbers = db.prepare(`SELECT * FROM barbers ORDER BY sort_order, id`).all();

      run(`ALTER TABLE barbers RENAME TO _barbers_text_id`);
      run(`CREATE TABLE barbers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL, photo TEXT NOT NULL,
        title_pl TEXT NOT NULL, title_en TEXT NOT NULL,
        sort_order INTEGER NOT NULL DEFAULT 0,
        active INTEGER NOT NULL DEFAULT 1,
        slug TEXT, bio_pl TEXT, bio_en TEXT,
        long_bio_pl TEXT, long_bio_en TEXT,
        delay INTEGER NOT NULL DEFAULT 0
      )`);

      const insertNew = db.prepare(`
        INSERT INTO barbers
          (name, photo, title_pl, title_en, sort_order, active, slug, bio_pl, bio_en, long_bio_pl, long_bio_en, delay)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const idMap = new Map();
      for (const r of oldBarbers) {
        const res = insertNew.run(
          r.name, r.photo, r.title_pl, r.title_en, r.sort_order, r.active ?? 1,
          r.slug ?? r.id, r.bio_pl, r.bio_en, r.long_bio_pl, r.long_bio_en, r.delay ?? 0
        );
        idMap.set(r.id, res.lastInsertRowid);
      }

      remapFkTable('bookings', idMap, `
        CREATE TABLE bookings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          barber_id INTEGER NOT NULL REFERENCES barbers(id),
          service_id TEXT NOT NULL,
          duration_min INTEGER NOT NULL,
          date TEXT NOT NULL,
          slot TEXT NOT NULL,
          name TEXT NOT NULL,
          phone TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','confirmed','cancelled')),
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          UNIQUE(barber_id, date, slot)
        )
      `);
      run(`CREATE INDEX IF NOT EXISTS idx_bookings_lookup ON bookings(barber_id, date)`);

      remapFkTable('service_barbers', idMap, `
        CREATE TABLE service_barbers (
          service_id TEXT    NOT NULL REFERENCES services(id) ON DELETE CASCADE,
          barber_id  INTEGER NOT NULL REFERENCES barbers(id)  ON DELETE CASCADE,
          PRIMARY KEY (service_id, barber_id)
        )
      `);

      remapFkTable('barber_tags', idMap, `
        CREATE TABLE barber_tags (
          barber_id INTEGER NOT NULL REFERENCES barbers(id) ON DELETE CASCADE,
          tag_pl TEXT NOT NULL,
          tag_en TEXT NOT NULL,
          sort_order INTEGER NOT NULL DEFAULT 0,
          PRIMARY KEY (barber_id, tag_en)
        )
      `);

      run(`DROP TABLE _barbers_text_id`);
      run(`CREATE INDEX IF NOT EXISTS idx_barbers_slug ON barbers(slug)`);
    })();
  } finally {
    db.pragma('foreign_keys = ON');
  }
}

function remapFkTable(name, idMap, createSql) {
  const tmp = `_${name}_old`;
  const cols = db.prepare(`PRAGMA table_info(${name})`).all().map(c => c.name);
  const oldRows = db.prepare(`SELECT * FROM ${name}`).all();
  run(`ALTER TABLE ${name} RENAME TO ${tmp}`);
  run(createSql);

  const placeholders = cols.map(() => '?').join(', ');
  const insertNew = db.prepare(`INSERT INTO ${name} (${cols.join(', ')}) VALUES (${placeholders})`);
  for (const row of oldRows) {
    const remapped = cols.map(c => c === 'barber_id' ? (idMap.get(row[c]) ?? row[c]) : row[c]);
    insertNew.run(...remapped);
  }
  run(`DROP TABLE ${tmp}`);
}

export const stmts = {
  bookingsForBarberDate: db.prepare(`
    SELECT id, service_id, duration_min, slot, status
    FROM bookings
    WHERE barber_id = ? AND date = ? AND status IN ('pending','confirmed')
  `),
  bookingsForBarberRange: db.prepare(`
    SELECT date, slot, duration_min
    FROM bookings
    WHERE barber_id = ? AND date BETWEEN ? AND ? AND status IN ('pending','confirmed')
  `),
  insertBooking: db.prepare(`
    INSERT INTO bookings (barber_id, service_id, duration_min, date, slot, name, phone)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `),
};

export const beginImmediate = db.prepare('BEGIN IMMEDIATE');
export const commit = db.prepare('COMMIT');
export const rollback = db.prepare('ROLLBACK');
