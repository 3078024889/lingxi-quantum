"use client";
import { useEffect,useMemo,useRef,useState } from "react";

type Box={id:string;address:string;token:string;expiresAt:string};
type Msg={id:string;sender:string;subject:string;text_body:string;received_at:string;size_bytes:number};

export default function TempMailWorkbench(){
  const [box,setBox]=useState<Box|null>(null),[messages,setMessages]=useState<Msg[]>([]);
  const [error,setError]=useState(""),[busy,setBusy]=useState(false),[now,setNow]=useState(Date.now());
  const poll=useRef<ReturnType<typeof setInterval>|null>(null);
  const remaining=useMemo(()=>box?Math.max(0,new Date(box.expiresAt).getTime()-now):0,[box,now]);
  const mm=String(Math.floor(remaining/60000)).padStart(2,"0"),ss=String(Math.floor((remaining%60000)/1000)).padStart(2,"0");

  async function refresh(current=box){
    if(!current)return;
    const r=await fetch(`/api/tools/temp-mail/inbox?id=${encodeURIComponent(current.id)}`,{headers:{"x-mailbox-token":current.token},cache:"no-store"});
    const d=await r.json();if(!r.ok)throw new Error(d.error||"读取收件箱失败");
    setMessages(d.messages||[]);if(d.expiresAt)setBox({...current,expiresAt:d.expiresAt});
  }
  async function create(){
    setBusy(true);setError("");
    try{
      const r=await fetch("/api/tools/temp-mail/create",{method:"POST"});
      const d=await r.json();if(!r.ok)throw new Error(d.error==="TEMP_MAIL_NOT_CONFIGURED"?"临时邮箱基础设施正在配置中。":(d.error||"创建失败"));
      const next={id:d.id,address:d.address,token:d.token,expiresAt:d.expiresAt};setBox(next);setMessages([]);
      localStorage.setItem("lingxifield:temp-mail",JSON.stringify(next));
    }catch(e){setError(e instanceof Error?e.message:String(e))}finally{setBusy(false)}
  }
  async function extend(){
    if(!box)return;setBusy(true);
    try{
      const r=await fetch("/api/tools/temp-mail/extend",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({id:box.id,token:box.token})});
      const d=await r.json();if(!r.ok)throw new Error(d.error||"延长失败");
      const next={...box,expiresAt:d.expiresAt};setBox(next);localStorage.setItem("lingxifield:temp-mail",JSON.stringify(next));
    }catch(e){setError(e instanceof Error?e.message:String(e))}finally{setBusy(false)}
  }
  async function destroy(){
    if(box)await fetch("/api/tools/temp-mail/destroy",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({id:box.id,token:box.token})}).catch(()=>{});
    localStorage.removeItem("lingxifield:temp-mail");setBox(null);setMessages([]);
  }
  useEffect(()=>{
    try{const raw=localStorage.getItem("lingxifield:temp-mail");if(raw){const x=JSON.parse(raw) as Box;if(new Date(x.expiresAt).getTime()>Date.now())setBox(x);else localStorage.removeItem("lingxifield:temp-mail")}}catch{}
  },[]);
  useEffect(()=>{
    const tick=setInterval(()=>setNow(Date.now()),1000);
    if(box){void refresh(box).catch(()=>{});poll.current=setInterval(()=>void refresh(box).catch(()=>{}),5000)}
    return()=>{clearInterval(tick);if(poll.current)clearInterval(poll.current)}
  },[box?.id]);
  useEffect(()=>{if(box&&remaining===0)void destroy()},[remaining]);

  return <div className="mx-auto max-w-3xl space-y-5">
    <div className="rounded-3xl border border-slate-200 bg-white p-6">
      <p className="text-xs font-semibold uppercase tracking-[.18em] text-slate-400">LINGXIFIELD PRIVACY</p>
      <h1 className="mt-2 text-3xl font-semibold text-slate-950">10分钟临时邮箱</h1>
      <p className="mt-2 text-sm leading-6 text-slate-600">用于临时接收验证码、注册确认和一次性邮件。邮箱从创建开始计时；到期后地址和收件内容一起销毁。第一版只收信，不提供匿名外发。</p>
    </div>
    {!box?<div className="rounded-3xl border border-slate-200 bg-white p-6"><button onClick={create} disabled={busy} className="rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white disabled:opacity-50">{busy?"正在创建…":"生成临时邮箱"}</button></div>:
    <>
      <div className="rounded-3xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div><div className="text-xs text-slate-400">当前地址</div><div className="mt-1 break-all text-xl font-semibold">{box.address}</div></div>
          <div className="rounded-full bg-slate-100 px-4 py-2 font-mono text-lg">{mm}:{ss}</div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <button onClick={()=>navigator.clipboard.writeText(box.address)} className="rounded-full border border-slate-200 px-4 py-2 text-sm">复制地址</button>
          <button onClick={()=>void refresh().catch(e=>setError(String(e)))} className="rounded-full border border-slate-200 px-4 py-2 text-sm">刷新收件箱</button>
          <button onClick={extend} disabled={busy} className="rounded-full border border-slate-200 px-4 py-2 text-sm">+10 分钟</button>
          <button onClick={destroy} className="rounded-full border border-rose-200 px-4 py-2 text-sm text-rose-600">立即销毁</button>
        </div>
      </div>
      <div className="rounded-3xl border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between"><h2 className="text-lg font-semibold">收件箱</h2><span className="text-xs text-slate-400">每 5 秒自动刷新</span></div>
        {!messages.length?<p className="mt-5 text-sm text-slate-500">还没有邮件。把上面的临时地址填到需要收信的网站即可。</p>:
        <div className="mt-4 space-y-3">{messages.map(m=><details key={m.id} className="rounded-2xl border border-slate-200 p-4"><summary className="cursor-pointer"><b>{m.subject||"(无主题)"}</b><span className="ml-2 text-xs text-slate-400">{m.sender}</span></summary><pre className="mt-4 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">{m.text_body||"（无纯文本正文）"}</pre></details>)}</div>}
      </div>
    </>}
    {error&&<p className="text-sm text-rose-600">{error}</p>}
  </div>;
}
