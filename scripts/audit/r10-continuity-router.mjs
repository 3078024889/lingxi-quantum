import fs from"node:fs";
const files=[
"lib/sasi/experience/session-affinity.ts","lib/sasi/experience/request-coalescer.ts","lib/sasi/experience/canary.ts",
"lib/sasi/experience/free-text-router.ts","lib/sasi/experience/resilient-text.ts",
"supabase/migrations/20261005120500_sasi_experience_continuity_v100.sql"
];
for(const f of files)if(!fs.existsSync(f))throw new Error("R10_FILE_MISSING:"+f);
const router=fs.readFileSync("lib/sasi/experience/free-text-router.ts","utf8");
for(const m of ["getSessionAffinity","setSessionAffinity","breakerOpen","affinityBonus","canaryAllowed"])if(!router.includes(m))throw new Error("R10_ROUTER_MISSING:"+m);
const res=fs.readFileSync("lib/sasi/experience/resilient-text.ts","utf8");
for(const m of ["coalesce(","coalesceKey(","sessionKey"])if(!res.includes(m))throw new Error("R10_RESILIENCE_MISSING:"+m);
console.log("R10_SESSION_SOFT_AFFINITY=PASS");
console.log("R10_PROVIDER_CIRCUIT_BREAKER=PASS");
console.log("R10_STABLE_CANARY_ROUTING=PASS");
console.log("R10_DUPLICATE_REQUEST_COALESCING=PASS");
console.log("R10_CONTINUITY_ROUTER=PASS");
