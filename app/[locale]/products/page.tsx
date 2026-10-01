import {publicPageMetadata} from "@/lib/seo/page-metadata";
import type {Metadata} from 'next';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import ProductDirectory from '@/components/seo/ProductDirectory';
import {SEO_LOCALES,LOCALIZED_LOCALES,isSeoLocale,localePath,languageAlternates} from '@/lib/seo/global-seo';
import {FACT_LABELS} from '@/lib/seo/product-facts';
type Props={params:Promise<{locale:string}>};
export function generateStaticParams(){return LOCALIZED_LOCALES.map(locale=>({locale}))}
export async function generateMetadata({params}:Props):Promise<Metadata>{
 const {locale}=await params;if(!isSeoLocale(locale)||locale==='zh')return {};
 return publicPageMetadata(locale,"/products",FACT_LABELS.products[locale],SEO_LOCALES[locale].homeDesc);
}
export default async function Page({params}:Props){
 const {locale}=await params;if(!isSeoLocale(locale)||locale==='zh')notFound();
 return <main lang={SEO_LOCALES[locale].hreflang} dir={SEO_LOCALES[locale].dir} style={{maxWidth:1150,margin:'auto',padding:24}}><Link href={localePath(locale,'/')}>LINGXIFIELD</Link><h1>{FACT_LABELS.products[locale]}</h1><p>{SEO_LOCALES[locale].homeDesc}</p><ProductDirectory locale={locale}/></main>;
}
