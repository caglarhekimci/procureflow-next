'use client';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <section className="panel empty-state" role="alert">
      <h1>We could not load this page.</h1>
      <p>Your data has not been changed. Please try again.</p>
      <button className="button primary" onClick={reset}>
        Try again
      </button>
    </section>
  );
}
