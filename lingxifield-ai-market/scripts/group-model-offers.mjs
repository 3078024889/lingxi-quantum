// Group repeated *exact* model identifiers across service providers, without assuming aliases are identical.
// Never delete or overwrite models-index.json; offers remain individually attributable.
import {readFile,writeFile,rename} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
const dir=resolve(process.env.AI_MARKET_SNAPSHOT_DIR||'./reports/model-bulk');
const source=JSON.parse(await readFile(resolve(dir,'models-index.json'),'utf8'));
if(source.source!=='models.dev'||!Array.isArray(source.records))throw Error('INVALID_MODEL_INDEX');
const groups=new Map();
for(const r of source.records){
 if(typeof r.modelId!=='string'||typeof r.providerId!=='string')continue;
 const key=r.modelId.trim().toLowerCase();
 if(!key)continue;
 if(!groups.has(key))groups.set(key,{modelId:r.modelId,name:r.name,offers:[]});
 groups.get(key).offers.push({id:r.id,providerId:r.providerId,providerName:r.providerName,
  inputUsdPerMillion:r.inputUsdPerMillion,outputUsdPerMillion:r.outputUsdPerMillion,
  contextLimit:r.contextLimit,sourceUrl:r.sourceUrl});
}
const list=[...groups.values()].map(g=>{
 const prices=g.offers.map(x=>x.inputUsdPerMillion).filter(x=>typeof x==='number'&&Number.isFinite(x)&&x>=0);
 return {...g,providerCount:g.offers.length,lowestObservedInputUsdPerMillion:prices.length?Math.min(...prices):null};
}).sort((a,b)=>b.providerCount-a.providerCount||a.modelId.localeCompare(b.modelId));
const report={source:'models.dev',sourceCollectedAt:source.sourceCollectedAt,grouping:'exact_case_insensitive_model_id_only',
 warning:'Different model ids are not merged; shared identifiers do not prove identical endpoints or quality. Price comparisons are aggregator claims.',totalOffers:source.records.length,distinctModelIdentifiers:list.length,groups:list};
const body=JSON.stringify(report)+'\n',dest=resolve(dir,'model-offer-groups.json');
await writeFile(dest+'.tmp',body);await rename(dest+'.tmp',dest);
const digest=createHash('sha256').update(body).digest('hex');await writeFile(dest+'.sha256',digest+'  model-offer-groups.json\n');
console.log(JSON.stringify({totalOffers:report.totalOffers,distinctModelIdentifiers:list.length,file:dest,sha256:digest}));
