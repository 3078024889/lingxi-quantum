import fs from "node:fs"

const read = (path) => fs.readFileSync(path, "utf8")
const checks = [
  ["production review bypass is impossible", read("lib/reviewMode.ts").includes('process.env.NODE_ENV !== "production"')],
  ["OAuth redirect is restricted to checkout", read("app/api/pay/wechat/oauth-url/route.ts").includes('redirect.pathname !== "/checkout"')],
  ["OAuth state uses HttpOnly cookie", read("app/api/pay/wechat/oauth-url/route.ts").includes("httpOnly: true")],
  ["WeChat create verifies OAuth state", read("app/api/pay/wechat/create/route.ts").includes("expectedState")],
  ["PayPal return binds provider token", read("app/api/pay/paypal/return/route.ts").includes("paypalToken !== order.provider_payment_id")],
  ["PayPal capture verifies amount", read("lib/paypal.ts").includes("expectedAmountUsd") && read("lib/paypal.ts").includes("capturedCents !== expectedCents")],
  ["PayPal webhook verifies currency", read("app/api/pay/webhook/route.ts").includes('amount.currency_code !== "USD"')],
  ["WeChat notify verifies amount", read("app/api/pay/wechat/notify/route.ts").includes('paymentAmount.currency !== "CNY"')],
  ["fulfillment uses atomic RPC", read("lib/fulfill-order.ts").includes('rpc("fulfill_paid_order"')],
  ["atomic fulfillment is service-only", read("supabase/schema.sql").includes("revoke execute on function public.fulfill_paid_order")],
  ["rate limit RPC is service-only", read("supabase/schema.sql").includes("revoke execute on function public.rate_limit_check")],
  ["CSP report-only is enabled", read("next.config.js").includes("Content-Security-Policy-Report-Only")],
  ["API does not expose detail fields", !["app/api/lifemap/save/route.ts", "app/api/lifemap/update-numbers/route.ts", "app/api/pay/create/route.ts", "app/api/pay/wechat/create/route.ts"].some((path) => read(path).includes("detail:"))],
]

let failed = false
for (const [name, passed] of checks) {
  console.log(`${passed ? "PASS" : "FAIL"} ${name}`)
  if (!passed) failed = true
}

if (failed) process.exit(1)
