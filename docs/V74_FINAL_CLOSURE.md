# V74 FINAL CLOSURE

Production closure after V64→V73R2.

Hard rules:
- lingxifield.com is the canonical SEO origin; lingxifield.cn remains a first-class access domain and emits a cross-domain canonical to .com.
- www variants 308 redirect to bare domains.
- Nine locales: zh, en, ja, ko, fr, de, es, pt, ar; every hreflang set includes itself and x-default.
- Practical-tool CNY and USD prices use identical numeric values.
- Browser-local low-cost growth tools remain free; watermark cleanup and professional result tools remain paid/freemium.
- pricing-policy.json is the numeric pricing source of truth. Public billing classification derives from tool-policy-data.ts rather than duplicating a second table.
- qpdf-run is pinned to 0.2.1; pdfstudio must not exist.
- Required release migrations: V67 unified pricing, V68 batch PDF, V69 free local video effects.
