import fs from "node:fs";
import path from "node:path";

const root=process.cwd();
const candidates=[
  "components/AssessmentWorkbench.tsx",
  "components/PracticeWorkspace.tsx",
  "components/SubconsciousExplorer.tsx",
  "scripts/sasi-evolution/RUN_V10221_MANIFEST_SELF_CODING_SANDBOX.ps1",
  "scripts/sasi-evolution/RUN_V1022_SELF_CODING_SANDBOX.ps1",
  "scripts/sasi-evolution/RUN_V1060_CODE_PROPOSAL_SANDBOX.ps1",
  "scripts/sasi-evolution/RUN_V1070_REAL_CODE_AUTHOR_PAID_SMOKE_GUARD.ps1",
  "scripts/sasi-evolution/RUN_V1070_REAL_CODE_AUTHOR_PREFLIGHT.ps1",
  "scripts/sasi-learning/RUN_V1030_REAL_ARK_TEACHER_PREFLIGHT.ps1"
];

const sourceRoots=["app","components","lib","scripts"];
const exts=/\.(ts|tsx|js|jsx|mjs|cjs|json)$/i;

function allSource(){
  const out=[];
  function walk(d){
    if(!fs.existsSync(d))return;
    for(const e of fs.readdirSync(d,{withFileTypes:true})){
      if(e.name==="node_modules"||e.name===".next"||e.name.startsWith(".lingxi-backup-"))continue;
      const p=path.join(d,e.name);
      if(e.isDirectory())walk(p);
      else if(exts.test(e.name))out.push(p);
    }
  }
  for(const r of sourceRoots)walk(path.join(root,r));
  return out;
}

const files=allSource();

for(const rel of candidates){
  const full=path.join(root,rel);
  if(!fs.existsSync(full))continue;
  const base=path.basename(rel,path.extname(rel));
  const refs=[];
  for(const file of files){
    if(path.resolve(file)===path.resolve(full))continue;
    try{
      const t=fs.readFileSync(file,"utf8");
      if(t.includes(base)||t.includes(rel.replaceAll("\\","/")))refs.push(path.relative(root,file));
    }catch{}
  }
  if(refs.length){
    console.log(`KEEP_REFERENCED_LEGACY=${rel}`);
    continue;
  }
  fs.rmSync(full,{force:true,recursive:true});
  console.log(`REMOVED_DEAD_LEGACY=${rel}`);
}
console.log("DEAD_LEGACY_CLEANUP=PASS");
