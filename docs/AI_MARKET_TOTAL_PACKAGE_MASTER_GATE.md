# LINGXIFIELD AI Market — master integration gate

Scope: A–H combined source-only package, isolated feature branch. This report does not imply production deployment.

## Run
- `node --test scripts/ai-market/total-package-preflight.test.mjs`
- `node scripts/ai-market/total-package-preflight.mjs`
- `node scripts/ai-market/production-gate-h.mjs scripts/ai-market/production-gate-h.example.json` — EXPECTED nonzero (no production authorization).
- `pnpm exec tsc --noEmit`
- `pnpm build` after environment configuration in an isolated worktree

## Verified operational blocker
The currently connected Supabase main project is an established application database with existing users. At review it contained 0 ai_market_* tables. DO NOT run the feature branch's migrations against main until independent staging migration, rollback, permission probes, and real data reconciliation pass.

## DB migration order (STAGING ONLY)
1. data_center_a
2. metrics_b
3. h_integration_missing_tables
4. vendor_f

Other D/E/G staged schemas must be inventoried and reconciled separately. The four files above are NOT a complete production migration plan. Do not migrate until exact dependency inventory is approved.

## Payment
`payment-settlement-gate.mjs` rejects callbacks without external provider signature verification, amount/currency mismatch and known replay IDs. This is a guard, NOT a working provider webhook. Need provider-specific signature verification, atomic ledger transaction, refund consistency and sandbox evidence for PayPal, Alipay and WeChat Pay. Paid placement must never affect organic ranks.

## i18n
Nine UI copy dictionaries are present for the core search/discovery. Do not claim whole-site translation completion until ranking, product detail, vendor/order/payment pages, generic errors, metadata and Arabic RTL are browser-tested. Do not enable indexing of unfinished translated routes.

## Release
The `production-gate-h` remains deliberately blocked until all 15 independent evidence-backed checks pass with authorized manual approval. No automatic merge to main, prod migrations or deployment.
