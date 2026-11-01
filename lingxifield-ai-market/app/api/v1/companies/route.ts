import {NextResponse} from 'next/server';
import {COMPANY_EVIDENCE,COMPANY_EVIDENCE_IDS} from '../../../../../lib/market-company-evidence';
export const revalidate=86400;
/** Every listed entity is source-backed. Missing financing is omitted, not invented. */
export function GET(){
 const data=COMPANY_EVIDENCE_IDS.map(id=>({id,...COMPANY_EVIDENCE[id]}));
 return NextResponse.json({
  count:data.length,total:data.length,
  methodology:'Corporate founding, open-source project origins, investment rounds, company listings and products are different facts. Missing records must not be interpreted as zero.',
  coverage:{
   publisherSources:data.filter(v=>v.publisherSource).length,
   foundedWithEvidence:data.filter(v=>Boolean(v.founded?.source)).length,
   locationWithEvidence:data.filter(v=>Boolean(v.headquarters?.source)).length,
   fundingWithEvidence:data.filter(v=>Boolean(v.funding?.source)).length,
   listingWithEvidence:data.filter(v=>Boolean(v.listing?.source)).length,
   projectOriginsWithEvidence:data.filter(v=>Boolean(v.projectStarted?.source)).length
  },data
 },{headers:{'Cache-Control':'public, s-maxage=3600, stale-while-revalidate=86400','X-Content-Type-Options':'nosniff'}});
}
