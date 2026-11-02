/** Pending cohorts never flow into public ranking or search without evidence and review. */
const https=value=>{try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password&&!u.port&&u.hostname.includes('.')}catch{return false}};
export const REQUIRED_CANDIDATE_FACTS=['price','free','models','regions','commercial','payment','company'];
export function auditCandidateCohort(batch,publishedIds){
 if(!batch||!Array.isArray(batch.products)||!Array.isArray(publishedIds))throw Error('INVALID_BATCH');
 const published=new Set(publishedIds),seen=new Set(),issues=[],eligible=[];
 for(const p of batch.products){
  if(!p||typeof p.id!=='string'||!/^[a-z][a-z0-9-]{1,60}$/.test(p.id)){issues.push({id:p?.id,code:'INVALID_ID'});continue}
  if(seen.has(p.id)||published.has(p.id)){issues.push({id:p.id,code:'DUPLICATE_OR_PUBLISHED'});continue}
  seen.add(p.id);
  if(!https(p.website)||!https(p.evidenceUrl))issues.push({id:p.id,code:'OFFICIAL_HTTPS_EVIDENCE_REQUIRED'});
  const tasks=Array.isArray(p.tasks)?p.tasks:[],keywords=Array.isArray(p.keywords)?p.keywords:[];
  if(tasks.length<2||keywords.length<2)issues.push({id:p.id,code:'TASKS_NOT_DEFINED'});
  if(keywords.some(x=>typeof x!=='string'||/AIAI/i.test(x)))issues.push({id:p.id,code:'UNNATURAL_SEARCH_PHRASE'});
  const facts=p.verifiedFacts||{},missing=REQUIRED_CANDIDATE_FACTS.filter(k=>{
   const v=facts[k];
   return !v||!['verified','not_applicable'].includes(v.status)||
     !https(v.source)||typeof v.checkedAt!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(v.checkedAt)||
     (v.status==='verified'&&!(typeof v.text==='string'&&v.text.trim().length>=6))||
     (v.status==='not_applicable'&&!(typeof v.reason==='string'&&v.reason.trim().length>=15));
  });
  if(missing.length)issues.push({id:p.id,code:'MISSING_VERIFIED_FIELDS',fields:missing});
  if(missing.length===0&&p.reviewed===true&&p.publishApproved===true)eligible.push(p.id);
 }
 const countOk=batch.products.length===10&&seen.size===10;
 const hold= batch.intakePaused===true && batch.visibleToPublic===false && batch.reviewState==='candidate';
 return {batch:batch.batch,count:batch.products.length,uniqueCount:seen.size,
  stagingSafe:countOk&&hold&&!batch.products.some(x=>x.publishApproved===true),
  publishEligible:eligible.length,eligibleIds:eligible,
  issues,requiresManualApproval:true,
  nextSteps:'Verify each source and product task, add dated official price/free/API/region/company facts, then obtain independent approval after current 32 pass release gates.'};
}
