"use client";
import { useState } from "react";
import Link from "next/link";

type Mode="organize"|"director";
function artifactText(result:any){
 const text=result?.artifacts?.find((x:any)=>x?.type==="text")?.value;
 if(typeof text==="string"&&text.trim())return text;
 const json=result?.artifacts?.find((x:any)=>x?.type==="json")?.value;
 if(json?.scenes&&Array.isArray(json.scenes))return json.scenes.map((s:any,i:number)=>`${i+1}. ${s.text} · ${s.place||""} · ${s.framing||""} · ${s.camera||""}`).join("\n");
 if(json)return JSON.stringify(json,null,2);
 return "";
}
export default function SasiAutonomousChat(){
 const[mode,setMode]=useState<Mode>("organize");const[text,setText]=useState("");const[result,setResult]=useState("");const[busy,setBusy]=useState(false);const[notice,setNotice]=useState("");
 async function run(){if(!text.trim()||busy)return;setBusy(true);setNotice("");setResult("");try{const response=await fetch("/api/sasi/autonomous",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(mode==="director"?{kind:"video",action:"plan",input:{script:text,ratio:"9:16"}}:{kind:"utility",action:"organize",input:{text}})});const body=await response.json().catch(()=>({}));if(!response.ok||!body.ok)throw new Error(body.error?.message||body.error||"这次没有处理完成。");setResult(artifactText(body));setNotice(mode==="director"?"已经整理成可继续制作的镜头方案。":"已经整理完成。整个过程没有调用外部生成模型。");}catch(error){setNotice(error instanceof Error?error.message:"这次没有处理完成。");}finally{setBusy(false)}}
 return <section className="mx-auto max-w-3xl">
  <p className="text-sm font-medium text-[var(--lx-accent)]">SASI · 自主工作台</p><h1 className="mt-3 text-3xl font-semibold text-[var(--lx-ink)]">先把能自己完成的事，直接完成。</h1>
  <p className="mt-4 leading-7 text-[var(--lx-muted)]">整理长文、提取结构、把故事拆成镜头，都不需要连接外部模型。需要基于书本或论文回答问题时，进入资料工作区；开放式生成只作为可选增强。</p>
  <div className="mt-6 rounded-3xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-5">
   <div className="flex flex-wrap gap-2">{([['organize','整理内容'],['director','故事变分镜']] as const).map(([id,label])=><button key={id} onClick={()=>setMode(id)} className={`rounded-full px-4 py-2 text-sm ${mode===id?'bg-[var(--lx-ink)] text-[var(--lx-bg)]':'border border-[var(--lx-line)] text-[var(--lx-muted)]'}`}>{label}</button>)}</div>
   <textarea value={text} onChange={e=>setText(e.target.value)} rows={10} className="mt-4 w-full rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-soft)] p-4 leading-7 text-[var(--lx-ink)] outline-none" placeholder={mode==="director"?"把故事、剧本或一个想法写进来……":"粘贴需要整理的正文、笔记或资料……"}/>
   <button onClick={()=>void run()} disabled={busy||!text.trim()} className="mt-4 rounded-full bg-[var(--lx-ink)] px-5 py-2.5 text-sm text-[var(--lx-bg)] disabled:opacity-40">{busy?"正在处理…":mode==="director"?"生成镜头方案":"开始整理"}</button>
   {notice&&<p className="mt-4 text-sm leading-6 text-[var(--lx-muted)]">{notice}</p>}
   {result&&<pre className="mt-5 max-h-[520px] overflow-auto whitespace-pre-wrap rounded-2xl bg-[var(--lx-soft)] p-4 text-sm leading-7 text-[var(--lx-ink)]">{result}</pre>}
  </div>
  <div className="mt-5 flex flex-wrap gap-3 text-sm"><Link href="/ai-knowledge" className="rounded-full border border-[var(--lx-line)] px-4 py-2">读书、论文与资料 →</Link><Link href="/sasi/drama" className="rounded-full border border-[var(--lx-line)] px-4 py-2">制作短剧 →</Link><Link href="/sasi/connections" className="rounded-full border border-[var(--lx-line)] px-4 py-2 text-[var(--lx-faint)]">可选增强能力 →</Link></div>
 </section>;
}
