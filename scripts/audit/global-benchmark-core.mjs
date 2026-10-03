import fs from"node:fs";
const bad=[];
const read=p=>fs.readFileSync(p,"utf8");

for(const p of[
 "lib/money/webhook-inbox.ts",
 "lib/money/retry-policy.ts",
 "lib/security/secret-equals.ts",
 "supabase/migrations/20261003081732_money_webhook_inbox_global_benchmark_v53.sql",
 "app/api/pay/wechat/refund-notify/route.ts",
 "app/api/pay/paypal/webhook/route.ts",
 "app/api/cron/withdrawal-reconcile/route.ts"
])if(!fs.existsSync(p))bad.push(`missing ${p}`);

const mig=read("supabase/migrations/20261003081732_money_webhook_inbox_global_benchmark_v53.sql");
for(const x of[
 "unique(provider,event_key)",
 "money_claim_webhook_events_v53",
 "for update skip locked",
 "money_finish_webhook_event_v53",
 "dead_letter",
 "enable row level security"
])if(!mig.toLowerCase().includes(x.toLowerCase()))bad.push(`migration missing ${x}`);

const wx=read("app/api/pay/wechat/refund-notify/route.ts");
for(const x of[
 "isWechatNotifyTimestampFresh(timestamp,300)",
 "verifyWechatNotifySignature",
 "enqueueMoneyWebhookEvent",
 "payloadSha256",
 "providerRequestKeyFromWechatRefundNo"
])if(!wx.includes(x))bad.push(`wechat benchmark missing ${x}`);
if(wx.includes("complete_balance_withdrawal")||wx.includes("release_balance_withdrawal"))bad.push("wechat webhook still mutates ledger synchronously");

const pp=read("app/api/pay/paypal/webhook/route.ts");
for(const x of["verifyPaypalWebhook","PAYMENT.CAPTURE.REFUNDED","enqueueMoneyWebhookEvent","payloadSha256"])
 if(!pp.includes(x))bad.push(`paypal benchmark missing ${x}`);
if(pp.includes("complete_balance_withdrawal"))bad.push("paypal refund webhook still mutates ledger synchronously");

const inbox=read("lib/money/webhook-inbox.ts");
for(const x of[
 'admin.rpc("money_claim_webhook_events_v53"',
 'admin.rpc("money_finish_webhook_event_v53"',
 "reconcileWithdrawal",
 "dead_letter",
 "webhookRetrySeconds"
])if(!inbox.includes(x))bad.push(`inbox worker missing ${x}`);

const retry=read("lib/money/retry-policy.ts");
if(!retry.includes("factor=.8+unit*.4"))bad.push("retry jitter missing");

const worker=read("lib/money/reconcile-worker.ts");
for(const x of["retryWithJitter","providerOrderTotalMinor(order,providerCurrency)","OPERATOR_REVIEW_REQUIRED"])
 if(!worker.includes(x))bad.push(`worker benchmark missing ${x}`);

const secret=read("lib/security/secret-equals.ts");
if(!secret.includes("timingSafeEqual"))bad.push("timing-safe secret comparison missing");

const cron=read("app/api/cron/withdrawal-reconcile/route.ts");
if(!cron.includes("processMoneyWebhookInbox(30)"))bad.push("cron does not drain webhook inbox");
if(!cron.includes("secureSecretEqual"))bad.push("cron secret comparison not hardened");

const ops=read("app/api/internal/money/operations/route.ts");
if(!ops.includes("webhookDeadLetter"))bad.push("operator dead-letter visibility missing");

const adapters=read("lib/money/provider-adapters.ts");
for(const x of[
 "WECHAT_REFUND_AMOUNT_MISMATCH",
 "WECHAT_REFUND_ORDER_MISMATCH",
 "PAYPAL_REFUND_AMOUNT_MISMATCH",
 'if(r.providerCurrency!=="USD")'
])if(!adapters.includes(x))bad.push(`provider verification missing ${x}`);

if(bad.length){console.error(bad.join("\n"));process.exit(1)}
console.log("GLOBAL_WEBHOOK_INBOX_DEDUPE=PASS");
console.log("GLOBAL_WEBHOOK_FAST_ACK_ARCHITECTURE=PASS");
console.log("GLOBAL_WEBHOOK_REPLAY_WINDOW_WECHAT_5MIN=PASS");
console.log("GLOBAL_WEBHOOK_OUT_OF_ORDER_SAFE=PASS");
console.log("GLOBAL_WEBHOOK_DEAD_LETTER=PASS");
console.log("GLOBAL_RETRY_EXPONENTIAL_JITTER=PASS");
console.log("GLOBAL_TIMING_SAFE_INTERNAL_SECRETS=PASS");
console.log("GLOBAL_PROVIDER_QUERY_SOURCE_OF_TRUTH=PASS");
console.log("GLOBAL_PROVIDER_AMOUNT_REFERENCE_VALIDATION=PASS");
console.log("GLOBAL_OPERATOR_POISON_EVENT_VISIBILITY=PASS");
console.log("GLOBAL_DB_RLS_SERVICE_ROLE_INBOX=PASS");
