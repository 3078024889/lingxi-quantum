import type {Metadata} from "next";
import Link from "next/link";
import {notFound} from "next/navigation";
import {TopicSeoJsonLd} from "@/components/seo/GlobalSeoJsonLd";
import {SEO_LOCALES,SEO_TOPICS,isSeoTopic,languageAlternates,topicTitle,type SeoTopic} from "@/lib/seo/global-seo";
type Props={params: Promise<{topic:string}>};
export function generateStaticParams(){return Object.keys(SEO_TOPICS).map(topic=>({topic}))}
export async function generateMetadata(props:Props):Promise<Metadata> {
 const params = await props.params;
 if(!isSeoTopic(params.topic))return {};
 const topic=params.topic as SeoTopic,title=topicTitle("zh",topic),c=SEO_LOCALES.zh;
 return {title:`${title}｜灵犀场 SASI`,description:`${title}。${c.topicIntro}`,keywords:[title,...c.searchTerms],alternates:{canonical:`/discover/${topic}`,languages:languageAlternates(`/discover/${topic}`)}};
}
export default async function TopicPage(props:Props) {
 const params = await props.params;
 if(!isSeoTopic(params.topic))notFound();
 const topic=params.topic as SeoTopic,title=topicTitle("zh",topic),c=SEO_LOCALES.zh;
 const target=topic==="ai-short-drama-generator"?"/sasi/drama":topic==="book-to-ai-agent"?"/ai-knowledge":topic==="learning-ai-agent"?"/ai-learning":topic==="research-ai-agent"?"/ai-research":"/sasi";
 return <main style={{maxWidth:900,margin:"0 auto",padding:"48px 24px",fontFamily:"system-ui"}}>
  <TopicSeoJsonLd locale="zh" topic={topic}/><Link href="/">← 灵犀场 LINGXIFIELD</Link>
  <h1 style={{fontSize:"clamp(36px,6vw,64px)",lineHeight:1.08}}>{title}</h1><p style={{fontSize:20,lineHeight:1.8}}>{c.topicIntro}</p>
  <p><Link href={target} style={{display:"inline-block",padding:"12px 18px",border:"1px solid currentColor",borderRadius:999,textDecoration:"none",fontWeight:700}}>进入 →</Link></p>
 </main>
}
