import { z } from 'zod';
import { AppError } from '@/shared/errors';
import { statuses, type Actor, type PurchaseRequest } from './model';
export const createRequestSchema = z.object({
  title: z.string().trim().min(3).max(100),
  supplier: z.string().trim().min(2).max(100),
  category: z.enum(['Software', 'Equipment', 'Services', 'Travel']),
  description: z.string().trim().min(10).max(2000),
  amountMinor: z.number().int().min(1).max(1_000_000_000),
});
export type CreateRequestInput = z.infer<typeof createRequestSchema>;
export const transitionSchema = z.object({
  action: z.enum(['submit', 'approve', 'reject']),
  version: z.number().int().positive(),
  reason: z.string().trim().max(500).default(''),
});
export const listSchema = z.object({
  q: z.string().trim().max(100).optional(),
  status: z.enum(statuses).optional(),
  page: z.coerce.number().int().min(1).max(10000).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
});
export type Action = z.infer<typeof transitionSchema>['action'];
export function transitionRequest(
  request: PurchaseRequest,
  actor: Actor,
  action: Action,
  version: number,
  reason: string,
  now: string,
): PurchaseRequest {
  if (actor.tenantId !== request.tenantId)
    throw new AppError('NOT_FOUND', 'Request not found', 404);
  if (actor.role === 'viewer') throw new AppError('FORBIDDEN', 'You do not have permission', 403);
  if (version !== request.version)
    throw new AppError('CONFLICT', 'This request changed. Refresh and try again.', 409);
  if (action === 'submit') {
    if (actor.id !== request.createdBy)
      throw new AppError('FORBIDDEN', 'Only the owner can submit this request', 403);
    if (request.status !== 'draft')
      throw new AppError('INVALID_TRANSITION', 'Invalid workflow transition', 409);
    return { ...request, status: 'pending', version: version + 1, updatedAt: now };
  }
  if (actor.role !== 'approver')
    throw new AppError('FORBIDDEN', 'Approver permission required', 403);
  if (actor.id === request.createdBy)
    throw new AppError('SELF_APPROVAL', 'You cannot decide your own request', 403);
  if (request.status !== 'pending')
    throw new AppError('INVALID_TRANSITION', 'Invalid workflow transition', 409);
  if (action === 'reject' && reason.trim().length < 3)
    throw new AppError('REASON_REQUIRED', 'Provide a rejection reason of at least 3 characters');
  return {
    ...request,
    status: action === 'approve' ? 'approved' : 'rejected',
    version: version + 1,
    updatedAt: now,
  };
}
