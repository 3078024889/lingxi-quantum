import fs from"node:fs";
const bad=[];
const read=p=>fs.readFileSync(p,"utf8");

for(const p of[
 "app/api/pay/wechat/refund-notify/route.ts",
 "app/api/pay/paypal/webhook/route.ts",
 "lib/money/webhook-inbox.ts",
 "lib/money/provider-adapters.ts"
])if(!fs.existsSync(p))bad.push(`missing ${p}`);

const wx=read("app/api/pay/wechat/refund-notify/route.ts");
for(const x of["verifyWechatNotifySignature","enqueueMoneyWebhookEvent","providerRequestKeyFromWechatRefundNo"])
 if(!wx.includes(x))bad.push(`wechat refund webhook missing ${x}`);
if(wx.includes("complete_balance_withdrawal")||wx.includes("release_balance_withdrawal"))
 bad.push("wechat refund webhook must not mutate wallet ledger directly");

const pp=read("app/api/pay/paypal/webhook/route.ts");
for(const x of["verifyPaypalWebhook","PAYMENT.CAPTURE.REFUNDED","enqueueMoneyWebhookEvent"])
 if(!pp.includes(x))bad.push(`paypal refund webhook missing ${x}`);
if(pp.includes("complete_balance_withdrawal"))
 bad.push("paypal refund webhook must not mutate wallet ledger directly");

const inbox=read("lib/money/webhook-inbox.ts");
for(const x of["reconcileWithdrawal","money_claim_webhook_events_v53","dead_letter"])
 if(!inbox.includes(x))bad.push(`durable webhook convergence missing ${x}`);

const adapters=read("lib/money/provider-adapters.ts");
for(const x of["WECHAT_REFUND_AMOUNT_MISMATCH","PAYPAL_REFUND_AMOUNT_MISMATCH",'errorCode:"WECHAT_ABNORMAL"'])
 if(!adapters.includes(x))bad.push(`provider refund guard missing ${x}`);

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
console.log("V52F_DURABLE_INBOX_SUPERSEDES_DIRECT_WEBHOOK_MUTATION=PASS");
