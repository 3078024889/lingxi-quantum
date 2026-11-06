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
  const paths=["/","/products","/tools",...GLOBAL_TOOL_CATALOG.filter(t=>t.slug!=="image-to-pdf-pro").map(t=>"/tools/"+t.slug),...Object.keys(SEO_TOPICS).map(topic=>"/discover/"+topic)];
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
    const diagnosticLanguages=Object.fromEntries((Object.keys(SEO_LOCALES) as SeoLocale[]).map(locale=>[SEO_LOCALES[locale].hreflang,PRIMARY_SITE+localePath(locale,"/siai/spend-diagnostic")]));
    for(const locale of Object.keys(SEO_LOCALES) as SeoLocale[])
      rows.push({url:PRIMARY_SITE+localePath(locale,"/siai/spend-diagnostic"),alternates:{languages:diagnosticLanguages},changeFrequency:"weekly",priority:0.8});
  }
  // Only pages responding with their own public content belong in the XML sitemap.
  // /sasi/drama, /sasi/build and /ai-{knowledge,learning,research} redirect to /sasi.
  for(const path of ["/sasi","/sasi/image","/about","/privacy","/terms","/refunds","/legal/sasi","/release","/partners"])
    rows.push({url:PRIMARY_SITE+path});
  return rows;
}
