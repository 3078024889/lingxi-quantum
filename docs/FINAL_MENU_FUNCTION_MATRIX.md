# AI market implementation matrix — 2026-10-28

This is an implementation audit, not a production completion declaration. Baseline: PR #39 at dc789053264ae9a13f94b3984d07150c43575c30.
The user's latest instruction chooses a friendly searchable market table, progressively disclosed detail, simple manual-renewal charges, and support/official-product help when search does not resolve a need.

| Surface | Route / implementation | Actual data and operations | Verification / gaps |
|---|---|---|---|
| Global AI market | /ai; terminal-workbench.tsx | Existing 41-entry editorial catalog; text search, category, name/company/category sort, column visibility, row expansion | PASS isolated component checks; NOT_IMPLEMENTED verified numeric rankings and natural-language constraint reasoning |
| Saved products | /ai | Versioned localStorage, validated known IDs; no account synchronization | PASS reload persistence; NOT_IMPLEMENTED cloud saves |
| Product comparison | /ai/compare?products=... | 2–5 unique known catalog products; legacy a/b URL support; source links | PASS pure selection tests; full Next route E2E not run |
| Product details | /ai/[slug] | Existing catalog descriptions and official URLs | Needs substantive verified plans, availability, change history |
| Rankings | /ai/rankings | Existing alphabetical market watchlist; independent evidence functions | No verified global ranking dataset published |
| Open-source observations | /ai/open-source | Existing GitHub observation/history modules retained | Freshness and online pipeline need verification |
| Model catalog | /ai/model-preview and /ai/market-preview | Existing opt-in OpenRouter preview, sorting, cost comparison/export | Disabled by default; public-use rights and production acceptance pending |
| Historical trends | price-sparkline.tsx + local snapshot scripts | Validation and local ingestion exist | NOT_IMPLEMENTED durable production dataset and public history connection |
| Help | /ai/help | Support tickets, official-product lookup, three existing public mail addresses | Source verified in app/about; delivery not tested |
| Support progress | /account/support; /api/support/tickets | Existing authenticated ticket system, attachments, mail notifications, signed inbound bridge | Reused without modifying backend; BLOCKED real account/mail round-trip verification |
| Reviews | Not connected to /ai | No new working review submission claimed | NOT_IMPLEMENTED product review/moderation UI flow |
| Vendor center | Four simple menus planned: products, promotion, performance, orders | Three free independent products, free annual confirmation | NOT_IMPLEMENTED integrated ownership, quota and portal flow |
| Commercial checkout | Existing payment integrations to be reused | CNY/USD separate local prices, manual renewal, no paid ranking | BLOCKED verified sandbox order/callback/refund flow for new vendor business |
| Nine languages | Existing /[locale]/ai scaffold | Existing translated interface preserved | New terminal not yet localized; full content and RTL acceptance pending |
| SEO/GEO | Existing metadata and SEO infrastructure | Root market canonical and CollectionPage; help metadata added | Sitemap integration, nine-language reciprocal links, verified content and production indexing pending |
| Operations | Existing internal artifact workflows | No new cloud operations activated | Durable storage, budgets, credentials, alert delivery and operational ownership pending |

## Information architecture authority

Keep existing valid routes. The 2026-10-28 user-provided master scope is authoritative for required capability coverage; old navigation order is not assumed final. Do not create empty routes for every requested menu merely to claim coverage.
Use the latest simple commercial V2 as initial public scope: three paid services (extra product, brand display, fixed-time sponsorship) and free three-product management. CPC/CPL/CPS and autonomous negotiations remain later capabilities, not enabled charges.
No fabricated metrics, review scores, traffic, availability, price history or mail-delivery claims.
