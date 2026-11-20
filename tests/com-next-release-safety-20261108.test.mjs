import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
const read=p=>fs.readFileSync(new URL("../"+p,import.meta.url),"utf8");
test("next Cloudflare candidate is never an existing production script",()=>{
 const canary=read(".github/workflows/com-sasi-next-isolated-canary-20261108.yml");
 assert.match(canary,/CANDIDATE_NAME: lingxifield-com-next-20261108/);
 assert.doesNotMatch(canary,/CANDIDATE_NAME: lingxifield-com-main-20261108/);
 assert.match(canary,/COM_NEXT_CANARY_UNROUTED_VERIFIED/);
 assert.match(canary,/jq -e --arg name/);
 assert.match(canary,/delete j\.route;delete j\.routes/);
 assert.match(canary,/TOOL_PASS_COMMERCE_READY:'false'/);
 assert.match(canary,/SASI_MARKET_SALES_ENABLED:'false'/);
 assert.match(canary,/WECHAT_ENABLED:'false'/);
 assert.match(canary,/PAYPAL_ENABLED:'false'/);
 assert.match(canary,/ALIPAY_ENABLED:'false'/);
});
test("only source-licensed Copernicus is accepted in static catalog",()=>{
 const source=read("scripts/cloudflare/patch-critical-static-html-20261108.mjs");
 assert.match(source,/JSON\.stringify\(\["sasi-copernicus-si95-source"\]\)/);
 assert.doesNotMatch(source,/sasi-copernicus-si95-mt5/);
 assert.match(source,/"\/tools\/pass":"tools-pass\.html"/);
 const canary=read(".github/workflows/com-sasi-next-isolated-canary-20261108.yml");
 assert.match(canary,/tools\/pass:tools-pass/);
 for(const name of ["ico-to-png","number-base-converter","video-watermark-remover"])
  assert.ok(canary.includes("tools/"+name+":"),"missing unstable tool "+name);
});
test("apex cutover cannot happen without pinned successful isolated canary and rollback",()=>{
 const script=read("scripts/cloudflare/com-next-apex-verified-cutover-20261108.mjs");
 assert.match(script,/const prev="lingxifield-com-main-20261108"/);
 assert.match(script,/const next="lingxifield-com-next-20261108"/);
 assert.match(script,/const wwwPrev="lingxifield-com-static-gateway-canary-20261107"/);
 assert.match(script,/EXACT_COM_CANARY_CI_NOT_SUCCESS/);
 assert.match(script,/run\.head_sha!==expectedSha/);
 assert.match(script,/run\.head_branch!==/);
 assert.match(script,/PRODUCTION_APEX_WILDCARD_NOT_EXPECTED/);
 assert.match(script,/COM_ROUTE_ROLLBACK_CONFIRMED/);
 assert.match(script,/x-lingxi-render-mode/);
 assert.match(script,/tools\/pass/);
});
