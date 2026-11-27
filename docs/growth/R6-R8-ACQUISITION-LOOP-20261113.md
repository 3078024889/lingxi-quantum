# R6/R8 Global Acquisition and Conversion Loop

Updated: 2026-11-13

This document records the current implementation contract for the global growth system. It is an operating plan, not a claim that every external directory has already accepted or published LINGXIFIELD.

## 1. Product architecture

The public growth system has three primary product destinations:

1. **Global SIAI rankings** — vendor, model and tool profiles; capabilities; official prices; free allowances; region availability; payment evidence; commercial-use terms; and source-linked updates.
2. **SASI Software Marketplace** — MT5 EAs, trading source code, other finished software, seller publishing, buyer guides, licensing and payment-verified automatic delivery. Product format and license scope follow each listing. Copernicus SI is source-code-only.
3. **100+ practical online tools** — PDF, OCR, images, video, audio, documents, spreadsheets, privacy and everyday file workflows.

The global tool catalogue currently contains 123 unique tool detail entries. The `/tools` directory is the additional top-level entry, giving 124 public tool entry points. This is not a claim of 124 distinct tool detail slugs.

## 2. Seven acquisition engines

| Engine | Public route or surface | Intended loop |
|---|---|---|
| Curiosity-led discovery | `/discoveries` | A sourced mystery or unusual record earns attention; readers inspect primary sources and continue into a real file task. |
| Problem-led search | `/tools`, 9-language tool pages, FAQs | A concrete file problem leads directly to the relevant tool and a verified output. |
| Before / After proof | `/discoveries#before-after`, compression tools | File sizes and output differences come from the actual input and result; no invented savings percentages. |
| Practical scenarios | `/discoveries#use-cases` and tool pages | Public reports, document comparison, translation, OCR and file preparation become repeatable task flows. |
| Software commerce | `/sasi`, `/sasi/seller`, `/sasi/delivery` | Buyers inspect listing-specific versions and licenses; developers submit finished software; delivery follows verified payment and order authorization. |
| User results | Tool result pages and `ToolShareRail` | A completed task can be shared through a public route without exposing private file names, prompts or account identifiers. |
| Partner and referral distribution | `/partners`, JS Widget, WordPress plugin, API, RSS, QR | External websites embed public SIAI/tool surfaces; source labels allow aggregate attribution and return visits. |

The homepage presents these as connected growth paths, not isolated advertising cards. The ToolPass membership panel is placed after the tool/problem content and SEO answers so the first value is visible before the recurring-use offer.

## 3. Value-first conversion model

1. A visitor arrives through search, a source-linked discovery, a partner embed, a QR code, a widget, an RSS/API consumer or a shared result.
2. The visitor completes a practical task using the free surface where available.
3. The result is checked before any paid choice is presented.
4. ToolPass is offered for recurring use, multiple files and sustained workflows across the practical-tool catalogue.
5. SIAI supports comparison and product discovery; SASI supports software purchase, seller publishing, licensing and automatic delivery.

The platform does not subsidize unpredictable third-party model-token costs. Any paid processing and applicable model/API charges must be disclosed before execution. Do not market user-provided model API costs as free platform usage.

## 4. Anonymous attribution and measurement

### Data flow

- `SiteVisitTracker` stores a daily browser session token and bounded UTM labels in session storage.
- `trackToolEvent` reuses the same daily session token.
- Both visit and tool-event endpoints hash the token with the Beijing date and public host using SHA-256. Raw tokens are not stored.
- `tool_events.metadata` stores only validated `utm_source`, `utm_campaign` and `utm_content` labels alongside existing numeric event metadata.
- The administrator-only growth report joins `site_page_views.session_hash` to `tool_events.session_id` and aggregates channel-to-tool completion.

### Event semantics

- `tool_open`: a tool surface opened.
- `process_started`: a processing task began.
- `process_completed`: the tool reported a completed task.
- `process_failed`: the tool reported a failed task.
- `export_clicked`: the user selected an export action.

The dashboard reports sessions and events, not unique people. A completed tool session is not a registration, paid ToolPass conversion, SASI order or revenue event. Paid checkout and marketplace revenue attribution remain a separate future integration and must not be inferred from this report.

