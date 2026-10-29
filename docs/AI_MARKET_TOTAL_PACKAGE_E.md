# Package E — evidence-first profiles and real user voices

State: SOURCE COMMITTED; NOT INTEGRATED OR ACCEPTED. Main production site unchanged.

An entity must be verified before a public profile can be composed. Each displayed claim has source name, official or registry/authorized license class, checked time, URL and review. Contradictory values for a field are suppressed, not averaged or guessed. Missing founded date, capital, limits or availability shows no verified claim.

External user voices are factual *topic summaries* (billing, ease of use, reliability, etc.) with individual traceable URLs, manual rights check, review and deduplication. Do not fabricate X/YouTube/App Store testimonials, convert public discussion into an invented satisfaction rating, or copy long protected comments. Only import using permitted APIs and terms; private user information must not be displayed.

Official YouTube API: https://developers.google.com/youtube/v3/docs/commentThreads/list
Official API implementation: https://developers.google.com/youtube/data/guides/implementation/comments

Files: lib/ai-market/profile-evidence.mjs and tests, supabase/migrations/20261029_ai_market_profiles_e.sql

Run: node --test lib/ai-market/profile-evidence.test.mjs

Remaining gates: connect official sources, rights checks, server-only authenticated claim review, staging SQL tests, paginated query API, actual verified profile pages, user feedback removal/correction process, nine-language rendering, and mobile/browser QA.
