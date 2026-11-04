import type {MetadataRoute} from "next";
import {GLOBAL_TOOL_CATALOG,SEO_LOCALES,SEO_TOPICS,localePath,languageAlternates,type SeoLocale} from "./global-seo";
import {CHINA_SITE,PRIMARY_SITE} from "./site-domains";
import {siaiLanguageAlternates} from "./siai-domain-policy";

/**
 * Keep two independently verified sitemap hosts consistent with their canonical signals.
 * The .cn public sitemap currently lists only the Chinese SIAI regional entry:
 * all other mirrored .cn URLs intentionally canonicalize to their .com counterparts.
 */
export function buildSiteSitemap(site:string,siaiIndexable:boolean):MetadataRoute.Sitemap {
  if(site===CHINA_SITE){
    return siaiIndexable?[{
      url:CHINA_SITE+"/siai",
      alternates:{languages:siaiLanguageAlternates()},
      changeFrequency:"daily",
      priority:0.9
    }]:[];
  }
  const paths=["/","/products","/tools",...GLOBAL_TOOL_CATALOG.map(t=>"/tools/"+t.slug),...Object.keys(SEO_TOPICS).map(topic=>"/discover/"+topic)];
  const rows:MetadataRoute.Sitemap=[];
  for(const path of paths){
    const languages=Object.fromEntries(Object.entries(languageAlternates(path)).map(([lang,url])=>[lang,PRIMARY_SITE+url]));
    for(const locale of Object.keys(SEO_LOCALES) as SeoLocale[])
      rows.push({url:PRIMARY_SITE+localePath(locale,path),alternates:{languages}});
  }
  if(siaiIndexable){
    const languages=siaiLanguageAlternates();
    for(const locale of Object.keys(SEO_LOCALES) as SeoLocale[])
      rows.push({url:PRIMARY_SITE+localePath(locale,"/siai"),alternates:{languages},changeFrequency:"daily",priority:0.9});
  }
  for(const path of ["/sasi","/sasi/drama","/sasi/build","/sasi/image","/ai-knowledge","/ai-learning","/ai-research","/about","/privacy","/terms","/refunds","/legal/sasi","/release"])
    rows.push({url:PRIMARY_SITE+path});
  return rows;
}
