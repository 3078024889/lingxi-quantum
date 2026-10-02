import fs from "node:fs";
import path from "node:path";

const root=process.cwd();
const read=r=>fs.readFileSync(path.join(root,r),"utf8");
const exists=r=>fs.existsSync(path.join(root,r));
const must=(ok,code)=>{if(!ok)throw new Error(code)};

const required=[
 "miniapp/app.js",
 "miniapp/app.json",
 "miniapp/utils/api.js",
 "miniapp/utils/i18n.js",
 "miniapp/utils/share.js",
 "miniapp/pages/home/index.js",
 "miniapp/pages/create/index.js",
 "miniapp/pages/tools/index.js",
 "miniapp/pages/agents/index.js",
 "miniapp/pages/profile/index.js",
 "miniapp/pages/settings/index.js",
 "miniapp/pages/web/index.js",
 "miniapp/pages/share/index.js",
 "miniapp/pages/orders/index.js",
 "miniapp/pages/pay/index.js",
 "miniapp/pages/balance/index.js",
 "miniapp/pages/notifications/index.js",
 "app/api/wechat/mini/login/route.ts",
 "app/api/wechat/mini/logout/route.ts",
 "app/api/wechat/mini/account-link/start/route.ts"
];
for(const r of required)must(exists(r),`MINI_REQUIRED_FILE_MISSING:${r}`);

const app=JSON.parse(read("miniapp/app.json"));
const expected=[
 "pages/home/index",
 "pages/create/index",
 "pages/tools/index",
 "pages/agents/index",
 "pages/profile/index",
 "pages/settings/index",
 "pages/web/index",
 "pages/share/index",
 "pages/pay/index",
 "pages/orders/index",
 "pages/balance/index",
 "pages/notifications/index"
];

must(Array.isArray(app.pages),"MINI_PAGES_INVALID");
must(app.pages.length===expected.length,`MINI_PAGE_COUNT_DRIFT:${app.pages.length}`);
for(const p of expected)must(app.pages.includes(p),`MINI_PAGE_MISSING:${p}`);
for(const p of["pages/field/index","pages/assessment/index","pages/narrative/index"])must(!app.pages.includes(p),`RETIRED_PAGE_REGISTERED:${p}`);

must(app.tabBar && Array.isArray(app.tabBar.list),"MINI_TABBAR_INVALID");
const tabExpected=["pages/home/index","pages/tools/index","pages/create/index","pages/profile/index"];
must(app.tabBar.list.length===tabExpected.length,`MINI_TABBAR_COUNT_DRIFT:${app.tabBar.list.length}`);
for(let i=0;i<tabExpected.length;i++)must(app.tabBar.list[i]?.pagePath===tabExpected[i],`MINI_TABBAR_PATH_DRIFT:${i}`);

const api=read("miniapp/utils/api.js");
must(api.includes("path.startsWith('/api/wechat/mini/')"),"MINI_API_PATH_GUARD_MISSING");
must(api.includes("Authorization: `Bearer ${token}`"),"MINI_AUTH_HEADER_MISSING");
must(api.includes("wx.login"),"WX_LOGIN_MISSING");
must(!/AppSecret|WECHAT_MINI_APP_SECRET|service[_-]?role/i.test(api),"CLIENT_SECRET_REFERENCE_FOUND");

const i18n=read("miniapp/utils/i18n.js");
for(const l of["zh-CN","en","ja","ko","fr","de","es","pt","ar"])
 must(i18n.includes(`'${l}'`)||i18n.includes(`"${l}"`)||i18n.includes(`${l}:`),`MINI_LANGUAGE_MISSING:${l}`);

const web=read("miniapp/pages/web/index.js");
must(web.includes("EXACT_ALLOWED")&&web.includes("PREFIX_ALLOWED"),"MINI_WEB_ALLOWLIST_MISSING");
must(web.includes("currency=${preferredCurrency()}"),"MINI_CURRENCY_WEB_SYNC_MISSING");

console.log("AUDIT_MINI_PROGRAM=PASS");
console.log("CURRENT_MINI_TOPOLOGY=12_PAGES_PASS");
console.log("MINI_TABBAR_4=PASS");
console.log("MINI_9_LANGUAGE_STRUCTURE=PASS");
console.log("MINI_API_BOUNDARY=PASS");
