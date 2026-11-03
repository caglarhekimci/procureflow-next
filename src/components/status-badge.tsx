import type { Status } from '@/features/requests/domain/model';
const labels: Record<Status, string> = {
  draft: 'Draft',
  pending: 'Pending review',
  approved: 'Approved',
  rejected: 'Rejected',
};
export function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={'status status-' + status}>
      <span aria-hidden="true" className="status-dot" />
      {labels[status]}
    </span>
  );
}
