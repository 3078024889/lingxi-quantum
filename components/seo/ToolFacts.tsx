import Link from 'next/link';
import {FACT_LABELS,toolFacts} from '@/lib/seo/product-facts';
import {toolGeoFact} from '@/lib/seo/site-facts';
import {getGlobalTool,localePath,SEO_LOCALES,toolTitle,type GlobalTool,type SeoLocale} from '@/lib/seo/global-seo';
import SearchIntentFaq from './SearchIntentFaq';
import {tutorialCopy} from '@/lib/tools/tutorial-copy';

// User-facing copy intentionally excludes internal implementation and engine details.
export default function ToolFacts({tool,locale}:{tool:GlobalTool;locale:SeoLocale}){
 const facts=toolFacts(tool.slug,locale),c=SEO_LOCALES[locale];
 const fact=toolGeoFact(tool.slug,locale);
 const related=facts.related.map(getGlobalTool).filter((x):x is GlobalTool=>Boolean(x));
 const guide=tutorialCopy(locale);
 return <section lang={c.hreflang} dir={c.dir} aria-label={guide[0]} style={{maxWidth:900,margin:'40px auto',padding:'24px',lineHeight:1.8}}>
  <h2>{guide[0]}</h2><p>{facts.summary}</p>
  {fact?.kind==='later'?null:<ol><li>{guide[8]}</li><li>{guide[9]}</li><li>{guide[10]}</li></ol>}
  <h2>{guide[1]}</h2>{([2,4,6] as const).map(index=><details key={index} className="my-3"><summary>{guide[index]}</summary><p>{guide[index+1]}</p></details>)}
  <SearchIntentFaq slug={tool.slug} locale={locale}/>
  {related.length>0&&<nav aria-label={FACT_LABELS.related[locale]}><h2>{FACT_LABELS.related[locale]}</h2><ul>{related.map(item=><li key={item.slug}><Link href={localePath(locale,`/tools/${item.slug}`)}>{toolTitle(locale,item)}</Link></li>)}</ul></nav>}
 </section>;
}
