import type {MetadataRoute} from "next";
import {GLOBAL_TOOL_CATALOG,SEO_LOCALES,SEO_TOPICS,SITE,localePath,languageAlternates,type SeoLocale} from "@/lib/seo/global-seo";
import {MARKET_API_PRODUCTS} from "@/lingxifield-ai-market/lib/market-api-service-catalog";
import {researchedFact} from "@/lingxifield-ai-market/lib/market-researched-facts";
import {SIAI_DETAIL_LOCALES,siaiProductPath,siaiDetailShouldIndex} from "@/lib/siai-seo-policy";
export default function sitemap():MetadataRoute.Sitemap{
 const paths=["/","/products","/tools",...GLOBAL_TOOL_CATALOG.map(t=>`/tools/${t.slug}`),...Object.keys(SEO_TOPICS).map(topic=>`/discover/${topic}`)];
 const rows:MetadataRoute.Sitemap=[];
 for(const path of paths){
  const languages=Object.fromEntries(Object.entries(languageAlternates(path)).map(([lang,url])=>[lang,SITE+url]));
  for(const locale of Object.keys(SEO_LOCALES) as SeoLocale[])rows.push({url:SITE+localePath(locale,path),alternates:{languages}});
 }
 for(const path of ["/sasi","/sasi/drama","/sasi/build","/sasi/image","/ai-knowledge","/ai-learning","/ai-research","/about","/privacy","/terms","/refunds","/legal/sasi","/release"])rows.push({url:SITE+path});
 // An unreviewed candidate, preview or missing official price/free/models/region source is NEVER submitted for indexation.
 for(const id of MARKET_API_PRODUCTS){
  const facts=researchedFact(id);
  if(!siaiDetailShouldIndex(facts))continue;
  const languages=Object.fromEntries(SIAI_DETAIL_LOCALES.map(l=>[l,SITE+siaiProductPath(l,id)]));
  languages['zh-CN']=languages.zh;languages['x-default']=languages.en;
  for(const lang of SIAI_DETAIL_LOCALES)rows.push({
   url:SITE+siaiProductPath(lang,id),changeFrequency:'weekly',priority:0.65,
   alternates:{languages}
  });
 }
 return rows;
}
