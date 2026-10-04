import type {MetadataRoute} from "next";
import {PRIMARY_SITE} from "@/lib/seo/site-domains";
export default function robots():MetadataRoute.Robots{
 return {rules:[{userAgent:"*",allow:"/",disallow:["/api/","/admin","/tools/admin","/tools/burn-after-read/","/share/"]}],sitemap:`${PRIMARY_SITE}/sitemap.xml`,host:PRIMARY_SITE};
}
