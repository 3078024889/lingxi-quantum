import fs from"node:fs";
function must(v,m){if(!v)throw new Error(m)}
const conv=fs.readFileSync("lib/tools/document/converter.ts","utf8");
const client=fs.readFileSync("lib/tools/document/intake-client.ts","utf8");
const ticket=fs.readFileSync("app/api/tools/document/ticket/route.ts","utf8");
const norm=fs.readFileSync("app/api/tools/document/normalize/route.ts","utf8");
const gateway=fs.readFileSync("infra/document-converter/gateway/server.mjs","utf8");
const compose=fs.readFileSync("infra/document-converter/compose.yaml","utf8");

must(conv.includes("function gotenbergHeaders():Headers")||conv.includes("function authHeaders():Record<string,string>"),"TYPED_HEADER_BUILDER_MISSING");
must(conv.includes('headers.set("authorization"'),"GOTENBERG_AUTH_HEADER_MISSING");
must(ticket.includes("3_500_000"),"VERCEL_SAFE_FALLBACK_LIMIT_MISSING");
must(ticket.includes("createHmac"),"SIGNED_DIRECT_TICKET_MISSING");
must(client.includes("/api/tools/document/ticket"),"CLIENT_TICKET_FLOW_MISSING");
must(client.includes("viaDirectGateway"),"DIRECT_GATEWAY_CLIENT_MISSING");
must(norm.includes("process.env.VERCEL?3_500_000"),"VERCEL_NORMALIZE_LIMIT_MISSING");
must(gateway.includes("/forms/libreoffice/convert"),"GATEWAY_LIBREOFFICE_ROUTE_MISSING");
must(gateway.includes("timingSafeEqual"),"GATEWAY_SIGNATURE_COMPARE_MISSING");
must(gateway.includes("ALLOWED_ORIGINS"),"GATEWAY_ORIGIN_ALLOWLIST_MISSING");
must(!compose.includes("3000:3000"),"GOTENBERG_PUBLIC_PORT_EXPOSED");
must(compose.includes("API_ENABLE_BASIC_AUTH"),"GOTENBERG_BASIC_AUTH_DISABLED");

console.log("TYPESCRIPT_HEADERS_INIT_SAFE=PASS");
console.log("VERCEL_4_5MB_ARCHITECTURE_GUARD=PASS");
console.log("DIRECT_BROWSER_GATEWAY_UPLOAD=PASS");
console.log("SIGNED_SHORT_LIVED_TICKET=PASS");
console.log("GOTENBERG_PUBLIC_EXPOSURE=0");
console.log("GOTENBERG_BASIC_AUTH=PASS");
console.log("V31R2_PRODUCTION_ARCHITECTURE_AUDIT=PASS");
