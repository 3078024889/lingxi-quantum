# LINGXIFIELD AI Discovery — Product Contract V1.1

## Non-negotiable
All customer-facing text describes goals, benefits, evidence and actions. No implementation jargon (API, schema, GEO sampling, RLS, JSON-LD, crawl jobs, model weights) in user-facing UI. Technical terminology is allowed only in developer docs and admin panels.

## Customer journeys
1. "I want to create a video" -> use-case category -> relevant tools -> compare quality, price, constraints -> official link.
2. "Which is more popular?" -> choose metric (web visits, app downloads, active users), geography and date -> source-backed ranking.
3. "Which is best for me?" -> choose budget, language, platform, intended task -> shortlist with explicit reasons.
4. "ChatGPT vs Grok" -> comparison page with capabilities, limitations, prices, last checked dates and links.
5. "I want my AI listed" -> free submission, verification, editorial approval.
6. "I want promotion" -> separate sponsored inventory and transparent pricing, no ranking manipulation.

## Coverage taxonomy
General assistants; Research/Search; Coding; Video; Images; Audio/Music; Presentations/Documents; Automation/Agents; Marketing/SEO; Education; Business; Local Chinese ecosystem; Open-source models.
Platform -> product -> feature -> task -> plan -> region -> evidence. A platform may contain multiple products and each product multiple features.

## Ranking integrity
Separate website visits, monthly active users, cumulative downloads, monthly downloads, user ratings, benchmark quality, search visibility and answer-engine mentions. Never collapse incomparable metrics into a single unqualified "global rank".
For every numeric metric store: provider, exact metric, unit, geography, measurement window, captured timestamp, source URL, license, estimation/official flag, confidence/limitations.
No metric without evidence; unknown = "Not publicly available". Sponsored placements never affect organic order.
GEO visibility is an observed prompt-sample result, not a universal ranking; include provider, model/version, locale, prompt set, repeated observations, timestamps and uncertainty.
Editorial review and duplicate checks before publishing. No scraped copyrighted copy or misleading affiliation.

## Design
Clean international editorial design, accessible contrast, mobile-first, real brand assets with usage rights, light/dark themes. Use the original LINGXIFIELD logo asset, never redraw. Clear search, category filters, evidence badges and price transparency. Localize customer copy into existing locale architecture when integrated.

## Revenue
Free verified listings, clearly labeled sponsored cards, category placements, partner links and subscription analytics. No charges without owner-approved payment account, pricing, cancellation, refund policy, taxes and checkout test.
Advertiser workflow: inquiry -> verified brand -> proposal -> approval -> payment confirmation -> time-boxed placement -> receipt/report -> expiry.

## Release gates
1. No modification of current tools/SASI/payment flows.
2. Typecheck, lint, production build and browser/mobile smoke tests.
3. Database migration reviewed; no public write access; RLS checks.
4. Search metadata, sitemap inclusion, locale routing, canonical and schema tests.
5. Ranking source integrity, no fabricated metrics, sponsored disclosure.
6. Preview deployment and rollback path before production merge.
