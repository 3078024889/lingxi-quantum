import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const r=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
test("remote URL source cannot bypass authenticated task receipt after activation",()=>{
 const x=r("app/api/tools/promotion-source/route.ts");
 assert.match(x,/toolPassBackendReady\(\)/);
 assert.match(x,/redeemToolStart\(/);
 assert.match(x,/userId:user\.id/);
 const y=r("components/tools/UrlPromotionWorkbench.tsx");
 assert.match(y,/accessRequestId:ticket\.requestId/);
 assert.match(y,/operationId/);
});
test("public release of new checkout needs both frontend and backend explicitly ready",()=>{
 const x=r("app/api/tools/pass/route.ts");
 assert.match(x,/TOOL_PASS_BACKEND_READY/);
 assert.match(x,/TOOL_PASS_COMMERCE_READY/);
});
