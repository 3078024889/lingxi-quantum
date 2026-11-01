/**
 * Independent SEO and GEO evidence cannot be inferred from a catalog listing.
 * Search Console only measures LINGXIFIELD's own pages, never competitor ranks.
 * All vendor comparisons require same-market/time/query/methodology observations.
 */
import {createHash} from 'node:crypto';
import observations from '../data/seo-geo-observations.json';
import {entries} from './catalog-store';
import {platforms} from './data';
export type SeoGeoSource='google_search_console'|'bing_webmaster'|'independent_serp'|'ai_answer_citation';
export type SeoGeoObservation={
 id:string;platformId:string;source:SeoGeoSource;observedAt:string;country:string;language:string;query:string;
 model?:string;modelVersion?:string;engine?:string;captureGroupId?:string;sourceProperty?:string;sourcePage?:string;sourceDate?:string;
 reviewedBy?:string;reviewReason?:string;sourceUrl:string;recordHash:string;methodVersion:string;
 sampleCount:number;rawCaptureSha256?:string;position?:number;impressions?:number;clicks?:number;mentions?:number;citations?:number;
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
 if(typeof o.reviewedBy!=='string'||!/^[-a-zA-Z0-9_.@]{2,80}$/.test(o.reviewedBy))return false;
 if(typeof o.reviewReason!=='string'||o.reviewReason.trim().length<20||o.reviewReason.length>500)return false;
 if(typeof o.sponsored!=='boolean')return false;
 if(o.source==='ai_answer_citation'&&(!o.model||!o.modelVersion||!o.engine))return false;
 if((o.source==='independent_serp'||o.source==='ai_answer_citation')&&(typeof o.captureGroupId!=='string'||!/^[-a-zA-Z0-9_.:]{8,128}$/.test(o.captureGroupId)))return false;
 if((o.source==='independent_serp'||o.source==='ai_answer_citation')&&(typeof o.rawCaptureSha256!=='string'||!(/^[0-9a-f]{64}$/.test(o.rawCaptureSha256))))return false;
 if(o.source==='google_search_console'){
  if(o.sourceUrl!=='https://search.google.com/search-console/performance/search-analytics')return false;
  if(typeof o.sourceProperty!=='string'||typeof o.sourcePage!=='string'||typeof o.sourceDate!=='string')return false;
  if(!/^\d{4}-\d{2}-\d{2}$/.test(o.sourceDate)||!Number.isFinite(Date.parse(o.sourceDate+'T00:00:00Z'))||o.observedAt!==o.sourceDate+'T12:00:00Z')return false;
  if(o.country!=='GLOBAL'||!Number.isInteger(o.impressions)||Number(o.impressions)<3||!Number.isInteger(o.clicks)||Number(o.clicks)<0||Number(o.clicks)>Number(o.impressions)||typeof o.position!=='number'||!Number.isFinite(o.position)||Number(o.position)<1)return false;
  if(o.sampleCount!==o.impressions)return false;
  try{
   const page=new URL(o.sourcePage);
   if(page.protocol!=='https:'||page.username||page.password||page.port||page.search||page.hash||!['ai.lingxifield.com','ai.lingxifield.cn','market.lingxifield.com','market.lingxifield.cn'].includes(page.hostname))return false;
   const route=page.pathname.match(/^\/(?:([a-z]{2})\/)?platform\/([a-z0-9][a-z0-9-]{0,79})\/?$/);
   if(!route||(route[1]||'zh')!==o.language||route[2]!==o.platformId)return false;
   let propertyHost='';
   if(o.sourceProperty.startsWith('sc-domain:'))propertyHost=o.sourceProperty.slice('sc-domain:'.length).toLowerCase();
   else{const property=new URL(o.sourceProperty);if(property.protocol!=='https:'||property.pathname!=='/'||property.search||property.hash)return false;propertyHost=property.hostname.toLowerCase();}
   if(!propertyHost||!(page.hostname===propertyHost||page.hostname.endsWith('.'+propertyHost)))return false;
   const base={property:o.sourceProperty,page:o.sourcePage,query:o.query,date:o.sourceDate,impressions:o.impressions,clicks:o.clicks,position:o.position};
   const digest=createHash('sha256').update(JSON.stringify(base)).digest('hex');
   if(o.recordHash!=='sha256:'+digest||o.id!=='gsc-'+digest.slice(0,24))return false;
  }catch{return false;}
 }
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
  const key=[row.source,row.country,row.language,row.query,row.model||'',row.modelVersion||'',row.engine||'',row.methodVersion,row.observedAt.slice(0,10),row.captureGroupId||''].join('|');
  const list=groups.get(key)||[];list.push(row);groups.set(key,list);
 }
 return [...groups.values()].filter(rows=>rows.length>=2&&rows.every(x=>!x.sponsored)&&new Set(rows.map(x=>x.platformId)).size===rows.length).map(rows=>({key:[rows[0].source,rows[0].country,rows[0].language,rows[0].query,rows[0].modelVersion||'',rows[0].captureGroupId||''].filter(Boolean).join(' · '),count:rows.length,
  rows:rows.slice().sort((a,b)=>rows[0].source==='ai_answer_citation'?(b.citations??0)-(a.citations??0):(a.position??Infinity)-(b.position??Infinity)).map(x=>({platformId:x.platformId,position:x.position??null,mentions:x.mentions??null,citations:x.citations??null,sourceUrl:x.sourceUrl,observedAt:x.observedAt,model:x.model||null,modelVersion:x.modelVersion||null,rawCaptureSha256:x.rawCaptureSha256||null}))}));
}
