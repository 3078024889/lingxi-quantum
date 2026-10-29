# LINGXIFIELD Total Package G — nine-language global experience

Status: core localized labels, route helpers and SEO alternate metadata committed. Site-wide browser/RTL/multi-language QA not yet complete.

Target languages: zh, en, ja, ko, fr, de, es, pt, ar. Arabic is right-to-left. Chinese public route is /ai-market, others follow /{locale}/ai-market under primary canonical lingxifield.com; lingxifield.cn remains a mirror, not a duplicate indexed canonical destination.

Source modules: lib/ai-market/i18n-market.mjs, tests. Do not manufacture locale-specific product copy from untranslated catalog data. Missing official facts display a localized unverified message.

Acceptance requires actual rendered Next.js routes, localized SEO descriptions and canonical/hreflang in HTML, responsive layout and RTL navigation, keyboard/screen reader tests, server-rendered data states, privacy of admin pages, translation review and full application regression in test + 2GB memory target. The helper is not proof those pages already exist.

Test with: node --test lib/ai-market/i18n-market.test.mjs
