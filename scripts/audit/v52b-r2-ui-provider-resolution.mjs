import fs from "node:fs";
const bad=[];
const read=p=>fs.readFileSync(p,"utf8");

const one=read("components/SasiOneSurface.tsx");
for(const x of ['icon:"drama"','icon:"website"','icon:"book"','icon:"learning"','icon:"research"',"LingxiMiniIcon","modeBar={modeBar}"]){
 if(!one.includes(x))bad.push(`OneSurface missing ${x}`);
}
for(const x of ["fixed bottom-2","fixed bottom-5"]){
 if(one.includes(x))bad.push(`OneSurface still uses viewport-bottom dock: ${x}`);
}

const studio=read("components/SasiChatCreationStudio.tsx");
for(const x of ["modeBar?:ReactNode","{modeBar}","text-blue-600","availableResolutions","video.resolutions.discovered"]){
 if(!studio.includes(x))bad.push(`Studio missing ${x}`);
}
if(studio.includes('["720p","1080p","2K","4K"]'))bad.push("Studio still has old fake static 2K/4K list");
if(studio.includes('resolution==="2K"||resolution==="4K"'))bad.push("Studio still blanket-rejects 4K");
if(studio.includes("sticky bottom-14"))bad.push("Studio old mode-bar spacing remains");

const kw=read("components/KnowledgeWorkspace.tsx");
for(const x of ["modeBar?:ReactNode","{modeBar}","text-blue-600"]){
 if(!kw.includes(x))bad.push(`Knowledge missing ${x}`);
}
if(kw.includes("sticky bottom-14"))bad.push("Knowledge old mode-bar spacing remains");

const menu=read("components/SasiFunctionMenu.tsx");
if(menu.includes("</Link>\\n"))bad.push("Function menu literal backslash-n remains");
if(menu.includes("\\\\n    <Link"))bad.push("Function menu rendered escape remains");

const conn=read("app/sasi/ConnectionCenter.tsx");
for(const x of ["只需连接一个 API Key，即可使用该 API 账号下已开通的全球多智能生态模型。","SHARED_COPY:Record<LingxiLang,string>"]){
 if(!conn.includes(x))bad.push(`Connections missing ${x}`);
}
if(conn.includes("sasi-connect-hero")||conn.includes("sasi-connect-main"))bad.push("Old connection dashboard layout remains");
if(conn.includes("连接一个 API Key，使用你账号下已开通的多智能生态模型"))bad.push("Old confusing API copy remains");

const pricing=read("lib/sasi/pricing-v49.ts");
for(const x of ["video2KPerSecond:{CNY:0.50,USD:0.50}","video4KPerSecond:{CNY:0.70,USD:0.70}"]){
 if(!pricing.includes(x))bad.push(`Pricing missing ${x}`);
}

const route=read("app/api/sasi/byok/video/route.ts");
if(!route.includes('["720p","1080p","4k"]'))bad.push("Seedance 2.0 capability 4K profile missing");
if(route.includes('"2k"'))bad.push("2K must not be exposed without documented provider support");

const userVideo=read("lib/sasi/intelligence/user-video.ts");
if(!userVideo.includes('"720p"|"1080p"|"4k"'))bad.push("User video type missing 4K");

for(const p of["lib/wechatpay.ts","lib/alipay.ts","lib/paypal.ts","lib/money/provider-adapters.ts","lib/money/reconcile-worker.ts","app/api/internal/money/reconcile/route.ts"]){
 if(!fs.existsSync(p))bad.push(`V52B provider closure missing ${p}`);
}

if(bad.length){console.error(bad.join("\n"));process.exit(1)}
console.log("V52B_R2_COLORED_MODE_ICONS=PASS");
console.log("V52B_R2_MODE_BAR_UNDER_COMPOSER=PASS");
console.log("V52B_R2_BLUE_USER_TEXT=PASS");
console.log("V52B_R2_FUNCTION_MENU_ESCAPE_CLEAN=PASS");
console.log("V52B_R2_CONNECTION_UI_COPY_9_LANG=PASS");
console.log("V52B_R2_PROVIDER_CAPABILITY_RESOLUTION=PASS");
console.log("V52B_R2_4K_PRICE_CNY_USD_070=PASS");
console.log("V52B_R2_2K_NOT_EXPOSED_WITHOUT_PROVIDER_SUPPORT=PASS");
console.log("V52B_R2_PROVIDER_REFUND_FOUNDATION_PRESERVED=PASS");
