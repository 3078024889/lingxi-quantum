import fs from"node:fs";import path from"node:path";

const ROOT=process.cwd();
const roots=["app","components","lib","scripts","tests"];
const candidates=[
 "lib/sasi/core/runtime.ts",
 "lib/sasi/core/unified-execution-loop.ts",
 "lib/sasi/core/runtime-session.ts",
 "components/SasiModeHost.tsx",
 "components/SasiChatCreationStudio.tsx",
 "components/SasiChatCreationStudio.module.css",
 "components/KnowledgeWorkspace.tsx",
 "components/SasiStartGuide.tsx",
 "lib/sasi/skills/mode-adapters.ts",
];

const norm=p=>path.relative(ROOT,path.resolve(ROOT,p)).split(path.sep).join("/");
const candidateSet=new Set(candidates.map(norm));
const skip=new Set([
 "scripts/audit/v55-legacy-runtime.mjs",
 "scripts/audit/r18r6-legacy-retirement.mjs",
].map(norm));

const isHistoricalScript=p=>
 p.startsWith("scripts/audit/patch-")||
 p.startsWith("scripts/audit/r8-")||
 p.startsWith("scripts/audit/r17-")||
 p.startsWith("scripts/audit/r18-")||
 p.startsWith("scripts/audit/r18r");

function walk(rel,out=[]){
 const abs=path.resolve(ROOT,rel);
 if(!fs.existsSync(abs))return out;
 for(const e of fs.readdirSync(abs,{withFileTypes:true})){
  const child=path.join(abs,e.name),n=norm(child);
  if(e.isDirectory()){
   if(["node_modules",".next","_local",".git"].includes(e.name))continue;
   walk(n,out);
  }else if(/\.(?:ts|tsx|js|mjs|cjs|css)$/.test(e.name)&&!skip.has(n)&&!isHistoricalScript(n)){
   out.push(n);
  }
 }
 return out;
}

// Freeze immutable repository snapshot BEFORE any deletion.
const all=[...new Set(roots.flatMap(r=>walk(r)))].sort();
const snapshot=new Map();
for(const f of all){
 const abs=path.resolve(ROOT,f);
 if(!fs.existsSync(abs))continue;
 snapshot.set(f,fs.readFileSync(abs,"utf8"));
}

function moduleInfo(candidate){
 const abs=path.resolve(ROOT,candidate);
 const source=snapshot.get(candidate)??(fs.existsSync(abs)?fs.readFileSync(abs,"utf8"):"");
 const extless=candidate.replace(/\.(?:ts|tsx|js|mjs|cjs|css)$/,"");
 const base=path.posix.basename(extless);
 const aliases=new Set([`@/${extless}`,`./${base}`,`../${base}`]);
 const exported=[...source.matchAll(/export\s+(?:default\s+)?(?:class|function|const|type|interface)\s+([A-Za-z0-9_]+)/g)].map(x=>x[1]);
 return{source,aliases:[...aliases],exported};
}
function sourceReferences(source,info){
 if(info.aliases.some(a=>source.includes(`"${a}"`)||source.includes(`'${a}'`)))return true;
 return info.exported.some(sym=>new RegExp(`\\b${sym}\\b`).test(source));
}

const info=new Map(candidates.map(c=>[norm(c),moduleInfo(norm(c))]));

// External consumers: runtime/app/component/lib/tests plus non-historical scripts.
const externalRefs=new Map();
for(const c of candidateSet){
 const refs=[],ci=info.get(c);
 for(const [f,source] of snapshot){
  if(candidateSet.has(f)||skip.has(f))continue;
  if(sourceReferences(source,ci))refs.push(f);
 }
 externalRefs.set(c,refs);
}

// Internal candidate dependency graph.
const deps=new Map([...candidateSet].map(c=>[c,new Set()]));
for(const a of candidateSet){
 const source=info.get(a).source;
 for(const b of candidateSet){
  if(a!==b&&sourceReferences(source,info.get(b)))deps.get(a).add(b);
 }
}

// Keep externally referenced candidates and their dependencies transitively.
const keep=new Set([...candidateSet].filter(c=>(externalRefs.get(c)||[]).length));
let changed=true;
while(changed){
 changed=false;
 for(const a of [...keep]){
  for(const b of deps.get(a)||[]){
   if(!keep.has(b)){keep.add(b);changed=true}
  }
 }
}

const retire=[...candidateSet].filter(c=>!keep.has(c)&&fs.existsSync(path.resolve(ROOT,c))).sort();

for(const c of [...candidateSet].sort()){
 const refs=externalRefs.get(c)||[];
 if(keep.has(c)){
  const why=refs.length?`external:${refs.slice(0,12).join(",")}`:"dependency-of-preserved-candidate";
  console.log(`R18R6_LEGACY_PRESERVED_REFERENCED=${c}:${why}`);
 }else if(!fs.existsSync(path.resolve(ROOT,c))){
  console.log(`R18R6_LEGACY_ALREADY_RETIRED=${c}`);
 }else{
  console.log(`R18R6_LEGACY_RETIRE_PLAN=${c}`);
 }
}

// Delete only after graph + plan are frozen.
for(const c of retire){
 const abs=path.resolve(ROOT,c);
 if(fs.existsSync(abs))fs.unlinkSync(abs);
 console.log(`R18R6_LEGACY_RETIRED_UNREFERENCED=${c}`);
}

// Fresh post-delete verification.
const survivors=new Set(roots.flatMap(r=>walk(r)));
for(const c of retire){
 if(fs.existsSync(path.resolve(ROOT,c)))throw new Error(`R18R6_RETIRE_DELETE_FAILED:${c}`);
 for(const f of survivors){
  if(candidateSet.has(f)||skip.has(f))continue;
  const abs=path.resolve(ROOT,f);
  if(!fs.existsSync(abs))continue;
  const source=fs.readFileSync(abs,"utf8");
  if(sourceReferences(source,info.get(c)))throw new Error(`R18R6_RETIRED_FILE_STILL_REFERENCED:${c}:${f}`);
 }
}

console.log(`R18R6_LEGACY_RETIREMENT_PLAN_COUNT=${retire.length}`);
console.log("R18R6_IMMUTABLE_REFERENCE_SNAPSHOT=PASS");
console.log("R18R6_WINDOWS_PATH_NORMALIZATION=PASS");
console.log("R18R6_HISTORICAL_PATCH_REFERENCES_IGNORED=PASS");
console.log("R18R6_SAFE_LEGACY_RETIREMENT=PASS");
