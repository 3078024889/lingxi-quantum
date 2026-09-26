import fs from "node:fs";
import path from "node:path";

const root=process.cwd();
const read=(rel)=>fs.readFileSync(path.join(root,rel),"utf8");
const exists=(rel)=>fs.existsSync(path.join(root,rel));
const must=(ok,code)=>{if(!ok)throw new Error(code)};

const required=[
  "miniapp/app.js","miniapp/app.json","miniapp/utils/api.js","miniapp/utils/i18n.js","miniapp/utils/share.js",
  "miniapp/pages/create/index.js","miniapp/pages/create/index.wxml",
  "miniapp/pages/tools/index.js","miniapp/pages/tools/index.wxml",
  "miniapp/pages/agents/index.js","miniapp/pages/agents/index.wxml",
  "miniapp/pages/profile/index.js","miniapp/pages/profile/index.wxml",
  "miniapp/pages/web/index.js","miniapp/pages/web/index.wxml",
  "miniapp/pages/share/index.js","miniapp/pages/share/index.json","miniapp/pages/share/index.wxml","miniapp/pages/share/index.wxss",
  "miniapp/pages/orders/index.wxss","miniapp/pages/orders/index.wxml","miniapp/pages/orders/index.json","miniapp/pages/orders/index.js",
  "miniapp/pages/pay/index.wxss","miniapp/pages/pay/index.wxml","miniapp/pages/pay/index.json","miniapp/pages/pay/index.js",
  "miniapp/pages/balance/index.js",
  "app/api/wechat/mini/login/route.ts","app/api/wechat/mini/logout/route.ts","app/api/wechat/mini/account-link/start/route.ts",
];
for(const rel of required)must(exists(rel),`MINI_REQUIRED_FILE_MISSING:${rel}`);

const app=JSON.parse(read("miniapp/app.json"));
const expectedPages=[
  "pages/create/index","pages/tools/index","pages/agents/index","pages/profile/index",
  "pages/web/index","pages/share/index","pages/orders/index","pages/pay/index","pages/balance/index",
];
must(Array.isArray(app.pages),"MINI_PAGES_INVALID");
must(app.pages.length===expectedPages.length,`MINI_PAGE_COUNT_DRIFT:${app.pages.length}`);
for(const p of expectedPages)must(app.pages.includes(p),`MINI_PAGE_MISSING:${p}`);

for(const retired of ["pages/field/index","pages/assessment/index","pages/narrative/index"]){
  must(!app.pages.includes(retired),`RETIRED_PAGE_REGISTERED:${retired}`);
}

