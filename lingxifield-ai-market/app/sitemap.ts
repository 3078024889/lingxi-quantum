import type {MetadataRoute} from 'next';
import {searchPlatforms} from '../lib/platform-repository';
import {indexableMarketLocales,marketCanonicalOrigin} from '../lib/market-index-policy';
import {researchedFact} from '../lib/market-researched-facts';
import {MARKET_COMPANIES} from '../lib/market-publisher-registry';
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
 // Public task and price directories are localized. Vendor submission and admin URLs are deliberately omitted.
 for(const section of ['apps','models'] as const){
  const languages=Object.fromEntries(locales.map(l=>[l,marketCanonicalOrigin+'/'+l+'/'+section]));
  for(const lang of locales)pages.push({url:languages[lang],changeFrequency:'weekly',priority:0.58,alternates:{languages}});
 }
 // One publisher entity may own multiple products. Show only sourced, curated pages.
 for(const c of MARKET_COMPANIES){
  if(!c.officialSource.startsWith('https://'))continue;
  const languages=Object.fromEntries(locales.map(l=>[l,marketCanonicalOrigin+'/'+l+'/companies']));
  for(const l of locales){
   // The directory is a shared index page, not one per publisher.
   // Add only one locale-specific directory URL.
   if(!pages.some(p=>p.url===languages[l])){
    pages.push({url:languages[l],changeFrequency:'weekly',priority:0.55,alternates:{languages}});
   }
  }
  break;
 }
 return pages;
}
