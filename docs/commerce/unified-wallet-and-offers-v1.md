# Unified commercial model — acceptance contract v1
2026-11-05 — **DESIGN ONLY**. Branch not deployed. Source of authority: user's requested 100+ tools pass, one wallet and pre-existing SASI task pricing.

## Visible commercial entrypoints
One `/billing` or existing billing hub (reuse current route after route audit):
- **余额 / Wallet**: CNY and USD denominations separately visible; same account, existing balance engine.
- **工具通用包 / All Tools**: Free quota 1–5 per tool/day remains; 30-day ¥99 / $99, 90-day ¥269 / $269, 365-day ¥899 / $899. No new Pro tier.
- **SASI**: original metered quotation, reservation, settlement and failure release; no new price table.
- **全球 SIAI 厂商服务**: free claim/basic evidence; paid data preparation after service delivery capability review; paid sponsor placements only after genuine impressions and reporting; separate enterprise API proposal until usable.
- **订单和账单**: recharge, pass purchase, SASI tasks, vendor invoice, failed payment and refunds in one list, with service filters.

## Accounting model
Single *user-facing wallet*, but **currency-denominated** balances `available_cny`, `available_usd`. A $99 purchase must debit 99 USD, never 99 CNY; conversions cannot be silent. Existing ledger/tables are authoritative; do not introduce replacement wallet tables.
All purchases are identifiable SKU + currency + native units. Server validates amount from signed/allowlisted catalog, never trusting client price. Quoted amount displays taxes/payment fees according to geography before confirmation.

**Wallet recharge**: payment creates pending intent -> provider confirmed via signed callback or trusted active query -> idempotent credit ledger -> updated balance. Failure never credits.
**Tool pass**: wallet debit `pass_purchase` and entitlement grant atomically, one entitlement per paid operation; start/end anchored server-side, idempotency key; renewal conditions explicit, no automatic renewal in v1; if overlapping, choose explicit extension or replacement with disclosure (default: extension).
**Tool execution**: free quotas until exhaustion; active pass enables allowed low/zero-marginal-cost tools without per-job debit; supplier-billed tasks excluded and quoted separately; normal-human-use fairness policy is transparent and restricts automated abuse, not hidden daily usage caps.
**SASI**: existing reservation/settlement/refund unchanged; pass never silently covers SASI.
**Vendor**: vendor account authorization + buyer-role access; free claim ≠ verified identity badge; paid sponsor is fully disclosed and separate from objective ordering, with contract/report.
**Refund**: payment currency consistent; do not apply a USD refund against CNY balance; rollback grants for unpaid/refunded entitlement under clear terms and regulations.

## UI (only one commercial center)
Global header balance click -> existing billing hub. Tool pass CTA and tool-quota exhaustion -> same billing hub preselected `tools`. SASI task quote -> same wallet payment confirmation. SIAI vendor service -> same billing hub preselected `vendor` with firm ownership and invoice details. No multiple wallets, no duplicate recharge flows.

## Non-negotiable launch gates
1. Locate and inventory existing real routes, Supabase ledger functions, SASI pricing formulas, recharge/Alipay/PayPal state, refunds and entitlements; write before/after mapping (NOT YET DONE).
2. Data-driven UI connected to existing real prices, no demo checkout route in production.
3. Real payment verified both provider and callback or trustworthy query; no client-side credit.
4. Test full ¥99 and $99 isolated accounting and refunds in sandbox/approved test setup; prevent cross-currency spending.
5. Pass overlap, expiry, concurrency, replay, tool-usage, abuse and cache/rate limits.
6. SASI original quote->reserve->settle->failure release untouched; both payment sources verified.
7. Vendor fulfillment evidence, receipts, sponsored disclosures and cancellation; prohibit rank purchase.
8. 9-language, desktop/mobile/browser, currency-localized receipt, privacy, legal text, tax and refund review.
9. CI and deployment gates; don't merge or use Vercel quota until actual live-compatible workflow tests pass.

## Revenue loops
Product utility (daily free tasks) -> self-serve pass if repeated need -> SASI for paid generation -> recurring task completion -> measurable qualified natural search; vendor revenue only when own deliverables/exposure are substantiated.

## Industry evidence
G2 pricing and vendor programs: https://sell.g2.com/plans and https://www.g2.com/ai-instructions
Canva pricing: https://www.canva.com/pricing/
Neither external service's figures imply our proposed prices are validated.

## Explicitly out of scope
New professional membership, new wallet, SASI formula change, fake “unlimited” for expensive third-party inference, pay-for-rank, auto-deployment.
