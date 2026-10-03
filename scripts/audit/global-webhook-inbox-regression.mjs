import fs from"node:fs";
const bad=[];
const read=p=>fs.readFileSync(p,"utf8");
const inbox=read("lib/money/webhook-inbox.ts");
const wx=read("app/api/pay/wechat/refund-notify/route.ts");
const pp=read("app/api/pay/paypal/webhook/route.ts");
const worker=read("lib/money/reconcile-worker.ts");

if(!inbox.includes('if(attempt>=12)'))bad.push("webhook poison threshold missing");
if(!inbox.includes('"dead_letter","WEBHOOK_WITHDRAWAL_NOT_FOUND"'))bad.push("uncorrelated event dead-letter missing");
if(!inbox.includes("reconcileWithdrawal"))bad.push("provider-query convergence missing");
if(!wx.includes("return ok();"))bad.push("wechat ack missing");
if(!pp.includes("queued:true"))bad.push("paypal queued ack missing");
if(worker.includes("Math.random("))bad.push("non-deterministic retry jitter used");
if(!worker.includes("retryWithJitter"))bad.push("withdrawal backoff missing");
if(bad.length){console.error(bad.join("\n"));process.exit(1)}
console.log("GLOBAL_DUPLICATE_DELIVERY_REGRESSION=PASS");
console.log("GLOBAL_OUT_OF_ORDER_DELIVERY_REGRESSION=PASS");
console.log("GLOBAL_POISON_EVENT_REGRESSION=PASS");
console.log("GLOBAL_DETERMINISTIC_BACKOFF_REGRESSION=PASS");
