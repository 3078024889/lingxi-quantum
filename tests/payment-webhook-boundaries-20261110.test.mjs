import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(p,"utf8");

test("provider webhooks enforce bounded request bodies before parsing",()=>{
 const alipay=read("app/api/pay/alipay/notify/route.ts");
 const wechat=read("app/api/pay/wechat/notify/route.ts");
 const wechatRefund=read("app/api/pay/wechat/refund-notify/route.ts");
 const paypal=read("app/api/pay/paypal/webhook/route.ts");
 const paypalLegacy=read("app/api/pay/webhook/route.ts");
 assert.ok(alipay.includes("application\\/x-www-form-urlencoded"));
 assert.match(alipay,/Buffer\.byteLength\(rawBody,\s*"utf8"\)\s*>\s*64\s*\*\s*1024/);
 assert.match(alipay,/Object\.prototype\.hasOwnProperty\.call\(params,\s*key\)/);
 for(const route of [wechat,wechatRefund,paypal,paypalLegacy]){
  assert.match(route,/Buffer\.byteLength\(/);
  assert.match(route,/512\s*\*\s*1024/);
 }
});

test("browser and callback settlement routes enforce provider currency",()=>{
 const alipayNotify=read("app/api/pay/alipay/notify/route.ts");
 const alipayReturn=read("app/api/pay/alipay/return/route.ts");
 const wechatNotify=read("app/api/pay/wechat/notify/route.ts");
 const wechatQuery=read("app/api/pay/wechat/query/route.ts");
 assert.match(alipayNotify,/order\.currency !== "CNY"/);
 assert.match(alipayReturn,/order\.currency!=="CNY"/);
 assert.match(wechatNotify,/order\.currency !== "CNY"/);
 assert.match(wechatQuery,/order\.currency !== "CNY"/);
});
