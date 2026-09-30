import fs from"node:fs";
const f=fs.readFileSync("components/tools/AdvancedToolPage.tsx","utf8"),r=fs.readFileSync("lib/tools/experience-registry.ts","utf8");
if(/ToolPriceHint/.test(f))throw new Error("LANDING_PRICE_COMPONENT_STILL_PRESENT");
if(!f.includes("var(--lx-bg)")||!f.includes("var(--lx-panel)"))throw new Error("THEME_TOKENS_MISSING");
for(const id of["food-calorie","pdf-editor","ocr","image-watermark-remover","video-toolkit","video-transcription","temp-mail"])if(!r.includes(`"${id}":`))throw new Error("REGISTRY_MISSING:"+id);
console.log("TOOL_LANDING_PRICE_HIDDEN=PASS");console.log("THEME_TOKEN_SHELL=PASS");console.log("PROGRESSIVE_DISCLOSURE_REGISTRY=PASS");console.log("V19_SHARED_EXPERIENCE_VERIFY=PASS");
