import fs from "node:fs";

const css=fs.readFileSync("app/v40-mobile.css","utf8");
const nav=fs.readFileSync("components/MobileBottomNav.tsx","utf8");
const app=JSON.parse(fs.readFileSync("miniapp/app.json","utf8"));
const must=(c,m)=>{if(!c)throw new Error(m)};

must(css.includes("grid-template-columns:repeat(4,minmax(0,1fr))"),"V65_WEB_NAV_NOT_FOUR_EQUAL_COLUMNS");
must(!css.includes("grid-template-columns:repeat(5,1fr)"),"V65_STALE_FIVE_COLUMN_NAV_PRESENT");
must(css.includes("column-gap:4px"),"V65_NAV_GAP_MISSING");
must(css.includes("padding:5px 6px"),"V65_NAV_INNER_PADDING_MISSING");
must(css.includes("border-radius:15px"),"V65_ITEM_RADIUS_MISSING");
must(css.includes("-webkit-tap-highlight-color:transparent"),"V65_TOUCH_POLISH_MISSING");
must((nav.match(/\{href:/g)||[]).length===4,"V65_WEB_NAV_ITEM_COUNT_NOT_4");
must(app.tabBar.list.length===4,"V65_NATIVE_TABBAR_ITEM_COUNT_NOT_4");

const nativePaths=app.tabBar.list.map(x=>x.pagePath).join("|");
must(nativePaths==="pages/home/index|pages/tools/index|pages/create/index|pages/profile/index","V65_NATIVE_TABBAR_ORDER_DRIFT");

console.log("V65_WEB_NAV_FOUR_EQUAL_COLUMNS=PASS");
console.log("V65_NATIVE_TABBAR_FOUR_ITEMS=PASS");
console.log("V65_NAV_SAFE_SPACING=PASS");
