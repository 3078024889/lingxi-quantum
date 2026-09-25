import fs from "node:fs";
import path from "node:path";
const repo=process.argv[2]||process.cwd();
const toolsDir=path.join(repo,"app","tools");
const pages=[];
for(const ent of fs.readdirSync(toolsDir,{withFileTypes:true})){
 if(!ent.isDirectory())continue;
 const page=path.join(toolsDir,ent.name,"page.tsx");
 if(!fs.existsSync(page))continue;
 const s=fs.readFileSync(page,"utf8");
 pages.push({route:`/tools/${ent.name}`,nav:s.includes("@/components/Nav"),footer:s.includes("@/components/Footer"),advanced:s.includes("AdvancedToolPage")});
}
const chrome=pages.filter(x=>x.nav||x.footer);
const components=["FoodCalorieWorkbench","IdPhotoAiWorkbench","ImageConvertWorkbench","HeicWorkbench","OcrWorkbench","PrivacyCleanerWorkbench","QrSafeReader","TranscriptionWorkbench","SubtitleTranslateWorkbench","VideoToolkitWorkbench","VideoWatermarkWorkbench"];
const capabilities=components.map(name=>{const p=path.join(repo,"components","tools",`${name}.tsx`),s=fs.existsSync(p)?fs.readFileSync(p,"utf8"):"";return{name,exists:!!s,drop:s.includes("FileDropzone"),batch:/multiple|maxFiles/.test(s),paid:/PaidActionButton|PaidExportButton/.test(s),remote:s.includes("RemoteMediaImporter")};});
const paidBackends=[
 ["food-calorie","app/api/ai/food-analyze/route.ts"],
 ["id-photo-ai","app/api/ai/id-photo/route.ts"],
 ["image-watermark-remover","app/api/ai/image-cleanup/route.ts"],
 ["subtitle-translate","app/api/ai/subtitle-translate/route.ts"],
 ["audio-transcription","app/api/ai/transcribe/route.ts"],
 ["video-transcription","app/api/ai/transcribe/route.ts"],
 ["video-dubbing","app/api/ai/dub/create/route.ts"],
 ["video-watermark-remover","app/api/tools/local-paid/job/route.ts"],
].map(([id,p])=>{const s=fs.existsSync(path.join(repo,p))?fs.readFileSync(path.join(repo,p),"utf8"):"";return{id,path:p,exists:!!s,gate:/claimPaidToolJob|local-paid/.test(s)}});
console.log(JSON.stringify({pages,chromeFailures:chrome,capabilities,paidBackends},null,2));
if(chrome.length||paidBackends.some(x=>!x.exists||!x.gate)||capabilities.some(x=>!x.exists))process.exit(2);
