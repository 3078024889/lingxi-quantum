"use client";
import {byokError,taskLabel} from "@/lib/sasi/byok-copy";
import {useEffect,useRef,useState} from "react";
import Link from "next/link";
type Task={id:string;state:string;request?:{prompt:string};estimated_fen:number;expires_at:string;output?:{imageUrl?:string}};
export default function SasiByokImageStudio(){
 const[prompt,setPrompt]=useState("");const[tasks,setTasks]=useState<Task[]>([]);const[profile,setProfile]=useState<{model:string;size:string}|null>(null);const[busy,setBusy]=useState(false);const[error,setError]=useState("");const[rights,setRights]=useState(false);const lock=useRef(false);
 async function load(){const r=await fetch("/api/sasi/byok/image",{cache:"no-store"});const d=await r.json();if(!r.ok)throw new Error(byokError(d.error));setTasks(d.tasks);setProfile(d.profile);}
 useEffect(()=>{void load().catch(e=>setError(e.message));},[]);
 async function run(body:object){if(lock.current)return;lock.current=true;setBusy(true);setError("");try{const r=await fetch("/api/sasi/byok/image",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});const d=await r.json();if(!r.ok)throw new Error(byokError(d.error));if(d.task?.output?.imageUrl)setTasks(old=>[{...old.find(t=>t.id===d.task.id),...d.task},...old.filter(t=>t.id!==d.task.id)]);if(d.historySaved===false)setError("图片已返回，但历史保存失败，请立即保存图片，不要重复生成。");else await load();}catch(e){setError(e instanceof Error?e.message:"请求失败");}finally{lock.current=false;setBusy(false);}}
 return <section className="mx-auto max-w-4xl space-y-5 p-6"><h1 className="text-3xl font-semibold">你想象的画面，在这里成形</h1><p>写下你想要的画面，先确认单张费用，再开始生成。</p><Link className="underline" href="/sasi/connections">创作设置</Link>
 {profile?<details><summary>生成设置</summary><p>生成方式：{profile.model} · {profile.size}</p></details>:<p>图片生成暂未开放，当前不会收取生成费用。</p>}
 <textarea aria-label="图片描述" rows={6} maxLength={3000} disabled={busy} className="w-full rounded-xl border bg-transparent p-4" value={prompt} onChange={e=>setPrompt(e.target.value)}/>
 <label className="block"><input type="checkbox" disabled={busy} checked={rights} onChange={e=>setRights(e.target.checked)}/> 我拥有内容使用权，同意标记 AI 生成</label>
 <button className="rounded-xl border p-3 disabled:opacity-40" disabled={busy||!profile||!rights||prompt.trim().length<8} onClick={()=>void run({action:"quote",prompt,rightsConfirmed:true,aiLabelAcknowledged:true})}>查看单张预算</button>
 {error&&<p role="alert">{error}</p>}{busy&&<p role="status">正在处理，请保持页面打开…</p>}
 {tasks.map(t=><article className="space-y-3 rounded-xl border p-4" key={t.id}><p>{t.request?.prompt}</p><p>{taskLabel(t.state)} · 预估 ¥{(t.estimated_fen/100).toFixed(2)}</p>{t.state==="quoted"&&<button className="rounded-xl border p-3" disabled={busy||Date.parse(t.expires_at)<=Date.now()} onClick={()=>void run({action:"confirm",taskId:t.id,acceptSupplierBilling:true})}>同意预算并生成</button>}{t.output?.imageUrl&&<><img alt="AI 生成图片" className="max-h-[640px] max-w-full" src={t.output.imageUrl}/><a className="underline" href={t.output.imageUrl} target="_blank" rel="noreferrer">打开原图并保存</a><p>原图链接可能有有效期，请及时保存。</p></>}{["running","uncertain"].includes(t.state)&&<p>请先查看对应 AI 服务的使用记录，不要重复提交，以免再次产生费用。</p>}</article>)}
 </section>;
}
