# LINGXIFIELD — Zero-audience inbound growth architecture v3
Date: 2026-11-05
Status: research RFC, NOT implemented / NOT deployed.
Repo: 3078024889/lingxi-quantum
Related: #194

## 0. Falsifiable thesis
Do not request vendor claim/cooperation before measurable buyer value and distribution.
Cold start is solved by occupying existing **intent surfaces**, not by hoping for virality.
Build one useful, verifiable result for a narrow task. Scale only when experiments show completion, return and/or referrals.

## 1. Global mechanism review (20 mechanisms)
Classify: **P0** suitable now, **P1** after product-value proof, **Reject** now.
1. Job-to-be-done utility landing pages — P0; distinct real task per page, no doorway pages.
2. Free diagnostic / engineering-as-marketing — P0; show actual losses/alternatives.
3. Marketplace distribution through official app directories — P0 discovery, conditional on product and platform approval; ChatGPT apps, Chrome Web Store; user reaches us where already active.
4. Tool-as-feature in existing user workflow — P0; user enters from concrete outcome, not generic landing page.
5. Public verifiable cost/region/source comparisons — P0; source/date/limitations with diff logs.
6. Search-to-solution intent routing — P0; deliver directly, without forced signup.
7. Open-source library/CLI embedded in developer workflow — P1; if it truly solves task and maintenance budget allows.
8. Browser extension (opt-in task action) — P1; after one clear high-frequency use case and permissions review.
9. API / MCP / ChatGPT app — P1 pilot; narrow read-only tool, rate-limited, privacy screened.
10. Shareable reproducible outcomes — P1; after outcome reliably useful; never share private files by default.
11. Collaborative network effect — P1; only if existing task naturally requires collaboration.
12. Two-sided referral incentives — P1; after retention and unit-economics proof, fraud controls.
13. Expert-curated benchmark dataset — P0 limited; tests and provenance rather than fabricated ratings.
14. Creator templates marketplace — P1; creators need existing audience/value before critical mass.
15. Partner/vendor claim and paid placements — Reject cold-start; no leverage, may undermine neutrality.
16. Generic daily content production — Reject as core; no compounding without unique data/task.
17. Mass programmatic SEO clones — Reject; search-spam and weak task value.
18. Scrape-and-spam other marketplaces — Reject; compliance/privacy/reputation risk.
19. Launch aggregators/Product Hunt — P1 finite test; burst, not sustained engine.
20. SEO/GEO answer citations — P0 enabler not growth guarantee; measure actual clicks and tasks.

## 2. Differentiated product hypothesis: "AI Choice Integrity Layer"
Instead of acting as one more AI vendor directory, be an independent, reproducible **decision-verification engine** for SI/AI costs, restrictions and practical cross-tool task completion.
Moat candidate: evidence provenance + normalized time/currency/usage + real output verification + task history + accessible operational interfaces; NOT profile card UI.
A. "Can I actually use it?" strict constraints: geography, payment rails, legal/commercial rights, free limits; UNKNOWN stays UNKNOWN. No guessing.
B. "Will this work for my exact job?" task-to-workflow with tool handoff and output verification.
C. "Am I wasting money?" manual subscription comparison, break-even point and switching costs.
D. "What changed?" evidence-backed diffs on substantial official pricing/terms/availability changes only.

## 3. First atomic market
Do **not** target everyone. Pilot **Chinese-speaking short-video creators comparing video generators, voiceover/subtitle and tool spend** (fits existing services) *or* PDF OCR editors if evidence shows stronger urgent intent. Choose based on observed available query data, success tests, and cost-to-solve; don't claim one is validated yet.
First win: solve a defined 5-minute video budget or scanned-PDF edit successfully. 10 pilot cases each, documented.
Broader 9-language rollout only after locale and regional source evidence passes.

## 4. Architecture
Evidence source register (official URL, fetch time, region, currency, price basis, terms, permission, certainty)
  -> normalized constraints catalog
  -> deterministic eligible/cost filter
  -> optional AI intent parsing (never sole source of facts)
  -> workflow graph using real tool registry
  -> task-specific user experience
  -> output/download verification
  -> privacy-safe anonymous aggregated analytics
  -> experiment controller / rollback.

