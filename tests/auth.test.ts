import { beforeEach, afterEach, describe, it, expect } from 'vitest';
import Database from 'better-sqlite3';
import { migrate } from '@/infrastructure/database';
import { IdentityService } from '@/features/auth/identity';
let db: Database.Database;
let auth: IdentityService;
let now: number;
beforeEach(() => {
  db = new Database(':memory:');
  migrate(db);
  now = 1000;
  db.exec(
    "INSERT INTO tenants VALUES ('atlas','Atlas'); INSERT INTO users VALUES ('a','atlas','Ayşe','ayse@atlas.demo','requester')",
  );
  auth = new IdentityService(
    db,
    { demoMode: true, password: 'test-password-123', sessionSeconds: 10 },
    () => now,
  );
});
afterEach(() => db.close());
describe('opaque sessions and login controls', () => {
  it('rejects invalid credentials without disclosing account presence', () => {
    expect(() => auth.login('missing@atlas.demo', 'test-password-123')).toThrow(
      'Invalid credentials',
    );
    expect(() => auth.login('ayse@atlas.demo', 'wrong')).toThrow('Invalid credentials');
  });
  it('stores only token digests and revokes on logout', () => {
    const token = auth.login('ayse@atlas.demo', 'test-password-123');
    expect(auth.actor(token)?.id).toBe('a');
    expect((db.prepare('SELECT digest FROM sessions').get() as { digest: string }).digest).not.toBe(
      token,
    );
    auth.logout(token);
    expect(auth.actor(token)).toBeNull();
  });
  it('expires a persisted session', () => {
    const token = auth.login('ayse@atlas.demo', 'test-password-123');
    now += 11000;
    expect(auth.actor(token)).toBeNull();
  });
  it('rate limits repeated wrong passwords and resets the window', () => {
    for (let i = 0; i < 5; i++)
      expect(() => auth.login('ayse@atlas.demo', 'wrong')).toThrow('Invalid credentials');
    expect(() => auth.login('ayse@atlas.demo', 'test-password-123')).toThrow(/Too many/);
    now += 900001;
    expect(auth.login('ayse@atlas.demo', 'test-password-123')).toBeTruthy();
  });
  it('disables demo access unless explicitly enabled', () => {
    const disabled = new IdentityService(db, {
      demoMode: false,
      password: 'test-password-123',
      sessionSeconds: 10,
    });
    expect(() => disabled.login('ayse@atlas.demo', 'test-password-123')).toThrow(/disabled/i);
  });
});
