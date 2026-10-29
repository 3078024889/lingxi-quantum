# AI Discovery — implementation and release contract
Scope: isolated /ai directory only; no existing tools, SASI, auth, billing, or production routes are modified.
Current directory: 41 editorial seed listings with provider links, goal filtering, category browsing, side-by-side comparisons, detail pages and an evidence-first rankings explanation.
Important: listings are NOT individually verified and are NOT a measured ranking. No current prices, active users, visits or downloads are claimed.
Public endpoints: /ai, /ai/compare, /ai/rankings, /ai/[slug].
Data architecture: catalog source is static and read-only until an approved ingestion workflow exists. Database migrations are staged, not applied.
Evidence schema: source, observation time, geography, period, measurement kind, review status; approved-only public evidence reads. Raw submissions and sponsorship requests have no public write policies.
Future features requiring independent approval: authenticated submissions with spam protection; provider dashboard; payment checkout; billing, taxes and refunds; measurement pipelines; multilingual locale integration; production migration and rollout.
Security: never put service-role credentials in browser code; no public writes to new tables; avoid user-submitted URLs without validation; no unreviewed sponsored placements.
Release checklist: install dependencies with frozen lockfile; typecheck; lint; production build; desktop/mobile Playwright; regression of all existing tools; review RLS with real staging database; confirm deployment skip behavior; approve production merge.
CI note: existing production-gate workflow triggers on PR updates and is known to fail desktop closure with missing Supabase environment configuration and unrelated assertions; investigate before merge. Do not bypass gate.
