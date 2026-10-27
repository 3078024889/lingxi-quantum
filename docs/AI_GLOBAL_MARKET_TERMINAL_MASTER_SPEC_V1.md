# LINGXIFIELD Global AI Market Terminal — Product and Data Contract V1.0

Status: implementation specification, not a claim of deployed features or collected measurements.
Principle: AI market terminal comparable to market-data dashboards, with independent evidence-based rankings. No paid ranking positions.

## 1. Entity model
Vendor -> platform -> product -> model -> version -> modality/capability -> plan -> SKU -> regional availability -> metric observation -> ranking snapshot. One platform can have many models and plans. Web subscription and API usage are distinct SKUs. Store canonical ID, aliases, official URL, parent ID, ownership, status, dates, language, country, product category, platforms (web/iOS/Android/desktop/API/self-hosted), and change history.

## 2. Global navigation
Overview; Platform Popularity; Model Benchmarks; Image; Video; Video Understanding; Audio & Music; Coding; Website Builders; Agents & Computer Use; Search & Research; Writing & Scripts; Office & Documents; Education; Science; Design & 3D; Automation; Open Source; API Pricing & Performance; Enterprise & Security; User Reviews; News & Releases; Historical Trends; Side-by-Side Comparison; Vendor Center; Methodology; Data API.

## 3. Market data
Daily/weekly/monthly active users (only if published and comparable); registered and paid users; website visits and unique visitors; session duration; referral/search/direct traffic shares; country/device split; iOS/Android downloads (lifetime and period, never confuse); app ratings and review counts; search interest; community followers, mentions, engagement; open-source stars/forks/issues/contributors/releases; vendor revenue/funding only when disclosed and clearly dated; adoption in organizations; uptime/outage/incident metrics; growth, rank movement, and history. Estimated third-party traffic/downloads must be labeled estimated and vendor-reported figures labeled self-reported.

## 4. Capability-specific fields
### Image
Text-to-image, image-to-image, inpainting, outpainting, control/reference, text rendering, consistency, background removal, transparency, aspect ratios, supported pixel dimensions, output format, count/request, generation latency, edit iteration, watermark, commercial rights, credits and cost/image.
### Video
Text/image/video-to-video, input media, maximum seconds/request, duration extension and total output cap, outputs/request, concurrent jobs, resolution, FPS, aspect ratio, audio/dialogue/SFX/music, lip sync, subtitle support, character continuity, reference/first/last frames, motion and camera controls, editing, watermark, queue time, generation latency, credit consumption, cost per 5s/10s/30s and effective cost/second.
### Video understanding
Input length, file size, FPS sampled, timestamp localization, scene/object/action recognition, transcript, multilingual subtitle extraction, summarization, grounded Q&A, temporal reasoning, output citations, error rate, processing time and cost/minute.
### Coding and websites
Languages, repository size, context, local/remote workspace, Git/PR, terminal, test execution, bug fixes, frontend/backend, database/auth/payment, API integration, hosting/deployment, custom domains, source export, preview, rollback, permissions, autonomous actions, approval gates, cost per task.
### Language, research and scripts
Context/output tokens, multilingual quality, search and citations, document ingestion, PDF/spreadsheets, fact checking, screenplays, storyboards, long-form consistency, reasoning and benchmark version, task success.
### Audio
Speech-to-text, TTS, translation, voice cloning consent controls, realtime latency, languages, speaker count, music duration, stems, audio quality, commercial rights and cost/minute.
### Agents
Browser/computer control, connectors, multi-step task success, recurring schedules, retries, audit logs, human approval, memory, safe execution, permissions, task duration and task cost.
### Enterprise/API
Input/output/cached token prices, batch discounts, image/video/audio units, rate limits, throughput, time-to-first-token, p50/p95 latency, context, SLA, uptime, retention, data training policy, region, certifications, SSO/RBAC/audit, on-premise support.

## 5. Pricing normalization
Store raw vendor price, currency, billing period, region, taxes, quota, plan and version; conversion timestamp and FX source; actual billing units (tokens, credits, image, second, minute, seat, task); free-tier expiry and restrictions. Derived USD equivalents must preserve raw values and assumptions. Do not compare per-credit prices without a published credits-per-task conversion. Subscription prices are not API token prices. Store failed/aborted generation billing and refund policy.

