import fs from "node:fs";
import path from "node:path";

const root=process.cwd();
const fail=[],warn=[];
const pass=x=>console.log(`PASS ${x}`);
const bad=x=>{console.error(`FAIL ${x}`);fail.push(x)};
const caution=x=>{console.warn(`WARN ${x}`);warn.push(x)};

const hub=fs.readFileSync("components/tools/ToolsHubV11.tsx","utf8");
const registry=fs.readFileSync("lib/tools/registry.ts","utf8");
const dynamicPage=path.join(root,"app","tools","[slug]","page.tsx");
const hasDynamic=fs.existsSync(dynamicPage);
if(hasDynamic)pass("dynamic registry tool route exists");
else bad("missing app/tools/[slug]/page.tsx");

const registrySlugs=new Set([...registry.matchAll(/slug:\s*"([^"]+)"/g)].map(x=>x[1]));
const hubSlugs=new Set([...hub.matchAll(/href:"\/tools\/([^"]+)"/g)].map(x=>x[1]));

for(const slug of new Set([...registrySlugs,...hubSlugs])){
  const dedicated=path.join(root,"app","tools",slug,"page.tsx");
  const registryBacked=registrySlugs.has(slug);
  if(fs.existsSync(dedicated)){
    pass(`dedicated tool route /tools/${slug}`);
  }else if(registryBacked&&hasDynamic){
    pass(`dynamic tool route /tools/${slug}`);
  }else{
    bad(`missing real route /tools/${slug}`);
  }
}

// Literal client API routes must exist.
const componentDir=path.join(root,"components","tools");
for(const name of fs.readdirSync(componentDir)){
  if(!name.endsWith(".tsx"))continue;
  const text=fs.readFileSync(path.join(componentDir,name),"utf8");
  for(const m of text.matchAll(/fetch\((?:`|"|')([^`"']*\/api\/[^`"']+)/g)){
    const raw=m[1];
    if(raw.includes("${"))continue;
    const api=raw.split("?")[0];
    const route=path.join(root,"app","api",...api.replace(/^\/api\//,"").split("/"),"route.ts");
    if(!fs.existsSync(route))bad(`${name} references missing ${api}`);
  }
}

// Confirm real server implementation for high-risk paid tools.
const mustExist=[
 "app/api/ai/image-cleanup/route.ts",
 "app/api/ai/transcribe/route.ts",
 "app/api/ai/subtitle-translate/route.ts",
 "app/api/ai/id-photo/route.ts",
 "app/api/ai/food-analyze/route.ts",
 "app/api/ai/dub/create/route.ts",
 "app/api/tools/local-paid/job/route.ts",
 "app/api/tools/quote/route.ts",
 "app/api/tools/temp-mail/create/route.ts",
 "app/api/tools/burn-after-read/create/route.ts",
];
for(const rel of mustExist) fs.existsSync(rel)?pass(rel):bad(`missing ${rel}`);

const cleanup=fs.readFileSync("app/api/ai/image-cleanup/route.ts","utf8");
cleanup.includes('OPENAI_IMAGE_EDIT_MODEL||"gpt-image-2"')?pass("image cleanup current default"):bad("image cleanup default model invalid");

const video=fs.readFileSync("components/tools/VideoWatermarkWorkbench.tsx","utf8");
video.includes("const w=item.width,h=item.height")?pass("video watermark per-file dimensions"):bad("video watermark batch dimensions unsafe");

const readiness=fs.readFileSync("lib/tools/service-readiness.ts","utf8");
for(const id of ["food-calorie","video-dubbing","id-photo-ai","image-watermark-remover","audio-transcription","video-transcription","subtitle-translate"]){
  readiness.includes(`"${id}"`)?pass(`runtime classified ${id}`):bad(`runtime not classified ${id}`);
}

console.log(`TOOLS_TRUTH_REGISTRY=${registrySlugs.size}`);
console.log(`TOOLS_TRUTH_HUB=${hubSlugs.size}`);
console.log(`TOOLS_TRUTH_WARNINGS=${warn.length}`);
if(fail.length){
  console.error(`TOOLS_TRUTH_FAILURES=${fail.length}`);
  fail.forEach((x,i)=>console.error(`${i+1}. ${x}`));
  process.exit(1);
}
console.log("TOOLS_TRUTH_AUDIT=PASS");
