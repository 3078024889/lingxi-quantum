/**
 * Independent SEO and GEO evidence cannot be inferred from a catalog listing.
 * Search Console only measures LINGXIFIELD's own pages, never competitor ranks.
 * All vendor comparisons require same-market/time/query/methodology observations.
 */
import observations from '../data/seo-geo-observations.json';
import {entries} from './catalog-store';
import {platforms} from './data';
export type SeoGeoSource='google_search_console'|'bing_webmaster'|'independent_serp'|'ai_answer_citation';
export type SeoGeoObservation={
 id:string;platformId:string;source:SeoGeoSource;observedAt:string;country:string;language:string;query:string;
 model?:string;modelVersion?:string;engine?:string;sourceUrl:string;recordHash:string;methodVersion:string;
 sampleCount:number;position?:number;impressions?:number;clicks?:number;mentions?:number;citations?:number;
 sponsored:boolean;reviewed:boolean;reviewedAt?:string;
};
const allowed=new Set([...platforms.map(p=>p.id),...entries.map(e=>e.id)]);
export function validObservation(x:unknown):x is SeoGeoObservation{
 if(!x||typeof x!=='object')return false;
 const o=x as Record<string,unknown>;
 if(typeof o.id!=='string'||!/^[-a-z0-9_.]{8,128}$/.test(o.id))return false;
 if(typeof o.platformId!=='string'||!allowed.has(o.platformId))return false;
 if(!['google_search_console','bing_webmaster','independent_serp','ai_answer_citation'].includes(String(o.source)))return false;
 if(!['en','ja','ko','fr','de','es','pt','ar','zh'].includes(String(o.language)))return false;
 if(typeof o.query!=='string'||!o.query.trim()||o.query.length>512)return false;
 if(typeof o.country!=='string'||!(/^[A-Z]{2}$/.test(o.country)||o.country==='GLOBAL'))return false;
 if(typeof o.observedAt!=='string'||!/^\d{4}-\d{2}-\d{2}T/.test(o.observedAt)||!Number.isFinite(Date.parse(o.observedAt)))return false;
 if(typeof o.sourceUrl!=='string'||!/^https:\/\//.test(o.sourceUrl))return false;
 if(typeof o.recordHash!=='string'||!/^sha256:[0-9a-f]{64}$/.test(o.recordHash))return false;
 if(typeof o.methodVersion!=='string'||!o.methodVersion.trim())return false;
 if(typeof o.sampleCount!=='number'||!Number.isInteger(o.sampleCount)||o.sampleCount<1)return false;
 if(o.reviewed!==true||typeof o.reviewedAt!=='string'||!Number.isFinite(Date.parse(o.reviewedAt)))return false;
 if(typeof o.sponsored!=='boolean')return false;
 if(o.source==='ai_answer_citation'&&!o.model)return false;
 if(o.source==='google_search_console'&&typeof o.sourceUrl==='string'&&!o.sourceUrl.includes('search.google.com'))return false;
 for(const k of ['position','impressions','clicks','mentions','citations']){
  if(o[k]!==undefined&&(typeof o[k]!=='number'||!Number.isFinite(o[k])||Number(o[k])<0))return false;
 }
 if(o.position!==undefined&&(Number(o.position)<1||!['independent_serp','google_search_console','bing_webmaster'].includes(String(o.source))))return false;
 return true;
}
export const seoGeoObservations:SeoGeoObservation[]=(observations as unknown[]).filter(validObservation);
export function coverageForSeoGeo(){
 const seo=seoGeoObservations.filter(x=>x.source!=='ai_answer_citation');
 const geo=seoGeoObservations.filter(x=>x.source==='ai_answer_citation');
 const independent=seo.filter(x=>x.source==='independent_serp');
 return {catalogProducts:allowed.size,verifiedObservations:seoGeoObservations.length,seoObservations:seo.length,geoObservations:geo.length,independentSerpObservations:independent.length,
  measuredProducts:new Set(seoGeoObservations.map(x=>x.platformId)).size,
  status:seoGeoObservations.length?'partial_evidence':'awaiting_independent_measurements'};
}
export function groupedSeoGeo(){
 const groups=new Map<string,SeoGeoObservation[]>();
 for(const row of seoGeoObservations.filter(x=>x.source==='independent_serp'||x.source==='ai_answer_citation')) {
  const key=[row.source,row.country,row.language,row.query,row.model||'',row.methodVersion,row.observedAt.slice(0,10)].join('|');
  const list=groups.get(key)||[];list.push(row);groups.set(key,list);
 }
 return [...groups.values()].filter(rows=>rows.length>=2&&rows.every(x=>!x.sponsored)).map(rows=>({key:[rows[0].source,rows[0].country,rows[0].query].join(' · '),count:rows.length,
  rows:rows.slice().sort((a,b)=> (a.position??Infinity)-(b.position??Infinity)).map(x=>({platformId:x.platformId,position:x.position??null,mentions:x.mentions??null,citations:x.citations??null,sourceUrl:x.sourceUrl,observedAt:x.observedAt,model:x.model||null}))}));
}
