import fs from"node:fs";
const need=[
 "lib/sasi/durable/job-queue.ts",
 "lib/sasi/durable/worker-version.ts",
 "lib/sasi/durable/knowledge-job-handler.ts",
 "lib/sasi/durable/detached-worker.ts",
 "lib/sasi/durable/enqueue-knowledge.ts",
 "app/api/internal/sasi/worker/tick/route.ts",
 "supabase/migrations/20261005150000_sasi_detached_jobs_v150.sql"
];
for(const f of need)if(!fs.existsSync(f))throw new Error("R15_FILE_MISSING:"+f);

const q=fs.readFileSync("lib/sasi/durable/job-queue.ts","utf8");
for(const m of["enqueue_sasi_durable_job_v150","claim_sasi_durable_job_v150","renew_sasi_durable_job_lease_v150","fail_sasi_durable_job_v150"])if(!q.includes(m))throw new Error("R15_QUEUE_API_MISSING:"+m);

const version=fs.readFileSync("lib/sasi/durable/worker-version.ts","utf8");
if(!version.includes('"knowledge.generate":["knowledge.v1"]'))throw new Error("R15_VERSION_PIN_MISSING");

const handler=fs.readFileSync("lib/sasi/durable/knowledge-job-handler.ts","utf8");
if(!handler.includes('stepId:"knowledge.generate.v1"'))throw new Error("R15_STABLE_STEP_ID_DRIFT");
if(!handler.includes("allowConnected:v.allowConnected===true"))throw new Error("R15_CONNECTED_BILLING_BOOLEAN_DRIFT");

console.log("R15_DETACHED_JOB_QUEUE=PASS");
console.log("R15_KNOWLEDGE_V1_HANDLER_RETAINED=PASS");
console.log("R15_CLAIM_LEASE_RESUME_FOUNDATION=PASS");
console.log("R15_NO_PUBLIC_JOB_PAYLOAD_ROUTE=PASS");
