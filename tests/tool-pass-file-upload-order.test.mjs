import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
test("file tool access is claimed BEFORE any paid document normalization",()=>{
 const s=readFileSync(new URL("../components/tools/FileDropzone.tsx",import.meta.url),"utf8");
 const apply=s.slice(s.indexOf("const apply=useCallback("),s.indexOf("const promptKey"));
 const claim=apply.indexOf("await claimToolStart(toolSlug,newUnits)");
 const normalize=apply.indexOf("normalizeDocumentFiles([file])");
 assert.ok(claim>0&&normalize>claim,"Office conversion must never precede account/IP authorization");
 assert.ok(apply.indexOf("pendingRef.current=true")<claim,"Concurrent import must be serialized before authorization");
 assert.ok(apply.indexOf("distinct.length>maxFiles")<claim,"Overflowing batches must be rejected without charging");
 assert.ok(apply.indexOf("finally{")>claim,"Rejected or failed work must release the pending lock");
});
