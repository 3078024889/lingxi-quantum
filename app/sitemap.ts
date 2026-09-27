import type {MetadataRoute} from "next";
import {GLOBAL_TOOL_CATALOG,LOCALIZED_LOCALES,SEO_TOPICS,SITE,localePath} from "@/lib/seo/global-seo";

const CORE=["","/products","/explore","/tools","/sasi","/sasi/drama","/sasi/pricing","/ai-knowledge","/ai-learning","/ai-research","/about","/terms","/privacy","/refunds","/legal/sasi"];

export default function sitemap():MetadataRoute.Sitemap{
 const routes=new Set<string>(CORE);
 for(const tool of GLOBAL_TOOL_CATALOG)routes.add(`/tools/${tool.slug}`);
 for(const topic of Object.keys(SEO_TOPICS))routes.add(`/discover/${topic}`);
 for(const locale of LOCALIZED_LOCALES){
  routes.add(localePath(locale,"/"));
  routes.add(localePath(locale,"/tools"));
  for(const tool of GLOBAL_TOOL_CATALOG)routes.add(localePath(locale,`/tools/${tool.slug}`));
  for(const topic of Object.keys(SEO_TOPICS))routes.add(localePath(locale,`/discover/${topic}`));
 }
 return [...routes].map(route=>({url:`${SITE}${route}`,changeFrequency:route===""?"daily":"weekly",priority:route===""?1:route.includes("/tools/")?0.88:route.includes("/discover/")?0.86:0.78}));
}
