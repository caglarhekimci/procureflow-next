import Link from 'next/link';
import { Plus, ArrowLeft } from 'lucide-react';
export function PageHeading({
  eyebrow,
  title,
  description,
  create = false,
  back,
}: {
  eyebrow: string;
  title: string;
  description: string;
  create?: boolean;
  back?: string;
}) {
  return (
    <div className="page-heading">
      <div>
        {back ? (
          <Link className="back-link" href={back}>
            <ArrowLeft size={15} />
            Back to requests
          </Link>
        ) : (
          <p className="eyebrow">{eyebrow}</p>
        )}
        <h1>{title}</h1>
        <p className="muted">{description}</p>
      </div>
      {create ? (
        <Link href="/requests/new" className="button primary">
          <Plus size={17} />
          New request
        </Link>
      ) : null}
    </div>
  );
}
