"use client";
import {useEffect,useRef,useState} from "react";

type Quality="fast"|"balanced"|"cinema";
type Job={id:string;status:string;errorCode?:string|null};
export default function SasiManagedVideoCreate(){
 const[prompt,setPrompt]=useState(""),[duration,setDuration]=useState(8),[quality,setQuality]=useState<Quality>("balanced");
 const[projectId,setProjectId]=useState(""),[quote,setQuote]=useState<any>(null),[job,setJob]=useState<Job|null>(null),[message,setMessage]=useState(""),[videoUrl,setVideoUrl]=useState("");
 const timer=useRef<number|null>(null);useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current)},[]);
 async function ensureProject(){
   if(projectId)return projectId;
   const id=crypto.randomUUID();
   const r=await fetch("/api/sasi/projects",{method:"POST",headers:{"content-type":"application/json","Idempotency-Key":id},body:JSON.stringify({kind:"drama",brief:prompt.trim(),seconds:duration,quality,budgetFen:0,language:"zh"})});
   const b=await r.json().catch(()=>({}));if(!r.ok)throw new Error("暂时无法创建这个作品。");
   const created=b.project?.projectId||b.project?.id||b.project?.project_id||b.project?.projectID;
   if(typeof created!=="string")throw new Error("作品没有成功创建。");
   setProjectId(created);return created;
 }
 async function makeQuote(){
   setMessage("正在确认本次价格…");setQuote(null);setVideoUrl("");
   try{
     const pid=await ensureProject();
     const r=await fetch("/api/sasi/quote",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({projectId:pid,prompt:prompt.trim(),duration,quality,aspectRatio:"9:16"})});
     const b=await r.json().catch(()=>({}));if(!r.ok)throw new Error(b.error==="SASI_MANAGED_VIDEO_NOT_READY"?"当前高质量视频生成暂时没有可用路线。":"暂时无法确认本次价格。");
     setQuote(b);setMessage("价格已确认。");
   }catch(e){setMessage(e instanceof Error?e.message:"暂时无法继续。")}
 }
 async function submit(){
   if(!quote)return;setMessage("正在开始制作…");
   const r=await fetch("/api/sasi/jobs",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({quoteToken:quote.quoteToken,prompt:prompt.trim(),requestId:crypto.randomUUID()})});
   const b=await r.json().catch(()=>({}));if(!r.ok)throw new Error(r.status===402?"SASI 余额不足，请先充值。":"这次没有成功开始。");
   setJob(b.job);void poll(b.job.id);
 }
 async function poll(id:string){
   const r=await fetch(`/api/sasi/jobs/${encodeURIComponent(id)}/refresh`,{method:"POST"});const b=await r.json().catch(()=>({}));const next=b.job as Job|undefined;
   if(next)setJob(next);
   if(next?.status==="succeeded"){
     const d=await fetch(`/api/sasi/jobs/${encodeURIComponent(id)}/delivery`,{cache:"no-store"});const out=await d.json().catch(()=>({}));
     if(d.ok&&out.url)setVideoUrl(out.url);setMessage("已经完成。");return;
   }
   if(next?.status==="failed"||next?.status==="cancelled"){setMessage("这次没有交付成功，预留金额会按现有结算规则释放。");return}
   setMessage(next?.status==="running"?"正在制作并检查结果…":"已经排好，正在等待处理…");
   timer.current=window.setTimeout(()=>void poll(id),2500);
 }
 return <section className="mx-auto max-w-5xl px-6 py-10">
  <div className="rounded-3xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-6 md:p-8">
   <p className="text-xs tracking-[.18em] text-[var(--lx-muted)]">SASI · VIDEO</p>
   <h1 className="mt-2 text-3xl font-semibold text-[var(--lx-ink)]">把这一镜做成完整视频</h1>
   <p className="mt-3 text-sm leading-7 text-[var(--lx-muted)]">你只描述想要的结果。SASI 会从已验证的路线中选择合适能力，并在开始前给出一次最终价格。</p>
   <textarea className="mt-5 min-h-44 w-full rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-soft)] p-4 text-[var(--lx-ink)]" maxLength={4000} value={prompt} onChange={e=>{setPrompt(e.target.value);setQuote(null)}} placeholder="例如：夜雨中的城市天台，女主缓慢转身看向镜头，风吹动头发，冷色电影感，镜头轻微推进。"/>
   <div className="mt-4 flex flex-wrap gap-3">
    <select value={duration} onChange={e=>{setDuration(Number(e.target.value));setQuote(null)}} className="rounded-xl border border-[var(--lx-line)] bg-[var(--lx-bg)] px-4 py-3 text-[var(--lx-ink)]"><option value={5}>5 秒</option><option value={8}>8 秒</option><option value={10}>10 秒</option><option value={12}>12 秒</option></select>
    <select value={quality} onChange={e=>{setQuality(e.target.value as Quality);setQuote(null)}} className="rounded-xl border border-[var(--lx-line)] bg-[var(--lx-bg)] px-4 py-3 text-[var(--lx-ink)]"><option value="fast">快速</option><option value="balanced">标准</option><option value="cinema">臻选</option></select>
   </div>
   <div className="mt-5">{!quote?<button disabled={prompt.trim().length<6} onClick={()=>void makeQuote()} className="rounded-xl bg-[var(--lx-ink)] px-5 py-2.5 text-[var(--lx-bg)] disabled:opacity-40">查看本次价格</button>:<div className="flex flex-wrap items-center gap-3"><div className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-soft)] px-4 py-3">完成这一镜 · <b className="text-xl">¥{(quote.amountFen/100).toFixed(2)}</b></div><button onClick={()=>void submit()} className="rounded-xl bg-[var(--lx-ink)] px-5 py-2.5 text-[var(--lx-bg)]">确认并开始</button></div>}</div>
   {message&&<p className="mt-4 text-sm text-[var(--lx-muted)]">{message}</p>}
   {videoUrl&&<video src={videoUrl} controls playsInline className="mt-6 max-h-[72vh] w-full rounded-2xl bg-black"/>}
  </div>
 </section>
}
