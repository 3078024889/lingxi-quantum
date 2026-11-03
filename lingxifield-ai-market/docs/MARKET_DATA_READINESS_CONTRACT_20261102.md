# Global SIAI · Public data completeness status endpoint

Read-only API: `GET /api/v1/data-readiness`.

Measured metrics and SEO citations are **never fabricated** from catalog presence or hypothetical ranking. Read the API after each deployment to see present evidence gaps.

- `sourceFacts` measures completeness of the **six independently sourced catalog fact fields** for the curated 32 products (price, free allowance, regions, model information, commercial terms and payment methods). A field with an HTTPS source is **not** automatically accurate, current or independently tested.
- `companies` groups products by publisher, separates corporations from open-source projects, and reports actual sourced founding-year, office/contact-address, funding and publicly listed-parent coverage. Financing missing is not zero.
- `apiBilling` reports billing type separately for all 32 and counts products with actual documented developer unit rates. It never converts web subscriptions into API token fees.
- `independentEvidence` reports real stored and verified market records, real submitted user-experience rows, and validated SEO/GEO observation records. A zero record count is no observation, not a score of zero.
- `merchantBilling` reads the fail-closed deployment status but never exposes passwords, tokens, credentials, merchant customer details or private orders. Each provider remains `not_live` until real approved end-to-end payment verification.
- Preview remains `noindex`; production robots, ownership, payments and domain changes are outside this PR.

Release checklist: `node --test tests/market-source-coverage.test.mjs`, `npm run build`, `curl -fsS https://<approved-preview-host>/api/v1/data-readiness`. Before activating the search index: verify dedicated domain ownership, DNS, canonical/hreflang, GSC property grants and sampled independent measurements. Before payments: provider approval + signed callbacks + isolated atomic ledger + refunds + verified fulfillment + security review.
