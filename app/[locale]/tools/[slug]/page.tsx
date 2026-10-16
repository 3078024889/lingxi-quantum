import {publicPageMetadata} from "@/lib/seo/page-metadata";
import type {Metadata} from "next";
import Link from "next/link";
import {notFound} from "next/navigation";
import {ToolSeoJsonLd} from "@/components/seo/GlobalSeoJsonLd";
import ToolFacts from '@/components/seo/ToolFacts';
import LocaleEntryLink from '@/components/seo/LocaleEntryLink';
import {GLOBAL_TOOL_CATALOG,LOCALIZED_LOCALES,SEO_LOCALES,getGlobalTool,isSeoLocale,localePath,toolTitle,type SeoLocale} from "@/lib/seo/global-seo";
import {buildSearchOptimizedToolMetadata} from '@/lib/seo/search-tool-metadata';
type Props={params: Promise<{locale:string;slug:string}>};
export function generateStaticParams(){return LOCALIZED_LOCALES.flatMap(locale=>GLOBAL_TOOL_CATALOG.map(tool=>({locale,slug:tool.slug})))}
export async function generateMetadata(props:Props):Promise<Metadata> {
 const params = await props.params;
 if(!isSeoLocale(params.locale)||params.locale==="zh")return {};
 const tool=getGlobalTool(params.slug);if(!tool)return {};
 return buildSearchOptimizedToolMetadata(tool.slug,params.locale);
}
export default async function LocalizedTool(props:Props) {
 const params = await props.params;
 if(!isSeoLocale(params.locale)||params.locale==="zh")notFound();
 const tool=getGlobalTool(params.slug);if(!tool)notFound();
 const locale=params.locale as SeoLocale,c=SEO_LOCALES[locale],title=toolTitle(locale,tool);
 return <main lang={c.hreflang} dir={c.dir} style={{maxWidth:900,margin:"0 auto",padding:"48px 24px",fontFamily:"system-ui"}}>
  <ToolSeoJsonLd locale={locale} tool={tool}/>
  <nav><Link href={localePath(locale,"/tools")}>← {c.toolsTitle}</Link></nav>
  <h1 style={{fontSize:"clamp(34px,6vw,60px)",lineHeight:1.08}}>{title}</h1>
  <p style={{fontSize:19,lineHeight:1.8}}>{buildSearchOptimizedToolMetadata(tool.slug,locale).description}</p>
  <p><LocaleEntryLink locale={locale} href={`/tools/${tool.slug}`}>{c.open} →</LocaleEntryLink></p>
  <ToolFacts tool={tool} locale={locale}/>
 </main>
}
