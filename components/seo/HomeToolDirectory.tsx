import Link from 'next/link';
import {GLOBAL_TOOL_CATALOG,localePath,toolTitle,type SeoLocale} from '@/lib/seo/global-seo';
import {toolGeoFact} from '@/lib/seo/site-facts';
import {PUBLIC_FEATURE_COPY} from '@/lib/public-feature-copy';

// Server-rendered links remain available to crawlers without JavaScript.
export default function HomeToolDirectory({locale}:{locale:SeoLocale}){
 const c=PUBLIC_FEATURE_COPY[locale];
 const tools=GLOBAL_TOOL_CATALOG.map(tool=>({tool,fact:toolGeoFact(tool.slug,locale)})).filter(item=>item.fact&&item.fact.kind!=='later');
 return <section lang={locale} dir={locale==='ar'?'rtl':'ltr'} className="lx11-wrap" aria-label={c.directory} style={{paddingTop:24,paddingBottom:40}}>
  <div data-home-tool-directory>
   <h2 className="text-base font-semibold">{c.freeTools}</h2>
   <ul className="mt-4 list-none p-0 text-sm leading-8">
    {tools.map(({tool,fact})=><li key={tool.slug} className="inline"><Link href={localePath(locale,'/tools/'+tool.slug)}>{toolTitle(locale,tool)}</Link><span className="text-xs text-[var(--lx-muted)]">{fact!.kind?.startsWith('free')?'':` (${c.paid})`} · </span></li>)}
   </ul>
  </div>
 </section>;
}
