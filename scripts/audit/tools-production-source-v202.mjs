import fs from "node:fs";
import path from "node:path";

const root=process.cwd();
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const exists=p=>fs.existsSync(path.join(root,p));
const must=(v,m)=>{if(!v)throw new Error(m)};

for(const p of [
 "lib/tools/registry.ts",
 "components/tools/ToolsHubV11.tsx",
 "components/tools/ToolWorkbench.tsx",
 "components/tools/FileDropzone.tsx",
 "components/tools/ResultPanel.tsx",
 "lib/tools/shared/download.ts",
 "lib/tools/autonomous/download-local.ts",
 "lib/tools/engine/stage-graph.ts",
 "lib/tools/paid-catalog.ts",
]) must(exists(p),`TOOLS_PRODUCTION_REQUIRED:${p}`);

const registry=read("lib/tools/registry.ts");
const hub=read("components/tools/ToolsHubV11.tsx");
const graph=read("lib/tools/engine/stage-graph.ts");
const fileDrop=read("components/tools/FileDropzone.tsx");
const sharedDownload=read("lib/tools/shared/download.ts");
const localDownload=read("lib/tools/autonomous/download-local.ts");

const registrySlugs=[...registry.matchAll(/slug:\s*"([^"]+)"/g)].map(x=>x[1]);
const dedicatedSlugs=[...hub.matchAll(/href:"\/tools\/([^"]+)"/g)].map(x=>x[1]);
const all=[...new Set([...registrySlugs,...dedicatedSlugs])].sort();
must(all.length>=45,`TOOLS_SURFACE_COUNT_TOO_LOW:${all.length}`);

const infrastructure=new Set(["temp-mail","burn-after-read"]);
const aliases=new Map([["compress-pdf","compress-pdf"],["pdf-compress","pdf-compress"],["heic-local","heic-local"],["image-to-pdf-pro","image-to-pdf-pro"]]);
const graphMissing=[];
for(const slug of all){
 if(infrastructure.has(slug))continue;
 const id=aliases.get(slug)||slug;
 if(!graph.includes(`g("${id}"`))graphMissing.push(slug);
}
must(graphMissing.length===0,`TOOLS_GRAPH_MISSING:${graphMissing.join(",")}`);

must(fileDrop.includes("URL.createObjectURL(file)"),"IMAGE_UPLOAD_PREVIEW_MISSING");
must(fileDrop.includes('kind!=="image"'),"IMAGE_PREVIEW_SCOPE_MISSING");
must(sharedDownload.includes("navigator as Navigator"),"MOBILE_NATIVE_SHARE_MISSING");
must(sharedDownload.includes("miniLikeEnvironment"),"WEBVIEW_DOWNLOAD_FALLBACK_MISSING");
must(localDownload.includes("downloadBlob"),"LEGACY_LOCAL_DOWNLOAD_NOT_MIGRATED");

// Fake-function scan.
// IMPORTANT: TODO/FIXME are intentionally CASE-SENSITIVE.
// The previous /i pattern incorrectly classified Portuguese UI copy such as "Tudo"
// as "TODO". User-facing translation dictionaries are not fake implementations.
const roots=["components/tools","lib/tools","app/tools"];
const bad=[];
function fakeMarker(source){
  return (
    /\bTODO\b|\bFIXME\b/.test(source) ||
    /placeholder result|fake download|mock result|模拟成功|假进度/i.test(source)
  );
}
function walk(dir){
 if(!fs.existsSync(dir))return;
 for(const e of fs.readdirSync(dir,{withFileTypes:true})){
  if(e.name.startsWith("."))continue;
  const p=path.join(dir,e.name);
  if(e.isDirectory())walk(p);
  else if(/\.(ts|tsx|js|jsx)$/.test(e.name)){
   const s=fs.readFileSync(p,"utf8");
   if(fakeMarker(s))bad.push(path.relative(root,p));
  }
 }
}
for(const d of roots)walk(path.join(root,d));
must(bad.length===0,`TOOLS_FAKE_IMPLEMENTATION_MARKERS:${bad.join(",")}`);

const dedicatedMissing=[];
for(const slug of dedicatedSlugs){
 const page=`app/tools/${slug}/page.tsx`;
 if(!exists(page)&&!registrySlugs.includes(slug))dedicatedMissing.push(slug);
}
must(dedicatedMissing.length===0,`TOOLS_ROUTE_SOURCE_MISSING:${dedicatedMissing.join(",")}`);

console.log(`TOOLS_DISCOVERED=${all.length}`);
console.log("TOOLS_GRAPH_COVERAGE_PRODUCTION=PASS");
console.log("TOOLS_IMAGE_UPLOAD_PREVIEW=PASS");
console.log("TOOLS_MOBILE_SAVE_FALLBACK=PASS");
console.log("TOOLS_FAKE_MARKER_SCAN=PASS");
console.log("TOOLS_ROUTE_SOURCE_COVERAGE=PASS");
console.log("AUDIT_TOOLS_PRODUCTION_SOURCE_V202=PASS");
