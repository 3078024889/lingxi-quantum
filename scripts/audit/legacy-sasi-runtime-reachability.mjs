import fs from "node:fs";
import path from "node:path";
const ROOT=process.cwd();
const EXT=new Set([".ts",".tsx",".js",".jsx",".mjs",".cjs",".json"]);
const SKIP=new Set(["node_modules",".next",".git","dist","build","coverage",".turbo"]);
const norm=p=>p.split(path.sep).join("/");
function walk(dir){if(!fs.existsSync(dir))return[];return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{if(e.isDirectory()&&SKIP.has(e.name))return[];const f=path.join(dir,e.name);return e.isDirectory()?walk(f):[norm(f)]})}
const sourceFiles=[...new Set([...walk("app"),...walk("components"),...walk("lib"),...["middleware.ts","instrumentation.ts","proxy.ts","next.config.js","next.config.mjs","next.config.ts"].filter(p=>fs.existsSync(p))])].filter(p=>EXT.has(path.extname(p)));
const known=new Set(sourceFiles),adj=new Map();
const pattern=/(?:\bfrom\s*|\bimport\s*\(?\s*|\brequire\s*\(\s*)["']([^"']+)["']/g;
const exts=[".ts",".tsx",".js",".jsx",".mjs",".cjs",".json"];
function resolve(from,spec){let base;if(spec.startsWith("@/"))base=path.resolve(ROOT,spec.slice(2));else if(spec.startsWith("."))base=path.resolve(ROOT,path.dirname(from),spec);else return null;for(const p of [base,...exts.map(e=>base+e),...exts.map(e=>path.join(base,"index"+e))]){const r=norm(path.relative(ROOT,p));if(known.has(r))return r;}return null;}
for(const file of sourceFiles){const src=fs.readFileSync(file,"utf8"),deps=new Set();for(const m of src.matchAll(pattern)){const r=resolve(file,m[1]);if(r)deps.add(r);}adj.set(file,[...deps]);}
const entries=sourceFiles.filter(p=>p.startsWith("app/")||["middleware.ts","instrumentation.ts","proxy.ts","next.config.js","next.config.mjs","next.config.ts"].includes(p));
const reachable=new Set(entries),queue=[...entries];while(queue.length){for(const dep of adj.get(queue.pop())||[])if(!reachable.has(dep)){reachable.add(dep);queue.push(dep);}}
const groups=[["lib/sasi-kernel","lib/sasi-kernel/"],["lib/sasi-autonomous","lib/sasi-autonomous/"],["lib/sasi-v5","lib/sasi-v5/"],["lib/ai-knowledge","lib/ai-knowledge/"],["lib/sasi/durable","lib/sasi/durable/"],["lib/sasi/skills","lib/sasi/skills/"],["lib/sasi/knowledge","lib/sasi/knowledge/"],["lib/sasi/learning","lib/sasi/learning/"],["lib/sasi/website","lib/sasi/website/"],["lib/sasi/website-engine","lib/sasi/website-engine/"],["lib/sasi/ask","lib/sasi/ask/"],["lib/sasi-all","lib/sasi/"]];
const summaries=groups.map(([name,prefix])=>{const files=sourceFiles.filter(p=>p.startsWith(prefix)),live=files.filter(p=>reachable.has(p)),dead=files.filter(p=>!reachable.has(p)),importers=[];for(const[from,deps]of adj){if(from.startsWith(prefix))continue;for(const dep of deps)if(dep.startsWith(prefix))importers.push({from,to:dep});}return{name,total:files.length,reachable:live.length,unreachable:dead.length,unreachablePaths:dead,externalImporters:importers.slice(0,80)};});
const textFiles=[...new Set([...walk("app"),...walk("components"),...walk("lib"),...walk("scripts"),...walk(".github"),...walk("workers"),...["package.json","vercel.json","next.config.js","next.config.mjs","wrangler.toml","docker-compose.yml"].filter(p=>fs.existsSync(p))])].filter(p=>/\.(?:ts|tsx|js|jsx|mjs|cjs|json|ya?ml|toml|sh|ps1|py|md|txt|example|env)$/.test(p)&&!p.endsWith(".pyc"));
const tokens=["sasi-compute-v19","SASI_COMPUTE_URL","SASI_NATIVE_COMPUTE_URL","SASI_NATIVE_BASE_URL","lib/sasi-kernel","lib/sasi-autonomous","lib/sasi-v5","/api/knowledge/ask","/api/knowledge/pricing"],refs=[];
for(const file of textFiles){let src="";try{src=fs.readFileSync(file,"utf8")}catch{continue}for(const token of tokens)if(src.includes(token))refs.push({file,token});}
let scripts={};try{const pkg=JSON.parse(fs.readFileSync("package.json","utf8"));scripts=Object.fromEntries(Object.entries(pkg.scripts||{}).filter(([k,v])=>/sasi|knowledge|learning|drama|storyboard|director|native/i.test(k+" "+v)));}catch{}
const workerFiles=walk("workers/sasi-compute-v19");
console.log("LEGACY_SASI_RUNTIME_REACHABILITY="+JSON.stringify({sourceFiles:sourceFiles.length,appEntrypoints:entries.length,reachableSourceFiles:reachable.size,groups:summaries,workersSasiComputeV19:{files:workerFiles.length,pycache:workerFiles.filter(p=>p.includes("__pycache__")).length,externalLiteralReferences:refs.filter(x=>!x.file.startsWith("workers/sasi-compute-v19/")&&x.token==="sasi-compute-v19")},legacyLiteralReferences:refs,relatedPackageScripts:scripts}));
