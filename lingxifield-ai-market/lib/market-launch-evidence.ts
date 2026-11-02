import {MARKET_API_PRODUCTS} from '../lib/market-api-service-catalog';
import {auditCuratedUseAcceptance,evaluatePublicationGates} from '../lib/market-launch-gates.mjs';
import raw from '../data/acceptance/curated-32-use.json';
import seo from '../data/seo-geo-observations.json';
import audit from '../reports/official-access-http-20261102.json';
import intake from '../data/company-intake/batch-001.json';
import intake2 from '../data/company-intake/batch-002.json';
import intake3 from '../data/company-intake/batch-003.json';
import obs1 from '../data/company-intake/batch-001-official-observations.json';
import obs2 from '../data/company-intake/batch-002-official-observations.json';
import obs3 from '../data/company-intake/batch-003-official-observations.json';
export const marketLaunchEvidence=()=>{
 const uses=auditCuratedUseAcceptance(raw.items,[...MARKET_API_PRODUCTS]);
 const internalBatches=[intake,intake2,intake3];
 const sourcePacks=[obs1,obs2,obs3];
 // Only aggregate counts leave the server; never expose unapproved product IDs or claims.
 const sourceStatuses=sourcePacks.flatMap(pack=>pack.products.flatMap(row=>Object.values(row.facts).map(f=>f.status)));
 const stagedInventory={
  batchCount:internalBatches.length,
  candidateProducts:internalBatches.reduce((n,b)=>n+b.products.length,0),
  allHeld:internalBatches.every(b=>b.intakePaused===true&&b.visibleToPublic===false&&b.products.every(p=>p.publishApproved===false)),
  officialSourceObservations:sourceStatuses.filter(s=>s==='observed').length,
  missingFacts:sourceStatuses.filter(s=>s==='missing').length,
  conflictingFacts:sourceStatuses.filter(s=>s==='conflict').length,
  caveat:'Staged, unapproved source-page observations; not 30 published products or 30 independent companies.'
 };
 const release=evaluatePublicationGates({
  inventory:{curated:MARKET_API_PRODUCTS.length},uses,
  seo:{verifiedObservations:seo.length,verifiedOwnership:false},
  merchant:{verifiedSettlement:false,refundAndRevocation:false},
  mobile:{nineLocalesRealBrowser:false},realSite:{verifiedPublicProduction:false}
 });
 return {curated:MARKET_API_PRODUCTS.length,uses,release,
  officialHttp:{scope:audit.scope,date:audit.observedAt,results:audit.states,note:'Public HEAD only, not functionality'},
  stagedInventory,
  nextBatch:{batch:intake.batch,products:intake.products.length,paused:intake.intakePaused,
   visibleToPublic:intake.visibleToPublic},
  warning:'These readiness signals are evidence-based; manual flags cannot override missing real-world tests.'};
};
