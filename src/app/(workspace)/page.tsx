import { requireActor } from '@/features/auth/server';
import { container } from '@/infrastructure/container';
import { PageHeading } from '@/components/page-heading';
import { RequestList } from '@/features/requests/presentation/request-list';
import { money } from '@/shared/format';
import { Files, Clock3, CheckCheck, ArrowUpRight, ShieldCheck } from 'lucide-react';
export default async function Overview() {
  const actor = await requireActor(),
    service = container().requests;
  const summary = service.summary(actor),
    initial = service.list(actor, {});
  const categories = summary.categories,
    total = categories.reduce((s, c) => s + c.amountMinor, 0);
  return (
    <>
      <PageHeading
        eyebrow="YOUR WORKSPACE, AT A GLANCE"
        title="Clarity for every purchase."
        description={
          'Welcome back, ' + actor.name.split(' ')[0] + '. Here is where your team stands.'
        }
        create={actor.role !== 'viewer'}
      />
      <section className="metrics" aria-label="Procurement summary">
        <article className="metric metric-dark">
          <div className="metric-top">
            <span>Approved spend</span>
            <CheckCheck size={19} />
          </div>
          <strong>{money(summary.approvedMinor)}</strong>
          <span className="metric-note">Across all approved requests</span>
          <div className="metric-decoration" aria-hidden="true" />
        </article>
        <article className="metric">
          <div className="metric-top">
            <span>Awaiting approval</span>
            <Clock3 size={19} />
          </div>
          <strong>
            {summary.pendingCount}
            <small>requests</small>
          </strong>
          <span className="metric-note">Ready for a second pair of eyes</span>
        </article>
        <article className="metric">
          <div className="metric-top">
            <span>Pending value</span>
            <ArrowUpRight size={19} />
          </div>
          <strong>{money(summary.pendingMinor)}</strong>
          <span className="metric-note">Requested, not yet committed</span>
        </article>
        <article className="metric">
          <div className="metric-top">
            <span>Total requests</span>
            <Files size={19} />
          </div>
          <strong>
            {summary.totalCount}
            <small>in workspace</small>
          </strong>
          <span className="metric-note">Every purchase starts with context</span>
        </article>
      </section>
      <div className="overview-grid">
        <section className="panel spend-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">SPEND BREAKDOWN</p>
              <h2>Where the investment goes</h2>
            </div>
            <span className="pill">Approved only</span>
          </div>
          {categories.length ? (
            categories.map((c, i) => (
              <div className="spend-row" key={c.name}>
                <div className="spend-label">
                  <span>
                    <span className={'category-dot dot-' + i} />
                    {c.name}
                  </span>
                  <strong>{money(c.amountMinor)}</strong>
                </div>
                <div className="bar-track">
                  <div
                    className={'bar-fill fill-' + i}
                    style={{ width: (c.amountMinor / total) * 100 + '%' }}
                  />
                </div>
              </div>
            ))
          ) : (
            <p className="muted">Approved requests will appear here.</p>
          )}
          <p className="chart-note">
            Based on recorded approvals. No estimated or projected spend.
          </p>
        </section>
        <section className="workspace-note">
          <div className="note-icon">
            <ShieldCheck size={23} />
          </div>
          <p className="eyebrow">BUILT FOR ACCOUNTABILITY</p>
          <h2>
            Good work deserves
            <br />a clear process.
          </h2>
          <p>
            Create a request, share the context, and let another team member review it. Every
            decision stays in the trail.
          </p>
          <div className="note-footer">
            <span className="live-dot" />
            Your access: <strong>{actor.role}</strong>
          </div>
        </section>
      </div>
      <RequestList initial={initial} />
    </>
  );
}
