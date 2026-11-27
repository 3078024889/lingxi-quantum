import Link from "next/link";
import {FACT_LABELS,toolFacts} from "@/lib/seo/product-facts";
import {toolGeoFact} from "@/lib/seo/site-facts";
import {getGlobalTool,localePath,SEO_LOCALES,toolTitle,type GlobalTool,type SeoLocale} from "@/lib/seo/global-seo";
import SearchIntentFaq from "./SearchIntentFaq";
import {tutorialCopy,toolTutorialSteps} from "@/lib/tools/tutorial-copy";

// Public copy stays task-oriented; implementation details remain in source/audit data.
export default function ToolFacts({tool,locale}:{tool:GlobalTool;locale:SeoLocale}){
 const facts=toolFacts(tool.slug,locale),c=SEO_LOCALES[locale];
 const fact=toolGeoFact(tool.slug,locale);
 const related=facts.related.map(getGlobalTool).filter((x):x is GlobalTool=>Boolean(x));
 const guide=tutorialCopy(locale),steps=toolTutorialSteps(locale,tool.slug);
 return <section lang={c.hreflang} dir={c.dir} aria-label={guide[0]} className="lx-growth-facts">
  <h2 className="lx-growth-section-title">{guide[0]}</h2>
  <p>{facts.summary}</p>
  {fact?.kind==="later"?null:<ol className="lx-growth-steps"><li>{steps[0]}</li><li>{steps[1]}</li><li>{steps[2]}</li></ol>}
  <h2>{c.privacy}</h2><p>{fact?.description??(tool.mode==="local"?c.local:c.online)}</p>
  {tool.slug==="food-calorie"&&<section className="lx-growth-source-panel"><h2>{FACT_LABELS.sources[locale]}</h2><ul><li><a href="https://fdc.nal.usda.gov/">USDA FoodData Central</a></li><li><a href="https://data.gov.tw/dataset/8543">Taiwan FDA · Open Government Data License 1.0</a></li></ul></section>}
  <h2>{guide[1]}</h2>
  {([2,4,6] as const).filter(index=>!["ai-image-check","ai-video-audio-check"].includes(tool.slug)||index!==6).map(index=><details key={index} className="lx-growth-faq-item"><summary>{guide[index]}</summary><p>{guide[index+1]}</p></details>)}
  <SearchIntentFaq slug={tool.slug} locale={locale}/>
  {related.length>0&&<nav aria-label={FACT_LABELS.related[locale]} className="lx-growth-related"><h2 className="lx-growth-section-title">{FACT_LABELS.related[locale]}</h2><ul>{related.map(item=><li key={item.slug}><Link href={localePath(locale,`/tools/${item.slug}`)}>{toolTitle(locale,item)}</Link></li>)}</ul></nav>}
 </section>;
}
