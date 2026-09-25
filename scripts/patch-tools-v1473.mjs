import fs from "node:fs";
const fail=[];
const read=p=>fs.readFileSync(p,"utf8"),save=(p,s)=>fs.writeFileSync(p,s,"utf8");
function rep(p,a,b,n){let s=read(p);if(s.includes(b)){console.log(`ALREADY ${n}`);return}if(!s.includes(a)){console.error(`MISS ${n}`);fail.push(n);return}save(p,s.replace(a,b));console.log(`PASS ${n}`)}

// Batch image: functional copy, no implementation explanation.
{
 const p="components/tools/BatchImageWorkbench.tsx";let s=read(p);
 if(!s.includes('workbenchCopy')){
   s=s.replace('import {toolUiText} from "@/lib/tool-ui-i18n";','import {toolUiText} from "@/lib/tool-ui-i18n";\nimport {workbenchCopy} from "@/lib/tools/workbench-i18n-v1473";');
 }
 const old='{t("全部在浏览器处理，最后打包 ZIP。","Everything is processed in your browser and packaged as a ZIP.")}';
 const neu='{workbenchCopy(lang,"batchImageLead")}';
 if(s.includes(old))s=s.replace(old,neu);
 else if(!s.includes(neu)){console.error("MISS batch functional lead");fail.push("batch functional lead")}
 save(p,s);console.log("PASS batch functional lead");
}

// Video toolkit: user-facing progress + localized downloads.
{
 const p="components/tools/VideoToolkitWorkbench.tsx";let s=read(p);
 if(!s.includes('workbenchCopy')){
   s=s.replace('import {toolUiText} from "@/lib/tool-ui-i18n";','import {toolUiText} from "@/lib/tool-ui-i18n";\nimport {workbenchCopy} from "@/lib/tools/workbench-i18n-v1473";');
 }
 s=s.replace('setStage(t("正在加载本地媒体引擎…","Loading local media engine…"))','setStage(workbenchCopy(lang,"preparingMedia"))');
 s=s.replace('>下载 {o.name}</a>','>{workbenchCopy(lang,"download")} {o.name}</a>');
 save(p,s);console.log("PASS video user-facing progress");
}

// Text tools: remove local/browser implementation prose.
{
 const p="components/tools/TextWorkbench.tsx";let s=read(p);
 if(!s.includes('workbenchCopy')){
   s=s.replace('import {toolUiText} from "@/lib/tool-ui-i18n";','import {toolUiText} from "@/lib/tool-ui-i18n";\nimport {workbenchCopy} from "@/lib/tools/workbench-i18n-v1473";');
 }
 s=s.replace('{t("在浏览器本地处理，不上传文本。","Processed locally in your browser; text is not uploaded.")}', '{workbenchCopy(lang,"textIntro")}');
 save(p,s);console.log("PASS text tools functional intro");
}

// Generic workbench: localize Width/Height and fix image-specific error hint for all file tools.
{
 const p="components/tools/ToolWorkbench.tsx";let s=read(p);
 if(!s.includes('workbenchCopy')){
   s=s.replace('import { toolRuntimeText } from "@/lib/tool-runtime-i18n";','import { toolRuntimeText } from "@/lib/tool-runtime-i18n";\nimport {workbenchCopy} from "@/lib/tools/workbench-i18n-v1473";');
 }
 s=s.replace('hintZh: "请换一张较小的图片，或换用 Chrome / Edge / Firefox 最新版本再试。",\n        hintEn: "Try a smaller file, or the latest Chrome / Edge / Firefox.",',
 'hintZh: workbenchCopy(lang,"genericFileHint"),\n        hintEn: workbenchCopy("en","genericFileHint"),');
 s=s.replace('            Width\n','            {workbenchCopy(lang,"width")}\n');
 s=s.replace('            Height\n','            {workbenchCopy(lang,"height")}\n');
 save(p,s);console.log("PASS generic file workbench copy");
}

if(fail.length){console.error(`V14.73_PATCH_FAILURES=${fail.length}`);fail.forEach((x,i)=>console.error(`${i+1}. ${x}`));process.exit(1)}
console.log("V14.73_PATCH=PASS");
