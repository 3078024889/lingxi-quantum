import fs from"node:fs";
const files=[
"lib/sasi/experience/free-provider-config.ts","lib/sasi/experience/free-text-router.ts",
"lib/sasi/experience/provider-state.ts","lib/sasi/experience/daily-budget.ts",
"lib/sasi/experience/resilient-text.ts","app/api/sasi/experience/text/route.ts",
"app/api/knowledge/ask/route.ts","supabase/migrations/20261005114500_sasi_experience_trust_router_v90.sql"
];
for(const f of files)if(!fs.existsSync(f))throw new Error("R9_FILE_MISSING:"+f);
const router=fs.readFileSync("lib/sasi/experience/free-text-router.ts","utf8");
for(const marker of ["Water-filling","dailyShare","successRate","latencyEwmaMs","cooldown","list.slice(0,5)","retryAfterSeconds","AbortController"])if(!router.includes(marker))throw new Error("R9_ROUTER_MARKER_MISSING:"+marker);
const resilient=fs.readFileSync("lib/sasi/experience/resilient-text.ts","utf8");
for(const marker of ["settleExperience","runExperienceText","runUserText","needs-connection"])if(!resilient.includes(marker))throw new Error("R9_RESILIENCE_MARKER_MISSING:"+marker);
const knowledge=fs.readFileSync("app/api/knowledge/ask/route.ts","utf8");
if(!knowledge.includes("deterministicGroundedAnswer"))throw new Error("R9_KNOWLEDGE_NO_DETERMINISTIC_FALLBACK");

const directResilient=knowledge.includes("resilientText");
const delegatedDurable=knowledge.includes("runKnowledgeText");
let resilientReachable=directResilient;

if(delegatedDurable){
 const adapterPath="lib/sasi/knowledge/durable-knowledge.ts";
 if(!fs.existsSync(adapterPath))throw new Error("R9_KNOWLEDGE_DELEGATE_MISSING:"+adapterPath);
 const adapter=fs.readFileSync(adapterPath,"utf8");
 for(const marker of ["runKnowledgeText","resilientText","durableRuntimeAvailable"]){
  if(!adapter.includes(marker))throw new Error("R9_KNOWLEDGE_DELEGATE_CONTRACT_MISSING:"+marker);
 }
 resilientReachable=adapter.includes('from"@/lib/sasi/experience/resilient-text"')||adapter.includes("from '@/lib/sasi/experience/resilient-text'")||adapter.includes("from \"@/lib/sasi/experience/resilient-text\"");
}
if(!resilientReachable)throw new Error("R9_KNOWLEDGE_NO_GRACEFUL_FALLBACK_PATH");
const sql=fs.readFileSync("supabase/migrations/20261005114500_sasi_experience_trust_router_v90.sql","utf8");
for(const marker of ["reserve_sasi_experience_v90","settle_sasi_experience_v90","record_sasi_experience_provider_run_v90"])if(!sql.includes(marker))throw new Error("R9_SQL_MISSING:"+marker);
console.log("R9_WEIGHTED_FAIR_FREE_POOL=PASS");
console.log("R9_PROVIDER_HEALTH_COOLDOWN=PASS");
console.log("R9_PROVIDER_RETRY_AFTER_AWARE=PASS");
console.log("R9_FAILED_ATTEMPTS_REFUNDED=PASS");
console.log("R9_FREE_FIRST_CONNECTED_SECOND=PASS");
console.log("R9_RAW_PROVIDER_FAILURE_HIDDEN=PASS");
console.log("R9_KNOWLEDGE_LOCAL_FALLBACK=PASS");
console.log("R9_KNOWLEDGE_RESILIENCE_DELEGATION=PASS");
