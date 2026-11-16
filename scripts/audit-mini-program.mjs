import fs from "node:fs";
import path from "node:path";

const root=process.cwd();
const read=r=>fs.readFileSync(path.join(root,r),"utf8");
const exists=r=>fs.existsSync(path.join(root,r));
const must=(ok,code)=>{if(!ok)throw new Error(code)};

const required=[
 "miniapp/app.js","miniapp/app.json","miniapp/sitemap.json","miniapp/utils/api.js","miniapp/utils/i18n.js","miniapp/utils/share.js",
 "miniapp/pages/home/index.js","miniapp/pages/create/index.js","miniapp/pages/tools/index.js","miniapp/pages/agents/index.js",
 "miniapp/pages/profile/index.js","miniapp/pages/settings/index.js","miniapp/pages/web/index.js","miniapp/pages/web/index.json",
 "miniapp/pages/share/index.js","miniapp/pages/share/index.json","miniapp/pages/mail-home/index.json",
 "miniapp/pages/orders/index.js","miniapp/pages/pay/index.js","miniapp/pages/balance/index.js","miniapp/pages/notifications/index.js",
 "miniapp/pages/discover-e-sign-pdf/index.js","miniapp/pages/discover-image-watermark-remover/index.js",
 "miniapp/pages/discover-burn-after-read/index.js","miniapp/pages/discover-temp-mail/index.js",
 "app/api/wechat/mini/login/route.ts","app/api/wechat/mini/logout/route.ts","app/api/wechat/mini/account-link/start/route.ts"
];
for(const r of required)must(exists(r),"MINI_REQUIRED_FILE_MISSING:"+r);

const app=JSON.parse(read("miniapp/app.json"));
const expected=[
 "pages/web/index","pages/home/index","pages/create/index","pages/tools/index","pages/agents/index","pages/profile/index","pages/settings/index",
 "pages/share/index","pages/pay/index","pages/orders/index","pages/balance/index","pages/notifications/index",
 "pages/discover-temp-mail/index","pages/discover-burn-after-read/index","pages/discover-image-watermark-remover/index","pages/discover-e-sign-pdf/index"
];
must(Array.isArray(app.pages),"MINI_PAGES_INVALID");
must(app.pages.length===expected.length,"MINI_PAGE_COUNT_DRIFT:"+app.pages.length);
for(const p of expected)must(app.pages.includes(p),"MINI_PAGE_MISSING:"+p);
for(const p of ["pages/field/index","pages/assessment/index","pages/narrative/index"])must(!app.pages.includes(p),"RETIRED_PAGE_REGISTERED:"+p);
must(!app.tabBar,"DUPLICATE_NATIVE_TABBAR");
must(app.pages[0]==="pages/web/index"&&!app.pages.includes("pages/portal/index"),"MINI_LAUNCH_MUST_OPEN_WEBSITE_HOME");
must(!exists("miniapp/pages/portal/index.js")&&!exists("miniapp/pages/portal/index.wxml")&&!exists("miniapp/pages/portal/index.wxss"),"MINI_OLD_PORTAL_REMAINS");
must(app.entryPagePath===undefined,"UNSUPPORTED_ENTRY_PAGE_OVERRIDE_REMAINS");
for(const p of ["home","tools","create","profile","agents"])must(read("miniapp/pages/"+p+"/index.js").includes("wx.redirectTo"),"LEGACY_COMPAT_REDIRECT_MISSING:"+p);

