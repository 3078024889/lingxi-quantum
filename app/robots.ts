import type {MetadataRoute} from "next";
import {headers} from "next/headers";
import {seoSiteForRequest} from "@/lib/seo/siai-domain-policy";

export default async function robots():Promise<MetadataRoute.Robots>{
  const h=await headers();
  const site=seoSiteForRequest(h.get("host"),h.get("x-forwarded-host"));
  return {rules:[{userAgent:"*",allow:"/",disallow:["/api/","/admin","/tools/admin","/tools/burn-after-read/","/share/"]}],sitemap:site+"/sitemap.xml",host:site};
}
