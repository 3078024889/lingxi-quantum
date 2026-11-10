import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(p,"utf8");

test("first-party SASI source license can use PayPal USD only after private-package readiness",()=>{
 const paypal=read("lib/paypal.ts");
 const create=read("app/api/pay/create/route.ts");
 const providers=read("app/api/pay/providers/route.ts");
 const catalog=read("app/api/sasi/software/catalog/route.ts");
 const fulfill=read("lib/fulfill-order.ts");
 const webhook=read("app/api/pay/paypal/webhook/route.ts");
 const callback=read("app/api/pay/paypal/return/route.ts");
 const market=read("components/SasiOpenMarketplace.tsx");
 assert.match(paypal,/export function paypalPayEnabled/);
 assert.match(create,/paypalPayEnabled\(\)/);
 assert.match(create,/passProduct\?\.group==="software"/);
 assert.match(create,/softwareCheckoutReady\(requestedId\)/);
 assert.match(create,/wallet:"software" as const/);
 assert.match(create,/currency:"USD"/);
 assert.match(providers,/paypalPayEnabled\(\)/);
 assert.match(catalog,/paypalPayEnabled\(\)/);
 assert.match(catalog,/payment:\{wechat,alipay,paypal\}/);
 assert.match(fulfill,/softwareOffer\(productId\)/);
 assert.match(fulfill,/sasi_grant_software_delivery/);
 assert.match(webhook,/fulfillPaidOrder\(order\.id,true\)/);
 assert.match(callback,/fulfillPaidOrder\(orderId,true\)/);
 assert.match(market,/featuredPayment\.paypal/);
 assert.match(market,/\/api\/pay\/create/);
 assert.ok(market.includes("paypal\\.com"),"the redirect host is pinned to paypal.com");
 assert.match(market,/美元支付 · PayPal/);
});

test("PayPal availability never bypasses package verification or provider verification",()=>{
 const create=read("app/api/pay/create/route.ts");
 const readiness=read("lib/sasi-software/readiness.ts");
 assert.match(create,/if\(!paypalPayEnabled\(\)\)/);
 assert.match(create,/if\(isSoftware&&!await softwareCheckoutReady\(requestedId\)\)/);
 assert.match(readiness,/SOFTWARE_COMMERCE_READY!=="true"/);
 assert.match(readiness,/sale_ready/);
 assert.match(readiness,/verified_at/);
 assert.match(readiness,/sha256/);
});
