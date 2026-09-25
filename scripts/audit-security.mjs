import fs from "node:fs";
const read=p=>fs.readFileSync(p,"utf8");
const exists=p=>fs.existsSync(p);

const paypal=read("lib/paypal.ts");
const paypalReturn=read("app/api/pay/paypal/return/route.ts");
const paypalWebhook=read("app/api/pay/webhook/route.ts");
const failures=[];

const check=(name,passed)=>{
  console.log(`${passed?"PASS":"FAIL"} ${name}`);
  if(!passed)failures.push(name);
};

check("production review bypass is impossible",
  read("lib/reviewMode.ts").includes('process.env.NODE_ENV !== "production"'));

check("PayPal return binds provider token",
  /paypalToken\s*!==\s*order\.provider_payment_id/.test(paypalReturn));

check("PayPal capture verifies USD amount",
  paypal.includes("verifyMoney(capture?.amount") || paypal.includes("verifyMoney(capture.amount"));

check("PayPal capture verifies local reference",
  paypal.includes("verifyReference(unit, expectedReferenceId)"));

check("PayPal completed capture verifier exists",
  paypal.includes("export async function verifyPaypalCompletedOrder")
  && paypal.includes('captures.find((item: any) => item?.status === "COMPLETED")')
  && paypal.includes("if (!capture?.id)")
  && paypal.includes("verifyMoney(capture.amount, expectedAmountUsd)")
  && paypal.includes("verifyReference(unit, expectedReferenceId)"));

check("PayPal completed capture amount is re-verified",
  /verifyMoney\(capture\.amount,\s*expectedAmountUsd\)/.test(paypal));

check("PayPal return requires completed capture",
  paypalReturn.includes("verifyPaypalCompletedOrder"));

check("PayPal webhook requires completed capture",
  paypalWebhook.includes("verifyPaypalCompletedOrder"));

check("PayPal webhook signature is required",
  paypalWebhook.includes("verifyPaypalWebhook")
  && paypalWebhook.includes("INVALID_WEBHOOK_SIGNATURE"));

check("PayPal USD topup uses dedicated USD catalog",
  read("app/api/pay/create/route.ts").includes("getUsdBalanceProduct")
  && read("app/api/pay/create/route.ts").includes("amount_rmb:null"));

check("PayPal USD fulfillment credits USD wallet",
  read("lib/fulfill-order.ts").includes("credit_ai_usd_topup")
  && read("lib/fulfill-order.ts").includes("credit_sasi_usd_topup"));

check("dual currency consumption migration present",
  exists("supabase/migrations/20260925005500_dual_currency_wallet_consumption_v1464.sql"));

check("WeChat notify verifies amount",
  read("app/api/pay/wechat/notify/route.ts").includes('paymentAmount.currency !== "CNY"'));

check("tool topup uses explicit USD pricing",
  read("app/api/tools/quote/topup/route.ts").includes("unit_price_usd")
  && !read("app/api/tools/quote/topup/route.ts").includes("amountRmb*0.15"));

check("refund request CSRF guard",
  read("app/api/ai/refund/request/route.ts").includes("isSameOriginMutation(req)"));

check("admin refund CSRF guard",
  read("app/api/ai/refund/admin/resolve/route.ts").includes("isSameOriginMutation(req)"));

check("admin reversal CSRF guard",
  read("app/api/ai/refund/admin/reverse-topup/route.ts").includes("isSameOriginMutation(req)"));

check("provider GET is no-spend",
  read("app/api/ai/provider-test/route.ts").includes('mode:"no-spend-status"'));

check("provider paid test is explicit POST",
  read("app/api/ai/provider-test/route.ts").includes("EXPLICIT_PROVIDER_CALL_CONFIRMATION_REQUIRED"));

check("website diagnose SSRF surface is quarantined",
  read("middleware.ts").includes('"/api/tools/website-diagnose"')
  && read("middleware.ts").includes("SECURITY_HOLD"));

check("withdrawal mutation has CSRF guard",
  read("app/api/account/withdrawals/route.ts").includes("isSameOriginMutation(req)"));

check("withdrawal reconciliation requires cron secret",
  read("app/api/cron/withdrawal-reconcile/route.ts").includes("CRON_SECRET"));

check("PayPal refund is idempotent",
  read("lib/payment-refunds.ts").includes('"PayPal-Request-Id":input.withdrawalId'));

check("legacy lifemap API physically removed",
  !exists("app/api/lifemap/calc/route.ts")
  && !exists("app/api/lifemap/generate-full/route.ts"));

check("legacy tarot API physically removed",
  !exists("app/api/tarot/reading/generate-full/route.ts"));

check("legacy wealth API physically removed",
  !exists("app/api/wealth/generate-full/route.ts"));

if(failures.length){
  console.error(`AUDIT_SECURITY_FAILURES=${failures.length}`);
  failures.forEach((name,index)=>console.error(`${index+1}. ${name}`));
  process.exit(1);
}
console.log("AUDIT_SECURITY=PASS");
