// Public HF model metadata only: downloads are Hub-specific, not global usage.
// Respect HF rate limits. No auth, bypass, scraped reviews or guessed commercial plans.
import {mkdir,writeFile,rename} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
const dir=resolve(process.env.AI_MARKET_SNAPSHOT_DIR||'./reports/model-bulk');
const endpoint=new URL('https://huggingface.co/api/models');
const limit=Math.min(1000,Math.max(20,Math.trunc(Number(process.env.HF_MODELS_LIMIT)||500)));
endpoint.searchParams.set('limit',String(limit));
endpoint.searchParams.set('sort','downloads');endpoint.searchParams.set('direction','-1');
const response=await fetch(endpoint,{signal:AbortSignal.timeout(35000),headers:{Accept:'application/json','User-Agent':'LINGXIFIELD-Market-Research'}});
if(!response.ok)throw Error('HF_MODELS_HTTP_'+response.status);
const raw=await response.text();if(raw.length>15_000_000)throw Error('HF_MODELS_RESPONSE_TOO_LARGE');
const input=JSON.parse(raw);if(!Array.isArray(input))throw Error('HF_MODELS_SCHEMA_INVALID');
const collectedAt=new Date().toISOString(),seen=new Set(),records=[];
for(const x of input){
 if(!x||typeof x.id!=='string'||x.private||x.disabled||seen.has(x.id))continue;
 seen.add(x.id);const tags=Array.isArray(x.tags)?x.tags.filter(v=>typeof v==='string').slice(0,40):[];
 const n=v=>Number.isSafeInteger(v)&&v>=0?v:null;
 records.push({id:x.id,name:x.id.split('/').at(-1),organization:x.author||x.id.split('/')[0]||null,
  url:'https://huggingface.co/'+x.id.split('/').map(encodeURIComponent).join('/'),
  task:x.pipeline_tag||null,license:tags.find(t=>t.startsWith('license:'))?.slice(8)||null,
  downloadsOnHub:n(x.downloads),likesOnHub:n(x.likes),lastModified:x.lastModified||null,
  tags,commercialPricing:null,freeAllowance:null,chinaAvailability:null,
  source:'huggingface_hub_models',sourceCollectedAt:collectedAt,
  verification:'hub_reported_metadata_not_global_downloads_or_quality'});
}
if(!records.length)throw Error('EMPTY_HF_MODELS');
const payload=JSON.stringify({source:'huggingface_hub_models',sourceUrl:endpoint.toString(),collectedAt,
 modelCount:records.length,records,notice:'HF downloads and likes are platform-specific; license tags are metadata and must be checked against model card.'},null,2)+'\n';
await mkdir(dir,{recursive:true});const dest=resolve(dir,'hf-models-catalog.json');
await writeFile(dest+'.tmp',payload);await rename(dest+'.tmp',dest);
const sha256=createHash('sha256').update(payload).digest('hex');
await writeFile(dest+'.sha256',sha256+'  hf-models-catalog.json\n');
console.log(JSON.stringify({source:'huggingface_hub_models',models:records.length,file:dest,sha256}));
