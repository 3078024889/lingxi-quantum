import {publicPageMetadata} from "@/lib/seo/page-metadata";
import type {Metadata} from "next";
import Link from "next/link";
import {notFound} from "next/navigation";
import {TopicSeoJsonLd} from "@/components/seo/GlobalSeoJsonLd";
import GrowthPageShell from "@/components/seo/GrowthPageShell";
import {SEO_LOCALES,SEO_TOPICS,isSeoTopic,topicTitle,type SeoTopic} from "@/lib/seo/global-seo";
import {SERVICE_FACTS} from "@/lib/seo/service-facts";
import LocaleEntryLink from "@/components/seo/LocaleEntryLink";
import {FACT_LABELS} from "@/lib/seo/product-facts";

type Props={params:Promise<{topic:string}>};
export function generateStaticParams(){return Object.keys(SEO_TOPICS).map(topic=>({topic}))}
export async function generateMetadata(props:Props):Promise<Metadata>{
 const params=await props.params;
 if(!isSeoTopic(params.topic))return {};
 const topic=params.topic as SeoTopic,title=topicTitle("zh",topic);
 return publicPageMetadata("zh",`/discover/${params.topic}`,title,SERVICE_FACTS[topic].description.zh);
}
export default async function TopicPage(props:Props){
 const params=await props.params;
 if(!isSeoTopic(params.topic))notFound();
 const topic=params.topic as SeoTopic,title=topicTitle("zh",topic),copy=SEO_LOCALES.zh;
 const target=SERVICE_FACTS[topic].target;
 return <GrowthPageShell locale="zh" eyebrow={FACT_LABELS.products.zh} title={title} description={SERVICE_FACTS[topic].description.zh} backHref="/products" backLabel={FACT_LABELS.products.zh}>
  <TopicSeoJsonLd locale="zh" topic={topic}/>
  <section className="lx-growth-panel">
   <h2>{FACT_LABELS.limits.zh}</h2>
   <p>{FACT_LABELS.limitsGeneral.zh}</p>
   <Link className="lx-growth-text-link" href="/products">{FACT_LABELS.products.zh} →</Link>
  </section>
  <div className="lx-growth-tool-actions"><LocaleEntryLink locale="zh" href={target}>{copy.open} →</LocaleEntryLink></div>
 </GrowthPageShell>;
}
