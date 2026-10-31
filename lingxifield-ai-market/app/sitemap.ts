import type {MetadataRoute} from 'next';
import {searchPlatforms} from '../lib/platform-repository';
import {indexableMarketLocales,marketCanonicalOrigin} from '../lib/market-index-policy';
import {researchedFact} from '../lib/market-researched-facts';
export default function sitemap():MetadataRoute.Sitemap{
 const locales=indexableMarketLocales();
 if(!locales.length)return []; // All previews stay excluded until production SEO release gate.
 const pages:MetadataRoute.Sitemap=locales.map(lang=>({url:marketCanonicalOrigin+'/'+lang+'/ai',changeFrequency:'daily',priority:0.8}));
 // Publish a localized detail page only when its vendor price, free, model and region sources exist.
 for(const product of searchPlatforms({limit:100}).items){
  const f=researchedFact(product.id);
  if(!f?.priceSource||!f.freeSource||!f.modelsSource||!f.regionSource)continue;
  const languages=Object.fromEntries(locales.map(l=>[l,marketCanonicalOrigin+'/'+l+'/platform/'+encodeURIComponent(product.id)]));
  for(const locale of locales)pages.push({url:languages[locale],changeFrequency:'weekly',priority:0.65,alternates:{languages}});
 }
 return pages;
}
