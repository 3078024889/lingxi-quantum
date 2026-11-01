# LINGXIFIELD AI market — unblock public preview, Netlify Free and actual SEO/GEO

## What is currently true
- Vercel review URL is READY but Vercel Authentication protects deployment URLs; an authenticated API fetch is NOT evidence that a visitor can open them. Share links may require cookies and expire.
- The curated 32-product Next.js 15.5.x app is in branch `fix/ai-market-locale-navigation-20261101`, pull request #65. Do not confuse it with the unrelated, existing website built at the repository root and its `main` branch.
- The nine-language root HTML and RTL now pass build tests; no public Search Console observations exist. `data/seo-geo-observations.json` remains `[]`. GSC reads our own traffic, not competitor SEO rank; independent SERP / AI citations require separately dated evidence.
- All pending 10-company batches remain paused.

## Netlify Free setup — one-time action in user's GitHub/Netlify account
1. Open https://app.netlify.com/signup and select **Sign up with GitHub**. Choose the $0 Free tier (300 credits/month; do not pick paid plans or automatic top-up).
2. From Netlify dashboard choose **Add new project → Import an existing project → GitHub** and grant access to the specific GitHub repository `3078024889/lingxi-quantum`. Avoid granting all repositories when specific access is offered.
3. Important: the reviewed app is NOT the repository root. If it finds multiple projects, pick **`lingxifield-ai-market`**. For manual setup: **Base directory = `lingxifield-ai-market`**, **Package directory = empty/default**, **Build command = `npm run build`**, **Publish = `.next`**, **Node = 22**. The app-local `netlify.toml` already contains command/publish/Node configuration. Netlify's built-in OpenNext adapter provides App Router and route handlers. Never set `output: 'export'` for this app.
4. To view the completed current work without merging to root `main`, configure the **branch to deploy** as `fix/ai-market-locale-navigation-20261101`. If creation UI initially selects `main`, do NOT publish that as the AI market. Select the feature branch if available, or enable a Branch Deploy for that branch after initial connection; the default `main` branch belongs to the older, separate website. Do not merge PR #65 merely to obtain a URL.
5. Click Deploy. Once the build is green, set **Project visibility → Production: Public** (new credit-based Netlify projects may default Private). Preview branches may remain private. Until production readiness, do not configure any payment secret.
6. Copy the generated `https://<site-name>.netlify.app` URL. Execute `npm run seo:verify-public -- https://<site-name>.netlify.app` (or `node scripts/verify-public-seo.mjs https://<site-name>.netlify.app`) against the new public site. It should return 13 passing checks with preview `noindex`: nine home pages, three product pages and robots.txt.
7. Do NOT turn on indexing while the application uses a temporary Netlify URL. Keep `AI_MARKET_INDEX_READY` unset or `0` and do not add DNS or payment settings until QA passes. Monitor the 300 credits hard cap; Free may pause the site for the month if exhausted.

