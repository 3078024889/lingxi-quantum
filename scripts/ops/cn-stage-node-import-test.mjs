#!/usr/bin/env node
// Isolated runtime verification: resolve dynamic imports from a copied deployment,
// not from the source repository or pnpm build cache.
import {spawnSync} from "node:child_process";
import {statSync} from "node:fs";
const root=process.env.CN_ISOLATED_STANDALONE;
if(!root||!root.startsWith("/tmp/"))throw Error("ISOLATED_TEST_ROOT_INVALID");
if(!statSync(root).isDirectory())throw Error("ISOLATED_RELEASE_NOT_A_DIRECTORY");
const mods=["mammoth","exceljs","@mozilla/readability","dompurify","turndown"];
let failed=0;
for(const mod of mods){
 const script="import("+JSON.stringify(mod)+").then(()=>process.exit(0)).catch(e=>{console.error(e.code||'MODULE_ERROR',e.message);process.exit(2)})";
 const proc=spawnSync(process.execPath,["--input-type=module","-e",script],{
  cwd:root,encoding:"utf8",timeout:15000,
  env:{PATH:process.env.PATH||"/usr/bin:/bin",HOME:root,NODE_ENV:"production"}
 });
 const ok=proc.status===0;
 console.log("CN_STANDALONE_"+mod+"="+(ok?"PASS":"FAIL"));
 if(!ok){
  failed++;
  const detail=String(proc.stderr||"").split("\n").filter(Boolean).slice(0,2).join(" ");
  console.log("CN_MODULE_FAILURE_"+mod+"="+detail.slice(0,240));
 }
}
if(failed)process.exit(1);
console.log("CN_STANDALONE_DYNAMIC_NODE_IMPORTS_5_OF_5_PASS");