Core conceptual typed records:
- task_case: id, task_type, locale, region, budget, hard_constraints, created_at
- evidence: provider_id, field, value, source_url, checked_at, valid_from, jurisdiction, confidence_status
- proposal: task_id, steps[], assumptions[], total_estimated_cost, currency, evidence_refs[], limitations[]
- result_event: anonymous_session, entry_source, task_start, task_success, output_open_verified, infra_cost (NO document contents, invoices, credentials)
- experiment: id, hypothesis, variant, metric, failure_boundary, rollout_status

## 5. Prioritized engineering sequence
Gate G0: audit currently deployed tool completion and data evidence. Do not build marketing for unfinished tool.
G1: landing "what do you need to accomplish" with no signup. 10 realistic tasks; deterministic output.
G2: manually entered cost checker with clear assumptions, optional local-only persistence.
G3: export safe, reproducible comparison link by explicit consent; remove secret fields, uploads, receipts.
G4: source-backed material change pages; only substantial, unique information indexed.
G5: official distribution via ChatGPT app/extension/CLI if independently usable; review policies first.
G6: later consider network/referrals/partner widgets if retention and cost economics show viability.

## 6. Metrics, experiments, guardrails
Primary: successful verifiable outputs per *qualified new organic visitor*.
Secondary: 7/30 day unprompted return, output open success, distribution by real external source, consented referral activation, cost per successful task, refund/failure.
Avoid impressions, raw SEO pages, mere crawl counts and clickbait share totals as success proxies.
- A/B 1: results-first task landing vs feature list; same visitor segment; success event.
- A/B 2: cost analyzer vs provider directory; task completion and useful re-use.
- A/B 3: verified share sheet vs none; legitimate referred task completions.
Pre-register hypothesis and stopping rules; check privacy, sample and uncertainty before rollout.
No promises of virality; to have self-propagation, reproduction must exceed attrition under real retention/quality.

## 7. Security and compliance
Manual data inputs; no personal account credentials. No private files/receipts in URLs, OG images, analytics, logs, public dashboards or third party widgets. Rate limits, fraud checks, bot isolation, per-job spend ceiling, cache and versioned data evidence. Public claims and savings explicitly verifiable, no fabricated performance or sponsored "objective" rank. No scraped competitors' copyrighted materials or unauthorized platform integrations.
SEO: canonical, localized hreflang, approvals, unique functional pages; no mass keyword doorway pages.
Preserve the current 62 published vs pending private SIAI candidate boundary.

## 8. Example validation thresholds (hypotheses, NOT measured benchmarks)
First 20 scenario tests: 100% factual fields source-traceable; 0 sensitive data leaks; each task usable on mobile and desktop; total cost below internal per-task cap. If fewer than 16/20 can produce meaningful verified results, reduce scope and fix utility, do not promote.
Post-pilot, expand only if observed real qualified organic entrants successfully complete jobs and at least one repeat/referral path is measurable. No arbitrary traffic promises.

## 9. Global references
- Y Combinator: https://www.ycombinator.com/library/96-do-things-that-dont-scale
- Andrew Chen, The Cold Start Problem: https://www.coldstart.com/
- Dropbox founder interview: https://sequoiacap.com/podcast/crucible-moments-dropbox
- HubSpot Website Grader: https://blog.hubspot.com/marketing/website-grader
- Harvard Working Knowledge early marketplace growth: https://www.library.hbs.edu/working-knowledge/how-uber-airbnb-and-etsy-attracted-their-first-1-000-customers
- Wise investor Q&A: https://owners.wise.com/investor-topics
- Chrome Web Store discovery: https://developer.chrome.com/docs/webstore/discovery
- OpenAI ChatGPT apps announcement: https://openai.com/index/developers-can-now-submit-apps-to-chatgpt/
- Google Search spam policies: https://developers.google.com/search/docs/essentials/spam-policies
- Stack Overflow 2026 survey: https://survey.stackoverflow.co/2026/ai/data
