export const statuses = ['draft', 'pending', 'approved', 'rejected'] as const;
export type Status = (typeof statuses)[number];
export type Role = 'requester' | 'approver' | 'viewer';
export interface Actor {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  role: Role;
}
export interface PurchaseRequest {
  id: string;
  tenantId: string;
  title: string;
  supplier: string;
  category: 'Software' | 'Equipment' | 'Services' | 'Travel';
  description: string;
  amountMinor: number;
  status: Status;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}
export interface AuditEvent {
  id: string;
  requestId: string;
  actorName: string;
  action: string;
  reason: string;
  createdAt: string;
}
export interface RequestDetail {
  request: PurchaseRequest;
  audit: AuditEvent[];
}
export interface ListFilters {
  q?: string;
  status?: Status;
  page?: number;
  pageSize?: number;
}
export interface RequestPage {
  items: PurchaseRequest[];
  total: number;
  page: number;
  pageSize: number;
}
export interface Summary {
  totalCount: number;
  pendingCount: number;
  pendingMinor: number;
  approvedMinor: number;
  categories: { name: string; amountMinor: number }[];
}
