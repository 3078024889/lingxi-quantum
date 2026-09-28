import fs from "node:fs";
const required=["lib/sasi-v5/types.ts","lib/sasi-v5/quality.ts","lib/sasi-v5/economics.ts","lib/sasi-v5/router.ts","lib/sasi-v5/registry.ts","lib/sasi-v5/learning.ts","lib/sasi-v5/repository.ts","lib/sasi-v5/radar.ts","app/api/sasi/v5/readiness/route.ts","app/api/sasi/v5/feedback/route.ts","supabase/migrations/20260928170000_sasi_v5_quality_learning_foundation.sql"];
for(const f of required)if(!fs.existsSync(f))throw new Error(`SASI_V5_MISSING:${f}`);
const quality=fs.readFileSync("lib/sasi-v5/quality.ts","utf8");for(const n of["QUALITY_FLOOR","RELIABILITY_FLOOR","CONTINUITY_FLOOR"])if(!quality.includes(n))throw new Error(`SASI_V5_QUALITY_GUARD_MISSING:${n}`);
const router=fs.readFileSync("lib/sasi-v5/router.ts","utf8");if(router.indexOf("qualityGate")>router.indexOf("qualityAdjustedCostFen"))throw new Error("SASI_V5_ROUTER_MUST_GATE_QUALITY_BEFORE_COST");if(!router.includes("MARGIN_FLOOR"))throw new Error("SASI_V5_MARGIN_GUARD_MISSING");
const repo=fs.readFileSync("lib/sasi-v5/repository.ts","utf8");if(!repo.includes("SASI_V5_LEARNING_ENABLED"))throw new Error("SASI_V5_LEARNING_KILL_SWITCH_MISSING");
const migration=fs.readFileSync("supabase/migrations/20260928170000_sasi_v5_quality_learning_foundation.sql","utf8").toLowerCase();for(const n of["enable row level security","revoke all","service_role","sasi_v5_outcome_signals","sasi_v5_route_decisions"])if(!migration.includes(n.toLowerCase()))throw new Error(`SASI_V5_DB_GUARD_MISSING:${n}`);
console.log("SASI_V5_AUDIT=PASS");
