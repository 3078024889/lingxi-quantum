# Legacy single-tool billing retirement — evidence and no-loss migration plan
**Date:** 2026-11-05. **Scope:** all tools on lingxifield.com and lingxifield.cn. **Status:** implementation candidate, **not deployed**.

## Production data verified read-only (NO customer rows copied here)
Source: existing Supabase project, read-only aggregate SQL.
- orders with product_id like `toolquote:%`: **7 paid**, **10 pending**.
- tool_payment_quotes: **7 paid**, **6 ordered**, **27 quoted**.
- tool_export_grants: **3 consumed**, **4 unconsumed**, zero identified revoked in this aggregate.
States are different collections and can refer to the same tasks. Do not sum them or assume every paid order has finished delivery.

## Core retirement rule
Retire *new per-tool charging* after all new paths have passed real browser/server/DB tests, but preserve historical rights. It is incorrect to delete the table or disable the old paid-delivery endpoints while unconsumed paid grants or unresolved orders remain.

### Proposed safe transition
1. Read-only reconcile each old paid order against quote, payment-provider confirmation, export grant and actual completion; redact PII from CI artifacts. Include CNY/USD ledger entry and refund state. Avoid releasing confidential details in commit logs.
2. Create new orders in one *tool_pass* SKU family via existing CNY/USD wallet only. SASI task pricing remains unchanged. No per-tool quote creation for new attempts when fully switched.
3. Keep a **legacy fulfillment-only** path for pre-cutover paid grants and completed payments; it may complete a paid job, but **must not create new billable quotes or charges**. Gate by original order ID, user ownership and provider payment confirmation.
4. Unresolved pending orders: compare provider status, honor paid deliveries, cancel expired unpaid intents without erasing order/audit trail; never infer that “pending” means no funds moved.
5. Unused grants: ensure the original buyer can finish their paid task, or process a provider-verified permitted refund. Never revoke benefits merely to clean code.
6. Disable old user-facing checkout UI and quote/charge APIs after migration and preserve read-only history and refund routes. Remove obsolete source only after references, mobile/browser, mini program and payment recovery E2E prove safe.
7. For new tool pass refunds, revoke matching entitlement and reconcile wallet transaction in one auditable server-side workflow; `revoked_at` column alone is **not** a refund implementation.
8. For third-party paid-generation or SASI, preserve original per-task quotation. Never imply that the low-cost unlimited practical-tools pass pays third-party generation bills.

## Known blocker evidence from CI
- Earlier CI typecheck errors were located in file upload regex, test imports, food workspace state. Fixed on development branch; latest run is authoritative, not old snapshots.
- Static coverage audit is **not proof** of back-end enforcement. A check that sees a shared dropzone could overestimate actual protected tool paths.
- PostgreSQL 17 integration coverage has been added to isolated GitHub runner to test concurrency-relevant quota identity behavior, replay handling, CNY/USD isolation and table privileges. Passing test fixture does not prove real Supabase migration validity without production-schema-compatible staging verification.
- The tool-pass purchase API remains fail-closed unless **both** `TOOL_PASS_COMMERCE_READY=true` and `NEXT_PUBLIC_TOOL_PASS_ENFORCED=true`. Neither should be enabled in production before all gates pass.

## Critical remaining work
- All remote/server-side tool executions need independent server authorization, not merely client-side UI gating.
- Replace food-calorie legacy paid/free RPC, burn-after-read note/file legacy paid/free RPC, temp-mail server daily quota and batch payments, all other metered paths with uniform pass/one-free logic *while preserving paid historic tasks*.
- Retire direct old price quoting, paid export dialogs and old buy buttons without destroying receipt/recovery histories.
- Full nine-language + mobile desktop end-to-end test of all **124 registered public tool slugs**, including alias redirect handling and future-tool fail-closed policy.
- Active pass extension, expiry, multi-domain identity, refund, replay, high concurrency and long-running jobs must pass real integration.
- Build, automated verification and safe rollout on both Vercel-linked domains only after complete green CI.

## Safe end-state
One recharge balance per user presented uniformly, two *distinct* CNY/USD wallet denominations, tool pass 7/30/90/365 days at 29/99/269/899, one free started use per account+IP+tool per Asia/Shanghai day, and SASI original cost-by-task pricing.
