import { resolve } from 'node:path';
import type Database from 'better-sqlite3';
import { openDatabase } from './database';
import { seed } from './seed';
import { IdentityService } from '@/features/auth/identity';
import { RequestService } from '@/features/requests/application/service';
import { SqliteRequestRepository } from '@/features/requests/infrastructure/sqlite-repository';
const globalStore = globalThis as typeof globalThis & { procureflowDb?: Database.Database };
export function container() {
  const db = (globalStore.procureflowDb ??= openDatabase(
    resolve(/* turbopackIgnore: true */ process.env.DATABASE_PATH ?? 'data/procureflow.sqlite'),
  ));
  if (process.env.DEMO_MODE === 'true') seed(db);
  return {
    db,
    identity: new IdentityService(db, {
      demoMode: process.env.DEMO_MODE === 'true',
      password: process.env.DEMO_PASSWORD ?? '',
      sessionSeconds: 8 * 60 * 60,
    }),
    requests: new RequestService(new SqliteRequestRepository(db)),
  };
}
