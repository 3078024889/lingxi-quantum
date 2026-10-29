# AI Market V4.7 review decisions — safety boundary

This branch adds explicit decision validation and an immutable database audit-log schema.

Do **not** expose an approval POST endpoint until a single database transaction performs:
1. Conditional update only where candidate status is 'candidate'.
2. Insert a decision audit row with the real authorized administrator ID.
3. Roll back everything if either part fails.

The review decision records are distinct from deployment permission and do not authorize publication.
Verification means an identifiable model repository was checked, not that its SEO/GEO metrics or product-level ranking were validated.
The existing UI is still read-only for candidate decisions.
Run `node --test lib/ai-market-review-decision.test.mjs`, type check, and a staging database transaction test first.
No production migrations were applied.
