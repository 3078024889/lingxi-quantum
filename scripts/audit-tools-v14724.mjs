import fs from "node:fs";
const fail=[];
const c=(ok,n)=>{console.log(`${ok?"PASS":"FAIL"} ${n}`);if(!ok)fail.push(n)};
const hub=fs.readFileSync("components/tools/ToolsHubV11.tsx","utf8");
const glyph=fs.readFileSync("components/tools/ToolGlyph.tsx","utf8");
const css=fs.readFileSync("app/globals.css","utf8");
const copy=fs.readFileSync("lib/tools/hub-copy-v1470.ts","utf8");
const dynamic=fs.readFileSync("app/tools/[slug]/page.tsx","utf8");
const shell=fs.readFileSync("components/tools/ToolShell.tsx","utf8");
const paid=fs.readFileSync("components/tools/PaidActionButton.tsx","utf8");
const pay=fs.readFileSync("app/tools/pay/page.tsx","utf8");
const image=fs.readFileSync("components/tools/ImageWatermarkWorkbench.tsx","utf8");
const dubbing=fs.readFileSync("components/tools/VideoDubbingWorkbench.tsx","utf8");

c(hub.includes('toolHubCopy(lang,"subtitle")'),"hero function line restored");
c(hub.includes("toolCardLine(lang,slug"),"every card gets functional line");
c(hub.includes('slug={slug}'),"glyph palette varies by tool");
{
 const hs=copy.indexOf("const HUB={"), he=copy.indexOf("const SUMMARY:",hs);
 const hb=hs>=0&&he>hs?copy.slice(hs,he):"";
 c(hb.includes("subtitle:L("),"hero subtitle is inside HUB object");
 c(copy.includes("key:keyof typeof HUB"),"toolHubCopy key derives from HUB");
}
c(copy.includes("export const toolCardLine="),"card function fallback exists");
c(glyph.includes("function palette(slug:string)"),"small icon colors vary by tool");
c(!glyph.includes('icon: "▤"'),"heavy file glyph removed");
c(css.includes("/* V14.72.1 dense living tool cards */"),"dense card layout installed");
c(css.includes("height:84px!important"),"desktop cards are compact");
c(css.includes("background:transparent!important"),"old vertical icon rail neutralized");

c(!dynamic.includes("Canvas / Web Crypto"),"dynamic detail page removes implementation details");
c(!dynamic.includes("文件会上传到服务器吗"),"dynamic detail FAQ removes upload question");
c(!dynamic.includes("Are files uploaded to the server?"),"dynamic detail FAQ removes English upload question");
c(!dynamic.includes("本批已上线工具默认全部在浏览器本地处理"),"dynamic detail FAQ removes local/server implementation answer");
c(!shell.includes("<PrivacyBadge"),"detail page removes repeated privacy badge");
c(!shell.includes("简短技术说明"),"detail page removes technical-note UI");
c(!shell.includes('t("隐私说明","Privacy")'),"detail page removes repeated privacy essay");

c(paid.includes("amount_usd:number"),"paid quote carries USD");
c(paid.includes("${quote.amount_usd} USD"),"paid quote previews USD");
c(!paid.includes("价格已由服务器计算"),"paid quote removes server wording");
c(!pay.includes("{q.tool_id}"),"payment page hides tool id");
c(!image.includes("OPENAI_API_KEY"),"image tool hides provider key");
c(!image.includes("调用图像编辑模型"),"image tool hides model wording");
c(!dubbing.includes("ELEVENLABS_API_KEY"),"dubbing hides provider key");
c(!dubbing.includes("ElevenLabs 当前"),"dubbing hides provider name pricing");
c(!dubbing.includes("{projectId&&<span"),"dubbing hides raw project id");

if(fail.length){
 console.error(`V14.72.4_AUDIT_FAILURES=${fail.length}`);
 fail.forEach((x,i)=>console.error(`${i+1}. ${x}`));
 process.exit(1);
}
console.log("V14.72.4_AUDIT=PASS");
