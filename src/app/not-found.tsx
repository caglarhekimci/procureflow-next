import Link from 'next/link';
export default function NotFound() {
  return (
    <main id="main" className="empty-state">
      <h1>Request not found</h1>
      <p>This request is unavailable in your workspace.</p>
      <Link href="/requests" className="button primary">
        Back to requests
      </Link>
    </main>
  );
}
