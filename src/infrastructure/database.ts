import Database from 'better-sqlite3';
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
export function migrate(db: Database.Database) {
  db.pragma('foreign_keys = ON');
  db.exec('CREATE TABLE IF NOT EXISTS schema_versions(version INTEGER PRIMARY KEY)');
  if (!db.prepare('SELECT 1 FROM schema_versions WHERE version=1').get())
    db.transaction(() =>
      db.exec(readFileSync(resolve(process.cwd(), 'migrations/001_initial.sql'), 'utf8')),
    )();
}
export function openDatabase(path: string) {
  mkdirSync(dirname(path), { recursive: true });
  const db = new Database(path);
  db.pragma('journal_mode = WAL');
  db.pragma('busy_timeout = 5000');
  migrate(db);
  return db;
}
