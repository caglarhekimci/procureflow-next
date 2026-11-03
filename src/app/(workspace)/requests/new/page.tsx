import { requireActor } from '@/features/auth/server';
import { PageHeading } from '@/components/page-heading';
import { CreateRequest } from '@/features/requests/presentation/create-request';
export const metadata = { title: 'New request' };
export default async function NewRequest() {
  const actor = await requireActor();
  return (
    <>
      <PageHeading
        eyebrow="NEW REQUEST"
        title="Start with a good reason."
        description="Give your team the context to make a confident decision."
        back="/requests"
      />
      {actor.role === 'viewer' ? (
        <div className="panel empty-state">
          <h2>Read only access</h2>
          <p>Your role allows viewing requests. A requester or approver can create one.</p>
        </div>
      ) : (
        <div className="panel form-panel">
          <h2>Purchase details</h2>
          <p className="muted form-intro">All fields are required. Amounts are in Turkish lira.</p>
          <CreateRequest />
        </div>
      )}
    </>
  );
}
