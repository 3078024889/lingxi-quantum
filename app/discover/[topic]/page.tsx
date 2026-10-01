import {publicPageMetadata} from "@/lib/seo/page-metadata";
import type {Metadata} from "next";
import Link from "next/link";
import {notFound} from "next/navigation";
import {TopicSeoJsonLd} from "@/components/seo/GlobalSeoJsonLd";
import {SEO_LOCALES,SEO_TOPICS,isSeoTopic,languageAlternates,topicTitle,type SeoTopic} from "@/lib/seo/global-seo";
import {SERVICE_FACTS} from "@/lib/seo/service-facts";
import LocaleEntryLink from "@/components/seo/LocaleEntryLink";
import {FACT_LABELS} from "@/lib/seo/product-facts";
type Props={params: Promise<{topic:string}>};
export function generateStaticParams(){return Object.keys(SEO_TOPICS).map(topic=>({topic}))}
export async function generateMetadata(props:Props):Promise<Metadata> {
 const params = await props.params;
 if(!isSeoTopic(params.topic))return {};
 const topic=params.topic as SeoTopic,title=topicTitle("zh",topic),c=SEO_LOCALES.zh;
 return publicPageMetadata("zh",`/discover/${topic}`,title,SERVICE_FACTS[topic].description.zh);
}
export default async function TopicPage(props:Props) {
 const params = await props.params;
 if(!isSeoTopic(params.topic))notFound();
 const topic=params.topic as SeoTopic,title=topicTitle("zh",topic),c=SEO_LOCALES.zh;
 const target=SERVICE_FACTS[topic].target;
 return <main lang="zh-CN" style={{maxWidth:900,margin:"0 auto",padding:"48px 24px",fontFamily:"system-ui"}}>
  <TopicSeoJsonLd locale="zh" topic={topic}/><Link href="/">← 灵犀场 LINGXIFIELD</Link>
  <h1 style={{fontSize:"clamp(36px,6vw,64px)",lineHeight:1.08}}>{title}</h1><p style={{fontSize:20,lineHeight:1.8}}>{SERVICE_FACTS[topic].description["zh"]}</p>
  <p><LocaleEntryLink locale={"zh"} href={target}>{c.open} →</LocaleEntryLink></p>
  <section><h2>{FACT_LABELS.limits["zh"]}</h2><p>{FACT_LABELS.limitsGeneral["zh"]}</p><Link href={"/products"}>{FACT_LABELS.products["zh"]}</Link></section>
 </main>
}
