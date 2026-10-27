/** Fail-closed health report for isolated internal snapshot store. */
import {readFile,readdir,writeFile} from "node:fs/promises";
import {resolve,join} from "node:path";
const dir=resolve(process.env.AI_MARKET_STORE_DIR??"reports/ai-market-store");
const files=(await readdir(dir)).filter(x=>/^openrouter-\d{4}-\d{2}-\d{2}\.json$/.test(x)).sort();
if(!files.length)throw new Error("No persisted daily snapshots");
const history=JSON.parse(await readFile(join(dir,"history.json"),"utf8"));
if(history.publicationStatus!=="internal-review-only"||history.source!=="openrouter")throw new Error("Invalid publication gate");
if(!Array.isArray(history.observations)||history.observations.length!==files.length)throw new Error("History does not match persisted snapshot count");
const newest=history.observations.at(-1);
const ageHours=(Date.now()-Date.parse(newest.observedAt))/3600000;
if(!Number.isFinite(ageHours)||ageHours<0||ageHours>48)throw new Error("Latest observation is stale or invalid");
const count=Object.keys(history.series??{}).length;
if(count<1)throw new Error("No model series in store");
const report={status:"healthy",checkedAt:new Date().toISOString(),latestObservation:newest.observedAt,ageHours:Number(ageHours.toFixed(2)),snapshots:files.length,models:count,publicationStatus:"internal-review-only"};
await writeFile(join(dir,"health.json"),JSON.stringify(report,null,2)+"\n");
console.log(JSON.stringify(report));
