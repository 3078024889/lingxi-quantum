# Total Package F: Vendor claiming, sponsored placements and payments

Status: CORE SOURCE COMMITTED — NOT PAYMENT INTEGRATED OR ACCEPTED.

Business rules: verified company may claim up to **three products free**; reviewer approves domain DNS, domain file or official email evidence. Existing approved claims count as occupied slots. Paid placements are clearly marked “Sponsored” and never affect organic ranking. The nominal amount in CNY and USD uses the same numeric value *only where configured for a given package*; no FX conversion is performed. This is a business rule, not a market exchange-rate claim.

Existing website payment flows for Alipay, WeChat and PayPal MUST be investigated and reused via existing order/payment service. This commit **does not implement a checkout or provider webhook** and never treats front-end payment status as paid.

Files: lib/ai-market/vendor-commerce.mjs, tests, and staging-only vendor schema.

Production blockers: identity linkage and claim proof challenge, rate limits, user authorization, concurrency-safe three-free enforcement in one database transaction (not just frontend validation), plan configuration and tax/legal analysis, existing billing integration, verified provider callbacks and signed events, refunds/cancellation, reconciled ledger, admin dispute process, mobile and nine-language checkout, end-to-end payment sandbox tests.

Run: node --test lib/ai-market/vendor-commerce.test.mjs
