# LINGXIFIELD × Global SIAI — verified acquisition network

Status: **implementation branch; production release pending**. Never present a branch-only feature as deployed or a directory listing as approved.

## Core product engines

1. **Free-tool embeds**: the public-link QR generator runs inside the partner page; the free-tools widget is a searchable directory of anonymous local tools that opens the canonical LINGXIFIELD tool page. Do not describe the whole 100+ tool catalogue as executable inside third-party pages.
2. **Global SIAI embed**: public JavaScript component reads only curated, reviewed rows from the existing ranking catalogue. The 30 research-only preview products are not exported to partner sites or ranking score claims.
3. **Change subscriptions**: RSS exposes evidence review timestamps, not invented product launch dates. Reviewed updates become available when the approved catalog actually changes and is published.
4. **Vendor claims**: existing vendor-claim flow can be linked to from vendor outreach; only approved materials appear publicly. No purchased rank may misrepresent organic ranking.
5. **Partner installation**: /partners produces self-service snippets for SIAI, QR, free-tools and an optional verified vendor card, with an explicit optional partner label and no site-owner email collection.
6. **Measurement**: partner/widget UTM source, campaign, content are bounded; no queries, private paths or email addresses are recorded. webdriver browser visits are skipped. Existing historical automation pollution remains; never treat historical pageviews as verified people.
7. **Discovery**: submit two differentiated products to relevant launch directories after verified landing, multilingual copy review and click-through testing.

## Current implementation boundary — verified in source

| Surface | Implemented capability | Not yet claimed |
| --- | --- | --- |
| data-lx-widget="siai" | Shadow-DOM SIAI directory backed by the public, curated read-only feed | No unreviewed candidate export or paid ranking |
| data-lx-widget="tools" | Public-link QR generation inside the partner page | Not a general-purpose embedded PDF/video tool runtime |
| data-lx-widget="free-tools" | Anonymous local-tool directory with links to canonical tool pages | Tool processing does not run inside the partner page |
| data-vendor | One reviewed vendor profile card | Vendor submission is not automatic approval |
| ResultGrowthActions | First-party result download/share/template actions | Not a standalone third-party share widget |
| WordPress | PHP shortcodes, locally bundled JS, deterministic ZIP builder wired to prebuild | No WordPress.org listing or clean third-party-site installation claim |
| MCP / ChatGPT | Local MCP v2 diagnostic server and protocol test source exist; public route remains disabled/noindex | No hosted ChatGPT app integration, production MCP endpoint or marketplace listing claim |
| OpenAPI / RSS | Read-only public contract and reviewed-profile update feed in source | Production availability must be rechecked after release |

The global site currently sends frame-ancestors 'self' and X-Frame-Options: SAMEORIGIN. This is intentional: do not weaken the site-wide frame policy to make arbitrary tool pages embeddable. Any future in-page tool execution must use a separately reviewed, least-privilege widget surface or an explicitly isolated origin with a documented threat model.

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
| WordPress ecosystem | self-hosted plugin package with SIAI, QR, free-tools and vendor shortcodes | deterministic ZIP build + sandbox install | source and build implemented; clean sandbox install pending |
| Chrome Web Store | honest tool launcher / directory lookup | extension package and store review | prototype/source and regression tests exist; store submission pending |
| Vendor partner websites | voluntary 'compare public SI/AI capabilities' deep links | personalized, permission-based invitations | research only |

Do not send bulk unsolicited messages, scrape contact databases, pay for link manipulation or generate automated fake engagement.

## Launch gates

- New entry must be reviewed, with official source and checked date; any unsourced field is omitted in external distribution.
- External widget operates in Shadow DOM, no iframe security-policy exception, no HTML injection, no cookies.
- All nine languages have user-facing partner landing labels and widget copies; proofread translations before public release.
- Validate production public GET + no-CORS errors on a third-party domain, test QR publicly safe URL, test responsive layout on mobile.
- Confirm RSS is valid, sitemap contains /partners, and security response headers on all new endpoints.
- Confirm genuine partner visitor is attributed once for source/campaign/content; synthetic sessions are excluded.
- Generate the WordPress ZIP from the four-file allowlist, verify its exact members and PK signature, then install it in a clean WordPress sandbox. Do not confuse a generated installer with a WordPress.org listing.
- Confirm no preview or production Vercel deployment is triggered before the full production gate and owner release decision.

## Metrics / statistical design

Primary KPI: **verified tool completions or verified SIAI compare actions per referred human visit**; never raw PV.
Secondary: distinct returning visitors, referral conversion, partner install-to-active ratio, per-channel organic search clicks, engaged use, vendor claim approvals.
Guardrail: no leaked sensitive input, uptime, abuse cost, GDPR/PDPA privacy review, accurate evidence source.
Experiment: activate 10 genuinely installed partner widgets, compare visitors to an equal pre-period using confidence intervals; scale only when converted visitors and operational cost demonstrate value.

## Direct developer distribution (OpenAPI)

- Public source-reviewed data feed: https://lingxifield.com/api/public/siai-widget (production availability must be verified after release).
- Machine-readable contract: https://lingxifield.com/siai-openapi.json.
- RSS review activity: https://lingxifield.com/siai/updates.xml.
- Channel options: documentation links on official project pages, voluntary integrations, open-source browser extension and narrowly scoped WordPress widget.
- Experimental MCP: the v2 SDK-based diagnostic server is local-only and its tests are not a production deployment. The public JSON-RPC route remains off by default/noindex; hosted ChatGPT app identity, SDK hosting, abuse controls, privacy review and real-client conformance remain release gates. Do not claim ChatGPT integration or listing.
- No pay-to-rank claims, no claims about unpublished products, no requests to buy backlinks.

## Supplier acquisition and safety

- The public /siai/claim intake is a review request, not instant verification or ownership.
- /partners links to the claim form with an approved vendor selection prefilled when available; verified profile cards can be embedded voluntarily.
- Historical audit snapshot (2026-11-05): production vendor submissions table contained **zero rows** at query time. Recheck the current table before making any supplier-adoption claim.
- Same-origin submission protection and hashed-IP rate limiting (30/hour/IP) are applied before the unchanged validated submission handler.
- The submission RPC is deliberately public but allows only intake. Review status is pending_identity_check; permissions and listing approval are not granted.

## Installable WordPress download

- Source exists under integrations/wordpress/lingxifield-widgets/: PHP shortcodes and a locally bundled widget JS file.
- scripts/prepare-wordpress-plugin.cjs uses the installed JSZip dependency and an explicit four-file allowlist to generate /downloads/lingxifield-siai-wordpress.zip during prebuild.
- The builder verifies that the bundled JS exactly matches public/widgets/lingxifield-v1.js, checks package members and enforces size bounds.
- Automated tests verify the shortcode contract, source parity, ZIP builder allowlist and public download signature. A clean third-party WordPress sandbox installation remains a separate acceptance gate.
- This is a self-hosted plugin package, **not** an approved WordPress.org listing or proof of third-party installation.
