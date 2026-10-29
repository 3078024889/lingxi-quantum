# Offline moderation staging
This is a local command-line review-queue validator, not a public admin interface or an authorization system.
Run `node scripts/ai-discovery/review-queue.mjs input.json output.json` to validate pending/approved/rejected submissions and reviewer metadata. The output path must differ from input and must not already exist.
Do not commit contact details, private submissions, or review files to Git. This tool intentionally strips extra fields and contact information from its output.
An approved record here is an editorial decision, not proof of third-party pricing or product capability. Production moderation still requires verified identity, role-based authorization, an audit log, anti-spam, secure data storage and RLS tests.
