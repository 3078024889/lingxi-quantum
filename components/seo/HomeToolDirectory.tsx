import Link from 'next/link';
import {GLOBAL_TOOL_CATALOG,localePath,toolTitle,type SeoLocale} from '@/lib/seo/global-seo';
import {toolGeoFact} from '@/lib/seo/site-facts';
import {PUBLIC_FEATURE_COPY} from '@/lib/public-feature-copy';

// Server-rendered links remain available to crawlers without JavaScript.
export default function HomeToolDirectory({locale}:{locale:SeoLocale}){
 const c=PUBLIC_FEATURE_COPY[locale];
 const tools=GLOBAL_TOOL_CATALOG.map(tool=>({tool,fact:toolGeoFact(tool.slug,locale)})).filter(item=>item.fact&&item.fact.kind!=='later');
 return <section lang={locale} dir={locale==='ar'?'rtl':'ltr'} className="lx11-wrap" aria-label={c.directory} style={{paddingTop:24,paddingBottom:40}}>
  <details className="rounded-2xl border border-[var(--lx-line)] p-5" data-home-tool-directory>
   <summary className="cursor-pointer font-semibold">{c.directory} · {c.freeTools}</summary>
   <ul className="mt-5 grid list-none gap-3 p-0 sm:grid-cols-2 lg:grid-cols-3">
    {tools.map(({tool,fact})=><li key={tool.slug} className="flex items-start justify-between gap-3 text-sm"><Link href={localePath(locale,'/tools/'+tool.slug)}>{toolTitle(locale,tool)}</Link><span className="shrink-0 text-xs text-[var(--lx-muted)]">{fact!.kind?.startsWith('free')?c.free:c.paid}</span></li>)}
   </ul>
  </details>
 </section>;
}
