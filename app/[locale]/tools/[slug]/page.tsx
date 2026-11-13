import {publicPageMetadata} from "@/lib/seo/page-metadata";
import type {Metadata} from "next";
import {notFound} from "next/navigation";
import {ToolSeoJsonLd} from "@/components/seo/GlobalSeoJsonLd";
import ToolFacts from "@/components/seo/ToolFacts";
import LocaleEntryLink from "@/components/seo/LocaleEntryLink";
import GrowthPageShell from "@/components/seo/GrowthPageShell";
import {GLOBAL_TOOL_CATALOG,LOCALIZED_LOCALES,SEO_LOCALES,getGlobalTool,isSeoLocale,type SeoLocale,toolDescription,toolTitle} from "@/lib/seo/global-seo";
import {buildSearchOptimizedToolMetadata} from "@/lib/seo/search-tool-metadata";

type Props={params:Promise<{locale:string;slug:string}>};
export function generateStaticParams(){return LOCALIZED_LOCALES.flatMap(locale=>GLOBAL_TOOL_CATALOG.filter(tool=>tool.slug!=="image-to-pdf-pro").map(tool=>({locale,slug:tool.slug})))}
export async function generateMetadata(props:Props):Promise<Metadata>{
 const params=await props.params;
 if(!isSeoLocale(params.locale)||params.locale==="zh")return {};
 const tool=getGlobalTool(params.slug);if(!tool)return {};
 return buildSearchOptimizedToolMetadata(tool.slug,params.locale);
}
export default async function LocalizedTool(props:Props){
 const params=await props.params;
 if(!isSeoLocale(params.locale)||params.locale==="zh")notFound();
 const tool=getGlobalTool(params.slug);if(!tool)notFound();
 const locale=params.locale as SeoLocale,c=SEO_LOCALES[locale],title=toolTitle(locale,tool);
 const description=buildSearchOptimizedToolMetadata(tool.slug,locale).description??toolDescription(locale,tool);
 return <GrowthPageShell locale={locale} eyebrow={c.toolsTitle} title={title} description={description} backHref="/tools" backLabel={c.toolsTitle}>
  <ToolSeoJsonLd locale={locale} tool={tool}/>
  <div className="lx-growth-tool-actions"><LocaleEntryLink locale={locale} href={`/tools/${tool.slug}`}>{c.open} →</LocaleEntryLink></div>
  <ToolFacts tool={tool} locale={locale}/>
 </GrowthPageShell>;
}
