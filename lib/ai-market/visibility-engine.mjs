export const OBSERVATION_KINDS=Object.freeze(['search_performance','ai_citation_probe']);
const SOURCES=new Set(['google_search_console','bing_webmaster','controlled_ai_probe']);
const https=u=>{try{const x=new URL(u);return x.protocol==='https:'&&!x.username&&!x.password}catch{return false}};
const date=d=>typeof d==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(d)&&!Number.isNaN(Date.parse(d+'T00:00:00Z'))&&new Date(d+'T00:00:00Z').toISOString().startsWith(d);
const label=x=>typeof x==='string'&&x.length>0&&x.length<=250;
export function validateVisibilityObservation(x){
 if(!x||typeof x!=='object'||!OBSERVATION_KINDS.includes(x.kind)||!SOURCES.has(x.source)||!label(x.site)||!label(x.query)||!label(x.region)||!label(x.language)||!date(x.day)||!https(x.evidenceUrl))return null;
 if(x.kind==='search_performance'){
  if(!['google_search_console','bing_webmaster'].includes(x.source)||!['web','chat','all'].includes(x.surface))return null;
  if(x.source==='google_search_console'&&x.surface!=='web')return null;
  if(!Number.isSafeInteger(x.clicks)||x.clicks<0||!Number.isSafeInteger(x.impressions)||x.impressions<0||x.clicks>x.impressions)return null;
  if(x.averagePosition!=null&&(!Number.isFinite(x.averagePosition)||x.averagePosition<1))return null;
  return {...x,ctr:x.impressions?x.clicks/x.impressions:null,verified:x.verified===true};
 }
 if(x.source!=='controlled_ai_probe'||!label(x.modelVersion)||!label(x.methodVersion)||!label(x.promptHash)||!Number.isSafeInteger(x.sampleSize)||x.sampleSize<1||
  !Number.isSafeInteger(x.citationCount)||x.citationCount<0||x.citationCount>x.sampleSize||!label(x.captureMethod))return null;
 return {...x,citationRate:x.citationCount/x.sampleSize,verified:x.verified===true};
}
export function groupVisibility(records,{kind,source,site,region,language,day,methodVersion,modelVersion,surface}){
 const eligible=records.map(validateVisibilityObservation).filter(x=>x&&x.verified&&x.kind===kind&&x.source===source&&x.site===site&&x.region===region&&x.language===language&&x.day===day&&
 (kind!=='ai_citation_probe'||x.methodVersion===methodVersion&&x.modelVersion===modelVersion)&&
 (kind!=='search_performance'||x.surface===surface));
 const byQuery=new Map();
 for(const x of eligible){
  if(byQuery.has(x.query)){byQuery.set(x.query,null);continue;}
  byQuery.set(x.query,x);
 }
 return {scope:{kind,source,site,region,language,day,methodVersion,modelVersion,surface},observations:[...byQuery.values()].filter(Boolean),excludedConflicts:[...byQuery].filter(([,v])=>v===null).map(([q])=>q),measurementOnly:true};
}
export function citationVisibility(group){
 if(group?.scope?.kind!=='ai_citation_probe')throw Error('NOT_CITATION_SCOPE');
 const samples=group.observations.reduce((n,x)=>n+x.sampleSize,0);
 const cited=group.observations.reduce((n,x)=>n+x.citationCount,0);
 return {samples,cited,rate:samples?cited/samples:null,note:'Sampled citations only; not global rank or search demand'};
}
export function searchSummary(group){
 if(group?.scope?.kind!=='search_performance')throw Error('NOT_SEARCH_SCOPE');
 const clicks=group.observations.reduce((n,x)=>n+x.clicks,0);
 const impressions=group.observations.reduce((n,x)=>n+x.impressions,0);
 return {clicks,impressions,ctr:impressions?clicks/impressions:null,position:null,note:'Average position cannot be pooled without impression weights; omitted'};
}
