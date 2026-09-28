import type {Metadata} from "next";
import Link from "next/link";
import {notFound} from "next/navigation";
import {GLOBAL_TOOL_CATALOG,LOCALIZED_LOCALES,SEO_LOCALES,isSeoLocale,languageAlternates,localePath,type SeoLocale} from "@/lib/seo/global-seo";
type Props={params: Promise<{locale:string}>};
export function generateStaticParams(){return LOCALIZED_LOCALES.map(locale=>({locale}))}
export async function generateMetadata(props:Props):Promise<Metadata> {
 const params = await props.params;
 if(!isSeoLocale(params.locale)||params.locale==="zh")return {};
 const locale=params.locale,c=SEO_LOCALES[locale];
 return {title:`${c.toolsTitle} | PDF · Image · Video · OCR | LINGXIFIELD`,description:c.toolsDesc,keywords:[...c.searchTerms],alternates:{canonical:localePath(locale,"/tools"),languages:languageAlternates("/tools")}};
}
export default async function LocalizedTools(props:Props) {
 const params = await props.params;
 if(!isSeoLocale(params.locale)||params.locale==="zh")notFound();
 const locale=params.locale as SeoLocale,c=SEO_LOCALES[locale];
 return <main dir={c.dir} style={{maxWidth:1120,margin:"0 auto",padding:"48px 24px",fontFamily:"system-ui"}}>
  <Link href={localePath(locale,"/")}>← {c.brand}</Link>
  <h1 style={{fontSize:"clamp(32px,5vw,56px)"}}>{c.toolsTitle}</h1><p style={{fontSize:18,lineHeight:1.7}}>{c.toolsDesc}</p>
  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))",gap:12,marginTop:32}}>
   {GLOBAL_TOOL_CATALOG.map(tool=><Link key={tool.slug} href={localePath(locale,`/tools/${tool.slug}`)} style={{padding:18,border:"1px solid #9995",borderRadius:16,textDecoration:"none"}}><b>{locale==="zh"?tool.zh:tool.en}</b><div style={{marginTop:8,opacity:.72}}>{tool.mode==="local"?c.local:c.online}</div></Link>)}
  </div>
 </main>
}
