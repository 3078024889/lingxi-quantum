// One-request bulk snapshot from the public models.dev catalog.
// Attribution and provenance are mandatory. No provider-specific usage statistics inferred.
import {mkdir,writeFile,rename} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
const out=resolve(process.env.AI_MARKET_SNAPSHOT_DIR||'./reports/model-bulk');
const endpoint='https://models.dev/api.json';
const response=await fetch(endpoint,{signal:AbortSignal.timeout(30000),headers:{Accept:'application/json','User-Agent':'LINGXIFIELD-Market-Research'}});
if(!response.ok)throw Error('MODELSDEV_HTTP_'+response.status);
const raw=await response.text();
if(raw.length>30_000_000)throw Error('CATALOG_TOO_LARGE');
const data=JSON.parse(raw);
if(!data||typeof data!=='object'||Array.isArray(data))throw Error('INVALID_PROVIDER_CATALOG');
const collectedAt=new Date().toISOString(),rows=[];
for(const [providerId,provider]of Object.entries(data)){
 if(!provider||typeof provider!=='object'||!provider.models||typeof provider.models!=='object')continue;
 for(const [modelId,model]of Object.entries(provider.models)){
  if(!model||typeof model!=='object')continue;
  rows.push({providerId,providerName:provider.name||providerId,modelId,modelName:model.name||modelId,
    inputUsdPerMillion:typeof model.cost?.input==='number'?model.cost.input:null,
    outputUsdPerMillion:typeof model.cost?.output==='number'?model.cost.output:null,
    contextLimit:Number.isFinite(model.limit?.context)?model.limit.context:null,
    outputLimit:Number.isFinite(model.limit?.output)?model.limit.output:null,
    modalities:model.modalities||null,sourceUrl:endpoint,collectedAt,verification:'third_party_aggregated_unverified_against_provider'});
 }
}
if(!rows.length)throw Error('NO_MODELS_RETURNED');
rows.sort((a,b)=>a.providerId.localeCompare(b.providerId)||a.modelId.localeCompare(b.modelId));
await mkdir(out,{recursive:true});
const body=JSON.stringify({source:'models.dev',sourceUrl:endpoint,collectedAt,notice:'Third-party aggregation. Prices and specifications require cross-check with each model provider; no global traffic, downloads or SEO/GEO claims.',providerCount:Object.keys(data).length,modelCount:rows.length,records:rows},null,2)+'\n';
const dest=resolve(out,'modelsdev-bulk.json');
await writeFile(dest+'.tmp',body);await rename(dest+'.tmp',dest);
const sha256=createHash('sha256').update(body).digest('hex');
await writeFile(dest+'.sha256',sha256+'  modelsdev-bulk.json\n');
console.log(JSON.stringify({file:dest,models:rows.length,providers:Object.keys(data).length,sha256,source:endpoint,verifiedAgainstPublishers:false}));
