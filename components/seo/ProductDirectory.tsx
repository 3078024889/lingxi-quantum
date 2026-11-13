import Link from "next/link";
import {GLOBAL_TOOL_CATALOG,SEO_LOCALES,SEO_TOPICS,localePath,toolTitle,type SeoLocale,type SeoTopic} from "@/lib/seo/global-seo";
import {FACT_LABELS} from "@/lib/seo/product-facts";
import {SERVICE_FACTS} from "@/lib/seo/service-facts";

export default function ProductDirectory({locale}:{locale:SeoLocale}){
 const c=SEO_LOCALES[locale];
 return <section lang={c.hreflang} dir={c.dir} className="lx-growth-directory">
  <section className="lx-growth-directory-section" aria-labelledby="lx-growth-topic-title">
   <h2 id="lx-growth-topic-title" className="lx-growth-section-title">{FACT_LABELS.products[locale]}</h2>
   <div className="lx-growth-topic-grid">
    {(Object.keys(SEO_TOPICS) as SeoTopic[]).map(topic=><Link className="lx-growth-topic-card" key={topic} href={localePath(locale,`/discover/${topic}`)}>
     <h3>{SEO_TOPICS[topic][locale]}</h3><p>{SERVICE_FACTS[topic].description[locale]}</p>
    </Link>)}
   </div>
  </section>
  <section className="lx-growth-directory-section" aria-labelledby="lx-growth-tools-title">
   <h2 id="lx-growth-tools-title" className="lx-growth-section-title">{c.toolsTitle}</h2>
   <ul className="lx-growth-tool-list">{GLOBAL_TOOL_CATALOG.map(tool=><li key={tool.slug}><Link href={localePath(locale,`/tools/${tool.slug}`)}>{toolTitle(locale,tool)}</Link></li>)}</ul>
  </section>
 </section>;
}
