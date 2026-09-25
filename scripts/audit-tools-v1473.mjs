import fs from "node:fs";
const fail=[];
const c=(ok,n)=>{console.log(`${ok?"PASS":"FAIL"} ${n}`);if(!ok)fail.push(n)};
const sub=fs.readFileSync("components/tools/SubtitleWorkbench.tsx","utf8");
const remote=fs.readFileSync("components/tools/RemoteMediaImporter.tsx","utf8");
const batch=fs.readFileSync("components/tools/BatchImageWorkbench.tsx","utf8");
const video=fs.readFileSync("components/tools/VideoToolkitWorkbench.tsx","utf8");
const text=fs.readFileSync("components/tools/TextWorkbench.tsx","utf8");
const generic=fs.readFileSync("components/tools/ToolWorkbench.tsx","utf8");
const copy=fs.readFileSync("lib/tools/workbench-i18n-v1473.ts","utf8");

c(sub.includes('.vtt,text/plain,text/vtt'),"subtitle accepts VTT");
c(sub.includes('replace(/^WEBVTT'),"subtitle parses VTT header");
c(sub.includes('workbenchCopy(lang'),"subtitle uses 9-language copy");
c(!sub.includes("<b>Load SRT</b>"),"subtitle hardcoded English removed");
c(!sub.includes("Or paste subtitles below."),"subtitle English helper removed");

c(remote.includes('workbenchCopy(lang'),"remote importer uses 9-language copy");
c(!remote.includes("Cookie"),"remote importer hides implementation/cookie wording");
c(!remote.includes("自动跟随短链并读取页面公开提供的播放媒体"),"remote importer hides resolver implementation wording");

c(batch.includes('workbenchCopy(lang,"batchImageLead")'),"batch image uses functional copy");
c(!batch.includes("全部在浏览器处理"),"batch image implementation prose removed");
c(video.includes('workbenchCopy(lang,"preparingMedia")'),"video progress is user-facing");
c(!video.includes("本地媒体引擎"),"video engine wording removed");
c(text.includes('workbenchCopy(lang,"textIntro")'),"text tools use functional intro");
c(!text.includes("在浏览器本地处理，不上传文本"),"text implementation prose removed");
c(generic.includes('workbenchCopy(lang,"width")'),"width localized");
c(generic.includes('workbenchCopy(lang,"height")'),"height localized");
c(generic.includes('workbenchCopy(lang,"genericFileHint")'),"generic file error hint fixed");

for(const lang of ["zh","en","ja","ko","fr","de","es","pt","ar"])c(copy.includes(`${lang}:`),`copy includes ${lang}`);

if(fail.length){console.error(`V14.73_AUDIT_FAILURES=${fail.length}`);fail.forEach((x,i)=>console.error(`${i+1}. ${x}`));process.exit(1)}
console.log("V14.73_TOOL_I18N_RUNTIME_AUDIT=PASS");
