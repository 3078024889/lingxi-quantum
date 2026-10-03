import Link from 'next/link';
import {FACT_LABELS,toolFacts} from '@/lib/seo/product-facts';
import {localFreeToolFact} from '@/lib/seo/local-free-tools';
import {getGlobalTool,localePath,SEO_LOCALES,toolTitle,type GlobalTool,type SeoLocale} from '@/lib/seo/global-seo';

export default function ToolFacts({tool,locale}:{tool:GlobalTool;locale:SeoLocale}){
 const facts=toolFacts(tool.slug,locale),c=SEO_LOCALES[locale];
 const fact=localFreeToolFact(tool.slug,locale);
 const related=facts.related.map(getGlobalTool).filter((x):x is GlobalTool=>Boolean(x));
 return <section lang={c.hreflang} dir={c.dir} aria-label={FACT_LABELS.input[locale]} style={{maxWidth:900,margin:'40px auto',padding:'24px',lineHeight:1.8}}>
  <h2>{FACT_LABELS.input[locale]}</h2><p>{fact?.description??facts.summary}</p>
  {facts.formats&&<p><code>{facts.formats}</code></p>}
  <h2>{c.how}</h2><ol><li>{FACT_LABELS.choose[locale]}</li><li>{facts.limits}</li><li>{FACT_LABELS.review[locale]}</li></ol>
  <h2>{c.privacy}</h2><p>{tool.mode==='local'?c.local:c.online}</p>
  {tool.slug==='food-calorie'&&<section><h2>{FACT_LABELS.sources[locale]}</h2><ul><li><a href="https://fdc.nal.usda.gov/">USDA FoodData Central</a></li><li><a href="https://data.gov.tw/dataset/8543">Taiwan FDA · Open Government Data License 1.0</a></li></ul></section>}
  {related.length>0&&<nav aria-label={FACT_LABELS.related[locale]}><h2>{FACT_LABELS.related[locale]}</h2><ul>{related.map(item=><li key={item.slug}><Link href={localePath(locale,`/tools/${item.slug}`)}>{toolTitle(locale,item)}</Link></li>)}</ul></nav>}
 </section>;
}
