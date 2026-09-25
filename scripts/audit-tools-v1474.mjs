import fs from "node:fs";
const fail=[];const c=(ok,n)=>{console.log(`${ok?"PASS":"FAIL"} ${n}`);if(!ok)fail.push(n)};
const hub=fs.readFileSync("components/tools/ToolsHubV11.tsx","utf8");
const glyph=fs.readFileSync("components/tools/ToolGlyph.tsx","utf8");
const shell=fs.readFileSync("components/tools/ToolShell.tsx","utf8");
const css=fs.readFileSync("app/globals.css","utf8");
const copy=fs.readFileSync("lib/tools/hub-copy-v1470.ts","utf8");
const sc=fs.readFileSync("lib/tool-shell-i18n.ts","utf8");
c(hub.includes("lx-tool-kind-"),"category pills present");
c(glyph.includes('"food-calorie":"🥗"')&&glyph.includes('"video-watermark-remover":"🎥"')&&glyph.includes('"temp-mail":"📬"'),"vivid emoji mappings present");
c(css.includes('font-family:"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji"'),"color emoji font stack present");
c(css.includes("height:auto!important")&&css.includes("min-height:158px!important"),"blank fixed-height cards neutralized");
c(css.includes("-webkit-line-clamp:unset!important"),"descriptions can fully wrap");
c(css.includes("font-size:17px!important")&&css.includes("font-size:14px!important"),"tool typography enlarged");
c(shell.includes('href="/tools"')&&shell.includes("lx-tool-back"),"detail back button present");
c(sc.includes('"返回实用工具"'),"back button 9-language key present");
c(copy.includes('.replace(/\\s{2,}/g," ")'),"summary whitespace regex fixed");
if(fail.length){console.error(`V14.74_AUDIT_FAILURES=${fail.length}`);fail.forEach((x,i)=>console.error(`${i+1}. ${x}`));process.exit(1)}
console.log("V14.74_VISUAL_AUDIT=PASS");
