/** A truthful human/live-use acceptance ledger for the published 32. A HEAD probe cannot pass any real task. */
export const REQUIRED_BY_ARCHETYPE=Object.freeze({
 web_app:['entry','first_real_task','actual_result','pricing_and_limit','mobile_use'],
 developer_sdk:['install','execute_example','verify_result','license_and_cost','docs_access'],
 self_hosted:['install','run_model_or_workflow','verify_result','system_requirements','license_and_cost']
});
const idPattern=/^[a-z][a-z0-9-]{1,80}$/;
const isHttps=s=>{try{const u=new URL(s);return u.protocol==='https:'&&!u.username&&!u.password&&!u.port;}catch{return false}};
const isRealTime=s=>typeof s==='string'&&!Number.isNaN(Date.parse(s))&&Date.parse(s)>0;
export function auditCuratedUseAcceptance(records,expectedIds){
 if(!Array.isArray(records)||!Array.isArray(expectedIds))throw Error('INVALID_ACCEPTANCE_INPUT');
 const expected=new Set(expectedIds),seen=new Set(),issues=[],passed=[],pending=[],invalid=[];
 for(const r of records){
  if(!r||!idPattern.test(r.id||'')||seen.has(r.id)||!expected.has(r.id)){issues.push({id:r?.id||null,reason:'UNKNOWN_OR_DUPLICATE_PRODUCT'});continue}
  seen.add(r.id);
  const required=REQUIRED_BY_ARCHETYPE[r.archetype];
  if(!required||!['not_run','in_progress','passed','failed','blocked'].includes(r.status)){invalid.push(r.id);continue}
  const cases=Array.isArray(r.cases)?r.cases:[],byCheck=new Map();
  for(const c of cases)if(c&&typeof c.check==='string'&&!byCheck.has(c.check))byCheck.set(c.check,c);
  const complete=r.status==='passed'&&isRealTime(r.testedAt)
   &&required.every(key=>{
    const c=byCheck.get(key);
    return c?.status==='passed'&&typeof c.note==='string'&&c.note.trim().length>=16&&
      isHttps(c.evidenceUrl);
   })&&Array.isArray(r.evidence)&&r.evidence.length>0&&r.evidence.every(isHttps);
  if(r.status==='passed'&&!complete){invalid.push(r.id);continue}
  if(complete)passed.push(r.id);else pending.push(r.id);
 }
 const missing=[...expected].filter(id=>!seen.has(id));
 if(records.length!==expected.size||seen.size!==expected.size)issues.push({reason:'INCOMPLETE_32_LEDGER',expected:expected.size,actual:seen.size});
 return {expected:expected.size,covered:seen.size,verifiedRealUse:passed.length,passedIds:passed,
  pendingIds:pending,invalidIds:invalid,missingIds:missing,issues,
  allVerified:passed.length===expected.size&&invalid.length===0&&missing.length===0&&issues.length===0,
  methodology:'Only executed end-to-end tasks with observed outputs and independently linkable evidence count. HEAD reachability and screenshots without real action are insufficient.'};
}
export function evaluatePublicationGates({inventory,uses,seo,merchant,mobile,realSite}){
 const checks={
  exactly32Curated:inventory?.curated===32,
  independentRealUse32:uses?.allVerified===true,
  publishedSeoGeoProof:seo?.verifiedObservations>0&&seo?.verifiedOwnership===true,
  signedVendorSettlement:merchant?.verifiedSettlement===true,
  atomicRefundAndEntitlement:merchant?.refundAndRevocation===true,
  nineLocaleMobileBrowser:mobile?.nineLocalesRealBrowser===true,
  officialSiteExternallyAccessible:realSite?.verifiedPublicProduction===true,
 };
 const blocking=Object.entries(checks).filter(([,pass])=>!pass).map(([k])=>k);
 return {stage:'pre_release',goLive:blocking.length===0,canPublishNext10:blocking.length===0,checks,blocking,
  note:'Code/CI success alone is not live merchant settlement, user task completion or indexed search traffic. Expansion remains paused until every release gate has evidence.'};
}
