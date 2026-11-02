# B001 first-party source observations — 2026-11-02

This internal package contains **10 candidate products × 7 required review fields**, each recorded as `observed`, `conflict`, or `missing`. The published catalog remains 32 products; these are NOT published or editorially approved and do not demonstrate actual login, generative task, purchase or global regional availability.

The observed facts are transcribed from publicly accessible first-party pricing/FAQ/help pages, with the page URL, date and pricing scope. Country coverage, commercial licences, and corporate ownership are **not guessed**; missing fields are blocked from graduation.

Important conflicts:
- Cursor: current `cursor.com/pricing` displays X Subscription Free/Plus/Premium/Super/Ultra ($0/$8/$30/$100/$200), whereas legacy Cursor documents show Hobby/Pro/Pro+ ($0/$20/$60). Both can reflect different or legacy customers; compare date, country and account before choosing a price.
- Pika: current `pika.art/pricing` shows Free with **0 included monthly credits**, while older FAQ results mention Basic with **150/month**. The current-plan statement is recorded as a conflict pending editor verification, not a guaranteed grant.
- Gamma and Ideogram annual-equivalent figures are *not monthly billing amounts*. Krea and Descript yearly vs monthly equivalent prices are separately scoped.
- Notion AI Business credit policy began for new workspaces on Oct 19 and existing workspaces on Nov 2, 2026 (the day of this collection). We do not assume a single per-workspace allowance.

No scraping of third-party copyrighted listings or backfilling synthetic traffic/SEO was used. `npm run validate:official-intake` rejects duplicate candidate keys, forged source hosts, invalid dates, bad missing reasons and leak into public approvals; `node scripts/validate-company-official-observations.mjs --publication` intentionally fails while data has not been independently approved. Official source observations need human/editor validation before being copied into `verifiedFacts` and published.

Next: country policies and documented company legal identity, further Terms verification, source archive hashes, account-based workflow testing, independent reviewer approvals. Recheck fast-changing plans against official pages at publish time.
