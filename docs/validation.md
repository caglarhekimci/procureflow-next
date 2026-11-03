# Validation record

Checked 2026-11-03 on Windows, Node.js22.23.3, Next.js16.4.4. Dependency versions are in package-lock.json.

| Check                                            | Observed result                                        |
| ------------------------------------------------ | ------------------------------------------------------ |
| Strict TypeScript                                | passed                                                 |
| Oxlint React/Next/accessibility                  | passed, no warnings                                    |
| Unit and real SQLite/component tests             | 36 passed                                              |
| npm audit                                        | 0 known vulnerabilities at check time                  |
| Production build and standalone static packaging | passed                                                 |
| Playwright against packaged application          | 8 passed                                               |
| Desktop1440px and mobile390px                    | checked; no document overflow                          |
| axe WCAG2A/AA and2.1AA tagged rules              | zero violations on tested desktop overview/mobile form |
| Docker build/run                                 | not executed locally; Docker unavailable               |
| Physical device / manual screen-reader review    | not performed                                          |

The browser suite signs in through the real UI, creates a draft, refreshes to prove persistence, submits it, approves with another session, checks the audit trail, verifies a viewer API denial, denies read and write to a known record across tenants, rejects invalid Origin/JSON/oversized requests and revokes login on logout. SQLite tests additionally verify transaction rollback when audit insertion fails, invalid transitions and stale revisions.

Tests were introduced before their owning implementation; the missing APIs failed initially. During development, tests also exposed a duplicate-email fixture, SQL search escaping, insufficient contrast, a screen-reader-only table label escaping its scroll container, and standalone static assets not copied on this Windows Unicode path. Each was corrected and the affected suite rerun. The final browser run has8/8 passing checks.

Automated accessibility results cover the pages and rules tested; they are not a complete accessibility certification. No throughput, load, security audit, production usage or hosting release is claimed. GitHub Actions repeats all quality/build/browser checks on Linux; its actual result is linked from the repository Actions page.
