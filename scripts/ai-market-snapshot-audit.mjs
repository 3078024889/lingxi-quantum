/** Offline audit of a directory of observed model snapshots. No public publication. */
import {readdir,readFile,mkdir,writeFile} from "node:fs/promises";
import {join} from "node:path";
import {validateCatalogSnapshot} from "./ai-market-snapshot-guard.mjs";
const dir=process.argv[2]??"reports/ai-market";
const files=(await readdir(dir)).filter(f=>/^openrouter-\d{4}-\d{2}-\d{2}\.json$/.test(f)).sort();
if(!files.length)throw new Error("No snapshots available for audit");
const series=new Map(),observations=[];
let previous=0;
for(const filename of files){
 const data=JSON.parse(await readFile(join(dir,filename),"utf8"));
 const valid=validateCatalogSnapshot(data,{maxAgeHours:24*365*5,minModels:1});
 if(!valid.ok)throw new Error(filename+": "+valid.errors.join("; "));
 const time=Date.parse(data.observedAt);
 if(time<=previous)throw new Error("Non-increasing snapshot time: "+filename);
 if(filename.slice(11,21)!==data.observedAt.slice(0,10))throw new Error("Filename/date mismatch: "+filename);
 previous=time;
 observations.push({filename,observedAt:data.observedAt,models:data.modelCount});
 for(const model of data.models){
  const prices={};
  for(const field of ["prompt","completion"]){
   const value=model.pricing?.[field];
   prices[field]=value==null?null:Number(value);
  }
  if(!series.has(model.id))series.set(model.id,[]);
  series.get(model.id).push({observedAt:data.observedAt,...prices});
 }
}
const result={schemaVersion:1,source:"openrouter",publicationStatus:"internal-review-only",observations,modelSeriesCount:series.size,series:Object.fromEntries([...series].sort(([a],[b])=>a.localeCompare(b)))};
await mkdir(dir,{recursive:true});
await writeFile(join(dir,"history-audit.json"),JSON.stringify(result,null,2)+"\n");
console.log(JSON.stringify({observations:observations.length,modelSeriesCount:series.size}));
