import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=path=>readFileSync(path,"utf8");

test("public pay/provider status uses constant-cost Cloudflare edge, never caches or leaks credentials",()=>{
 const s=read("scripts/cloudflare/patch-critical-static-html-20261108.mjs");
 for(const part of ["/api/pay/providers","edge-merchant-readiness","no-store, max-age=0",
  "WECHAT_PLATFORM_PUBLIC_KEY","WECHAT_PLATFORM_PUBLIC_KEY_ID",
  "PAYPAL_CLIENT_SECRET","PAYPAL_WEBHOOK_ID","ALIPAY_PRIVATE_KEY","ALIPAY_PUBLIC_KEY"])
   assert.ok(s.includes(part),part);
 assert.ok(s.indexOf('if(pathname===\\\"/api/pay/providers')!==-1 || s.includes('if(pathname===\\\"/api/pay/providers'));
 assert.ok(s.includes('configured.paypal&&env.PAYPAL_ENABLED===\\\"true\\\"'));
 assert.ok(s.includes('env.PAYPAL_ENV!==\\\"sandbox\\\"'));
 const edgeAt=s.indexOf("edge-merchant-readiness");
 const gatewayAt=s.indexOf("pathname.startsWith(");
 assert.ok(edgeAt>=0&&gatewayAt>edgeAt,"merchant status must be handled before legacy gateway forwarding");
});
test("scoped health endpoint is lightweight and never implies payment readiness",()=>{
 const s=read("scripts/cloudflare/patch-critical-static-html-20261108.mjs");
 assert.ok(s.includes('pathname===\\\"/api/health\\\"'));
 assert.ok(s.includes('x-lingxi-health-scope'));
 assert.ok(s.includes('scope:\\"edge-liveness\\"'));
 assert.ok(s.indexOf('x-lingxi-health-scope')<s.indexOf('edge-merchant-readiness'));
});
test("WeChat cannot accept payment without both merchant certificate and webhook verification key",()=>{
 const wechat=read("lib/wechatpay.ts");
 assert.match(wechat,/export function wechatPayEnabled/);
 assert.match(wechat,/PLATFORM_PUBLIC_KEY\?\.trim\(\) && PLATFORM_PUBLIC_KEY_ID\?\.trim\(\)/);
 const providers=read("app/api/pay/providers/route.ts");
 assert.ok(providers.includes("WECHAT_PLATFORM_PUBLIC_KEY"));
 assert.ok(providers.includes("WECHAT_PLATFORM_PUBLIC_KEY_ID"));
 const readiness=read("lib/sasi/readiness.ts");
 assert.ok(readiness.includes("wechatPayEnabled()"),"readiness cannot confuse merchant configuration with true payment availability");
});
test("PayPal settlement requires signed webhooks and server-side completion verification",()=>{
 const webhook=read("app/api/pay/paypal/webhook/route.ts");
 assert.ok(webhook.includes("verifyPaypalWebhook"));
 assert.ok(webhook.includes("verifyPaypalCompletedOrder"));
 assert.ok(webhook.includes("fulfillPaidOrder(order.id,true)"));
 const checkout=read("app/api/pay/create/route.ts");
 assert.ok(checkout.includes('PAYPAL_NOT_READY'));
 assert.ok(checkout.includes("isSameOriginMutation"));
 const market=read("lib/sasi-marketplace/checkout.ts");
 assert.ok(market.includes("marketplaceR2Ready()"));
 assert.ok(market.includes("SASI_MARKETPLACE_COMMERCE_READY"));
});

test("isolated international candidate contains the same premium ToolPass and SASI verified UI",()=>{
 const toolpass=read("app/tools/pass/page.tsx");
 const sasi=read("components/SasiOpenMarketplace.tsx");
 const detail=read("components/SasiMarketplaceProductDetail.tsx");
 const ticket=read("app/api/sasi/marketplace/image-ticket/route.ts");
 const media=read("app/api/sasi/marketplace/my-media/route.ts");
 const manifest=read("supabase/migrations/20261109030000_sasi_market_one_cover_four_details.sql");
 for(const feature of ["premium.hero","premium.modal","premium.lowerPanels","/api/money/summary"])
  assert.ok(toolpass.includes(feature),"ToolPass: "+feature);
 for(const feature of ["global-scene-20261114.webp","styles.quickPreview","mediaCounts","主图"])
  assert.ok(sasi.includes(feature),"SASI: "+feature);
 assert.ok(detail.includes("aria-expanded={descriptionOpen}"));
 assert.ok(detail.includes('p.kind==="cover"'));
 assert.ok(detail.includes('p.kind==="detail"'));
 assert.ok(ticket.includes("ONE_COVER_MAX")&&ticket.includes("FOUR_DETAILS_MAX"));
 assert.ok(media.includes('.eq("seller_id",user.id)'));
 assert.ok(manifest.includes("pg_advisory_xact_lock"));
});
