# Temporary mail V81 corrective release — 2026-10-13

Batch sales are disabled in shared policy until production delivery acceptance is complete. The workbench hides price and purchase prompts; checkout suppresses new batch payments. Quote readiness and website/native Mini payment readiness reject new batch sales. Already-paid quotes and owned batch redemption remain available. Other paid tools remain available.

Free mailbox creation allows 10 daily per IP, and authenticated users are additionally limited to 10 per account. Changing either identity cannot bypass the other bucket. Daily reset follows the existing database UTC day. The previous IP allowance of 50 and extra daily device bucket were removed; hourly abuse controls remain.

Validation:
- Production build: PASS (`_local/handoff/build-temp-mail-free-v81.log`).
- Source gate: PASS (`_local/handoff/source-temp-mail-free-v81.log`).
- Isolated actual-route quota/payment tests: PASS (`scripts/test-temp-mail-safety-v81.cjs`). Concurrent quota adapters are mocked, not a production database race test. No production financial writes.
- Database read-only metadata inspection: quota RPC uses a transaction advisory lock, accepts per-identity limits, and cannot be executed by anon/authenticated roles.
- Desktop/mobile targeted browser regression: 10/10 PASS (`_local/handoff/browser-temp-free-v81.log`). Payments and mailbox delivery use isolated adapters.
- SEO policy tests and diff whitespace checks: PASS.

Production batch browser acceptance was previously blocked by Vercel Security Checkpoint Code 21. This release closes sales; it does not claim that checkpoint or full real paid batch delivery is resolved. Temporary Mini 1.0.1 is reported approved by the owner and must not be published. A newer package requires acceptance and review before formal release.

The obsolete, unreferenced test-tools-cost-gates script was removed; current route safety coverage is registered in the production source gate. Unrelated local work and credentials are excluded from this release.
