import {findPlatform} from './platform-repository';
import {MARKET_API_PRODUCTS,API_UNIT_RATES} from './market-api-service-catalog';
import {API_RATES,VIDEO_RATES} from './market-rate-catalog';
import {companyEvidenceFor,companyPresentationFor,publisherIdentityFor} from './market-company-evidence';
/** Verified editorial graph, NOT an external estimate of the global AI market.
 * Only 32 curated product identities, their publisher entities and sourced rate offers.
 * No candidate intake rows and no synthetic user popularity or SEO ranks.
 */
export type PublisherKind='company'|'open_source_project'|'software_library';
export type PublisherProfile={
 id:string;name:string;kind:PublisherKind;officialSource:string;productIds:string[];
 legalEntity:string|null;legalEntitySource:string|null;legalEntityScope:'service_operator'|'group_parent'|null;
 ipoFiling:string|null;ipoFilingSource:string|null;
 founded:string|null;foundedSource:string|null;headquarters:string|null;headquartersSource:string|null;
 listingState:'listed_parent'|'unconfirmed'|'not_applicable';listingDetail:string|null;listingSource:string|null;
 funding:string|null;fundingSource:string|null;
};
export type ProductIndexRow={id:string;name:string;companyId:string;kind:PublisherKind;category:string;
 officialUrl:string;source:string;modelRateOffers:number;apiUnitOffers:number};
export type ModelPriceOffer={id:string;productId:string;companyId:string;name:string;
 channel:'token_api'|'video'|'api_unit';billing:string;currency:'CNY'|'USD';
 priceInPerMillion?:number;priceOutPerMillion?:number;pricePerSecond?:number|null;
 amount?:number;unit?:string;region?:string;resolution?:string;source:string;checkedAt:string};
const allIds=[...MARKET_API_PRODUCTS];
const companiesMap=new Map<string,PublisherProfile>();
const productRows:ProductIndexRow[]=[];
for(const id of allIds){
 const owner=publisherIdentityFor(id),product=findPlatform(id),evidence=companyEvidenceFor(id);
 if(!owner||!product||!evidence)throw Error('CURATED_PUBLISHER_EVIDENCE_MISSING:'+id);
 let company=companiesMap.get(owner.id);
 if(!company){
  const presentation=companyPresentationFor(id,product.company);
  company={id:owner.id,name:owner.name,kind:owner.kind,officialSource:owner.officialSource,
   legalEntity:presentation.legalEntity,legalEntitySource:presentation.legalEntitySource,
   legalEntityScope:presentation.legalEntityScope,ipoFiling:presentation.ipoFiling,ipoFilingSource:presentation.ipoFilingSource,
   productIds:[],founded:evidence.founded?.text||null,foundedSource:evidence.founded?.source||null,
   headquarters:evidence.headquarters?.text||null,headquartersSource:evidence.headquarters?.source||null,
   listingState:presentation.listingState,listingDetail:presentation.listingDetail,listingSource:presentation.listingSource,
   funding:evidence.funding?.text||null,fundingSource:evidence.funding?.source||null};
  companiesMap.set(owner.id,company);
 }
 if(company.kind!==owner.kind)throw Error('COMPANY_KIND_MISMATCH:'+owner.id);
 company.productIds.push(id);
 const modelRates=API_RATES.filter(x=>x.platform===id).length+VIDEO_RATES.filter(x=>x.platform===id).length;
 const apiRates=API_UNIT_RATES.filter(x=>x.platform===id).length;
 productRows.push({id,name:product.name,companyId:owner.id,kind:owner.kind,
  category:product.category,officialUrl:product.website,source:product.source||owner.officialSource,
  modelRateOffers:modelRates,apiUnitOffers:apiRates});
}
export const MARKET_COMPANIES=[...companiesMap.values()].map(p=>({...p,productIds:[...p.productIds].sort()}))
 .sort((a,b)=>a.name.localeCompare(b.name,'en')||a.id.localeCompare(b.id)) as readonly PublisherProfile[];
