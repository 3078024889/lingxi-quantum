import {publicPageMetadata} from "@/lib/seo/page-metadata";
import type {Metadata} from "next";
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import HomeProblemHub from '@/components/HomeProblemHub';
import {PUBLIC_FEATURE_COPY,PUBLIC_SEARCH_TITLES} from '@/lib/public-feature-copy';
import {notFound} from "next/navigation";
import {LOCALIZED_LOCALES,SEO_LOCALES,isSeoLocale,type SeoLocale} from "@/lib/seo/global-seo";

type Props={params: Promise<{locale:string}>};
export function generateStaticParams(){return LOCALIZED_LOCALES.map(locale=>({locale}))}
export async function generateMetadata(props:Props):Promise<Metadata> {
 const params = await props.params;
 if(!isSeoLocale(params.locale)||params.locale==="zh")return {};
 const locale=params.locale,c=SEO_LOCALES[locale];
 return publicPageMetadata(locale,"/",PUBLIC_SEARCH_TITLES[locale],PUBLIC_FEATURE_COPY[locale].description);
}
export default async function LocalizedHome(props:Props) {
 const params = await props.params;
 if(!isSeoLocale(params.locale)||params.locale==="zh")notFound();
 const locale=params.locale as SeoLocale,c=SEO_LOCALES[locale];
 return <><Nav/><div lang={c.hreflang} dir={c.dir}><HomeProblemHub/><Footer/></div></>;
}
