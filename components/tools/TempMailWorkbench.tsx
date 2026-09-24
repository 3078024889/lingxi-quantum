"use client";
import { useEffect,useMemo,useRef,useState } from "react";

type Box={id:string;address:string;token:string;expiresAt:string};
type Msg={id:string;sender:string;subject:string;text_body:string;received_at:string;size_bytes:number};

export default function TempMailWorkbench(){
  const[box,setBox]=useState<Box|null>(null),[messages,setMessages]=useState<Msg[]>([]);
  const[error,setError]=useState(""),[busy,setBusy]=useState(false),[now,setNow]=useState(Date.now()),[copied,setCopied]=useState(false);
  const poll=useRef<ReturnType<typeof setInterval>|null>(null);
  const remaining=useMemo(()=>box?Math.max(0,new Date(box.expiresAt).getTime()-now):0,[box,now]);
  const mm=String(Math.floor(remaining/60000)).padStart(2,"0"),ss=String(Math.floor((remaining%60000)/1000)).padStart(2,"0");

  async function refresh(current=box){
    if(!current)return;
    const r=await fetch(`/api/tools/temp-mail/inbox?id=${encodeURIComponent(current.id)}`,{headers:{"x-mailbox-token":current.token},cache:"no-store"});
    const d=await r.json().catch(()=>({}));
    if(!r.ok)throw new Error(d.error||"读取收件箱失败");
    setMessages(d.messages||[]);if(d.expiresAt)setBox({...current,expiresAt:d.expiresAt});
  }
  async function create(){
    setBusy(true);setError("");
    try{
      const r=await fetch("/api/tools/temp-mail/create",{method:"POST"});
      const d=await r.json().catch(()=>({}));
      if(!r.ok)throw new Error(d.error==="TEMP_MAIL_NOT_CONFIGURED"?"临时邮箱暂时不可用，请稍后再试。":(d.error||"创建失败"));
      const next={id:d.id,address:d.address,token:d.token,expiresAt:d.expiresAt};setBox(next);setMessages([]);
      localStorage.setItem("lingxifield:temp-mail",JSON.stringify(next));
    }catch(e){setError(e instanceof Error?e.message:String(e))}finally{setBusy(false)}
  }
  async function extend(){
    if(!box)return;setBusy(true);
    try{
      const r=await fetch("/api/tools/temp-mail/extend",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({id:box.id,token:box.token})});
      const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||"延长失败");
      const next={...box,expiresAt:d.expiresAt};setBox(next);localStorage.setItem("lingxifield:temp-mail",JSON.stringify(next));
    }catch(e){setError(e instanceof Error?e.message:String(e))}finally{setBusy(false)}
  }
  async function destroy(){
    if(box)await fetch("/api/tools/temp-mail/destroy",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({id:box.id,token:box.token})}).catch(()=>{});
    localStorage.removeItem("lingxifield:temp-mail");setBox(null);setMessages([]);
  }
  async function copyAddress(){if(!box)return;await navigator.clipboard.writeText(box.address);setCopied(true);setTimeout(()=>setCopied(false),1500)}

  useEffect(()=>{try{const raw=localStorage.getItem("lingxifield:temp-mail");if(raw){const x=JSON.parse(raw) as Box;if(new Date(x.expiresAt).getTime()>Date.now())setBox(x);else localStorage.removeItem("lingxifield:temp-mail")}}catch{}},[]);
  useEffect(()=>{const tick=setInterval(()=>setNow(Date.now()),1000);if(box){void refresh(box).catch(()=>{});poll.current=setInterval(()=>void refresh(box).catch(()=>{}),5000)}return()=>{clearInterval(tick);if(poll.current)clearInterval(poll.current)}},[box?.id]);
  useEffect(()=>{if(box&&remaining===0)void destroy()},[remaining]);

  return <div className="mx-auto max-w-3xl space-y-5">
    <div className="rounded-3xl border border-slate-200 bg-white p-6">
      <p className="text-xs font-semibold uppercase tracking-[.18em] text-slate-400">灵犀场 · 临时收件</p>
      <h1 className="mt-2 text-3xl font-semibold text-slate-950">10分钟临时邮箱</h1>
      <p className="mt-2 text-sm leading-6 text-slate-600">不想留下常用邮箱时，用它临时接收验证码、注册确认或一次性邮件。创建后有效 10 分钟，到期自动销毁，也可以手动延长。</p>
    </div>
    {!box?<div className="rounded-3xl border border-slate-200 bg-white p-6"><p className="mb-4 text-sm text-slate-600">无需注册，点击即可生成一个临时收件地址。</p><button onClick={create} disabled={busy} style={{background:"#111827",color:"#fff"}} className="rounded-full px-5 py-3 text-sm font-medium disabled:opacity-50">{busy?"正在生成…":"生成10分钟邮箱"}</button>{error&&<p className="mt-3 text-sm text-rose-600">{error}</p>}</div>:
    <><div className="rounded-3xl border border-slate-200 bg-white p-6"><div className="flex flex-wrap items-center justify-between gap-4"><div><div className="text-xs text-slate-500">把这个地址填到需要收邮件的网站</div><div className="mt-1 break-all text-xl font-semibold text-slate-950">{box.address}</div></div><div className="rounded-full bg-slate-100 px-4 py-2 font-mono text-lg text-slate-900">{mm}:{ss}</div></div><div className="mt-5 flex flex-wrap gap-2"><button onClick={()=>void copyAddress()} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-800">{copied?"已复制":"复制邮箱地址"}</button><button onClick={()=>void refresh().catch(e=>setError(String(e)))} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-800">刷新收件箱</button><button onClick={extend} disabled={busy} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-800">延长10分钟</button><button onClick={destroy} className="rounded-full border border-rose-200 bg-white px-4 py-2 text-sm text-rose-600">立即销毁</button></div>{error&&<p className="mt-3 text-sm text-rose-600">{error}</p>}</div>
    <div className="rounded-3xl border border-slate-200 bg-white p-6"><div className="flex items-center justify-between"><h2 className="text-lg font-semibold text-slate-950">收件箱</h2><span className="text-xs text-slate-400">自动刷新</span></div>{!messages.length?<p className="mt-5 text-sm text-slate-500">正在等邮件。验证码或确认邮件到达后会自动出现在这里。</p>:<div className="mt-4 space-y-3">{messages.map(m=><details key={m.id} className="rounded-2xl border border-slate-200 p-4"><summary className="cursor-pointer text-slate-900"><b>{m.subject||"(无主题)"}</b><span className="ml-2 text-xs text-slate-400">{m.sender}</span></summary><pre className="mt-4 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">{m.text_body||"（没有可显示的正文）"}</pre></details>)}</div>}</div></>}
  </div>;
}
