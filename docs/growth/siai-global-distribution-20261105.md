# LINGXIFIELD × Global SIAI — verified acquisition network

Status: **implementation branch, not live**. Never present a branch-only feature as deployed or a directory listing as approved.

## Core product engines

1. **Free-tool embeds**: the distributed public-link QR generator; content is transmitted to LINGXIFIELD and must never include confidential query strings. Other tools remain direct public links pending real usability validation.
2. **Global SIAI embed**: public JavaScript component reads only curated, reviewed rows from the existing ranking catalogue. The 30 research-only preview products are not exported to partner sites or ranking score claims.
3. **Change subscriptions**: RSS exposes evidence review timestamps, not invented product launch dates. Reviewed updates become available when the approved catalog actually changes and is published.
4. **Vendor claims**: existing vendor-claim flow can be linked to from vendor outreach; only approved materials appear publicly. No purchased rank may misrepresent organic ranking.
5. **Partner installation**: /partners produces a self-service snippet, with explicit optional partner label, without collecting site-owner email.
6. **Measurement**: partner/widget UTM source, campaign, content are bounded; no queries, private paths or email addresses are recorded. webdriver browser visits are skipped. Existing historical automation pollution remains; never treat historical pageviews as verified people.
7. **Discovery**: submit two differentiated products to relevant launch directories after verified landing, multilingual copy review and click-through testing.

## Submission queue (no third-party actions performed)

| Target | Product | Method | Status |
| --- | --- | --- | --- |
| Product Hunt | LINGXIFIELD SIAI and free tools | launch page | research only |
| AlternativeTo | concrete tool category alternatives | reviewed suggestion | research only |
| SaaSHub | compare alternatives | product submission | research only |
| Hacker News Show HN | live public widgets and sample embed | community discussion | research only |
| DevHunt | verified directory feed / widgets for developers | product listing | research only |
| Uneed / Peerlist | first-party free tools | listing | research only |
| GitHub examples / awesome lists | public integration documentation | rule-compliant PR | research only |
| WordPress ecosystem | narrow, maintainable embed plugin | package after testing | not built |
| Chrome Web Store | honest tool launcher / directory lookup | build extension only if retained users justify it | not built |
| Vendor partner websites | voluntary 'compare public SI/AI capabilities' deep links | personalized, permission-based invitations | research only |

Do not send bulk unsolicited messages, scrape contact databases, pay for link manipulation or generate automated fake engagement.

## Launch gates

- New entry must be reviewed, with official source and checked date; any unsourced field is omitted in external distribution.
- External widget operates in Shadow DOM, no iframe security-policy exception, no HTML injection, no cookies.
- All nine languages have user-facing partner landing labels and widget copies; proofread translations before public release.
- Validate production public GET + no-CORS errors on a third-party domain, test QR publicly safe URL, test responsive layout on mobile.
- Confirm RSS is valid, sitemap contains /partners, and security response headers on all new endpoints.
- Confirm genuine partner visitor is attributed once for source/campaign/content; synthetic sessions are excluded.
- Confirm no preview or production Vercel deployment is triggered before the full production gate and owner release decision.

## Metrics / statistical design

Primary KPI: **verified tool completions or verified SIAI compare actions per referred human visit**; never raw PV.
Secondary: distinct returning visitors, referral conversion, partner install-to-active ratio, per-channel organic search clicks, engaged use, vendor claim approvals.
Guardrail: no leaked sensitive input, uptime, abuse cost, GDPR/PDPA privacy review, accurate evidence source.
Experiment: activate 10 genuinely installed partner widgets, compare visitors to an equal pre-period using confidence intervals; scale only when converted visitors and operational cost demonstrate value.

## Direct developer distribution (OpenAPI)
- Public source-reviewed data feed: `https://lingxifield.com/api/public/siai-widget` (available only after approved production release).
- Machine-readable contract: `https://lingxifield.com/siai-openapi.json`.
- RSS review activity: `https://lingxifield.com/siai/updates.xml`.
- Channel options: documentation links on official project pages, voluntary integrations, open-source browser extension and narrowly scoped WordPress widget.
- No pay-to-rank claims, no claims about unpublished products, no requests to buy backlinks.

## Supplier acquisition and safety
- The public `/siai/claim` intake is a review request, not instant verification or ownership.
- `/partners` now links to the claim form with an approved vendor selection prefilled when available; verified profile cards can be embedded voluntarily.
- Audit finding (2026-11-05): production vendor submissions table contained **zero rows** at query time; do not claim supplier adoption.
- Same-origin submission protection and hashed-IP rate limiting (30/hour/IP) are applied before the unchanged validated submission handler.
- The submission RPC is deliberately public but allows only intake. Review status is `pending_identity_check`; permissions and listing approval are not granted.

## Installable WordPress download
- Build pipeline uses the already installed JSZip library and an explicit four-file allowlist to create `/downloads/lingxifield-siai-wordpress.zip` before `next build`.
- Partner landing provides nine-language, one-click ZIP download. Verify `PK` archive bytes and upload to a clean WordPress sandbox before directory submission.
- This is a self-hosted plugin package, **not** an approved WordPress.org listing or third-party installation.
