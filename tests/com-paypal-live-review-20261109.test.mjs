import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {publicMarketListings} from "../scripts/cloudflare/public-market-listings.mjs";
const read=path=>readFileSync(path,"utf8");
const env={NEXT_PUBLIC_SUPABASE_URL:"https://sxsgdpqojepgbbrxrzlq.supabase.co",NEXT_PUBLIC_SUPABASE_ANON_KEY:"public-test-key"};
const req=new Request("https://lingxifield.com/api/sasi/marketplace/listings");

test("PayPal Live checkout uses prior approved Orders v2 redirect and safe server fulfillment",()=>{
 const create=read("app/api/pay/create/route.ts");
 const lib=read("lib/paypal.ts");
 const callback=read("app/api/pay/paypal/return/route.ts");
 const webhook=read("app/api/pay/paypal/webhook/route.ts");
 const ui=read("app/tools/pass/page.tsx");
 assert.match(lib,/PAYPAL_ENV\?\.trim\(\)\.toLowerCase\(\)\s*!==\s*"sandbox"/);
 assert.match(lib,/PAYPAL_CLIENT_ID/);
 assert.match(lib,/PAYPAL_CLIENT_SECRET/);
 assert.match(lib,/PAYPAL_WEBHOOK_ID/);
 assert.match(create,/paypalPayEnabled\(\)/);
 assert.match(create,/isSameOriginMutation/);
 assert.match(create,/referenceId:order\.id/);
 assert.match(create,/returnUrl:\x60\$\{baseUrl\}\/api\/pay\/paypal\/return/);
 assert.match(create,/url:out\.approveUrl/);
 assert.match(lib,/\/v2\/checkout\/orders/);
 assert.match(lib,/PayPal-Request-Id/);
 assert.match(lib,/verifyMoney\(capture\.amount, expectedAmountUsd\)/);
 assert.match(lib,/verifyReference\(unit, expectedReferenceId\)/);
 assert.match(callback,/verifyPaypalCompletedOrder/);
 assert.match(callback,/fulfillPaidOrder/);
 assert.match(webhook,/verifyPaypalWebhook\(req\.headers,raw\)/);
 assert.match(webhook,/await verifyPaypalCompletedOrder/);
 assert.match(ui,/PAYPAL_ORDER_UNAVAILABLE/);
 assert.match(ui,/UNSAFE_PAYPAL_URL/);
 assert.doesNotMatch(lib,/失败：\$\{JSON\.stringify\(data\)\}/);
});

test("public catalog signals useful safe diagnostics without returning failed fake empty success",async()=>{
 const denied=await publicMarketListings(req,env,async()=>new Response(JSON.stringify({message:"sensitive internal response"}),{status:403}));
 assert.equal(denied.status,503);
 assert.equal(denied.headers.get("x-lingxi-catalog-diagnostic"),"upstream-403");
 assert.doesNotMatch(await denied.text(),/sensitive internal response/);
 const empty=await publicMarketListings(req,env,async()=>Response.json([]));
 assert.equal(empty.status,200);
 assert.deepEqual((await empty.json()).items,[]);
 const config=await publicMarketListings(req,{...env,NEXT_PUBLIC_SUPABASE_ANON_KEY:""},async()=>{throw Error("should not fetch")});
 assert.equal(config.status,503);
 assert.equal(config.headers.get("x-lingxi-catalog-diagnostic"),"missing-public-configuration");
});

test("anonymous buyers can browse real products without draft/order access",async()=>{
 const privateRequest=new Request("https://lingxifield.com/api/sasi/marketplace/listings?mode=mine");
 assert.equal(await publicMarketListings(privateRequest,env,async()=>{throw Error("unsafe fetch")}),null);
 const failed=await publicMarketListings(req,env,async()=>Response.json([{status:"draft",scan_status:"clean"}]));
 assert.equal(failed.status,503);
 const frontend=read("components/SasiOpenMarketplace.tsx");
 assert.match(frontend,/hero-original\.webp/);
 assert.match(frontend,/5,000/);
 assert.match(frontend,/maxLength=\{5000\}/);
});
