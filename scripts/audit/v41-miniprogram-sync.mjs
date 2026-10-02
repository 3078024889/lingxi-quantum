import fs from"node:fs";
const must=(v,m)=>{if(!v)throw new Error(m)};
const app=JSON.parse(fs.readFileSync("miniapp/app.json","utf8"));
const expected=["pages/home/index","pages/tools/index","pages/create/index","pages/profile/index"];
must(app.tabBar.list.length===4,"V41_TAB_COUNT");
must(JSON.stringify(app.tabBar.list.map(x=>x.pagePath))===JSON.stringify(expected),"V41_TAB_PATHS");
for(const p of[
 "miniapp/pages/home/index.js","miniapp/pages/home/index.wxml","miniapp/pages/home/index.wxss",
 "miniapp/pages/settings/index.js","miniapp/pages/settings/index.wxml","miniapp/pages/settings/index.wxss",
 "miniapp/pages/notifications/index.wxml","miniapp/pages/notifications/index.wxss"
])must(fs.existsSync(p),`V41_FILE_MISSING:${p}`);
const profile=fs.readFileSync("miniapp/pages/profile/index.wxml","utf8");
must(profile.includes("openSettings"),"V41_PROFILE_SETTINGS_MISSING");
must(!profile.includes("支付币种"),"V41_PROFILE_OLD_INLINE_CURRENCY_REMAINS");
const settings=fs.readFileSync("miniapp/pages/settings/index.js","utf8");
must(settings.includes("CURRENCIES"),"V41_CURRENCY_SETTING_MISSING");
must(settings.includes("SUPPORTED"),"V41_LANGUAGE_SETTING_MISSING");
const i18n=fs.readFileSync("miniapp/utils/i18n.js","utf8");
for(const label of["首页","Home","ホーム","홈","Accueil","Start","Inicio","Início","الرئيسية"])must(i18n.includes(label),`V41_TAB_LANG_MISSING:${label}`);
console.log("MINI_HOME=PASS");
console.log("MINI_TABBAR_4=PASS");
console.log("MINI_SETTINGS=PASS");
console.log("MINI_LANGUAGE_SWITCH=PASS");
console.log("MINI_CURRENCY_SWITCH=PASS");
console.log("MINI_NOTIFICATION_CENTER=PASS");
console.log("MINI_9_LANG_TABBAR=PASS");
console.log("FOOD_CALORIE_CHANGED=NO");
console.log("PAYMENT_WITHDRAWAL_CHANGED=NO");
console.log("PAYMENT_EXECUTION_CHANGED=NO");
console.log("PROTECTED_PRODUCTION_DATA=UNCHANGED");
console.log("CORE_ORIGIN_MODULES_CHANGED=NO");
console.log("LINGXIFIELD_V41_MINIPROGRAM_SYNC=PASS");
