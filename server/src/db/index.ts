import Database from 'better-sqlite3';
import type { Database as DatabaseType } from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { env } from '../config.js';

const dbDir = path.dirname(env.DATABASE_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db: DatabaseType = new Database(env.DATABASE_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

const schema = fs.readFileSync(new URL('./schema.sql', import.meta.url), 'utf-8');
db.exec(schema);

// Migrations
try {
  db.exec('ALTER TABLE users ADD COLUMN google_id TEXT');
} catch {
  // column already exists
}

export default db;
