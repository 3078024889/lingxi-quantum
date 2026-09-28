import fs from "node:fs";

const required=[
"lib/sasi-v5/project-dna.ts","lib/sasi-v5/project-dna-repository.ts",
"lib/sasi-v5/visual/technical.ts","lib/sasi-v5/visual/semantic-judge.ts","lib/sasi-v5/visual/validate.ts",
"lib/sasi-v5/visual-repository.ts","lib/sasi-v5/agent-radar-runtime.ts","lib/sasi-v5/experiments.ts",
"lib/sasi-v5/operator-metrics.ts","app/api/sasi/v5/projects/[id]/dna/route.ts",
"app/api/sasi/v5/projects/[id]/assets/route.ts","app/api/cron/sasi-v5-radar/route.ts",
"app/api/sasi/operator/v5/route.ts","app/sasi/operator/v5/page.tsx","app/sasi/project-dna/page.tsx",
"components/SasiProjectDNAEditor.tsx","components/SasiManagedVideoCreate.tsx",
"app/api/sasi/quote/route.ts","app/api/sasi/jobs/route.ts","app/api/sasi/jobs/[id]/delivery/route.ts",
"app/sasi/drama/page.tsx","app/api/sasi/v5/readiness/route.ts",
"supabase/migrations/20260928193000_sasi_v51_completion.sql","vercel.json"
];
for(const f of required)if(!fs.existsSync(f))throw new Error(`SASI_V51_MISSING:${f}`);

const semantic=fs.readFileSync("lib/sasi-v5/visual/validate.ts","utf8");
if(!semantic.includes("PREMIUM_SEMANTIC_JUDGE_UNAVAILABLE"))throw new Error("PREMIUM_VISUAL_MUST_FAIL_CLOSED");
if(!semantic.includes("sampleVideoFrames"))throw new Error("VIDEO_TEMPORAL_SAMPLE_MISSING");

const quote=fs.readFileSync("app/api/sasi/quote/route.ts","utf8");
for(const n of["sasiPaidProductionEnabled","selectSasiVideoProvider","quoteVideoTask","signSasiTaskQuote"])if(!quote.includes(n))throw new Error(`OUTCOME_QUOTE_GUARD_MISSING:${n}`);

const jobs=fs.readFileSync("app/api/sasi/jobs/route.ts","utf8");
for(const n of["verifySasiTaskQuote","create_and_reserve_sasi_job","dispatchSasiJob"])if(!jobs.includes(n))throw new Error(`MANAGED_JOB_GUARD_MISSING:${n}`);

const radar=fs.readFileSync("app/api/cron/sasi-v5-radar/route.ts","utf8");
if(!radar.includes("CRON_SECRET")||!radar.includes("runAgentRadar"))throw new Error("AGENT_RADAR_GUARD_MISSING");

const exp=fs.readFileSync("lib/sasi-v5/experiments.ts","utf8");
if(!exp.includes("user-opt-in")||!exp.includes("public-benchmark"))throw new Error("SHADOW_PRIVACY_GUARD_MISSING");

const vercel=JSON.parse(fs.readFileSync("vercel.json","utf8"));
if(!vercel.crons?.some(x=>x.path==="/api/cron/sasi-v5-radar"))throw new Error("RADAR_CRON_MISSING");

const migration=fs.readFileSync("supabase/migrations/20260928193000_sasi_v51_completion.sql","utf8").toLowerCase();
for(const n of["sasi_v5_project_dna","sasi_v5_approved_assets","sasi_v5_visual_validations","sasi_v5_experiments","enable row level security","revoke all"])if(!migration.includes(n))throw new Error(`DB_COMPLETION_MISSING:${n}`);

console.log("SASI_V51_AUDIT=PASS");
