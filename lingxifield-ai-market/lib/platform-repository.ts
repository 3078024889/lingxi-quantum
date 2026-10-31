import {platforms,type Platform} from './data';
import {entries} from './catalog-store';
import {createSearchIndex} from './search-index.mjs';
import type {CatalogEntry} from './catalog-engine.mjs';
import {latestFacts,factLabels,type FactKey} from './reviewed-product-facts';
import {OFFER_GUIDE} from './offer-guide';
import {accessFor} from './platform-access-facts';
import {capabilityKeywords} from './capability-profiles';
import {matchesMarketFilter,matchesMarketPayment,compareMarketSort,type MarketFilter,type MarketPayment,type MarketSort} from './market-v36-screening';
import type {RegionCode} from './global-region-market';
const seed=new Map(platforms.map(p=>[p.id,p]));
type SearchableCatalogEntry=CatalogEntry & {searchTerms?:string[]};
const records=new Map<string,SearchableCatalogEntry>(platforms.map(p=>[p.id,{id:p.id,name:p.name,company:p.company,category:p.category,website:p.website,description:p.about,status:'unverified',updatedAt:'2026-10-29T00:00:00Z',capabilities:p.features}]));
for(const item of entries)if(item.status!=='discontinued')records.set(item.id,item);
// Keep functions and categories clean. Price, login, payment and textual selling points
// are indexed ONLY as hidden search terms, never masquerading as product capabilities.
for(const [id,entry] of records){
 const guide=OFFER_GUIDE[id],access=accessFor(id),reviewed=latestFacts(id)?.facts;
 const searchableEvidence=Object.values(reviewed||{}).flatMap(fact=>fact&&typeof fact.text==='string'?[fact.text]:[]);
 const paymentTerms=(access?.paymentSource?access.payment.filter(x=>!/不支持|不接受|not accepted|not supported/i.test(x)):[])||[];
 const terms=[...(guide?.tasks||[]),...capabilityKeywords(id),guide?.strengths||'',guide?.reasoning||'',guide?.free||'',guide?.paid||'',guide?.cost||'',...(access?.login||[]),...paymentTerms,access?.models||'',access?.limitations||'',...searchableEvidence].filter(Boolean);
 if(terms.length)records.set(id,{...entry,searchTerms:[...new Set(terms)]});
}
const index=createSearchIndex([...records.values()]);
export function toPlatform(e:CatalogEntry):Platform {
 const prior=seed.get(e.id);const facts=latestFacts(e.id)?.facts;
 const guide=OFFER_GUIDE[e.id];
 return {...(prior||{symbol:'◇',year:'待核验',location:'待核验',funding:'待核验',listing:'待核验',restrictions:'待核验',visits:'—',downloads:'—'}),id:e.id,name:e.name,company:e.company,category:e.category,about:e.description,features:e.capabilities,website:e.website,websiteKind:e.websiteKind||(new URL(e.website).hostname==='github.com'?'repository':'official'),repositoryUrl:e.repositoryUrl||(new URL(e.website).hostname==='github.com'?e.website:undefined),source:e.website,domain:new URL(e.website).hostname,guide,price:guide?.cost||facts?.price?.text||'待核验',free:guide?.free||facts?.free?.text||'待核验',score:null,trend:null,seo:'待核验',geo:'待核验',conditions:Object.entries(facts||{}).map(([key,fact])=>({label:factLabels[key as FactKey],...fact}))};
}
export function findPlatform(id:string){const row=index.get(id);return row?toPlatform(row):undefined;}
export type PlatformSearchOptions={q?:string;category?:string;limit?:number;cursor?:number;filter?:MarketFilter;payment?:MarketPayment;sort?:MarketSort;region?:RegionCode;beginner?:boolean};
export function searchPlatforms(options:PlatformSearchOptions={}) {
 const {filter='all',payment='any',sort='directory',region='GLOBAL',beginner=false,...base}=options;
 const needsFilter=filter!=='all'||payment!=='any'||beginner;
 const cache=new Map<string,Platform>();
 const materialize=(e:CatalogEntry)=>{let p=cache.get(e.id);if(!p){p=toPlatform(e);cache.set(e.id,p);}return p;};
 const matcher=needsFilter?(e:CatalogEntry)=>{
   const p=materialize(e);
   return (!beginner||!['repository','documentation'].includes(p.websiteKind||'official'))
    &&matchesMarketFilter(p,filter,region)&&matchesMarketPayment(p,payment,region);
 }:null;
 const sorter=sort!=='directory'?(a:CatalogEntry,b:CatalogEntry)=>compareMarketSort(materialize(a),materialize(b),sort):null;
 const r=index.search({...base,matcher,sorter});
 return {...r,items:r.items.map(materialize)};
}
