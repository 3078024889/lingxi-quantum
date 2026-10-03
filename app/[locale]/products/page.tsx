import {publicPageMetadata} from "@/lib/seo/page-metadata";
import type {Metadata} from 'next';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import ProductDirectory from '@/components/seo/ProductDirectory';
import {SEO_LOCALES,LOCALIZED_LOCALES,isSeoLocale,localePath} from '@/lib/seo/global-seo';
import {pageGeoFact} from '@/lib/seo/site-facts';
type Props={params:Promise<{locale:string}>};
export function generateStaticParams(){return LOCALIZED_LOCALES.map(locale=>({locale}))}
export async function generateMetadata({params}:Props):Promise<Metadata>{
 const {locale}=await params;if(!isSeoLocale(locale)||locale==='zh')return {};
 const fact=pageGeoFact("products",locale);return publicPageMetadata(locale,"/products",fact.title,fact.description);
}
export default async function Page({params}:Props){
 const {locale}=await params;if(!isSeoLocale(locale)||locale==='zh')notFound();
 return <main lang={SEO_LOCALES[locale].hreflang} dir={SEO_LOCALES[locale].dir} style={{maxWidth:1150,margin:'auto',padding:24}}><Link href={localePath(locale,'/')}>LINGXIFIELD</Link><h1>{pageGeoFact("products",locale).title}</h1><p>{pageGeoFact("products",locale).description}</p><ProductDirectory locale={locale}/></main>;
}
