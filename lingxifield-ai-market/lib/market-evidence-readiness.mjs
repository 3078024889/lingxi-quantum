/**
 * Read-only, deterministic status report, not a publication or legal-entity
 * verification decision. "observed" means a first-party page excerpt was
 * recorded, NOT independently confirmed in a real checkout or user session.
 */
export const CURATED_FACT_KEYS=Object.freeze(['price','free','models','region','commercial','payments']);
export const CANDIDATE_FACT_KEYS=Object.freeze(['price','free','models','regions','commercial','payment','company']);
const sourceKey=k=>k==='payments'?'paymentSource':k+'Source';
const isValidUrl=v=>{try{let u=new URL(v);return u.protocol==='https:'&&!u.username&&!u.password&&!u.port&&!u.hash}catch{return false}};
const hasValue=x=>Array.isArray(x)?x.some(t=>typeof t==='string'&&t.trim().length>0):typeof x==='string'&&x.trim().length>0;
const dateValid=(s,asOf)=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&!Number.isNaN(Date.parse(s+'T00:00:00Z'))&&s<=asOf;
export function buildEvidenceReadiness({curatedIds,curatedFacts,cohorts,observations,asOf}){
 if(!Array.isArray(curatedIds)||!Array.isArray(cohorts)||!Array.isArray(observations)||!curatedFacts||
  !dateValid(asOf,asOf))throw Error('INVALID_EVIDENCE_AUDIT_INPUT');
 const structuralIssues=[],seenCurated=new Set();
 const curated=curatedIds.map(id=>{
  if(seenCurated.has(id))structuralIssues.push({code:'DUPLICATE_CURATED_ID',id});
  seenCurated.add(id);
  const f=curatedFacts[id]||{};
  const lacking=CURATED_FACT_KEYS.filter(k=>!hasValue(f[k])||!isValidUrl(f[sourceKey(k)]));
  const sources=Object.fromEntries(CURATED_FACT_KEYS.map(k=>[k,isValidUrl(f[sourceKey(k)])?f[sourceKey(k)]:null]));
  return {id,recordedFactCount:CURATED_FACT_KEYS.length-lacking.length,missingOrInvalidSource:lacking,sources,
   status:lacking.length===0?'recorded_with_sources':'source_gap',verifiedByLiveUse:false};
 });
 if(curated.length!==32)structuralIssues.push({code:'PUBLIC_CATALOG_SIZE_CHANGED',count:curated.length});
 const batchById=new Map(cohorts.map(x=>[x.batch,x])),obsSeen=new Set(),stagedSeen=new Set(),staged=[];
 for(const o of observations){
  if(!o||typeof o.batch!=='string'||obsSeen.has(o.batch)){structuralIssues.push({code:'BAD_OR_DUPLICATE_OBSERVATION_BATCH',batch:o?.batch});continue}
  obsSeen.add(o.batch);
  const batch=batchById.get(o.batch);
  if(!batch){structuralIssues.push({code:'ORPHAN_OBSERVATION_BATCH',batch:o.batch});continue}
  if(batch.visibleToPublic!==false||batch.intakePaused!==true||
    o.products?.some(p=>p.reviewStatus!=='unapproved'))structuralIssues.push({code:'PUBLISH_GUARD_BROKEN',batch:o.batch});
  const original=new Map(batch.products.map(x=>[x.id,x]));
  for(const p of o.products||[]){
   const originalProduct=original.get(p.id);
   if(!originalProduct||stagedSeen.has(p.id)||seenCurated.has(p.id)){
    structuralIssues.push({code:'UNKNOWN_OR_DUPLICATE_STAGED_ID',batch:o.batch,id:p.id});continue
   }
   stagedSeen.add(p.id);
   if(originalProduct.publishApproved!==false||originalProduct.reviewed!==false)
    structuralIssues.push({code:'STAGED_PRODUCT_HAS_APPROVAL',batch:o.batch,id:p.id});
   const stats={observed:0,missing:0,conflict:0};
   const missingFields=[],conflictingFields=[],invalidFields=[];
   for(const key of CANDIDATE_FACT_KEYS){
    const f=p.facts?.[key];
    if(!f||!Object.prototype.hasOwnProperty.call(stats,f.status)){
     structuralIssues.push({code:'INVALID_STAGED_FIELD_STATUS',batch:o.batch,id:p.id,key});invalidFields.push(key);continue;
    }
    stats[f.status]++;
    if(f.status==='missing'){missingFields.push(key);if(!hasValue(f.reason)||f.source!==undefined||f.text!==undefined)
      structuralIssues.push({code:'MISSING_FACT_HAS_INVALID_REASON',batch:o.batch,id:p.id,key})}
    else{
     if(!hasValue(f.text)||!isValidUrl(f.source)||!dateValid(f.checkedAt,asOf)||!hasValue(f.scope))
      structuralIssues.push({code:'INVALID_OBSERVATION_SOURCE_OR_DATE',batch:o.batch,id:p.id,key});
     if(f.status==='conflict')conflictingFields.push(key);
    }
   }
   staged.push({batch:o.batch,id:p.id,name:p.name,observed:stats.observed,missing:stats.missing,
    conflict:stats.conflict,missingFields,conflictingFields,invalidFields,
    needsEditorialReview:true,independentSourceVerification:false,publishApproved:false,
    reviewPriority:stats.conflict>0?'resolve_conflict':stats.missing===0?'verify_seven_observations':'collect_missing_sources'});
  }
 }
 const expected=cohorts.reduce((n,b)=>n+(b.products?.length||0),0);
 if(cohorts.length!==3||expected!==30||staged.length!==30)
  structuralIssues.push({code:'STAGED_COHORT_COUNTS_CHANGED',batches:cohorts.length,expected,actual:staged.length});
 if(observations.length!==cohorts.length)structuralIssues.push({code:'OBSERVATION_BATCH_COUNT_MISMATCH'});
 const totals=staged.reduce((a,p)=>{a.observed+=p.observed;a.missing+=p.missing;a.conflict+=p.conflict;return a},{observed:0,missing:0,conflict:0});
 if(totals.observed+totals.missing+totals.conflict!==staged.length*CANDIDATE_FACT_KEYS.length)
  structuralIssues.push({code:'STAGED_7_FACT_ACCOUNTING_DRIFT',...totals});
 const curatedCoverage=curated.reduce((n,c)=>n+c.recordedFactCount,0);
 const publishReady=staged.filter(p=>p.publishApproved).length;
 // No legal/production/commerce claim is implied by page observations.
 const reviewQueue=[...staged].sort((a,b)=>a.conflict-b.conflict||a.missing-b.missing||a.batch.localeCompare(b.batch)||a.id.localeCompare(b.id));
 return {schema:'siai_evidence_readiness_v1',asOf,
  curated:{count:curated.length,expectedFields:curated.length*CURATED_FACT_KEYS.length,
   recordedWithSources:curatedCoverage,missingFieldPairs:curated.length*CURATED_FACT_KEYS.length-curatedCoverage,
   legalAndPaymentTermsIndependentlyRechecked:false,realUserCheckoutVerified:false,products:curated},
  candidateIntake:{batches:cohorts.length,products:staged.length,factCells:staged.length*CANDIDATE_FACT_KEYS.length,
   ...totals,publishReady,manualReviewRequired:true,publishedFromStaging:0,reviewQueue},
  externalObservability:{gscConnectedByThisScript:false,actualSearchTrafficMeasured:false,
   subscriptionCheckoutTested:false,independentReviewCompleted:false},
  safety:{structuralIssues,structurallyValid:structuralIssues.length===0,
   publicCatalogUntouched:true,requiresHumanReview:true}};
}
export function evidenceReportMarkdown(r){
 const c=r.curated,o=r.candidateIntake;
 const head=[
  '# Global SIAI evidence review queue',
  '',
  'As of '+r.asOf,
  '',
  '> First-party page OBSERVATION is not independent fact verification, real account testing, public publication approval or measured SEO rank.',
  '',
  '| Ledger | Recorded | Outstanding |',
  '| --- | ---: | ---: |',
  '| Public 32 curated × 6 sourced fact fields | '+c.recordedWithSources+' | '+c.missingFieldPairs+' |',
  '| Candidate 30 × 7 observations | '+o.observed+' | '+o.missing+' missing + '+o.conflict+' conflicting |',
  '',
  'Candidate products already approved for publication: '+o.publishReady+'.',
  'Actual GSC traffic and production checkout: NOT CHECKED.',
  '',
  '## Candidate review order',
  '',
  '| Batch | Product | Recorded | Missing | Conflicts | Next gate |',
  '| --- | --- | ---: | --- | --- | --- |'
 ];
 for(const p of o.reviewQueue)
  head.push('| '+p.batch+' | '+p.id+' | '+p.observed+'/7 | '+(p.missingFields.join(', ')||'—')+
   ' | '+(p.conflictingFields.join(', ')||'—')+' | '+p.reviewPriority+' |');
 return head.join('\n')+'\n';
}
