import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
const dir="scripts/final-closure";let ok=true;
for(const name of fs.readdirSync(dir).filter(x=>x.endsWith(".mjs")).sort()){
 const file=path.join(dir,name),r=spawnSync(process.execPath,["--check",file],{encoding:"utf8"}),pass=r.status===0;
 console.log(`NODE_SYNTAX_${name.replaceAll(".","_")}=${pass?"PASS":"FAIL"}`);
 if(!pass){process.stderr.write(r.stderr||r.stdout||"");ok=false;}
}
process.exit(ok?0:1);
