# R64 integration verification — 2026-10-11

Status: **IN PROGRESS — not committed, not deployed, not a production acceptance claim.**

## Protected baseline and package

- Main repository: `D:/lingxi-quantum`, baseline `69d43bbd3228c5d52bad61b276315b4d6b72ebc0`.
- Isolated detached worktree: `D:/lingxi-quantum-r64-integration`. No remote branch was created.
- Main's unrelated hourly import log and untracked operator documents/artifacts remain untouched.
- Package: `D:/LINGXIFIELD_R64_VALIDATION_MASTER_20261011.zip`.
- SHA256: `DAEAC3E852F47348E7E09E1E75C1D0A40E18AB84CEFF184057282B7CF986A7A2`.
- Inspected 262 extracted files across the master and nested historical archives; 15 duplicate content groups. No archive patch or executable was applied mechanically.

## Integrated source changes

- Both burn preview and ACK require the actual HMAC share token. Origin/Referer/WebView headers cannot replace it. Request bodies have streaming byte limits.
- Preview returns encrypted text and never issues file download URLs. ACK counts a view transactionally, then signs file URLs with a deadline bounded by the persisted viewing receipt and note expiry.
- ACK uses a browser-generated UUID receipt. Concurrent/repeated ACKs count once. The browser decrypts first and retains an uncertain ACK only in memory for safe retry.
- The old single-argument ACK RPC, old destructive consume RPC, and unused WebView exemption helper are removed from the current runtime. Two unreferenced obsolete version-specific acceptance scripts and their source/protection manifest entries are deleted. The existing retirement audit prevents these artifacts or exemption logic from returning.
- Upload preparation rejects invalid sizes and expired/consumed notes. Completed uploads receive no further PUT URLs. Completion uses owner/state/expiry compare-and-set after R2 HEAD, preventing revival during deletion/consumption races.
- Cleanup retains private-file metadata when R2 cleanup needs retry; consumed notes have a viewing-receipt grace period.
- Engine file paths are restricted to the dedicated work directory and checked for symlinks/junctions. Server execution requires an allowed license and approved server runtime; existing permitted browser functions are preserved.
- Video references are validated before claiming the task or calling the supplier.
- Video claiming reserves funds across the existing active and legacy wallets with a consistent lock order. A second task cannot spend those funds. Failed supplier jobs release once; success commits result, source-wallet charge and task status together.
- Supplier submission uses the existing durable-run journal. A saved supplier receipt can restore the task without resubmitting. An ambiguous external submission remains held for reconciliation rather than being retried automatically.
- Durable-run wrappers now check SQL's `ok` result as well as transport errors.
- Public SASI rates read the same pricing constants used for charges, with nine-language descriptions.
- Current financial tests assert owner/operator scopes and external refund refresh. Native navigation contracts follow the unified web UI rather than obsolete native tab bars.
- The unreachable legacy SASI launch/workspace/production/account/skills/composer/memory UI is deleted with its obsolete patch/acceptance scripts and manifest entries. Current `SasiOneSurface`, task workspaces, live skill selection and authenticated APIs remain. The old silently skipped skill-creator test is replaced with actual current capability selection; this exposed a desktop menu/topbar overlap, corrected by bounding menu height.

## Verification evidence

Local logs are in `reports/r64/` and are not committed as production secrets or generated build output.

| Check | Result | Evidence / scope |
| --- | --- | --- |
| Frozen dependency installation | PASS | Repeated sequential install completed with lockfile unchanged |
| `ci:baseline` | PASS | `ci-baseline-final.log` |
| `ci:source` | PASS | `ci-source-sasi-acceptance.log`; final source gate includes response/provider regression checks |
| `ci:playwright-contract` | PASS | `ci-playwright-sasi-final.log`; import/dependency validity only |
| TypeScript | PASS | `typecheck-sasi-final.log`; final check after adding real-output tests |
| `build` | PASS | `build-sasi-acceptance.log`; 1,304 generated pages; existing lint warnings remain |
| Native PostgreSQL 17 transactional tests | PASS | `database-final-verified.log`; actual migrations/RPCs, 12 independent concurrent clients |
| Built burn HTTP routes through Supabase JS/PostgREST | PASS | `database-http-sasi-acceptance.log`; actual Next.js → Supabase JS → native PostgREST 14.13 → PostgreSQL, concurrent receipt retries and URL expiry assertions; local wallet concurrency and supplier persistence tests also passed |
| Burn browser decrypt/ACK recovery | PASS | `burn-browser-retest.log`; desktop and mobile Chromium, actual browser AES decrypt with mocked HTTP endpoints |
| SASI browser response/capability cases | PASS | `sasi-browser-retest.log`; eight desktop/mobile cases, real identity endpoint and controlled SSE boundaries |
| Real tool output cases | PASS | `tool-output-retest.log`; twelve desktop/mobile cases, real Unicode/text output, PNG→JPEG dimensions/white background, PDF page order/size |
| `ci:desktop` final run | PASS | `ci-desktop-sasi-acceptance.log`; 374 passed, 15.5 minutes, latest built server |
| `ci:mobile` final run | PASS | `ci-mobile-sasi-acceptance.log`; 374 passed, 15.4 minutes, latest built server |
| All 121 tools' processing/output acceptance | NOT VERIFIED | `inventory.json`/`inventory.csv` distinguish inventory from functional execution |
| Production deployment / online acceptance | NOT RUN | Requires final integration acceptance and one unified main commit |

