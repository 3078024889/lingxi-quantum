// Build a bounded, browsable model index from an existing official-source-attributed bulk snapshot.
// Never claim price accuracy: models.dev is a third-party aggregator.
import{readFile,mkdir,writeFile,rename}from'node:fs/promises';
import{resolve}from'node:path';
import{createHash}from'node:crypto';
const dir=resolve(process.env.AI_MARKET_SNAPSHOT_DIR||'./reports/model-bulk');
const source=JSON.parse(await readFile(resolve(dir,'modelsdev-bulk.json'),'utf8'));
if(source.source!=='models.dev'||!Array.isArray(source.records))throw Error('SOURCE_SCHEMA_INVALID');
const normalized=[],ids=new Set();
for(const x of source.records){
 if(!x||typeof x.providerId!=='string'||typeof x.modelId!=='string'||!x.providerId||!x.modelId)continue;
 const id=x.providerId+'/'+x.modelId;if(ids.has(id))continue;ids.add(id);
 const num=v=>typeof v==='number'&&Number.isFinite(v)&&v>=0?v:null;
 normalized.push({id,providerId:x.providerId,providerName:String(x.providerName||x.providerId),
  modelId:x.modelId,name:String(x.modelName||x.modelId),inputUsdPerMillion:num(x.inputUsdPerMillion),
  outputUsdPerMillion:num(x.outputUsdPerMillion),contextLimit:num(x.contextLimit),outputLimit:num(x.outputLimit),
  modalities:x.modalities||null,sourceUrl:source.sourceUrl,sourceCollectedAt:source.collectedAt,
  verification:'third_party_aggregated_unverified_against_provider'});
}
normalized.sort((a,b)=>a.id.localeCompare(b.id));
await mkdir(dir,{recursive:true});const report={source:'models.dev',sourceUrl:source.sourceUrl,sourceCollectedAt:source.collectedAt,modelCount:normalized.length,
 status:'aggregated_unverified',records:normalized};
const body=JSON.stringify(report)+'\n',dest=resolve(dir,'models-index.json');
await writeFile(dest+'.tmp',body);await rename(dest+'.tmp',dest);
const sha256=createHash('sha256').update(body).digest('hex');
await writeFile(dest+'.sha256',sha256+'  models-index.json\n');
console.log(JSON.stringify({file:dest,models:normalized.length,sha256,verifiedAgainstPublishers:false}));
