/** Durable local append-only model observations for internal review. Set AI_MARKET_STORE_DIR to a persistent mounted volume. */
import {readFile,writeFile,mkdir,rename,open} from "node:fs/promises";
import {resolve,join} from "node:path";
import {randomUUID} from "node:crypto";
import {validateCatalogSnapshot} from "./ai-market-snapshot-guard.mjs";
const input=process.argv[2];
if(!input)throw new Error("Usage: node scripts/ai-market-ingest.mjs SNAPSHOT.json");
const dir=resolve(process.env.AI_MARKET_STORE_DIR??"reports/ai-market-store");
const raw=JSON.parse(await readFile(resolve(input),"utf8"));
const checked=validateCatalogSnapshot(raw,{maxAgeHours:24*365,minModels:1});
if(!checked.ok)throw new Error("Rejected snapshot: "+checked.errors.join("; "));
await mkdir(dir,{recursive:true});
const key=raw.observedAt.slice(0,10);
const filename=join(dir,"openrouter-"+key+".json");
let previous=null;
try{previous=JSON.parse(await readFile(filename,"utf8"));}catch(e){if(e.code!=="ENOENT")throw e;}
if(previous){
 if(previous.observedAt===raw.observedAt&&JSON.stringify(previous)===JSON.stringify(raw)){
  console.log(JSON.stringify({status:"already-present",filename}));process.exit(0);
 }
 throw new Error("Conflicting snapshot for "+key+"; manual review required");
}
const temp=join(dir,"."+randomUUID()+".tmp");
try{
 const handle=await open(temp,"wx",0o600);
 try{await handle.writeFile(JSON.stringify(raw)+"\n");await handle.sync();}finally{await handle.close();}
 // No overwrite: a competing ingestion must not silently replace evidence.
 const {link,unlink}=await import("node:fs/promises");
 await link(temp,filename);
 console.log(JSON.stringify({status:"stored",filename,models:raw.modelCount}));
}finally{await (await import("node:fs/promises")).unlink(temp).catch(()=>{});}
