'use client';
import {useEffect,useState} from 'react';
import {useParams} from 'next/navigation';
import {modelsCopy,isMarketLanguage} from '../../../lib/market-secondary-i18n';
type Offer={id:string;providerId:string;providerName:string;inputUsdPerMillion:number|null;outputUsdPerMillion:number|null;contextLimit:number|null;sourceUrl:string};
type Group={modelId:string;name:string;providerCount:number;lowestObservedInputUsdPerMillion:number|null;offers:Offer[]};
type Data={total:number;items:Group[];nextCursor:number|null;sourceCollectedAt?:string;status?:string};
const money=(value:number|null)=>value===null?'—':'$'+value.toLocaleString('en-US',{maximumFractionDigits:5});
export default function ModelsPage(){
 const params=useParams<{lang:string}>(),language=isMarketLanguage(params.lang)?params.lang:'zh',t=modelsCopy(language);
 const [q,setQ]=useState(''),[term,setTerm]=useState(''),[cursor,setCursor]=useState(0);
 const [order,setOrder]=useState<'providers'|'price'>('providers');
 const [data,setData]=useState<Data|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState(''),[expanded,setExpanded]=useState<string[]>([]);
 useEffect(()=>{const ctrl=new AbortController();setBusy(true);setError('');
 fetch('/api/v1/models/groups?'+new URLSearchParams({q:term,cursor:String(cursor),limit:'20',sort:order}),{signal:ctrl.signal})
 .then(async r=>{if(!r.ok)throw Error(t.error);return r.json()})
 .then(x=>{if(!ctrl.signal.aborted)setData(x)})
 .catch(e=>{if(!ctrl.signal.aborted){setError(e.message);setData(null)}})
 .finally(()=>{if(!ctrl.signal.aborted)setBusy(false)});
 return()=>ctrl.abort()},[term,cursor,order,language]);
 return <main lang={language} dir={language==='ar'?'rtl':'ltr'} style={{maxWidth:1100,margin:'22px auto',padding:'0 18px 36px'}}>
 <a href={'/'+language+'/ai'} style={{fontSize:13}}>{t.back}</a><h1 style={{margin:'14px 0 6px'}}>{t.title}</h1>
 <p style={{color:'#64748b',fontSize:13}}>{t.intro}</p>
 <form onSubmit={e=>{e.preventDefault();setCursor(0);setExpanded([]);setTerm(q)}} style={{display:'flex',gap:8,margin:'20px 0'}}>
 <input aria-label={t.search} value={q} onChange={e=>setQ(e.target.value)} placeholder={t.placeholder} style={{flex:1,minWidth:0,padding:12,border:'1px solid #cbd5e1',borderRadius:8}}/>
 <button type="submit" style={{padding:'10px 22px',background:'#155eef',border:0,color:'#fff',borderRadius:8}}>{t.search}</button></form>
 <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}><label htmlFor="model-order" style={{fontSize:13}}>{t.sort}</label><select id="model-order" value={order} onChange={e=>{setOrder(e.target.value as 'providers'|'price');setCursor(0);setExpanded([])}} style={{padding:8,border:'1px solid #cbd5e1',borderRadius:8}}><option value="providers">{t.providers}</option><option value="price">{t.cheapest}</option></select></div>
 <p role="status" style={{fontSize:13,color:'#64748b'}}>{busy?t.loading:error?error:data?t.found+': '+data.total.toLocaleString(language):''}</p>
 <div style={{display:'grid',gap:10}}>
 {data?.items.map(g=>{const isOpen=expanded.includes(g.modelId);
 return <article key={g.modelId} style={{border:'1px solid #dbe5f4',borderRadius:12,padding:'14px 16px',background:'#fff'}}>
 <div style={{display:'flex',justifyContent:'space-between',gap:14,flexWrap:'wrap',alignItems:'center'}}>
 <div><strong style={{fontSize:16}}>{g.name}</strong><small style={{display:'block',color:'#64748b'}}>{g.modelId}</small></div>
 <div style={{fontSize:13,color:'#334155'}}>{g.providerCount} {t.providersQuote} <strong style={{marginInlineStart:12}}>{t.inputPrice} {money(g.lowestObservedInputUsdPerMillion)}</strong><small style={{display:'block',textAlign:'end'}}>{t.perMillion}</small></div>
 <button aria-expanded={isOpen} onClick={()=>setExpanded(v=>isOpen?v.filter(x=>x!==g.modelId):[...v,g.modelId])} style={{border:'1px solid #cbd5e1',background:'#f8fafc',padding:'8px 12px',borderRadius:8,cursor:'pointer'}}>{isOpen?t.collapse:t.compare}</button>
 </div>
 {isOpen&&<div style={{overflowX:'auto',marginTop:12}}><table style={{width:'100%',borderCollapse:'collapse',fontSize:13,textAlign:language==='ar'?'right':'left'}}><thead><tr>{[t.provider,t.input,t.output,t.context,t.source].map(v=><th key={v} style={{padding:9,borderBottom:'1px solid #e2e8f0'}}>{v}</th>)}</tr></thead><tbody>
 {[...g.offers].sort((a,b)=>(a.inputUsdPerMillion??Infinity)-(b.inputUsdPerMillion??Infinity)).map(o=><tr key={o.id}><td style={{padding:9}}>{o.providerName}</td><td>{money(o.inputUsdPerMillion)}</td><td>{money(o.outputUsdPerMillion)}</td><td>{o.contextLimit?.toLocaleString(language)??t.unknown}</td><td><a href={o.sourceUrl} target="_blank" rel="noopener noreferrer">{t.sourceLink}</a></td></tr>)}
 </tbody></table></div>}</article>})}
 </div>
 <div style={{display:'flex',gap:10,alignItems:'center',margin:'20px 0'}}>
 <button disabled={busy||cursor===0} onClick={()=>{setCursor(Math.max(0,cursor-20));setExpanded([])}}>{t.previous}</button>
 <span style={{fontSize:12}}>{t.page} {Math.floor(cursor/20)+1}</span>
 <button disabled={busy||data?.nextCursor==null} onClick={()=>{setCursor(data!.nextCursor!);setExpanded([])}}>{t.next}</button>
 </div>
 <p style={{fontSize:12,color:'#64748b'}}>{t.updated}: {data?.sourceCollectedAt?.slice(0,10)||t.unknown}. {t.note}</p>
 <a href="https://models.dev/" target="_blank" rel="noopener noreferrer">{t.checkSource}</a>
 </main>;
}