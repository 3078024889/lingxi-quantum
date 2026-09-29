import fs from"node:fs";import path from"node:path";
const toolRoot="app/tools";
const retiredTerms=["潜意识重塑","场域精测","意识显化修炼"];
const engineeringUi=[/Internal Server Error/i,/Job Failed/i,/Task Executor/i,/Object Storage/i,/启动 OCR Pipeline/i];
const fake=[/fakeProgress/i,/mockProgress/i,/simulateProgress/i,/setTimeout\s*\(\s*\(\s*\)\s*=>\s*\{[^}]{0,500}(?:success|complete|done)/is];
function walk(p,out=[]){if(!fs.existsSync(p))return out;for(const e of fs.readdirSync(p,{withFileTypes:true})){const f=path.join(p,e.name);if(/node_modules|\.next|\.git/.test(f))continue;if(e.isDirectory())walk(f,out);else if(/\.(tsx?|jsx?|json|css|scss|html)$/.test(e.name))out.push(f)}return out}
const files=walk("app").concat(walk("components"),walk("lib"));
let retired=[],ui=[],fakeHits=[];
for(const f of files){const s=fs.readFileSync(f,"utf8");for(const t of retiredTerms)if(s.includes(t))retired.push({term:t,file:f});for(const re of engineeringUi)if(re.test(s))ui.push({rule:String(re),file:f});for(const re of fake)if(re.test(s))fakeHits.push({rule:String(re),file:f})}
let tools=[];if(fs.existsSync(toolRoot))for(const e of fs.readdirSync(toolRoot,{withFileTypes:true})){if(!e.isDirectory()||["admin","pay","[slug]"].includes(e.name))continue;const page=path.join(toolRoot,e.name,"page.tsx");if(!fs.existsSync(page))continue;const s=fs.readFileSync(page,"utf8");const imports=[...s.matchAll(/@\/components\/tools\/([^"']+)/g)].map(m=>m[1]);tools.push({id:e.name,page,workbenches:imports})}
const reg=fs.existsSync("lib/tools/experience-registry.ts")?fs.readFileSync("lib/tools/experience-registry.ts","utf8"):"";
const uncovered=tools.filter(t=>!reg.includes(`"${t.id}":`)).map(t=>t.id);
const stale=[];for(const p of["components/tools/FoodBatchWorkspace.tsx","scripts/master-v16","scripts/release-v17","scripts/v18"])if(fs.existsSync(p))stale.push(p);
const report={toolCount:tools.length,tools,uncovered,retired,engineeringUi:ui,fakeProgress:fakeHits,stale};
fs.mkdirSync("audit-reports",{recursive:true});fs.writeFileSync("audit-reports/final-production-readiness.json",JSON.stringify(report,null,2));
console.log("PRODUCTION_TOOL_ROUTES="+tools.length);
console.log("EXPERIENCE_UNCOVERED="+uncovered.length);
console.log("RETIRED_PRODUCT_ACTIVE_REFERENCES="+retired.length);
console.log("FAKE_PROGRESS_FINDINGS="+fakeHits.length);
console.log("ENGINEERING_UI_FINDINGS="+ui.length);
console.log("STALE_MODULES="+stale.length);
if(uncovered.length||retired.length||fakeHits.length||stale.length)process.exit(2);
console.log("FINAL_PRODUCT_SOURCE_GATE=PASS");
