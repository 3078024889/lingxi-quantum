"use client";
import {useState} from "react";

type Reply={answer:string;intent:string;next?:{label:string;href:string}[]};
export default function SasiChat(){
 const[q,setQ]=useState(""),[busy,setBusy]=useState(false),[reply,setReply]=useState<Reply|null>(null),[error,setError]=useState("");
 async function send(){if(!q.trim()||busy)return;setBusy(true);setError("");try{
  const r=await fetch("/api/sasi/autonomous/chat",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({question:q})});const d=await r.json();if(!r.ok)throw new Error(d.error||"请求没有完成");setReply(d);
 }catch(e){setError(e instanceof Error?e.message:String(e))}finally{setBusy(false)}}
 return <section className="mx-auto max-w-3xl">
  <p className="text-sm text-[var(--lx-accent)]">灵犀场 SASI</p><h1 className="mt-3 text-3xl font-semibold">把问题交进来，让 SASI 判断下一步怎么处理。</h1>
  <p className="mt-4 leading-7 text-[var(--lx-muted)]">默认由灵犀场自己的任务路由、规则、知识与工具完成。增强能力可以另外开启，但不是开始使用的前提。</p>
  <div className="mt-6 rounded-3xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-5">
   <textarea value={q} onChange={e=>setQ(e.target.value)} rows={7} className="w-full rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-soft)] p-4 outline-none" placeholder="例如：把这份 PDF 提取成可检索资料；把这个故事拆成短剧；把图片压到 100KB；帮我整理研究路径…"/>
   <button onClick={send} disabled={busy||!q.trim()} className="mt-3 rounded-xl bg-[var(--lx-ink)] px-5 py-3 text-sm text-[var(--lx-bg)] disabled:opacity-40">{busy?"正在判断…":"开始处理"}</button>
  </div>
  {error&&<p className="mt-4 text-sm text-[var(--lx-danger)]">{error}</p>}
  {reply&&<article className="mt-6 rounded-3xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-6"><p className="text-xs text-[var(--lx-faint)]">已识别：{reply.intent}</p><p className="mt-3 whitespace-pre-wrap leading-7">{reply.answer}</p>{reply.next?.length?<div className="mt-5 flex flex-wrap gap-2">{reply.next.map(x=><a key={x.href} href={x.href} className="rounded-full border border-[var(--lx-line)] px-4 py-2 text-sm">{x.label} →</a>)}</div>:null}</article>}
 </section>
}
