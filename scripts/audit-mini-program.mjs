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
const catalog = read("lib/mini/catalog.ts");
const exploreClient = read("miniapp/pages/explore/index.js");
const exploreView = read("miniapp/pages/explore/index.wxml");
const productClient = read("miniapp/pages/product/index.js");
const reportRoutes = read("miniapp/utils/report-routes.js");
const virtualPay = read("miniapp/utils/payment.js");
const accountLinkStart = read("app/api/wechat/mini/account-link/start/route.ts");
const accountLinkConfirm = read("app/api/wechat/mini/account-link/confirm/route.ts");
const accountLinkPanel = read("app/account/MiniAccountLinkPanel.tsx");
const accountLinkSql = read("sql-history/SQL-v301-mini-account-link.sql");
const fieldView = read("miniapp/pages/field/index.wxml");
const membershipContent = read("lib/membership-content.ts");
const profileClient = read("miniapp/pages/profile/index.js");
const profileView = read("miniapp/pages/profile/index.wxml");
const productView = read("miniapp/pages/product/index.wxml");
const contentDestinations = read("lib/mini/content-destinations.ts");
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
check(
  "server notification verifies product",
  /expectedSku !== payload\.GoodsInfo\.ProductId/.test(notify) && /miniSkuForProduct\(order\.product_id\)/.test(notify)
);
check("server notification verifies user identity", /identity\.openid !== callbackOpenid/.test(notify));
check("server notification uses atomic fulfillment", /fulfillPaidOrder\(order\.id\)/.test(notify));
check("secrets are environment-only", /WECHAT_MINI_VPAY_APP_KEY=/.test(env) && /WECHAT_MINI_SESSION_ENCRYPTION_KEY=/.test(env));
const reportWebPaths = ["/life-map", "/relationship", "/qian", "/tarot", "/resilience", "/romance", "/daily", "/wealth"];
check("all eight report entries map to their web product routes", reportWebPaths.every((route) => catalog.includes(`: \"${route}\"`) && reportRoutes.includes(`'${route}'`)));
check("report discovery opens the shared web product source", /getReportWebPath/.test(exploreClient) && /pages\/web\/index/.test(exploreClient));
check("report discovery does not restore the removed preliminary archive funnel", !/初读档案|生成我的初读档案/.test(exploreView));
check("removed preliminary archive page is not registered or reachable", !app.pages.includes("pages/assessment/index") && !/pages\/assessment/.test(productClient));
check("iPhone sandbox payment is stopped before WeChat returns a platform error", /result\.sandbox && platform === 'ios'/.test(virtualPay));
check("account linking begins only from a valid Mini Program session", /requireMiniSession\(req\)/.test(accountLinkStart));
check("account-link hand-off is encrypted, random, and short-lived", /encryptMiniSecret/.test(accountLinkStart) && /randomBytes/.test(accountLinkStart) && /10 \* 60 \* 1000/.test(accountLinkStart));
check("account linking requires the target web account to be signed in", /supabase\.auth\.getUser\(\)/.test(accountLinkConfirm));
check("account linking rechecks the live Mini identity before migration", /wechat_mini_identities/.test(accountLinkConfirm) && /identity\.user_id !== ticket\.sourceUserId/.test(accountLinkConfirm));
check("account-link UI asks for an explicit confirmation", /确认连接此账户/.test(accountLinkPanel) && /不会猜测或自动合并账户/.test(accountLinkPanel));
check("account migration does not guess identity from email or phone", !/email|phone|手机号|邮箱/i.test(`${accountLinkStart}\n${accountLinkConfirm}\n${accountLinkSql}`));
check("account migration preserves report, order, and entitlement records", /public\.unlocks/.test(accountLinkSql) && /public\.orders/.test(accountLinkSql) && /public\.wealth_submissions/.test(accountLinkSql));
check("account migration RPC is service-role-only", /revoke execute[\s\S]*from public, anon, authenticated/.test(accountLinkSql) && /grant execute[\s\S]*to service_role/.test(accountLinkSql));
check("membership cards use product-specific shared publication copy", /MEMBERSHIP_CONTENT/.test(catalog) && /item\.benefits/.test(fieldView) && /item\.cta/.test(fieldView));
check("membership landing copy uses field, archive, exploration, and connection language", ["场域", "档案", "探索", "连接", "觉察"].every((term) => `${fieldView}\n${membershipContent}`.includes(term)));
check("Mini Program membership page no longer repeats generic permanent-sales copy", !/一次能量交换，永久开启/.test(fieldView));
check(
  "historical web reports use a confirmed secure archive hand-off",
  /confirmOpenWebArchive/.test(profileClient) &&
    /无需再次购买/.test(profileClient) &&
    /isMiniWebArchiveProduct\(productId\).*return "\/account\/orders"/s.test(contentDestinations)
);
check(
  "purchase screen discloses delivery, validity, renewal, and requires policy consent",
  ["交付方式", "权益期限", "不会自动续费", "/terms", "/refunds", "/privacy", "agreed"].every((term) => `${productView}\n${productClient}`.includes(term))
);
check("purchase screen offers a WeChat customer-service route", /open-type="contact"/.test(productView));
check(
  "My Field exposes terms, refunds, privacy, declaration, about, and support",
  ["/terms", "/refunds", "/privacy", "/declaration", "/about", "open-type=\"contact\""].every((term) => profileView.includes(term)) && /openPolicy/.test(profileClient)
);

if (failed) process.exit(1);
