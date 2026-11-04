import type {MetadataRoute} from "next";
import {headers} from "next/headers";
import {buildSiteSitemap} from "@/lib/seo/sitemap-build";
import {seoSiteForRequest} from "@/lib/seo/siai-domain-policy";
import {siaiLandingShouldIndex} from "@/lib/siai-seo-policy";

export default async function sitemap():Promise<MetadataRoute.Sitemap>{
  const h=await headers();
  const site=seoSiteForRequest(h.get("host"),h.get("x-forwarded-host"));
  return buildSiteSitemap(site,siaiLandingShouldIndex());
}
