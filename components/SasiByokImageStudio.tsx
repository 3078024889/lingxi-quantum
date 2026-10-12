"use client";
import {byokError,taskLabel} from "@/lib/sasi/byok-copy";
import {useEffect,useRef,useState} from "react";
import Link from "next/link";
type Task={id:string;state:string;request?:{prompt:string;originalPrompt?:string;billingCurrency?:string};estimated_fen:number;expires_at:string;output?:{imageUrl?:string;assetId?:string;supplierResult?:{imageUrl?:string}}};
export default function SasiByokImageStudio(){
 const[prompt,setPrompt]=useState("");const[tasks,setTasks]=useState<Task[]>([]);const[profile,setProfile]=useState<{model:string;size:string}|null>(null);const[busy,setBusy]=useState(false);const[error,setError]=useState("");const[rights,setRights]=useState(false);const lock=useRef(false);
 async function load(){const r=await fetch("/api/sasi/byok/image",{cache:"no-store"});const d=await r.json();if(!r.ok)throw new Error(byokError(d.error));setTasks(d.tasks);setProfile(d.profile);}
 useEffect(()=>{void load().catch(e=>setError(e.message));},[]);
 async function run(body:object){if(lock.current)return;lock.current=true;setBusy(true);setError("");try{const r=await fetch("/api/sasi/byok/image",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});const d=await r.json();if(!r.ok)throw new Error(byokError(d.error));await load();}catch(e){setError(e instanceof Error?e.message:"请求失败");await load().catch(()=>{});}finally{lock.current=false;setBusy(false);}}
 return <section className="mx-auto max-w-4xl space-y-5 p-6"><h1 className="text-3xl font-semibold">你想象的画面，在这里成形</h1><p>模型费用由你的智能服务账户支付。这里显示平台费用，作品通过校验并保存后才收取。</p><Link className="underline" href="/sasi/connections">创作设置</Link>
 {profile?<details><summary>生成设置</summary><p>生成方式：{profile.model} · {profile.size}</p></details>:<p>图片生成暂未开放，当前不会收取生成费用。</p>}
 <textarea aria-label="图片描述" rows={6} maxLength={3000} disabled={busy} className="w-full rounded-xl border bg-transparent p-4" value={prompt} onChange={e=>setPrompt(e.target.value)}/>
 <label className="block"><input type="checkbox" disabled={busy} checked={rights} onChange={e=>setRights(e.target.checked)}/> 我拥有内容使用权，同意标记 AI 生成</label>
 <button className="rounded-xl border p-3 disabled:opacity-40" disabled={busy||!profile||!rights||prompt.trim().length<8} onClick={()=>void run({action:"quote",prompt,rightsConfirmed:true,aiLabelAcknowledged:true})}>查看单张预算</button>
 {error&&<p role="alert">{error}</p>}{busy&&<p role="status">正在处理，请保持页面打开…</p>}
 {tasks.map(t=><article className="space-y-3 rounded-xl border p-4" key={t.id}><p>{t.request?.originalPrompt ?? t.request?.prompt}</p><p>{taskLabel(t.state)} · 平台预算 {t.request?.billingCurrency==='USD'?'US$':'¥'}{(t.estimated_fen/100).toFixed(2)}</p>{t.state==="quoted"&&<button className="rounded-xl border p-3" disabled={busy||Date.parse(t.expires_at)<=Date.now()} onClick={()=>void run({action:"confirm",taskId:t.id,acceptSupplierBilling:true})}>同意预算并生成</button>}{t.output?.imageUrl&&<><img alt="AI 生成图片" className="max-h-[640px] max-w-full" src={t.output.imageUrl}/><a className="underline" href={t.output.imageUrl+(t.output.assetId?'?download=1':'')} target="_blank" rel="noreferrer">下载原图</a>{t.output.assetId?<p>作品已保存，可从生成记录再次下载。</p>:<p>历史作品链接可能过期，请及时保存。</p>}</>}{["running","uncertain"].includes(t.state)&&(t.output?.supplierResult?.imageUrl?<button className="rounded-xl border p-3" disabled={busy} onClick={()=>void run({action:'refresh',taskId:t.id})}>继续校验并保存作品</button>:<p>请先查看智能服务的生成记录，勿重复提交。模型费用由该服务结算。</p>)}</article>)}
 </section>;
}
