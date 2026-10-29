import {METRICS,historyFor,buildRanking} from './market-engine.mjs';
const day=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&!Number.isNaN(Date.parse(s+'T00:00:00Z'))&&new Date(s+'T00:00:00Z').toISOString().slice(0,10)===s;
const simple=s=>typeof s==='string'&&s.length>=1&&s.length<=120&&/^[a-zA-Z0-9_.:-]+$/.test(s);
export function parseMetricScope(p){
 const get=k=>p?.get?.(k);
 const metric=get('metric'),dayValue=get('day'),region=get('region'),period=get('period'),methodology=get('methodology'),sample=get('sample');
 if(!Object.hasOwn(METRICS,metric)||!day(dayValue)||![region,period,methodology,sample].every(simple))return null;
 return {metric,day:dayValue,region,period,methodology,sample};
}
export function verifiedMeasurements(rows,evidence){
 const evidenceMap=new Map((evidence||[]).filter(e=>e?.checked===true&&e.id!=null).map(e=>[String(e.id),e]));
 return (rows||[]).flatMap(row=>{
  const proof=evidenceMap.get(String(row.evidence_id));
  if(!proof||proof.entity_id!==row.entity_id||proof.source_url!==row.source_url)return [];
  const value=Number(row.value);
  if(typeof row.value!=='number'&&!(typeof row.value==='string'&&row.value.trim()!==''))return [];
  if(!Number.isFinite(value))return [];
  return [{entityId:row.entity_id,metric:row.metric,day:row.observed_day,value,unit:row.unit,
   region:row.region,period:row.period,methodology:row.methodology,sample:row.sample,
   provider:row.provider,sourceUrl:row.source_url,verification:row.verification}];
 });
}
export function rankVerifiedRows(rows,evidence,scope){
 const observations=verifiedMeasurements(rows,evidence);
 const r=buildRanking(observations,scope);
 return {metric:r.metric,day:r.day,region:r.region,period:r.period,methodology:r.methodology,sample:r.sample,
  results:r.ranked.map(x=>({entityId:x.entityId,rank:x.rank,value:x.value,unit:x.unit,sourceUrl:x.sourceUrl})),
  conflicts:r.excludedConflicts,scopeOnly:true,unverifiedExcluded:true};
}
export function verifiedHistory(rows,evidence,scope,entityId,start,end){
 if(!day(start)||!day(end)||start>end||!simple(entityId))return null;
 return historyFor(verifiedMeasurements(rows,evidence),{...scope,entityId,start,end});
}
