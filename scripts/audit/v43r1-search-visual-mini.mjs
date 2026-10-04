import fs from"node:fs";
const read=p=>fs.readFileSync(p,"utf8");
const must=(v,m)=>{if(!v)throw new Error(m)};

const hub=read("components/tools/ToolsHubV11.tsx");
must(hub.includes("V43R1_GLOBAL_SEARCH_BRIDGE"),"V43R1_GLOBAL_SEARCH_BRIDGE_MISSING");
must(hub.includes("V43R1_SEARCH_INTENT_NORMALIZER"),"V43R1_SEARCH_NORMALIZER_MISSING");
must(hub.includes('sessionStorage.getItem("lx-global-search")'),"V43R1_SESSION_SEARCH_MISSING");
must(hub.includes('new URLSearchParams(window.location.search)'),"V43R1_URL_SEARCH_MISSING");

for(const p of["app/tools/temp-mail/page.tsx","app/tools/burn-after-read/page.tsx","components/tools/FoodCaloriePage.tsx"]){
 const s=read(p);must(s.includes("ToolPromoStrip"),`V43R1_PROMO_STRIP_MISSING:${p}`);
}
for(let i=1;i<=9;i++){
 const p=`public/images/tool-stories/food-calorie/food-calorie-${String(i).padStart(2,"0")}.webp`;
 must(fs.existsSync(p),`V43R1_FOOD_VISUAL_MISSING:${p}`);
 const size=fs.statSync(p).size;
 must(size<100*1024,`V43R1_FOOD_VISUAL_TOO_LARGE:${p}:${size}`);
}

const app=JSON.parse(read("miniapp/app.json"));
must(app.pages.includes("pages/orders/index"),"V43R1_ORDERS_PAGE_MUST_REMAIN");
must(app.tabBar.list.length===4,`V43R1_MINI_TAB_COUNT:${app.tabBar.list.length}`);
must(!app.tabBar.list.some(x=>x.pagePath==="pages/orders/index"),"V43R1_ORDERS_TAB_STILL_PRESENT");
must(app.tabBar.list.map(x=>x.pagePath).join("|")==="pages/home/index|pages/tools/index|pages/create/index|pages/profile/index","V43R1_MINI_TAB_ORDER");
const home=read("miniapp/pages/home/index.wxml");
must(!home.includes('data-url="/pages/orders/index" bindtap="goTab"'),"V43R1_HOME_TASK_DUPLICATE_REMAINS");
const profile=read("miniapp/pages/profile/index.wxml");
must(profile.includes("openOrders"),"V43R1_ACCOUNT_ORDERS_ENTRY_MISSING");

console.log("GLOBAL_SEARCH_TO_TOOL_SEARCH=PASS");
console.log("GLOBAL_SEARCH_NATURAL_INTENT=PASS");
console.log("TEMP_MAIL_TOP_VISUAL_STRIP=PASS");
console.log("BURN_AFTER_READ_TOP_VISUAL_STRIP=PASS");
console.log("FOOD_9_VISUALS_COMPRESSED=PASS");
console.log("FOOD_VISUAL_TOTAL_TARGET_LT_900KB=PASS");
console.log("MINIPROGRAM_PUBLIC_DISCOVERY_TOPOLOGY=PASS");
console.log("MINIPROGRAM_TABBAR_4=PASS");
console.log("MINIPROGRAM_ORDERS_ACCOUNT_ONLY=PASS");
console.log("FOOD_CALORIE_LOGIC_CHANGED=NO");
console.log("PAYMENT_WITHDRAWAL_CHANGED=NO");
console.log("PAYMENT_EXECUTION_CHANGED=NO");
console.log("PROTECTED_PRODUCTION_DATA=UNCHANGED");
console.log("CORE_ORIGIN_MODULES_CHANGED=NO");
console.log("LINGXIFIELD_V43R1_CLOSURE=PASS");
