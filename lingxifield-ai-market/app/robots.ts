import type {MetadataRoute} from 'next';
import {mayIndexMarket,marketCanonicalOrigin} from '../lib/market-index-policy';
export default function robots():MetadataRoute.Robots{
 if(!mayIndexMarket())return {rules:{userAgent:'*',disallow:'/'}}; // preview is never indexed
 return {rules:{userAgent:'*',allow:'/',disallow:['/api/','/vendor/']},
   sitemap:marketCanonicalOrigin+'/sitemap.xml',host:marketCanonicalOrigin};
}
