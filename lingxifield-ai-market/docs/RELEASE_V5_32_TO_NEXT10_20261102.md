# Global SIAI V5 launch acceptance and batch-expansion gate

## State of current 32 as of 2026-11-02

The catalog contains exactly 32 curated products. The last public HTTP HEAD pass is a **reachability probe**, not an actual live task. The separate `data/acceptance/curated-32-use.json` records **0/32 genuinely executed task suites** at creation; each vendor starts `not_run`. No placeholder is classified as a passed test. A browser challenge or HTTP redirect is not automatically counted as a broken product.

`node scripts/validate-32-launch.mjs` reports accurate outstanding gates, and `node scripts/validate-32-launch.mjs --strict` exits nonzero while release is incomplete. The default validation is suitable for CI data integrity and **does not** pretend that merchant and live browser gates have passed.

### Independent task QA evidence format
Each entry must use its declared archetype: `web_app`, `developer_sdk`, `self_hosted`. A `passed` entry must include `testedAt`, all required `cases` with meaningful notes and HTTPS evidence URLs, and at least one independent evidence link. A mobile experience cannot be silently omitted from web apps; self-hosted systems instead require hardware / license tests. Source documentation and HEAD responses alone cannot satisfy this check. Credentials and secret outputs must never be saved in source control or public artefacts.

### Conditions before batch B001 publication
All 32 have real use evidence, the nine locale/device suite passes in real browser, a public verified domain is accessible, live SEO/GEO ownership/measurement exists, and provider-signed payment + refunds + revocation are finished. PR preview URLs and merchant environment variables **do not** provide these proofs. B001 remains exactly 10 undisclosed candidates, all `publishApproved:false`; the public search index must not import these products by accident.

### Reusable ingestion
When gates are passed, intake comes in batches of 10 through verified company identity, official URLs, task outcomes, source-linked free/price/API/region/commercial fields, product model versions, app/mobile endpoints, review provenance and company capital status. The existing `auditCatalogImport` rejects duplicates/stale source records, then all nine locales and links must be checked. Do not scrape copyrighted third-party catalogs or copy their frontend source verbatim.

### Compared product patterns (public websites checked Nov 2026)
- Toolify https://www.toolify.ai/ : category, usage/region discovery, tool submission vs promotion distinct
- Futurepedia https://www.futurepedia.io/ai-tools : task-first taxonomy and guided discovery
- G2 https://www.g2.com/ai-instructions : verified-review provenance, free vendor claim and organic ranking distinct from paid advertising
- Product Hunt https://www.producthunt.com/products/cursor : launch/update chronology, team/company and reviews
Adapt the *product ideas*, not third-party copyright-protected code or unsupported user metrics. Never claim a G2 badge/review total or traffic stat for our marketplace.
