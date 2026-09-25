import fs from "node:fs";
const f=[];const c=(ok,n)=>{console.log(`${ok?"PASS":"FAIL"} ${n}`);if(!ok)f.push(n)};
const hub=fs.readFileSync("components/tools/ToolsHubV11.tsx","utf8");
const glyph=fs.readFileSync("components/tools/ToolGlyph.tsx","utf8");
const css=fs.readFileSync("app/globals.css","utf8");
const audit=fs.readFileSync("scripts/audit-tools-truth-v14711.mjs","utf8");
const clean=fs.readFileSync("app/api/ai/image-cleanup/route.ts","utf8");
const video=fs.readFileSync("components/tools/VideoWatermarkWorkbench.tsx","utf8");

c(hub.includes('className="lx-tool-card-arrow"'),"card uses light arrow");
c(!hub.includes('<div className="lx11-tool-meta"><b>{toolHubCopy(lang,"open")}</b></div>'),"repeated open removed");
c(glyph.includes('utility: { icon: "✦"'),"utility glyph is light");
c(glyph.includes('document: { icon: "▤"'),"document glyph is light");
c(css.includes("/* V14.71.1 compact living tools */"),"compact style installed");
c(css.includes("min-height:0!important"),"old oversized card height overridden");
c(css.includes("grid-template-columns:42px minmax(0,1fr)"),"compact horizontal card");
c(audit.includes('app","tools","[slug]","page.tsx'),"audit recognizes dynamic route");
c(audit.includes("registryBacked&&hasDynamic"),"registry tools accepted through dynamic route");
c(clean.includes('OPENAI_IMAGE_EDIT_MODEL||"gpt-image-2"'),"image model fixed");
c(video.includes("const w=item.width,h=item.height"),"video batch coordinates fixed");

if(f.length){
 console.error(`V14.71.1_ACCEPT_FAILURES=${f.length}`);
 f.forEach((x,i)=>console.error(`${i+1}. ${x}`));
 process.exit(1);
}
console.log("V14.71.1_ACCEPT=PASS");
