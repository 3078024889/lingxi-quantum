#!/usr/bin/env node
// CN 3189 six-engine regression diagnosis, READ ONLY, no archive extraction.
// Does not read credentials, mutate files, restart services or touch 3188.
import fs from "node:fs";
import {spawnSync} from "node:child_process";
import path from "node:path";
const NODE="/opt/lingxifield/runtime/node-24.19.0/bin/node";
const OLD="/opt/lingxifield/releases/cn-pr199";
const ARCHIVE="/root/lingxifield-cn-doc-gateway-dc013d10/cn-ecs-document-gateway.tar.gz";
const LIST=[["SHARP","sharp"],["MAMMOTH","mammoth"],["EXCELJS","exceljs"],["READABILITY","@mozilla/readability"],["DOMPURIFY","dompurify"],["TURNDOWN","turndown"]];
if(process.argv.length!==3||process.argv[2]!=="--read-only"){console.log("CN_ENGINE_GAP_REQUIRES_READ_ONLY_FLAG");process.exit(2)}
if(process.getuid?.()!==0||!fs.existsSync(NODE)||!fs.existsSync(OLD+"/server.js")||!fs.existsSync(ARCHIVE)){console.log("CN_ENGINE_GAP_REQUIRED_FILES_ABSENT");process.exit(3)}
function cmd(exe,args,cwd,timeout=20000){
 const r=spawnSync(exe,args,{cwd,encoding:"utf8",maxBuffer:262144,timeout,env:{PATH:"/usr/local/bin:/usr/bin:/bin",HOME:"/nonexistent",NODE_ENV:"production"}});
 return r.status===0;
}
for(const [key,mod] of LIST){
 let present=false,link="NONE";
 try{
  const packageRoot=path.join(OLD,"node_modules",mod);
  present=fs.existsSync(packageRoot);
  if(present){
   const resolved=fs.realpathSync(packageRoot);
   link=resolved.startsWith(OLD+"/")?"INSIDE_STAGE":"OUTSIDE_STAGE";
  }
 }catch{}
 const success=cmd(NODE,["-e","import(process.argv[1]).then(()=>process.exit(0),()=>process.exit(3))",mod],OLD,14000);
 console.log("CN_OLD_ENGINE_"+key+"="+(success?"IMPORT_PASS":"IMPORT_FAIL")+";PKG_PRESENT="+present+";RESOLVED="+link);
}
const python=`import json,tarfile,sys
names={"sharp":"sharp","mammoth":"mammoth","exceljs":"exceljs","readability":"@mozilla/readability","dompurify":"dompurify","turndown":"turndown"}
found={k:{"root":False,"pnpm":False} for k in names}
pkg_count=0
with tarfile.open(sys.argv[1],"r:gz") as ar:
 for x in ar:
  name=x.name
  while name.startswith("./"):name=name[2:]
  if name.startswith("node_modules/.pnpm/"):pkg_count+=1
  for key,mod in names.items():
   root="node_modules/"+mod
   if name==root or name.startswith(root+"/"):
    found[key]["root"]=True
   if name.startswith("node_modules/.pnpm/"):
    part=name.split("/")[2]
    expected=mod.replace("/","+") if mod.startswith("@") else mod
    if part.startswith(expected+"@"):
     found[key]["pnpm"]=True
print("CN_NEW_ARCHIVE_PNPM_MEMBERS="+str(pkg_count))
for key,value in found.items():
 print("CN_NEW_ARCHIVE_ENGINE_"+key.upper()+"_ROOT="+str(value["root"]).lower()+";PNPM="+str(value["pnpm"]).lower())
`;
const py=spawnSync("python3",["-c",python,ARCHIVE],{encoding:"utf8",timeout:150000,maxBuffer:65536});
if(py.status!==0){console.log("CN_NEW_ARCHIVE_ENGINE_INSPECTION_FAILED");process.exit(4)}
process.stdout.write(py.stdout);
const uri="http://127.0.0.1:3189/api/tools/engine/health";
try{
 const r=await fetch(uri,{signal:AbortSignal.timeout(135000)});
 if(!r.ok)throw Error("NOT_OK");
 const raw=await r.text();
 if(raw.length>262144)throw Error("TOO_LARGE");
 const j=JSON.parse(raw);
 for(const [key,mod] of LIST){
  const id=key==="SHARP"?"sharp-libvips":key==="READABILITY"?"readability":key.toLowerCase();
  const e=(j.engines||[]).find(x=>x.id===id);
  console.log("CN_CURRENT_3189_ENGINE_"+key+"="+(e?.available===true?"AVAILABLE":"UNAVAILABLE"));
 }
 console.log("CN_CURRENT_3189_ENGINE_COUNT="+j.summary?.available);
}catch{console.log("CN_CURRENT_3189_ENGINE_HEALTH=UNAVAILABLE")}
console.log("CN_ENGINE_GAP_DIAGNOSIS_READ_ONLY=PASS");
