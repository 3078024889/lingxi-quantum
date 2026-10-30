'use client';
import {useEffect,useState} from 'react';
type Offer={id:string;providerId:string;providerName:string;inputUsdPerMillion:number|null;outputUsdPerMillion:number|null;contextLimit:number|null;sourceUrl:string};
type Group={modelId:string;name:string;providerCount:number;lowestObservedInputUsdPerMillion:number|null;offers:Offer[]};
type Data={total:number;items:Group[];nextCursor:number|null;sourceCollectedAt?:string;status?:string};
const money=(value:number|null)=>value===null?'—':'$'+value.toLocaleString('en-US',{maximumFractionDigits:5});
export default function ModelsPage(){
 const [q,setQ]=useState(''),[term,setTerm]=useState(''),[cursor,setCursor]=useState(0);
 const [order,setOrder]=useState<'providers'|'price'>('providers');
 const [data,setData]=useState<Data|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState(''),[expanded,setExpanded]=useState<string[]>([]);
 useEffect(()=>{const ctrl=new AbortController();setBusy(true);setError('');
 fetch('/api/v1/models/groups?'+new URLSearchParams({q:term,cursor:String(cursor),limit:'20',sort:order}),{signal:ctrl.signal})
 .then(async r=>{if(!r.ok)throw Error('模型分组数据尚未就绪');return r.json()})
 .then(x=>{if(!ctrl.signal.aborted)setData(x)})
 .catch(e=>{if(!ctrl.signal.aborted){setError(e.message);setData(null)}})
 .finally(()=>{if(!ctrl.signal.aborted)setBusy(false)});
 return()=>ctrl.abort()},[term,cursor,order]);
 return <main style={{maxWidth:1100,margin:'22px auto',padding:'0 18px 36px'}}>
 <a href="/" style={{fontSize:13}}>返回 AI 平台首页</a>
 <h1 style={{margin:'14px 0 6px'}}>全球SI AI模型行情与价格对比</h1>
 <p style={{color:'#64748b',fontSize:13}}>一个模型集中展示，展开后比较不同服务商的报价。数据来自 models.dev 第三方聚合，尚未经各厂商独立核验。</p>
 <form onSubmit={e=>{e.preventDefault();setCursor(0);setExpanded([]);setTerm(q)}} style={{display:'flex',gap:8,margin:'20px 0'}}>
 <input aria-label="搜索模型" value={q} onChange={e=>setQ(e.target.value)} placeholder="搜索 GPT、Claude、Gemini、Qwen…" style={{flex:1,minWidth:0,padding:12,border:'1px solid #cbd5e1',borderRadius:8}}/>
 <button type="submit" style={{padding:'10px 22px',background:'#155eef',border:0,color:'#fff',borderRadius:8}}>搜索</button></form>
 <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}><label htmlFor="model-order" style={{fontSize:13}}>排序</label><select id="model-order" value={order} onChange={e=>{setOrder(e.target.value as 'providers'|'price');setCursor(0);setExpanded([])}} style={{padding:8,border:'1px solid #cbd5e1',borderRadius:8}}><option value="providers">报价服务商数量</option><option value="price">最低参考输入价</option></select></div>
 <p role="status" style={{fontSize:13,color:'#64748b'}}>{busy?'正在读取模型…':error?error:data?'符合条件：'+data.total.toLocaleString()+' 个模型标识':''}</p>
 <div style={{display:'grid',gap:10}}>
 {data?.items.map(g=>{const isOpen=expanded.includes(g.modelId);
 return <article key={g.modelId} style={{border:'1px solid #dbe5f4',borderRadius:12,padding:'14px 16px',background:'#fff'}}>
 <div style={{display:'flex',justifyContent:'space-between',gap:14,flexWrap:'wrap',alignItems:'center'}}>
 <div><strong style={{fontSize:16}}>{g.name}</strong><small style={{display:'block',color:'#64748b'}}>{g.modelId}</small></div>
 <div style={{fontSize:13,color:'#334155'}}>{g.providerCount} 个服务商报价 <strong style={{marginLeft:12}}>参考输入价 {money(g.lowestObservedInputUsdPerMillion)}</strong><small style={{display:'block',textAlign:'right'}}>USD / 百万 tokens</small></div>
 <button aria-expanded={isOpen} onClick={()=>setExpanded(v=>isOpen?v.filter(x=>x!==g.modelId):[...v,g.modelId])} style={{border:'1px solid #cbd5e1',background:'#f8fafc',padding:'8px 12px',borderRadius:8,cursor:'pointer'}}>{isOpen?'收起报价':'比较服务商'}</button>
 </div>
 {isOpen&&<div style={{overflowX:'auto',marginTop:12}}><table style={{width:'100%',borderCollapse:'collapse',fontSize:13,textAlign:'left'}}><thead><tr>{['服务商','输入价','输出价','上下文','来源'].map(t=><th key={t} style={{padding:9,borderBottom:'1px solid #e2e8f0'}}>{t}</th>)}</tr></thead><tbody>
 {[...g.offers].sort((a,b)=>(a.inputUsdPerMillion??Infinity)-(b.inputUsdPerMillion??Infinity)).map(o=><tr key={o.id}><td style={{padding:9}}>{o.providerName}</td><td>{money(o.inputUsdPerMillion)}</td><td>{money(o.outputUsdPerMillion)}</td><td>{o.contextLimit?.toLocaleString()??'未知'}</td><td><a href={o.sourceUrl} target="_blank" rel="noopener noreferrer">查看聚合来源</a></td></tr>)}
 </tbody></table></div>}</article>})}
 </div>
 <div style={{display:'flex',gap:10,alignItems:'center',margin:'20px 0'}}>
 <button disabled={busy||cursor===0} onClick={()=>{setCursor(Math.max(0,cursor-20));setExpanded([])}}>上一页</button>
 <span style={{fontSize:12}}>第 {Math.floor(cursor/20)+1} 页</span>
 <button disabled={busy||data?.nextCursor==null} onClick={()=>{setCursor(data!.nextCursor!);setExpanded([])}}>下一页</button>
 </div>
 <p style={{fontSize:12,color:'#64748b'}}>采集时间：{data?.sourceCollectedAt?.slice(0,10)||'未知'}。最低价仅根据已取得的输入价格计算，不包含输出价格或其他费用；模型名称一致不代表服务质量或速度相同。</p>
 <a href="https://models.dev/" target="_blank" rel="noopener noreferrer">核对 models.dev 来源</a>
 </main>;
}
+value.toLocaleString('en-US',{maximumFractionDigits:5});
export default function ModelsPage(){
 const [q,setQ]=useState(''),[term,setTerm]=useState(''),[cursor,setCursor]=useState(0);
 const [order,setOrder]=useState<'providers'|'price'>('providers');
 const [data,setData]=useState<Data|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState(''),[expanded,setExpanded]=useState<string[]>([]);
 useEffect(()=>{const ctrl=new AbortController();setBusy(true);setError('');
 fetch('/api/v1/models/groups?'+new URLSearchParams({q:term,cursor:String(cursor),limit:'20',sort:order}),{signal:ctrl.signal})
 .then(async r=>{if(!r.ok)throw Error('模型分组数据尚未就绪');return r.json()})
 .then(x=>{if(!ctrl.signal.aborted)setData(x)})
 .catch(e=>{if(!ctrl.signal.aborted){setError(e.message);setData(null)}})
 .finally(()=>{if(!ctrl.signal.aborted)setBusy(false)});
 return()=>ctrl.abort()},[term,cursor,order]);
 return <main style={{maxWidth:1100,margin:'22px auto',padding:'0 18px 36px'}}>
 <a href="/" style={{fontSize:13}}>返回 AI 平台首页</a>
 <h1 style={{margin:'14px 0 6px'}}>全球 AI 模型与价格比较</h1>
 <p style={{color:'#64748b',fontSize:13}}>一个模型集中展示，展开后比较不同服务商的报价。数据来自 models.dev 第三方聚合，尚未经各厂商独立核验。</p>
 <form onSubmit={e=>{e.preventDefault();setCursor(0);setExpanded([]);setTerm(q)}} style={{display:'flex',gap:8,margin:'20px 0'}}>
 <input aria-label="搜索模型" value={q} onChange={e=>setQ(e.target.value)} placeholder="搜索 GPT、Claude、Gemini、Qwen…" style={{flex:1,minWidth:0,padding:12,border:'1px solid #cbd5e1',borderRadius:8}}/>
 <button type="submit" style={{padding:'10px 22px',background:'#155eef',border:0,color:'#fff',borderRadius:8}}>搜索</button></form>
 <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}><label htmlFor="model-order" style={{fontSize:13}}>排序</label><select id="model-order" value={order} onChange={e=>{setOrder(e.target.value as 'providers'|'price');setCursor(0);setExpanded([])}} style={{padding:8,border:'1px solid #cbd5e1',borderRadius:8}}><option value="providers">报价服务商数量</option><option value="price">最低参考输入价</option></select></div>
 <p role="status" style={{fontSize:13,color:'#64748b'}}>{busy?'正在读取模型…':error?error:data?'符合条件：'+data.total.toLocaleString()+' 个模型标识':''}</p>
 <div style={{display:'grid',gap:10}}>
 {data?.items.map(g=>{const isOpen=expanded.includes(g.modelId);
 return <article key={g.modelId} style={{border:'1px solid #dbe5f4',borderRadius:12,padding:'14px 16px',background:'#fff'}}>
 <div style={{display:'flex',justifyContent:'space-between',gap:14,flexWrap:'wrap',alignItems:'center'}}>
 <div><strong style={{fontSize:16}}>{g.name}</strong><small style={{display:'block',color:'#64748b'}}>{g.modelId}</small></div>
 <div style={{fontSize:13,color:'#334155'}}>{g.providerCount} 个服务商报价 <strong style={{marginLeft:12}}>参考输入价 {money(g.lowestObservedInputUsdPerMillion)}</strong><small style={{display:'block',textAlign:'right'}}>USD / 百万 tokens</small></div>
 <button aria-expanded={isOpen} onClick={()=>setExpanded(v=>isOpen?v.filter(x=>x!==g.modelId):[...v,g.modelId])} style={{border:'1px solid #cbd5e1',background:'#f8fafc',padding:'8px 12px',borderRadius:8,cursor:'pointer'}}>{isOpen?'收起报价':'比较服务商'}</button>
 </div>
 {isOpen&&<div style={{overflowX:'auto',marginTop:12}}><table style={{width:'100%',borderCollapse:'collapse',fontSize:13,textAlign:'left'}}><thead><tr>{['服务商','输入价','输出价','上下文','来源'].map(t=><th key={t} style={{padding:9,borderBottom:'1px solid #e2e8f0'}}>{t}</th>)}</tr></thead><tbody>
 {[...g.offers].sort((a,b)=>(a.inputUsdPerMillion??Infinity)-(b.inputUsdPerMillion??Infinity)).map(o=><tr key={o.id}><td style={{padding:9}}>{o.providerName}</td><td>{money(o.inputUsdPerMillion)}</td><td>{money(o.outputUsdPerMillion)}</td><td>{o.contextLimit?.toLocaleString()??'未知'}</td><td><a href={o.sourceUrl} target="_blank" rel="noopener noreferrer">查看聚合来源</a></td></tr>)}
 </tbody></table></div>}</article>})}
 </div>
 <div style={{display:'flex',gap:10,alignItems:'center',margin:'20px 0'}}>
 <button disabled={busy||cursor===0} onClick={()=>{setCursor(Math.max(0,cursor-20));setExpanded([])}}>上一页</button>
 <span style={{fontSize:12}}>第 {Math.floor(cursor/20)+1} 页</span>
 <button disabled={busy||data?.nextCursor==null} onClick={()=>{setCursor(data!.nextCursor!);setExpanded([])}}>下一页</button>
 </div>
 <p style={{fontSize:12,color:'#64748b'}}>采集时间：{data?.sourceCollectedAt?.slice(0,10)||'未知'}。最低价仅根据已取得的输入价格计算，不包含输出价格或其他费用；模型标识一致不保证服务质量一致。</p>
 <a href="https://models.dev/" target="_blank" rel="noopener noreferrer">核对 models.dev 来源</a>
 </main>;
}
+value.toLocaleString('en-US',{maximumFractionDigits:5});
export default function ModelsPage(){
 const [q,setQ]=useState(''),[term,setTerm]=useState(''),[cursor,setCursor]=useState(0);
 const [order,setOrder]=useState<'providers'|'price'>('providers');
 const [data,setData]=useState<Data|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState(''),[expanded,setExpanded]=useState<string[]>([]);
 useEffect(()=>{const ctrl=new AbortController();setBusy(true);setError('');
 fetch('/api/v1/models/groups?'+new URLSearchParams({q:term,cursor:String(cursor),limit:'20',sort:order}),{signal:ctrl.signal})
 .then(async r=>{if(!r.ok)throw Error('模型分组数据尚未就绪');return r.json()})
 .then(x=>{if(!ctrl.signal.aborted)setData(x)})
 .catch(e=>{if(!ctrl.signal.aborted){setError(e.message);setData(null)}})
 .finally(()=>{if(!ctrl.signal.aborted)setBusy(false)});
 return()=>ctrl.abort()},[term,cursor,order]);
 return <main style={{maxWidth:1100,margin:'22px auto',padding:'0 18px 36px'}}>
 <a href="/" style={{fontSize:13}}>返回 AI 平台首页</a>
 <h1 style={{margin:'14px 0 6px'}}>全球SI AI模型行情与价格对比</h1>
 <p style={{color:'#64748b',fontSize:13}}>一个模型集中展示，展开后比较不同服务商的报价。数据来自 models.dev 第三方聚合，尚未经各厂商独立核验。</p>
 <form onSubmit={e=>{e.preventDefault();setCursor(0);setExpanded([]);setTerm(q)}} style={{display:'flex',gap:8,margin:'20px 0'}}>
 <input aria-label="搜索模型" value={q} onChange={e=>setQ(e.target.value)} placeholder="搜索 GPT、Claude、Gemini、Qwen…" style={{flex:1,minWidth:0,padding:12,border:'1px solid #cbd5e1',borderRadius:8}}/>
 <button type="submit" style={{padding:'10px 22px',background:'#155eef',border:0,color:'#fff',borderRadius:8}}>搜索</button></form>
 <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}><label htmlFor="model-order" style={{fontSize:13}}>排序</label><select id="model-order" value={order} onChange={e=>{setOrder(e.target.value as 'providers'|'price');setCursor(0);setExpanded([])}} style={{padding:8,border:'1px solid #cbd5e1',borderRadius:8}}><option value="providers">报价服务商数量</option><option value="price">最低参考输入价</option></select></div>
 <p role="status" style={{fontSize:13,color:'#64748b'}}>{busy?'正在读取模型…':error?error:data?'符合条件：'+data.total.toLocaleString()+' 个模型标识':''}</p>
 <div style={{display:'grid',gap:10}}>
 {data?.items.map(g=>{const isOpen=expanded.includes(g.modelId);
 return <article key={g.modelId} style={{border:'1px solid #dbe5f4',borderRadius:12,padding:'14px 16px',background:'#fff'}}>
 <div style={{display:'flex',justifyContent:'space-between',gap:14,flexWrap:'wrap',alignItems:'center'}}>
 <div><strong style={{fontSize:16}}>{g.name}</strong><small style={{display:'block',color:'#64748b'}}>{g.modelId}</small></div>
 <div style={{fontSize:13,color:'#334155'}}>{g.providerCount} 个服务商报价 <strong style={{marginLeft:12}}>参考输入价 {money(g.lowestObservedInputUsdPerMillion)}</strong><small style={{display:'block',textAlign:'right'}}>USD / 百万 tokens</small></div>
 <button aria-expanded={isOpen} onClick={()=>setExpanded(v=>isOpen?v.filter(x=>x!==g.modelId):[...v,g.modelId])} style={{border:'1px solid #cbd5e1',background:'#f8fafc',padding:'8px 12px',borderRadius:8,cursor:'pointer'}}>{isOpen?'收起报价':'比较服务商'}</button>
 </div>
 {isOpen&&<div style={{overflowX:'auto',marginTop:12}}><table style={{width:'100%',borderCollapse:'collapse',fontSize:13,textAlign:'left'}}><thead><tr>{['服务商','输入价','输出价','上下文','来源'].map(t=><th key={t} style={{padding:9,borderBottom:'1px solid #e2e8f0'}}>{t}</th>)}</tr></thead><tbody>
 {[...g.offers].sort((a,b)=>(a.inputUsdPerMillion??Infinity)-(b.inputUsdPerMillion??Infinity)).map(o=><tr key={o.id}><td style={{padding:9}}>{o.providerName}</td><td>{money(o.inputUsdPerMillion)}</td><td>{money(o.outputUsdPerMillion)}</td><td>{o.contextLimit?.toLocaleString()??'未知'}</td><td><a href={o.sourceUrl} target="_blank" rel="noopener noreferrer">查看聚合来源</a></td></tr>)}
 </tbody></table></div>}</article>})}
 </div>
 <div style={{display:'flex',gap:10,alignItems:'center',margin:'20px 0'}}>
 <button disabled={busy||cursor===0} onClick={()=>{setCursor(Math.max(0,cursor-20));setExpanded([])}}>上一页</button>
 <span style={{fontSize:12}}>第 {Math.floor(cursor/20)+1} 页</span>
 <button disabled={busy||data?.nextCursor==null} onClick={()=>{setCursor(data!.nextCursor!);setExpanded([])}}>下一页</button>
 </div>
 <p style={{fontSize:12,color:'#64748b'}}>采集时间：{data?.sourceCollectedAt?.slice(0,10)||'未知'}。最低价仅根据已取得的输入价格计算，不包含输出价格或其他费用；模型名称一致不代表服务质量或速度相同。</p>
 <a href="https://models.dev/" target="_blank" rel="noopener noreferrer">核对 models.dev 来源</a>
 </main>;
}
+value.toLocaleString('en-US',{maximumFractionDigits:5});
export default function ModelsPage(){
 const [q,setQ]=useState(''),[term,setTerm]=useState(''),[cursor,setCursor]=useState(0);
 const [order,setOrder]=useState<'providers'|'price'>('providers');
 const [data,setData]=useState<Data|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState(''),[expanded,setExpanded]=useState<string[]>([]);
 useEffect(()=>{const ctrl=new AbortController();setBusy(true);setError('');
 fetch('/api/v1/models/groups?'+new URLSearchParams({q:term,cursor:String(cursor),limit:'20',sort:order}),{signal:ctrl.signal})
 .then(async r=>{if(!r.ok)throw Error('模型分组数据尚未就绪');return r.json()})
 .then(x=>{if(!ctrl.signal.aborted)setData(x)})
 .catch(e=>{if(!ctrl.signal.aborted){setError(e.message);setData(null)}})
 .finally(()=>{if(!ctrl.signal.aborted)setBusy(false)});
 return()=>ctrl.abort()},[term,cursor,order]);
 return <main style={{maxWidth:1100,margin:'22px auto',padding:'0 18px 36px'}}>
 <a href="/" style={{fontSize:13}}>返回 AI 平台首页</a>
 <h1 style={{margin:'14px 0 6px'}}>全球 AI 模型与价格比较</h1>
 <p style={{color:'#64748b',fontSize:13}}>一个模型集中展示，展开后比较不同服务商的报价。数据来自 models.dev 第三方聚合，尚未经各厂商独立核验。</p>
 <form onSubmit={e=>{e.preventDefault();setCursor(0);setExpanded([]);setTerm(q)}} style={{display:'flex',gap:8,margin:'20px 0'}}>
 <input aria-label="搜索模型" value={q} onChange={e=>setQ(e.target.value)} placeholder="搜索 GPT、Claude、Gemini、Qwen…" style={{flex:1,minWidth:0,padding:12,border:'1px solid #cbd5e1',borderRadius:8}}/>
 <button type="submit" style={{padding:'10px 22px',background:'#155eef',border:0,color:'#fff',borderRadius:8}}>搜索</button></form>
 <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}><label htmlFor="model-order" style={{fontSize:13}}>排序</label><select id="model-order" value={order} onChange={e=>{setOrder(e.target.value as 'providers'|'price');setCursor(0);setExpanded([])}} style={{padding:8,border:'1px solid #cbd5e1',borderRadius:8}}><option value="providers">报价服务商数量</option><option value="price">最低参考输入价</option></select></div>
 <p role="status" style={{fontSize:13,color:'#64748b'}}>{busy?'正在读取模型…':error?error:data?'符合条件：'+data.total.toLocaleString()+' 个模型标识':''}</p>
 <div style={{display:'grid',gap:10}}>
 {data?.items.map(g=>{const isOpen=expanded.includes(g.modelId);
 return <article key={g.modelId} style={{border:'1px solid #dbe5f4',borderRadius:12,padding:'14px 16px',background:'#fff'}}>
 <div style={{display:'flex',justifyContent:'space-between',gap:14,flexWrap:'wrap',alignItems:'center'}}>
 <div><strong style={{fontSize:16}}>{g.name}</strong><small style={{display:'block',color:'#64748b'}}>{g.modelId}</small></div>
 <div style={{fontSize:13,color:'#334155'}}>{g.providerCount} 个服务商报价 <strong style={{marginLeft:12}}>参考输入价 {money(g.lowestObservedInputUsdPerMillion)}</strong><small style={{display:'block',textAlign:'right'}}>USD / 百万 tokens</small></div>
 <button aria-expanded={isOpen} onClick={()=>setExpanded(v=>isOpen?v.filter(x=>x!==g.modelId):[...v,g.modelId])} style={{border:'1px solid #cbd5e1',background:'#f8fafc',padding:'8px 12px',borderRadius:8,cursor:'pointer'}}>{isOpen?'收起报价':'比较服务商'}</button>
 </div>
 {isOpen&&<div style={{overflowX:'auto',marginTop:12}}><table style={{width:'100%',borderCollapse:'collapse',fontSize:13,textAlign:'left'}}><thead><tr>{['服务商','输入价','输出价','上下文','来源'].map(t=><th key={t} style={{padding:9,borderBottom:'1px solid #e2e8f0'}}>{t}</th>)}</tr></thead><tbody>
 {[...g.offers].sort((a,b)=>(a.inputUsdPerMillion??Infinity)-(b.inputUsdPerMillion??Infinity)).map(o=><tr key={o.id}><td style={{padding:9}}>{o.providerName}</td><td>{money(o.inputUsdPerMillion)}</td><td>{money(o.outputUsdPerMillion)}</td><td>{o.contextLimit?.toLocaleString()??'未知'}</td><td><a href={o.sourceUrl} target="_blank" rel="noopener noreferrer">查看聚合来源</a></td></tr>)}
 </tbody></table></div>}</article>})}
 </div>
 <div style={{display:'flex',gap:10,alignItems:'center',margin:'20px 0'}}>
 <button disabled={busy||cursor===0} onClick={()=>{setCursor(Math.max(0,cursor-20));setExpanded([])}}>上一页</button>
 <span style={{fontSize:12}}>第 {Math.floor(cursor/20)+1} 页</span>
 <button disabled={busy||data?.nextCursor==null} onClick={()=>{setCursor(data!.nextCursor!);setExpanded([])}}>下一页</button>
 </div>
 <p style={{fontSize:12,color:'#64748b'}}>采集时间：{data?.sourceCollectedAt?.slice(0,10)||'未知'}。最低价仅根据已取得的输入价格计算，不包含输出价格或其他费用；模型标识一致不保证服务质量一致。</p>
 <a href="https://models.dev/" target="_blank" rel="noopener noreferrer">核对 models.dev 来源</a>
 </main>;
}
