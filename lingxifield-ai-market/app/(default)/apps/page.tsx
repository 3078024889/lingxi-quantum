'use client';
import {useEffect,useState} from 'react';
type Product={id:string;name:string;company?:string|null;creator?:string|null;category?:string|null;url:string;description:string|null;capabilities:string[];price:number|null;freeQuota:string|null;requiresCard?:boolean|null;reviewStatus:string;evidence:{kind:string;url:string;observedAt:string|null};hfLikes?:number|null};
type Result={total:number;items:Product[];nextCursor:number|null;updatedAt?:string};
export default function AppsPage(){
 const[q,setQ]=useState(''),[term,setTerm]=useState(''),[cursor,setCursor]=useState(0);
 const[data,setData]=useState<Result|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 useEffect(()=>{const ctrl=new AbortController();setBusy(true);setError('');
 fetch('/api/v1/products/all?'+new URLSearchParams({q:term,cursor:String(cursor),limit:'20'}),{signal:ctrl.signal})
 .then(async r=>{if(!r.ok)throw Error('统一产品目录尚未生成');return r.json()})
 .then(v=>{if(!ctrl.signal.aborted)setData(v)})
 .catch(e=>{if(!ctrl.signal.aborted){setError(e.message);setData(null)}})
 .finally(()=>{if(!ctrl.signal.aborted)setBusy(false)});
 return()=>ctrl.abort()},[term,cursor]);
 return <main style={{maxWidth:1000,margin:'24px auto',padding:'0 18px 36px'}}>
 <a href="/">返回 AI 平台首页</a><h1>全球SI AI工具库</h1>
 <p style={{color:'#64748b'}}>输入需要解决的问题，查看工具功能和使用入口。价格、免费额度和使用限制以可核验证据为准。</p>
 <form onSubmit={e=>{e.preventDefault();setTerm(q);setCursor(0)}} style={{display:'flex',gap:8,margin:'20px 0'}}>
 <input aria-label="搜索 AI 工具" value={q} onChange={e=>setQ(e.target.value)} placeholder="例如：视频、图片、语音、字幕、自动化" style={{flex:1,minWidth:0,padding:12,border:'1px solid #cbd5e1',borderRadius:8}}/>
 <button type="submit" style={{background:'#155eef',color:'white',border:0,borderRadius:8,padding:'10px 20px'}}>搜索</button></form>
 <p role="status" style={{fontSize:13,color:'#64748b'}}>{busy?'正在读取产品…':error?error:data?'找到 '+data.total.toLocaleString()+' 个公开应用':''}</p>
 <div style={{display:'grid',gap:12}}>
 {data?.items.map(p=><article key={p.id} style={{border:'1px solid #e2e8f0',borderRadius:12,padding:16}}>
 <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center',flexWrap:'wrap'}}>
 <div><strong style={{fontSize:16}}>{p.name}</strong><small style={{display:'block',color:'#64748b'}}>来源：{p.evidence.kind==='huggingface_public_space'?'Hugging Face Spaces':'开源工具候选'} · {p.company||p.creator||'厂商待核验'}</small></div>
 <a href={p.url} target="_blank" rel="noopener noreferrer" style={{fontWeight:600}}>查看应用与使用方式</a></div>
 {p.description&&<p style={{fontSize:13}}>{p.description}</p>}
 {!!p.capabilities?.length&&<p style={{fontSize:12,color:'#475569'}}>功能：{p.capabilities.slice(0,5).join(' · ')}</p>}
 <p style={{fontSize:12,color:'#64748b'}}>{p.price!==null?'参考价格：'+p.price+' · ':''}{p.freeQuota?'免费额度：'+p.freeQuota+' · ':''}{p.requiresCard===true?'需要信用卡':p.requiresCard===false?'无需信用卡':'费用与使用方式请查看官方页面'}</p>
 </article>)}
 </div>
 <div style={{display:'flex',gap:12,marginTop:20}}><button disabled={busy||cursor===0} onClick={()=>setCursor(Math.max(0,cursor-20))}>上一页</button><button disabled={busy||data?.nextCursor==null} onClick={()=>setCursor(data!.nextCursor!)}>下一页</button></div>
 <p style={{fontSize:12,color:'#64748b'}}>资料更新：{data?.updatedAt?.slice(0,10)||'近期'}。部分应用来自 Hugging Face Spaces，具体费用、地区和使用条件请打开官方页面了解。</p>
 </main>;
}
