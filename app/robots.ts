import type {MetadataRoute} from 'next';
import {SITE} from '@/lib/seo/global-seo';
export default function robots():MetadataRoute.Robots{
 return {rules:[{userAgent:'*',allow:'/',disallow:['/api/','/admin','/tools/admin','/tools/burn-after-read/','/share/']}],sitemap:`${SITE}/sitemap.xml`,host:SITE};
}