## 6. Evidence and ranking rules
Every observation: entity/model/version/plan, metric, value or null, unit, source URL, source organization, evidence tier (official/third-party/independent measurement), collection and observation timestamps, start/end period, geography, methodology, sample size, confidence/uncertainty, license/usage rights, last validation, supersession history. Null states: unpublished, unverified, inaccessible, not applicable, temporarily unavailable. Never infer MAU from visits or downloads, or present unverified data as zero.
Rank only compatible units, versions, periods, geographies and methods. Rankings by popularity, quality, growth, cost, user reviews, reliability and task-specific performance remain separate. Display weight formula and reproducible benchmark methodology for composites. Sponsored placements must be visibly separate and excluded from organic rank. Support daily snapshots, 7d/30d/90d/1y/all-time charts, ranking deltas, data freshness and revisions.

## 7. UX
Dense responsive sortable tables like a market terminal: name/logo, category, popularity, period change, quality, price, quota, ratings, source, freshness, rank. Column picker, multi-select filters, compare up to four products, pinned favorites, mobile horizontal scroll, charts, export CSV with provenance, saved views, glossary/tooltips for beginners. Each platform detail page shows verified capabilities, plan-by-plan restrictions, official limitations vs independently reproduced defects vs unverified complaints, price calculator, version timeline, methodology, related alternatives, review distribution and official links. Empty fields display clear unknown states, not invented placeholders.

## 8. SEO / GEO
Canonical URLs for each vendor, platform, model, version, category, ranking period and comparison; localized nine-language pages with hreflang; structured data appropriate to page type (SoftwareApplication, Product/Offer where valid, FAQ only where eligible, BreadcrumbList, Dataset where relevant); sitemap, metadata, index controls, source and methodology citations, dated change logs, meaningful editorial content, no doorway or mass-generated near-duplicate pages. Index only useful evidence-backed pages. No claim of guaranteed AI search placement.

## 9. Vendor portal and monetization
Vendor claim with domain or official account verification, role-based access, evidence submission, update review queue, dispute/correction workflow, pricing and release change requests, dashboard analytics, sponsorship/advertising clearly labeled, subscription market reports, enterprise API. Never sell organic ranking or suppress critical reviews. Store consent, contracts, disclosure and audit history. Paid verification is a process service, not a badge guaranteeing superior performance.

## 10. Data ingestion and governance
Connect official APIs and permissible public feeds, licensed third-party market data, app-store metadata, benchmark datasets, GitHub API, vendor changelogs, user reviews with moderation, opt-in independent tests. Honor robots, rate limits, licenses and privacy rules; no scraping behind logins or bypassing controls. Ingest -> normalize -> validate -> deduplicate -> source attribution -> human review for disputed facts -> snapshot -> materialized ranking -> publish. Track freshness SLAs, failures, retries, idempotency, anomaly detection, corrections and rollback. Never copy third-party proprietary data without rights.

## 11. Security and operations
Least-privilege vendor accounts, RLS, server-side auth, signed uploads, anti-spam, moderation, privacy/data deletion, audit logs, caching, rate limiting, pagination, accessible mobile UI, nine-language QA, monitoring, backups, migration rollback, reproducible CI and browser tests. No production merge until required checks and preview acceptance pass.

## 12. Legacy migration and deletion policy
Inventory existing /ai routes, catalog, evidence, rankings, compare, open-source, sponsorship and locale components; map each to target entity or screen. Remove only confirmed dead duplicate AI discovery modules after reference/dependency checks, tests and rollback-ready backup. Preserve /tools and SASI (separately maintained), external links, redirects, SEO metadata and user data. No blanket deletion.

## 13. Acceptance criteria
- No fabricated ranking values; all numeric claims have provenance, date and unit.
- Multi-axis ranking, version-aware comparisons and history render correctly.
- Model/plan/region differences and missing data are explicit.
- Mobile and desktop support search/filter/sort/compare and keyboard accessibility.
- Nine locales have no untranslated critical UI.
- Vendor submissions cannot overwrite editorial metrics without review.
- Sponsored content is separated from organic rankings.
- Old URLs redirect appropriately and no in-use /tools or SASI routes are deleted.
- Security, data integrity, pricing normalization, E2E and deployment checks pass before main.

## 14. Beginner-critical availability, billing and delivery contract
Every field is keyed by vendor/platform/product/model/version/plan/region/device/date and backed by a source or a reproducible test. Unknown is distinct from false or zero.

