/** GitHub Actions artifact snapshot: no external data committed or redistributed. */
import {readFile,writeFile,mkdir,readdir} from "node:fs/promises";
import {join} from "node:path";
import {validateCatalogSnapshot} from "./ai-market-snapshot-guard.mjs";
const folder="reports/ai-market";
const files=(await readdir(folder).catch(()=>[])).filter(n=>/^openrouter-\d{4}-\d{2}-\d{2}\.json$/.test(n)).sort();
const rows=[];
for(const name of files){
 const doc=JSON.parse(await readFile(join(folder,name),"utf8"));
 const check=validateCatalogSnapshot(doc,{maxAgeHours:24*365,minModels:1});
 if(!check.ok)throw new Error(name+": "+check.errors.join("; "));
 rows.push({name,observedAt:doc.observedAt,modelCount:doc.modelCount});
}
await mkdir(folder,{recursive:true});
await writeFile(join(folder,"manifest.json"),JSON.stringify({generatedAt:new Date().toISOString(),source:"https://openrouter.ai/api/v1/models",snapshots:rows,publicationStatus:"internal-review-only"},null,2)+"\n");
console.log("Verified "+rows.length+" snapshot files");
