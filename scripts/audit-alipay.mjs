import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");
const alipay = read("lib/alipay.ts");
const create = read("app/api/pay/alipay/create/route.ts");
const notify = read("app/api/pay/alipay/notify/route.ts");
const checkout = read("app/checkout/page.tsx");
const env = read(".env.example");

const checks = [
  [alipay.includes('createSign("RSA-SHA256")') && alipay.includes('createVerify("RSA-SHA256")'), "RSA2 request signing and notification verification"],
  [alipay.includes("alipay.trade.page.pay") && alipay.includes("alipay.trade.wap.pay"), "desktop and mobile web payment methods"],
  [create.includes('.eq("user_id", user.id)') && create.includes('provider: "alipay"'), "authenticated owner-scoped order creation"],
  [notify.includes("params.app_id !== alipayAppId()") && notify.includes("receivedFen !== expectedFen"), "app and exact CNY amount validation"],
  [notify.includes("verifyAlipayNotification(params)") && notify.includes("fulfillPaidOrder(order.id)"), "verified asynchronous fulfillment"],
  [notify.includes('new Response(body') && notify.includes('text("success")'), "plain-text Alipay acknowledgement"],
  [checkout.includes('"alipay"') && checkout.includes("alipayAvailable"), "checkout exposes Alipay only after release gate"],
  [alipay.includes("excludeSignType") && alipay.includes('key !== "sign_type"'), "notification canonicalization excludes sign and sign_type"],
  [create.includes("alipaySiteUrl()") && env.includes("ALIPAY_SITE_URL=https://lingxifield.cn"), "callbacks use the filed .cn domain"],
  [alipay.includes("ALIPAY_ENABLED") && env.includes("ALIPAY_ENABLED=false"), "production activation is explicitly gated"],
  [env.includes("ALIPAY_PRIVATE_KEY=") && env.includes("ALIPAY_PUBLIC_KEY="), "deployment variables documented"],
];

const failed = checks.filter(([ok]) => !ok);
if (failed.length) {
  for (const [, label] of failed) console.error(`FAIL ${label}`);
  process.exit(1);
}
for (const [, label] of checks) console.log(`PASS ${label}`);
