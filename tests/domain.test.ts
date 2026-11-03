import { describe, expect, it } from 'vitest';
import { createRequestSchema, transitionRequest } from '@/features/requests/domain/policy';
import type { Actor, PurchaseRequest } from '@/features/requests/domain/model';
const owner: Actor = {
  id: 'a',
  tenantId: 'atlas',
  name: 'Ayşe',
  email: 'a@example.com',
  role: 'requester',
};
const approver: Actor = { ...owner, id: 'b', role: 'approver' };
const draft: PurchaseRequest = {
  id: 'r',
  tenantId: 'atlas',
  title: 'Equipment',
  supplier: 'Vendor',
  category: 'Equipment',
  description: 'For the design team',
  amountMinor: 10000,
  status: 'draft',
  createdBy: 'a',
  createdAt: '2026-11-03T10:00:00.000Z',
  updatedAt: '2026-11-03T10:00:00.000Z',
  version: 1,
};
describe('request invariants', () => {
  it.each([0, -1, 1.5, NaN, 1000000001])('rejects invalid minor-unit amount %s', (amountMinor) =>
    expect(createRequestSchema.safeParse({ ...draft, amountMinor }).success).toBe(false),
  );
  it('accepts a positive bounded integer amount', () =>
    expect(createRequestSchema.safeParse(draft).success).toBe(true));
  it('submits an owned draft without mutating input', () => {
    const r = transitionRequest(draft, owner, 'submit', 1, '', '2026-11-03T11:00:00.000Z');
    expect(r.status).toBe('pending');
    expect(r.version).toBe(2);
    expect(draft.status).toBe('draft');
  });
  it('rejects stale versions', () =>
    expect(() => transitionRequest(draft, owner, 'submit', 2, '', 'now')).toThrow(/changed/i));
  it('rejects cross-tenant actors', () =>
    expect(() =>
      transitionRequest(draft, { ...owner, tenantId: 'nova' }, 'submit', 1, '', 'now'),
    ).toThrow(/not found/i));
  it('prevents viewers writing', () =>
    expect(() =>
      transitionRequest(draft, { ...owner, role: 'viewer' }, 'submit', 1, '', 'now'),
    ).toThrow(/permission/i));
  it('prevents self approval even for approvers', () =>
    expect(() =>
      transitionRequest(
        { ...draft, status: 'pending' },
        { ...owner, role: 'approver' },
        'approve',
        1,
        '',
        'now',
      ),
    ).toThrow(/own/i));
  it('allows a separate approver to approve a pending request', () =>
    expect(
      transitionRequest({ ...draft, status: 'pending' }, approver, 'approve', 1, '', 'now').status,
    ).toBe('approved'));
  it('rejects invalid transitions', () =>
    expect(() => transitionRequest(draft, approver, 'approve', 1, '', 'now')).toThrow(
      /transition/i,
    ));
  it('requires a rejection reason', () =>
    expect(() =>
      transitionRequest({ ...draft, status: 'pending' }, approver, 'reject', 1, '', 'now'),
    ).toThrow(/reason/i));
});
