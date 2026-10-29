# LINGXIFIELD AI Market Review Gate

This is an isolated development-branch addition to the existing Codex V2.9 integration branch.
It does **not** publish, change DNS, modify payments or grant administrator permissions.

## Run locally

```powershell
Set-Location "D:\30780\lingxi-quantum"
node --test scripts/ai-market/audit-review-gate.test.mjs
node scripts/ai-market/audit-review-gate.mjs scripts/ai-market/review-snapshot.example.json
```

The first command runs nine regression tests. The second reads a safe example snapshot and emits JSON.
`ok: true` means the structure is valid; **it does not mean publish approval**.
`indexable: false` means no verified and explicitly approved evidence should appear in public rankings.
Do not convert unknown data into zeros or invented sparkline trends.

## Snapshot contract

- `languages`: must contain zh, en, ja, ko, fr, de, es, pt, ar.
- `products`: stable lowercase IDs, valid HTTPS official website, status candidate/unverified/verified/rejected/discontinued.
- `records`: productId, metric, numeric value, HTTPS sourceUrl, observedAt YYYY-MM-DD, region, period, unit, method, status.
- `reviewApproved`: human approval flag. It must be set only after server-side authorization and evidence review; never trust this field from a public request.
- `previewUrl`: HTTPS custom domain or Vercel preview. Provision access controls separately.

The review gate currently checks structure, not external truth of a source, authorization or actual data licenses.
A production pipeline must verify company identity, source provenance, dates, scope and licenses, persist review identity and audit logs, and ensure no public client can submit `reviewApproved`.

## Known remaining work

1. Codex V2.9 already includes server-side `moneyAdministrator()` authentication for the review screen; retain it.
2. The current manager view is a read-only skeleton. Add a review record store and audited approval endpoint before wiring this module to a UI.
3. The current repository branch does not contain the full standalone V2.9 app as a mounted project. Reconcile it before attempting to replace production routes.
4. Keep nine-language translations, CNY/USD same nominal numbers, and all existing SASI, billing, wallet, order, refund and tool modules intact.
5. Run `pnpm exec tsc --noEmit` and `pnpm build` only after pulling the isolated branch into an appropriate tested workspace.
