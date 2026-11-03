# Security and operation boundaries

## Trust model

This repository is a **local portfolio demo**, not a production identity system. DEMO_MODE must equal true, and a configured shared demo password must contain at least12 characters. The four email identities are allowlisted seed records. Never reuse a personal password. A public source repository does not expose the configured password.

Browser input, URL IDs and query strings are untrusted. Routes resolve role/tenant from the persisted session, perform origin and body checks, then call the application policy. SQL parameters are bound. React renders descriptions as text, without HTML insertion. Do not trust hidden buttons as authorization: direct API denials are tested.

## Controls

- Random256-bit opaque session; only digest is stored. Eight-hour expiry, revocation on logout.
- HttpOnly, SameSite=Lax, path=/ cookie; Secure when APP_ORIGIN uses HTTPS.
- Exact Origin required on login/logout and mutations; missing/mismatched origin rejected.
- Persistent per-email login failure window: five failures per15 minutes, generic credentials error. A public deployment needs ingress/IP throttling and bot controls as well.
- Tenant predicate on list, detail, transition and audit reads; caller cannot select actor through body.
- No self approval, terminal decisions, optimistic revisions, atomic audit writes.
- 16KiB streamed body cap, schema bounds, bounded pages and error redaction.
- nosniff, same-origin referrer policy, frame denial and restrictive object/frame/base policies. This is a partial CSP, not a claim of complete XSS elimination.

## Deployment work still required

Replace demo login with a reviewed identity provider, require HTTPS, add ingress throttling, secret rotation, backups/restore verification, schema rollout/rollback policy, operational logs/alerts and an environment-specific CSP. Validate container runtime on the deployment host. SQLite is single-node here. No mail, payment, purchasing, cloud provisioning or public hosting occurs from this app.

## Backups

Stop the application before copying the SQLite database and WAL files, or use SQLite's online backup API. Avoid copying only the main file while WAL writes are active. Protect backups as application data.
