# AI Discovery V1
Isolated route: /ai; detail: /ai/[slug]. Next.js App Router + existing Supabase.
Initial catalog is a curated static seed, NOT an automatically verified feed.
Database migration is additive and must be applied using the existing Supabase deployment workflow after review.
GEO observations require real provider responses, reproducible prompt sets, timestamps and attribution. Never invent ranking or traffic.
SEO: canonical metadata, server-rendered content, JSON-LD CollectionPage, individual tool metadata.
Local: npm ci && npm run build && npm run dev; open http://localhost:3000/ai.
Deployment: preview branch on Vercel, run build and smoke tests, review migration, merge PR only after approval.
Safety: do not modify existing routes, payments, auth, existing migrations, or sitewide metadata.
Next: authenticated ingestion with human approval; provider API adapters; deduplication; scoring with confidence intervals; scheduled monitoring; paid placement clearly labeled.
