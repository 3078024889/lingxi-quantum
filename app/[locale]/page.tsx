import {publicPageMetadata} from "@/lib/seo/page-metadata";
import { SHARE_IMAGES, SHARE_IMAGE_URL } from "@/lib/share-image";
import type {Metadata} from "next";
import Link from "next/link";
import {notFound} from "next/navigation";
import {FACT_LABELS} from '@/lib/seo/product-facts';
import {LOCALIZED_LOCALES,SEO_LOCALES,isSeoLocale,languageAlternates,localePath,SEO_TOPICS,type SeoLocale} from "@/lib/seo/global-seo";

type Props={params: Promise<{locale:string}>};
export function generateStaticParams(){return LOCALIZED_LOCALES.map(locale=>({locale}))}
export async function generateMetadata(props:Props):Promise<Metadata> {
 const params = await props.params;
 if(!isSeoLocale(params.locale)||params.locale==="zh")return {};
 const locale=params.locale,c=SEO_LOCALES[locale];
 return publicPageMetadata(locale,"/",c.homeTitle,c.homeDesc);
}
export default async function LocalizedHome(props:Props) {
 const params = await props.params;
 if(!isSeoLocale(params.locale)||params.locale==="zh")notFound();
 const locale=params.locale as SeoLocale,c=SEO_LOCALES[locale];
 return <main lang={c.hreflang} dir={c.dir} style={{maxWidth:1040,margin:"0 auto",padding:"48px 24px",fontFamily:"system-ui"}}>
  <header><Link href={localePath(locale,'/')} style={{textDecoration:"none"}}><b>{c.brand}</b></Link> · <Link href={localePath(locale,'/products')}>{FACT_LABELS.products[locale]}</Link></header>
  <section style={{padding:"64px 0 36px"}}><h1 style={{fontSize:"clamp(34px,6vw,64px)",lineHeight:1.08,margin:0}}>{c.homeTitle}</h1><p style={{fontSize:19,lineHeight:1.8,maxWidth:820}}>{c.homeDesc}</p></section>
  <section><h2>{c.toolsTitle}</h2><p>{c.toolsDesc}</p><Link href={localePath(locale,"/tools")}>{c.allTools} →</Link></section>
  <section style={{marginTop:44}}><h2>SASI</h2><p>{c.topicIntro}</p><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:12}}>
   {(Object.keys(SEO_TOPICS) as Array<keyof typeof SEO_TOPICS>).map(topic=><Link key={topic} href={localePath(locale,`/discover/${topic}`)} style={{padding:18,border:"1px solid currentColor",borderRadius:16,textDecoration:"none"}}>{SEO_TOPICS[topic][locale]} →</Link>)}
  </div></section>
 </main>
}
