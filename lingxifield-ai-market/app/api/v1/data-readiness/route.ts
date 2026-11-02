import {NextResponse} from 'next/server';
import {MARKET_API_PRODUCTS,apiServiceOffer} from '../../../../lib/market-api-service-catalog';
import {researchedFact,MARKET_RESEARCH_CHECKED_AT} from '../../../../lib/market-researched-facts';
import {companyEvidenceFor,companyPresentationFor} from '../../../../lib/market-company-evidence';
import {auditSourceCoverage,auditCompanyCoverage} from '../../../../lib/market-source-coverage.mjs';
import {seoGeoObservations,coverageForSeoGeo} from '../../../../lib/seo-geo-observations';
import rawExperiences from '../../../../data/user-experiences.json';
import rawMetrics from '../../../../data/evidence.json';
import {paymentDeploymentReadiness} from '../../../../lib/market-billing-readiness.mjs';
/** Read-only, non-personal coverage report; no external API calls or credentials. */
export const dynamic='force-dynamic';
export function GET(){
 const productIds=[...MARKET_API_PRODUCTS];
 const sourceCoverage=auditSourceCoverage(productIds.map(id=>({id,facts:researchedFact(id)})));
 const corporateCoverage=auditCompanyCoverage(productIds.map(id=>{
  const publisher=companyPresentationFor(id,id);
  return {name:publisher.name,kind:publisher.kind,evidence:companyEvidenceFor(id)};
 }));
 const apiClassifications=Object.fromEntries(productIds.map(id=>[id,apiServiceOffer(id).kind]));
 const pricedApiProducts=productIds.filter(id=>{
  const x=apiServiceOffer(id);
  return x.tokenRates.length+x.unitRates.length+x.videoRates.length>0;
 });
 const measured=Array.isArray(rawMetrics)?rawMetrics.filter(x=>x.status==='verified'):[],
       experiences=Array.isArray(rawExperiences)?rawExperiences:[];
 const pay=paymentDeploymentReadiness();
 const seo=coverageForSeoGeo();
 return NextResponse.json({
  scope:'32_curated_products',checkedAt:'2026-11-02',
  sourceFacts:{...sourceCoverage,editorialLastReviewed:MARKET_RESEARCH_CHECKED_AT,
   warning:'Source-backed descriptions are not an independent measurement of usability, current checkout price or model quality.'},
  companies:corporateCoverage,
  apiBilling:{classifiedProducts:productIds.length,productsWithExplicitDeveloperUnitRates:pricedApiProducts.length,
   productsWithDeveloperUnitRates:pricedApiProducts,classificationById:apiClassifications,
   caveat:'Web subscriptions and self-hosting costs must not be presented as developer API token rates.'},
  independentEvidence:{verifiedMarketMetricRecords:measured.length,
   storedVisitorExperienceRows:experiences.length,verifiedSeoGeoRecords:seoGeoObservations.length,
   seoGeoStatus:seo.status,seoGeo:seo},
  merchantBilling:{liveProviderCount:pay.filter(x=>x.checkoutAvailable).length,
   providers:pay.map(x=>({provider:x.provider,mode:x.mode})),
   checkoutStatus:'not_live'},
  limitations:'Missing independent records are reported as missing; never synthetic zero rankings or fabricated reviews.'
 },{headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
}
