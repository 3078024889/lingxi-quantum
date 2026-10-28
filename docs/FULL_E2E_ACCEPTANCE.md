# Acceptance checkpoint — 2026-10-28

Overall: **NOT READY FOR PRODUCTION**. This document does not mark full E2E as passed.

## Actual execution

- PASS: `node --test tests/ai-*.test.mjs` on local Node v24.19.0: 126 tests, 126 pass, 0 fail.
- PASS: isolated React terminal in headless Microsoft Edge, desktop 1440×1000 and mobile 390×844: search, expanded official link, saved product after reload, five-item selection limit and comparison URL, column visibility, no-result help route, no document horizontal overflow, no browser runtime errors.
- Browser harness uses real terminal component and existing catalog with a plain-anchor replacement for Next Link. It does not run Next.js routing, authentication, API, payments or email. Do not call this full-site acceptance.
- Source review: official website addresses are existing catalog entries, not newly verified product facts. Three contact emails originate from app/about/page.tsx.

## Fixed baseline failures

1. Manifest runtime test removed its temporary directory before its scheduled assertion ran. Moved setup and cleanup inside the test body.
2. Cost runtime test imported TypeScript in a CI job that did not install dependencies. Uses Node's built-in type stripping to execute the original pure module. CI uses current Node 22; local run uses Node 24.
3. Discovery test asserted obsolete marketing sentences. Retained SQL public-write checks and evidence data parsing; numeric ranking behavior remains checked by ai-ranking.test.mjs.

## Remaining gates

| Gate | Status | Evidence needed |
|---|---|---|
| Full Next build / production CI | BLOCKED | Full dependency/runtime setup and rerun; earlier PR production gate failed |
| Cross-page browser flow | NOT_IMPLEMENTED | Real Next routing and product/compare/help navigation tests |
| Real mailbox round trip | BLOCKED | Verified sender, receiving domain, webhook/admin configuration, controlled authorized test messages |
| Vendor ownership / fourth slot | NOT_IMPLEMENTED | Transactional claims and real authenticated portal |
| Payment sandbox / refund | BLOCKED | New vendor order mapping and actual supported payment test credentials |
| Durable history / recovery | NOT_IMPLEMENTED | Persistent database adapter and restore drill |
| Nine languages / RTL | NOT_IMPLEMENTED | New terminal translations, content and route tests |
| Live website acceptance | BLOCKED | Candidate build in isolated environment; do not test unfinished changes as deployed |
| Production release | BLOCKED | All required gates plus intended project/environment verification |
| Continuous cloud operations | NOT_IMPLEMENTED | Durable jobs, bounded retries/budgets, alerts, pause controls and verified credentials |

No production deployment, merge, actual charge, email send or cloud schedule was performed during this checkpoint.
