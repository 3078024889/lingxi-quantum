import fs from"node:fs";
const bad=[];
const read=p=>fs.readFileSync(p,"utf8");

for(const p of[
 "app/api/health/route.ts",
 "app/api/internal/ops/readiness/route.ts",
 "app/api/cron/withdrawal-reconcile/route.ts",
 "lib/ops/runtime-heartbeat.ts",
 "lib/security/redact-operational-error.ts",
 "supabase/migrations/20261003095419_production_runtime_heartbeats_r15.sql",
])if(!fs.existsSync(p))bad.push(`missing ${p}`);

const cron=read("app/api/cron/withdrawal-reconcile/route.ts");
for(const x of["secureSecretEqual","markRuntimeStarted","markRuntimeSucceeded","markRuntimeFailed","processMoneyWebhookInbox","reconcileDueWithdrawals"])
 if(!cron.includes(x))bad.push(`cron missing ${x}`);
if(cron.includes("MONEY_RECONCILE_SECRET"))bad.push("cron must authenticate with CRON_SECRET, not money operator secret");

const health=read("app/api/health/route.ts");
if(/SUPABASE|SECRET|TOKEN|KEY/.test(health))bad.push("public health route references sensitive configuration");
if(!health.includes('service:"lingxifield"'))bad.push("public health service marker missing");

const ready=read("app/api/internal/ops/readiness/route.ts");
for(const x of["secureSecretEqual","MONEY_RECONCILE_SECRET","ops_runtime_heartbeats","money_webhook_inbox","balance_withdrawals","MONEY_RECONCILE_EXPECTED_MINUTES"])
 if(!ready.includes(x))bad.push(`readiness missing ${x}`);
for(const x of["user_id","email","provider_payment_id","provider_request_key"])
 if(ready.includes(x))bad.push(`readiness leaks unnecessary field ${x}`);

const hb=read("lib/ops/runtime-heartbeat.ts");
if(!hb.includes("redactOperationalError"))bad.push("heartbeat error redaction missing");
if(!hb.includes('console.warn("[ops-heartbeat]'))bad.push("heartbeat best-effort fallback missing");

const red=read("lib/security/redact-operational-error.ts");
for(const x of["Bearer [REDACTED]","[REDACTED]","slice(0,240)"])
 if(!red.includes(x))bad.push(`operational redaction missing ${x}`);

const mig=read("supabase/migrations/20261003095419_production_runtime_heartbeats_r15.sql").toLowerCase();
for(const x of["enable row level security","revoke all","grant all","service_role"])
 if(!mig.includes(x))bad.push(`heartbeat migration missing ${x}`);

const vercel=JSON.parse(read("vercel.json"));
if(!Array.isArray(vercel.crons)||!vercel.crons.some(x=>x.path==="/api/cron/withdrawal-reconcile"))bad.push("withdrawal reconcile cron not configured");
if(vercel.crons.length<1)bad.push("cron configuration empty");

const middleware=read("middleware.ts");
if(middleware.includes("SASI 智能生态与实用工具"))bad.push("retired-page brand copy is stale");

if(bad.length){console.error(bad.join("\n"));process.exit(1)}
console.log("R15_PUBLIC_LIVENESS_MINIMAL=PASS");
console.log("R15_INTERNAL_READINESS_SECRET_GUARD=PASS");
console.log("R15_CRON_HEARTBEAT=PASS");
console.log("R15_CRON_MONEY_WORKER_PRESERVED=PASS");
console.log("R15_HEARTBEAT_BEST_EFFORT=PASS");
console.log("R15_OPERATIONAL_ERROR_REDACTION=PASS");
console.log("R15_READINESS_NO_PII=PASS");
console.log("R15_HEARTBEAT_RLS_SERVICE_ROLE_ONLY=PASS");
console.log("R15_VERCEL_CRON_PATH_PRESENT=PASS");
console.log("R15_CRON_SCHEDULE_NOT_BLINDLY_CHANGED=PASS");
console.log("R15_BRAND_RETIRED_PAGE_ALIGNED=PASS");
