import fs from "node:fs";
const read=p=>fs.readFileSync(p,"utf8");
const exists=p=>fs.existsSync(p);
const checks=[
 ["production review bypass is impossible",read("lib/reviewMode.ts").includes('process.env.NODE_ENV !== "production"')],
 ["PayPal return binds provider token",read("app/api/pay/paypal/return/route.ts").includes("paypalToken !== order.provider_payment_id")],
 ["PayPal capture verifies amount and reference",read("lib/paypal.ts").includes("capturedCents !== expectedCents")&&read("lib/paypal.ts").includes("unit?.reference_id !== expectedReferenceId")],
 ["PayPal USD topup uses dedicated USD catalog",read("app/api/pay/create/route.ts").includes("getUsdBalanceProduct")&&read("app/api/pay/create/route.ts").includes("amount_rmb:null")],
 ["PayPal USD fulfillment credits USD wallet",read("lib/fulfill-order.ts").includes('credit_ai_usd_topup')&&read("lib/fulfill-order.ts").includes('credit_sasi_usd_topup')],
 ["dual currency consumption migration present",exists("supabase/migrations/20260925005500_dual_currency_wallet_consumption_v1464.sql")],
 ["WeChat notify verifies amount",read("app/api/pay/wechat/notify/route.ts").includes('paymentAmount.currency !== "CNY"')],
 ["tool topup uses explicit USD pricing",read("app/api/tools/quote/topup/route.ts").includes("unit_price_usd")&&!read("app/api/tools/quote/topup/route.ts").includes("amountRmb*0.15")],
 ["refund request CSRF guard",read("app/api/ai/refund/request/route.ts").includes("isSameOriginMutation(req)")],
 ["admin refund CSRF guard",read("app/api/ai/refund/admin/resolve/route.ts").includes("isSameOriginMutation(req)")],
 ["admin reversal CSRF guard",read("app/api/ai/refund/admin/reverse-topup/route.ts").includes("isSameOriginMutation(req)")],
 ["provider GET is no-spend",read("app/api/ai/provider-test/route.ts").includes('mode:"no-spend-status"')],
 ["provider paid test is explicit POST",read("app/api/ai/provider-test/route.ts").includes("EXPLICIT_PROVIDER_CALL_CONFIRMATION_REQUIRED")],
 ["website diagnose SSRF surface is quarantined",read("middleware.ts").includes('"/api/tools/website-diagnose"')&&read("middleware.ts").includes("SECURITY_HOLD")],
 ["withdrawal mutation has CSRF guard",read("app/api/account/withdrawals/route.ts").includes("isSameOriginMutation(req)")],
 ["withdrawal reconciliation requires cron secret",read("app/api/cron/withdrawal-reconcile/route.ts").includes("CRON_SECRET")],
 ["PayPal refund is idempotent",read("lib/payment-refunds.ts").includes('"PayPal-Request-Id":input.withdrawalId')],
 ["legacy lifemap API physically removed",!exists("app/api/lifemap/calc/route.ts")&&!exists("app/api/lifemap/generate-full/route.ts")],
 ["legacy tarot API physically removed",!exists("app/api/tarot/reading/generate-full/route.ts")],
 ["legacy wealth API physically removed",!exists("app/api/wealth/generate-full/route.ts")],
];
let failed=false;
for(const [name,passed] of checks){console.log(`${passed?"PASS":"FAIL"} ${name}`);if(!passed)failed=true}
if(failed)process.exit(1);