## Search Console and real SEO measurement
1. Choose and make public a *dedicated, owned* domain such as `ai.lingxifield.com`, only after SSL, mobile, nine locales, robots/sitemap and security checks pass. Map the DNS at the domain registrar (the actual record must come from Netlify's custom domain wizard).
2. Go to https://search.google.com/search-console and verify the property `sc-domain:lingxifield.com` with the exact DNS TXT returned by Google. If it already exists, reuse it without re-verification.
3. Enable the free Google Search Console API in the user's Google Cloud project, create a service account (read-only purpose), then use Search Console → Settings → Users and permissions to grant its **client_email** Restricted or equivalent read access to the owned property. Never expose its private_key in chat, screenshots, UI or Git.
4. In GitHub Actions protected credentials for the relevant repository, set secret `GSC_SERVICE_ACCOUNT_JSON`, repository var `GSC_PROPERTY=sc-domain:lingxifield.com` and var `AI_MARKET_CANONICAL_ORIGIN=https://ai.lingxifield.com`. The existing workflow `.github/workflows/ai-market-gsc-observations.yml` runs read-only, stores the authenticated *finalized* capture in a review artifact, not an automatic synthetic ranking.
5. Configure Netlify production env only after validation: `AI_MARKET_CANONICAL_ORIGIN=https://ai.lingxifield.com`, `AI_MARKET_DOMAIN_VERIFIED=1`, `AI_MARKET_INDEX_READY=1`, `AI_MARKET_INDEXED_LOCALES=zh,en,ja,ko,fr,de,es,pt,ar`. This is an intentional release switch, not something to set for a preview or *.netlify.app.
6. Run `npm run seo:verify-public -- https://ai.lingxifield.com --indexed` after production redeploy. Then submit `https://ai.lingxifield.com/sitemap.xml` in Search Console. Actual impressions/clicks/rank positions will appear only after Google crawls and indexes pages and has real traffic.
7. Search Console cannot tell which vendor is objectively top ranked worldwide. The app's independent SERP and AI-answer GEO comparative positions MUST come from real repeatable, dated, comparable searches with captured source and hashes. Never infer these from GSC data or catalog order.

## Hand-off when UI is complete
Netlify dashboard project URL, live site URL, first build log result, visibility and branch to deploy. Do not provide passwords, private keys, billing details or service account JSON. The registered GitHub and Vercel connections in ChatGPT can continue writing repository fixes, but no connected Netlify action exists at the time of this hand-off.

Official:
- https://docs.netlify.com/manage/projects/add-new-project/
- https://docs.netlify.com/build/configure-builds/monorepos/
- https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/
- https://docs.netlify.com/manage/security/secure-access-to-sites/project-visibility/
- https://developers.google.com/webmaster-tools/v1/how-tos/authorizing

## GSC evidence publication — explicit human approval

The scheduled collector intentionally does **not** write reviewed observations into the public ranking ledger. It creates an artifact containing unreviewed rows only. To publish a GSC observation, every row needs an explicit decision manifest.

1. Download the artifact `ai-market-gsc-reviewed-input-<run-id>` from the successful owned Search Console workflow. Save its JSON as `gsc-pending.json`.
2. Review every row's query, page URL, locale mapping, date, impressions, clicks and average position against the Search Console property. Reject identifying or ambiguous queries. The collector already suppresses common identifiers and queries with fewer than three impressions; this is a second human review, not a substitute for privacy controls.
3. Create `gsc-review-manifest.json` with one decision per pending row. Every row must be approved or rejected explicitly; a missing decision stops the process.

Example manifest shape (replace the illustrative ID and reason with the actual artifact rows):

```json
{
  "reviewer": "3078024889",
  "reviewedAt": "2026-11-01T08:00:00.000Z",
  "decisions": [
    {
      "id": "gsc-0123456789abcdef01234567",
      "approve": true,
      "reason": "Verified against the owned Search Console property and canonical product page; query contains no personal data."
    }
  ]
}
```

4. Run from `lingxifield-ai-market` with `GSC_PROPERTY` and `AI_MARKET_CANONICAL_ORIGIN` set to the same values used by the collector:

```bash
npm run seo:review-evidence -- ./gsc-pending.json ./gsc-review-manifest.json
```

This is validation-only and prints a summary. It does not change the data file. After the review is complete, rerun with the explicit publish switch:

```bash
npm run seo:review-evidence -- ./gsc-pending.json ./gsc-review-manifest.json --confirm-publish
```

The script rechecks the exact property, approved market host, localized product route, privacy-safe query, source date, metrics, record digest and one-to-one review manifest. It writes only approved rows to `data/seo-geo-observations.json`, records reviewer and reason, merges idempotently and rejects conflicting hashes. Rejected rows are not published. Commit the resulting reviewed file to the isolated AI-market feature branch and let CI validate it.

Never commit service-account JSON, OAuth tokens, downloaded account exports containing unrelated queries, or unreviewed artifacts. A green CI build with an empty observation ledger remains **zero measured SEO/GEO coverage**, not a ranking result.
