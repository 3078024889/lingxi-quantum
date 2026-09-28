"use client";
import {byokError,taskLabel} from "@/lib/sasi/byok-copy";
import { useRef, useState } from "react";
import Link from "next/link";
import { episodeBudgets, type SeriesShot } from "@/lib/sasi/series-plan";
import { validateDirectorPlan } from "@/lib/sasi/director-plan";

type Profile={id:string;model:string;resolution:string;maxDuration:number;imageMode?:string};
type Task={id:string;state:string;estimated_fen:number;expires_at:string;request:{batchId?:string;batchShotCount?:number;episode?:number;duration:number;shotIndex?:number};output?:{videoUrl?:string}};
export default function SasiSeriesStudio({projectId,profiles,tasks,assets,reload}:{projectId:string;profiles:Profile[];tasks:Task[];assets:{id:string;original_name:string}[];reload:()=>Promise<void>}) {
  const [script,setScript]=useState("");const [shots,setShots]=useState<SeriesShot[]>([]);const [profileId,setProfileId]=useState("");
  const [ratio,setRatio]=useState("9:16");const [assetIds,setAssetIds]=useState<string[]>([]);const [rights,setRights]=useState(false);
  const [busy,setBusy]=useState(false);const [message,setMessage]=useState("");const lock=useRef(false);
  const selected=profiles.find(p=>p.id===profileId)??profiles[0];
  const button="rounded-xl border px-4 py-2 disabled:opacity-40";
  async function api(body:object){const r=await fetch("/api/sasi/byok/video",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});const d=await r.json();if(!r.ok)throw new Error(byokError(d.error));return d;}
  async function run(fn:()=>Promise<void>){if(lock.current)return;lock.current=true;setBusy(true);setMessage("");try{await fn();}catch(e){setMessage(e instanceof Error?e.message:"未完成");}finally{lock.current=false;setBusy(false);await reload().catch(()=>{});}}
  function parse(){try{
    if(script.trim().startsWith("{")){const plan=validateDirectorPlan(JSON.parse(script));setShots(plan.shots.map(s=>({episode:1,duration:s.duration,assetIds:[],prompt:[s.scene,s.camera,s.action,s.dialogue,s.continuity,...s.characters.map(id=>plan.characters.find(c=>c.id===id)!.identity)].join("\n")})));}
    else{const rows=script.split(/\r?\n/).filter(x=>x.trim()).map(line=>{const parts=line.split("|");if(parts.length<3)throw new Error("每行请填写：集数 | 秒数 | 镜头描述");return{episode:Number(parts[0]),duration:Number(parts[1]),prompt:parts.slice(2).join("|").trim(),assetIds:[]};});if(!rows.length||rows.length>60)throw new Error("请提供 1–60 个镜头");setShots(rows);}
    setMessage("已整理镜头，请检查内容，再获取真实预算。整理本身不会调用模型。");
  }catch(e){setMessage(e instanceof Error?e.message:"无法解析");}}
  const batches=Array.from(new Set(tasks.map(t=>t.request.batchId).filter(Boolean))) as string[];
  return <section className="space-y-4 rounded-2xl border p-5">
    <h2 className="text-2xl font-semibold">从一个故事，到一组连续镜头</h2>
    <p>让角色和场景贯穿整个故事，逐集查看时长与费用。最多 60 个镜头、合计 10 分钟。</p>
    <Link href="/sasi/director" className="underline">让 SASI 帮我写分镜 →</Link>
    <input type="file" accept=".txt,.md,.json" disabled={busy} aria-label="上传分镜脚本" onChange={e=>{const f=e.target.files?.[0];if(f){if(f.size>1024*1024){setMessage("分镜文本请控制在 1MB 内");return;}void f.text().then(setScript);}}}/>
    <textarea aria-label="多集分镜" className="w-full rounded-xl border bg-transparent p-3" rows={6} value={script} disabled={busy} onChange={e=>setScript(e.target.value)} placeholder="1 | 5 | 女主走进雨后的街道，镜头缓慢推进，她抬头看向窗边。"/>
    <button className={button} disabled={busy} onClick={parse}>整理并检查镜头</button>
    <details><summary>生成设置</summary><label className="block">生成方式<select className="m-2 border bg-transparent p-2" disabled={busy} value={selected?.id??""} onChange={e=>setProfileId(e.target.value)}>{profiles.map(p=><option key={p.id} value={p.id}>{p.model} · {p.resolution}</option>)}</select></label></details>
    {!profiles.length&&<p>暂时没有可用的生成方案，请稍后再来。</p>}
    <label>画幅<select className="m-2 border bg-transparent p-2" value={ratio} disabled={busy} onChange={e=>setRatio(e.target.value)}><option>9:16</option><option>16:9</option><option>1:1</option></select></label>
    <fieldset disabled={busy}><legend>共用角色／场景参考图（来自当前项目素材）</legend>{assets.map(a=><label className="block" key={a.id}><input type="checkbox" checked={assetIds.includes(a.id)} onChange={e=>setAssetIds(ids=>e.target.checked?[...ids,a.id]:ids.filter(id=>id!==a.id))}/>{a.original_name}</label>)}<p className="text-sm">先在项目中上传角色或场景图片，再选择本次要使用的参考。</p></fieldset>
    {shots.map((s,i)=><p key={i}>第 {s.episode} 集 · 镜头 {i+1} · {s.duration} 秒：{s.prompt}</p>)}
    <label className="block"><input type="checkbox" checked={rights} disabled={busy} onChange={e=>setRights(e.target.checked)}/> 我拥有素材使用权，同意标记 AI 生成</label>
    <button className={button} disabled={busy||!projectId||!selected||!shots.length||!rights} onClick={()=>void run(async()=>{await api({action:"quote-series",projectId,profileId:selected.id,ratio,shots:shots.map(s=>({...s,assetIds})),rightsConfirmed:true,aiLabelAcknowledged:true});setMessage("报价已保存，下方按集确认费用。");})}>查看每集费用</button>
    {batches.map(id=>{const group=tasks.filter(t=>t.request.batchId===id).sort((a,b)=>(a.request.shotIndex??0)-(b.request.shotIndex??0));const quoted=group.filter(t=>t.state==="quoted");const budgets=episodeBudgets(group.map(t=>({episode:t.request.episode??1,duration:t.request.duration,estimatedFen:t.estimated_fen})));const unsafe=group.length!==(group[0]?.request.batchShotCount??group.length)||group.some(t=>["uncertain","submitting"].includes(t.state));return <article className="space-y-3 rounded-xl border p-4" key={id}>
      {Object.entries(budgets).map(([ep,b])=><p key={ep}>第 {ep} 集：{b.shots} 镜 · {b.seconds} 秒 · 预估 ¥{(b.fen/100).toFixed(2)}</p>)}
      <p>整项预估 ¥{(group.reduce((n,t)=>n+t.estimated_fen,0)/100).toFixed(2)}，实际以所用账户账单为准。</p>
      {quoted.length>0&&<button className={button} disabled={busy||unsafe||quoted.some(t=>Date.parse(t.expires_at)<=Date.now())} onClick={()=>void run(async()=>{for(const t of quoted){const d=await api({action:"confirm",taskId:t.id,acceptSupplierBilling:true});if(!["queued","running","succeeded"].includes(d.state))throw new Error("提交状态需要核对，已停止后续镜头。");}setMessage("本批镜头已提交，可以查询进度。");})}>同意剩余 {quoted.length} 镜预估 ¥{(quoted.reduce((n,t)=>n+t.estimated_fen,0)/100).toFixed(2)}，依次提交</button>}
      {unsafe&&<p>存在待核对任务，已停止后续付费提交，请先查看对应 AI 服务的使用记录。</p>}
      <button className={button} disabled={busy} onClick={()=>void run(async()=>{for(const t of group.filter(t=>["queued","running"].includes(t.state)))await api({action:"refresh",taskId:t.id});})}>查询本批进度</button>
      {group.map(t=><div key={t.id}>镜头 {(t.request.shotIndex??0)+1}：{taskLabel(t.state)}{t.state==="succeeded"&&t.output?.videoUrl&&<a className="ml-2 underline" href={t.output.videoUrl} target="_blank" rel="noreferrer">打开并保存视频</a>}</div>)}
      <Link className="inline-block underline" href="/sasi/assemble">保存镜头后，按集免费合成 MP4 →</Link>
    </article>;})}
    {message&&<p role="status">{message}</p>}
  </section>;
}
