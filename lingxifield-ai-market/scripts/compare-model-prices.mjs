// Compare two attributed models.dev snapshots. No ranking scores or unverified price claims.
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const dir=resolve(process.env.AI_MARKET_SNAPSHOT_DIR||'./reports/model-bulk');
const oldPath=process.env.AI_MARKET_PREVIOUS_MODELS_FILE;
const latest=JSON.parse(await readFile(resolve(dir,'modelsdev-bulk.json'),'utf8'));
if(!oldPath){console.log(JSON.stringify({status:'no_previous_snapshot',models:latest.records?.length||0,changes:[],note:'Price changes require two independently stored collection snapshots.'}));process.exit(0)}
const prev=JSON.parse(await readFile(resolve(oldPath),'utf8'));
if(prev.source!=='models.dev'||latest.source!=='models.dev'||!Array.isArray(prev.records)||!Array.isArray(latest.records))throw Error('INCOMPATIBLE_SNAPSHOTS');
const key=x=>String(x.providerId)+'/'+String(x.modelId);
const index=new Map(prev.records.map(x=>[key(x),x]));
const changes=[];
for(const x of latest.records){
 const before=index.get(key(x));if(!before)continue;
 for(const field of ['inputUsdPerMillion','outputUsdPerMillion']){
  const a=before[field],b=x[field];if(typeof a!=='number'||typeof b!=='number'||a===b||!Number.isFinite(a)||!Number.isFinite(b))continue;
  changes.push({id:key(x),field,old:a,new:b,delta:b-a,oldSnapshotAt:prev.collectedAt,newSnapshotAt:latest.collectedAt,
    source:'models.dev',verification:'aggregator_observed_change_requires_publisher_review'});
 }
}
changes.sort((a,b)=>a.id.localeCompare(b.id)||a.field.localeCompare(b.field));
const report={status:'compared',previousAt:prev.collectedAt,latestAt:latest.collectedAt,changes:changes.slice(0,10000),totalChanges:changes.length,
 notice:'Source-reported catalog differences only, not proven publisher price changes.'};
await mkdir(dir,{recursive:true});await writeFile(resolve(dir,'model-price-changes.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:report.status,totalChanges:report.totalChanges,file:resolve(dir,'model-price-changes.json')}));
