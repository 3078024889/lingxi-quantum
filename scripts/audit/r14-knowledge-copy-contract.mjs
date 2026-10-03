import fs from"node:fs";

const path="components/KnowledgeWorkspace.tsx";
const s=fs.readFileSync(path,"utf8");
const bad=[];

const copyStart=s.indexOf("const COPY");
const trStart=s.indexOf("function tr(");
if(copyStart<0||trStart<0||trStart<=copyStart){
 bad.push("COPY/tr structure missing");
}else{
 const copyBlock=s.slice(copyStart,trStart);
 const copyKeys=new Set(
  [...copyBlock.matchAll(/(?:^|\n|\s)([A-Za-z][A-Za-z0-9]*):c\(/g)].map(m=>m[1])
 );
 const trKeys=new Set(
  [...s.matchAll(/tr\(lang,\s*"([A-Za-z][A-Za-z0-9]*)"\)/g)].map(m=>m[1])
 );

 for(const key of trKeys){
  if(!copyKeys.has(key))bad.push(`tr key missing from COPY: ${key}`);
 }

 for(const required of["copyAll","copied","book","learning","research","sending","done"]){
  if(!copyKeys.has(required))bad.push(`required COPY key missing: ${required}`);
 }
}

if(bad.length){
 console.error(bad.join("\n"));
 process.exit(1);
}
console.log("R14_KNOWLEDGE_COPY_KEYS_COMPLETE=PASS");
console.log("R14_TR_CALLS_RESOLVE_TO_COPY=PASS");
console.log("R14_COPYALL_PRESERVED=PASS");
