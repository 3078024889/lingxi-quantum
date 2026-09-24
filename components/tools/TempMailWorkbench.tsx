"use client";
import {useEffect,useMemo,useRef,useState} from "react";
import {useLingxiLang} from "@/lib/lingxi-i18n";
import {privacyText} from "@/lib/privacy-tools-i18n";

type Box={id:string;address:string;token:string;expiresAt:string};
type Msg={id:string;sender:string;subject:string;text_body:string;received_at:string;size_bytes:number};

function extractCode(subject:string,body:string){
 const s=`${subject}\n${body}`;
 const candidates=[...s.matchAll(/(?:^|\D)(\d{4,8})(?!\d)/g)].map(x=>x[1]);
 return candidates[0]||"";
}

export default function TempMailWorkbench(){
 const{lang}=useLingxiLang();const t=(k:string)=>privacyText(lang,k);
 const[box,setBox]=useState<Box|null>(null),[messages,setMessages]=useState<Msg[]>([]),[error,setError]=useState(""),[busy,setBusy]=useState(false),[now,setNow]=useState(Date.now()),[copied,setCopied]=useState(false),[codeCopied,setCodeCopied]=useState("");
 const poll=useRef<ReturnType<typeof setInterval>|null>(null);
 const remaining=useMemo(()=>box?Math.max(0,new Date(box.expiresAt).getTime()-now):0,[box,now]);
 const mm=String(Math.floor(remaining/60000)).padStart(2,"0"),ss=String(Math.floor((remaining%60000)/1000)).padStart(2,"0");

 async function refresh(current=box){
  if(!current)return;
  const r=await fetch(`/api/tools/temp-mail/inbox?id=${encodeURIComponent(current.id)}`,{headers:{"x-mailbox-token":current.token},cache:"no-store"});
  const d=await r.json().catch(()=>({}));
  if(!r.ok)throw new Error(d.error||"INBOX_READ_FAILED");
  setMessages(d.messages||[]);
  if(d.expiresAt)setBox({...current,expiresAt:d.expiresAt});
 }
 async function create(){
  setBusy(true);setError("");
  try{
   const r=await fetch("/api/tools/temp-mail/create",{method:"POST"});
   const d=await r.json().catch(()=>({}));
   if(!r.ok)throw new Error(d.error==="TEMP_MAIL_NOT_CONFIGURED"?t("unavailable"):(d.error||"CREATE_FAILED"));
   const next={id:d.id,address:d.address,token:d.token,expiresAt:d.expiresAt};
   setBox(next);setMessages([]);localStorage.setItem("lingxifield:temp-mail",JSON.stringify(next));
  }catch(e){setError(e instanceof Error?e.message:String(e))}finally{setBusy(false)}
 }
 async function extend(){
  if(!box)return;setBusy(true);setError("");
  try{
   const r=await fetch("/api/tools/temp-mail/extend",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({id:box.id,token:box.token})});
   const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||"EXTEND_FAILED");
   const next={...box,expiresAt:d.expiresAt};setBox(next);localStorage.setItem("lingxifield:temp-mail",JSON.stringify(next));
  }catch(e){setError(e instanceof Error?e.message:String(e))}finally{setBusy(false)}
 }
 async function destroy(){
  if(box)await fetch("/api/tools/temp-mail/destroy",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({id:box.id,token:box.token})}).catch(()=>{});
  localStorage.removeItem("lingxifield:temp-mail");setBox(null);setMessages([]);setError("");
 }
 async function copyAddress(){if(!box)return;await navigator.clipboard.writeText(box.address);setCopied(true);setTimeout(()=>setCopied(false),1500)}
 async function copyCode(code:string){await navigator.clipboard.writeText(code);setCodeCopied(code);setTimeout(()=>setCodeCopied(""),1500)}

 useEffect(()=>{try{const raw=localStorage.getItem("lingxifield:temp-mail");if(raw){const x=JSON.parse(raw) as Box;if(new Date(x.expiresAt).getTime()>Date.now())setBox(x);else localStorage.removeItem("lingxifield:temp-mail")}}catch{}},[]);
 useEffect(()=>{const tick=setInterval(()=>setNow(Date.now()),1000);if(box){void refresh(box).catch(()=>{});poll.current=setInterval(()=>void refresh(box).catch(()=>{}),5000)}return()=>{clearInterval(tick);if(poll.current)clearInterval(poll.current)}},[box?.id]);
 useEffect(()=>{if(box&&remaining===0)void destroy()},[remaining]);

 return <div className="mx-auto max-w-3xl space-y-5">
  <section className="rounded-3xl border border-slate-200 bg-white p-6">
   <h1 className="text-3xl font-semibold text-slate-950">{t("tempTitle")}</h1>
   <p className="mt-2 text-sm leading-6 text-slate-600">{t("tempLead")}</p>
  </section>

  {!box?
   <section className="rounded-3xl border border-slate-200 bg-white p-6">
    <p className="mb-4 text-sm text-slate-600">{t("tempStart")}</p>
    <button onClick={create} disabled={busy} style={{background:"#111827",color:"#fff"}} className="rounded-full px-5 py-3 text-sm font-medium disabled:opacity-50">{busy?t("tempGening"):t("tempGen")}</button>
    {error&&<p className="mt-3 text-sm text-rose-600">{error}</p>}
   </section>
   :
   <>
    <section className="rounded-3xl border border-slate-200 bg-white p-6">
     <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0 flex-1">
       <div className="text-xs text-slate-500">{t("addr")}</div>
       <div className="mt-1 break-all text-xl font-semibold text-slate-950">{box.address}</div>
      </div>
      <div className="text-right">
       <div className="text-xs text-slate-500">{t("expires")}</div>
       <div className="mt-1 rounded-full bg-slate-100 px-4 py-2 font-mono text-lg text-slate-900">{mm}:{ss}</div>
      </div>
     </div>
     <div className="mt-5 flex flex-wrap gap-2">
      <button onClick={()=>void copyAddress()} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-800">{copied?t("copied"):t("copyMail")}</button>
      <button onClick={()=>void refresh().catch(e=>setError(String(e)))} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-800">{t("refresh")}</button>
      <button onClick={extend} disabled={busy} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-800">{t("extend")}</button>
      <button onClick={destroy} className="rounded-full border border-rose-200 bg-white px-4 py-2 text-sm text-rose-600">{t("destroy")}</button>
     </div>
     {error&&<p className="mt-3 text-sm text-rose-600">{error}</p>}
    </section>

    <section className="rounded-3xl border border-slate-200 bg-white p-6">
     <div className="flex items-center justify-between gap-3">
      <h2 className="text-lg font-semibold text-slate-950">{t("inbox")}</h2>
      <span className="text-xs text-slate-400">{messages.length} {t("messages")} · {t("auto")}</span>
     </div>
     {!messages.length?<p className="mt-5 text-sm text-slate-500">{t("waiting")}</p>:
      <div className="mt-4 space-y-3">{messages.map(m=>{
       const code=extractCode(m.subject,m.text_body);
       return <details key={m.id} className="rounded-2xl border border-slate-200 p-4">
        <summary className="cursor-pointer list-none">
         <div className="flex items-start justify-between gap-3">
          <div className="min-w-0"><b className="block truncate text-slate-900">{m.subject||"—"}</b><span className="mt-1 block truncate text-xs text-slate-400">{m.sender}</span></div>
          <time className="shrink-0 text-xs text-slate-400">{new Date(m.received_at).toLocaleTimeString(lang==="zh"?"zh-CN":lang,{hour:"2-digit",minute:"2-digit"})}</time>
         </div>
        </summary>
        {code&&<div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-3"><div><span className="block text-xs text-slate-500">{t("code")}</span><b className="mt-1 block font-mono text-2xl tracking-[.15em] text-slate-950">{code}</b></div><button onClick={()=>void copyCode(code)} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm">{codeCopied===code?t("copied"):t("copyCode")}</button></div>}
        <pre className="mt-4 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">{m.text_body||"—"}</pre>
       </details>
      })}</div>}
    </section>
   </>
  }
 </div>
}
