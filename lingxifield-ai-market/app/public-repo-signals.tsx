'use client';
import{useEffect,useState}from'react';
type RecordItem={id:string;name?:string;description?:string|null;stars?:number|null;sourceUrl:string;status:string;updatedAt?:string};
export default function PublicRepoSignals(){
 const[items,setItems]=useState<RecordItem[]>([]);const[error,setError]=useState(false);
 useEffect(()=>{const controller=new AbortController();fetch('/api/market/public-repos',{signal:controller.signal}).then(r=>{if(!r.ok)throw Error('UPSTREAM');return r.json()}).then(d=>{if(!controller.signal.aborted)setItems(d.records||[])}).catch(()=>{if(!controller.signal.aborted)setError(true)});return()=>controller.abort()},[]);
 return <section className="panel" style={{margin:'16px 0',padding:18}} aria-label="官方开源项目动态">
  <h2 style={{fontSize:19,fontWeight:700,marginBottom:6}}>真实开源项目动态 · GitHub 官方来源</h2>
  <p style={{fontSize:12,color:'#64748b',marginBottom:12}}>以下是官方仓库的公开数据，并非全球 AI 平台排名。Star 不代表注册量、使用量或收入。</p>
  {error?<p>官方数据暂时不可用，未生成模拟数字。</p>:items.length===0?<p>正在检查公开来源…</p>:<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))',gap:12}}>
   {items.map(x=><article key={x.id} style={{border:'1px solid #e2e8f0',borderRadius:10,padding:12}}>
     <strong style={{display:'block'}}>{x.name||x.id}</strong>
     <small style={{color:'#64748b'}}>{x.id}</small>
     <p style={{fontSize:12,margin:'8px 0'}}>{x.description||'公开项目资料'}</p>
     <div style={{fontSize:12}}>{x.status==='public_repository_unverified_product'&&typeof x.stars==='number'?('GitHub Stars: '+x.stars.toLocaleString()):'来源暂不可用'}</div>
     <a href={x.sourceUrl} target="_blank" rel="noopener noreferrer" style={{fontSize:12}}>官方仓库与来源</a>
   </article>)}
  </div>}
 </section>
}
