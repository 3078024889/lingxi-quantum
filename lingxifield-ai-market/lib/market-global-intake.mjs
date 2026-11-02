/** Safe expansion intake gate for multiple 10-product source-backed cohorts.
 * Candidate data is strictly private and cannot enter published catalog.
 */
import {auditCandidateCohort} from './market-candidate-intake.mjs';
import {auditOfficialObservations} from './market-official-observations.mjs';
const safeDate=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&
 !Number.isNaN(Date.parse(value+'T00:00:00Z'));
const host=value=>{try{const x=new URL(value);
 return x.protocol==='https:'&&!x.username&&!x.password&&!x.port&&!x.hash?x.hostname.toLowerCase():null;
}catch{return null}};
export function auditGlobalIntake(batches,observations,curatedIds,{today=new Date().toISOString().slice(0,10)}={}){
 if(!Array.isArray(batches)||!Array.isArray(observations)||!Array.isArray(curatedIds))
  throw Error('INVALID_GLOBAL_COHORT_INPUT');
 const issues=[],ids=new Set(curatedIds),aliases=new Map(),reports=[];
 let observed=0,missing=0,conflict=0;
 const ownedBatches=new Set(),byCode=new Map(observations.map(x=>[x.batch,x]));
 if(byCode.size!==observations.length)issues.push({code:'DUPLICATE_OBSERVATION_BATCH'});
 for(const b of batches){
  if(!b||!/^B\d{3,}$/.test(b.batch||'')||ownedBatches.has(b.batch)){
   issues.push({code:'INVALID_OR_DUPLICATE_BATCH',batch:b?.batch});continue;
  }
  ownedBatches.add(b.batch);
  if(!safeDate(b.asOf)||b.asOf>today)issues.push({batch:b.batch,code:'INVALID_BATCH_DATE'});
  const basic=auditCandidateCohort(b,[...ids]);
  if(!basic.stagingSafe)issues.push({batch:b.batch,code:'BATCH_NOT_STAGED_SAFELY'});
  for(const p of b.products){
   if(ids.has(p.id)){issues.push({batch:b.batch,id:p.id,code:'PUBLISHED_OR_CROSS_BATCH_DUPLICATE'});continue}
   ids.add(p.id);
   const token=name=>String(name||'').normalize('NFKC').trim().toLowerCase().replace(/[\s\W_]+/g,'');
   const identity=[p.name,...(Array.isArray(p.aliases)?p.aliases:[])].map(token).filter(Boolean);
   if(identity.length!==new Set(identity).size)
    issues.push({batch:b.batch,id:p.id,code:'REDUNDANT_BRAND_ALIAS'});
   if(!/^([a-z][a-z0-9-]{1,79})$/.test(p.publisherGroupId||'')||
     !Array.isArray(p.aliases)||p.aliases.some(a=>typeof a!=='string'||a.trim().length<3))
    issues.push({batch:b.batch,id:p.id,code:'INVALID_PARENT_GROUP_OR_ALIASES'});
   if(!safeDate(p.discoveredAt)||p.discoveredAt>today||
     !host(p.discoverySource)||(host(p.discoverySource)!==host(p.website)&&
       host(p.discoverySource)!==host(p.evidenceUrl)))
    issues.push({batch:b.batch,id:p.id,code:'INVALID_DISCOVERY_PROVENANCE'});
   for(const name of identity){
    const old=aliases.get(name);
    if(old&&old!==p.id)issues.push({batch:b.batch,id:p.id,code:'BRAND_ALIAS_COLLISION',existing:old});
    else aliases.set(name,p.id);
   }
  }
  const proof=byCode.get(b.batch);
  if(!proof){issues.push({batch:b.batch,code:'OBSERVATION_PACK_MISSING'});continue}
  const audit=auditOfficialObservations(proof,b,{today});
  if(!audit.readyForEditorialReview||audit.issues.length)
   issues.push({batch:b.batch,code:'OBSERVATION_PACK_INVALID',details:audit.issues});
  observed+=audit.observed;missing+=audit.missing;conflict+=audit.conflict;
  reports.push({batch:b.batch,products:b.products.length,officialPageObservations:audit.observed,
   conflicting:audit.conflict,missing:audit.missing,publishEligible:basic.publishEligible,
   unpublished:b.visibleToPublic===false});
 }
 for(const r of observations)if(!ownedBatches.has(r.batch))issues.push({code:'ORPHAN_OBSERVATION_PACK',batch:r.batch});
 const expectedProducts=batches.reduce((n,b)=>n+(Array.isArray(b?.products)?b.products.length:0),0);
 return {stagedBatches:reports.length,stagedProducts:expectedProducts,
  officialPageObservations:observed,conflicts:conflict,missing,
  publishedProducts:curatedIds.length,publishEligible:0,
  readyForPublicRelease:false,allBatchesSafe:issues.length===0,
  reviews:reports,issues};
}
