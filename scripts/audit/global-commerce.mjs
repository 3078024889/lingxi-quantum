import fs from"node:fs";import path from"node:path";
function must(v,m){if(!v)throw new Error(m)}
const policy=JSON.parse(fs.readFileSync("lib/tools/commerce/pricing-policy.json","utf8"));
must(policy.grossMarginFloor===0.45,"GROSS_MARGIN_FLOOR_DRIFT");
must(policy.tools["image-watermark-remover"].CNY.unit===0.6&&policy.tools["image-watermark-remover"].USD.unit===0.6,"IMAGE_WATERMARK_PRICE_DRIFT");
must(policy.tools["batch-image-watermark-remover"].CNY.unit===0.5&&policy.tools["batch-image-watermark-remover"].USD.unit===0.5,"BATCH_WATERMARK_PRICE_DRIFT");
must(policy.tools["video-watermark-remover"].CNY.perMinute===1.5&&policy.tools["video-watermark-remover"].USD.perMinute===1.5,"VIDEO_WATERMARK_PRICE_DRIFT");
must(policy.tools["video-dubbing"].CNY.perStartedMinute===1&&policy.tools["video-dubbing"].USD.perStartedMinute===1,"VIDEO_DUBBING_BASIC_PRICE_DRIFT");
must(policy.tools["video-dubbing"].mode==="disabled-quality-gate","VIDEO_DUBBING_BASIC_GATE_DRIFT");
must(policy.tools["video-dubbing-premium"].CNY.perMinute===3&&policy.tools["video-dubbing-premium"].USD.perMinute===3,"VIDEO_DUBBING_PREMIUM_PRICE_DRIFT");
must(policy.tools["video-dubbing-premium"].mode==="reserved-disabled","VIDEO_DUBBING_PREMIUM_GATE_DRIFT");
must(policy.tools["sasi-video-generate"].CNY["720pPublicPerSecond"]===0.2,"SASI_CNY_720_PRICE_DRIFT");
must(policy.tools["sasi-video-generate"].USD["720pPublicPerSecond"]===0.2,"SASI_USD_720_PRICE_DRIFT");
must(policy.tools["sasi-video-generate"].CNY["1080pPublicPerSecond"]===0.3,"SASI_CNY_1080_PRICE_DRIFT");
must(policy.tools["sasi-video-generate"].USD["1080pPublicPerSecond"]===0.3,"SASI_USD_1080_PRICE_DRIFT");
must(JSON.stringify(policy.tools["sasi-video-generate"].supportedResolutions)==='["720p","1080p"]',"SASI_RESOLUTION_POLICY_DRIFT");
must(policy.tools["sasi-video-generate"].unsupportedResolutions.includes("480p"),"SASI_480_NOT_EXCLUDED");

const pricingV49=fs.readFileSync("lib/sasi/pricing-v49.ts","utf8");
must(pricingV49.includes("websiteFirstPage:{CNY:6,USD:6}"),"WEBSITE_FIRST_PAGE_PRICE_DRIFT");
must(pricingV49.includes("websiteAdditionalPage:{CNY:2,USD:2}"),"WEBSITE_ADDITIONAL_PAGE_PRICE_DRIFT");
must(pricingV49.includes("video720PerSecond:{CNY:0.20,USD:0.20}"),"V49_VIDEO_720_DRIFT");
must(pricingV49.includes("video1080PerSecond:{CNY:0.30,USD:0.30}"),"V49_VIDEO_1080_DRIFT");

const kernel=fs.readFileSync("lib/tools/commerce/pricing-kernel.ts","utf8");
must(kernel.includes("totalCost/(1-margin)"),"MARGIN_FORMULA_WRONG");
must(kernel.includes("ownConnectionPlatformPrice"),"OWN_CONNECTION_PLATFORM_FEE_MISSING");
must(kernel.includes("sasiVideoRetail"),"SASI_DYNAMIC_ROUTER_MISSING");

const source=[];
for(const root of ["components","app"]){
 const walk=d=>{for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);if(e.isDirectory())walk(p);else if(/\.(ts|tsx)$/.test(e.name))source.push(fs.readFileSync(p,"utf8"))}};walk(root);
}
const joined=source.join("\n");const ids=new Set;
for(const m of joined.matchAll(/(?:PaidActionButton|PaidExportButton)[\s\S]{0,500}?toolId\s*=\s*(?:\{[^}]*\?\s*["']([^"']+)["']\s*:\s*["']([^"']+)["']\}|["']([^"']+)["'])/g)){for(const x of [m[1],m[2],m[3]])if(x)ids.add(x)}
const publicPaid=fs.readFileSync("lib/tools/paid-catalog.ts","utf8");
for(const id of ids)must(publicPaid.includes(`"${id}"`),`PAID_UI_NOT_IN_PUBLIC_PAID_CATALOG:${id}`);
const readiness=fs.readFileSync("lib/tools/service-readiness.ts","utf8");
must(!readiness.includes('DUBBED_VIDEO_EXPORT_NOT_IMPLEMENTED'),"PAID_DUBBING_STILL_BLOCKED_AS_UNIMPLEMENTED");

console.log(`PAID_UI_TOOL_IDS=${ids.size}`);
console.log("ALL_PAID_UI_TOOLS_CATALOGUED=PASS");
console.log("VIDEO_DUBBING_BASIC=1_PER_STARTED_MINUTE_DISABLED_GATE");
console.log("VIDEO_DUBBING_PREMIUM=3_PER_MINUTE_RESERVED_DISABLED");
console.log("WEBSITE_FIRST_PAGE=6");
console.log("WEBSITE_ADDITIONAL_PAGE=2");
console.log("SASI_VIDEO_720P=0.20_PER_SECOND");
console.log("SASI_VIDEO_1080P=0.30_PER_SECOND");
console.log("OWN_CONNECTION_PLATFORM_FEE=PASS");
console.log("GROSS_MARGIN_FLOOR=45_PERCENT");
console.log("CNY_USD_NUMERIC_PARITY=PASS");
console.log("GLOBAL_COMMERCE_AUDIT=PASS");
