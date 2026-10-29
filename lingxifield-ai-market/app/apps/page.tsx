'use client';
import {useEffect,useState} from 'react';
type App={id:string;name:string;provider:string;url:string;description:string|null;categories:string[];likes:number|null;verification:string};
type Result={total:number;items:App[];nextCursor:number|null;sourceCollectedAt?:string};
export default function AppsPage(){
 const[q,setQ]=useState(''),[term,setTerm]=useState(''),[cursor,setCursor]=useState(0);
 const[data,setData]=useState<Result|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 useEffect(()=>{const abort=new AbortController();setBusy(true);setError('');
 fetch('/api/v1/products/discover?'+new URLSearchParams({q:term,cursor:String(cursor),limit:'20'}),{signal:abort.signal})
 .then(async r=>{if(!r.ok)throw Error('应用目录尚未采集完成');return r.json()})
 .then(x=>{if(!abort.signal.aborted)setData(x)})
 .catch(e=>{if(!abort.signal.aborted){setError(e.message);setData(null)}})
 .finally(()=>{if(!abort.signal.aborted)setBusy(false)});
 return()=>abort.abort()},[term,cursor]);
 return <main style={{maxWidth:1000,margin:'24px auto',padding:18}}>
 <a href="/">返回 AI 平台首页</a><h1>AI 应用发现</h1>
 <p style={{color:'#64748b'}}>先找到能够尝试的工具，再核实价格与使用限制。此处展示 Hugging Face Spaces 公开项目，并非全球 AI 商业产品完整排名。</p>
 <form onSubmit={e=>{e.preventDefault();setTerm(q);setCursor(0)}} style={{display:'flex',gap:8,margin:'20px 0'}}>
 <input aria-label="搜索 AI 应用" value={q} onChange={e=>setQ(e.target.value)} placeholder="输入任务，例如视频、图片、语音、翻译" style={{flex:1,minWidth:0,padding:12,border:'1px solid #cbd5e1',borderRadius:8}}/>
 <button type="submit">搜索</button></form>
 <p role="status">{busy?'正在加载…':error?error:data?'公开项目 '+data.total.toLocaleString()+' 条':''}</p>
 <div style={{display:'grid',gap:12}}>
 {data?.items.map(app=><article key={app.id} style={{border:'1px solid #e2e8f0',borderRadius:12,padding:16}}>
 <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,flexWrap:'wrap'}}><div><strong>{app.name}</strong><small style={{display:'block',color:'#64748b'}}>创建者：{app.provider}</small></div><a href={app.url} target="_blank" rel="noopener noreferrer" style={{fontWeight:600}}>打开项目</a></div>
 {app.description&&<p style={{fontSize:13}}>{app.description}</p>}
 <p style={{fontSize:12,color:'#64748b'}}>Hugging Face 点赞 {app.likes?.toLocaleString()??'未知'} · 收费/使用限制：待核验</p>
 </article>)}
 </div>
 <div style={{display:'flex',gap:12,marginTop:20}}><button disabled={busy||cursor===0} onClick={()=>setCursor(Math.max(0,cursor-20))}>上一页</button><button disabled={busy||data?.nextCursor==null} onClick={()=>setCursor(data!.nextCursor!)}>下一页</button></div>
 <p style={{fontSize:12,color:'#64748b'}}>数据更新时间：{data?.sourceCollectedAt?.slice(0,10)||'未知'}。平台点赞不等于下载量、访问量或质量评分；可能存在演示、实验及失效应用。</p>
 </main>
}
