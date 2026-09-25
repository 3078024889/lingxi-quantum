"use client";
import {useEffect,useRef,useState} from "react";
import {useLingxiLang} from "@/lib/lingxi-i18n";
import {privacyText} from "@/lib/privacy-tools-i18n";
function bytes(s:string){s=s.replace(/-/g,"+").replace(/_/g,"/");while(s.length%4)s+="=";const b=atob(s);return Uint8Array.from(b,c=>c.charCodeAt(0))}
type Item={id:string;name:string;size:number;type:string;url:string};

export default function BurnAfterReadReveal({id}:{id:string}){
 const{lang}=useLingxiLang();const t=(k:string)=>privacyText(lang,k);
 const[value,setValue]=useState(""),[files,setFiles]=useState<Item[]>([]),[status,setStatus]=useState<"idle"|"busy"|"shown"|"gone"|"missing"|"blocked"|"error">("idle"),[seconds,setSeconds]=useState<number|null>(null);
 const committed=useRef(false);

 async function reveal(){
  const parts=new URLSearchParams(location.hash.slice(1));
  const keyPart=parts.get("k"),revealToken=parts.get("t");
  if(!keyPart){setStatus("missing");return}
  setStatus("busy");
  try{
   // Phase 1: preview only. This MUST NOT consume a view.
   const r=await fetch("/api/tools/burn-after-read/consume",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({id,revealToken})});
   const d=await r.json().catch(()=>({}));
   if(r.status===410){setStatus("gone");return}
   if(r.status===403){setStatus("blocked");return}
   if(!r.ok)throw new Error("PREVIEW_FAILED");

   // Decrypt locally first. A failed decrypt/browser interruption must never destroy the note.
   const key=await crypto.subtle.importKey("raw",bytes(keyPart),{name:"AES-GCM"},false,["decrypt"]);
   const plain=await crypto.subtle.decrypt({name:"AES-GCM",iv:bytes(d.iv)},key,bytes(d.ciphertext));
   const decoded=new TextDecoder().decode(plain);

   // Phase 2: only after successful local decrypt do we count the view.
   const ack=await fetch("/api/tools/burn-after-read/ack",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({id,revealToken})});
   const a=await ack.json().catch(()=>({}));
   if(ack.status===410){setStatus("gone");return}
   if(ack.status===403){setStatus("blocked");return}
   if(!ack.ok)throw new Error(a.error||"COMMIT_FAILED");

   committed.current=true;
   setValue(decoded);setFiles(d.files||[]);setSeconds(d.view_duration_seconds??null);
   // Keep fragment while viewing: embedded browsers can reload on hash/history changes.
   setStatus("shown");
  }catch{
   // If decrypt or commit fails, the preview route has not consumed the note.
   setStatus("error");
  }
 }

 useEffect(()=>{if(status!=="shown"||seconds==null)return;if(seconds<=0){setValue("");setFiles([]);setStatus("gone");return}const x=setTimeout(()=>setSeconds(v=>v==null?null:v-1),1000);return()=>clearTimeout(x)},[status,seconds]);

 return <div className="mx-auto max-w-2xl rounded-3xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-6">
  <h1 className="text-2xl font-semibold text-[var(--lx-ink)]">{t("recipient")}</h1>
  {status==="idle"&&<><p className="mt-3 text-sm leading-6 text-[var(--lx-muted)]">{t("recipientD")}</p><button onClick={reveal} className="mt-5 rounded-full bg-[var(--lx-ink)] px-5 py-3 text-sm font-medium text-[var(--lx-bg)]">{t("open")}</button></>}
  {status==="busy"&&<p className="mt-5 text-sm text-[var(--lx-muted)]">{t("opening")}</p>}
  {status==="shown"&&<div className="mt-5 space-y-4">
   {seconds!=null&&<div className="text-sm font-semibold text-[var(--lx-danger)]">{seconds}s · {t("left")}</div>}
   {value&&<div className="rounded-2xl bg-[var(--lx-soft)] p-5"><pre className="whitespace-pre-wrap break-words text-sm leading-6 text-[var(--lx-ink)]">{value}</pre></div>}
   {!!files.length&&<div className="rounded-2xl border border-[var(--lx-line)] p-4"><b className="text-sm text-[var(--lx-ink)]">{t("files")}</b><div className="mt-3 space-y-2">{files.map(f=><a key={f.id} href={f.url} download={f.name} className="flex items-center justify-between gap-3 rounded-xl bg-[var(--lx-soft)] px-4 py-3 text-sm text-[var(--lx-ink)]"><span className="truncate">{f.name}</span><span className="shrink-0 text-[var(--lx-faint)]">{t("download")} · {(f.size/1024/1024).toFixed(1)} MB</span></a>)}</div></div>}
  </div>}
  {status==="gone"&&<p className="mt-5 text-sm text-[var(--lx-muted)]">{t("gone")}</p>}
  {status==="missing"&&<p className="mt-5 text-sm text-[var(--lx-danger)]">{t("openMissing")}</p>}
  {status==="blocked"&&<p className="mt-5 text-sm text-[var(--lx-danger)]">{t("openBlocked")}</p>}
  {status==="error"&&<p className="mt-5 text-sm text-[var(--lx-danger)]">{t("openErr")}</p>}
 </div>;
}
