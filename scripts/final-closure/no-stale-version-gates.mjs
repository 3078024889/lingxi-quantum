import fs from "node:fs";
import path from "node:path";
const dir="scripts/final-closure",current=fs.readFileSync("lib/release/version.ts","utf8");
const web=/website:\s*"([^"]+)"/.exec(current)?.[1]||"",mini=/miniProgram:\s*"([^"]+)"/.exec(current)?.[1]||"";
let ok=true;
for(const name of fs.readdirSync(dir).filter(x=>x.endsWith(".mjs"))){
 const file=path.join(dir,name),s=fs.readFileSync(file,"utf8");
 const oldWeb=[...s.matchAll(/2026\.09\.30\.\d+/g)].map(x=>x[0]).filter(v=>v!==web);
 const oldMini=[...s.matchAll(/\b4\.\d+\.\d+\b/g)].map(x=>x[0]).filter(v=>v!==mini);
 // Historical version strings are forbidden in executable graduation gates.
 const pass=oldWeb.length===0&&oldMini.length===0;
 console.log(`NO_STALE_VERSION_${name.replaceAll(".","_")}=${pass?"PASS":"FAIL"}`);
 if(!pass){console.log(`STALE=${[...new Set([...oldWeb,...oldMini])].join(",")}`);ok=false}
}
console.log(`CURRENT_RELEASE=${web}/${mini}`);
process.exit(ok?0:1);