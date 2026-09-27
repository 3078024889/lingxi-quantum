import type {Metadata} from "next";
import Link from "next/link";
import {notFound} from "next/navigation";
import {TopicSeoJsonLd} from "@/components/seo/GlobalSeoJsonLd";
import {LOCALIZED_LOCALES,SEO_LOCALES,SEO_TOPICS,isSeoLocale,isSeoTopic,languageAlternates,localePath,topicTitle,type SeoLocale,type SeoTopic} from "@/lib/seo/global-seo";
type Props={params:{locale:string;topic:string}};
export function generateStaticParams(){return LOCALIZED_LOCALES.flatMap(locale=>Object.keys(SEO_TOPICS).map(topic=>({locale,topic})))}
export function generateMetadata({params}:Props):Metadata{
 if(!isSeoLocale(params.locale)||params.locale==="zh"||!isSeoTopic(params.topic))return {};
 const locale=params.locale as SeoLocale,topic=params.topic as SeoTopic,c=SEO_LOCALES[locale],title=topicTitle(locale,topic);
 return {title:`${title} | SASI | LINGXIFIELD`,description:`${title}. ${c.topicIntro}`,keywords:[title,...c.searchTerms],alternates:{canonical:localePath(locale,`/discover/${topic}`),languages:languageAlternates(`/discover/${topic}`)}};
}
export default function LocalizedTopic({params}:Props){
 if(!isSeoLocale(params.locale)||params.locale==="zh"||!isSeoTopic(params.topic))notFound();
 const locale=params.locale as SeoLocale,topic=params.topic as SeoTopic,c=SEO_LOCALES[locale],title=topicTitle(locale,topic);
 const target=topic==="ai-short-drama-generator"?"/sasi/drama":topic==="book-to-ai-agent"?"/ai-knowledge":topic==="learning-ai-agent"?"/ai-learning":topic==="research-ai-agent"?"/ai-research":"/sasi";
 return <main dir={c.dir} style={{maxWidth:900,margin:"0 auto",padding:"48px 24px",fontFamily:"system-ui"}}>
  <TopicSeoJsonLd locale={locale} topic={topic}/><Link href={localePath(locale,"/")}>← {c.brand}</Link>
  <h1 style={{fontSize:"clamp(36px,6vw,64px)",lineHeight:1.08}}>{title}</h1><p style={{fontSize:20,lineHeight:1.8}}>{c.topicIntro}</p>
  <p><Link href={target} style={{display:"inline-block",padding:"12px 18px",border:"1px solid currentColor",borderRadius:999,textDecoration:"none",fontWeight:700}}>{c.open} →</Link></p>
 </main>
}
