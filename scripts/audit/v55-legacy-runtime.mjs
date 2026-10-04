import fs from"node:fs";import path from"node:path";
const ROOTS=["app","components","lib","scripts","tests"];
const LEGACY=[
 {file:"lib/sasi/core/runtime.ts",specs:["./runtime","@/lib/sasi/core/runtime"],symbols:["SASIRuntime","RuntimeExecutor","RuntimeValidator"]},
 {file:"lib/sasi/core/unified-execution-loop.ts",specs:["./unified-execution-loop","@/lib/sasi/core/unified-execution-loop"],symbols:["UnifiedExecutionLoop","UnifiedExecutionInput"]},
 {file:"lib/sasi/core/runtime-session.ts",specs:["./runtime-session","@/lib/sasi/core/runtime-session"],symbols:["RuntimeSession"]},
];
const SKIP=new Set([...LEGACY.map(x=>x.file),"scripts/audit/v55-legacy-runtime.mjs"]);
function walk(dir,out=[]){if(!fs.existsSync(dir))return out;for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name).replaceAll("\\","/");if(e.isDirectory()){if(["node_modules",".next","_local"].includes(e.name))continue;walk(p,out)}else if(/\.(?:ts|tsx|js|mjs|cjs)$/.test(e.name)&&!SKIP.has(p))out.push(p)}return out}
function refsIn(file,legacy){const source=fs.readFileSync(file,"utf8"),hits=[];for(const spec of legacy.specs)if(source.includes(`"${spec}"`)||source.includes(`'${spec}'`))hits.push(`module:${spec}`);for(const symbol of legacy.symbols){const re=new RegExp(`\\b${symbol}\\b`);if(re.test(source))hits.push(`symbol:${symbol}`)}return hits}
const all=ROOTS.flatMap(r=>walk(r));const index="lib/sasi/core/index.ts";
let anyReferenced=false;const report=[];
for(const legacy of LEGACY){if(!fs.existsSync(legacy.file)){report.push(`${legacy.file}=retired`);continue}const refs=[];for(const file of all){if(file===index)continue;const hits=refsIn(file,legacy);if(hits.length)refs.push(`${file}[${hits.join(",")}]`)}if(refs.length){anyReferenced=true;report.push(`${legacy.file}=referenced:${refs.slice(0,12).join(";")}`)}else report.push(`${legacy.file}=eligible-unreferenced`)}
console.log(`V55_LEGACY_RUNTIME_REFERENCE_GRAPH=${report.join("|")}`);
if(anyReferenced)console.log("V55_LEGACY_RUNTIME_RETIREMENT=DEFERRED_REFERENCED");else if(LEGACY.some(x=>fs.existsSync(x.file)))console.log("V55_LEGACY_RUNTIME_RETIREMENT=ELIGIBLE_UNREFERENCED");else console.log("V55_LEGACY_RUNTIME_RETIREMENT=PASS");