The PostgreSQL tests run only on a native local cluster bound to `127.0.0.1:55464`, with disposable fixtures. They do not modify real production user data. Burn HTTP tests additionally use actual Supabase JS, native PostgREST and a separately started built Next.js server. The supporting schema is minimal; a full Supabase Auth service and replay of every historical production migration are not covered. R2 URLs are inspected without issuing requests to object storage.

Real database assertions cover view caps, repeated receipts, expiration, readiness, anonymous/authenticated permission denial, cleanup retry metadata, durable supplier receipt persistence, ownership/provider checks, injected persistence failures, one-time charging and reservation/release in both CNY and USD. Expected injected failures appear in the log; the test exits successfully after checking rollback.

The initial desktop and mobile suites each reported 366 passes, two failures and one skip. The amount-selector failures came from obsolete test expectations/locators, now corrected; targeted desktop financial tests passed. Final whole-suite runs each passed all 374 selected cases on the latest successful build, without skips. Twelve subsequently added real-output cases ran separately and passed. The initial failures and interrupted runs are not relabeled as passes.

## Remaining acceptance work

- Latest SASI response changes passed build, isolated transport/provider/recovery tests, eight targeted browser cases and both full browser suites. Details and primary-source comparison are in `sasi-platform-comparison-20261011.md`.

- Live model quality/latency and production runtime logs remain unverified. Vercel metadata/log access returned 403; the explicitly scoped CLI fallback had no valid local credentials and failed during login.
- Complete per-tool real sample processing, output/download validation and exceptional-file coverage. Rendering 119 public routes is not equivalent to 121 tools passing execution.
- Verify private R2 conditional upload/rewrite prevention, presigned PUT expiry versus cleanup/in-flight races, and eventual orphan cleanup using isolated objects. Current mocked route tests do not establish actual R2 behavior.
- Complete exact-artifact license review, notices/source distribution and commercial deployment review for FFmpeg and Gotenberg's bundled dependencies. Current server review gate is not a declaration that an unknown binary/container has been approved.
- Verify supplier result playability and the full authenticated HTTP → task → wallet → response flow in an isolated environment. Mock suppliers do not establish real paid-provider success.
- Latest `origin/main` was fetched after the full suites and still equals the protected baseline. Main's unrelated dirty files remain untouched. Integrate once all required acceptance is complete. No R64 migrations have been applied to production.

Primary references consulted: [FFmpeg legal/build requirements](https://ffmpeg.org/legal.html), [Gotenberg license](https://github.com/gotenberg/gotenberg/blob/main/LICENSE), [R2 S3 compatibility](https://developers.cloudflare.com/r2/api/s3/api/), [Temporal execution model](https://docs.temporal.io/workflow-execution), [Inngest durable execution](https://www.inngest.com/docs/durable-execution/primitives). The integration adopts transactional reservations, persisted receipts and controlled recovery in the existing runtime; it does not install a second workflow platform.

## Mini-program 5.2

5.2 was uploaded and submitted for review on 2026-10-11 at 14:35:18. The WeChat version management page still showed **5.2 审核中** during the latest check; production remained 5.1.4, published 2026-10-10 16:19:35. Upload receipt: `D:/lingxi-quantum/artifacts/mini-upload-5.2.json`.

5.2 is not described as published. Do not publish the older reviewed 5.1.7 entry by mistake. The R64 worktree changes above are separate from the already-submitted mini-program build.

## Follow-up actual-output work

`scripts/audit/r64-runtime-acceptance.cjs` now reconciles all three catalogs into 121 entries and records graph requirements and actual local probes. Eight tools passed specifically named shared-kernel fixtures; 113 remain NOT_VERIFIED in that report. A browser candidate or dedicated executor is not marked passing merely because its source exists. The old 31-entry runtime audit is incomplete and its missing-graph finding alone does not establish that a dedicated-route tool is broken.

Real native command/Python engine probes found none of the probed executables/modules installed locally; Sharp, Mammoth, ExcelJS, Readability, JSDOM, DOMPurify and Turndown were available. This is a local probe, not a declaration about production or installed browser WASM.

Actual processing review found integer conversion silently losing precision through `parseInt` before `BigInt`, and CSV silently discarding duplicate headers/missing columns/unclosed fields. Shared functions now preserve arbitrarily large signed integers within a 10,000-digit bound and reject malformed CSV instead of inventing or discarding cells. The old parsers are removed. Exact round trips, Unicode quoted multiline fields, BOM/escaped quote handling and invalid records passed module tests. Browser and final build/source checks for this additional change are in progress.

The earlier 374+374 whole-suite passes describe the preceding source snapshot. Subsequent supplier delivery/routing and developer-data changes require the additional checks recorded here; they are not retroactively covered by those passes. No unified main commit or production deployment has occurred.

## 2026-10-12 follow-up

Mini 5.2 was rejected for login-restricted withdrawal access. A verified login-return/stale-balance fix is now also staged as uncommitted work in main. Main production build, source gate, dependency contract and 13 desktop / 13 mobile financial UI fixture tests pass. Existing user data and unrelated dirty files remain protected. No new commit, deploy or resubmission has occurred.

R76's three media-import defects were confirmed. Candidate fixes, actual-source attack tests and DNS-environment limits are recorded in r76-media-import-20261012.md. The user subsequently authorized unified production release. Main integration is complete, preserving unrelated changes; final source gate and build evidence are recorded separately. Do not treat the offline R76 test report as production certification. R77 acceptance and remaining real-provider boundaries are recorded in r77-delivery-acceptance-20261012.md.
