import assert from"node:assert/strict";
import{encodeSse,normalizePublicKind,sanitizeEventData,toPublicRunEvent}from"./r13-event-codec-fixture.mjs";

assert.equal(normalizePublicKind("attempt.completed"),"STEP_FINISHED");
assert.equal(normalizePublicKind("checkpoint"),"STATE_SNAPSHOT");
assert.equal(normalizePublicKind("provider-secret"),null);

const safe=sanitizeEventData({
 label:"Build",state:"running",attempt:2,providerId:"SECRET",model:"SECRET",
 error:"stack",apiKey:"SECRET",text:"hello"
});
assert.deepEqual(safe,{label:"Build",state:"running",attempt:2,text:"hello"});

const event=toPublicRunEvent({
 id:17,run_id:"00000000-0000-0000-0000-000000000001",
 kind:"RUN_STARTED",step:null,metadata:{state:"running",providerId:"hidden"},created_at:"2026-10-05T00:00:00Z"
});
assert.ok(event);
const wire=encodeSse(event);
assert.ok(wire.startsWith("id: 17\nevent: RUN_STARTED\ndata: "));
assert.ok(!wire.includes("providerId"));
assert.ok(!wire.includes("SECRET"));
console.log("R13_PUBLIC_EVENT_ALLOWLIST=PASS");
console.log("R13_PROVIDER_INTERNALS_HIDDEN=PASS");
console.log("R13_SSE_CURSOR_ENCODING=PASS");
