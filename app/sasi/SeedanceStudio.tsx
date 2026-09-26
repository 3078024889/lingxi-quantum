"use client";
import {useState} from "react";
export default function SeedanceStudio({projectId,dark}:{projectId:string;dark:boolean}){
 const[script,setScript]=useState(""),[busy,setBusy]=useState(false),[result,setResult]=useState<any>(null),[error,setError]=useState("");
 async function run(){if(!script.trim())return;setBusy(true);setError("");try{const r=await fetch("/api/sasi/drama/autonomous",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({script,secondsPerShot:4,projectId})});const d=await r.json();if(!r.ok)throw new Error(d.error||"生成失败");setResult(d)}catch(e){setError(e instanceof Error?e.message:String(e))}finally{setBusy(false)}}
 return <section className={`mt-8 rounded-3xl border p-6 ${dark?"border-white/10 bg-white/[.035]":"border-black/10 bg-white"}`}>
  <p className="text-sm opacity-60">SASI · 自主镜头工作台</p><h2 className="mt-2 text-2xl font-semibold">先把这一幕变成可执行镜头。</h2>
  <p className="mt-3 leading-7 opacity-70">基础镜头规划、时间线和字幕由灵犀场直接完成。需要更写实的新画面时，再自行开启增强生成。</p>
  <textarea value={script} onChange={e=>setScript(e.target.value)} rows={6} className="mt-5 w-full rounded-xl border border-current/15 bg-transparent p-4" placeholder="描述这一幕发生什么…"/>
  <button onClick={run} disabled={busy||!script.trim()} className="mt-4 rounded-xl bg-[var(--lx-ink)] px-5 py-3 text-[var(--lx-bg)] disabled:opacity-40">{busy?"正在拆镜头…":"形成镜头方案"}</button>
  {error&&<p className="mt-3 text-sm text-[var(--lx-danger)]">{error}</p>}
  {result?.shots?.length?<div className="mt-5 grid gap-3 sm:grid-cols-2">{result.shots.map((s:any)=><article key={s.id} className="rounded-xl border border-current/10 p-4"><b>{s.id}</b><p className="mt-2 text-sm">{s.text}</p><p className="mt-2 text-xs opacity-55">{s.scene} · {s.framing}</p></article>)}</div>:null}
 </section>
}
