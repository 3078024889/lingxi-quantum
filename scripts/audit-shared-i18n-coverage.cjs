const fs=require("fs"),path=require("path");
const root=process.argv[2]||process.cwd();
const p=path.join(root,"lib","lingxi-i18n.ts");
const s=fs.readFileSync(p,"utf8");

function blockFor(name){
  const re=new RegExp(`const\\s+${name}\\b[\\s\\S]*?(?=\\nconst\\s+[A-Z]{2}\\b|\\nconst\\s+dictionaries\\b)`);
  const m=s.match(re);
  return m?m[0]:"";
}
function keysFor(name){
  const block=blockFor(name);
  return [...block.matchAll(/\b([A-Za-z][A-Za-z0-9]*):/g)].map(x=>x[1]);
}

const base=new Set(keysFor("ZH"));
console.log(`ZH base keys: ${base.size}`);
let failed=0;
for(const lang of ["EN","JA","KO","FR","DE","ES","PT","AR"]){
  const set=new Set(keysFor(lang));
  const missing=[...base].filter(k=>!set.has(k));
  console.log(`${lang}: ${set.size}/${base.size} keys; missing ${missing.length}`);
  if(missing.length){
    failed++;
    console.log("  "+missing.join(", "));
  }
}
if(failed) process.exitCode=2;
