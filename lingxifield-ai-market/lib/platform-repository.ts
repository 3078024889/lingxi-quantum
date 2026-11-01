import {platforms,type Platform} from './data';
import {entries} from './catalog-store';
import {createSearchIndex} from './search-index.mjs';
import type {CatalogEntry} from './catalog-engine.mjs';
import {latestFacts,factLabels,type FactKey} from './reviewed-product-facts';
import {OFFER_GUIDE} from './offer-guide';
import {accessFor} from './platform-access-facts';
import {capabilityKeywords} from './capability-profiles';
import {researchedFact} from './market-researched-facts';
import {companyEvidenceFor} from './market-company-evidence';
import {PRODUCT_STRENGTHS} from './market-missing-strengths';
import {matchesMarketFilter,matchesMarketPayment,compareMarketSort,type MarketFilter,type MarketPayment,type MarketSort} from './market-v36-screening';
import {shortDramaEvidence,shortDramaSummary} from './market-v36-screening';
import type {RegionCode} from './global-region-market';
const seed=new Map(platforms.map(p=>[p.id,p]));
type SearchableCatalogEntry=CatalogEntry & {searchTerms?:string[]};
const records=new Map<string,SearchableCatalogEntry>(platforms.map(p=>[p.id,{id:p.id,name:p.name,company:p.company,category:p.category,website:p.website,description:p.about,status:'unverified',updatedAt:'2026-10-29T00:00:00Z',capabilities:p.features}]));
for(const item of entries)if(item.status!=='discontinued')records.set(item.id,item);
// Keep functions and categories clean. Price, login, payment and textual selling points
// are indexed ONLY as hidden search terms, never masquerading as product capabilities.
for(const [id,entry] of records){
 const guide=OFFER_GUIDE[id],access=accessFor(id),research=researchedFact(id),reviewed=latestFacts(id)?.facts;
 const searchableEvidence=Object.values(reviewed||{}).flatMap(fact=>fact&&typeof fact.text==='string'?[fact.text]:[]);
 const paymentTerms=(access?.paymentSource?access.payment.filter(x=>!/不支持|不接受|not accepted|not supported/i.test(x)):[])||[];
 const videoTerms=shortDramaEvidence(id)?['短视频','短剧','视频生成','AI视频','text-to-video','video creation',shortDramaSummary(id,'zh')||'',shortDramaSummary(id,'en')||'']:[];
 const terms=[...(guide?.tasks||[]),...videoTerms,...capabilityKeywords(id),guide?.strengths||'',guide?.reasoning||'',guide?.free||'',guide?.paid||'',guide?.cost||'',...(access?.login||[]),...paymentTerms,...(research?.payments||[]),research?.price||'',research?.free||'',research?.region||'',research?.commercial||'',access?.models||'',access?.limitations||'',...searchableEvidence].filter(Boolean);
 if(terms.length)records.set(id,{...entry,searchTerms:[...new Set(terms)]});
}
const index=createSearchIndex([...records.values()]);
export function toPlatform(e:CatalogEntry):Platform {
 const prior=seed.get(e.id);const facts=latestFacts(e.id)?.facts;
 const research=researchedFact(e.id);
 const reviewed=Object.entries(facts||{}).map(([key,fact])=>({label:factLabels[key as FactKey],...fact}));
 const stronger=[{label:'价格',text:research?.price,source:research?.priceSource},
 {label:'免费额度',text:research?.free,source:research?.freeSource},
 {label:'地区可用性',text:research?.region,source:research?.regionSource},
 {label:'商用条件',text:research?.commercial,source:research?.commercialSource},
 {label:'模型与用量',text:research?.models,source:research?.modelsSource}]
 .filter((x):x is {label:string;text:string;source:string}=>Boolean(x.text&&x.source))
 .map(x=>({...x,scope:'官方所述具体产品/套餐范围；非全部产品通用',checkedAt:'2026-10-31'}));
 const conditions=[...reviewed.filter(f=>!stronger.some(x=>x.label===f.label)),...stronger];
 const evidence=companyEvidenceFor(e.id);
 const baseGuide=OFFER_GUIDE[e.id],strength=PRODUCT_STRENGTHS[e.id];
 const guide=baseGuide?.strengths||!strength?baseGuide:baseGuide?
  {...baseGuide,strengths:strength.text,source:baseGuide.source||strength.source}:
  {tasks:e.capabilities,free:research?.free||'参考官方开源或免费使用方式',
   paid:research?.price||'付费服务与本地执行成本分别核算',
   cost:research?.price||'本地运行需自行提供计算资源',
   payment:'自托管或 API 计费依对应服务',
   region:research?.region||'本地使用依设备及模型许可',
   source:strength.source,checkedAt:'2026-11-01',strengths:strength.text};
 const original=prior||{symbol:'◇'};
 // A missing figure is omitted, not fabricated; software libraries are not listed corporations.
 return {...original,id:e.id,name:e.name,company:e.company,category:e.category,about:e.description,
  symbol:prior?.symbol||'◇',
  year:evidence?.founded?.text||'',location:evidence?.headquarters?.text||'',
  funding:evidence?.funding?.text||'',listing:evidence?.listing?.text||'',
  restrictions:research?.region||(!/待核验|以官网为准|未知|暂无/i.test(prior?.restrictions||'')?prior?.restrictions:'')||'',
  visits:'',downloads:'',seo:'',geo:'',
  features:e.capabilities,website:e.website,
  websiteKind:e.websiteKind||(new URL(e.website).hostname==='github.com'?'repository':'official'),
  repositoryUrl:e.repositoryUrl||(new URL(e.website).hostname==='github.com'?e.website:undefined),
  source:e.website,domain:new URL(e.website).hostname,guide,
  price:research?.price||guide?.cost||facts?.price?.text||'',
  free:research?.free||guide?.free||facts?.free?.text||'',
  score:null,trend:null,conditions};
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