### Privacy constraints

- Do not store IP addresses, account IDs, filenames, prompts, file contents, private URLs or raw session tokens in the growth report.
- Respect Do Not Track and Global Privacy Control.
- Keep analytics endpoints administrator-gated for aggregate reporting.
- Treat partner labels as self-declared attribution, not proof of website ownership.
- Never expose session hashes or session IDs in the UI.

## 5. GEO and machine-readable distribution

The discoveries route is included in:

- `GEO_PAGE_IDS` and localized page facts.
- The public sitemap and localized discovery routes.
- The dynamic `/llms.txt` route.
- The generated `/llms-full.txt` index.
- The generated `search-intent-index.json` data.

The machine-readable catalogue must be regenerated from `GLOBAL_TOOL_CATALOG` and the curated FAQ source. Do not copy stale tool counts or manually preserve retired tool slugs. Generic task questions are not private search-volume data.

The current discovery dossier separates documented facts, open questions and speculation. Primary sources include Yale Beinecke's Voynich Manuscript record, NASA's UAP study/FAQ and AARO's 2024 historical report. OCR is not described as a way to decipher an unknown script; an unidentified UAP is not presented as proof of extraterrestrial technology.

## 6. External launch and distribution playbook

### Product Hunt

Prepare a complete product page with a plain-language tagline, concise value statement, real screenshots/GIFs and a short demo. Participate in the community before launch, answer comments during and after launch, and ask for feedback rather than votes. Never buy votes or require upvotes.

Official guidance:
- https://help.producthunt.com/en/articles/17350772-launch-guide
- https://help.producthunt.com/en/articles/17734384-5-how-to-promote-your-launch-and-what-to-avoid

### Reddit and specialist communities

Lead with useful, original answers to a specific file or workflow problem. Respect each subreddit’s rules. Reddit’s own Reddiquette suggests a 9:1 balance as a rule of thumb: roughly nine helpful, non-self-promotional contributions for each self-promotional post. Do not mass-post identical links.

Official guidance:
- https://support.reddithelp.com/hc/en-us/articles/205926439-Reddiquette
- https://support.reddithelp.com/hc/en-us/articles/28012014962580-How-do-I-keep-spam-out-of-my-community

### Search quality

Publish a page only when it contains a real answer, a working tool path, source evidence or a useful workflow. Do not create large sets of near-duplicate translated pages or keyword-only pages. Localized pages must contain meaningful localized copy and correct canonical/hreflang behavior.

Official guidance:
- https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- https://developers.google.com/search/docs/essentials/spam-policies

### Other directories and developer channels

Prepare distinct listings and demos for AlternativeTo, SaaSHub, DevHunt, Uneed, Peerlist and Hacker News only after the production release, support links, screenshots, privacy explanation and public product details are verified. These are planned submissions, not completed placements.

Use the partner portal, JS Widget, WordPress package, read-only OpenAPI, RSS and QR surfaces as the repeatable distribution layer. Do not claim the Chrome extension or MCP integration is publicly launched while those surfaces remain prototype/disabled.

## 7. Release gates

Before production promotion on either domain:

1. CI passes the growth-distribution, growth-attribution, tool-usage, SEO and application build tests.
2. The nine localized discovery routes return 200; canonical and hreflang point to the intended host and locale.
3. `/discoveries`, `/sitemap.xml`, `/llms.txt`, `/llms-full.txt` and `/search-intent-index.json` contain the current architecture and no retired tool slug.
4. The homepage ToolPass rail aligns with the SEO content and footer at desktop, tablet and mobile widths, in both light and dark themes.
5. Anonymous tool events join the correct .com or .cn pageview session; DNT/GPC and private-route controls remain effective.
6. Payment, wallet, order, seller, license and automatic-delivery systems remain unchanged by the growth work.
7. Production is verified with public HTTP checks after deployment; a merged PR or successful build alone is not production acceptance.

## 8. Current implementation boundary

The code in the growth/cleanup branches is a candidate release. Until the corresponding PRs are reviewed, CI is green, changes are merged and both production domains are verified, do not describe the new discovery hub or attribution funnel as live in production.
