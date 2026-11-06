# LINGXIFIELD / Global SIAI — public placeholder and real-data release audit
Audit date: 2026-11-05. Scope: current PR #196 branch, source inspection and latest GitHub CI. This is NOT an end-user field verification or a production deployment certificate.

## Current public/private cohorts
- 32 curated products plus 30 *source research previews* = 62 visible product records. A product is not the same thing as a legally independent company.
- B001–B010: 100 private research candidate product IDs across 88 publisher-group keys. B006–B010 adds 50 distinct IDs, all `reviewed=false`, `publishApproved=false`, `visibleToPublic=false`.
- B006–B010 seven-field evidence: 115 observed first-party source entries, 235 unknown entries; B009–B010 have 9 scoped official source observations and 131 unknown fields. These are still nonpublic, unapproved and not payment-verified.
- `data/acceptance/candidate-all-real-use.json` covers 100 candidate IDs, all with `endToEndStatus=not_verified` and `productionEligible=false`; it does **not** prove a vendor login, actual model run, export, payment or refund.

## Public text audit, verified inspection
1. `components/SiaiRankingHome.tsx` uses `NO_SOURCE_COPY` for missing preview fields and actively filters the old “官网资料补充中” string; no literal public placeholder appears in the inspected main SIAI route and ranking component. This is scoped source inspection, NOT proof that every page of the 7,577-entry repository has been visually audited.
2. `app/siai/candidate-public.ts` exposes only B001–B003 as explicitly tagged source previews and suppresses unsourced detail facts rather than converting them to positive availability.
3. **Verified improvement / future regression risk**: All 32 curated IDs currently have six corresponding first-party source URL properties (price, free, region, models, commercial, payment) in `market-researched-facts.ts`, as checked against the curated service ID list. This confirms a source URL is recorded, NOT that each remote link, dated claim, checkout or vendor result remains correct today. `app/siai/catalog-data.ts` still has a fallback path into legacy platform text if future source records disappear. The new CI test locks in 32-ID source-property coverage; an independent live URL/content recheck is still required before claiming current verified pricing for all 62.
4. `components/SiaiRankingHome.tsx` labels undocumentable data "未公开" (not disclosed); distinguish missing evidence from an affirmative vendor non-disclosure. Consider "暂无核实资料" for research previews if policy permits, across all nine languages.
5. 9-language labels are present in the ranking component; an exhaustive visual and semantic nine-language content inspection is NOT established by this static scan.

## Real engineering and commercial incompleteness
- `app/api/tools/pricing/route.ts` and `lib/tools/paid-catalog.ts` still expose tool-by-tool pricing for 25 public paid IDs. The separately drafted universal tool package / one-free-use-per-account-per-IP-per-tool regime is **not implemented** in this PR; #195 holds only draft config and notes and must not be called production-ready.
- `lib/tools/commerce/free-entitlement.ts` currently limits only three specialized entitlement kinds, not the entire practical-tools catalogue. Its hashing function falls back to a fixed literal if all configured salts are missing; production should fail closed and require a dedicated privacy hash secret, with migration planning for existing hashes.
- 100 vendor platform account workflows lack independently verified login, model execution, output inspection, export, actual checkout or refund evidence. Do not claim that 100 vendor tools have been manually tested.
- No verified universal-package entitlement, atomic usage consumption, idempotent charging, cross-device/IP abuse validation, refund path, production provider checkout or multi-currency end-to-end evidence has been established in this branch.
- Do not treat an official price page, green CI, test fixtures, or HTTP 200 as proof of real third-party fulfillment.

## Stop-ship gates
1. CI on the *final* PR head: independent private-candidate integrity, isolated market, PostgreSQL security, desktop/mobile PDF (genuine touch), real file outputs, tool quota, full four-shard Production Gate.
2. Ensure candidate records cannot leak through ranking, public widget, sitemap, any localized route, export or discovery API.
3. Resolve field provenance and nine-language truth labeling **before claiming verified product details**. Keep unknown values explicitly unknown, not guessed.
4. Do not launch universal-tool-pack offers or claim wallet coverage until server-side entitlement, pricing, checkout, refund, and usage tests are proven.
5. Make one production deployment only after scoped release gates pass; record main SHA, Vercel deployment SHA, both domains' HTTP/product results, and rollback path. External vendor testing requires a separately authorized evidence workflow.

## Decision
A safe, *private audit data-only* merge can be considered after final-SHA CI is green. This audit expressly does **not** authorize a claim that the whole platform, vendor truth, and universal subscription charging are finished. Do not merge legacy conflicting #193 or draft #195 into this release.
