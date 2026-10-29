/** Build internal chronological series from persisted snapshots; fail on corrupt or mixed evidence. */
import {readdir,readFile,writeFile} from "node:fs/promises";
import {resolve,join} from "node:path";
import {validateCatalogSnapshot} from "./ai-market-snapshot-guard.mjs";
const dir=resolve(process.env.AI_MARKET_STORE_DIR??"reports/ai-market-store");
const files=(await readdir(dir)).filter(x=>/^openrouter-\d{4}-\d{2}-\d{2}\.json$/.test(x)).sort();
if(!files.length)throw new Error("No persisted snapshots");
const observations=[],series=new Map();
let last=0;
for(const name of files){
 const doc=JSON.parse(await readFile(join(dir,name),"utf8"));
 const result=validateCatalogSnapshot(doc,{maxAgeHours:24*365*5,minModels:1});
 if(!result.ok)throw new Error(name+": "+result.errors.join("; "));
 const time=Date.parse(doc.observedAt);
 if(time<=last||doc.observedAt.slice(0,10)!==name.slice(11,21))throw new Error("Invalid chronology or filename");
 last=time;observations.push({observedAt:doc.observedAt,modelCount:doc.modelCount});
 for(const m of doc.models){
  const prices={};
  for(const key of ["prompt","completion"]){const v=m.pricing?.[key];prices[key]=v==null?null:Number(v);}
  if(!series.has(m.id))series.set(m.id,[]);
  series.get(m.id).push({observedAt:doc.observedAt,...prices});
 }
}
const output={source:"openrouter",publicationStatus:"internal-review-only",observations,series:Object.fromEntries([...series].sort(([a],[b])=>a.localeCompare(b)))};
await writeFile(join(dir,"history.json"),JSON.stringify(output,null,2)+"\n");
console.log(JSON.stringify({snapshots:files.length,models:series.size}));
