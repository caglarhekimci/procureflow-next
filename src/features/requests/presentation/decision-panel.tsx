'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/client-api';
import type { Actor, PurchaseRequest } from '../domain/model';
import type { Action } from '../domain/policy';
export function DecisionPanel({ request, actor }: { request: PurchaseRequest; actor: Actor }) {
  const router = useRouter(),
    client = useQueryClient();
  const [reason, setReason] = useState(''),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  async function act(action: Action) {
    setBusy(true);
    setError('');
    try {
      await api('/api/requests/' + request.id, {
        method: 'PATCH',
        body: JSON.stringify({ action, version: request.version, reason }),
      });
      await client.invalidateQueries({ queryKey: ['requests'] });
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const own = actor.id === request.createdBy;
  return (
    <section className="panel decision-panel">
      <p className="eyebrow">NEXT STEP</p>
      <h2>
        {request.status === 'draft'
          ? 'Ready for review?'
          : request.status === 'pending'
            ? 'A decision is waiting.'
            : 'Decision recorded.'}
      </h2>
      <p className="muted">
        {request.status === 'draft'
          ? 'Check the details and submit your draft to an approver.'
          : request.status === 'pending'
            ? 'A different team member with approval access can decide this request.'
            : 'The complete decision history is preserved in the activity trail.'}
      </p>
      {request.status === 'draft' && own && actor.role !== 'viewer' ? (
        <button className="button primary full-width" disabled={busy} onClick={() => act('submit')}>
          {busy ? 'Submitting…' : 'Submit for approval'}
        </button>
      ) : null}
      {request.status === 'pending' && actor.role === 'approver' && !own ? (
        <>
          <div className="field">
            <label htmlFor="reason">Decision note</label>
            <textarea
              id="reason"
              value={reason}
              maxLength={500}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Required when rejecting (min. 3 characters)"
            />
          </div>
          <button
            className="button primary full-width"
            disabled={busy}
            onClick={() => act('approve')}
          >
            Approve request
          </button>
          <button
            className="button danger full-width"
            disabled={busy}
            onClick={() => act('reject')}
          >
            Reject request
          </button>
        </>
      ) : null}
      {request.status === 'pending' && own ? (
        <div className="info-note">
          Your request needs another approver. Self approval is disabled.
        </div>
      ) : null}
      {actor.role === 'viewer' ? (
        <div className="info-note">Your workspace access is read only.</div>
      ) : null}
      {error ? (
        <p className="error-box" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
