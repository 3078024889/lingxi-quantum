import fs from "node:fs";
const read=p=>fs.readFileSync(p,"utf8");
const exists=p=>fs.existsSync(p);
const checks=[
 ["production review bypass is impossible",read("lib/reviewMode.ts").includes('process.env.NODE_ENV !== "production"')],
 ["PayPal return binds provider token",read("app/api/pay/paypal/return/route.ts").includes("paypalToken !== order.provider_payment_id")],
 ["PayPal capture verifies amount and reference",read("lib/paypal.ts").includes("capturedCents !== expectedCents")&&read("lib/paypal.ts").includes("unit?.reference_id !== expectedReferenceId")],
 ["PayPal webhook re-queries and verifies provider amount/currency/reference",read("app/api/pay/webhook/route.ts").includes("queryPaypalOrder(paypalOrderId,Number(order.amount_usd),order.id)")&&read("lib/paypal.ts").includes('amount.currency_code !== "USD"')&&read("lib/paypal.ts").includes("unit?.reference_id !== expectedReferenceId")],
 ["PayPal balance products come from server catalog",read("app/api/pay/create/route.ts").includes("getProduct(")&&read("app/api/pay/create/route.ts").includes('["ai","production"].includes(product.group)')],
 ["PayPal order persists both charged USD and credited RMB",read("app/api/pay/create/route.ts").includes("amount_usd:product.priceUsd")&&read("app/api/pay/create/route.ts").includes("amount_rmb:product.priceRmb")],
 ["PayPal-funded CNY withdrawal keeps wallet and provider currencies separate",read("app/api/account/withdrawals/route.ts").includes("providerCurrency")&&read("app/api/account/withdrawals/route.ts").includes("providerAmountMinor")],
 ["WeChat notify verifies amount",read("app/api/pay/wechat/notify/route.ts").includes('paymentAmount.currency !== "CNY"')],
 ["tool topup uses explicit USD pricing",read("app/api/tools/quote/topup/route.ts").includes("unit_price_usd")&&!read("app/api/tools/quote/topup/route.ts").includes("amountRmb*0.15")],
 ["refund request CSRF guard",read("app/api/ai/refund/request/route.ts").includes("isSameOriginMutation(req)")],
 ["admin refund CSRF guard",read("app/api/ai/refund/admin/resolve/route.ts").includes("isSameOriginMutation(req)")],
 ["admin reversal CSRF guard",read("app/api/ai/refund/admin/reverse-topup/route.ts").includes("isSameOriginMutation(req)")],
 ["provider GET is no-spend",read("app/api/ai/provider-test/route.ts").includes('mode:"no-spend-status"')],
 ["provider paid test is explicit POST",read("app/api/ai/provider-test/route.ts").includes("EXPLICIT_PROVIDER_CALL_CONFIRMATION_REQUIRED")],
 ["website diagnose SSRF surface is quarantined",read("middleware.ts").includes('"/api/tools/website-diagnose"')&&read("middleware.ts").includes("SECURITY_HOLD")],
 ["withdrawal mutation has CSRF guard",read("app/api/account/withdrawals/route.ts").includes("isSameOriginMutation(req)")],
 ["withdrawal provider errors stay processing",read("app/api/account/withdrawals/route.ts").includes('status:"processing"')&&read("app/api/account/withdrawals/route.ts").includes("balance withdrawal provider")],
 ["withdrawal reconciliation requires cron secret",read("app/api/cron/withdrawal-reconcile/route.ts").includes("CRON_SECRET")],
 ["PayPal refund is idempotent",read("lib/payment-refunds.ts").includes('"PayPal-Request-Id":input.withdrawalId')],
 ["WeChat refund uses stable out_refund_no",read("lib/payment-refunds.ts").includes("out_refund_no:outRefundNo")],
 ["Alipay refund uses stable out_request_no",read("lib/payment-refunds.ts").includes("out_request_no:outRequestNo")],
 ["legacy lifemap API physically removed",!exists("app/api/lifemap/calc/route.ts")&&!exists("app/api/lifemap/generate-full/route.ts")],
 ["legacy tarot API physically removed",!exists("app/api/tarot/reading/generate-full/route.ts")],
 ["legacy wealth API physically removed",!exists("app/api/wealth/generate-full/route.ts")],
];
let failed=false;
for(const [name,passed] of checks){console.log(`${passed?"PASS":"FAIL"} ${name}`);if(!passed)failed=true}
if(failed)process.exit(1);
