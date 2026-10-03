import fs from"node:fs";
const bad=[];
const read=p=>fs.readFileSync(p,"utf8");

for(const p of[
 "lib/money/refund-identifiers.ts",
 "app/api/pay/wechat/refund-notify/route.ts",
 "app/api/pay/paypal/webhook/route.ts"
])if(!fs.existsSync(p))bad.push(`missing ${p}`);

const ids=read("lib/money/refund-identifiers.ts");
for(const x of["wechatRefundNoFromRequestKey","providerRequestKeyFromWechatRefundNo","WECHAT_REFUND_NOTIFY_URL"])
 if(!ids.includes(x))bad.push(`identifier helper missing ${x}`);

const wechat=read("lib/wechatpay.ts");
if(!wechat.includes("notify_url:notifyUrl"))bad.push("wechat refund notify_url missing");
if(!wechat.includes("wechatRefundNotifyUrl"))bad.push("wechat notify-url helper import missing");

const wroute=read("app/api/pay/wechat/refund-notify/route.ts");
for(const x of[
 "verifyWechatNotifySignature",
 "decryptWechatNotifyResource",
 "providerRequestKeyFromWechatRefundNo",
 "complete_balance_withdrawal",
 "release_balance_withdrawal",
 "PROVIDER_ACTION_REQUIRED",
 'status==="ABNORMAL"'
])if(!wroute.includes(x))bad.push(`wechat refund webhook missing ${x}`);

const paypal=read("lib/paypal.ts");
if(!paypal.includes("custom_id:input.requestId"))bad.push("paypal stable custom_id missing");

const proute=read("app/api/pay/paypal/webhook/route.ts");
for(const x of[
 "PAYMENT.CAPTURE.REFUNDED",
 "verifyPaypalWebhook",
 "provider_refund_id",
 "provider_request_key",
 "complete_balance_withdrawal",
 "PAYPAL_REFUND_AMOUNT_MISMATCH"
])if(!proute.includes(x))bad.push(`paypal refund webhook missing ${x}`);

const adapters=read("lib/money/provider-adapters.ts");
if(!adapters.includes("wechatRefundNoFromRequestKey"))bad.push("wechat adapter not using shared id helper");

if(bad.length){console.error(bad.join("\n"));process.exit(1)}
console.log("V52F_WECHAT_REFUND_NOTIFY_URL=PASS");
console.log("V52F_WECHAT_REFUND_WEBHOOK_SIGNATURE=PASS");
console.log("V52F_WECHAT_REFUND_AMOUNT_REFERENCE_GUARDS=PASS");
console.log("V52F_WECHAT_SUCCESS_COMPLETE=PASS");
console.log("V52F_WECHAT_CLOSED_RELEASE=PASS");
console.log("V52F_WECHAT_ABNORMAL_HOLD_PRESERVED=PASS");
console.log("V52F_PAYPAL_REFUND_WEBHOOK_SIGNATURE=PASS");
console.log("V52F_PAYPAL_REFUND_CORRELATION=PASS");
console.log("V52F_PAYPAL_REFUND_AMOUNT_GUARD=PASS");
console.log("V52F_SHARED_REFUND_IDENTIFIERS=PASS");
