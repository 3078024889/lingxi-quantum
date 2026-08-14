import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
let failed = false;
function check(label, condition) {
  console.log(`${condition ? "PASS" : "FAIL"} ${label}`);
  if (!condition) failed = true;
}
function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

const project = JSON.parse(read("miniapp/project.config.json"));
const app = JSON.parse(read("miniapp/app.json"));
const env = read(".env.example");
const payCreate = read("app/api/wechat/mini/pay/create/route.ts");
const notify = read("app/api/wechat/mini/pay/notify/route.ts");
const paymentClient = read("miniapp/utils/payment.js");
const miniSources = fs.readdirSync(path.join(root, "miniapp"), { recursive: true })
  .filter((file) => typeof file === "string" && /\.(js|json|wxml|wxss)$/.test(file))
  .map((file) => read(path.join("miniapp", file))).join("\n");

check("Mini Program AppID is the configured public identifier", project.appid === "wxbf4ae90406e7e26b");
check("four primary native tabs exist", app.tabBar?.list?.length === 4);
check("client contains no AppSecret or virtual-pay AppKey", !/APP_SECRET|APP_KEY|session_key|service_role/i.test(miniSources));
check("payment refreshes wx.login before signing", /wxLogin\(\)/.test(paymentClient) && /code/.test(payCreate));
check("server verifies mini identity before creating an order", /freshWxSession\.openid !== session\.openid/.test(payCreate));
check("client success never fulfills entitlement", !/fulfill|unlock|status:\s*['\"]paid/.test(paymentClient));
check("server notification is signature protected", /verifiedByWechat\(req\)/.test(notify));
check("server notification verifies amount", /actualFen !== expectedFen/.test(notify));
check("server notification verifies product", /expectedProduct\.id !== order\.product_id/.test(notify));
check("server notification verifies user identity", /identity\.openid !== callbackOpenid/.test(notify));
check("server notification uses atomic fulfillment", /fulfillPaidOrder\(order\.id\)/.test(notify));
check("secrets are environment-only", /WECHAT_MINI_VPAY_APP_KEY=/.test(env) && /WECHAT_MINI_SESSION_ENCRYPTION_KEY=/.test(env));

if (failed) process.exit(1);
