'use client';
import {useEffect,useState} from 'react';
type Model={id:string;provider:string;name:string;inputPrice:number|null;outputPrice:number|null;context:number|null;maxOutput:number|null};
type Data={total:number;items:Model[];nextCursor:number|null;source:string;verification:string;error?:string};
export default function ModelsPage(){
 const[q,setQ]=useState(''),[term,setTerm]=useState(''),[cursor,setCursor]=useState(0),[data,setData]=useState<Data|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState('');
 useEffect(()=>{const ctrl=new AbortController();setBusy(true);setError('');
 fetch('/api/v1/models?'+new URLSearchParams({q:term,cursor:String(cursor),limit:'20'}),{signal:ctrl.signal}).then(async r=>{if(!r.ok)throw Error('数据源暂不可用');return r.json()}).then(x=>setData(x)).catch(e=>{if(!ctrl.signal.aborted)setError(e.message)}).finally(()=>{if(!ctrl.signal.aborted)setBusy(false)});return()=>ctrl.abort()},[term,cursor]);
 return <main style={{maxWidth:1120,margin:'24px auto',padding:20}}><a href="/">返回全球 AI 平台首页</a><h1>全球 AI 模型与价格行情</h1><p>来源：models.dev 第三方公开聚合数据。价格、上下文和版本必须以厂商官方资料再次核验；不代表平台流量排名。</p>
 <form onSubmit={e=>{e.preventDefault();setCursor(0);setTerm(q)}}><input aria-label="搜索模型或服务商" value={q} onChange={e=>setQ(e.target.value)} placeholder="搜索 GPT、Claude、Gemini、Qwen 等" style={{padding:12,width:'75%',maxWidth:600}}/><button type="submit" style={{padding:12}}>搜索</button></form>
 <p>{busy?'正在获取数据…':error?'来源暂不可用：'+error:data?'符合条件的模型记录 '+data.total.toLocaleString()+' 条':''}</p>
 <div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse',textAlign:'left'}}><thead><tr>{['模型','服务商','输入价格','输出价格','上下文','来源'].map(k=><th key={k} style={{padding:12,borderBottom:'1px solid #ccc'}}>{k}</th>)}</tr></thead><tbody>{data?.items.map(m=><tr key={m.id}><td style={{padding:12}}>{m.name}<small style={{display:'block'}}>{m.id}</small></td><td>{m.provider}</td><td>{m.inputPrice??'待核验'}</td><td>{m.outputPrice??'待核验'}</td><td>{m.context?.toLocaleString()??'未知'}</td><td><a href="https://models.dev/" target="_blank" rel="noopener noreferrer">聚合来源</a></td></tr>)}</tbody></table></div>
 <p>价格单位：USD / 百万 tokens。第三方数据不等于厂商已确认价格。</p>
 <div style={{display:'flex',gap:12}}><button disabled={cursor===0||busy} onClick={()=>setCursor(Math.max(0,cursor-20))}>上一页</button><button disabled={data?.nextCursor==null||busy} onClick={()=>setCursor(data!.nextCursor!)}>下一页</button></div></main>
}
