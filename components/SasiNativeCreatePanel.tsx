"use client";

import { useEffect, useRef, useState } from "react";
import PaidActionButton from "@/components/tools/PaidActionButton";

type Mode="think"|"image"|"video";
type Job={
  id:string;
  state:"queued"|"running"|"succeeded"|"failed"|"cancelled";
  progress:number;
  result?:Record<string,unknown>|null;
  artifacts?:Array<{kind:string;mime:string;url?:string}>;
  error?:{message?:string}|null;
};

const COPY:Record<Mode,{title:string;placeholder:string;button:string;toolId:string;unit:string}>={
  think:{title:"提问与看图",placeholder:"写下问题，或带上图片，让 SASI 帮你分析。",button:"确认本次价格",toolId:"sasi-deep-reason",unit:"次"},
  image:{title:"生成图片",placeholder:"描述你想看到的画面、人物、环境、光线和感觉。",button:"确认本次价格",toolId:"sasi-image-generate",unit:"张"},
  video:{title:"生成视频",placeholder:"描述这一镜发生什么：人物、动作、场景、镜头和情绪。",button:"确认本次价格",toolId:"sasi-video-generate",unit:"秒"},
};

export default function SasiNativeCreatePanel(){
  const[mode,setMode]=useState<Mode>("think");
  const[prompt,setPrompt]=useState("");
  const[duration,setDuration]=useState(5);
  const[job,setJob]=useState<Job|null>(null);
  const[message,setMessage]=useState("");
  const[images,setImages]=useState<string[]>([]);
  const[capabilities,setCapabilities]=useState<Record<string,{ready?:boolean}>>({});
  const[checking,setChecking]=useState(true);
  const timer=useRef<number|null>(null);
  const generation=useRef(0);

  useEffect(()=>{
    const controller=new AbortController();
    fetch("/api/sasi/native/readiness",{cache:"no-store",signal:controller.signal})
      .then(r=>r.json()).then(b=>{setCapabilities(b.compute?.capabilities||{});setChecking(false)})
      .catch(()=>{if(!controller.signal.aborted)setChecking(false)});
    return()=>{controller.abort();generation.current++};
  },[]);

  async function addImages(files:FileList|null){
    if(!files)return;
    try{
      if(files.length>2)throw new Error("每次最多选择两张图片。");
      const selected:string[]=[];
      for(const file of Array.from(files)){
        if(!["image/jpeg","image/png","image/webp"].includes(file.type)||file.size>20*1024*1024)
          throw new Error("请选择 20MB 以内的 JPG、PNG 或 WebP 图片。");
        const bitmap=await createImageBitmap(file);
        try{
          const scale=Math.min(1,1536/Math.max(bitmap.width,bitmap.height));
          const canvas=document.createElement("canvas");
          canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));
          const context=canvas.getContext("2d");if(!context)throw new Error("浏览器无法读取图片。");
          context.fillStyle="#fff";context.fillRect(0,0,canvas.width,canvas.height);context.drawImage(bitmap,0,0,canvas.width,canvas.height);
          const data=canvas.toDataURL("image/jpeg",0.8);
          if(data.length>1398100)throw new Error("图片细节过多，请缩小后重试。");
          selected.push(data);
        }finally{bitmap.close()}
      }
      setImages(selected);setMessage("");
    }catch(error){setMessage(error instanceof Error?error.message:"图片读取失败。")}
  }

  useEffect(()=>()=>{if(timer.current)window.clearTimeout(timer.current)},[]);

  async function poll(id:string){
    const current=generation.current;
    try{
      const r=await fetch(`/api/sasi/native/jobs/${encodeURIComponent(id)}`,{cache:"no-store",signal:AbortSignal.timeout(15000)});
      const b=await r.json().catch(()=>({}));
      if(current!==generation.current)return;
      if(!r.ok)throw new Error("这次没有完成，请稍后再试。");
      const next=b.job as Job;
      setJob(next);
      if(next.state==="queued"||next.state==="running"){
        setMessage(next.state==="queued"?"任务已排队，等待计算资源。":"模型正在生成，请稍候。");
        timer.current=window.setTimeout(()=>void poll(id),1800);
      }else if(next.state==="succeeded"){
        setMessage("已经完成。");
      }else if(next.state==="failed"){
        setMessage(next.error?.message||"这次没有完成，可以重新尝试。");
      }else setMessage("已经停止。");
    }catch(error){
      if(current!==generation.current)return;
      setMessage(error instanceof Error?error.message:"这次没有完成。");
    }
  }

  async function submitPaid(quoteId:string){
    const text=prompt.trim();
    if(!text)return;
    generation.current++;
    if(timer.current)window.clearTimeout(timer.current);
    setJob(null);
    setMessage(mode==="think"?"正在理解你的问题…":mode==="image"?"正在准备画面…":"正在准备镜头…");
    const kind=mode==="think"?"reason":mode;
    const input=mode==="think"
      ?{prompt:text,mode:"deep",...(images.length?{images}:{})}
      :mode==="image"
        ?{prompt:text,ratio:"1:1"}
        :{prompt:text,ratio:"9:16",durationSec:duration};
    const r=await fetch("/api/sasi/native/jobs",{
      method:"POST",
      headers:{"content-type":"application/json"},
      body:JSON.stringify({kind,quoteId,input}),
    });
    const b=await r.json().catch(()=>({}));
    if(!r.ok||!b.job?.id)throw new Error(r.status===402?"请先完成本次支付。":"这项能力现在还没有准备好。");
    setJob(b.job);
    void poll(b.job.id);
  }

  const textResult=job?.result&&typeof job.result.text==="string"?job.result.text:"";
  const media=job?.artifacts?.find(item=>item.url&&(item.kind==="image"||item.kind==="video"));
  const quantity=mode==="video"?duration:1;
  const ready=capabilities[mode==="think"?(images.length?"vision":"reason"):mode]?.ready===true;
  const busy=job?.state==="queued"||job?.state==="running";

  return <section className="mx-auto max-w-6xl px-6 pb-16">
    <div className="rounded-3xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-6 md:p-8">
      <div className="flex flex-wrap gap-2">
        {(["think","image","video"] as Mode[]).map(value=>
          <button key={value} disabled={busy} onClick={()=>{generation.current++;if(timer.current)window.clearTimeout(timer.current);setMode(value);setJob(null);setMessage("")}}
            className={`rounded-full px-4 py-2 text-sm ${mode===value?"bg-[var(--lx-ink)] text-[var(--lx-bg)]":"border border-[var(--lx-line)] text-[var(--lx-ink)]"}`}>
            {COPY[value].title}
          </button>
        )}
      </div>

      <h2 className="mt-6 text-2xl font-semibold text-[var(--lx-ink)]">{COPY[mode].title}</h2>
      <textarea aria-label="你的问题或创作要求" disabled={busy} value={prompt} onChange={e=>setPrompt(e.target.value)} maxLength={24000}
        className="mt-4 min-h-44 w-full rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-soft)] p-4 leading-7 text-[var(--lx-ink)] outline-none"
        placeholder={COPY[mode].placeholder}/>
      {mode==="think"&&<div className="mt-4 text-sm text-[var(--lx-muted)]">
        <label>带上图片（最多两张）<input className="mt-2 block max-w-full" type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={busy} onChange={e=>void addImages(e.target.files)}/></label>
        <p className="mt-2">图片在浏览器缩小后随问题发送到 SASI 自有计算服务。</p>
        {images.length>0&&<button disabled={busy} className="mt-2 underline" onClick={()=>setImages([])}>移除已选的 {images.length} 张图片</button>}
      </div>}
      <p className="mt-4 text-sm text-[var(--lx-muted)]" role="status">{checking?"正在检查可用能力…":ready?"自有模型已通过基础推理验收。先确认价格，再开始生成。":"这项自有模型能力尚未就绪，目前不会向你收取生成费用。"}</p>

      {mode==="video"&&<label className="mt-4 block text-sm text-[var(--lx-muted)]">
        视频长度
        <select disabled={busy} value={duration} onChange={e=>setDuration(Number(e.target.value))}
          className="mt-2 block rounded-xl border border-[var(--lx-line)] bg-[var(--lx-bg)] px-4 py-3 text-[var(--lx-ink)]">
          <option value={5}>5 秒</option>
          <option value={8}>8 秒</option>
          <option value={10}>10 秒</option>
        </select>
      </label>}

      <div className="mt-4">
        {ready&&prompt.trim()&&!busy&&
          <PaidActionButton
            toolId={COPY[mode].toolId}
            quantity={quantity}
            metadata={{mode,characters:prompt.length,vision:mode==="think"&&images.length>0}}
            onPaid={submitPaid}
            label={COPY[mode].button}
          />}
      </div>

      {message&&<p className="mt-4 text-sm text-[var(--lx-muted)]">{message}</p>}
      {job&&<button className="mt-3 text-sm underline" onClick={()=>{if(timer.current)window.clearTimeout(timer.current);void poll(job.id)}}>刷新任务状态</button>}
      {textResult&&<div className="mt-6 whitespace-pre-wrap rounded-2xl bg-[var(--lx-soft)] p-5 leading-7 text-[var(--lx-ink)]">{textResult}</div>}
      {media?.kind==="image"&&media.url&&<img src={media.url} alt="SASI 生成结果" className="mt-6 max-h-[72vh] w-full rounded-2xl object-contain"/>}
      {media?.kind==="video"&&media.url&&<video src={media.url} className="mt-6 max-h-[72vh] w-full rounded-2xl bg-black" controls playsInline/>}
      {media?.url&&<a className="mt-4 inline-block underline" href={media.url} download>下载生成结果</a>}
    </div>
  </section>;
}
