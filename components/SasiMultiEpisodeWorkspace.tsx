"use client";
import {useEffect,useMemo,useRef,useState} from "react";
import Link from "next/link";
import {useLingxiLang} from "@/lib/lingxi-i18n";
import {seriesText} from "@/lib/sasi/series-i18n";

type Profile={id:string;model:string;resolution:string;maxDuration:number;imageMode?:string};
type Task={id:string;state:string;estimated_fen:number;expires_at:string;request:{batchId?:string;batchShotCount?:number;episode?:number;duration:number;shotIndex?:number;prompt?:string};output?:{videoUrl?:string}};
type Status={enabled:boolean;connected:boolean;profiles:Profile[];tasks:Task[];assets:{id:string;original_name:string}[]};
type Shot={episode:number;duration:number;prompt:string};

export default function SasiMultiEpisodeWorkspace({projectId}:{projectId:string}){
 const{lang}=useLingxiLang();const t=(k:Parameters<typeof seriesText>[1])=>seriesText(lang,k);
 const[status,setStatus]=useState<Status|null>(null),[script,setScript]=useState(""),[shots,setShots]=useState<Shot[]>([]);
 const[profileId,setProfileId]=useState(""),[ratio,setRatio]=useState("9:16"),[assetIds,setAssetIds]=useState<string[]>([]);
 const[rights,setRights]=useState(false),[busy,setBusy]=useState(false),[message,setMessage]=useState("");
 const lock=useRef(false);
 const selected=status?.profiles?.find(p=>p.id===profileId)??status?.profiles?.[0];
 const batches=useMemo(()=>Array.from(new Set((status?.tasks??[]).map(x=>x.request.batchId).filter(Boolean))) as string[],[status?.tasks]);

 async function reload(){
  if(!projectId)return;
  const r=await fetch(`/api/sasi/byok/video?projectId=${encodeURIComponent(projectId)}`,{cache:"no-store"});
  const d=await r.json().catch(()=>({}));
  if(!r.ok)throw new Error(d.error||"STATUS_UNAVAILABLE");
  setStatus({enabled:Boolean(d.enabled),connected:Boolean(d.connected),profiles:Array.isArray(d.profiles)?d.profiles:[],tasks:Array.isArray(d.tasks)?d.tasks:[],assets:Array.isArray(d.assets)?d.assets:[]});
 }
 const reloadRef=useRef(reload);reloadRef.current=reload;
 const tRef=useRef(t);tRef.current=t;
 useEffect(()=>{void reloadRef.current().catch(()=>setMessage(tRef.current("failed")))},[projectId]);
 function parse(){
  try{
   const rows=script.split(/\r?\n/).filter(x=>x.trim()).map(line=>{
    const parts=line.split("|");if(parts.length<3)throw new Error(t("invalid"));
    const episode=Number(parts[0]),duration=Number(parts[1]),prompt=parts.slice(2).join("|").trim();
    if(!Number.isInteger(episode)||episode<1||episode>30||!Number.isInteger(duration)||duration<4||duration>60||prompt.length<8||prompt.length>3000)throw new Error(t("invalid"));
    return{episode,duration,prompt};
   });
   if(!rows.length||rows.length>60)throw new Error(t("tooMany"));
   setShots(rows);setMessage(t("parsed"));
  }catch(e){setMessage(e instanceof Error?e.message:t("failed"))}
 }
 async function run(fn:()=>Promise<void>){
  if(lock.current)return;lock.current=true;setBusy(true);setMessage("");
  try{await fn()}catch(e){setMessage(e instanceof Error?e.message:t("failed"))}finally{lock.current=false;setBusy(false)}
 }
 async function api(body:object){
  const r=await fetch("/api/sasi/byok/video",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(body)});
  const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||t("failed"));return d;
 }
 return <main className="min-h-screen bg-[var(--lx-bg)] px-4 py-10 text-[var(--lx-ink)]">
  <section className="mx-auto max-w-4xl space-y-5">
   <Link href={`/sasi/drama?projectId=${encodeURIComponent(projectId)}`} className="text-sm underline">{t("back")}</Link>
   <header><h1 className="text-3xl font-semibold">{t("title")}</h1><p className="mt-3 text-sm leading-7 text-[var(--lx-muted)]">{t("lead")}</p></header>
   <section className="rounded-3xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-5">
    <label className="text-sm font-medium">{t("script")}</label>
    <textarea rows={8} value={script} disabled={busy} onChange={e=>setScript(e.target.value)} placeholder={t("placeholder")} className="mt-2 w-full rounded-2xl border border-[var(--lx-line)] bg-transparent p-4"/>
    <p className="mt-2 text-xs text-[var(--lx-muted)]">{t("format")}</p>
    <button disabled={busy||!script.trim()} onClick={parse} className="mt-4 rounded-full border border-[var(--lx-line)] px-4 py-2 text-sm">{t("parse")}</button>
   </section>
   {!status?.enabled||!status?.connected?<p className="rounded-2xl border border-[var(--lx-line)] p-4 text-sm">{t("noService")} <Link className="underline" href="/sasi/connections">{t("service")}</Link></p>:null}
   <section className="rounded-3xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-5">
    <div className="grid gap-3 sm:grid-cols-2">
     <label className="text-sm">{t("service")}<select value={selected?.id??""} onChange={e=>setProfileId(e.target.value)} className="mt-2 w-full rounded-xl border border-[var(--lx-line)] bg-[var(--lx-bg)] p-3">{(status?.profiles??[]).map(p=><option key={p.id} value={p.id}>{p.model} · {p.resolution}</option>)}</select></label>
     <label className="text-sm">{t("ratio")}<select value={ratio} onChange={e=>setRatio(e.target.value)} className="mt-2 w-full rounded-xl border border-[var(--lx-line)] bg-[var(--lx-bg)] p-3"><option>9:16</option><option>16:9</option><option>1:1</option></select></label>
    </div>
    {(status?.assets??[]).length>0&&<fieldset className="mt-4"><legend className="text-sm">{t("refs")}</legend>{status!.assets.map(a=><label key={a.id} className="mr-4 mt-2 inline-flex gap-2 text-sm"><input type="checkbox" checked={assetIds.includes(a.id)} onChange={e=>setAssetIds(ids=>e.target.checked?[...ids,a.id]:ids.filter(id=>id!==a.id))}/>{a.original_name}</label>)}</fieldset>}
    <label className="mt-4 flex gap-2 text-sm"><input type="checkbox" checked={rights} onChange={e=>setRights(e.target.checked)}/>{t("rights")}</label>
    {shots.length>0&&<div className="mt-5 space-y-2">{shots.map((x,i)=><div key={i} className="rounded-xl bg-[var(--lx-soft)] px-3 py-2 text-sm">{x.episode} · {x.duration}s · {x.prompt}</div>)}</div>}
    <button disabled={busy||!selected||!shots.length||!rights||!status?.enabled||!status?.connected} onClick={()=>void run(async()=>{await api({action:"quote-series",projectId,profileId:selected!.id,ratio,shots:shots.map(x=>({...x,assetIds})),rightsConfirmed:true,aiLabelAcknowledged:true});await reload();setMessage(t("quoted"))})} className="mt-5 rounded-full bg-[var(--lx-ink)] px-5 py-2.5 text-sm text-[var(--lx-bg)] disabled:opacity-40">{busy?t("busy"):t("quote")}</button>
   </section>
   {batches.map(batchId=>{const group=(status?.tasks??[]).filter(x=>x.request.batchId===batchId).sort((a,b)=>(a.request.shotIndex??0)-(b.request.shotIndex??0));const quoted=group.filter(x=>x.state==="quoted");const unsafe=group.length!==(group[0]?.request.batchShotCount??group.length)||group.some(x=>["uncertain","submitting"].includes(x.state));return <article key={batchId} className="rounded-3xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-5">
    <p className="font-medium">{t("whole")} ¥{(group.reduce((n,x)=>n+Number(x.estimated_fen||0),0)/100).toFixed(2)} · {t("supplier")}</p>
    {unsafe&&<p className="mt-2 text-sm">{t("uncertain")}</p>}
    {quoted.length>0&&<button disabled={busy||unsafe||quoted.some(x=>Date.parse(x.expires_at)<=Date.now())} onClick={()=>void run(async()=>{for(const x of quoted){await api({action:"confirm",taskId:x.id,acceptSupplierBilling:true})}await reload()})} className="mt-3 rounded-full border border-[var(--lx-line)] px-4 py-2 text-sm">{t("confirm")} · ¥{(quoted.reduce((n,x)=>n+x.estimated_fen,0)/100).toFixed(2)}</button>}
    <button disabled={busy} onClick={()=>void run(async()=>{for(const x of group.filter(x=>["queued","running"].includes(x.state)))await api({action:"refresh",taskId:x.id});await reload()})} className="ml-2 mt-3 rounded-full border border-[var(--lx-line)] px-4 py-2 text-sm">{t("refresh")}</button>
    <div className="mt-4 space-y-2">{group.map((x,i)=><div key={x.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[var(--lx-soft)] px-3 py-2 text-sm"><span>{x.request.episode??1} · #{i+1} · {x.state}</span>{x.state==="succeeded"&&x.output?.videoUrl?.startsWith("https://")&&<a href={x.output.videoUrl} target="_blank" rel="noreferrer" className="underline">{t("openVideo")}</a>}</div>)}</div>
    {group.filter(x=>x.state==="succeeded"&&x.output?.videoUrl).length>=2&&<Link href="/sasi/assemble" className="mt-4 inline-block rounded-full border border-[var(--lx-line)] px-4 py-2 text-sm">{t("assemble")}</Link>}
   </article>})}
   {message&&<p role="status" className="rounded-2xl border border-[var(--lx-line)] p-4 text-sm">{message}</p>}
  </section>
 </main>
}
