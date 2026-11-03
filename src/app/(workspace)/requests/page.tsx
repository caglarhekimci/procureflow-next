import { requireActor } from '@/features/auth/server';
import { container } from '@/infrastructure/container';
import { PageHeading } from '@/components/page-heading';
import { RequestList } from '@/features/requests/presentation/request-list';
export const metadata = { title: 'Purchase requests' };
export default async function Requests() {
  const actor = await requireActor();
  return (
    <>
      <PageHeading
        eyebrow="REQUESTS"
        title="Every request. One clear view."
        description="Find the context, follow the progress, make the next move."
        create={actor.role !== 'viewer'}
      />
      <RequestList initial={container().requests.list(actor, {})} />
    </>
  );
}
