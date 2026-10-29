/** Compare two reviewed OpenRouter snapshots without publishing third-party records. */
import {readFile,writeFile,mkdir} from "node:fs/promises";
import {resolve,join} from "node:path";
import {validateCatalogSnapshot} from "./ai-market-snapshot-guard.mjs";
const [oldPath,newPath]=process.argv.slice(2);
if(!oldPath||!newPath)throw new Error("Usage: node scripts/ai-market-history-report.mjs OLD.json NEW.json");
const read=async path=>{
 const doc=JSON.parse(await readFile(resolve(path),"utf8"));
 const verdict=validateCatalogSnapshot(doc,{maxAgeHours:24*365*5,minModels:1});
 if(!verdict.ok)throw new Error(path+": "+verdict.errors.join("; "));
 return doc;
};
const old=await read(oldPath),now=await read(newPath);
if(Date.parse(old.observedAt)>=Date.parse(now.observedAt))throw new Error("Snapshot dates must be increasing");
const oldMap=new Map(old.models.map(m=>[m.id,m]));
const changes=[];
for(const m of now.models){
 const prev=oldMap.get(m.id);
 if(!prev)continue;
 for(const field of ["prompt","completion"]){
  const a=prev.pricing?.[field],b=m.pricing?.[field];
  if(a==null||b==null||a===""||b==="")continue;
  const before=Number(a),after=Number(b);
  if(!Number.isFinite(before)||!Number.isFinite(after)||before<0||after<0||before===after)continue;
  changes.push({id:m.id,field,beforeUsdPerToken:before,afterUsdPerToken:after,changePct:before===0?null:Number(((after-before)/before*100).toFixed(4))});
 }
}
changes.sort((a,b)=>a.id.localeCompare(b.id)||a.field.localeCompare(b.field));
const report={source:"openrouter",from:old.observedAt,to:now.observedAt,previousCount:old.models.length,currentCount:now.models.length,changedPrices:changes.length,changes,publicationStatus:"internal-review-only"};
await mkdir("reports/ai-market",{recursive:true});
const output=join("reports/ai-market","price-changes.json");
await writeFile(output,JSON.stringify(report,null,2)+"\n");
console.log(JSON.stringify({output,changedPrices:changes.length}));
