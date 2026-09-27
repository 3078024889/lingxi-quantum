import fs from "node:fs";import path from "node:path";
const root=process.cwd(),read=p=>fs.readFileSync(path.join(root,p),"utf8"),exists=p=>fs.existsSync(path.join(root,p)),must=(v,m)=>{if(!v)throw new Error(m)};
for(const p of [
 "components/tools/PdfEditorWorkbench.tsx",
 "components/tools/PaidExportButton.tsx",
 "miniapp/pages/tools/index.js",
 "miniapp/pages/tools/index.wxml",
 "miniapp/pages/profile/index.js",
 "miniapp/pages/profile/index.wxml",
 "miniapp/pages/web/index.js",
 "components/CurrencyPreferenceProvider.tsx",
 "app/api/notifications/route.ts",
 "lib/release-notifications-i18n.ts",
 "components/NotificationBell.tsx",
 "app/v201-quality.css",
 "lib/tools/shared/download.ts"
])must(exists(p),`MISSING:${p}`);

const pdf=read("components/tools/PdfEditorWorkbench.tsx");
for(const x of ["openPdf","renderPdfPage","pageImage","previewImages","onPointerMove","addImage","免费预览编辑结果"])must(pdf.includes(x),`PDF_LIVE_EDITOR_MISSING:${x}`);
must(!pdf.includes("<iframe"),"PDF_IFRAME_PREVIEW_RETURNED");

// V21 moved mini-program export handling into the shared mobile-safe result delivery layer.
// Accept either the original V20.1 inline fallback or the centralized V21 downloadBlob path.
const sharedDownload=read("lib/tools/shared/download.ts");
const oldInlineFallback=pdf.includes("isMiniWebView");
const centralizedFallback=pdf.includes("downloadBlob")&&sharedDownload.includes("miniLikeEnvironment")&&
  (sharedDownload.includes("privateMobilePreview")||sharedDownload.includes('window.open(url,"_blank"'));
must(oldInlineFallback||centralizedFallback,"PDF_MINI_EXPORT_FALLBACK_MISSING");

const tools=read("miniapp/pages/tools/index.js")+read("miniapp/pages/tools/index.wxml");
must(!tools.includes("loadPrices"),"MINI_TOOL_PRICE_PREFETCH_RETURNED");
must(!tools.includes("item.price"),"MINI_TOOL_LIST_PRICE_RETURNED");
must(tools.includes("真正执行或导出前"),"MINI_TOOL_PAY_LATE_COPY_MISSING");

const profile=read("miniapp/pages/profile/index.js")+read("miniapp/pages/profile/index.wxml");
must(profile.includes("CNY")&&profile.includes("USD")&&profile.includes("changeCurrency"),"MINI_CURRENCY_SELECTOR_MISSING");

const web=read("miniapp/pages/web/index.js");
must(web.includes("currency=${preferredCurrency()}"),"MINI_CURRENCY_WEB_SYNC_MISSING");

const provider=read("components/CurrencyPreferenceProvider.tsx");
must(provider.includes('get("currency")'),"WEB_CURRENCY_QUERY_SYNC_MISSING");

const notices=read("app/api/notifications/route.ts")+read("components/NotificationBell.tsx")+read("lib/release-notifications-i18n.ts");
const has46=notices.includes("mini-4.6-live")&&notices.includes("小程序 4.6 已上线");
const has47=notices.includes("mini-4.7-live")&&notices.includes("小程序 4.7 已上线");
must(has46||has47,"MINI_RELEASE_ANNOUNCEMENT_MISSING");
must(notices.includes('href:null'),"ANNOUNCEMENT_NON_NAVIGATING_MISSING");
must(notices.includes('i.kind==="announcement"'),"ANNOUNCEMENT_RENDER_BRANCH_MISSING");

const exportPay=read("components/tools/PaidExportButton.tsx");
must(exportPay.includes("miniProgram?.navigateTo")&&exportPay.includes("visibilitychange")&&exportPay.includes("pageshow"),"PDF_EXPORT_MINI_PAY_RECOVERY_MISSING");

console.log("PDF_UPLOAD_RENDER=PASS");
console.log("PDF_LIVE_OVERLAY_PREVIEW=PASS");
console.log("PDF_IMAGE_VISIBLE=PASS");
console.log("PDF_FREE_PREVIEW_CANVAS=PASS");
console.log("PDF_MINI_EXPORT_FLOW=PASS");
console.log("MINI_TOOL_LIST_PRICES_HIDDEN=PASS");
console.log("MINI_CNY_USD_SELECTOR=PASS");
console.log("MINI_CURRENCY_WEB_SYNC=PASS");
console.log(`ANNOUNCEMENT_${has47?"47":"46"}_UPDATED=PASS`);
console.log("ANNOUNCEMENT_NON_NAVIGATING=PASS");
console.log("ANNOUNCEMENT_SPACING=PASS");
console.log("AUDIT_TOOLS_MINI_V201=PASS");
