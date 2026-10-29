import type {Metadata} from 'next';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {supportedLocales,localeCopy, type Locale} from '../../../lib/locale-pages';
import {entries} from '../../../lib/catalog-store';
export const dynamicParams=false;
export function generateStaticParams(){return supportedLocales.map(lang=>({lang}))}
export async function generateMetadata({params}:{params:Promise<{lang:string}>}):Promise<Metadata>{
 const {lang}=await params;if(!supportedLocales.includes(lang as Locale))return {};
 const canonical=`https://lingxifield.com/${lang}/ai`;
 return {title:`LINGXIFIELD | ${localeCopy[lang as Locale].headline}`,description:localeCopy[lang as Locale].subtitle,alternates:{canonical,languages:Object.fromEntries(supportedLocales.map(code=>[code,`https://lingxifield.com/${code}/ai`]))},robots:{index:entries.length>0,follow:true}};
}
export default async function LocalizedMarket({params}:{params:Promise<{lang:string}>}){
 const {lang}=await params;if(!supportedLocales.includes(lang as Locale))notFound();
 const copy=localeCopy[lang as Locale];const isRtl=lang==='ar';
 return <main lang={lang} dir={isRtl?'rtl':'ltr'} style={{maxWidth:1120,margin:'0 auto',padding:'32px 24px',fontFamily:'system-ui, sans-serif',lineHeight:1.6}}>
  <header style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:20,flexWrap:'wrap'}}><Link href="/">LINGXIFIELD</Link><nav aria-label="Languages" style={{display:'flex',gap:12,flexWrap:'wrap'}}>{supportedLocales.map(code=><Link key={code} href={`/${code}/ai`} hrefLang={code} aria-current={code===lang?'page':undefined}>{code.toUpperCase()}</Link>)}</nav></header>
  <h1 style={{fontSize:34,marginTop:48}}>{copy.headline}</h1><p>{copy.subtitle}</p>
  <p><Link href="/">{copy.home}</Link></p>
  <h2>{copy.search} ({entries.length})</h2>
  {entries.length===0?<p role="status">{copy.empty}</p>:<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:16}}>{entries.filter(x=>x.status==='active').slice(0,100).map(x=><article key={x.id} style={{border:'1px solid #ddd',borderRadius:12,padding:16}}><h3>{x.name}</h3><p>{copy.company}: {x.company}</p><p>{x.description}</p><a href={x.website} target="_blank" rel="noopener noreferrer">{x.website}</a></article>)}</div>}
  <footer style={{marginTop:60}}>{copy.source} · LINGXIFIELD</footer>
 </main>
}
