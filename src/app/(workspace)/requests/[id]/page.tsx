import { notFound } from 'next/navigation';
import { requireActor } from '@/features/auth/server';
import { container } from '@/infrastructure/container';
import { AppError } from '@/shared/errors';
import { PageHeading } from '@/components/page-heading';
import { StatusBadge } from '@/components/status-badge';
import { DecisionPanel } from '@/features/requests/presentation/decision-panel';
import { money, shortDate } from '@/shared/format';
export const metadata = { title: 'Request detail' };
export default async function Detail({ params }: { params: Promise<{ id: string }> }) {
  const actor = await requireActor();
  let detail;
  try {
    detail = container().requests.detail(actor, (await params).id);
  } catch (e) {
    if (e instanceof AppError && e.status === 404) notFound();
    throw e;
  }
  const { request: r, audit } = detail;
  return (
    <>
      <PageHeading
        eyebrow="REQUEST DETAIL"
        title={r.title}
        description={'Created ' + shortDate(r.createdAt) + ' · Revision ' + r.version}
        back="/requests"
      />
      <div className="detail-grid">
        <div>
          <section className="panel detail-panel">
            <div className="detail-summary">
              <div>
                <p className="eyebrow">REQUESTED AMOUNT</p>
                <strong className="detail-amount">{money(r.amountMinor)}</strong>
              </div>
              <StatusBadge status={r.status} />
            </div>
            <dl className="detail-fields">
              <div>
                <dt>Supplier</dt>
                <dd>{r.supplier}</dd>
              </div>
              <div>
                <dt>Category</dt>
                <dd>{r.category}</dd>
              </div>
              <div>
                <dt>Owner</dt>
                <dd>{audit[0]?.actorName ?? 'Team member'}</dd>
              </div>
              <div>
                <dt>Currency</dt>
                <dd>TRY · Turkish lira</dd>
              </div>
            </dl>
            <div className="justification">
              <h2>Business justification</h2>
              <p>{r.description}</p>
            </div>
          </section>
          <section className="panel activity-panel">
            <h2>Activity trail</h2>
            <p className="muted">The complete story of this request.</p>
            <ol className="timeline">
              {audit.map((event) => (
                <li key={event.id}>
                  <span className="timeline-point" />
                  <div>
                    <strong>{event.actorName}</strong>
                    <p>
                      {(
                        {
                          created: 'Created the draft',
                          submit: 'Submitted for approval',
                          approve: 'Approved the request',
                          reject: 'Rejected the request',
                        } as Record<string, string>
                      )[event.action] ?? event.action}
                    </p>
                    {event.reason ? <blockquote>{event.reason}</blockquote> : null}
                    <time dateTime={event.createdAt}>
                      {shortDate(event.createdAt)} ·{' '}
                      {new Date(event.createdAt).toLocaleTimeString('en-GB', {
                        hour: '2-digit',
                        minute: '2-digit',
                        timeZone: 'Europe/Istanbul',
                      })}{' '}
                      Istanbul
                    </time>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>
        <DecisionPanel request={r} actor={actor} />
      </div>
    </>
  );
}
