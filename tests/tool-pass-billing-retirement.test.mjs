import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
test("no new single tool price/quote/topup when unified backend is ready",()=>{
 for(const [path,code] of [
 ["app/api/tools/pricing/route.ts","SINGLE_TOOL_PRICING_RETIRED"],
 ["app/api/tools/quote/route.ts","SINGLE_TOOL_CHECKOUT_RETIRED"],
 ["app/api/tools/quote/topup/route.ts","SINGLE_TOOL_TOPUP_RETIRED"],
 ["app/api/tools/pay/create/route.ts","SINGLE_TOOL_CHECKOUT_RETIRED"]
 ]){
  const src=read(path);
  assert.ok(src.includes("toolPassCutoverRequested()"),path+": gate missing");
  assert.ok(src.includes(code),path+": 410 retirement missing");
 }
});
test("legacy grants and paid quote recovery must remain readable",()=>{
 assert.match(read("app/api/tools/quote/route.ts"),/export async function GET/);
 assert.match(read("app/api/tools/export/consume/route.ts"),/tool_export_grants/);
 assert.match(read("app/api/tools/pay/create/route.ts"),/quote\.status==="paid"/);
});
test("only one user-facing pass price, historical quote buttons hidden at activation",()=>{
 for(const path of ["components/tools/PaidActionButton.tsx","components/tools/PaidExportButton.tsx"]){
  const src=read(path);
  assert.match(src,/TOOL_PASS_ENFORCED/);
  assert.match(src,/ToolPassUpgradeLink/);
  assert.match(src,/legacyResume/);
 }
});
