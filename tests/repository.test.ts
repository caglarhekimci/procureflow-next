import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import Database from 'better-sqlite3';
import { migrate } from '@/infrastructure/database';
import { SqliteRequestRepository } from '@/features/requests/infrastructure/sqlite-repository';
import { RequestService } from '@/features/requests/application/service';
import type { Actor } from '@/features/requests/domain/model';
let db: Database.Database;
let service: RequestService;
const owner: Actor = {
  id: 'owner',
  tenantId: 'atlas',
  name: 'Owner',
  email: 'owner@demo',
  role: 'requester',
};
const manager: Actor = { ...owner, id: 'manager', email: 'manager@demo', role: 'approver' };
const input = {
  title: 'Design licenses',
  supplier: 'Figma',
  category: 'Software' as const,
  description: 'Annual licenses for product team',
  amountMinor: 120000,
};
beforeEach(() => {
  db = new Database(':memory:');
  migrate(db);
  db.prepare("INSERT INTO tenants(id,name) VALUES ('atlas','Atlas'),('nova','Nova')").run();
  for (const a of [
    owner,
    manager,
    { ...manager, id: 'other', tenantId: 'nova', email: 'other@demo' },
  ])
    db.prepare('INSERT INTO users(id,tenant_id,name,email,role) VALUES (?,?,?,?,?)').run(
      a.id,
      a.tenantId,
      a.name,
      a.email,
      a.role,
    );
  service = new RequestService(new SqliteRequestRepository(db));
});
afterEach(() => db.close());
describe('real SQLite workflow', () => {
  it('persists records and audits together', () => {
    const r = service.create(owner, input);
    expect(service.list(owner, {}).items[0].title).toBe('Design licenses');
    expect(service.detail(owner, r.id).audit[0].action).toBe('created');
  });
  it('isolates lists and detail by tenant', () => {
    const r = service.create(owner, input);
    expect(service.list({ ...manager, tenantId: 'nova' }, {}).total).toBe(0);
    expect(() => service.detail({ ...manager, tenantId: 'nova' }, r.id)).toThrow(/not found/i);
  });
  it('commits submission and approval audit and prevents stale approval', () => {
    const r = service.create(owner, input);
    service.transition(owner, r.id, { action: 'submit', version: 1 });
    service.transition(manager, r.id, { action: 'approve', version: 2 });
    expect(() =>
      service.transition(manager, r.id, { action: 'reject', version: 2, reason: 'Too costly' }),
    ).toThrow(/changed/i);
    const detail = service.detail(owner, r.id);
    expect(detail.request.status).toBe('approved');
    expect(detail.audit.map((x) => x.action)).toEqual(['created', 'submit', 'approve']);
  });
  it('does not append an audit on failed policy', () => {
    const r = service.create(owner, input);
    expect(() => service.transition(owner, r.id, { action: 'approve', version: 1 })).toThrow();
    expect(service.detail(owner, r.id).audit).toHaveLength(1);
  });
  it('rolls back request creation if audit insertion fails', () => {
    db.exec(
      "CREATE TRIGGER reject_audit BEFORE INSERT ON audit_events BEGIN SELECT RAISE(ABORT,'audit unavailable'); END",
    );
    expect(() => service.create(owner, input)).toThrow();
    expect(service.list(owner, {}).total).toBe(0);
  });
  it('denies viewer creation', () =>
    expect(() => service.create({ ...owner, role: 'viewer' }, input)).toThrow(/permission/i));
  it('searches and filters with bounded pagination', () => {
    service.create(owner, input);
    service.create(owner, { ...input, title: 'Office furniture', category: 'Equipment' });
    expect(service.list(owner, { q: 'licenses' }).total).toBe(1);
    expect(service.list(owner, { status: 'approved' }).total).toBe(0);
    expect(service.list(owner, { page: 1, pageSize: 1 }).items).toHaveLength(1);
  });
  it('builds truthful dashboard totals from database', () => {
    const r = service.create(owner, input);
    service.transition(owner, r.id, { action: 'submit', version: 1 });
    const s = service.summary(owner);
    expect(s.pendingMinor).toBe(120000);
    expect(s.pendingCount).toBe(1);
    expect(s.approvedMinor).toBe(0);
  });
});
