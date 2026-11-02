/** Thirty candidate products => editorial review model. Never import into the 32-product public catalog. */
export const CANDIDATE_FACT_ORDER=Object.freeze(['price','free','models','regions','commercial','payment','company']);
const REGIONAL_BANS=/export|sanction|embargo|restrictions_only|prohibited|provider_model_specific|per_model/i;
const LEGAL_NAMES=Object.freeze({
 'cursor':'Anysphere, Inc.',
 'leonardo':'Leonardo Interactive Pty Ltd',
 'mistral-le-chat':'Mistral AI',
 'adobe-firefly':null, // different contracting entities by geographic region
 'recraft':'Recraft Inc.',
 'synthesia':'Synthesia Limited',
 'freepik-ai':'Freepik Company, S.L.',
 'heygen':'HeyGen Technology Inc.',
 'elicit':'Elicit Research, PBC',
 'consensus':'Consensus NLP, Inc.',
 'scite':'Scite, LLC',
 'replicate':'Replicate, LLC',
 'fal-ai':'Features & Labels, Inc.',
 'together-ai':'Together Computer, Inc.',
 'groqcloud':'Groq, Inc.',
 'openrouter':'OpenRouter, Inc.'
});
function officialUrl(url,hosts){
 try{
  const u=new URL(url);
  return u.protocol==='https:'&&!u.username&&!u.password&&!u.port&&
   hosts.some(h=>u.hostname.toLowerCase()===h.toLowerCase()||
    u.hostname.toLowerCase().endsWith('.'+h.toLowerCase()));
 }catch{return false}
}
function normalizeFact(raw,hosts){
 if(!raw||!['observed','missing','conflict'].includes(raw.status))throw Error('INVALID_CANDIDATE_FACT');
 if(raw.status==='missing')return {status:'missing',text:null,source:null,checkedAt:null,scope:null,extra:[]};
 if(!officialUrl(raw.source,hosts)||typeof raw.text!=='string'||raw.text.trim().length<15||
  !/^20\d\d-\d\d-\d\d$/.test(raw.checkedAt)||typeof raw.scope!=='string')
  throw Error('UNTRUSTED_CANDIDATE_FACT_SOURCE');
 const extra=(raw.additionalEvidence||[]).map(e=>{
  if(!officialUrl(e.source,hosts)||e.status!=='observed'||typeof e.text!=='string'||typeof e.checkedAt!=='string')
   throw Error('UNTRUSTED_CANDIDATE_SUPPLEMENTAL_SOURCE');
  return {text:e.text,source:e.source,checkedAt:e.checkedAt,scope:e.scope};
 });
 return {status:raw.status,text:raw.text,source:raw.source,checkedAt:raw.checkedAt,scope:raw.scope,extra};
}
export function materializeCandidateCatalog(cohorts,observations){
 if(!Array.isArray(cohorts)||cohorts.length!==3||!Array.isArray(observations)||observations.length!==3)
  throw Error('REQUIRE_THREE_CANDIDATE_BATCHES');
 const obsByBatch=new Map(observations.map(o=>[o.batch,o]));
 if(obsByBatch.size!==3)throw Error('DUPLICATE_OBSERVATION_BATCH');
 const products=[],usedIds=new Set(),groupNames=new Map();
 for(const cohort of cohorts){
  if(cohort.products?.length!==10||cohort.visibleToPublic!==false||
   cohort.reviewState!=='candidate'||cohort.intakePaused!==true)throw Error('CANDIDATE_BATCH_NOT_HELD');
  const observed=obsByBatch.get(cohort.batch);
  if(!observed||observed.products?.length!==10)throw Error('OBSERVATION_COUNT_MISMATCH');
  const byId=new Map(observed.products.map(p=>[p.id,p]));
  if(byId.size!==10)throw Error('DUPLICATE_OBSERVATION_ID');
  for(const sourceProduct of cohort.products){
   const id=sourceProduct.id,record=byId.get(id);
   if(usedIds.has(id)||!record||record.reviewStatus!=='unapproved'||
    sourceProduct.publishApproved!==false||sourceProduct.reviewed!==false||
    !sourceProduct.publisherGroupId)throw Error('CANDIDATE_ID_APPROVAL_OR_EVIDENCE_MISSING:'+id);
   usedIds.add(id);
   const hosts=record.officialHosts;
   if(!Array.isArray(hosts)||!hosts.length||!officialUrl(sourceProduct.website,hosts))
    throw Error('CANDIDATE_ORIGIN_MISMATCH:'+id);
   const facts={};
   for(const key of CANDIDATE_FACT_ORDER)facts[key]=normalizeFact(record.facts?.[key],hosts);
   const legal=LEGAL_NAMES[id]||null;
   // In the evidence, a legal entity is a separate claim from a product brand or parent group.
   if(legal&&!(facts.company.status==='observed'&&facts.company.text.includes(legal)))
    throw Error('LEGAL_ENTITY_WITHOUT_OFFICIAL_SOURCE:'+id);
   const region=facts.regions;
   const regionalEvidence=region.status==='missing'?'not_documented':
    REGIONAL_BANS.test(region.scope||'')?'restriction_or_model_specific':'source_statement_not_country_verification';
   const published=false;
   const result={id,name:sourceProduct.name,company:sourceProduct.company,
    legalEntity:legal,legalEntitySource:legal?facts.company.source:null,
    parentGroupId:sourceProduct.publisherGroupId,
    parentGroup:sourceProduct.publisherGroupId==='spacex'?'SpaceX':sourceProduct.publisherGroupId,
    listed:'not_verified',founded:null,category:sourceProduct.category,
    website:sourceProduct.website,tasks:sourceProduct.tasks,keywords:sourceProduct.keywords,
    batch:cohort.batch,facts,regionalEvidence,
    recordedCount:Object.values(facts).filter(f=>f.status==='observed').length,
    missingCount:Object.values(facts).filter(f=>f.status==='missing').length,
    conflicts:Object.values(facts).filter(f=>f.status==='conflict').length,
    editorialStatus:'source_review',publishApproved:published,visibleToPublic:published,
    searchablePublicly:false,seoIndex:false};
   products.push(result);
   const group=groupNames.get(result.parentGroupId)||[];
   group.push(id);groupNames.set(result.parentGroupId,group);
  }
 }
 if(products.length!==30||usedIds.size!==30||groupNames.size!==28)throw Error('CANDIDATE_30_OR_GROUP_DEDUP_FAILED');
 const totals=products.reduce((r,p)=>{r.observed+=p.recordedCount;r.missing+=p.missingCount;r.conflict+=p.conflicts;return r;},{observed:0,missing:0,conflict:0});
 if(Object.values(totals).reduce((s,n)=>s+n,0)!==210||products.some(p=>p.publishApproved||p.seoIndex||p.visibleToPublic))
  throw Error('STAGING_PUBLICATION_OR_ACCOUNTING_VIOLATION');
 return {schema:'siai_30_candidate_review_v1',public:false,seoIndex:false,
  candidateProducts:products.length,publisherGroups:groupNames.size,factCells:210,totals,
  publisherGroupsDetail:[...groupNames].map(([id,productIds])=>({id,productIds})),
  products};
}
