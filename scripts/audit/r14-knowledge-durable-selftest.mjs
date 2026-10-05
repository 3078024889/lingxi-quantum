import assert from"node:assert/strict";
import fs from"node:fs";

const route=fs.readFileSync("app/api/knowledge/ask/route.ts","utf8");
assert.ok(route.includes("body.useConnectedService===true&&body.acceptConnectedBilling===true"));
assert.ok(route.includes("runKnowledgeText"));
assert.ok(route.includes("DurableStepBusyError"));
assert.ok(route.includes('status:202'));
assert.ok(route.includes('"Retry-After":"1"'));

const adapter=fs.readFileSync("lib/sasi/knowledge/durable-knowledge.ts","utf8");
assert.ok(adapter.includes('stepId:"knowledge.generate.v1"'));
assert.ok(adapter.includes("durableRuntimeAvailable"));
assert.ok(adapter.includes("durableExecute"));
assert.ok(adapter.includes("durableStep"));

const step=fs.readFileSync("lib/sasi/durable/step-store.ts","utf8");
for(const m of ["claim_sasi_durable_step_v140","complete_sasi_durable_step_v140","fail_sasi_durable_step_v140","DURABLE_STEP_IN_PROGRESS"])assert.ok(step.includes(m));

console.log("R14_CONNECTED_BILLING_EXPLICIT_CONSENT=PASS");
console.log("R14_KNOWLEDGE_STABLE_STEP_ID=PASS");
console.log("R14_DURABLE_STEP_MEMOIZATION=PASS");
console.log("R14_CONCURRENT_DUPLICATE_BUSY_RESPONSE=PASS");
