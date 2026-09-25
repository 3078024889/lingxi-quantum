import {spawnSync} from "node:child_process";
for(const file of ["scripts/patch-sasi-workspace-v1465.mjs","scripts/patch-sasi-production-v1465.mjs","scripts/patch-sasi-jobs-v1465.mjs"]){
  const r=spawnSync(process.execPath,[file],{stdio:"inherit"});
  if(r.status!==0)process.exit(r.status??1);
}
console.log("SOURCE_PATCHES_V1465=PASS");
