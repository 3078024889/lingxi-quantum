// Source adapters for public AI market metadata. No inferred site traffic, app users or GEO scores.
// Public repository popularity is NOT equivalent to worldwide AI platform popularity.
import {createHash} from 'node:crypto';
const ID=/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;
const clean=(s,max=256)=>typeof s==='string'&&s.length<=max?s.trim():'';
const date=x=>typeof x==='string'&&!Number.isNaN(Date.parse(x))?new Date(x).toISOString():null;
const nonnegative=x=>Number.isSafeInteger(x)&&x>=0?x:null;
export const SOURCE_INFO=Object.freeze({
 'hf-models':{endpoint:'https://huggingface.co/api/models?sort=lastModified&direction=-1&limit=100',class:'official_repository_api',scope:'Hugging Face model repositories only'},
 'hf-spaces':{endpoint:'https://huggingface.co/api/spaces?sort=lastModified&direction=-1&limit=100',class:'official_repository_api',scope:'Hugging Face Spaces only'},
 'modelsdev':{endpoint:'https://models.dev/api.json?type=all',class:'independent_aggregator',scope:'Public model and provider price directory; provider terms require verification'},
 'openrouter':{endpoint:'https://openrouter.ai/api/v1/models',class:'reseller_official_api',scope:'OpenRouter routed-model pricing, NOT every model vendor price'}
});
const stable=x=>Array.isArray(x)?x.map(stable):x&&typeof x==='object'?Object.fromEntries(Object.keys(x).sort().map(k=>[k,stable(x[k])])):x;
export const evidenceHash=x=>createHash('sha256').update(JSON.stringify(stable(x))).digest('hex');
function item(source,id,name,url,modified,fields){
 if(!id||id.length>280||!name||!url.startsWith('https://'))return null;
 const facts=stable(fields);
 return {source,upstreamId:id,name:name.slice(0,250),sourceUrl:url,upstreamUpdatedAt:date(modified),facts,
  sourceClass:SOURCE_INFO[source].class,scope:SOURCE_INFO[source].scope,
  contentSha256:evidenceHash({name,url,modified:date(modified),facts}),reviewStatus:'candidate'};
}
function hub(source,payload){
 if(!Array.isArray(payload))throw Error('HUB_PAYLOAD_INVALID');
 return payload.map(x=>{
  if(!ID.test(x?.id||'')||x.private===true)return null;
  const group=x.id.split('/'),path=source==='hf-spaces'?'spaces/':'';
  return item(source,x.id,group[1],'https://huggingface.co/'+path+x.id,x.lastModified,{
   owner:group[0],downloads:source==='hf-models'?nonnegative(x.downloads):null,
   likes:nonnegative(x.likes),pipelineTag:clean(x.pipeline_tag,100)||null,
   sdk:source==='hf-spaces'?clean(x.sdk,100)||null:null,
   repositorySha:clean(x.sha,64)||null,
   license:clean(x.cardData?.license,100)||null,
   gated:x.gated===true,disabled:x.disabled===true
  });
 }).filter(Boolean);
}
function modelsdev(payload){
 if(!payload||typeof payload!=='object'||Array.isArray(payload))throw Error('MODELSDEV_PAYLOAD_INVALID');
 const items=[];
 for(const [providerId,provider] of Object.entries(payload)){
  if(!/^[\w.-]{1,90}$/.test(providerId)||!provider||typeof provider!=='object')continue;
  const models=provider.models||{};
  for(const [modelId,model] of Object.entries(models)){
   if(!model||typeof model!=='object'||!clean(modelId,180))continue;
   const id=providerId+':'+modelId;
   // Costs are upstream claims, not official verified prices. Do not convert differing units.
   items.push(item('modelsdev',id,clean(model.name)||modelId,
    'https://models.dev/',model.release_date||null,{
     provider:providerId,modelId,modelName:clean(model.name)||modelId,
     context:nonnegative(model.limit?.context),outputLimit:nonnegative(model.limit?.output),
     vision:model.modalities?.input?.includes('image')===true,
     costSource:model.cost||null,upstreamKnowledge:'aggregated_unverified'
    }));
  }
 }
 return items.filter(Boolean);
}
function openrouter(payload){
 if(!Array.isArray(payload?.data))throw Error('OPENROUTER_PAYLOAD_INVALID');
 return payload.data.map(x=>{
  if(!clean(x?.id,220))return null;
  return item('openrouter',x.id,clean(x.name)||x.id,
   'https://openrouter.ai/models/'+encodeURIComponent(x.id),null,{
    modelId:x.id,contextLength:nonnegative(x.context_length),
    inputPricePerToken:clean(x.pricing?.prompt,100)||null,
    outputPricePerToken:clean(x.pricing?.completion,100)||null,
    providerScope:'openrouter_only',created:nonnegative(x.created)
   });
 }).filter(Boolean);
}
export function normalizeSource(source,payload,{limit=5000}={}){
 if(!SOURCE_INFO[source])throw Error('UNKNOWN_SOURCE');
 if(!Number.isInteger(limit)||limit<1||limit>10000)throw Error('INVALID_LIMIT');
 const result=source.startsWith('hf-')?hub(source,payload):source==='modelsdev'?modelsdev(payload):openrouter(payload);
 if(result.length>limit)throw Error('SOURCE_LIMIT_EXCEEDED');
 const seen=new Set();
 for(const rec of result){if(seen.has(rec.upstreamId))throw Error('DUPLICATE_UPSTREAM_ID');seen.add(rec.upstreamId);}
 return result.sort((a,b)=>a.upstreamId.localeCompare(b.upstreamId));
}
export function diffSource(previous,incoming){
 if(!Array.isArray(previous)||!Array.isArray(incoming))throw Error('SOURCE_RECORDS_REQUIRED');
 const old=new Map(previous.map(x=>[x.upstreamId,x]));
 const added=[],changed=[],unchanged=[];
 for(const row of incoming){
  const before=old.get(row.upstreamId);
  if(!before)added.push(row);
  else if(before.contentSha256!==row.contentSha256)changed.push({before,after:row});
  else unchanged.push(row);
 }
 // A bounded, latest-modified feed is not a full inventory.
 // Never infer deletion solely from a record missing in the latest page.
 return {added,changed,unchanged,missingNotDeleted:previous.filter(x=>!incoming.some(y=>y.upstreamId===x.upstreamId)),
  publicationApproved:false};
}
