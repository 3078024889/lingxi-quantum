# LINGXIFIELD V2.9: verified source intake staging

This release does not claim a live worldwide directory. It adds controlled source ingestion to the existing Next.js project.

## Guarantees
- Read-only preview by default; no automatic ingestion of unchecked content.
- Requires HTTPS, source category, observation time, and nonempty product metadata.
- Detects existing product IDs, batch ID duplicates and same-site domain collisions.
- Explicit approval uses a separate JSON array of IDs; committed records remain `unverified`.
- Existing V2.8 catalog, evidence and UI are preserved by the installer.
- `npm run gate` enforces data validation, Node tests, TypeScript typecheck, Next.js build.

## Usage (run in project directory)

```powershell
npm.cmd run review:sources -- "D:\data\candidates.json"
npm.cmd run review:sources -- "D:\data\candidates.json" --approve "D:\data\approved-ids.json"
```

Candidate fields: `id,name,company,category,description,capabilities,website,sourceUrl,sourceType,observedAt,reviewStatus`. `sourceType` must be `official_site`, `official_docs`, `official_pricing`, `company_registry`, `app_store`, or `third_party`; `reviewStatus` must be `pending`. `observedAt` must be an ISO parseable timestamp. This is a manually supplied source candidate (not a verified claim).

Do not label records as verified until evidence and independent checks support such classification. Never infer financing, pricing, SEO/GEO scores or usage numbers from a mere URL.

Build gate does not constitute end-to-end browser or production data-source validation. No production deployment or GitHub main merge is performed.
