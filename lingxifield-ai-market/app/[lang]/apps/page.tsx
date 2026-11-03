'use client';
import {useEffect,useState} from 'react';
import {useParams} from 'next/navigation';
import {appsCopy,isMarketLanguage} from '../../../lib/market-secondary-i18n';
type Product={id:string;name:string;company?:string|null;creator?:string|null;category?:string|null;url:string;description:string|null;capabilities:string[];price:number|null;freeQuota:string|null;requiresCard?:boolean|null;reviewStatus:string;evidence:{kind:string;url:string;observedAt:string|null};hfLikes?:number|null};
type Result={total:number;items:Product[];nextCursor:number|null;updatedAt?:string};
export default function AppsPage(){
 const params=useParams<{lang:string}>(),language=isMarketLanguage(params.lang)?params.lang:'zh',t=appsCopy(language);
 const [q,setQ]=useState(''),[term,setTerm]=useState(''),[cursor,setCursor]=useState(0);
 const [data,setData]=useState<Result|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 useEffect(()=>{const ctrl=new AbortController();setBusy(true);setError('');
 fetch('/api/v1/products/all?'+new URLSearchParams({q:term,cursor:String(cursor),limit:'20'}),{signal:ctrl.signal})
 .then(async r=>{if(!r.ok)throw Error(t.error);return r.json()})
 .then(v=>{if(!ctrl.signal.aborted)setData(v)})
 .catch(e=>{if(!ctrl.signal.aborted){setError(e.message);setData(null)}})
 .finally(()=>{if(!ctrl.signal.aborted)setBusy(false)});
 return()=>ctrl.abort()},[term,cursor,language]);
 return <main lang={language} dir={language==='ar'?'rtl':'ltr'} style={{maxWidth:1000,margin:'24px auto',padding:'0 18px 36px'}}>
 <a href={'/'+language+'/ai'}>{t.back}</a><h1>{t.title}</h1>
 <p style={{color:'#64748b'}}>{t.intro}</p>
 <form onSubmit={e=>{e.preventDefault();setTerm(q);setCursor(0)}} style={{display:'flex',gap:8,margin:'20px 0'}}>
 <input aria-label={t.search} value={q} onChange={e=>setQ(e.target.value)} placeholder={t.placeholder} style={{flex:1,minWidth:0,padding:12,border:'1px solid #cbd5e1',borderRadius:8}}/>
 <button type="submit" style={{background:'#155eef',color:'white',border:0,borderRadius:8,padding:'10px 20px'}}>{t.search}</button></form>
 <p role="status" style={{fontSize:13,color:'#64748b'}}>{busy?t.loading:error?error:data?t.found+': '+data.total.toLocaleString(language):''}</p>
 <div style={{display:'grid',gap:12}}>
 {data?.items.map(p=><article key={p.id} style={{border:'1px solid #e2e8f0',borderRadius:12,padding:16}}>
 <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center',flexWrap:'wrap'}}>
 <div><strong style={{fontSize:16}}>{p.name}</strong><small style={{display:'block',color:'#64748b'}}>{t.source}: {p.evidence.kind==='huggingface_public_space'?t.publicSpace:t.community} · {p.company||p.creator||t.creator}</small></div>
 <a href={p.url} target="_blank" rel="noopener noreferrer" style={{fontWeight:600}}>{t.open}</a></div>
 {p.description&&<p style={{fontSize:13}}>{p.description}</p>}
 {!!p.capabilities?.length&&<p style={{fontSize:12,color:'#475569'}}>{t.features}: {p.capabilities.slice(0,5).join(' · ')}</p>}
 <p style={{fontSize:12,color:'#64748b'}}>{p.freeQuota?t.free+': '+p.freeQuota+' · ':''}{p.requiresCard===true?t.card:p.requiresCard===false?t.noCard:t.official}</p>
 </article>)}
 </div>
 <div style={{display:'flex',gap:12,marginTop:20}}><button disabled={busy||cursor===0} onClick={()=>setCursor(Math.max(0,cursor-20))}>{t.previous}</button><button disabled={busy||data?.nextCursor==null} onClick={()=>setCursor(data!.nextCursor!)}>{t.next}</button></div>
 <p style={{fontSize:12,color:'#64748b'}}>{t.updated}: {data?.updatedAt?.slice(0,10)||t.recent}. {t.note}</p>
 </main>;
}