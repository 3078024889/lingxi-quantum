# R38 PDF signature and release stability findings

- Source gate log 38002396906 failed at scripts/audit/v57-task-workspace-truth.mjs because a literal escaped newline was written as JavaScript code between checks. Replaced it with an actual newline.
- Signature upload already uses prepareSignatureOrStamp(file,"signature") and extractHandwritingPixels for locally extracted alpha PNG, not merely a white background removal toggle. It needs real sample quality validation for shadows, thin strokes, colored ink, and difficult paper.
- Added per-image rotation with matching on-page CSS rotation and pdf-lib export rotation. This changes the saved file—not just the preview. It is not a validated browser E2E PASS until CI executes.
- Public tool cardinality must remain dynamic. Never delete historical evidence, tool slugs, SEO pages or public routes merely because their records mention 118. Retire only dead constants/copy and safely verified unreferenced paths.
- Vercel platform access returns HTTP 403 for the celestial9 deployment scope from this connection; do not assert production deployment.
- Real-world references: PDF.js, pdf-lib, Sejda Sign PDF, PDF24, Tesseract.js, IOPaint. Source patterns studied, no wholesale unlicensed code transplanted.
- Required follow-up: full source gate, clean build, desktop/mobile browser tests, signature image fixtures and reopenable downloaded PDF before PR merge and production release.