const webConfig=JSON.parse(read("miniapp/pages/web/index.json"));
must(webConfig.enableShareAppMessage===true&&webConfig.enableShareTimeline!==true,"MINI_WEB_FRIEND_SHARE_CONFIG_MISSING_OR_TIMELINE_MISCONFIGURED");
const shareConfig=JSON.parse(read("miniapp/pages/share/index.json"));
must(shareConfig.enableShareAppMessage===true&&shareConfig.enableShareTimeline===true,"MINI_NATIVE_SHARE_CONFIG_MISSING");
const mailConfig=JSON.parse(read("miniapp/pages/mail-home/index.json"));
must(mailConfig.enableShareAppMessage===true&&mailConfig.enableShareTimeline===true,"MINI_MAIL_NATIVE_SHARE_CONFIG_MISSING");
const mailHome=read("miniapp/pages/mail-home/index.js")+read("miniapp/pages/mail-home/index.wxml");
must(!/mode=image|AI 图片|把想象变成图片|更多创作/.test(mailHome),"MINI_RETIRED_SASI_CREATIVE_ENTRY_REMAINS");
const shareClient=read("miniapp/utils/share.js");
must(shareClient.includes("SHARE_IMAGE")&&shareClient.includes("/assets/share-lingxifield-20261115.jpg"),"MINI_SHARE_IMAGE_REFERENCE_MISSING");
must(!/share-lingxifield-20261105|share-lingxifield-20261113/.test(shareClient),"MINI_STALE_SHARE_IMAGE_REFERENCE_REMAINS");
must(exists("miniapp/assets/share-lingxifield-20261115.jpg"),"MINI_SHARE_IMAGE_ASSET_MISSING");

const api=read("miniapp/utils/api.js");
must(api.includes("path.startsWith('/api/wechat/mini/')"),"MINI_API_PATH_GUARD_MISSING");
must(api.includes("Authorization:")&&api.includes("Bearer"),"MINI_AUTH_HEADER_MISSING");
must(api.includes("wx.login"),"WX_LOGIN_MISSING");
must(!/AppSecret|WECHAT_MINI_APP_SECRET|service[_-]?role/i.test(api),"CLIENT_SECRET_REFERENCE_FOUND");

const i18n=read("miniapp/utils/i18n.js");
for(const l of ["zh-CN","en","ja","ko","fr","de","es","pt","ar"])
 must(i18n.includes("'"+l+"'")||i18n.includes('"'+l+'"')||i18n.includes(l+":"),"MINI_LANGUAGE_MISSING:"+l);

const balanceRoute=read("miniapp/pages/balance/index.js");
must(balanceRoute.includes("/pages/web/index?path=")&&balanceRoute.includes("encodeURIComponent(path)")&&balanceRoute.includes("\"/ai-wallet\""),"MINI_WALLET_MUST_REDIRECT_TO_WEBSITE");
must(!balanceRoute.includes("requestVirtualPayment")&&!balanceRoute.includes("/api/wechat/mini/balance-pay/"),"NATIVE_WALLET_TOPUP_CODE_REMAINS");
must(!exists("miniapp/pages/recharge/index.js"),"RETIRED_NATIVE_RECHARGE_PAGE_REMAINS");
for(const p of [
 "miniapp/pages/recharge/index.js","miniapp/pages/recharge/index.wxml","miniapp/pages/recharge/index.json","miniapp/pages/recharge/index.wxss",
 "miniapp/utils/topup-expiry.js","miniapp/utils/virtual-payment-errors.js",
 "app/api/wechat/mini/balance-pay/availability/route.ts","app/api/wechat/mini/balance-pay/create/route.ts","app/api/wechat/mini/balance-pay/status/route.ts"
])must(!exists(p),"RETIRED_MINI_WALLET_TOPUP_FILE_REMAINS:"+p);
const web=read("miniapp/pages/web/index.js");
must(web.includes("EXACT_ALLOWED")&&web.includes("PREFIX_ALLOWED"),"MINI_WEB_ALLOWLIST_MISSING");
must(web.includes("preferredCurrency()")&&web.includes("currency="),"MINI_CURRENCY_WEB_SYNC_MISSING");
must(web.includes("options.webViewUrl")&&web.includes("shareablePath"),"MINI_WEB_CURRENT_URL_SHARING_MISSING");
must(!web.includes("ai-knowledge")&&!web.includes("ai-learning")&&!web.includes("ai-research"),"MINI_RETIRED_ROUTE_ALLOWLIST_REMAINS");

console.log("AUDIT_MINI_PROGRAM=PASS");
console.log("CURRENT_MINI_TOPOLOGY="+expected.length+"_PAGES_PASS");
console.log("DIRECT_WEBSITE_HOME_LAUNCH=PASS");
console.log("SINGLE_WEB_NAVIGATION=PASS");
console.log("FRIEND_SHARE_WEBVIEW_AND_TIMELINE_NATIVE_PAGE=PASS");
console.log("MINI_9_LANGUAGE_STRUCTURE=PASS");
console.log("MINI_API_BOUNDARY=PASS");
