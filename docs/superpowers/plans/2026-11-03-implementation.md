# procureflow-next implementation plan

> Agentic workers: use executing-plans, TDD and verification-before-completion; user delegated all routine decisions.

**Goal:** Implement the adjacent approved-by-delegation design.
**Architecture:** See spec. Keep domain independent and adapters replaceable.
**Tech Stack:** Next.js, React, TypeScript, SQLite, Zod, TanStack Query, Tailwind
**Spec:** ../specs/2026-11-03-design.md

## Global constraints

- Never commit secrets or generated runtime data.
- Demonstrate behavior through real adapters; label any unexecuted checks.
- No deployment or paid external integrations.

## Review focus

Tenant bypass; duplicate/replayed mutations; simultaneous conflicting actions; invalid numeric boundaries; infrastructure failures and partial transactions.

## Task 1

- [x] Domain policies, contracts and application ports; RED then GREEN for money bounds, workflow permissions and revision conflicts.
- [x] Observe relevant test failure, implement, run suite, record evidence.

## Task 2

- [x] SQLite schema, repository and identity; RED then GREEN for real persistence, tenant isolation, atomic audit and session expiry.
- [x] Observe relevant test failure, implement, run suite, record evidence.

## Task 3

- [x] Next.js server pages and API routes; verify origin/authentication/authorization and validation errors.
- [x] Observe relevant test failure, implement, run suite, record evidence.

## Task 4

- [x] Responsive dashboard, filterable list, accessible form and detail workflow with TanStack Query and React Hook Form.
- [x] Observe relevant test failure, implement, run suite, record evidence.

## Task 5

- [x] Real browser tests, mobile, lint, strict typecheck, production build, Docker and CI; independent final review.
- [x] Observe relevant test failure, implement, run suite, record evidence.
