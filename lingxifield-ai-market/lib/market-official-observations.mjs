/** Deterministic, source-attributed intake evidence checks. Observations are NEVER publish approval.
 * Strict review requires two-stage external verification plus every seven facts, no conflicts.
 */
export const OFFICIAL_REQUIRED_FIELDS=Object.freeze(['price','free','models','regions','commercial','payment','company']);
const urlHost=value=>{
 try{
  const u=new URL(value);
  return u.protocol==='https:'&&!u.username&&!u.password&&!u.port&&!u.hash?u.hostname.toLowerCase():null;
 }catch{return null}
};
const dateOnly=v=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&!Number.isNaN(Date.parse(v+'T00:00:00Z'));
export function auditOfficialObservations(pack,batch,{today='2026-11-02'}={}){
 if(!pack||!batch||!Array.isArray(pack.products)||!Array.isArray(batch.products))throw Error('OFFICIAL_BATCH_INVALID');
 const issues=[],totals={observed:0,missing:0,conflict:0},perProduct=[];
 if(pack.schema!=='lingxifield_candidate_official_observations_v1'||pack.batch!==batch.batch||
    !dateOnly(pack.observedOn)||pack.observedOn>today)
  issues.push({code:'INVALID_EVIDENCE_PACK_METADATA'});
 const targets=new Map(batch.products.map(p=>[p.id,p]));
 const seen=new Set();
 for(const r of pack.products){
  if(!r||typeof r.id!=='string'||seen.has(r.id)||!targets.has(r.id)){
   issues.push({id:r?.id||null,code:'UNKNOWN_OR_DUPLICATE_ID'});continue;
  }
  seen.add(r.id);
  const c=targets.get(r.id);
  const batchEvidenceHost=urlHost(c.evidenceUrl),batchWebsiteHost=urlHost(c.website);
  if(!Array.isArray(r.officialHosts)||!r.officialHosts.length||r.officialHosts.some(h=>
       !urlHost('https://'+h)||h!==h.toLowerCase()||h.split('.').length<2||
       h.includes('/')||h.includes('..')||
       ![batchEvidenceHost,batchWebsiteHost].some(host=>
          host&&(host===h||host.endsWith('.'+h)||h.endsWith('.'+host)))))
   issues.push({id:r.id,code:'INVALID_PUBLISHER_HOST_PIN'});
  if(r.reviewStatus!=='unapproved'||c.reviewed!==false||c.publishApproved!==false||
     batch.visibleToPublic!==false||batch.intakePaused!==true)
   issues.push({id:r.id,code:'OBSERVATIONS_CANNOT_PUBLISH'});
  const counts={observed:0,missing:0,conflict:0},facts=r.facts||{};
  for(const key of OFFICIAL_REQUIRED_FIELDS){
   const f=facts[key];
   if(!f||!['observed','missing','conflict'].includes(f.status)){
    issues.push({id:r.id,field:key,code:'INVALID_FACT_STATUS'});continue;
   }
   totals[f.status]++;counts[f.status]++;
   if(f.status==='conflict'){
    const other=urlHost(f.conflictingSource),onBrand=Array.isArray(r.officialHosts)&&r.officialHosts.some(root=>
     other===root||other?.endsWith('.'+root));
    if(!onBrand||f.conflictingSource===f.source)
      issues.push({id:r.id,field:key,code:'CONFLICT_SECOND_SOURCE_REQUIRED'});
   }
   if(f.status==='missing'){
    if(typeof f.reason!=='string'||f.reason.trim().length<12||f.source!==undefined||f.text!==undefined)
     issues.push({id:r.id,field:key,code:'INVALID_MISSING_REASON'});
    continue;
   }
   const h=urlHost(f.source),validHost=Array.isArray(r.officialHosts)&&r.officialHosts.some(root=>h===root||h?.endsWith('.'+root));
   if(!validHost||!dateOnly(f.checkedAt)||f.checkedAt>today||
      typeof f.scope!=='string'||f.scope.length<4||
      typeof f.text!=='string'||f.text.trim().length<16)
    issues.push({id:r.id,field:key,code:'BAD_SOURCE_OR_SCOPE'});
  }
  if(Object.keys(facts).some(k=>!OFFICIAL_REQUIRED_FIELDS.includes(k)))
   issues.push({id:r.id,code:'EXTRA_UNKNOWN_FACT_FIELD'});
  perProduct.push({id:r.id,...counts,needsReview:counts.missing+counts.conflict});
 }
 const ownershipSeen=new Set();
 for(const rel of pack.publisherOwnership||[]){
  if(!rel||!targets.has(rel.productId)||ownershipSeen.has(rel.productId)||
     typeof rel.legalEntity!=='string'||rel.legalEntity.length<3||
     typeof rel.parentGroup!=='string'||rel.parentGroup.length<2||
     rel.status!=='source_observed_unapproved'){
   issues.push({id:rel?.productId,code:'INVALID_OWNERSHIP_RELATION'});continue;
  }
  ownershipSeen.add(rel.productId);
  const original=targets.get(rel.productId);
  const originalHost=urlHost(original.evidenceUrl)||urlHost(original.website);
  const validRelated=rel.relatedCandidateProductId===null||(
   typeof rel.relatedCandidateProductId==='string'&&
   rel.relatedCandidateProductId!==rel.productId&&
   targets.has(rel.relatedCandidateProductId));
  const related=validRelated&&rel.relatedCandidateProductId?targets.get(rel.relatedCandidateProductId):null;
  const relatedHost=related?(urlHost(related.evidenceUrl)||urlHost(related.website)):null;
  const allowedHosts=[originalHost,relatedHost].filter(Boolean);
  const sourceHosts=[urlHost(rel.evidenceUrl),urlHost(rel.legalEntitySource)];
  if(!validRelated||sourceHosts.some(h=>!h||!allowedHosts.some(root=>
     h===root||h.endsWith('.'+root)||root.endsWith('.'+h))))
   issues.push({id:rel.productId,code:'UNSUPPORTED_PARENT_OWNERSHIP_SOURCE'});
 }
 if(seen.size!==targets.size||pack.products.length!==targets.size)
   issues.push({code:'BATCH_COVERAGE_MISMATCH',want:targets.size,got:seen.size});
 return {batch:pack.batch,products:pack.products.length,ownershipRelations:ownershipSeen.size,...totals,perProduct,
   readyForEditorialReview:issues.length===0,
   readyForPublication:false, // always fail-closed; a source observation is never authenticated editorial approval
   issues};
}
