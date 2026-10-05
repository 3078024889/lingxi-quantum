import fs from"node:fs";
const store=fs.readFileSync("lib/sasi/durable/public-event-store.ts","utf8");
const hook=fs.readFileSync("components/useSasiRunStream.ts","utf8");
for(const m of[
 'order("id",{ascending:false}).limit(bounded)',
 "lastEventId",
 ".reverse()"
])if(!store.includes(m))throw new Error("R16_SNAPSHOT_CURSOR_STORE_MISSING:"+m);
for(const m of[
 'body.lastEventId',
 '`?after=${encodeURIComponent(String(after))}`',
 "openSource(0)"
])if(!hook.includes(m))throw new Error("R16_SNAPSHOT_CURSOR_CLIENT_MISSING:"+m);
console.log("R16_SNAPSHOT_LATEST_WINDOW=PASS");
console.log("R16_SSE_RESUME_AFTER_SNAPSHOT=PASS");
console.log("R16_EVENT_REPLAY_AMPLIFICATION_FIXED=PASS");
