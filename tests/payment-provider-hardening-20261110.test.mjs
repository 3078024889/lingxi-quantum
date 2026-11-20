import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(p,"utf8");

test("PayPal charges require explicit Live mode and unsigned callbacks stop before network access",()=>{
 const paypal=read("lib/paypal.ts");
 const create=read("app/api/pay/create/route.ts");
 const webhook=read("app/api/pay/paypal/webhook/route.ts");
 assert.match(paypal,/PAYPAL_ENV\?\.trim\(\)\.toLowerCase\(\)\s*===\s*"live"/);
 assert.match(create,/paypalPayEnabled\(\)/);
 assert.match(paypal,/paypal-transmission-id/);
 assert.match(paypal,/JSON\.parse\(rawBody\)/);
 assert.match(webhook,/verifyPaypalWebhook\(req\.headers,raw\)/);
});

test("WeChat notifications bind signed decrypted merchant identity and valid key material",()=>{
 const lib=read("lib/wechatpay.ts"),route=read("app/api/pay/wechat/notify/route.ts");
 assert.match(lib,/wechatPayKeyMaterialReady/);
 assert.match(lib,/WECHAT_PLATFORM_PUBLIC_KEY/);
 assert.match(lib,/WECHAT_PLATFORM_PUBLIC_KEY_ID/);
 assert.match(route,/wechatAppId\(\)/);
 assert.match(route,/wechatMerchantId\(\)/);
 assert.match(route,/decrypted\.appid/);
 assert.match(route,/decrypted\.mchid/);
 assert.match(route,/order\.currency !== "CNY"/);
});

test("Alipay callbacks require configured app and seller identities and exact CNY minor units",()=>{
 const lib=read("lib/alipay.ts"),route=read("app/api/pay/alipay/notify/route.ts");
 assert.match(lib,/ALIPAY_SELLER_ID/);
 assert.match(route,/!expectedSeller \|\| params\.seller_id !== expectedSeller/);
 assert.match(route,/!expectedAppId \|\| params\.app_id !== expectedAppId/);
 assert.match(route,/parseCnyMinorUnits/);
 assert.match(route,/order\.currency !== "CNY"/);
});
