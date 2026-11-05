import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
test("new single-tool quotes blocked only after backend gate",()=>{
 const x=read("app/api/tools/quote/route.ts");
 assert.match(x,/toolPassBackendReady\(\)/);
 assert.match(x,/SINGLE_TOOL_CHECKOUT_RETIRED/);
 assert.match(x,/toolId\.startsWith\("sasi-"\)/);
});
test("old already-paid fulfillment preserved without initializing new single-tool charges",()=>{
 const x=read("app/api/tools/pay/create/route.ts");
 assert.match(x,/quote\.status==="paid"/);
 assert.match(x,/SINGLE_TOOL_CHECKOUT_RETIRED/);
});
test("legacy export reservations are not newly issued after unified launch",()=>{
 const x=read("app/api/tools/free-export/route.ts");
 assert.match(x,/toolPassBackendReady\(\)/);
 assert.match(x,/tool_export_requests/);
});
test("export does not prompt second per-file payment once start already authorized",()=>{
 const x=read("lib/tools/commerce/export-access-client.ts");
 assert.match(x,/TOOL_PASS_ENFORCED/);
});
