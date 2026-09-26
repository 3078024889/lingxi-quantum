import fs from "node:fs";import path from "node:path";
const root=process.cwd(),bad=[];const must=(v,m)=>{if(!v)bad.push(m)};
const r=p=>fs.readFileSync(path.join(root,p),"utf8");
const es=r("app/tools/e-sign-pdf/page.tsx");
for(const k of ["PDF电子签名","电子签章","PDF盖章","骑缝章","buildToolMetadata"])must(es.includes(k),`E_SIGN_SEO_MISSING:${k}`);
const hub=r("components/tools/ToolsHubV11.tsx");for(const k of ["电子签章","PDF盖章","骑缝章"])must(hub.includes(k),`TOOLS_HUB_SEARCH_SYNONYM_MISSING:${k}`);
const sitemap=r("app/sitemap.ts");must(sitemap.includes("/tools/e-sign-pdf"),"SITEMAP_ESIGN_MISSING");
const robots=r("app/robots.ts");must(robots.includes("Baiduspider"),"BAIDU_ROBOT_MISSING");must(robots.includes("Googlebot"),"GOOGLEBOT_MISSING");must(robots.includes("Bingbot"),"BINGBOT_MISSING");
const config=r("next.config.js");for(const x of ["/tools/pdf-sign","/tools/electronic-signature","/tools/electronic-seal","/tools/pdf-stamp"])must(config.includes(x),`SEO_ALIAS_MISSING:${x}`);
const paid=r("components/tools/PaidActionButton.tsx");must(paid.includes("preferSameTabPayment"),"WEBVIEW_PAYMENT_FALLBACK_MISSING");must(paid.includes("returnTo"),"PAYMENT_RETURN_PATH_MISSING");
const pay=r("app/tools/pay/page.tsx");must(pay.includes("safeReturn"),"PAYMENT_SAFE_RETURN_MISSING");
const dl=r("lib/tools/shared/download.ts");for(const x of ["MicroMessenger","baiduboxapp","BytedanceWebview","XiaoHongShu"])must(dl.includes(x),`WEBVIEW_DOWNLOAD_UA_MISSING:${x}`);
const ad=r("components/AdSenseLoader.tsx");must(ad.includes("releasecheck"),"DIAGNOSTIC_AD_SKIP_MISSING");
const layout=r("app/layout.tsx");must(!layout.includes("fonts.googleapis.com"),"GOOGLE_FONT_RUNTIME_DEPENDENCY_REMAINS");
const manifest=r("public/manifest.webmanifest");must(!manifest.includes("场域体验"),"LEGACY_MANIFEST_COPY");
if(bad.length){console.error(bad.join("\n"));process.exit(2)}
console.log("SEARCH_DISCOVERY=PASS");console.log("E_SIGN_KEYWORD_COVERAGE=PASS");console.log("WEBVIEW_PAYMENT_FALLBACK=PASS");console.log("WEBVIEW_DOWNLOAD_FALLBACK=PASS");console.log("CHINA_FONT_DEPENDENCY=REMOVED");console.log("GLOBAL_SEARCH_BOTS=PASS");
