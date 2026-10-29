# Gate for promoting to the production website
1. `npm.cmd install` and `npm.cmd run build` in a clean directory.
2. Check `GET /`, `GET /api/v1/platforms`, `GET /api/v1/evidence`, `/robots.txt`, `/sitemap.xml`.
3. Verify no red hydration overlay with a clean browser profile and test mobile widths.
4. Exercise search, category selection, details, compare modal, period switch, language choice and currency choice.
5. Run `npm.cmd audit --omit=dev` and triage alerts; do **not** run `npm audit fix --force` blindly.
6. Check memory under the 2 GB server budget with realistic traffic. API data collectors and scraping should run elsewhere.
7. Prove nine translated routes, canonical and hreflang, payment receipts, and dual-domain indexing before claiming those features are released.
8. Do not merge into existing lingxifield.com/.cn tool routes until isolated regression is complete.
