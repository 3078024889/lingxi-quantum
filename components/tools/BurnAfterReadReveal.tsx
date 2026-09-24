"use client";
import {useEffect,useState} from "react";
import {useLingxiLang} from "@/lib/lingxi-i18n";
import {privacyText} from "@/lib/privacy-tools-i18n";
function bytes(s:string){s=s.replace(/-/g,"+").replace(/_/g,"/");while(s.length%4)s+="=";const b=atob(s);return Uint8Array.from(b,c=>c.charCodeAt(0))}
type Item={id:string;name:string;size:number;type:string;url:string};

export default function BurnAfterReadReveal({id}:{id:string}){
 const{lang}=useLingxiLang();const t=(k:string)=>privacyText(lang,k);
 const[value,setValue]=useState(""),[files,setFiles]=useState<Item[]>([]),[status,setStatus]=useState<"idle"|"busy"|"shown"|"gone"|"error">("idle"),[seconds,setSeconds]=useState<number|null>(null);
 async function reveal(){
  const keyPart=new URLSearchParams(location.hash.slice(1)).get("k");if(!keyPart){setStatus("error");return}
  setStatus("busy");
  try{
   const r=await fetch("/api/tools/burn-after-read/consume",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({id})});
   const d=await r.json().catch(()=>({}));if(r.status===410){setStatus("gone");return}if(!r.ok)throw new Error();
   const key=await crypto.subtle.importKey("raw",bytes(keyPart),{name:"AES-GCM"},false,["decrypt"]);
   const plain=await crypto.subtle.decrypt({name:"AES-GCM",iv:bytes(d.iv)},key,bytes(d.ciphertext));
   setValue(new TextDecoder().decode(plain));setFiles(d.files||[]);setSeconds(d.view_duration_seconds??null);
   history.replaceState({},document.title,location.pathname);setStatus("shown");
  }catch{setStatus("error")}
 }
 useEffect(()=>{if(status!=="shown"||seconds==null)return;if(seconds<=0){setValue("");setFiles([]);setStatus("gone");return}const x=setTimeout(()=>setSeconds(v=>v==null?null:v-1),1000);return()=>clearTimeout(x)},[status,seconds]);
 return <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-6">
  <h1 className="text-2xl font-semibold text-slate-950">{t("recipient")}</h1>
  {status==="idle"&&<><p className="mt-3 text-sm leading-6 text-slate-600">{t("recipientD")}</p><button onClick={reveal} style={{background:"#111827",color:"#fff"}} className="mt-5 rounded-full px-5 py-3 text-sm font-medium">{t("open")}</button></>}
  {status==="busy"&&<p className="mt-5 text-sm text-slate-500">{t("opening")}</p>}
  {status==="shown"&&<div className="mt-5 space-y-4">
   {seconds!=null&&<div className="text-sm font-semibold text-rose-600">{seconds}s · {t("left")}</div>}
   {value&&<div className="rounded-2xl bg-slate-50 p-5"><pre className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-900">{value}</pre></div>}
   {!!files.length&&<div className="rounded-2xl border border-slate-200 p-4"><b className="text-sm text-slate-900">{t("files")}</b><div className="mt-3 space-y-2">{files.map(f=><a key={f.id} href={f.url} download={f.name} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-3 text-sm"><span className="truncate">{f.name}</span><span className="shrink-0 text-slate-500">{t("download")} · {(f.size/1024/1024).toFixed(1)} MB</span></a>)}</div></div>}
  </div>}
  {status==="gone"&&<p className="mt-5 text-sm text-slate-500">{t("gone")}</p>}
  {status==="error"&&<p className="mt-5 text-sm text-rose-600">{t("openErr")}</p>}
 </div>;
}
