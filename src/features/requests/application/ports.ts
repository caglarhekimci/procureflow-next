import type {
  Actor,
  ListFilters,
  PurchaseRequest,
  RequestDetail,
  RequestPage,
  Summary,
} from '../domain/model';
import type { Action } from '../domain/policy';
export interface RequestRepository {
  create(request: PurchaseRequest, actor: Actor): PurchaseRequest;
  list(tenantId: string, filters: ListFilters): RequestPage;
  detail(tenantId: string, id: string): RequestDetail;
  transition(
    actor: Actor,
    id: string,
    action: Action,
    version: number,
    reason: string,
    now: string,
  ): PurchaseRequest;
  summary(tenantId: string): Summary;
}
