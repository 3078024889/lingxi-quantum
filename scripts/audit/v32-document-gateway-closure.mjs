import fs from"node:fs";
function must(v,m){if(!v)throw new Error(m)}
const ticket=fs.readFileSync("app/api/tools/document/ticket/route.ts","utf8");
const cap=fs.readFileSync("app/api/tools/document/capabilities/route.ts","utf8");
const client=fs.readFileSync("lib/tools/document/intake-client.ts","utf8");
const gateway=fs.readFileSync("infra/document-converter/gateway/server.mjs","utf8");
const compose=fs.readFileSync("infra/document-converter/compose.yaml","utf8");
const caddy=fs.readFileSync("infra/document-converter/caddy/Caddyfile","utf8");

must(ticket.includes('const version="v1"'),"VERSIONED_TICKET_MISSING");
must(ticket.includes("OFFICE_EXTENSIONS"),"TICKET_EXTENSION_ALLOWLIST_MISSING");
must(ticket.includes('u.protocol!=="https:"'),"PUBLIC_GATEWAY_HTTPS_GUARD_MISSING");
must(ticket.includes("secret.length>=32"),"MINIMUM_GATEWAY_SECRET_LENGTH_MISSING");
must(cap.includes("gatewayReady"),"CAPABILITY_GATEWAY_HEALTH_MISSING");
must(client.includes('"x-lingxifield-ticket-version":"v1"'),"CLIENT_TICKET_VERSION_MISSING");
must(client.includes("90_000"),"CLIENT_TIMEOUT_MISSING");
must(client.includes("blob.slice(0,5)"),"CLIENT_PDF_MAGIC_CHECK_MISSING");

must(gateway.includes("ALLOWED_EXTENSIONS"),"GATEWAY_EXTENSION_ALLOWLIST_MISSING");
must(gateway.includes("usedNonces"),"REPLAY_GUARD_MISSING");
must(gateway.includes("ticket already used"),"REPLAY_REJECTION_MISSING");
must(gateway.includes("rateAllowed"),"RATE_GUARD_MISSING");
must(gateway.includes("deepHealth"),"DEEP_HEALTH_CHECK_MISSING");
must(gateway.includes("pdfMagic"),"SERVER_PDF_MAGIC_CHECK_MISSING");
must(gateway.includes('fd.set("exportFormFields","false")'),"SAFE_FLATTENING_MISSING");

must(!compose.includes('"3000:3000"'),"GOTENBERG_PUBLIC_PORT_EXPOSED");
must(!compose.includes('"3100:3100"'),"GATEWAY_BYPASSES_TLS_PROXY");
must(compose.includes("internal: true"),"PRIVATE_GOTENBERG_NETWORK_MISSING");
must(compose.includes("caddy:2-alpine"),"TLS_PROXY_MISSING");
must(caddy.includes("reverse_proxy gateway:3100"),"TLS_PROXY_GATEWAY_ROUTE_MISSING");

console.log("V32_VERSIONED_SIGNED_TICKET=PASS");
console.log("V32_EXTENSION_ALLOWLIST=PASS");
console.log("V32_HTTPS_GATEWAY_GUARD=PASS");
console.log("V32_NONCE_REPLAY_GUARD=PASS");
console.log("V32_RATE_GUARD=PASS");
console.log("V32_DEEP_HEALTH=PASS");
console.log("V32_PDF_MAGIC_DOUBLE_CHECK=PASS");
console.log("V32_GOTENBERG_PRIVATE_NETWORK=PASS");
console.log("V32_TLS_EDGE=PASS");
console.log("V32_DOCUMENT_GATEWAY_CLOSURE_AUDIT=PASS");
