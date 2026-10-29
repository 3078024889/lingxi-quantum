'use client';
import {useState} from 'react';
type RecordItem={id:string;name:string;publisher:string;kind:string;officialUrl:string;updatedAt:string|null};
type Feed={records:RecordItem[];retrievedAt?:string;source?:string;isRanking:false;error?:string};
export default function LiveHubDiscovery({query=''}:{query?:string}){
 const [kind,setKind]=useState<'models'|'spaces'>('models');
 const [feed,setFeed]=useState<Feed|null>(null);const [busy,setBusy]=useState(false);
 async function load(k:'models'|'spaces'){
  setKind(k);setBusy(true);setFeed(null);
  try{const r=await fetch('/api/ai-market/hub-live?kind='+k+(query.trim()?'&q='+encodeURIComponent(query.trim().slice(0,100)):''),{cache:'no-store'});const d=await r.json() as Feed;
   setFeed(r.ok?d:{records:[],isRanking:false,error:d.error||'SOURCE_UNAVAILABLE'});
  }catch{setFeed({records:[],isRanking:false,error:'NETWORK_ERROR'});}finally{setBusy(false);}
 }
 return <section aria-label="官方公开数据" style={{marginTop:30,padding:'22px 0'}}>
  <h2 style={{fontSize:22,marginBottom:5}}>官方公开模型与应用</h2>
  <p style={{fontSize:14,color:'#64748b'}}>输入问题后可查询 Hugging Face 官方仓库。结果是按仓库名称或描述匹配的公开资料，不代表产品能力、免费额度或真实使用量已经核验。</p>
  <div style={{display:'flex',gap:10,margin:'16px 0'}}>
   <button onClick={()=>void load('models')} disabled={busy} aria-pressed={kind==='models'}>查找模型</button>
   <button onClick={()=>void load('spaces')} disabled={busy} aria-pressed={kind==='spaces'}>查找应用</button>
  </div>
  {busy?<p role="status">正在读取官方数据…</p>:null}
  {feed?.error?<p role="status">官方数据暂不可用，请稍后重试。</p>:null}
  {feed&&!feed.error&&feed.records.length===0?<p>当前未返回公开记录。</p>:null}
  {feed?.records?.length?<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,260px),1fr))',gap:12}}>
   {feed.records.map(r=><article key={r.id} style={{padding:16,border:'1px solid #dce4ef',borderRadius:14}}>
    <p style={{fontSize:12,color:'#65748c',margin:'0 0 5px'}}>{r.publisher} · {r.kind}</p>
    <a href={r.officialUrl} target="_blank" rel="noopener noreferrer" style={{fontWeight:650}}>{r.name}</a>
    <p style={{fontSize:12,color:'#65748c'}}>{r.updatedAt?'更新时间：'+r.updatedAt.slice(0,10):'更新时间未提供'}</p>
   </article>)}
  </div>:null}
  <p style={{fontSize:12,color:'#64748b'}}>来源：<a href="https://huggingface.co/docs/hub/api" rel="noopener noreferrer" target="_blank">Hugging Face 官方 API</a></p>
 </section>;
}
