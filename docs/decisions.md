# Architecture decision records

## ADR-001: Feature-oriented clean architecture

Accepted 2026-11-03. Keep policy, use cases, adapter and presentation together under requests. Small ports are justified where storage changes or tests need a boundary. A universal layered enterprise skeleton would add abstractions without a second use case. Consequence: business rules remain independently testable, while framework changes stay in adapters.

## ADR-002: SQLite for a runnable portfolio

Accepted. Use SQLite transactions and WAL to make a fresh clone runnable without cloud credentials or Docker. PostgreSQL is common in backend postings, but Next.js samples prioritize frontend engineering; adding a mandatory database service would increase setup friction. Consequence: one application node and local backups; use a new adapter for a larger deployment. No claim of PostgreSQL implementation.

## ADR-003: Opaque demo sessions

Accepted. Only seeded demo identities can sign in, and only when explicitly enabled by configuration. A random 256-bit token lives in an HttpOnly cookie; its SHA-256 digest and expiry live in SQLite. JWT adds revocation/rotation complexity this demo does not need. Consequence: session reads hit the local database; production identity federation, MFA and account recovery are intentionally not implemented.

## ADR-004: Integer money and optimistic revisions

Accepted. Store TRY as integer minor units, maximum 1,000,000,000 per request. A browser sends an expected revision with each transition. Database transaction atomically updates state and writes the audit. Consequence: the user sees a clear conflict instead of silent overwrites; no multi-currency conversion is implied.

## ADR-005: Server components plus a small client surface

Accepted. Server components authenticate and load initial data directly from the application service; client components own forms, query refreshes and interaction. TanStack Query handles server state; local React state handles filters/forms. A global Redux/Zustand store would duplicate existing state ownership.

## ADR-006: Oxlint and reproducible dependency audit

Accepted. Use Oxlint React/Next/accessibility checks, TypeScript strict checking, Prettier and real tests. The initial ESLint plugin dependency tree included a moderate minimatch advisory; no unsafe forced major override was applied. Removing that toolchain in favor of a supported linter produced an audited dependency graph with no known findings at verification time. The lockfile pins exact installed versions; future audit results may differ.
