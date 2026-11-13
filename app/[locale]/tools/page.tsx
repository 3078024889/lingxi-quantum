import {publicPageMetadata} from "@/lib/seo/page-metadata";
import type {Metadata} from "next";
import Link from "next/link";
import {notFound} from "next/navigation";
import GrowthPageShell from "@/components/seo/GrowthPageShell";
import {GLOBAL_TOOL_CATALOG,LOCALIZED_LOCALES,SEO_LOCALES,isSeoLocale,toolTitle,toolDescription,type SeoLocale} from "@/lib/seo/global-seo";

type Props={params:Promise<{locale:string}>};
export function generateStaticParams(){return LOCALIZED_LOCALES.map(locale=>({locale}))}
export async function generateMetadata(props:Props):Promise<Metadata>{
 const params=await props.params;
 if(!isSeoLocale(params.locale)||params.locale==="zh")return {};
 const locale=params.locale,c=SEO_LOCALES[locale];
 return publicPageMetadata(locale,"/tools",c.toolsTitle,c.toolsDesc);
}
export default async function LocalizedTools(props:Props){
 const params=await props.params;
 if(!isSeoLocale(params.locale)||params.locale==="zh")notFound();
 const locale=params.locale as SeoLocale,c=SEO_LOCALES[locale];
 return <GrowthPageShell locale={locale} eyebrow="LINGXIFIELD · TOOLS" title={c.toolsTitle} description={c.toolsDesc}>
  <section className="lx-growth-tool-grid" aria-label={c.toolsTitle}>
   {GLOBAL_TOOL_CATALOG.filter(tool=>tool.slug!=="image-to-pdf-pro").map(tool=><Link key={tool.slug} href={`/${locale}/tools/${tool.slug}`} className="lx-growth-tool-card">
    <strong>{toolTitle(locale,tool)}</strong><span>{toolDescription(locale,tool)}</span>
   </Link>)}
  </section>
 </GrowthPageShell>;
}
