#!/usr/bin/env node
// LINGXIFIELD CN env audit. Never prints credentials. --strict blocks staging.
const fs = require("node:fs");
const { parseEnv } = require("node:util");
const strict = process.argv.includes("--strict");
const file = process.argv.slice(2).find(x => x.startsWith("/")) || "/etc/lingxifield/production.env";
if (!fs.existsSync(file)) { console.log("PRODUCTION_ENV_MISSING"); process.exit(2); }
let env;
try { env = parseEnv(fs.readFileSync(file, "utf8")); }
catch { console.log("PRODUCTION_ENV_PARSE_FAILED"); process.exit(3); }
const invalid = value => !String(value || "").trim() || String(value).trim() === "[SENSITIVE]";
const redacted = Object.entries(env).filter(([,value]) => String(value || "").trim() === "[SENSITIVE]").map(([key])=>key).sort();
const groups = {
 browserAuth: ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"],
 databaseAdmin: ["SUPABASE_SERVICE_ROLE_KEY"],
 privateR2: ["R2_ENDPOINT", "R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET_PRIVATE_BURN"],
 sasiControl: ["SASI_WORKER_SECRET", "SASI_QUOTE_SECRET"],
 docGateway: ["LINGXIFIELD_DOCUMENT_GATEWAY_PUBLIC_URL", "LINGXIFIELD_DOCUMENT_GATEWAY_SECRET"],
};
let missing = false;
for (const [group, keys] of Object.entries(groups)) {
  const bad = keys.filter(key => invalid(env[key]));
  if (bad.length) missing = true;
  console.log(group + ": " + (bad.length ? "UNAVAILABLE_OR_REDACTED " + bad.join(",") : "VALUES_PRESENT_UNVERIFIED"));
}
console.log("REDACTED_VALUE_COUNT=" + redacted.length);
if (redacted.length) console.log("REDACTED_KEYS=" + redacted.join(","));
if (env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_URL !== "https://sxsgdpqojepgbbrxrzlq.supabase.co") console.log("WARNING_SUPABASE_PROJECT_URL_DIFFERS");
if (env.NEXT_PUBLIC_SITE_URL && env.NEXT_PUBLIC_SITE_URL !== "https://lingxifield.cn") console.log("WARNING_SITE_URL_NOT_CN");
console.log("PAYMENT_AND_REFUND_FUNCTIONS_UNVERIFIED");
if (strict && (redacted.length || missing)) { console.log("STRICT_RUNTIME_CONFIG_BLOCKED"); process.exit(9); }
console.log("ENVIRONMENT_AUDIT_COMPLETE");
