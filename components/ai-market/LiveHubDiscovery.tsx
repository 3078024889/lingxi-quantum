'use client';
import {useState} from 'react';
import {MARKET_UI_COPY} from '@/lib/ai-market/market-ui-copy.mjs';
type RecordItem={id:string;name:string;publisher:string;kind:string;officialUrl:string;updatedAt:string|null};
type Feed={records:RecordItem[];retrievedAt?:string;source?:string;isRanking:false;error?:string};
export default function LiveHubDiscovery({query='',locale='zh'}:{query?:string;locale?:string}){
 const localeKey: keyof typeof MARKET_UI_COPY = Object.prototype.hasOwnProperty.call(MARKET_UI_COPY,locale) ? locale as keyof typeof MARKET_UI_COPY : 'zh';
 const t=MARKET_UI_COPY[localeKey];
 const [kind,setKind]=useState<'models'|'spaces'>('models');
 const [feed,setFeed]=useState<Feed|null>(null);const [busy,setBusy]=useState(false);
 async function load(k:'models'|'spaces'){
  setKind(k);setBusy(true);setFeed(null);
  try{const r=await fetch('/api/ai-market/hub-live?kind='+k+(query.trim()?'&q='+encodeURIComponent(query.trim().slice(0,100)):''),{cache:'no-store'});const d=await r.json() as Feed;
   setFeed(r.ok?d:{records:[],isRanking:false,error:d.error||'SOURCE_UNAVAILABLE'});
  }catch{setFeed({records:[],isRanking:false,error:'NETWORK_ERROR'});}finally{setBusy(false);}
 }
 return <section aria-label={t.hubTitle} style={{marginTop:30,padding:'22px 0'}}>
  <h2 style={{fontSize:22,marginBottom:5}}>{t.hubTitle}</h2>
  <p style={{fontSize:14,color:'#64748b'}}>{t.hubIntro}</p>
  <div style={{display:'flex',gap:10,margin:'16px 0'}}>
   <button onClick={()=>void load('models')} disabled={busy} aria-pressed={kind==='models'}>{t.findModels}</button>
   <button onClick={()=>void load('spaces')} disabled={busy} aria-pressed={kind==='spaces'}>{t.findApps}</button>
  </div>
  {busy?<p role="status">{t.hubLoading}</p>:null}
  {feed?.error?<p role="status">{t.hubUnavailable}</p>:null}
  {feed&&!feed.error&&feed.records.length===0?<p>{t.hubEmpty}</p>:null}
  {feed?.records?.length?<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,260px),1fr))',gap:12}}>
   {feed.records.map(r=><article key={r.id} style={{padding:16,border:'1px solid #dce4ef',borderRadius:14}}>
    <p style={{fontSize:12,color:'#65748c',margin:'0 0 5px'}}>{r.publisher} · {r.kind==='模型仓库'?t.modelRepo:t.appRepo}</p>
    <a href={r.officialUrl} target="_blank" rel="noopener noreferrer" style={{fontWeight:650}}>{r.name}</a>
    <p style={{fontSize:12,color:'#65748c'}}>{r.updatedAt?t.updated+': '+r.updatedAt.slice(0,10):t.dateUnknown}</p>
   </article>)}
  </div>:null}
  <p style={{fontSize:12,color:'#64748b'}}>{t.officialApi}: <a href="https://huggingface.co/docs/hub/api" rel="noopener noreferrer" target="_blank">Hugging Face 官方 API</a></p>
 </section>;
}
