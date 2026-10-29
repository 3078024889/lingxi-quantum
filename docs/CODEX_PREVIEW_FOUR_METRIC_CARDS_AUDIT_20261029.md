# Vercel preview four metric cards audit (2026-10-29)
Observed preview: lingxi-quantum-r83jfdkwa-celestial9.vercel.app, deployment ID dpl_DmjkzVDM24retRfMycV6dPZcJxFs, Vercel state READY, target staging, source Git SHA adbbcd992709e50c706b68eee84b211a1958bf24. It does **not** represent the latest A-H feature branch.

At this deployed SHA, `lingxifield-ai-market/app/market-workbench.tsx` directly renders four static metric cards with `<b>待接入</b>`:
1. global AI website visits / Similarweb
2. global AI app downloads / AppMagic
3. AI search and GEO visibility
4. AI financing and IPO activity.
No fetch call drives those four numeric cards. The current feature branch version changes the placeholder to `暂无可靠数据`, not to sourced metrics.

Acceptance tasks:
- Extract the four cards into an evidence-first metric data adapter with data source, coverage, unit, period, region, last checked and status; where absent show “无已核验数据” and actionable explanation, not fabricated numeric counts.
- Similarweb/AppMagic commercial estimates require permitted APIs/licenses. Do not scrape paywalled sites, misuse metrics or imply Google Search Console data gives global competitors’ traffic. GSC is property-specific verified-owner data and not a global GEO leaderboard.
- For GEO, separate (a) publicly reproducible, versioned prompt-panel citation frequency under defined sampling from (b) estimated traffic and (c) provider analytics. Require method, query list, model version, region, samples, timestamps and review evidence before a “rank” is published.
- Financing: official company announcements and licensed structured filings, preserve exact entity and round/date. Do not infer financing from product platform names.
- Review `lingxifield-ai-market/lib/data.ts`: it contains explicit layout-demo score/seo/geo and trend values. Guard against any display of demo metrics as verified ranks.
- Confirm Git commit/branch actually built in Vercel before treating preview as test evidence. Deploy preview only after isolated build/E2E, no production release or main merge without consent.
- Add E2E tests asserting missing source -> no numerical score; verified source -> correct value + citation. For each of nine languages ensure localized unavailable status.

This is an audit, **not** evidence these data integrations are done.
