import {publicPageMetadata} from "@/lib/seo/page-metadata";
import type {Metadata} from "next";
import Link from "next/link";
import {notFound} from "next/navigation";
import {TopicSeoJsonLd} from "@/components/seo/GlobalSeoJsonLd";
import GrowthPageShell from "@/components/seo/GrowthPageShell";
import {LOCALIZED_LOCALES,SEO_LOCALES,SEO_TOPICS,isSeoLocale,isSeoTopic,localePath,topicTitle,type SeoLocale,type SeoTopic} from "@/lib/seo/global-seo";
import {SERVICE_FACTS} from "@/lib/seo/service-facts";
import LocaleEntryLink from "@/components/seo/LocaleEntryLink";
import {FACT_LABELS} from "@/lib/seo/product-facts";

type Props={params:Promise<{locale:string;topic:string}>};
export function generateStaticParams(){return LOCALIZED_LOCALES.flatMap(locale=>Object.keys(SEO_TOPICS).map(topic=>({locale,topic})))}
export async function generateMetadata(props:Props):Promise<Metadata>{
 const params=await props.params;
 if(!isSeoLocale(params.locale)||params.locale==="zh"||!isSeoTopic(params.topic))return {};
 const locale=params.locale as SeoLocale,title=topicTitle(locale,params.topic as SeoTopic);
 return publicPageMetadata(locale,`/discover/${params.topic}`,title,SERVICE_FACTS[params.topic as SeoTopic].description[locale]);
}
export default async function LocalizedTopic(props:Props){
 const params=await props.params;
 if(!isSeoLocale(params.locale)||params.locale==="zh"||!isSeoTopic(params.topic))notFound();
 const locale=params.locale as SeoLocale,topic=params.topic as SeoTopic,c=SEO_LOCALES[locale],title=topicTitle(locale,topic);
 const target=SERVICE_FACTS[topic].target;
 return <GrowthPageShell locale={locale} eyebrow={FACT_LABELS.products[locale]} title={title} description={SERVICE_FACTS[topic].description[locale]} backHref="/products" backLabel={FACT_LABELS.products[locale]}>
  <TopicSeoJsonLd locale={locale} topic={topic}/>
  <section className="lx-growth-panel">
   <h2>{FACT_LABELS.limits[locale]}</h2>
   <p>{FACT_LABELS.limitsGeneral[locale]}</p>
   <Link className="lx-growth-text-link" href={localePath(locale,"/products")}>{FACT_LABELS.products[locale]} →</Link>
  </section>
  <div className="lx-growth-tool-actions"><LocaleEntryLink locale={locale} href={target}>{c.open} →</LocaleEntryLink></div>
 </GrowthPageShell>;
}