export const MARKET_COMPANY_PRODUCTS=productRows as readonly ProductIndexRow[];
const byProduct=new Map(productRows.map(x=>[x.id,x]));
export const MARKET_MODEL_OFFERS:readonly ModelPriceOffer[]=[
 ...API_RATES.map(r=>({
   id:'token:'+r.id,productId:r.platform,companyId:byProduct.get(r.platform)?.companyId||'',
   name:r.model,channel:'token_api' as const,billing:'per_million_tokens',currency:r.currency,
   priceInPerMillion:r.inPerMillion,priceOutPerMillion:r.outPerMillion,
   source:r.source,checkedAt:r.checkedAt
 })),
 ...VIDEO_RATES.map(r=>({
   id:'video:'+r.id,productId:r.platform,companyId:byProduct.get(r.platform)?.companyId||'',
   name:r.model,channel:'video' as const,billing:r.billing,currency:r.currency,
   pricePerSecond:r.perSecond,region:r.region,resolution:r.resolution,
   source:r.source,checkedAt:r.checkedAt
 })),
 ...API_UNIT_RATES.map(r=>({
   id:'api_unit:'+r.id,productId:r.platform,companyId:byProduct.get(r.platform)?.companyId||'',
   name:r.name,channel:'api_unit' as const,billing:'per_unit',currency:r.currency,
   amount:r.price,unit:r.unit,source:r.source,checkedAt:r.checkedAt
 }))
];
for(const item of MARKET_MODEL_OFFERS){
 if(!byProduct.has(item.productId)||!companiesMap.has(item.companyId)||
  !/^https:\/\//.test(item.source)||Number.isNaN(Date.parse(item.checkedAt))||
  item.name.trim().length===0)throw Error('RATE_PUBLISHER_OR_EVIDENCE_MISSING:'+item.id);
}
function searchPage<T extends {id:string}>(rows:readonly T[],{q='',limit=24,cursor=0}:{
 q?:string;limit?:number;cursor?:number}={},makeSearch?:(r:T)=>string){
 const phrase=q.normalize('NFKC').toLocaleLowerCase();
 const matched=phrase?rows.filter(x=>(makeSearch?makeSearch(x):x.id).normalize('NFKC').toLocaleLowerCase().includes(phrase)):rows;
 const end=cursor+limit;
 return {total:matched.length,limit,cursor,nextCursor:end<matched.length?end:null,items:matched.slice(cursor,end)};
}
export function listPublishers({q='',kind,limit=24,cursor=0}:{
 q?:string;kind?:PublisherKind;limit?:number;cursor?:number}={}){
 const source=kind?MARKET_COMPANIES.filter(x=>x.kind===kind):MARKET_COMPANIES;
 return searchPage(source,{q,limit,cursor},x=>[x.name,x.id,...x.productIds].join(' '));
}
export function findPublisher(id:string){
 const publisher=MARKET_COMPANIES.find(x=>x.id===id);
 if(!publisher)return null;
 return {...publisher,products:MARKET_COMPANY_PRODUCTS.filter(x=>x.companyId===id),
  offers:MARKET_MODEL_OFFERS.filter(x=>x.companyId===id)};
}
export function listModelOffers({q='',productId='',companyId='',channel,limit=24,cursor=0}:{
 q?:string;productId?:string;companyId?:string;channel?:ModelPriceOffer['channel'];limit?:number;cursor?:number}={}){
 const scoped=MARKET_MODEL_OFFERS.filter(x=>
  (!productId||x.productId===productId)&&(!companyId||x.companyId===companyId)&&(!channel||x.channel===channel));
 return searchPage(scoped,{q,limit,cursor},x=>[x.name,x.productId,x.companyId,x.billing,x.region||''].join(' '));
}
export function marketRegistrySummary(){
 return {curatedProducts:allIds.length,publishers:MARKET_COMPANIES.length,
  incorporatedCompanies:MARKET_COMPANIES.filter(x=>x.kind==='company').length,
  openProjects:MARKET_COMPANIES.filter(x=>x.kind==='open_source_project').length,
  softwareLibraries:MARKET_COMPANIES.filter(x=>x.kind==='software_library').length,
  rateOffers:MARKET_MODEL_OFFERS.length,
  note:'Publisher profiles are deduplicated from only 32 curated products. Rate offers are pricing rows, not distinct model counts, and not global company totals.'};
}
