import {publicPageMetadata} from "@/lib/seo/page-metadata";
import type {Metadata} from "next";
import {notFound} from "next/navigation";
import ProductDirectory from "@/components/seo/ProductDirectory";
import GrowthPageShell from "@/components/seo/GrowthPageShell";
import {SEO_LOCALES,LOCALIZED_LOCALES,isSeoLocale,type SeoLocale} from "@/lib/seo/global-seo";
import {pageGeoFact} from "@/lib/seo/site-facts";

type Props={params:Promise<{locale:string}>};
export function generateStaticParams(){return LOCALIZED_LOCALES.map(locale=>({locale}))}
export async function generateMetadata({params}:Props):Promise<Metadata>{
 const {locale}=await params;if(!isSeoLocale(locale)||locale==="zh")return {};
 const fact=pageGeoFact("products",locale);return publicPageMetadata(locale,"/products",fact.title,fact.description);
}
export default async function Page({params}:Props){
 const {locale}=await params;if(!isSeoLocale(locale)||locale==="zh")notFound();
 const language=locale as SeoLocale,fact=pageGeoFact("products",language);
 return <GrowthPageShell locale={language} eyebrow={SEO_LOCALES[language].toolsTitle} title={fact.title} description={fact.description}>
  <ProductDirectory locale={language}/>
 </GrowthPageShell>;
}
