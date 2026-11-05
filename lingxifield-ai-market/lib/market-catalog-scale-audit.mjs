/**
 * Source-only catalog audit. No network calls, cloud credentials, rankings, or payments.
 * Reuses the project's immutable cohorts; keeps products separate from publisher groups.
 * Inspired by open metadata lineage and explicit schema/uniqueness checks, not copied code.
 */
const PRODUCT=/^[a-z0-9][a-z0-9-]{1,79}$/;
const PUBLISHER=/^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const NORMALIZE=s=>s.normalize("NFKC").toLocaleLowerCase().replace(/\s+/g,"").trim();
function safeOfficialUrl(value){
 try{
  const url=new URL(value);
  return url.protocol==="https:"&&Boolean(url.hostname)&&!url.username&&!url.password&&
   !url.port&&!url.hash&&!/^(localhost|127\.|0\.0\.0\.0)/.test(url.hostname) ? url.hostname.toLowerCase().replace(/^www\./,"") : null;
 }catch{return null}
}
const unique=iterable=>[...new Set(iterable)];
export function auditCandidateCorpus(batches,options={}){
 const issues=[],warnings=[],idToProduct=new Map(),publisherProducts=new Map(),
  companyGroups=new Map(),hostGroups=new Map(),names=new Map();
 const metrics={batches:0,candidates:0,publishApproved:0,publisherGroups:0,uniqueNames:0,
  duplicateIds:0,pendingFacts:0,emptyPublisherKeys:0,hostReuse:0,
  sourceObservationRows:0};
 if(!Array.isArray(batches))return {issues:[{code:"INVALID_BATCHES"}],warnings:[],metrics};
 const batchIds=new Set();
 for(const batch of batches){
  if(!batch||!Array.isArray(batch.products)){
   issues.push({code:"INVALID_BATCH",batch:batch?.batch});continue;
  }
  metrics.batches++;
  if(batchIds.has(batch.batch))issues.push({code:"DUPLICATE_BATCH",batch:batch.batch});
  batchIds.add(batch.batch);
  if(batch.products.length!==10)issues.push({code:"UNEXPECTED_COHORT_SIZE",batch:batch.batch,actual:batch.products.length});
  if(batch.intakePaused!==true||batch.visibleToPublic!==false||batch.reviewState!=="candidate")
   issues.push({code:"CANDIDATE_BATCH_PUBLISHED",batch:batch.batch});
  for(const p of batch.products){
   metrics.candidates++;
   const id=p?.id;
   if(typeof id!=="string"||!PRODUCT.test(id)){
    issues.push({code:"INVALID_PRODUCT_ID",batch:batch.batch,id});continue;
   }
   if(idToProduct.has(id)){
    metrics.duplicateIds++;issues.push({code:"DUPLICATE_PRODUCT_ID",id,first:idToProduct.get(id).batch,second:batch.batch});
   }else idToProduct.set(id,{...p,batch:batch.batch});
   if(typeof p.publisherGroupId!=="string"||!PUBLISHER.test(p.publisherGroupId)){
    metrics.emptyPublisherKeys++;issues.push({code:"INVALID_PUBLISHER_KEY",id,publisherGroupId:p.publisherGroupId});
   }else{
    (publisherProducts.get(p.publisherGroupId)||publisherProducts.set(p.publisherGroupId,[]).get(p.publisherGroupId)).push(id);
   }
   for(const key of ["website","evidenceUrl","discoverySource"]){
    if(!safeOfficialUrl(p[key]))issues.push({code:"INVALID_OFFICIAL_URL",id,field:key});
   }
   if(p.reviewed!==false||p.publishApproved!==false){
    metrics.publishApproved++;issues.push({code:"UNAPPROVED_ROW_PROMOTED",id});
   }
   if(!Array.isArray(p.tasks)||p.tasks.length<2||!Array.isArray(p.keywords)||p.keywords.length<2)
    issues.push({code:"INVALID_CAPABILITIES",id});
   const k=NORMALIZE(String(p.company||""));
   if(!k)issues.push({code:"MISSING_PUBLISHER_LABEL",id});
   const owner=companyGroups.get(k)||new Set();
   if(p.publisherGroupId)owner.add(p.publisherGroupId);
   companyGroups.set(k,owner);
   const n=NORMALIZE(String(p.name||""));
   const previous=names.get(n)||[];
   previous.push(id);names.set(n,previous);
   const host=safeOfficialUrl(p.website);
   if(host){
    const record=hostGroups.get(host)||new Map();
    record.set(p.publisherGroupId,(record.get(p.publisherGroupId)||[]).concat(id));
    hostGroups.set(host,record);
   }
   const factMap=p.verifiedFacts||{};
   metrics.pendingFacts+=["price","free","models","regions","commercial","payment","company"].filter(k=>
    !factMap[k]||!["verified","not_applicable"].includes(factMap[k].status)).length;
  }
 }
 for(const [label,groups]of companyGroups)if(groups.size>1)
  issues.push({code:"INCONSISTENT_PUBLISHER_ID",company:label,groups:[...groups].sort()});
 for(const [name,ids]of names)if(name&&ids.length>1)
  warnings.push({code:"DUPLICATE_PRODUCT_NAME_REVIEW",name,ids:unique(ids).sort()});
 for(const [host,groups]of hostGroups)if(groups.size>1){
  metrics.hostReuse++;
  warnings.push({code:"SAME_OFFICIAL_HOST_MULTIPLE_PUBLISHER_GROUPS",host,groups:[...groups.keys()].sort()});
 }
 metrics.publisherGroups=publisherProducts.size;
 metrics.uniqueNames=names.size;
 if(Array.isArray(options.publicManifest)){
  const manifest=new Set(options.publicManifest);
  for(const id of idToProduct.keys())if(manifest.has(id)){
   // Prior B001-003 source-preview entries can be displayed as explicitly provisional.
   if(!options.sourcePreviewIds?.includes(id))
    issues.push({code:"CANDIDATE_ID_ALREADY_PUBLIC",id});
  }
 }
 return {issues,warnings,metrics,groups:Object.fromEntries([...publisherProducts.entries()].map(([k,ids])=>[k,ids.sort()]))};
}
export {safeOfficialUrl};
