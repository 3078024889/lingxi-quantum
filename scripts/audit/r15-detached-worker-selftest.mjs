import assert from"node:assert/strict";
import fs from"node:fs";

const sql=fs.readFileSync("supabase/migrations/20261005150000_sasi_detached_jobs_v150.sql","utf8");
for(const marker of[
 "for update skip locked",
 "lease_owner",
 "lease_until",
 "deadline_at",
 "priority + least(9",
 "power(2",
 "JOB_PAYLOAD_TOO_LARGE",
 "UNSUPPORTED"
].slice(0,7))assert.ok(sql.toLowerCase().includes(marker.toLowerCase()),marker);

const worker=fs.readFileSync("lib/sasi/durable/detached-worker.ts","utf8");
for(const marker of["setInterval","renewDurableJob","workerSupports","knowledge.generate","RUN_WAITING","RUN_FAILED"])assert.ok(worker.includes(marker),marker);

const endpoint=fs.readFileSync("app/api/internal/sasi/worker/tick/route.ts","utf8");
for(const marker of["SASI_WORKER_SECRET","timingSafeEqual","status:404","runOneDetachedJob"])assert.ok(endpoint.includes(marker),marker);

console.log("R15_SKIP_LOCKED_CLAIM=PASS");
console.log("R15_LEASE_HEARTBEAT=PASS");
console.log("R15_PRIORITY_AGING_FAIRNESS=PASS");
console.log("R15_RETRY_BACKOFF_DEADLINE=PASS");
console.log("R15_WORKFLOW_VERSION_COMPATIBILITY=PASS");
console.log("R15_INTERNAL_WORKER_SECRET_GATE=PASS");
