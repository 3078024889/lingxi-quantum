// Package B: evidence-first metric histories and apples-to-apples ranking.
export const METRICS=Object.freeze({
  website_visits:{direction:'desc',unit:'visits',category:'traffic'},
  hf_downloads:{direction:'desc',unit:'downloads',category:'repository'},
  hf_likes:{direction:'desc',unit:'likes',category:'repository'},
  output_tokens_per_second:{direction:'desc',unit:'tokens/s',category:'benchmark'},
  first_token_latency_ms:{direction:'asc',unit:'ms',category:'benchmark'},
  price_per_million_input_tokens:{direction:'asc',unit:'USD/1M input tokens',category:'price'},
  price_per_image:{direction:'asc',unit:'USD/image',category:'price'},
  geo_citation_rate:{direction:'desc',unit:'ratio',category:'geo'}
});
const VERIFIED=new Set(['official_verified','third_party_verified','independently_measured']);
const day=/^\d{4}-\d{2}-\d{2}$/;
const validDate=s=>typeof s==='string'&&day.test(s)&&!Number.isNaN(Date.parse(s+'T00:00:00Z'))&&new Date(s+'T00:00:00Z').toISOString().slice(0,10)===s;
const isHttps=s=>{try{const u=new URL(s);return u.protocol==='https:'&&!u.username&&!u.password;}catch{return false;}};
export function validateMeasurement(x){
 if(!x||typeof x!=='object'||Array.isArray(x))return null;
 const def=METRICS[x.metric];
 if(!def||typeof x.entityId!=='string'||!/^[-\w:%./]{3,250}$/.test(x.entityId))return null;
 if(typeof x.value!=='number'||!Number.isFinite(x.value)||x.value<0||!validDate(x.day))return null;
 if(x.unit!==def.unit||!isHttps(x.sourceUrl)||!VERIFIED.has(x.verification))return null;
 if(typeof x.provider!=='string'||!x.provider.trim()||x.provider.length>100)return null;
 for(const field of ['region','period','methodology','sample'])if(typeof x[field]!=='string'||!x[field].trim()||x[field].length>120)return null;
 if(def.category==='geo'&&x.value>1)return null;
 if(x.metric==='hf_likes'||x.metric==='hf_downloads'||x.metric==='website_visits'){
  if(!Number.isSafeInteger(x.value))return null;
 }
 return {entityId:x.entityId,metric:x.metric,value:x.value,unit:x.unit,day:x.day,region:x.region,
  period:x.period,methodology:x.methodology,sample:x.sample,provider:x.provider,
  sourceUrl:x.sourceUrl,verification:x.verification};
}
export function comparableKey(x){return [x.metric,x.unit,x.day,x.region,x.period,x.methodology,x.sample].join('|');}
export function buildRanking(measurements,{metric,day,region,period,methodology,sample,limit=100}={}){
 if(!METRICS[metric]||!validDate(day)||!region||!period||!methodology||!sample||!Number.isInteger(limit)||limit<1||limit>500)throw Error('INVALID_RANKING_SCOPE');
 const scope=[metric,METRICS[metric].unit,day,region,period,methodology,sample].join('|');
 const latest=new Map();
 for(const raw of measurements){
  const x=validateMeasurement(raw);
  if(!x||comparableKey(x)!==scope)continue;
  // If more than one verified source reports an entity for the same period, do not silently pick a value.
  const prior=latest.get(x.entityId);
  if(latest.has(x.entityId)){latest.set(x.entityId,null);continue;}
  latest.set(x.entityId,x);
 }
 const direction=METRICS[metric].direction==='asc'?1:-1;
 const ranked=[...latest.values()].filter(Boolean).sort((a,b)=>direction*(a.value-b.value)||a.entityId.localeCompare(b.entityId)).slice(0,limit);
 return {scope,metric,day,region,period,methodology,sample,ranked:ranked.map((x,i)=>({...x,rank:i+1})),
   excludedConflicts:[...latest].filter(([,v])=>v===null).map(([id])=>id),isOrganic:true,advertisersInfluenceRanking:false};
}
export function historyFor(measurements,{entityId,metric,region,period,methodology,sample,start,end}){
 if(!METRICS[metric]||!validDate(start)||!validDate(end)||start>end)throw Error('INVALID_HISTORY_SCOPE');
 const grouped=new Map();
 for(const raw of measurements){
  const x=validateMeasurement(raw);
  if(!x||x.entityId!==entityId||x.metric!==metric||x.region!==region||x.period!==period||
   x.methodology!==methodology||x.sample!==sample||x.day<start||x.day>end)continue;
  if(grouped.has(x.day))grouped.set(x.day,null);else grouped.set(x.day,x);
 }
 return [...grouped.entries()].filter(([,v])=>v).sort(([a],[b])=>a.localeCompare(b)).map(([,v])=>({day:v.day,value:v.value,sourceUrl:v.sourceUrl}));
}
export function compareEntities(measurements,entityIds,scope){
 if(!Array.isArray(entityIds)||entityIds.length<2||entityIds.length>5||new Set(entityIds).size!==entityIds.length)throw Error('INVALID_COMPARISON');
 const ranked=buildRanking(measurements,{...scope,limit:500});
 const byId=new Map(ranked.ranked.map(x=>[x.entityId,x]));
 return entityIds.map(entityId=>({entityId,measurement:byId.get(entityId)||null}));
}
