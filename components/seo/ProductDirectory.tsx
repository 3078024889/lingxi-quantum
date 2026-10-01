import Link from 'next/link';
import {GLOBAL_TOOL_CATALOG,SEO_LOCALES,SEO_TOPICS,localePath,toolTitle,type SeoLocale,type SeoTopic} from '@/lib/seo/global-seo';
import {FACT_LABELS} from '@/lib/seo/product-facts';
import {SERVICE_FACTS} from '@/lib/seo/service-facts';

export default function ProductDirectory({locale}:{locale:SeoLocale}){
 const c=SEO_LOCALES[locale];
 return <section lang={c.hreflang} dir={c.dir} style={{maxWidth:1100,padding:24,margin:'32px auto',lineHeight:1.8}}>
  <h2>{FACT_LABELS.products[locale]}</h2>
  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,280px),1fr))',gap:24}}>
  {(Object.keys(SEO_TOPICS) as SeoTopic[]).map(topic=><article key={topic}><h3><Link href={localePath(locale,`/discover/${topic}`)}>{SEO_TOPICS[topic][locale]}</Link></h3><p>{SERVICE_FACTS[topic].description[locale]}</p></article>)}
  </div>
  <h2>{c.toolsTitle}</h2><ul style={{columns:'260px 3',paddingInlineStart:20}}>{GLOBAL_TOOL_CATALOG.map(tool=><li key={tool.slug}><Link href={localePath(locale,`/tools/${tool.slug}`)}>{toolTitle(locale,tool)}</Link></li>)}</ul>
 </section>;
}
