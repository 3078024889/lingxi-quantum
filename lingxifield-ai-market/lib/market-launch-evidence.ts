import {MARKET_API_PRODUCTS} from '../lib/market-api-service-catalog';
import {auditCuratedUseAcceptance,evaluatePublicationGates} from '../lib/market-launch-gates.mjs';
import raw from '../data/acceptance/curated-32-use.json';
import seo from '../data/seo-geo-observations.json';
import audit from '../reports/official-access-http-20261102.json';
import intake from '../data/company-intake/batch-001.json';
export const marketLaunchEvidence=()=>{
 const uses=auditCuratedUseAcceptance(raw.items,[...MARKET_API_PRODUCTS]);
 const release=evaluatePublicationGates({
  inventory:{curated:MARKET_API_PRODUCTS.length},uses,
  seo:{verifiedObservations:seo.length,verifiedOwnership:false},
  merchant:{verifiedSettlement:false,refundAndRevocation:false},
  mobile:{nineLocalesRealBrowser:false},realSite:{verifiedPublicProduction:false}
 });
 return {curated:MARKET_API_PRODUCTS.length,uses,release,
  officialHttp:{scope:audit.scope,date:audit.observedAt,results:audit.states,note:'Public HEAD only, not functionality'},
  nextBatch:{batch:intake.batch,products:intake.products.length,paused:intake.intakePaused,
   visibleToPublic:intake.visibleToPublic},
  warning:'These readiness signals are evidence-based; manual flags cannot override missing real-world tests.'};
};
