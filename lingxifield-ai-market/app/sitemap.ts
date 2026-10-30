import type {MetadataRoute} from 'next';
import {entries} from '../lib/catalog-store';
import {indexableMarketLocales,marketCanonicalOrigin} from '../lib/market-index-policy';
export default function sitemap():MetadataRoute.Sitemap{
 if(entries.length===0)return [];
 const languages=indexableMarketLocales();
 if(!languages.length)return [];
 // No indexing just a translated navigation shell as unique language content.
 return languages.map(lang=>({url:marketCanonicalOrigin+'/'+lang+'/ai',
  changeFrequency:'daily' as const,priority:0.8}));
}
