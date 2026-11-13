import type {Metadata} from "next";
import {notFound} from "next/navigation";
import GrowthPageShell from "@/components/seo/GrowthPageShell";
import DiscoveriesHub,{DISCOVERIES_META} from "@/components/seo/DiscoveriesHub";
import {publicPageMetadata} from "@/lib/seo/page-metadata";
import {LOCALIZED_LOCALES,isSeoLocale,type SeoLocale} from "@/lib/seo/global-seo";
type Props={params:Promise<{locale:string}>};
export function generateStaticParams(){return LOCALIZED_LOCALES.map(locale=>({locale}))}
export async function generateMetadata({params}:Props):Promise<Metadata>{
 const {locale}=await params;
 if(!isSeoLocale(locale)||locale==="zh")return {};
 const language=locale as SeoLocale,meta=DISCOVERIES_META[language];
 return publicPageMetadata(language,"/discoveries",meta.title,meta.description);
}
export default async function LocalizedDiscoveriesPage({params}:Props){
 const {locale}=await params;
 if(!isSeoLocale(locale)||locale==="zh")notFound();
 const language=locale as SeoLocale,meta=DISCOVERIES_META[language];
 return <GrowthPageShell locale={language} eyebrow="DISCOVERY LAB · EVIDENCE FIRST" title={meta.title} description={meta.description}>
  <DiscoveriesHub locale={language}/>
 </GrowthPageShell>;
}