import type {Metadata} from "next";
import {notFound} from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SpendDiagnostic from "@/components/siai/SpendDiagnostic";
import {getVerifiedSiaiOptions} from "@/lib/siai/verified-spend-options";
import {DIAGNOSTIC_COPY} from "@/lib/siai/spend-diagnostic-i18n";
import {SEO_LOCALES,LOCALIZED_LOCALES,isSeoLocale,localePath} from "@/lib/seo/global-seo";
import {PRIMARY_SITE} from "@/lib/seo/site-domains";
import {siaiLandingShouldIndex} from "@/lib/siai-seo-policy";
type Props={params:Promise<{locale:string}>};
export const dynamic="force-dynamic";
export const revalidate=0;
export function generateStaticParams(){return LOCALIZED_LOCALES.map(locale=>({locale}));}
export async function generateMetadata({params}:Props):Promise<Metadata>{
 const {locale}=await params;
 if(!isSeoLocale(locale)||locale==="zh")return {robots:{index:false,follow:false}};
 const copy=DIAGNOSTIC_COPY[locale],url=PRIMARY_SITE+localePath(locale,"/siai/spend-diagnostic");
 const languages=Object.fromEntries((Object.keys(SEO_LOCALES) as (keyof typeof SEO_LOCALES)[]).map(l=>[SEO_LOCALES[l].hreflang,PRIMARY_SITE+localePath(l,"/siai/spend-diagnostic")]));
 return {title:copy.title+"｜LINGXIFIELD",description:copy.pageIntro,alternates:{canonical:url,languages},
  robots:{index:siaiLandingShouldIndex(),follow:true},openGraph:{title:copy.pageTitle,description:copy.pageIntro,url}};
}
export default async function LocalizedSpendDiagnostic({params}:Props){
 const {locale}=await params;
 if(!isSeoLocale(locale)||locale==="zh")notFound();
 const meta=SEO_LOCALES[locale];
 return <><Nav/><div dir={meta.dir} lang={meta.hreflang}><SpendDiagnostic candidates={getVerifiedSiaiOptions()}/></div><Footer/></>;
}
