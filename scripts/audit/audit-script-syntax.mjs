import fs from"node:fs";
import path from"node:path";
import{spawnSync}from"node:child_process";

const roots=["scripts/audit"];
const files=[];
function walk(dir){
 for(const e of fs.readdirSync(dir,{withFileTypes:true})){
  const p=path.join(dir,e.name);
  if(e.isDirectory())walk(p);
  else if(e.isFile()&&e.name.endsWith(".mjs"))files.push(p);
 }
}
for(const root of roots)if(fs.existsSync(root))walk(root);

let failed=0;
for(const file of files){
 const r=spawnSync(process.execPath,["--check",file],{encoding:"utf8"});
 if(r.status!==0){
  failed++;
  console.error(`AUDIT_SCRIPT_SYNTAX_FAIL=${file}`);
  console.error((r.stderr||r.stdout||"").trim());
 }
}
if(failed)throw new Error(`AUDIT_SCRIPT_SYNTAX_FAILURES:${failed}`);

console.log(`AUDIT_SCRIPT_SYNTAX_FILES=${files.length}`);
console.log("ALL_AUDIT_SCRIPTS_SYNTAX=PASS");
