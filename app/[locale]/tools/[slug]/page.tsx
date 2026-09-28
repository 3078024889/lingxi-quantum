import { SHARE_IMAGES, SHARE_IMAGE_URL } from "@/lib/share-image";
import type {Metadata} from "next";
import Link from "next/link";
import {notFound} from "next/navigation";
import {ToolSeoJsonLd} from "@/components/seo/GlobalSeoJsonLd";
import {GLOBAL_TOOL_CATALOG,LOCALIZED_LOCALES,SEO_LOCALES,getGlobalTool,isSeoLocale,languageAlternates,localePath,toolDescription,toolKeywords,toolTitle,type SeoLocale} from "@/lib/seo/global-seo";
type Props={params: Promise<{locale:string;slug:string}>};
export function generateStaticParams(){return LOCALIZED_LOCALES.flatMap(locale=>GLOBAL_TOOL_CATALOG.map(tool=>({locale,slug:tool.slug})))}
export async function generateMetadata(props:Props):Promise<Metadata> {
 const params = await props.params;
 if(!isSeoLocale(params.locale)||params.locale==="zh")return {};
 const tool=getGlobalTool(params.slug);if(!tool)return {};
 const locale=params.locale,c=SEO_LOCALES[locale];
 return {title:`${toolTitle(locale,tool)} | LINGXIFIELD`,description:toolDescription(locale,tool),keywords:toolKeywords(locale,tool),alternates:{canonical:localePath(locale,`/tools/${tool.slug}`),languages:languageAlternates(`/tools/${tool.slug}`)},twitter:{card:"summary_large_image",images:[SHARE_IMAGE_URL]},openGraph:{images:SHARE_IMAGES,title:toolTitle(locale,tool),description:toolDescription(locale,tool),url:localePath(locale,`/tools/${tool.slug}`),siteName:"LINGXIFIELD",type:"website"}};
}
export default async function LocalizedTool(props:Props) {
 const params = await props.params;
 if(!isSeoLocale(params.locale)||params.locale==="zh")notFound();
 const tool=getGlobalTool(params.slug);if(!tool)notFound();
 const locale=params.locale as SeoLocale,c=SEO_LOCALES[locale],title=toolTitle(locale,tool);
 return <main dir={c.dir} style={{maxWidth:900,margin:"0 auto",padding:"48px 24px",fontFamily:"system-ui"}}>
  <ToolSeoJsonLd locale={locale} tool={tool}/>
  <nav><Link href={localePath(locale,"/tools")}>← {c.toolsTitle}</Link></nav>
  <h1 style={{fontSize:"clamp(34px,6vw,60px)",lineHeight:1.08}}>{title}</h1>
  <p style={{fontSize:19,lineHeight:1.8}}>{toolDescription(locale,tool)}</p>
  <p><Link href={`/tools/${tool.slug}`} style={{display:"inline-block",padding:"12px 18px",border:"1px solid currentColor",borderRadius:999,textDecoration:"none",fontWeight:700}}>{c.open} →</Link></p>
  <section style={{marginTop:42}}><h2>{c.what}</h2><p>{title}. {c.toolsDesc}</p></section>
  <section style={{marginTop:28}}><h2>{c.how}</h2><ol style={{lineHeight:1.9}}><li>{c.open}</li><li>{tool.mode==="local"?c.local:c.online}</li><li>{locale==="zh"?"处理完成后预览并保存结果。":"Preview the result and save it when processing is complete."}</li></ol></section>
  <section style={{marginTop:28}}><h2>{c.privacy}</h2><p>{tool.mode==="local"?c.local:c.online}</p></section>
 </main>
}
