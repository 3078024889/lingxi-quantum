import {searchPlatforms} from '../../lib/platform-repository';
import {coverageForSeoGeo} from '../../lib/seo-geo-observations';
import {marketLocales,mayIndexMarket,marketCanonicalOrigin} from '../../lib/market-index-policy';
import {companyPresentationFor} from '../../lib/market-company-evidence';
import {capabilityProfile} from '../../lib/capability-profiles';
import {localizedProductSummary} from '../../lib/market-product-locale';

export const revalidate=3600;

export function GET(){
 const products=searchPlatforms({limit:32}).items;
 const coverage=coverageForSeoGeo();
 const indexable=mayIndexMarket();
 const origin=indexable?marketCanonicalOrigin:'';
 const lines=[
  '# LINGXIFIELD — Global SI / AI Market',
  '',
  'A multilingual discovery directory for AI software, models, developer tools and practical workflows.',
  '',
  '## How to interpret this directory',
  '- Directory order is not a global popularity ranking, market-share ranking or independent quality score.',
  '- Prices, free allowances, regional access and commercial-use terms are shown only when source evidence is available.',
  '- Product pages link to the publisher or source repository; use those sources to confirm current terms.',
  '- Missing facts are omitted rather than estimated or fabricated.',
  '- Sponsored placements, when enabled, must be disclosed separately from organic discovery and evidence-based measurements.',
  '',
  '## Languages',
  ...marketLocales.map(locale=>'- '+locale+': '+(origin?origin+'/'+locale+'/ai':'/'+locale+'/ai')),
  '',
  '## Verified SEO and GEO evidence',
  '- Current reviewed observations: '+coverage.verifiedObservations,
  '- SEO observations: '+coverage.seoObservations,
  '- GEO citation observations: '+coverage.geoObservations,
  '- Independent SERP observations: '+coverage.independentSerpObservations,
  '- No comparative rank is claimed until observations share a documented query, country, language, model or search engine, measurement date and review method.',
  '',
  '## Current curated directory',
  '- Published directory scope: '+products.length+' products. Future intake batches are not included.',
  ''
 ];
 for(const p of products){
  const name=String(p.name||p.id);
  const category=String(p.category||'AI software');
  const description=String(localizedProductSummary(p.id,'en')||p.about||'').replace(/\s+/g,' ').trim();
  const publisher=companyPresentationFor(p.id,p.company),profile=capabilityProfile(p.id);
  const site=String(p.website||'');
  const kind=p.websiteKind==='repository'?'Source repository':'Publisher website';
  lines.push('### '+name);
  lines.push('- Category: '+category);
  if(publisher.name)lines.push('- Publisher / maintainer: '+publisher.name);
  if(publisher.companySource)lines.push('- Publisher source: '+publisher.companySource);
  if(publisher.year)lines.push('- '+(publisher.kind==='company'?'Company founded':'Project started')+': '+publisher.year+(publisher.yearSource?' (source: '+publisher.yearSource+')':''));
  if(publisher.listingDetail)lines.push('- Stock listing (publisher or parent): '+publisher.listingDetail+(publisher.listingSource?' (source: '+publisher.listingSource+')':''));
  if(profile)for(const task of profile.capabilities.slice(0,5)){
   lines.push('- Documented capability (zh): '+task.name+' — '+task.outcome+' (source: '+task.source+')');
  }
  if(description)lines.push('- Summary: '+description.slice(0,360));
  if(/^https:\/\//i.test(site))lines.push('- '+kind+': '+site);
  lines.push('- Product details: '+(origin?origin+'/zh/platform/'+encodeURIComponent(p.id):'/zh/platform/'+encodeURIComponent(p.id)));
  lines.push('');
 }
 lines.push('## Measurement API');
 lines.push('- /api/v1/seo-geo — dated, reviewed observations only; zero observations means no measured ranking is available.');
 lines.push('- /sitemap.xml — released canonical pages only; preview deployments remain excluded from indexing.');
 lines.push('');
 lines.push('## Contact and corrections');
 lines.push('- Product publishers can submit a sourced correction through /vendor/claim. Submission does not grant verified status or paid placement.');
 lines.push('- Directory feedback is reviewed before publication.');
 return new Response(lines.join('\n'),{headers:{
  'Content-Type':'text/plain; charset=utf-8',
  'Cache-Control':'public, s-maxage=3600, stale-while-revalidate=86400',
  'X-Content-Type-Options':'nosniff'
 }});
}
