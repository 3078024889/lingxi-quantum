'use client';
import {useState,useCallback} from 'react';
import Link from 'next/link';
import LiveHubDiscovery from './LiveHubDiscovery';
import {MARKET_UI_COPY} from '@/lib/ai-market/market-ui-copy.mjs';
type Result={id:string;name:string;officialUrl:string;matchedTasks:string[];evidenceUrls:string[];price:null;freeQuota:null;regionAccess:null};
type Response={results?:Result[];reason?:string;limitations?:string;partialCatalog?:boolean;error?:string};
type Labels={search:string;placeholder:string;free:string;price:string;limits:string;use:string;unknown:string;source:string;region:string;results:string;empty:string};
export default function AiMarketSearch({labels,locale='zh'}:{labels?:Labels;locale?:string}={}){
 const localeKey: keyof typeof MARKET_UI_COPY = Object.prototype.hasOwnProperty.call(MARKET_UI_COPY,locale) ? locale as keyof typeof MARKET_UI_COPY : 'zh';
 const t=MARKET_UI_COPY[localeKey];
 const [query,setQuery]=useState('');const [busy,setBusy]=useState(false);
 const [answer,setAnswer]=useState<Response|null>(null);
 const search=useCallback(async()=>{
  const q=query.trim();if(q.length<2||q.length>200)return;
  setBusy(true);setAnswer(null);
  try{const response=await fetch('/api/ai-market/verified-search?q='+encodeURIComponent(q),{cache:'no-store'});const data=await response.json() as Response;
  setAnswer(response.ok?data:{error:data.error||'SEARCH_UNAVAILABLE',results:[]});
  }catch{setAnswer({error:'NETWORK_ERROR',results:[]});}finally{setBusy(false);}
 },[query]);
 return <main style={{maxWidth:1100,margin:'0 auto',padding:'44px 18px 90px',color:'#10213d',fontFamily:'system-ui'}}>
  <p style={{fontSize:12,letterSpacing:2,color:'#476fbd'}}>LINGXIFIELD · GLOBAL AI MARKET</p>
  <h1 style={{fontSize:'clamp(28px,5vw,48px)',lineHeight:1.15,margin:'12px 0'}}>{t.headline}</h1>
  <p style={{color:'#536581',lineHeight:1.7}}>{t.intro}</p>
  <form onSubmit={e=>{e.preventDefault();void search();}} style={{display:'flex',gap:10,flexWrap:'wrap',margin:'28px 0'}}>
   <input aria-label="描述你要解决的问题" placeholder={labels?.placeholder||"例如：如何给视频自动添加字幕？"} value={query} onChange={e=>setQuery(e.target.value)} maxLength={200} style={{flex:'1 1 260px',fontSize:17,padding:'15px 16px',border:'1px solid #b8c7df',borderRadius:12,minWidth:0}}/>
   <button type="submit" disabled={busy||query.trim().length<2} style={{padding:'14px 28px',background:'#155eef',color:'white',fontWeight:700,border:0,borderRadius:12,cursor:'pointer',opacity:busy?.6:1}}>{busy?t.searching:(labels?.search||'立即寻找')}</button>
  </form>
  {answer?.error?<div role="status" style={{padding:20,background:'#f1f5fb',borderRadius:12}}>{t.unavailable}</div>:null}
  {answer&&!answer.error&&(!answer.results||answer.results.length===0)?<div role="status" style={{padding:20,background:'#f1f5fb',borderRadius:12}}>{t.none}</div>:null}
  {answer?.results?.length?<section aria-label="匹配工具" style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,300px),1fr))',gap:14}}>
    {answer.results.map(item=><article key={item.id} style={{padding:22,border:'1px solid #d9e3f2',background:'white',borderRadius:18,boxShadow:'0 8px 26px #152f5a0a'}}>
      <h2 style={{fontSize:21,margin:'0 0 12px'}}><Link href={'/ai-market/products/'+encodeURIComponent(item.id)}>{item.name}</Link></h2>
      <p style={{fontSize:13,color:'#536581'}}>{t.suitable}: {item.matchedTasks.join(' · ')}</p>
      <p style={{fontSize:14}}>{labels?.free||'免费额度'}：{labels?.unknown||'待核实'}　·　{labels?.price||'价格'}：{labels?.unknown||'待核实'}</p><p style={{fontSize:14}}>{labels?.region||'地区可用性'}：{labels?.unknown||'待核实'}</p>
      <a href={item.officialUrl} rel="noopener noreferrer" target="_blank" style={{display:'inline-block',padding:'10px 14px',background:'#155eef',color:'#fff',borderRadius:9,textDecoration:'none'}}>{labels?.use||'打开官方网站'}</a>
      <p style={{fontSize:12,marginTop:14}}>{item.evidenceUrls.slice(0,2).map((url,i)=><span key={url}><a href={url} rel="noopener noreferrer" target="_blank">{t.evidence} {i+1}</a>{'　'}</span>)}</p>
    </article>)}
   </section>:null}
  <LiveHubDiscovery query={query} locale={locale}/>
  {answer?.partialCatalog?<p style={{fontSize:12,color:'#64748b',marginTop:20}}>{t.partial}</p>:null}
 </main>;
}
