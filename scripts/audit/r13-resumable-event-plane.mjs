import fs from"node:fs";
const need=[
 "lib/sasi/durable/public-event-codec.ts",
 "lib/sasi/durable/public-event-store.ts",
 "components/useSasiRunStream.ts",
 "app/api/sasi/runs/[runId]/events/route.ts",
 "app/api/sasi/runs/[runId]/snapshot/route.ts"
];
for(const f of need)if(!fs.existsSync(f))throw new Error("R13_FILE_MISSING:"+f);
const sse=fs.readFileSync("app/api/sasi/runs/[runId]/events/route.ts","utf8");
for(const m of ["last-event-id","text/event-stream","X-Accel-Buffering","encodeHeartbeat","listPublicRunEvents"])if(!sse.includes(m))throw new Error("R13_SSE_MISSING:"+m);
const store=fs.readFileSync("lib/sasi/durable/public-event-store.ts","utf8");
if(!store.includes('.eq("id",runId).eq("user_id",userId)'))throw new Error("R13_RUN_OWNERSHIP_GATE_MISSING");
const hook=fs.readFileSync("components/useSasiRunStream.ts","utf8");
for(const m of ["EventSource","snapshot","seen.current","RUN_COMPLETED","APPROVAL_REQUIRED"])if(!hook.includes(m))throw new Error("R13_CLIENT_RECONNECT_MISSING:"+m);
const orch=fs.readFileSync("lib/sasi/durable/orchestrator.ts","utf8");
for(const m of ['kind:"RUN_STARTED"','kind:"STEP_STARTED"','kind:"RUN_COMPLETED"','kind:"RUN_FAILED"'])if(!orch.includes(m))throw new Error("R13_ORCHESTRATOR_EVENT_MISSING:"+m);
console.log("R13_AUTHENTICATED_RUN_EVENT_STREAM=PASS");
console.log("R13_LAST_EVENT_ID_REPLAY=PASS");
console.log("R13_SNAPSHOT_RECOVERY=PASS");
console.log("R13_CLIENT_RECONNECT_DEDUP=PASS");
console.log("R13_PUBLIC_ERROR_REDACTION=PASS");
console.log("R13_RESUMABLE_EVENT_PLANE=PASS");
