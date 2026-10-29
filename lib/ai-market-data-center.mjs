// Global AI data center: identities and evidence are different from rank measurements.
export const ENTITY_TYPES=Object.freeze(['company','product','model','version']);
export const REVIEW_STATUSES=Object.freeze(['candidate','verified','rejected','discontinued']);
export function canonicalId(type,source,upstreamId){
 if(!ENTITY_TYPES.includes(type)||!['huggingface','openalex','manual'].includes(source))throw Error('INVALID_IDENTITY_NAMESPACE');
 if(typeof upstreamId!=='string'||upstreamId.length<1||upstreamId.length>250)throw Error('INVALID_UPSTREAM_ID');
 return [type,source,encodeURIComponent(upstreamId)].join(':');
}
export function normalizeInput(record,observedAt=new Date().toISOString()){
 if(!record||typeof record!=='object'||Array.isArray(record))throw Error('INVALID_RECORD');
 const {type,source,upstreamId,name,sourceUrl}=record;
 const id=canonicalId(type,source,upstreamId);
 if(typeof name!=='string'||!name.trim()||name.length>250)throw Error('INVALID_NAME');
 let url;try{url=new URL(sourceUrl);}catch{throw Error('INVALID_SOURCE_URL');}
 if(url.protocol!=='https:'||url.username||url.password)throw Error('INVALID_SOURCE_URL');
 if(source==='huggingface'&&url.hostname!=='huggingface.co')throw Error('SOURCE_DOMAIN_MISMATCH');
 if(source==='openalex'&&!['openalex.org','api.openalex.org'].includes(url.hostname))throw Error('SOURCE_DOMAIN_MISMATCH');
 if(!Number.isFinite(Date.parse(observedAt)))throw Error('INVALID_TIME');
 return {id,type,source,upstreamId,name:name.trim(),sourceUrl:url.href,
  observedAt,status:'candidate',externalUrl:typeof record.website==='string'?record.website:null,
  metadata:record.metadata&&typeof record.metadata==='object'&&!Array.isArray(record.metadata)?record.metadata:{}};
}
export function reconcileSnapshot(existing,incoming){
 if(!Array.isArray(existing)||!Array.isArray(incoming))throw Error('INVALID_DATA');
 const records=new Map();
 for(const record of existing){if(!record||typeof record.id!=='string'||records.has(record.id))throw Error('CORRUPTED_EXISTING');records.set(record.id,record);}
 let inserted=0,changed=0,unchanged=0;
 for(const raw of incoming){
  const record=normalizeInput(raw,raw.observedAt);
  const previous=records.get(record.id);
  if(!previous){records.set(record.id,record);inserted++;continue;}
  if(previous.status!=='candidate'){unchanged++;continue;}
  const next={...previous,...record,firstSeenAt:previous.firstSeenAt||previous.observedAt,
   lastSeenAt:record.observedAt,status:'candidate'};
  if(previous.name===next.name&&previous.sourceUrl===next.sourceUrl&&JSON.stringify(previous.metadata)===JSON.stringify(next.metadata))unchanged++;else changed++;
  records.set(record.id,next);
 }
 return {records:[...records.values()].sort((a,b)=>a.id.localeCompare(b.id)),stats:{inserted,changed,unchanged,total:records.size},publicationApproved:false};
}
export function publicSearch(records,query,{kind='all',limit=25}={}){
 if(!Array.isArray(records)||typeof query!=='string'||query.length>120||!Number.isInteger(limit)||limit<1||limit>100)return [];
 const q=query.normalize('NFKC').toLowerCase().trim();
 return records.filter(x=>x.status==='verified'&&(kind==='all'||x.type===kind))
  .map(x=>({value:x,score:!q?1:x.name.normalize('NFKC').toLowerCase()===q?100:x.name.normalize('NFKC').toLowerCase().includes(q)?50:0}))
  .filter(x=>x.score>0).sort((a,b)=>b.score-a.score||a.value.id.localeCompare(b.value.id))
  .slice(0,limit).map(x=>x.value);
}
