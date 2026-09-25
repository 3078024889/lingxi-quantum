"use client";
import {useEffect,useMemo,useRef,useState} from "react";
import Link from "next/link";
import {useLingxiLang} from "@/lib/lingxi-i18n";
import {tempMailText} from "@/lib/temp-mail-i18n";
import LingxiMiniIcon from "@/components/LingxiMiniIcon";

type Box={id:string;address:string;expiresAt:string};
type Msg={id:string;sender:string;subject:string;text_body:string;received_at:string;size_bytes:number};
type OwnedBox=Box&{sourceKind?:string;messageCount:number;latestSender:string;latestSubject:string;latestAt:string;latestCode:string};

async function copyText(value:string){try{await navigator.clipboard.writeText(value);return}catch{const area=document.createElement("textarea");area.value=value;area.style.position="fixed";area.style.opacity="0";document.body.appendChild(area);area.focus();area.select();document.execCommand("copy");area.remove();}}

function extractCode(subject:string,body:string){
 return [...`${subject}\n${body}`.matchAll(/(?:^|\D)(\d{4,8})(?!\d)/g)].map(x=>x[1])[0]||"";
}

export default function TempMailWorkbench(){
 const{lang}=useLingxiLang();
 const t=(key:Parameters<typeof tempMailText>[1],vars:Record<string,string|number>={})=>tempMailText(lang,key,vars);
 const[box,setBox]=useState<Box|null>(null);
 const[messages,setMessages]=useState<Msg[]>([]);
 const[owned,setOwned]=useState<OwnedBox[]>([]);
 const[error,setError]=useState("");
 const[busy,setBusy]=useState(false);
 const[restoring,setRestoring]=useState(true);
 const[now,setNow]=useState(Date.now());
 const[copied,setCopied]=useState("");
 const[freeRemaining,setFreeRemaining]=useState<number|null>(null);
 const[batchCount,setBatchCount]=useState(50);
 const[batchBusy,setBatchBusy]=useState(false);
 const[pendingQuote,setPendingQuote]=useState("");
 const poll=useRef<ReturnType<typeof setInterval>|null>(null);

 const remaining=useMemo(()=>box?Math.max(0,new Date(box.expiresAt).getTime()-now):0,[box,now]);
 const price=(batchCount*0.05).toFixed(2);
 const mm=String(Math.floor(remaining/60000)).padStart(2,"0");
 const ss=String(Math.floor((remaining%60000)/1000)).padStart(2,"0");

 function friendly(code:string){
  const map:Record<string,Parameters<typeof tempMailText>[1]>={
   SERVICE_BUSY:"serviceBusy",TOO_MANY_REQUESTS:"tooMany",FREE_DAILY_LIMIT_REACHED:"freeLimit",
   SIGN_IN_REQUIRED:"signInRequired",PAID_BATCH_REQUIRED:"paidBatchRequired",BATCH_ALREADY_USED:"batchAlreadyUsed",
   BATCH_SIZE_INVALID:"batchSizeInvalid",BATCH_CREATE_FAILED:"batchCreateFailed",CREATE_FAILED:"createFailed",
  };
  return t(map[code]||"serviceBusy");
 }

 async function refresh(current=box){
  if(!current)return;
  const r=await fetch(`/api/tools/temp-mail/inbox?id=${encodeURIComponent(current.id)}`,{cache:"no-store"});
  const d=await r.json().catch(()=>({}));
  if(!r.ok)throw new Error(d.error||"INBOX_READ_FAILED");
  if(d.expired){setBox(null);setMessages([]);return}
  setMessages(d.messages||[]);
  if(d.expiresAt)setBox({...current,expiresAt:d.expiresAt});
 }

 async function loadOwned(){
  const r=await fetch("/api/tools/temp-mail/mine",{cache:"no-store"});
  if(r.status===401){setOwned([]);return}
  const d=await r.json().catch(()=>({}));
  if(r.ok)setOwned(d.mailboxes||[]);
 }

 async function recover(){
  setRestoring(true);
  try{
   const r=await fetch("/api/tools/temp-mail/recover",{cache:"no-store"});
   const d=await r.json().catch(()=>({}));
   if(r.ok&&d.box){
     setBox(d.box);
     localStorage.setItem("lingxifield:temp-mail",JSON.stringify(d.box));
     await refresh(d.box).catch(()=>{});
   }else{
     const raw=localStorage.getItem("lingxifield:temp-mail");
     if(raw){
       const saved=JSON.parse(raw) as Box;
       if(saved?.id&&new Date(saved.expiresAt).getTime()>Date.now()){
         setBox(saved);
         await refresh(saved).catch(()=>{});
       }else localStorage.removeItem("lingxifield:temp-mail");
     }
   }
   await loadOwned();
  }finally{setRestoring(false)}
 }

 async function create(){
  setBusy(true);setError("");
  try{
   const r=await fetch("/api/tools/temp-mail/create",{method:"POST"});
   const d=await r.json().catch(()=>({}));
   if(!r.ok)throw new Error(d.error||"CREATE_FAILED");
   const next={id:d.id,address:d.address,expiresAt:d.expiresAt};
   setBox(next);setMessages([]);setFreeRemaining(Number(d.freeRemaining));
   localStorage.setItem("lingxifield:temp-mail",JSON.stringify(next));
   await loadOwned();
  }catch(e){setError(friendly(e instanceof Error?e.message:String(e)))}finally{setBusy(false)}
 }

 async function extend(){
  if(!box)return;setBusy(true);setError("");
  try{
   const r=await fetch("/api/tools/temp-mail/extend",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({id:box.id})});
   const d=await r.json().catch(()=>({}));
   if(!r.ok)throw new Error(d.error||"EXTEND_FAILED");
   const next={...box,expiresAt:d.expiresAt};setBox(next);
   localStorage.setItem("lingxifield:temp-mail",JSON.stringify(next));await loadOwned();
  }catch{setError(t("extendFailed"))}finally{setBusy(false)}
 }

 async function destroy(target=box){
  try{
  if(!target)return;
  const response=await fetch("/api/tools/temp-mail/destroy",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({id:target.id})});
   if(!response.ok)throw new Error("TEMP_MAIL_DESTROY_FAILED");
  if(box?.id===target.id){localStorage.removeItem("lingxifield:temp-mail");setBox(null);setMessages([])}
  setOwned(v=>v.filter(x=>x.id!==target.id));setError("");

  }catch{setError(lang==="zh"?"暂时无法销毁，请稍后再试。":"Unable to destroy this inbox right now.");}
}

 async function copy(value:string,key:string){await navigator.clipboard.writeText(value);setCopied(key);setTimeout(()=>setCopied(""),1400)}

 async function openOwned(item:OwnedBox){
  const next={id:item.id,address:item.address,expiresAt:item.expiresAt};
  setBox(next);setMessages([]);localStorage.setItem("lingxifield:temp-mail",JSON.stringify(next));
  await refresh(next).catch(()=>setError(t("refreshFailed")));
  window.scrollTo({top:0,behavior:"smooth"});
 }

 async function startBatchPayment(){
  setBatchBusy(true);setError("");
  try{
   const r=await fetch("/api/tools/quote",{method:"POST",headers:{"content-type":"application/json"},
     body:JSON.stringify({toolId:"temp-mail-batch",quantity:batchCount,metadata:{source:"temp-mail",count:batchCount}})});
   const d=await r.json().catch(()=>({}));
   if(r.status===401){location.href=`/account?next=${encodeURIComponent("/tools/temp-mail")}`;return}
   if(!r.ok)throw new Error(d.error||"QUOTE_FAILED");
   setPendingQuote(d.id);sessionStorage.setItem("lingxifield:temp-mail-batch-quote",d.id);
   const payUrl=`/tools/pay?quoteId=${encodeURIComponent(d.id)}`;
   const w=window.open(payUrl,"lingxi-pay","width=620,height=820");if(!w)location.href=payUrl;
  }catch{setError(t("paymentFailed"))}finally{setBatchBusy(false)}
 }

 async function createPaidBatch(quoteId:string){
  setBatchBusy(true);setError("");
  try{
   const r=await fetch("/api/tools/temp-mail/batch",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({count:batchCount,quoteId})});
   const d=await r.json().catch(()=>({}));
   if(!r.ok)throw new Error(d.error||"BATCH_CREATE_FAILED");
   setPendingQuote("");sessionStorage.removeItem("lingxifield:temp-mail-batch-quote");
   await loadOwned();
   const first=(d.mailboxes||[])[0] as Box|undefined;if(first)await openOwned({...first,messageCount:0,latestSender:"",latestSubject:"",latestAt:"",latestCode:""});
  }catch(e){setError(friendly(e instanceof Error?e.message:String(e)))}finally{setBatchBusy(false)}
 }

 function exportCsv(){
  const csv="email,expires_at,messages\n"+owned.map(x=>`${x.address},${x.expiresAt},${x.messageCount}`).join("\n");
  const u=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"})),a=document.createElement("a");
  a.href=u;a.download="lingxifield-temp-mail.csv";a.click();setTimeout(()=>URL.revokeObjectURL(u),500);
 }

 useEffect(()=>{void recover();setPendingQuote(sessionStorage.getItem("lingxifield:temp-mail-batch-quote")||"")},[]);
 useEffect(()=>{
  const tick=setInterval(()=>setNow(Date.now()),1000);
  if(box){void refresh(box).catch(()=>{});poll.current=setInterval(()=>void refresh(box).catch(()=>{}),5000)}
  return()=>{clearInterval(tick);if(poll.current)clearInterval(poll.current)}
 },[box?.id]);
 useEffect(()=>{if(box&&remaining===0){localStorage.removeItem("lingxifield:temp-mail");setBox(null);setMessages([]);void loadOwned()}},[remaining]);
 useEffect(()=>{
  const h=(e:MessageEvent)=>{const d=e.data as {type?:string;quoteId?:string};if(e.origin===location.origin&&d?.type==="LINGXIFIELD_TOOL_PAYMENT_CONFIRMED"&&d.quoteId===pendingQuote)void createPaidBatch(d.quoteId)};
  window.addEventListener("message",h);return()=>window.removeEventListener("message",h);
 },[pendingQuote,batchCount]);

 return <div className="mx-auto max-w-5xl space-y-5">
  <Link href="/tools" className="lx-tool-back">← {lang==="zh"?"返回实用工具":"Back to tools"}</Link>

  <section className="rounded-3xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-6">
   <div className="lx-special-tool-title"><LingxiMiniIcon name="mail" size="title"/><h1 className="text-3xl font-semibold text-[var(--lx-ink)]">{t("title")}</h1></div>
   <p className="mt-2 text-sm leading-6 text-[var(--lx-muted)]">{t("lead")}</p>
   <p className="mt-3 text-sm leading-6 text-[var(--lx-muted)]">{t("usageHint")}</p>
  </section>

  {restoring?
   <section className="rounded-3xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-6 text-sm text-[var(--lx-muted)]">{t("restoring")}</section>
  :!box?
   <section className="rounded-3xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-6">
    <div className="flex flex-wrap items-center justify-between gap-4">
     <div><p className="text-sm text-[var(--lx-muted)]">{t("start")}</p><p className="mt-2 text-xs text-[var(--lx-faint)]">{t("freeDaily")}</p></div>
     <button onClick={create} disabled={busy} className="rounded-full bg-[var(--lx-ink)] px-5 py-3 text-sm font-medium text-[var(--lx-bg)] disabled:opacity-50">{busy?t("generating"):t("generate")}</button>
    </div>
    {freeRemaining!=null&&<p className="mt-3 text-xs text-[var(--lx-muted)]">{t("freeLeft",{count:freeRemaining})}</p>}
    {error&&<p className="mt-3 text-sm text-rose-600">{error}</p>}
   </section>
  :
   <>
    <section className="rounded-3xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-6">
     <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0 flex-1"><div className="text-xs text-[var(--lx-muted)]">{t("address")}</div><div className="mt-1 break-all text-xl font-semibold text-[var(--lx-ink)]">{box.address}</div></div>
      <div className="text-right"><div className="text-xs text-[var(--lx-muted)]">{t("expires")}</div><div className="mt-1 rounded-full bg-[var(--lx-soft)] px-4 py-2 font-mono text-lg text-[var(--lx-ink)]">{mm}:{ss}</div></div>
     </div>
     <div className="mt-5 flex flex-wrap gap-2">
      <button onClick={()=>void copy(box.address,"address")} className="rounded-full border border-[var(--lx-line)] px-4 py-2 text-sm">{copied==="address"?t("copied"):t("copyEmail")}</button>
      <button onClick={()=>void refresh().catch(()=>setError(t("refreshFailed")))} className="rounded-full border border-[var(--lx-line)] px-4 py-2 text-sm">{t("refresh")}</button>
      <button onClick={extend} disabled={busy} className="rounded-full border border-[var(--lx-line)] px-4 py-2 text-sm">{t("extend")}</button>
      <button onClick={()=>void destroy()} className="rounded-full border border-rose-300 px-4 py-2 text-sm text-rose-600">{t("destroy")}</button>
     </div>
    </section>

    <section className="rounded-3xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-6">
     <div className="flex items-center justify-between gap-3"><h2 className="text-lg font-semibold text-[var(--lx-ink)]">{t("inbox")}</h2><span className="text-xs text-[var(--lx-faint)]">{messages.length} {t("messages")} · {t("autoRefresh")}</span></div>
     {!messages.length?<p className="mt-5 text-sm text-[var(--lx-muted)]">{t("waiting")}</p>:
      <div className="mt-4 space-y-3">{messages.map(m=>{const code=extractCode(m.subject,m.text_body);return <details key={m.id} className="rounded-2xl border border-[var(--lx-line)] p-4">
       <summary className="cursor-pointer list-none"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><b className="block truncate text-[var(--lx-ink)]">{m.subject||"—"}</b><span className="mt-1 block truncate text-xs text-[var(--lx-faint)]">{m.sender}</span></div><time className="shrink-0 text-xs text-[var(--lx-faint)]">{new Date(m.received_at).toLocaleTimeString(lang,{hour:"2-digit",minute:"2-digit"})}</time></div></summary>
       {code&&<div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-[var(--lx-soft)] px-4 py-3"><div><span className="block text-xs text-[var(--lx-muted)]">{t("code")}</span><b className="mt-1 block font-mono text-2xl tracking-[.15em] text-[var(--lx-ink)]">{code}</b></div><button onClick={()=>void copy(code,`code-${m.id}`)} className="rounded-full border border-[var(--lx-line)] bg-[var(--lx-panel)] px-4 py-2 text-sm">{copied===`code-${m.id}`?t("copied"):t("copyCode")}</button></div>}
       <pre className="mt-4 whitespace-pre-wrap break-words text-sm leading-6 text-[var(--lx-muted)]">{m.text_body||"—"}</pre>
      </details>})}</div>}
    </section>
   </>
  }

  <section className="rounded-3xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-6">
   <div className="flex flex-wrap items-end justify-between gap-4">
    <div><h2 className="text-lg font-semibold text-[var(--lx-ink)]">{t("myMailboxes")}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--lx-muted)]">{t("myMailboxesLead")}</p></div>
    <button onClick={()=>void loadOwned()} className="rounded-full border border-[var(--lx-line)] px-4 py-2 text-sm">{t("refreshAll")}</button>
   </div>
   {!owned.length?<p className="mt-4 text-sm text-[var(--lx-muted)]">{t("noActive")} <span className="block mt-1 text-xs">{t("signInForWorkspace")}</span></p>:
    <div className="mt-4 grid gap-3 md:grid-cols-2">{owned.map(item=><article key={item.id} className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-soft)] p-4">
     <div className="flex items-start justify-between gap-3"><div className="min-w-0"><b className="block truncate text-[var(--lx-ink)]">{item.address}</b><span className="mt-1 block text-xs text-[var(--lx-muted)]">{item.messageCount?t("hasMail",{count:item.messageCount}):t("waitingShort")}</span></div><span className="shrink-0 text-xs text-[var(--lx-faint)]">{Math.max(0,Math.ceil((new Date(item.expiresAt).getTime()-now)/60000))}m</span></div>
     {item.latestSubject&&<div className="mt-3 border-t border-[var(--lx-line)] pt-3 text-xs text-[var(--lx-muted)]"><b className="block truncate text-[var(--lx-ink)]">{item.latestSubject}</b><span className="block truncate">{item.latestSender}</span>{item.latestCode&&<span className="mt-2 inline-block rounded-full bg-[var(--lx-panel)] px-3 py-1 font-mono">{item.latestCode}</span>}</div>}
     <div className="mt-4 flex gap-2"><button onClick={()=>void openOwned(item)} className="rounded-full border border-[var(--lx-line)] px-3 py-2 text-xs">{t("openInbox")}</button><button onClick={()=>void destroy(item)} className="rounded-full border border-rose-300 px-3 py-2 text-xs text-rose-600">{t("destroy")}</button></div>
    </article>)}</div>}
  </section>

  <section className="rounded-3xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-6">
   <div className="flex flex-wrap items-end justify-between gap-4">
    <div><h2 className="text-lg font-semibold text-[var(--lx-ink)]">{t("batchTitle")}</h2><p className="mt-2 text-sm text-[var(--lx-muted)]">{t("batchLead")}</p><p className="mt-1 text-xs text-[var(--lx-faint)]">{t("paidAfterFree")}</p></div>
    <div className="flex items-center gap-2"><input type="number" min={11} max={100} value={batchCount} onChange={e=>setBatchCount(Math.max(11,Math.min(100,Number(e.target.value)||11)))} className="w-24 rounded-full border border-[var(--lx-line)] bg-[var(--lx-panel)] px-4 py-2 text-sm"/>
     <button onClick={startBatchPayment} disabled={batchBusy} className="rounded-full bg-[var(--lx-ink)] px-5 py-2.5 text-sm font-medium text-[var(--lx-bg)] disabled:opacity-50">{batchBusy?t("working"):t("generateCount",{count:batchCount,price})}</button></div>
   </div>
   <div className="mt-4 flex flex-wrap items-center gap-3"><span className="text-xs text-[var(--lx-faint)]">{t("unitPrice")}</span>{owned.length>0&&<><button onClick={()=>void copy(owned.map(x=>x.address).join("\n"),"all")} className="rounded-full border border-[var(--lx-line)] px-4 py-2 text-xs">{copied==="all"?t("copied"):t("copyAll")}</button><button onClick={exportCsv} className="rounded-full border border-[var(--lx-line)] px-4 py-2 text-xs">{t("exportCsv")}</button></>}</div>
   {error&&<p className="mt-3 text-sm text-rose-600">{error}</p>}
  </section>
 </div>;
}
