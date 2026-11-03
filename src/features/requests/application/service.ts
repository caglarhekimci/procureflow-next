import { randomUUID } from 'node:crypto';
import { AppError } from '@/shared/errors';
import type { Actor, ListFilters } from '../domain/model';
import { createRequestSchema, listSchema, transitionSchema } from '../domain/policy';
import type { RequestRepository } from './ports';
export class RequestService {
  constructor(
    private readonly repository: RequestRepository,
    private readonly now: () => string = () => new Date().toISOString(),
    private readonly newId: () => string = randomUUID,
  ) {}
  create(actor: Actor, input: unknown) {
    if (actor.role === 'viewer') throw new AppError('FORBIDDEN', 'You do not have permission', 403);
    const data = createRequestSchema.parse(input),
      now = this.now();
    return this.repository.create(
      {
        ...data,
        id: this.newId(),
        tenantId: actor.tenantId,
        createdBy: actor.id,
        status: 'draft',
        createdAt: now,
        updatedAt: now,
        version: 1,
      },
      actor,
    );
  }
  list(actor: Actor, filters: ListFilters) {
    return this.repository.list(actor.tenantId, listSchema.parse(filters));
  }
  detail(actor: Actor, id: string) {
    return this.repository.detail(actor.tenantId, id);
  }
  transition(actor: Actor, id: string, input: unknown) {
    const data = transitionSchema.parse(input);
    return this.repository.transition(
      actor,
      id,
      data.action,
      data.version,
      data.reason,
      this.now(),
    );
  }
  summary(actor: Actor) {
    return this.repository.summary(actor.tenantId);
  }
}
