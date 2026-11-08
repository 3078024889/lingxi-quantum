import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const r=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
test("remote URL source cannot bypass authenticated task receipt after activation",()=>{
 const x=r("app/api/tools/promotion-source/route.ts");
 assert.match(x,/toolPassBackendReady\(\)/);
 assert.match(x,/redeemToolStart\(/);
 assert.match(x,/userId:user\.id/);
 assert.match(x,/result\.alreadyRedeemed/);
 assert.match(x,/TOOL_OPERATION_ALREADY_STARTED/);
 const y=r("components/tools/UrlPromotionWorkbench.tsx");
 assert.match(y,/accessRequestId:ticket\.requestId/);
 assert.match(y,/operationId/);
});
test("public release of new checkout requires unified backend readiness and commerce approval",()=>{
 const x=r("app/api/tools/pass/route.ts");
 const server=r("lib/tools/commerce/tool-server-receipt.ts");
 assert.match(x,/toolPassBackendReady\(\)/);
 assert.match(x,/TOOL_PASS_COMMERCE_READY/);
 assert.match(server,/NEXT_PUBLIC_TOOL_PASS_ENFORCED/);
 assert.match(server,/TOOL_PASS_BACKEND_READY/);
 assert.match(server,/LINGXIFIELD_PRIVACY_HASH_SECRET/);
});
