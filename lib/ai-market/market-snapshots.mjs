import {buildRanking,historyFor,validateMeasurement,METRICS} from './market-engine.mjs';
export function snapshotFromObservations(observations,scope,{generatedAt=new Date().toISOString(),version='market-b1'}={}){
 if(!Array.isArray(observations))throw Error('INVALID_OBSERVATIONS');
 const ranking=buildRanking(observations,scope);
 const verified=observations.map(validateMeasurement).filter(Boolean);
 const comparable=verified.filter(x=>[x.metric,x.unit,x.day,x.region,x.period,x.methodology,x.sample].join('|')===ranking.scope);
 return {metric:scope.metric,snapshotDay:scope.day,region:scope.region,period:scope.period,
  methodology:scope.methodology,sample:scope.sample,generationVersion:version,generatedAt,
  results:ranking.ranked.map(x=>({entityId:x.entityId,value:x.value,rank:x.rank,sourceUrl:x.sourceUrl})),
  sourceObservationCount:comparable.length,conflictCount:ranking.excludedConflicts.length,
  reviewed:false,publiclyIndexable:false};
}
export function computeChange(observations,scope,{entityId,baselineDay}){
 const points=historyFor(observations,{...scope,entityId,start:baselineDay,end:scope.day});
 const start=points.find(x=>x.day===baselineDay);
 const end=points.find(x=>x.day===scope.day);
 if(!start||!end)return {change:null,percentChange:null,reason:'INSUFFICIENT_COMPARABLE_HISTORY'};
 const change=end.value-start.value;
 if(start.value===0)return {change,percentChange:null,reason:'ZERO_BASELINE'};
 return {change,percentChange:change/start.value*100,reason:null};
}
export function paretoFront(records,{costKey='cost',qualityKey='quality'}={}){
 if(!Array.isArray(records))throw Error('INVALID_POINTS');
 const good=records.filter(r=>r&&typeof r.id==='string'&&Number.isFinite(r[costKey])&&r[costKey]>=0&&Number.isFinite(r[qualityKey])&&r[qualityKey]>=0);
 return good.filter(r=>!good.some(o=>o!==r&&o[costKey]<=r[costKey]&&o[qualityKey]>=r[qualityKey]&&(o[costKey]<r[costKey]||o[qualityKey]>r[qualityKey])));
}
