# H integration 02 — schema corrections and real product read API

Code committed to isolated branch; not production tested.

Fixes:
- Verified search now filters the **actual** staging column ai_market_identity.status (the earlier verification_status query was incorrect).
- Evidence query includes entity_id; tool recommendations require evidence.entity_id to equal capability.entity_id, preventing another entity's evidence from being reused.
- Regression test added for cross-product evidence.
- New read-only product details route: GET /api/ai-market/products/:id, with verified identity and reviewed profile claims. Conflicting source claims are suppressed; unverified metrics and reviews are never invented.
- API intentionally returns 503 when Supabase is not configured or staging claim table has not been applied.

Remaining critical gates: SQL staging migration and real fixtures, authentication and high-privilege separation, actual product pages, query pagination instead of capped scans, language variants, admin review and payment integrations, end-to-end build and browser testing. No payment, migration or deployment executed.
