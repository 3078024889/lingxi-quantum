import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(p,"utf8");
const sql=read("docs/operations/tool-pass-direct-payment-fulfillment-20261108.sql");
for(const [sku,fen,days] of [["tool_pass_7d",2900,7],["tool_pass_30d",9900,30],["tool_pass_90d",26900,90],["tool_pass_365d",89900,365]]){
 assert.match(sql,new RegExp("WHEN '"+sku+"' THEN v_days:="+days+";v_price_minor:="+fen));
}
assert.match(sql,/FOR UPDATE/);
assert.match(sql,/pg_advisory_xact_lock/);
assert.match(sql,/ORDER_PRICE_MISMATCH/);
assert.match(sql,/PROVIDER_CURRENCY_MISMATCH/);
assert.match(sql,/IDEMPOTENCY_CONFLICT/);
assert.match(sql,/REVOKE ALL ON FUNCTION public\.lingxi_fulfill_paid_tool_pass\(uuid\) FROM PUBLIC,anon,authenticated/);
assert.match(sql,/GRANT EXECUTE ON FUNCTION public\.lingxi_fulfill_paid_tool_pass\(uuid\) TO service_role/);
assert.doesNotMatch(sql,/DROP TABLE|DELETE FROM public\.orders|TRUNCATE/i);
const plans=read("lib/plans.ts");
assert.match(plans,/toolPassProducts:Product\[\]=ALL_TOOLS_PASS_CATALOG/);
assert.match(plans,/\.\.\.softwareProducts,\.\.\.toolPassProducts/);
const paid=read("lib/fulfill-order.ts");
assert.match(paid,/allToolsPassOffer\(productId\)/);
assert.match(paid,/if\(!verifiedPayment\)return/);
assert.match(paid,/lingxi_fulfill_paid_tool_pass/);
for(const path of [
 "app/api/pay/wechat/notify/route.ts",
 "app/api/pay/wechat/query/route.ts",
 "app/api/pay/alipay/notify/route.ts",
 "app/api/pay/paypal/webhook/route.ts",
 "app/api/pay/paypal/return/route.ts"
])assert.match(read(path),/fulfillPaidOrder\((?:order\.id|orderId),true\)/);
const paypal=read("app/api/pay/create/route.ts");
assert.match(paypal,/const isDirectPass=passProduct\?\.group==="toolpass"/);
assert.match(paypal,/product_type:isDirectPass\?"subscription":"permanent"/);
const ui=read("app/tools/pass/page.tsx");
assert.match(ui,/\/checkout\?productId=/);
assert.match(ui,/payUsdDirect/);
assert.match(ui,/\/api\/pay\/create/);
assert.match(ui,/void buy\(o\.sku\)/);
console.log("DIRECT_TOOLPASS_CNY_USD_VERIFIED_FULFILLMENT_AND_IDEMPOTENCY_CONTRACT_PASS");
