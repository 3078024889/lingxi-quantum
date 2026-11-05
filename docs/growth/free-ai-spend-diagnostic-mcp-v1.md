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

## V1.1 visual and internationalization update
- The SIAI ranking hero now places a compact mint-and-white diagnosis strip after the catalogue quick actions and before filters, matching the requested screenshot red rectangle.
- The visible entry and diagnosis form use the existing `useLingxiLang` language state and nine native copy sets: zh, en, ja, ko, fr, de, es, pt, ar.
- Language routes: Chinese `/siai/spend-diagnostic`; other eight `/{locale}/siai/spend-diagnostic`. No hard-coded language selector needed. Chinese on lingxifield.cn is accessible; canonical remains lingxifield.com for the diagnostic until regional SEO review explicitly approves a regional distinct canonical.
- The form shows only three required fields (name, monthly fee, previous monthly use), with future demand and alternative price hidden under optional detail controls. A sample fills the form and demonstrates outcome without accounts.
- Results show total monthly expenditure, potential monthly/annual savings, per-tool rationale, and direct navigation to the existing SIAI directory. Advice and headings are localized.
- Full cancellation savings are only estimated if the user explicitly says they expect zero use next month. Zero historical usage alone is insufficient.
- No proprietary code from comparator sites was copied. Alignment is based on public SDK, Next.js documentation and established accessibility patterns.
- Production stays `noindex` and unpromoted until end-to-end and privacy tests pass. No automatic provider recommendations or refund promises.
- Current MCP implementation is an experimental JSON-RPC tool endpoint, **not yet fully verified as MCP 2026 SDK-compatible**. Official TypeScript SDK v2 has become stable; use it as the reference when performing the next protocol conformance upgrade: https://github.com/modelcontextprotocol/typescript-sdk .
- Pricing computations are not connected to the live 62 curated provider facts yet. End-user prices are manually entered.
- Tests added: `tests/free-siai-spend-diagnostic.test.mjs` and `tests/free-siai-spend-diagnostic-i18n.test.mjs`. They are committed, not yet proven green through CI.

## V1.2 Official MCP SDK v2 compatibility lab

Source references and license-respecting adoption:
- https://github.com/modelcontextprotocol/typescript-sdk/blob/main/docs/serving/http.md
- https://github.com/modelcontextprotocol/typescript-sdk/blob/main/docs/clients/connect.md
- https://github.com/modelcontextprotocol/typescript-sdk/blob/main/docs/protocol-versions.md
- https://github.com/modelcontextprotocol/typescript-sdk/blob/main/examples/gateway/server.ts
- No copied third-party server source. The new integration adapts documented SDK APIs and reuses only our own `diagnoseAiSpend` function.

Isolated folder: `integrations/siai-spend-mcp-v2` (independent pinned npm package; no main pnpm lockfile change). The official SDK handler is `createMcpHandler`; the Node adapter uses `localhostHostValidation`, `localhostOriginValidation` and `toNodeHandler`. The test client validates both the 2026 modern and 2025 legacy protocol via `StreamableHTTPClientTransport`.

To reproduce **locally** with Node 22.19+:
```bash
cd integrations/siai-spend-mcp-v2
npm install --ignore-scripts --no-audit --no-fund
npm test
```

Optional local interactive Inspector (not a production endpoint):
```bash
ENABLE_LOCAL_SIAI_SPEND_MCP=true npm start
# In another terminal:
npx @modelcontextprotocol/inspector --cli --server-url http://127.0.0.1:4309/mcp --transport http --method tools/list
```

The developer server **only** binds to 127.0.0.1, is not mounted into Next.js, and is opt-in. The existing public-facing `/api/public/siai-spend-mcp` route stays **off** by default. Real external ChatGPT app integration is not complete; it additionally requires approved domain/identity configuration, hosted SDK integration, per-IP/account distributed rate limiting, privacy review, current review/commerce compliance and real client checks. Do not claim listing or public availability.

CI workflow: `.github/workflows/siai-spend-diagnostic-isolated.yml`. Official SDK v2 local protocol proof: GitHub Actions run 42130419870, 3/3 cases passed (modern, legacy, forbidden Origin/large body). Main isolated diagnostic check also passed. No Vercel deployment was triggered as part of this lab.

Privacy: no provider account access, no bank sync, no file upload, no storing subscription details. Amounts and capacity are manually entered; money values are separate by currency. Capacity comparison must use the **same unit of completed task counts** for expected monthly demand and plan capacity, not mix provider credit balances with task counts. Unknown vendor rules remain unknown.
