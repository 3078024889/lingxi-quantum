# LINGXIFIELD AI Market V3.1 - Guest, Vendor, and Capability Delivery

## Borrowed strengths, independently implemented
- Futurepedia: task-based navigation and creative work categories (https://www.futurepedia.io/ai-tools).
- Hugging Face Spaces: discoverable use cases and source-linked examples (https://huggingface.co/spaces?sort=trending).
- Artificial Analysis: separate model intelligence, latency, quality, input/output cost and methodology instead of one fabricated score (https://artificialanalysis.ai/methodology).
- OpenRouter: provider/model/price filters and bounded server-side search (https://openrouter.ai/docs/api/api-reference/models/get-models).
- Product Hunt: one-sentence value, gallery, demo, maker identity (https://help.producthunt.com/en/articles/17350772-launch-guide).
- G2: vendor ownership requests and moderated contributions (https://documentation.g2.com/help/docs/getting-vendor-support-on-g2).
Only product design patterns are studied. Never scrape copyrighted marketing prose, photos or proprietary source code into the directory.

## Public and vendor access
- Guest: no login required to search, browse, compare, read source evidence and visit official links.
- New vendor: no account necessary to submit public profile correction or evidence; submission is always pending identity check.
- Verified vendor: secure login is REQUIRED to edit a claimed product, access private analytics and purchase or manage promotions.
- Administrator: service-side authorization and audit logs; never trust the frontend to grant owner rights.
- Vendor submissions include first-party capability claim, actual outcome, example, boundary and source.
- A matching email domain alone cannot approve ownership; server-side verification and manual dispute handling are necessary.
- Natural rankings are independent of sponsorship. Paid products may buy labeled Sponsored placements, brand galleries, analytics and SEO/GEO reports, NOT fabricated organic ranks.
- Payment checkout, entitlement activation and refunds require server-confirmed orders and idempotent webhooks; no money functions are marked live until independently tested.
- Promotional finance operations are isolated from public guest traffic.

## Feature evidence pipeline
- Capability claims are distinct from pricing, region, model versions, login and payment methods.
- Each reviewed function stores specific output, realistic example, practical boundary, first-party URL and review date.
- A publisher claim is neither an independent experiment nor automatically approved.
- Reviewed profiles are in lib/capability-profiles.ts.
- The remaining catalog needs a queue: scripts/build-capability-review-queue.mjs. Running it never publishes new claims.
- Record updates by product/model/version/region and retain old snapshots for historical changes and notices.

## Low-cost two-domain deployment
- 2 GB Aliyun capacity favors CDN, static profiles, small API pagination and bounded on-demand search.
- Use external low-frequency collection jobs and durable snapshots instead of loading millions of model records into a live Next.js process.
- Media goes to an object store with upload limits and content-type validation.
- Staging stays noindex. Production sitemap only includes fully reviewed locale pages.
- Public engagement statistics should be aggregate and privacy-preserving; anonymous visitors do not need an identity.
- Keep both domains consistent and avoid duplicate search indexing through canonical references and per-locale alternate URLs.

## Release blockers
- Real browser end-to-end coverage of public search, links, compare, mobile scroll, and nine languages.
- Verified vendor ownership/login and per-product ACL; vendor profile write attempts from other vendors must fail.
- Real payments, webhook signature tests, refunds, merchant status and approved regional channels.
- SEO/GEO measurements with dated comparable query samples and transparent methodology.
- Complete capability source review beyond initial curated profiles.
- 2 GB server load, memory budget, restore and backup test.
The current PR is a preview-only engineering change, not permission to merge into main or deploy the primary domains.
