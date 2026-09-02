import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const read = (file) => readFileSync(resolve(root, file), "utf8");

const plans = read("lib/plans.ts");
const catalog = read("lib/mini/catalog.ts");
const fieldCopy = read("lib/mini/field-product-copy.ts");
const insights = read("components/FieldInsightsSection.tsx");
const nav = read("components/Nav.tsx");
const portal = read("components/LingxiPortal.tsx");
const sitemap = read("app/sitemap.ts");
const retiredPage = read("app/stellar-trace/page.tsx");
const generationApi = read("app/api/stellar-trace/route.ts");
const targetApi = read("app/api/stellar-trace/target/route.ts");
const paypal = read("app/api/pay/create/route.ts");
const wechat = read("app/api/pay/wechat/create/route.ts");
const miniPay = read("app/api/wechat/mini/pay/create/route.ts");
const miniApp = JSON.parse(read("miniapp/app.json"));
const miniExplore = read("miniapp/pages/explore/index.js");
const miniProduct = read("miniapp/pages/product/index.js");
const historicalDestinations = read("lib/mini/content-destinations.ts");
const historicalLink = read("app/api/wechat/mini/content-link/route.ts");

for (const source of [plans, catalog, fieldCopy, insights, nav, portal, sitemap]) {
  assert.ok(!source.includes('id: "stellar-trace"') && !source.includes('href:"/stellar-trace"') && !source.includes('href: "/stellar-trace"'), "retired product remains discoverable or purchasable");
}
assert.ok(retiredPage.includes("星迹已停止开放") && retiredPage.includes("历史订单与档案记录会继续保留"), "old deep link must show an accountable retirement notice");
for (const api of [generationApi, targetApi, paypal, wechat, miniPay]) {
  assert.match(api, /status:\s*410/, "generation and payment APIs must hard-block Stellar Trace");
}
assert.ok(!miniApp.pages.includes("pages/stellar-location/index") && !miniApp.permission && !miniApp.requiredPrivateInfos, "retired Mini Program must not request location access");
assert.ok(!existsSync(resolve(root, "miniapp/pages/stellar-location/index.js")) && !existsSync(resolve(root, "miniapp/utils/stellar-trace-intake.js")), "retired native location and intake code must not ship");
assert.ok(/productId !== 'stellar-trace'/.test(miniExplore), "cached Mini catalogs must still filter the retired product");
assert.ok(/options\.product === 'stellar-trace'[\s\S]{0,180}wx\.redirectTo/.test(miniProduct), "old Mini deep links must reach the retirement notice");
assert.ok(/"stellar-trace"/.test(historicalDestinations) && /body\.productId !== "stellar-trace"/.test(historicalLink), "historical entitlements must remain readable without restoring sales");

console.log("PASS Stellar Trace retirement: discovery removed, new sales and generation blocked, Mini location permission removed, historical records preserved.");
