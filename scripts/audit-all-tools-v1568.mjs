import fs from "node:fs";import path from "node:path";
const repo=process.cwd(),assert=(v,m)=>{if(!v)throw new Error(m)},read=p=>fs.readFileSync(path.join(repo,p),"utf8");
const walk=(d,o=[])=>{if(!fs.existsSync(d))return o;for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);if(e.isDirectory())walk(p,o);else o.push(p)}return o};
const pages=walk(path.join(repo,"app/tools")).filter(p=>/[\\/]page\.tsx$/.test(p));
const work=walk(path.join(repo,"components/tools")).filter(p=>/\.(tsx|ts)$/.test(p));
assert(pages.length>=25,`TOOL_PAGE_COUNT_SUSPICIOUS ${pages.length}`);
assert(work.length>=25,`WORKBENCH_COUNT_SUSPICIOUS ${work.length}`);

const legacy=[];for(const f of work){const c=fs.readFileSync(f,"utf8");if(/<a\b[^>]*\bdownload(?:=|\s|>)/.test(c))legacy.push(path.relative(repo,f).replaceAll("\\","/"))}
assert(legacy.length===0,`LEGACY_DOWNLOAD_ANCHORS_REMAIN\n${legacy.join("\n")}`);

const video=read("components/tools/VideoToolkitWorkbench.tsx");
assert(video.includes("<ResultPanel"),"VIDEO_RESULT_PANEL_MISSING");
assert(!video.includes("URL.createObjectURL"),"VIDEO_BLOB_ANCHOR_REMAINS");

const dl=read("lib/tools/shared/download.ts");
assert(dl.includes("nav.share"),"MINI_SHARE_FALLBACK_MISSING");
assert(dl.includes('window.open(url, "_blank"'),"MINI_PREVIEW_FALLBACK_MISSING");

const result=read("components/tools/ResultPanel.tsx");
assert(result.includes("await downloadBlob"),"RESULT_PANEL_ASYNC_SAVE_MISSING");

const ui=[...walk(path.join(repo,"app")).filter(p=>p.endsWith(".tsx")),...walk(path.join(repo,"components")).filter(p=>p.endsWith(".tsx"))];
const dual=[];for(const f of ui){const c=fs.readFileSync(f,"utf8");if(c.includes("付款页会显示人民币与美元价格")||c.includes("payment page shows CNY and USD prices")||/¥[^\\n]{0,80}\\$/.test(c)&&c.includes("priceRmb")&&c.includes("priceUsd"))dual.push(path.relative(repo,f).replaceAll("\\","/"))}
assert(dual.length===0,`DUAL_CURRENCY_USER_COPY_REMAINS\n${dual.join("\n")}`);

const paid=read("components/tools/PaidActionButton.tsx");
assert(paid.includes("display_currency"),"SINGLE_CURRENCY_TOOL_UI_MISSING");
assert(paid.includes("usePreferredCurrency"),"GLOBAL_TOOL_CURRENCY_MISSING");

const pay=read("app/tools/pay/page.tsx");
assert(pay.includes("q.currency"),"LOCKED_CURRENCY_PAYMENT_PAGE_MISSING");
assert(pay.includes('provider!=="paypal"'),"PAYPAL_CURRENCY_GUARD_MISSING");

assert(read("app/api/ai/food-analyze/route.ts").includes("FOOD_ANALYSIS_FAILED"),"FOOD_ERROR_MAPPING_MISSING");
assert(read("lib/tools/qwen-vision.ts").includes("dashscope-intl.aliyuncs.com"),"FOOD_INTL_FALLBACK_MISSING");

const mini=read("miniapp/pages/tools/index.js");
assert(mini.includes("/tools/food-calorie"),"MINI_FOOD_ENTRY_MISSING");
assert(read("miniapp/pages/web/index.js").includes("'/tools/'"),"MINI_TOOLS_ALLOWLIST_MISSING");

console.log(`TOOL_PAGES_SCANNED=${pages.length}`);
console.log(`TOOL_WORKBENCH_FILES_SCANNED=${work.length}`);
console.log("DOWNLOAD_PATH_AUDIT=PASS");
console.log("SINGLE_CURRENCY_UI_AUDIT=PASS");
console.log("FOOD_CALORIE_RUNTIME_AUDIT=PASS");
console.log("MINIAPP_TOOL_ENTRY_AUDIT=PASS");
console.log("ALL_TOOLS_PRELAUNCH_AUDIT=PASS");
