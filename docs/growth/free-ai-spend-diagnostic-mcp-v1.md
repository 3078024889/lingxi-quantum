# Free SI/AI Spend Diagnostic + MCP distribution (2026-11-05)

Status: **experimental feature branch**; NOT production released, NOT submitted to ChatGPT or Chrome.

## Product contract
- Web route: `/siai/spend-diagnostic`. The calculation runs in the browser without upload, registration, cookies, or billing access from this feature.
- MCP route: `/api/public/siai-spend-mcp` supports JSON-RPC `initialize`, `ping`, `tools/list`, and `tools/call` over POST. This is a protocol pilot, **not certification of compatibility** with ChatGPT, plugin review or all MCP clients.
- One read-only tool: `diagnose_ai_spend`. It receives manually entered amounts, usage, future expected usage, optional user-supplied alternate price, and essential status. It does not collect credentials or cancel subscriptions.
- The web version does not automatically call the MCP route. Both versions share exactly one deterministic calculation function.
- The tool never claims verified external price, region, license, or feature equivalence. User-provided alternate prices are explicitly unverified.
- Estimated savings: full cost only if user explicitly expects zero future use AND the item is not essential; otherwise alternate price difference only where a candidate price was manually supplied. Annualization is x12 and labeled an estimate.
- Separate CNY/USD runs. No FX conversion or mixing.
- No vendor rankings or ungrounded model generated recommendations.
- Accessible share function copies only aggregate spend and savings, not product names or private user details.

## Costs
- Apps SDK and MCP are open source, but hosting, verification, traffic, reviews and future submission charges may not be free.
- Chrome Web Store developer registration requires a one-time fee. Do not submit to Chrome until user approves.
- ChatGPT marketplace/plugin visibility and approval are not guaranteed. Current official OpenAI policy permits/controls external checkout subject to restrictions. Avoid routing direct digital-service purchases through an unapproved flow.

## Security / capacity gates before public exposure
1. Verify MCP protocol headers and POST response with official MCP Inspector and ChatGPT custom app developer environment; adjust transport to current submission spec.
2. Add provider-side abuse protection, request caps and observable metrics without storing user subscriptions; use firewall limits. Never enable production public server until this is tested.
3. Review privacy policy and public terms; confirm no sensitive data logged by edge/CDN request capture.
4. Test 1, 3, 30 items; zero use; decimals; USD/CNY isolation; malformed JSON; >16KB payload; duplicate item; max amount; empty item; forged origin; replay; simultaneous requests.
5. Verify keyboard, mobile screen reader semantics, responsive layout, Lighthouse baseline, i18n if deployed globally.
6. Confirm SEO policy for beta: noindex until sample outputs, official evidence limitations and privacy validated.
7. Use one canonical trusted primary domain and a support contact; no invented badges/claims.
8. Full pnpm build, TypeScript, browser tests, security and release gate must pass before merge. Do not bypass current Vercel production gate.

## Local test
`node --experimental-strip-types --test tests/free-siai-spend-diagnostic.test.mjs`

## Next integrations
- Source-backed official pricing and region rules should be read-only from the *published curated SIAI directory*, not pending unverified records.
- A separate ChatGPT app/plugin package can call the same MCP tool after protocol and review tests.
- Only later consider Chrome extension when repeated visitor demand justifies its one-time fee and permission review.
