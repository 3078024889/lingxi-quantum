import type {Metadata} from 'next';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {MARKET_COMPANIES,marketRegistrySummary} from '../../../lib/market-publisher-registry';
import {marketLocales,mayIndexMarket} from '../../../lib/market-index-policy';
import {COMPANY_DIRECTORY_COPY} from '../../../lib/market-company-directory-copy';
import type {Language} from '../../../lib/v2';
type Params={params:Promise<{lang:string}>};
export async function generateMetadata({params}:Params):Promise<Metadata>{
 const {lang}=await params;if(!marketLocales.includes(lang as Language))return {robots:{index:false,follow:false}};
 return {title:COMPANY_DIRECTORY_COPY[lang as Language].title+' | LINGXIFIELD',
  robots:{index:mayIndexMarket(lang),follow:mayIndexMarket(lang)}};
}
export default async function Companies({params}:Params){
 const {lang}=await params;if(!marketLocales.includes(lang as Language))notFound();
 const language=lang as Language,t=COMPANY_DIRECTORY_COPY[language],stats=marketRegistrySummary();
 const blocks=[{title:t.companies,kind:'company'},{title:t.projects,kind:'open_source_project'},{title:t.libraries,kind:'software_library'}] as const;
 return <main dir={lang==='ar'?'rtl':'ltr'} lang={lang==='zh'?'zh-CN':lang} style={{maxWidth:1120,margin:'0 auto',padding:'28px 20px'}}>
   <nav><Link href={'/'+lang+'/ai'}>{t.back}</Link></nav>
   <h1 style={{fontWeight:800,fontSize:'clamp(23px,3vw,36px)',marginTop:22}}>{t.title}</h1>
   <p style={{lineHeight:1.8,margin:'12px 0 24px'}}>{t.intro}</p>
   <p style={{fontSize:14,marginBottom:28}}>{t.products}: {stats.curatedProducts} · {t.companies}: {stats.incorporatedCompanies}
    {' · '}{t.projects}: {stats.openProjects} · {t.libraries}: {stats.softwareLibraries}</p>
   {blocks.map(group=><section key={group.kind} style={{marginBottom:35}}>
    <h2 style={{fontSize:21,fontWeight:750,marginBottom:14}}>{group.title}</h2>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(265px,1fr))',gap:12}}>
     {MARKET_COMPANIES.filter(x=>x.kind===group.kind).map(c=><article key={c.id}
       style={{border:'1px solid #75757560',borderRadius:12,padding:16,overflowWrap:'anywhere'}}>
      <h3 style={{fontSize:18,fontWeight:700}}>{c.name}</h3>
      <p style={{fontSize:14,marginTop:8}}>{t.founded}: {c.founded||t.na}</p>
      <p style={{fontSize:14,marginTop:4}}>{t.location}: {c.headquarters||t.na}</p>
      <p style={{fontSize:14,marginTop:4}}>{c.listingState==='listed_parent'?t.listed:c.listingState==='unconfirmed'?t.unconfirmed:t.na}</p>
      <p style={{fontSize:14,marginTop:8}}>{t.products}: {c.productIds.length}</p>
      <ul style={{margin:'8px 0 10px',paddingInlineStart:20}}>
       {c.productIds.map(id=><li key={id}><Link href={'/'+lang+'/platform/'+id}>{id}</Link></li>)}
      </ul>
      <a href={c.officialSource} target="_blank" rel="noopener noreferrer" style={{fontSize:14}}>{t.source}</a>
     </article>)}
    </div>
   </section>)}
 </main>;
}
