import {publicPageMetadata} from "@/lib/seo/page-metadata";
import type {Metadata} from "next";
import Link from "next/link";
import {notFound} from "next/navigation";
import {TopicSeoJsonLd} from "@/components/seo/GlobalSeoJsonLd";
import {LOCALIZED_LOCALES,SEO_LOCALES,SEO_TOPICS,isSeoLocale,isSeoTopic,languageAlternates,localePath,topicTitle,type SeoLocale,type SeoTopic} from "@/lib/seo/global-seo";
import {SERVICE_FACTS} from "@/lib/seo/service-facts";
import LocaleEntryLink from "@/components/seo/LocaleEntryLink";
import {FACT_LABELS} from "@/lib/seo/product-facts";
type Props={params: Promise<{locale:string;topic:string}>};
export function generateStaticParams(){return LOCALIZED_LOCALES.flatMap(locale=>Object.keys(SEO_TOPICS).map(topic=>({locale,topic})))}
export async function generateMetadata(props:Props):Promise<Metadata> {
 const params = await props.params;
 if(!isSeoLocale(params.locale)||params.locale==="zh"||!isSeoTopic(params.topic))return {};
 const locale=params.locale as SeoLocale,topic=params.topic as SeoTopic,c=SEO_LOCALES[locale],title=topicTitle(locale,topic);
 return publicPageMetadata(locale,`/discover/${topic}`,title,SERVICE_FACTS[topic].description[locale]);
}
export default async function LocalizedTopic(props:Props) {
 const params = await props.params;
 if(!isSeoLocale(params.locale)||params.locale==="zh"||!isSeoTopic(params.topic))notFound();
 const locale=params.locale as SeoLocale,topic=params.topic as SeoTopic,c=SEO_LOCALES[locale],title=topicTitle(locale,topic);
 const target=SERVICE_FACTS[topic].target;
 return <main lang={c.hreflang} dir={c.dir} style={{maxWidth:900,margin:"0 auto",padding:"48px 24px",fontFamily:"system-ui"}}>
  <TopicSeoJsonLd locale={locale} topic={topic}/><Link href={localePath(locale,"/")}>← {c.brand}</Link>
  <h1 style={{fontSize:"clamp(36px,6vw,64px)",lineHeight:1.08}}>{title}</h1><p style={{fontSize:20,lineHeight:1.8}}>{SERVICE_FACTS[topic].description[locale]}</p>
  <p><LocaleEntryLink locale={locale} href={target}>{c.open} →</LocaleEntryLink></p>
  <section><h2>{FACT_LABELS.limits[locale]}</h2><p>{FACT_LABELS.limitsGeneral[locale]}</p><Link href={localePath(locale,"/products")}>{FACT_LABELS.products[locale]}</Link></section>
 </main>
}
