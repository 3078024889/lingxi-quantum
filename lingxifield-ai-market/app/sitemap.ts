import type { MetadataRoute } from 'next';
import {supportedLocales} from '../lib/locale-pages';
import {entries} from '../lib/catalog-store';
export default function sitemap():MetadataRoute.Sitemap{
 if(entries.length===0)return [];
 return supportedLocales.map(lang=>({url:`https://lingxifield.com/${lang}/ai`,changeFrequency:'daily' as const,priority:0.8}));
}
