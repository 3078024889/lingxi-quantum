import type {MetadataRoute} from "next";
import {GLOBAL_TOOL_CATALOG,SEO_LOCALES,SEO_TOPICS,SITE,localePath,languageAlternates,type SeoLocale} from "@/lib/seo/global-seo";
import {siaiLandingShouldIndex} from "@/lib/siai-seo-policy";
export default function sitemap():MetadataRoute.Sitemap{
 const paths=["/","/products","/tools",...GLOBAL_TOOL_CATALOG.map(t=>`/tools/${t.slug}`),...Object.keys(SEO_TOPICS).map(topic=>`/discover/${topic}`)];
 const rows:MetadataRoute.Sitemap=[];
 for(const path of paths){
  const languages=Object.fromEntries(Object.entries(languageAlternates(path)).map(([lang,url])=>[lang,SITE+url]));
  for(const locale of Object.keys(SEO_LOCALES) as SeoLocale[])rows.push({url:SITE+localePath(locale,path),alternates:{languages}});
 }
 if(siaiLandingShouldIndex())rows.push({url:SITE+"/siai",changeFrequency:"daily",priority:0.9});
 for(const path of ["/sasi","/sasi/drama","/sasi/build","/sasi/image","/ai-knowledge","/ai-learning","/ai-research","/about","/privacy","/terms","/refunds","/legal/sasi","/release"])rows.push({url:SITE+path});
 return rows;
}
