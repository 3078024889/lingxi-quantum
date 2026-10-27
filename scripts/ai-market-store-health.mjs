/** Validate persisted evidence against its source snapshots before reporting health. */
import {readFile,readdir,writeFile} from "node:fs/promises";
import {resolve,join} from "node:path";
import {validateCatalogSnapshot} from "./ai-market-snapshot-guard.mjs";
const dir=resolve(process.env.AI_MARKET_STORE_DIR??"reports/ai-market-store");
const files=(await readdir(dir)).filter(x=>/^openrouter-\d{4}-\d{2}-\d{2}\.json$/.test(x)).sort();
if(!files.length)throw new Error("No persisted daily snapshots");
const history=JSON.parse(await readFile(join(dir,"history.json"),"utf8"));
if(history.publicationStatus!=="internal-review-only"||history.source!=="openrouter")throw new Error("Invalid publication gate");
if(!Array.isArray(history.observations)||history.observations.length!==files.length)throw new Error("History does not match persisted snapshot count");
const newest=history.observations.at(-1);
const ageHours=(Date.now()-Date.parse(newest.observedAt))/3600000;
if(!Number.isFinite(ageHours)||ageHours<0||ageHours>48)throw new Error("Latest observation is stale or invalid");
let last=0;const counts=new Map();
for(let i=0;i<files.length;i++){
 const doc=JSON.parse(await readFile(join(dir,files[i]),"utf8"));
 const checked=validateCatalogSnapshot(doc,{maxAgeHours:24*365*5,minModels:1});
 if(!checked.ok)throw new Error("Invalid source snapshot: "+files[i]);
 const date=Date.parse(doc.observedAt);
 if(date<=last||files[i].slice(11,21)!==doc.observedAt.slice(0,10))throw new Error("Snapshot chronology invalid");
 last=date;
 if(history.observations[i].observedAt!==doc.observedAt||history.observations[i].modelCount!==doc.modelCount)throw new Error("History observation mismatch");
 for(const model of doc.models)counts.set(model.id,(counts.get(model.id)??0)+1);
}
const ids=Object.keys(history.series??{});
if(ids.length!==counts.size)throw new Error("Model series count mismatch");
for(const id of ids)if(!Array.isArray(history.series[id])||history.series[id].length!==counts.get(id))throw new Error("Model series length mismatch");
const report={status:"healthy",checkedAt:new Date().toISOString(),latestObservation:newest.observedAt,ageHours:Number(ageHours.toFixed(2)),snapshots:files.length,models:ids.length,publicationStatus:"internal-review-only"};
await writeFile(join(dir,"health.json"),JSON.stringify(report,null,2)+"\n");
console.log(JSON.stringify(report));
