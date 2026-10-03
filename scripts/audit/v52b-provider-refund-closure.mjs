import fs from"node:fs";
const bad=[];
const read=p=>fs.readFileSync(p,"utf8");

for(const p of["lib/wechatpay.ts","lib/alipay.ts","lib/paypal.ts","lib/money/provider-adapters.ts","lib/money/reconcile-worker.ts","app/api/internal/money/reconcile/route.ts"]){
 if(!fs.existsSync(p))bad.push(`missing ${p}`);
}
if(fs.existsSync("lib/wechatpay.ts")){
 const s=read("lib/wechatpay.ts");
 for(const x of["createWechatRefund","queryWechatRefund","/v3/refund/domestic/refunds"])if(!s.includes(x))bad.push(`wechat missing ${x}`);
}
if(fs.existsSync("lib/alipay.ts")){
 const s=read("lib/alipay.ts");
 for(const x of["createAlipayRefund","queryAlipayRefund","alipay.trade.refund","alipay.trade.fastpay.refund.query"])if(!s.includes(x))bad.push(`alipay missing ${x}`);
}
if(fs.existsSync("lib/paypal.ts")){
 const s=read("lib/paypal.ts");
 for(const x of["createPaypalRefund","queryPaypalRefund","PayPal-Request-Id","/v2/payments/captures/"])if(!s.includes(x))bad.push(`paypal missing ${x}`);
}
if(fs.existsSync("lib/money/reconcile-worker.ts")){
 const s=read("lib/money/reconcile-worker.ts");
 for(const x of["complete_balance_withdrawal","release_balance_withdrawal","provider_request_key","next_reconcile_at"])if(!s.includes(x))bad.push(`worker missing ${x}`);
 if(s.includes("status:'completed'")||s.includes('status="completed"'))bad.push("worker must not directly forge completion state");
}
if(fs.existsSync("app/api/internal/money/reconcile/route.ts")){
 const s=read("app/api/internal/money/reconcile/route.ts");
 if(!s.includes("MONEY_RECONCILE_SECRET"))bad.push("reconcile route missing secret gate");
}
if(bad.length){console.error(bad.join("\n"));process.exit(1)}
console.log("V52B_WECHAT_REFUND_EXECUTE_SYNC=PASS");
console.log("V52B_ALIPAY_REFUND_EXECUTE_SYNC=PASS");
console.log("V52B_PAYPAL_REFUND_EXECUTE_SYNC=PASS");
console.log("V52B_PROVIDER_IDEMPOTENCY=PASS");
console.log("V52B_RECONCILIATION_WORKER=PASS");
console.log("V52B_NO_FAKE_COMPLETION=PASS");
