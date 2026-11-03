/** No vendor is verified by public HTML or pricing text alone. */
export function auditCandidateRealUseAcceptance(ledger,ids){
 if(!ledger||!Array.isArray(ledger.items)||!Array.isArray(ids))throw Error('INVALID_VENDOR_TEST_LEDGER');
 const expected=new Set(ids),seen=new Set(),issues=[],passed=[];
 const required=['signIn','runTask','inspectOutput','exportDownload','billingCheckout'];
 for(const r of ledger.items){
  if(!r||!expected.has(r.id)||seen.has(r.id)){issues.push({id:r?.id,code:'MISSING_UNKNOWN_OR_DUPLICATE'});continue}
  seen.add(r.id);
  if(!r.checks||r.productionEligible!==false||r.endToEndStatus!=='not_verified')
   issues.push({id:r.id,code:'FALSE_END_TO_END_PASS'});
  for(const key of required){
   const c=r.checks?.[key];
   if(!c||c.status!=='not_run'||c.outputEvidence!==null)
    issues.push({id:r.id,code:'UNPROVEN_REAL_USE_CHECK',check:key});
  }
  if(r.checks?.officialPage?.status!=='public_document_review_only'||r.checks.officialPage.verifiedHttp200!==false)
   issues.push({id:r.id,code:'DOCUMENT_MISREPRESENTED_AS_HTTP_USE'});
 }
 if(expected.size!==ledger.expected||seen.size!==expected.size)
  issues.push({code:'COUNT_MISMATCH',got:seen.size,want:expected.size});
 return {expected:expected.size,verified:passed.length,pending:expected.size-passed.length,
  passed:passed,blockingReason:ledger.browserBlocker,
  allPassed:issues.length===0&&passed.length===expected.size,issues};
}