must(!exists("miniapp/utils/payment.js"),"RETIRED_PAYMENT_HELPER_RETURNED");
for(const rel of [
  "miniapp/app.js","miniapp/pages/create/index.js","miniapp/pages/tools/index.js",
  "miniapp/pages/agents/index.js","miniapp/pages/profile/index.js","miniapp/pages/web/index.js",
]){
  must(!/utils\/payment|requestPayment\s*\(/.test(read(rel)),`RETIRED_PAYMENT_HELPER_REFERENCED:${rel}`);
}

const api=read("miniapp/utils/api.js");
must(api.includes("path.startsWith('/api/wechat/mini/')"),"MINI_API_PATH_GUARD_MISSING");
must(api.includes("Authorization: `Bearer ${token}`"),"MINI_AUTH_HEADER_MISSING");
must(api.includes("wx.login"),"WX_LOGIN_MISSING");
must(!/AppSecret|WECHAT_MINI_APP_SECRET|service[_-]?role/i.test(api),"CLIENT_SECRET_REFERENCE_FOUND");

for(const rel of ["miniapp/app.js","miniapp/utils/api.js","miniapp/utils/i18n.js","miniapp/utils/share.js"]){
  const t=read(rel);
  must(!/\bsk-[A-Za-z0-9_-]{20,}\b/.test(t),`RAW_KEY_FOUND:${rel}`);
  must(!/-----BEGIN [A-Z ]*PRIVATE KEY-----/.test(t),`PRIVATE_KEY_FOUND:${rel}`);
}

const web=read("miniapp/pages/web/index.js");
must(web.includes("EXACT_ALLOWED"),"WEB_ALLOWLIST_MISSING");
must(web.includes("PREFIX_ALLOWED"),"WEB_PREFIX_ALLOWLIST_MISSING");
must(/startsWith\(\s*['"]\/\/['"]\s*\)/.test(web),"WEB_PROTOCOL_RELATIVE_GUARD_MISSING");
must(/includes\(\s*['"]:\/\/['"]\s*\)/.test(web),"WEB_EXTERNAL_SCHEME_GUARD_MISSING");
must(/segment\s*===\s*['"]\.\.['"]/.test(web),"WEB_TRAVERSAL_GUARD_MISSING");
must(web.includes("currency=${preferredCurrency()}"),"MINI_CURRENCY_WEB_SYNC_MISSING");

const i18n=read("miniapp/utils/i18n.js");
const expectedLangs=["zh-CN","en","ja","ko","fr","de","es","pt","ar"];
for(const lang of expectedLangs){
  must(i18n.includes(`'${lang}'`)||i18n.includes(`"${lang}"`)||i18n.includes(`${lang}:`),`MINI_LANGUAGE_MISSING:${lang}`);
}
must(i18n.includes("SUPPORTED"),"MINI_LANGUAGE_LIST_MISSING");
must(i18n.includes("setLanguage"),"MINI_LANGUAGE_SWITCH_MISSING");

const profile=read("miniapp/pages/profile/index.wxml");
const profileJs=read("miniapp/pages/profile/index.js");
must(profile.includes('bindchange="changeLanguage"'),"MINI_LANGUAGE_PICKER_MISSING");
must(profile.includes('bindchange="changeCurrency"'),"MINI_CURRENCY_PICKER_MISSING");
must(profileJs.includes("CNY")&&profileJs.includes("USD"),"MINI_CURRENCY_OPTIONS_MISSING");

for(const rel of [
  "miniapp/pages/create/index.wxml","miniapp/pages/tools/index.wxml",
  "miniapp/pages/agents/index.wxml","miniapp/pages/profile/index.wxml",
]){
  const t=read(rel);
  must(t.includes("{{copy."),`MINI_I18N_BINDING_MISSING:${rel}`);
  must(!/\b(RPC|Pipeline|Worker|Queue|Inference|Endpoint|Webhook|Object Storage|Runtime)\b/i.test(t),`MINI_ENGINEERING_COPY:${rel}`);
}

const toolsJs=read("miniapp/pages/tools/index.js");
const toolsWxml=read("miniapp/pages/tools/index.wxml");
must(!toolsJs.includes("loadPrices"),"MINI_TOOL_PRICE_PREFETCH_RETURNED");
must(!toolsWxml.includes("item.price"),"MINI_TOOL_LIST_PRICE_RETURNED");
must(toolsWxml.includes("真正执行或导出前"),"MINI_DEFERRED_PRICE_COPY_MISSING");

const shareJs=read("miniapp/pages/share/index.js");
const shareWxml=read("miniapp/pages/share/index.wxml");
must(shareWxml.includes('open-type="share"'),"MINI_SHARE_OPEN_TYPE_MISSING");
must(shareJs.includes("onShareAppMessage"),"MINI_SHARE_APP_MESSAGE_MISSING");
must(shareJs.includes("onShareTimeline"),"MINI_SHARE_TIMELINE_MISSING");
must(!/\/account|\/ai-wallet|\/api\//.test(shareJs)||shareJs.includes("startsWith('/account')"),"MINI_SHARE_PRIVATE_PATH_GUARD_MISSING");
console.log("MINI_NATIVE_SHARE=PASS");

must(profileJs.includes("/api/wechat/mini/account-link/start"),"ACCOUNT_LINK_START_MISSING");
must(profileJs.includes("connectExistingAccount"),"EXPLICIT_ACCOUNT_LINK_ACTION_MISSING");

if(exists("app/api/wechat/mini/pay/create/route.ts")){
  const payCreate=read("app/api/wechat/mini/pay/create/route.ts");
  must(/checkRateLimit/.test(payCreate),"MINI_PAY_CREATE_RATE_LIMIT_MISSING");
  must(/session\.userId|require.*session|Bearer/i.test(payCreate),"MINI_PAY_CREATE_AUTH_REVIEW_REQUIRED");
}
if(exists("app/api/wechat/mini/pay/notify/route.ts")){
  const notify=read("app/api/wechat/mini/pay/notify/route.ts");
  must(/signature|verify|sign/i.test(notify),"MINI_PAY_NOTIFY_SIGNATURE_REVIEW_REQUIRED");
  must(/outTradeNo|provider_payment_id/.test(notify),"MINI_PAY_NOTIFY_ORDER_BINDING_MISSING");
}

must(!exists("miniapp/pages/field/index.js"),"OLD_FIELD_PAGE_RETURNED");

console.log("AUDIT_MINI_PROGRAM=PASS");
console.log("CURRENT_MINI_TOPOLOGY=PASS");
console.log("RETIRED_PAYMENT_HELPER=ABSENT");
console.log("MINI_API_BOUNDARY=PASS");
console.log("MINI_WEBVIEW_ALLOWLIST=PASS");
console.log("MINI_9_LANGUAGE_STRUCTURE=PASS");
console.log("MINI_ACCOUNT_LINK_EXPLICIT=PASS");
console.log("MINI_PAYMENT_SERVER_BOUNDARY=PASS");
console.log("MINI_DEFERRED_PRICING_POLICY=PASS");
console.log("MINI_CURRENCY_SELECTION=PASS");
