import fs from"node:fs";
import path from"node:path";

const roots=["components","lib/seo"];
const bad=[];

function walk(dir){
 if(!fs.existsSync(dir))return;
 for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
  const p=path.join(dir,entry.name);
  if(entry.isDirectory())walk(p);
  else if(/\.(ts|tsx|js|mjs|cjs)$/.test(entry.name)){
   const s=fs.readFileSync(p,"utf8");
   if(/pricing\/tool-policy["']/.test(s))bad.push(`${p}: imports server-only tool-policy`);
   if(/pricing\/policy["']/.test(s))bad.push(`${p}: imports server-only pricing/policy`);
  }
 }
}
for(const root of roots)walk(root);

if(bad.length){
 console.error(bad.join("\n"));
 process.exit(1);
}
console.log("V54R8_CLIENT_SHARED_IMPORT_GRAPH=PASS");