### Access and onboarding
Country and IP-based availability as officially stated (never advise bypassing restrictions), language availability, age requirements, web/app/API support, account creation and identity verification, phone/email verification, supported phone country codes, mandatory payment card or billing address, accepted payment rails/currencies, free-trial eligibility, invitation/waitlist, education/enterprise restrictions, local tax, cancellation availability, account closure and data portability.

### Free quota and billing lifecycle
Free requests/credits/tokens per day/week/month, reset time and timezone, whether credits roll over, expiry, per-model and per-plan quotas, daily/concurrent job caps, queue priority, promotional credit expiry, subscription renewal and auto-renewal, proration, tax, cancellation, refund eligibility, failed/timeout/cancelled/moderated generation billing, retries and duplicate charges, chargeback/support escalation, credit refund time, price change effective date, invoice availability, card verification holds, rate-limit response, spending caps, budget alerts and overage prevention.

### Actual output and delivery
Download eligibility, original versus preview output, resolution/bitrate/codec/frame rate/format, watermark and removal eligibility, editable source/project export, storage quota, artifact retention and expiry, sharing permissions, public-by-default creations, mobile save-to-gallery and share sheet, WeChat and other regional sharing, resumable downloads, export duration correctness, metadata preservation/removal, batch export, transfer rights and deletion confirmation.

### Task reliability and experience
Time to first output, queue wait p50/p95, generation latency p50/p95, success/error/cancellation rate, retries, moderation false positives, error codes, service outages, geographic latency, concurrent tasks, app crashes, accessibility, customer-support channels, ticket resolution times, real device/browser tests, performance on low-end hardware, compatibility and offline operation.

### Content rights and controls
Copyright and commercial licensing per plan and jurisdiction, input rights, consent for likeness and voice, music rights, attribution, watermark terms, training opt-in/out, public visibility, retention/deletion, content moderation and appeal, minors' safety, enterprise data boundaries and data residency.

### User-facing task economics
Show full cost to finish a task (not merely sticker subscription price): number of attempts, per-output credits, likely retries with observed distribution, duration/resolution/quality multipliers, queue time, minimum subscription needed, export/watermark costs, currency and tax, refunds. Every estimate lists assumptions, data date and uncertainty; no false guarantee of expected output quality.

### Provenance and review fairness
Separate official feature claims, official documented limits, independently reproduced defects, third-party estimates, user-submitted reports and unverified complaints. Store exact reproduction steps, device, locale, plan, model version, timestamp, sample count and correction history. Never silently convert complaints into verified defects. Prevent paid vendors from changing organic ranks.

## 15. Further frequently asked questions and lifecycle risks
- Is there a login-free demo? Can users test before paying? Are demo outputs downloadable?
- Does the platform work behind school/company firewalls? Does it require a desktop app, browser extension or GPU?
- Can users switch models mid-task, preserve prompts, version history, seeds, project assets and editability?
- Does a claimed maximum video length refer to one generation, extension chain or total export? Are audio, 1080p and 4K extra charges?
- Is a free tier rate-limited or lower quality? Does the platform add branding or public gallery exposure?
- Are outputs deterministic, repeatable and auditable? Are prompts or assets reused for training?
- Are integrations first-party, vendor-supported, community-maintained or unofficial? What happens if APIs are deprecated?
- Can a vendor terminate service or sunset a model? Are migration, refund, export and notice periods documented?
- Does a service support accessibility, screen readers, captions and keyboard use?
- Are app ratings and review counts region-specific, store-specific, verified-purchase-only or subject to sampling bias?
- Are benchmark results reproducible, contamination-aware, independently audited and version-matched?
- Can a vendor claim or dispute records, and is the correction visible to users with an immutable audit trail?
- Are comparison pages clear about availability, costs and limits instead of pushing users toward sponsored entries?

## 16. Build order and release gates
Phase A: normalized schema and evidence validation; access/quota/billing/output data; migration plan and test fixtures.
Phase B: market terminal sortable tables, filters, provenance badges, unknown states, comparison and task cost calculator.
Phase C: versioned history, charts, reliable ingestion and scheduled snapshots with source rights.
Phase D: vendor verification, claim/correction workflow, analytics, sponsorship separation and API.
Phase E: nine-language SEO/GEO, real browser/device acceptance, accessibility, production checks and safe main release.
Do not delete legacy AI pages before redirect and reference audit. Do not remove /tools or SASI.
