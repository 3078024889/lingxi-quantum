import {validRecord} from './market-engine.mjs';
const metrics=['monthly_visits','app_downloads','seo_visibility','geo_citations','funding_usd','task_cost'];
const sortRecords=(a,b)=>b.periodEnd.localeCompare(a.periodEnd)||b.collectedAt.localeCompare(a.collectedAt)||a.id.localeCompare(b.id);
/**
 * @param {{catalog?: unknown[], companies?: unknown[], evidence?: any[], experiences?: unknown[]}} input
 */
export function coverageReport({catalog=[],companies=[],evidence=[],experiences=[]}={}){
 const verified=evidence.filter(r=>validRecord(r)&&r.status==='verified'&&r.value!==null);
 const byMetric=Object.fromEntries(metrics.map(m=>[m,{verifiedRecords:verified.filter(r=>r.metric===m).length,coveredPlatforms:new Set(verified.filter(r=>r.metric===m).map(r=>r.platformId)).size}]));
 return {dataStatus:verified.length?'partial_verified_data':'no_verified_market_data',catalogEntries:catalog.length,companyProfiles:companies.length,evidenceRecords:evidence.length,verifiedRecords:verified.length,experienceRecords:experiences.length,byMetric,updatedAt:null};
}
/**
 * @param {any[]} rows
 * @param {{metric?: string, region?: string, periodEnd?: string, provider?: string, limit?: number}} options
 */
export function comparableRanking(rows,{metric='monthly_visits',region='global',periodEnd='',provider='',limit=100}={}){
 if(!metrics.includes(metric))throw Error('INVALID_METRIC');
 const candidates=rows.filter(r=>validRecord(r)&&r.status==='verified'&&r.value!==null&&r.metric===metric&&r.region===region&&(!periodEnd||r.periodEnd===periodEnd)&&(!provider||r.provider===provider));
 const groups=new Map();
 for(const r of candidates){const key=[r.periodStart,r.periodEnd,r.unit,r.provider,r.methodology].join('|');const group=groups.get(key)||[];group.push(r);groups.set(key,group);}
 const cohorts=[...groups.entries()].sort((a,b)=>b[1].length-a[1].length||b[1][0].periodEnd.localeCompare(a[1][0].periodEnd)||a[0].localeCompare(b[0]));
 const cohort=cohorts[0]?.[1]||[];
 const latest=new Map();for(const r of [...cohort].sort(sortRecords)){if(!latest.has(r.platformId))latest.set(r.platformId,r)}
 const records=[...latest.values()].sort((a,b)=>metric==='task_cost'?a.value-b.value||a.platformId.localeCompare(b.platformId):b.value-a.value||a.platformId.localeCompare(b.platformId));
 const capped=Math.min(100,Math.max(1,Math.floor(Number(limit)||100)));
 return {status:records.length?'verified_comparable_cohort':'no_verified_comparable_records',cohort:cohort.length?{periodStart:cohort[0].periodStart,periodEnd:cohort[0].periodEnd,unit:cohort[0].unit,provider:cohort[0].provider,methodology:cohort[0].methodology}:null,excludedVerifiedRecords:candidates.length-cohort.length,total:records.length,items:records.slice(0,capped).map((r,i)=>({rank:i+1,...r}))};
}
/**
 * @param {any[]} rows
 * @param {{platformId: string, metric: string, region?: string, limit?: number}} options
 */
export function platformTimeline(rows,{platformId,metric,region='global',limit=100}={}){
 const filtered=rows.filter(r=>validRecord(r)&&r.status==='verified'&&r.value!==null&&r.platformId===platformId&&r.metric===metric&&r.region===region).sort((a,b)=>a.periodEnd.localeCompare(b.periodEnd)||a.collectedAt.localeCompare(b.collectedAt));
 return {platformId,metric,region,total:filtered.length,items:filtered.slice(-Math.min(1000,Math.max(1,Math.floor(Number(limit)||100))))};
}
