#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {spawnSync} from "node:child_process";

const root=process.cwd();
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const exists=p=>fs.existsSync(path.join(root,p));
const run=(args)=>{
 const r=spawnSync(process.execPath,args,{cwd:root,encoding:"utf8",windowsHide:true,timeout:120000});
 return{ok:r.status===0,status:r.status,stdout:r.stdout||"",stderr:r.stderr||""};
};

const registry=read("lib/tools/registry.ts");
const hub=read("components/tools/ToolsHubV11.tsx");
const graph=read("lib/tools/engine/stage-graph.ts");
const catalog=read("lib/tools/engine/catalog.ts");
const slugs=[...new Set([
 ...[...registry.matchAll(/slug:\s*"([^"]+)"/g)].map(x=>x[1]),
 ...[...hub.matchAll(/href:"\/tools\/([^"]+)"/g)].map(x=>x[1]),
])].sort();

const runtimeByEngine=new Map();
for(const m of catalog.matchAll(/id:"([^"]+)"[\s\S]{0,360}?runtime:"([^"]+)"/g))runtimeByEngine.set(m[1],m[2]);

const probe=run(["scripts/local-engine/probe-runtime.mjs"]);
let probes={commands:{},python:{},node:{}};
try{probes=JSON.parse(probe.stdout)}catch{}

const nodeMap={"sharp-libvips":"sharp","mammoth":"mammoth","exceljs":"exceljs","readability":"@mozilla/readability","dompurify":"dompurify","turndown":"turndown"};
const pyMap={paddleocr:"paddleocr",opencv:"cv2",mediapipe:"mediapipe","faster-whisper":"faster_whisper",argos:"argostranslate",kokoro:"kokoro",jieba:"jieba"};
function engineAvailable(id){
 const runtime=runtimeByEngine.get(id);
 if(runtime==="browser"||runtime==="database")return true;
 if(nodeMap[id])return probes.node?.[nodeMap[id]]?.available===true;
 if(pyMap[id])return probes.python?.[pyMap[id]]?.available===true;
 if(probes.commands?.[id])return probes.commands[id].available===true;
 if(id==="gotenberg")return Boolean(process.env.LINGXI_GOTENBERG_URL);
 return false;
}
function graphBlock(slug){
 const marker=`g("${slug}"`;const start=graph.indexOf(marker);if(start<0)return"";
 const next=graph.indexOf('\n g("',start+marker.length);
 return graph.slice(start,next<0?graph.length:next);
}
const knownEngines=[...runtimeByEngine.keys()];
const infrastructure=new Set(["temp-mail","burn-after-read"]);
const deliberateBlocked=new Set(["video-dubbing"]);
const fixtureMap=new Map([
 ["merge-pdf","real-pdf-fixture"],["split-pdf","real-pdf-fixture"],["image-to-pdf","real-pdf-fixture"],
 ["text-counter","text-fixture"],["remove-duplicate-lines","text-fixture"],["remove-empty-lines","text-fixture"],
 ["url-encode-decode","text-fixture"],["base64-encode-decode","text-fixture"]
]);

const pdfFixture=run(["scripts/test-tools-real-files.cjs"]);
const textFixture=run(["scripts/test-text-tools.cjs"]);
const rows=[];
for(const slug of slugs){
 const block=graphBlock(slug);
 if(infrastructure.has(slug)){rows.push({slug,status:"MANUAL_EXTERNAL_ACCEPTANCE_REQUIRED",missingEngines:[],evidence:[]});continue}
 if(!block){rows.push({slug,status:"FAIL_GRAPH_MISSING",missingEngines:[],evidence:[]});continue}
 if(deliberateBlocked.has(slug)){rows.push({slug,status:"BLOCKED_INCOMPLETE_BY_DESIGN",missingEngines:[],evidence:["service-readiness fail-closed"]});continue}
 const referenced=knownEngines.filter(id=>block.includes(`"${id}"`));
 const server=referenced.filter(id=>!["browser","database"].includes(runtimeByEngine.get(id)||""));
 const missing=server.filter(id=>!engineAvailable(id));
 const fixture=fixtureMap.get(slug);
 const fixtureOk=fixture==="real-pdf-fixture"?pdfFixture.ok:fixture==="text-fixture"?textFixture.ok:false;
 const status=fixture&&fixtureOk
  ?"PASS_REAL_FIXTURE"
  :missing.length
    ?"BLOCKED_OR_FALLBACK_REQUIRES_RUNTIME_ACCEPTANCE"
    :"SOURCE_AND_RUNTIME_READY_E2E_STILL_REQUIRED";
 const evidence=[];
 if(fixtureOk)evidence.push(fixture);
 if(server.length)evidence.push("server-engine-probe");
 if(referenced.some(id=>runtimeByEngine.get(id)==="browser"))evidence.push("browser-runtime");
 if(referenced.some(id=>runtimeByEngine.get(id)==="database"))evidence.push("database-runtime");
 rows.push({slug,status,missingEngines:missing,evidence});
}

const counts=rows.reduce((a,r)=>(a[r.status]=(a[r.status]||0)+1,a),{});
const report={generatedAt:new Date().toISOString(),toolCount:rows.length,counts,fixtureResults:{pdf:pdfFixture.ok,text:textFixture.ok},engineProbeParsed:Boolean(probe.stdout),rows};
const outDir=path.resolve(root,"..","lingxi-reports");fs.mkdirSync(outDir,{recursive:true});
const stamp=new Date().toISOString().replace(/[:.]/g,"-");
const jsonPath=path.join(outDir,`tools-real-acceptance-v1600-${stamp}.json`);
const mdPath=path.join(outDir,`tools-real-acceptance-v1600-${stamp}.md`);
fs.writeFileSync(jsonPath,JSON.stringify(report,null,2));
fs.writeFileSync(mdPath,[
 "# LINGXIFIELD Tools Real Acceptance V16.00","",
 `Generated: ${report.generatedAt}`,"",
 `Tools: ${rows.length}`,"",
 ...Object.entries(counts).map(([k,v])=>`- ${k}: ${v}`),"",
 "> PASS_REAL_FIXTURE means an actual deterministic file/text fixture ran. Other statuses are intentionally not called PASS.","",
 "| Tool | Status | Missing runtime | Evidence |","|---|---|---|---|",
 ...rows.map(r=>`| ${r.slug} | ${r.status} | ${r.missingEngines.join(", ")} | ${r.evidence.join(", ")} |`)
].join("\n"));

console.log(`TOOLS_REAL_ACCEPTANCE_JSON=${jsonPath}`);
console.log(`TOOLS_REAL_ACCEPTANCE_MD=${mdPath}`);
console.log(`TOOLS_REAL_ACCEPTANCE_COUNT=${rows.length}`);
console.log(`TOOLS_REAL_ACCEPTANCE_COUNTS=${JSON.stringify(counts)}`);
if(rows.some(r=>r.status==="FAIL_GRAPH_MISSING")){console.error("TOOLS_REAL_ACCEPTANCE=FAIL_GRAPH");process.exit(1)}
if(!pdfFixture.ok||!textFixture.ok){console.error("TOOLS_REAL_ACCEPTANCE=FAIL_FIXTURE");process.exit(1)}
console.log("TOOLS_REAL_ACCEPTANCE=AUDITED_WITH_EXPLICIT_BLOCKERS");
