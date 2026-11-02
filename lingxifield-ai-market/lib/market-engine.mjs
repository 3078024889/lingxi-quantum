// V2.4 pure data engine: immutable observations, deterministic ranking, no fabricated values.
export const LANGUAGES = Object.freeze(['en','ja','ko','fr','de','es','pt','ar','zh']);
export const METRICS = Object.freeze(['monthly_visits','app_downloads','seo_visibility','geo_citations','funding_usd','task_cost']);
const required = (v) => typeof v === 'string' && v.trim().length > 0;
export function validRecord(r) {
  if (!r || typeof r !== 'object' || Array.isArray(r)) return false;
  if (![r.id,r.platformId,r.metric,r.unit,r.region,r.provider,r.sourceUrl,r.collectedAt,r.methodology].every(required)) return false;
  if (!METRICS.includes(r.metric) || !['official','third_party','independent_test'].includes(r.evidenceKind) || !['verified','pending','disputed'].includes(r.status)) return false;
  if (r.value !== null && (typeof r.value !== 'number' || !Number.isFinite(r.value) || r.value < 0)) return false;
  if (![r.periodStart,r.periodEnd].every(v=>/^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v+'T00:00:00Z')))) return false;
  if (r.periodStart > r.periodEnd || !Number.isFinite(Date.parse(r.collectedAt))) return false;
  try {const u=new URL(r.sourceUrl);if (u.protocol !== 'https:' || u.username || u.password) return false;}catch{return false;}
  return true;
}
export function mergeRecords(existing,incoming) {
  const records=new Map();
  for (const r of existing) {if(!validRecord(r))throw new Error('Invalid historical evidence: '+r?.id);if(records.has(r.id))throw new Error('Duplicate historical id: '+r.id); records.set(r.id,r);}
  let inserted=0,identical=0;
  for(const r of incoming){if(!validRecord(r))throw new Error('Invalid incoming evidence: '+r?.id);if(records.has(r.id)){if(JSON.stringify(records.get(r.id))!==JSON.stringify(r))throw new Error('Immutable evidence conflict: '+r.id);identical++;}else{records.set(r.id,r);inserted++;}}
  return {records:[...records.values()].sort((a,b)=>a.id.localeCompare(b.id)),inserted,identical};
}
export function queryRecords(rows,{platformId='',metric='',region='',status='verified',limit=50,offset=0}={}) {
 const cap=Math.max(1,Math.min(100,Number.isFinite(Number(limit))?Math.floor(Number(limit)):50));
 const skip=Math.max(0,Number.isFinite(Number(offset))?Math.floor(Number(offset)):0);
 const filtered=rows.filter(r=>validRecord(r)&&(!platformId||r.platformId===platformId)&&(!metric||r.metric===metric)&&(!region||r.region===region)&&(!status||r.status===status))
 .sort((a,b)=>b.periodEnd.localeCompare(a.periodEnd)||b.collectedAt.localeCompare(a.collectedAt)||a.id.localeCompare(b.id));
 return {total:filtered.length,offset:skip,limit:cap,data:filtered.slice(skip,skip+cap)};
}
export function latestSnapshot(rows,{metric,region='global'}={}) {
 if(!METRICS.includes(metric))throw new Error('Invalid metric');
 const rowsByPlatform=new Map();
 for(const r of rows){if(!validRecord(r)||r.status!=='verified'||r.value===null||r.metric!==metric||r.region!==region)continue;
 const old=rowsByPlatform.get(r.platformId);
 if(!old || r.periodEnd>old.periodEnd||(r.periodEnd===old.periodEnd&&r.collectedAt>old.collectedAt)) rowsByPlatform.set(r.platformId,r);
 }
 return [...rowsByPlatform.values()].sort((a,b)=>metric==='task_cost'?a.value-b.value:b.value-a.value||a.platformId.localeCompare(b.platformId));
}
export function history(rows,{platformId,metric,region='global'}={}){
 return rows.filter(r=>validRecord(r)&&r.status==='verified'&&r.value!==null&&r.platformId===platformId&&r.metric===metric&&r.region===region).sort((a,b)=>a.periodEnd.localeCompare(b.periodEnd)||a.collectedAt.localeCompare(b.collectedAt));
}
