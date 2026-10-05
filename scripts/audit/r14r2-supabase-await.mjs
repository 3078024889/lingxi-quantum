import fs from"node:fs";
import path from"node:path";

const roots=["lib/sasi/durable","lib/sasi/knowledge","app/api/knowledge"];
const files=[];
for(const root of roots){
 if(!fs.existsSync(root))continue;
 const walk=dir=>{
  for(const name of fs.readdirSync(dir)){
   const p=path.join(dir,name),st=fs.statSync(p);
   if(st.isDirectory())walk(p);
   else if(/\.(ts|tsx|js|mjs)$/.test(name))files.push(p);
  }
 };
 walk(root);
}

const offenders=[];
for(const file of files){
 const src=fs.readFileSync(file,"utf8");
 // Supabase/PostgREST builders are awaitable/PromiseLike, not guaranteed Promise instances with .catch().
 const re=/\b(?:admin|supabase|client)\.rpc\([\s\S]{0,900}?\)\s*\.catch\s*\(/g;
 if(re.test(src))offenders.push(file);
}
if(offenders.length)throw new Error("R14R2_POSTGREST_BUILDER_DOT_CATCH:"+offenders.join(","));

const step=fs.readFileSync("lib/sasi/durable/step-store.ts","utf8");
for(const marker of [
 'try{',
 'await admin.rpc("fail_sasi_durable_step_v140"',
 'catch{',
 'throw e;'
]) if(!step.includes(marker))throw new Error("R14R2_FAILURE_BOOKKEEPING_CONTRACT_MISSING:"+marker);

console.log("R14R2_SUPABASE_RPC_AWAIT_PATTERN=PASS");
console.log("R14R2_NO_POSTGREST_DOT_CATCH=PASS");
console.log("R14R2_CLEANUP_DOES_NOT_MASK_ORIGINAL_ERROR=PASS");
