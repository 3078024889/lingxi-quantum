import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

test("first-party source licenses are never granted without provider-verified payment",()=>{
 const src=readFileSync("lib/fulfill-order.ts","utf8");
 const softwareBlock=src.slice(src.indexOf("if(softwareOffer(productId))"));
 assert.match(softwareBlock,/if\(!verifiedPayment\)return \{ok:false,error:"PROVIDER_PAYMENT_VERIFICATION_REQUIRED"\}/);
 assert.match(softwareBlock,/admin\.rpc\("sasi_grant_software_delivery"/);
 assert.ok(softwareBlock.indexOf("if(!verifiedPayment)")<softwareBlock.indexOf('admin.rpc("sasi_grant_software_delivery"'),"source delivery must be gated before the grant RPC");
 for(const name of ["wechat","alipay"]){
  const source=readFileSync("app/api/pay/"+name+"/notify/route.ts","utf8");
  assert.match(source,/fulfillPaidOrder\([^,]+,true\)/);
 }
 for(const path of ["app/api/pay/paypal/webhook/route.ts","app/api/pay/paypal/return/route.ts"]){
  const source=readFileSync(path,"utf8");
  assert.match(source,/fulfillPaidOrder\([^,]+,true\)/);
 }
});
