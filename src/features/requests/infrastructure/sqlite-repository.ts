import type Database from 'better-sqlite3';
import { randomUUID } from 'node:crypto';
import { AppError } from '@/shared/errors';
import type { RequestRepository } from '../application/ports';
import type { Actor, AuditEvent, ListFilters, PurchaseRequest, Summary } from '../domain/model';
import { transitionRequest, type Action } from '../domain/policy';
const columns =
  'id,tenant_id AS tenantId,title,supplier,category,description,amount_minor AS amountMinor,status,created_by AS createdBy,created_at AS createdAt,updated_at AS updatedAt,version';
export class SqliteRequestRepository implements RequestRepository {
  constructor(private readonly db: Database.Database) {}
  private record(tenantId: string, id: string) {
    const r = this.db
      .prepare('SELECT ' + columns + ' FROM purchase_requests WHERE tenant_id=? AND id=?')
      .get(tenantId, id) as PurchaseRequest | undefined;
    if (!r) throw new AppError('NOT_FOUND', 'Request not found', 404);
    return r;
  }
  private audit(request: PurchaseRequest, actor: Actor, action: string, reason = '') {
    this.db
      .prepare(
        'INSERT INTO audit_events(id,request_id,tenant_id,actor_id,action,reason,created_at) VALUES(?,?,?,?,?,?,?)',
      )
      .run(randomUUID(), request.id, request.tenantId, actor.id, action, reason, request.updatedAt);
  }
  create(request: PurchaseRequest, actor: Actor) {
    return this.db
      .transaction(() => {
        this.db
          .prepare(
            'INSERT INTO purchase_requests(id,tenant_id,title,supplier,category,description,amount_minor,status,created_by,created_at,updated_at,version) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)',
          )
          .run(
            request.id,
            request.tenantId,
            request.title,
            request.supplier,
            request.category,
            request.description,
            request.amountMinor,
            request.status,
            request.createdBy,
            request.createdAt,
            request.updatedAt,
            request.version,
          );
        this.audit(request, actor, 'created');
        return request;
      })
      .immediate();
  }
  list(tenantId: string, filters: ListFilters) {
    const page = filters.page ?? 1,
      pageSize = filters.pageSize ?? 10;
    let where = 'tenant_id=?';
    const params: (string | number)[] = [tenantId];
    if (filters.status) {
      where += ' AND status=?';
      params.push(filters.status);
    }
    if (filters.q) {
      where += " AND (title LIKE ? ESCAPE '!' OR supplier LIKE ? ESCAPE '!')";
      const q = '%' + filters.q.replace(/[!%_]/g, (character) => '!' + character) + '%';
      params.push(q, q);
    }
    const total = (
      this.db
        .prepare('SELECT COUNT(*) AS n FROM purchase_requests WHERE ' + where)
        .get(...params) as { n: number }
    ).n;
    const items = this.db
      .prepare(
        'SELECT ' +
          columns +
          ' FROM purchase_requests WHERE ' +
          where +
          ' ORDER BY created_at DESC,id DESC LIMIT ? OFFSET ?',
      )
      .all(...params, pageSize, (page - 1) * pageSize) as PurchaseRequest[];
    return { items, total, page, pageSize };
  }
  detail(tenantId: string, id: string) {
    const request = this.record(tenantId, id);
    const audit = this.db
      .prepare(
        'SELECT a.id,a.request_id AS requestId,u.name AS actorName,a.action,a.reason,a.created_at AS createdAt FROM audit_events a JOIN users u ON u.id=a.actor_id WHERE a.tenant_id=? AND a.request_id=? ORDER BY a.rowid',
      )
      .all(tenantId, id) as AuditEvent[];
    return { request, audit };
  }
  transition(
    actor: Actor,
    id: string,
    action: Action,
    version: number,
    reason: string,
    now: string,
  ) {
    return this.db
      .transaction(() => {
        const updated = transitionRequest(
          this.record(actor.tenantId, id),
          actor,
          action,
          version,
          reason,
          now,
        );
        const result = this.db
          .prepare(
            'UPDATE purchase_requests SET status=?,version=?,updated_at=? WHERE tenant_id=? AND id=? AND version=?',
          )
          .run(updated.status, updated.version, updated.updatedAt, actor.tenantId, id, version);
        if (result.changes !== 1)
          throw new AppError('CONFLICT', 'This request changed. Refresh and try again.', 409);
        this.audit(updated, actor, action, reason);
        return updated;
      })
      .immediate();
  }
  summary(tenantId: string): Summary {
    const s = this.db
      .prepare(
        "SELECT COUNT(*) AS totalCount,COALESCE(SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END),0) AS pendingCount,COALESCE(SUM(CASE WHEN status='pending' THEN amount_minor ELSE 0 END),0) AS pendingMinor,COALESCE(SUM(CASE WHEN status='approved' THEN amount_minor ELSE 0 END),0) AS approvedMinor FROM purchase_requests WHERE tenant_id=?",
      )
      .get(tenantId) as Omit<Summary, 'categories'>;
    const categories = this.db
      .prepare(
        "SELECT category AS name,SUM(amount_minor) AS amountMinor FROM purchase_requests WHERE tenant_id=? AND status='approved' GROUP BY category ORDER BY amountMinor DESC",
      )
      .all(tenantId) as Summary['categories'];
    return { ...s, categories };
  }
}
