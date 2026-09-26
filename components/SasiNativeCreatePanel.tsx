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
  think:{title:"深度思考",placeholder:"写下问题、目标或需要推演的事情。",button:"确认本次价格",toolId:"sasi-deep-reason",unit:"次"},
  image:{title:"生成图片",placeholder:"描述你想看到的画面、人物、环境、光线和感觉。",button:"确认本次价格",toolId:"sasi-image-generate",unit:"张"},
  video:{title:"生成视频",placeholder:"描述这一镜发生什么：人物、动作、场景、镜头和情绪。",button:"确认本次价格",toolId:"sasi-video-generate",unit:"秒"},
};

export default function SasiNativeCreatePanel(){
  const[mode,setMode]=useState<Mode>("think");
  const[prompt,setPrompt]=useState("");
  const[duration,setDuration]=useState(5);
  const[job,setJob]=useState<Job|null>(null);
  const[message,setMessage]=useState("");
  const timer=useRef<number|null>(null);

  useEffect(()=>()=>{if(timer.current)window.clearTimeout(timer.current)},[]);

  async function poll(id:string){
    try{
      const r=await fetch(`/api/sasi/native/jobs/${encodeURIComponent(id)}`,{cache:"no-store"});
      const b=await r.json().catch(()=>({}));
      if(!r.ok)throw new Error("这次没有完成，请稍后再试。");
      const next=b.job as Job;
      setJob(next);
      if(next.state==="queued"||next.state==="running"){
        setMessage(next.state==="queued"?"已经排好，马上开始。":`正在完成… ${Math.round((next.progress||0)*100)}%`);
        timer.current=window.setTimeout(()=>void poll(id),1800);
      }else if(next.state==="succeeded"){
        setMessage("已经完成。");
      }else if(next.state==="failed"){
        setMessage(next.error?.message||"这次没有完成，可以重新尝试。");
      }else setMessage("已经停止。");
    }catch(error){
      setMessage(error instanceof Error?error.message:"这次没有完成。");
    }
  }

  async function submitPaid(quoteId:string){
    const text=prompt.trim();
    if(!text)return;
    if(timer.current)window.clearTimeout(timer.current);
    setJob(null);
    setMessage(mode==="think"?"正在理解你的问题…":mode==="image"?"正在准备画面…":"正在准备镜头…");
    const kind=mode==="think"?"reason":mode;
    const input=mode==="think"
      ?{prompt:text,mode:"deep"}
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

  return <section className="mx-auto max-w-6xl px-6 pb-16">
    <div className="rounded-3xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-6 md:p-8">
      <div className="flex flex-wrap gap-2">
        {(["think","image","video"] as Mode[]).map(value=>
          <button key={value} onClick={()=>{setMode(value);setJob(null);setMessage("")}}
            className={`rounded-full px-4 py-2 text-sm ${mode===value?"bg-[var(--lx-ink)] text-[var(--lx-bg)]":"border border-[var(--lx-line)] text-[var(--lx-ink)]"}`}>
            {COPY[value].title}
          </button>
        )}
      </div>

      <h2 className="mt-6 text-2xl font-semibold text-[var(--lx-ink)]">{COPY[mode].title}</h2>
      <textarea value={prompt} onChange={e=>setPrompt(e.target.value)} maxLength={24000}
        className="mt-4 min-h-44 w-full rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-soft)] p-4 leading-7 text-[var(--lx-ink)] outline-none"
        placeholder={COPY[mode].placeholder}/>

      {mode==="video"&&<label className="mt-4 block text-sm text-[var(--lx-muted)]">
        视频长度
        <select value={duration} onChange={e=>setDuration(Number(e.target.value))}
          className="mt-2 block rounded-xl border border-[var(--lx-line)] bg-[var(--lx-bg)] px-4 py-3 text-[var(--lx-ink)]">
          <option value={5}>5 秒</option>
          <option value={8}>8 秒</option>
          <option value={10}>10 秒</option>
        </select>
      </label>}

      <div className="mt-4">
        {prompt.trim()&&job?.state!=="queued"&&job?.state!=="running"&&
          <PaidActionButton
            toolId={COPY[mode].toolId}
            quantity={quantity}
            metadata={{mode,characters:prompt.length}}
            onPaid={submitPaid}
            label={COPY[mode].button}
          />}
      </div>

      {message&&<p className="mt-4 text-sm text-[var(--lx-muted)]">{message}</p>}
      {textResult&&<div className="mt-6 whitespace-pre-wrap rounded-2xl bg-[var(--lx-soft)] p-5 leading-7 text-[var(--lx-ink)]">{textResult}</div>}
      {media?.kind==="image"&&media.url&&<img src={media.url} alt="SASI 生成结果" className="mt-6 max-h-[72vh] w-full rounded-2xl object-contain"/>}
      {media?.kind==="video"&&media.url&&<video src={media.url} className="mt-6 max-h-[72vh] w-full rounded-2xl bg-black" controls playsInline/>}
    </div>
  </section>;
}
