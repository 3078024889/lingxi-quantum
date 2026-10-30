import type {MetadataRoute} from 'next';
import {entries} from '../lib/catalog-store';
import {indexableMarketLocales,marketCanonicalOrigin} from '../lib/market-index-policy';
import {capabilityProfile} from '../lib/capability-profiles';
export default function sitemap():MetadataRoute.Sitemap{
 if(entries.length===0)return [];
 const languages=indexableMarketLocales();
 if(!languages.length)return [];
 // Only independently reviewed and fully localized pages may enter the public sitemap.
 const localeRoutes=languages.map(lang=>({url:marketCanonicalOrigin+'/'+lang+'/ai',
  changeFrequency:'daily' as const,priority:0.8}));
 const reviewedChineseDetails=languages.includes('zh')?
  entries.filter(entry=>Boolean(capabilityProfile(entry.id))).map(entry=>({
   url:marketCanonicalOrigin+'/platform/'+encodeURIComponent(entry.id),
   changeFrequency:'weekly' as const,priority:0.6
  })):[];
 return [...localeRoutes,...reviewedChineseDetails];
}
