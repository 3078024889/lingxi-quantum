# V9 GEO implementation notes

Implemented:
- Product-first homepage with crawlable explanatory copy.
- Clear entity names: 灵犀场 / LINGXIFIELD / 实用工具中心 / 书本 SASI.
- SoftwareApplication / WebApplication JSON-LD on core product pages.
- `/llms.txt` as an optional machine-readable directory.
- `rel="describedby"` pointing to `/llms.txt`.
- Search/AI crawlers remain allowed in robots.txt; private API/account/admin paths remain blocked.
- Sitemap expanded to the real tool and knowledge pages.
- External Google Fonts removed from the root layout; UI now uses a stable local/system font stack.

Important:
- Google Search stated in 2026 that llms.txt is not required and does not itself improve Google ranking. It is maintained here for systems that choose to use it.
- GEO is treated as normal technical/content quality work: clear entities, crawlable pages, accurate structured data, evidence, freshness and canonical URLs. No hidden text or crawler-only content.
- Bing Webmaster Tools now exposes AI citations and grounding queries. Use those measurements after deployment rather than guessing which pages AI systems cite.
