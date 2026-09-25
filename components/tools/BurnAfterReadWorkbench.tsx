"use client";
import {useMemo,useState} from "react";
import {useLingxiLang} from "@/lib/lingxi-i18n";
import {privacyText} from "@/lib/privacy-tools-i18n";
import Link from "next/link";
import LingxiMiniIcon from "@/components/LingxiMiniIcon";

function b64url(bytes:Uint8Array){let s="";bytes.forEach(b=>s+=String.fromCharCode(b));return btoa(s).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"")}
type Mode="once"|"timed"|"limited"|"fast";
type PreparedFile={id:string;name:string;size:number;type:string;uploadUrl:string};

export default function BurnAfterReadWorkbench(){
 const{lang}=useLingxiLang();const t=(k:string)=>privacyText(lang,k);
 const[text,setText]=useState(""),[mode,setMode]=useState<Mode>("once"),[ttl,setTtl]=useState(1440),[views,setViews]=useState(1),[duration,setDuration]=useState(30);
 const[files,setFiles]=useState<File[]>([]),[link,setLink]=useState(""),[busy,setBusy]=useState(false),[error,setError]=useState(""),[copied,setCopied]=useState(false);
 const total=useMemo(()=>files.reduce((n,f)=>n+f.size,0),[files]);
 const totalMb=Math.max(1,Math.ceil(total/1024/1024));

 async function encryptedText(){
   const key=await crypto.subtle.generateKey({name:"AES-GCM",length:256},true,["encrypt","decrypt"]);
   const rawKey=new Uint8Array(await crypto.subtle.exportKey("raw",key));
   const iv=crypto.getRandomValues(new Uint8Array(12));
   const cipher=new Uint8Array(await crypto.subtle.encrypt({name:"AES-GCM",iv},key,new TextEncoder().encode(text)));
   return {key:b64url(rawKey),iv:b64url(iv),ciphertext:b64url(cipher)};
 }

 async function createText(){
   if(!text.trim())return;
   setBusy(true);setError("");setLink("");
   try{
    const enc=await encryptedText();
    const r=await fetch("/api/tools/burn-after-read/create",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({ciphertext:enc.ciphertext,iv:enc.iv,ttlMinutes:ttl,mode,maxViews:mode==="limited"?views:1,viewDurationSeconds:mode==="fast"?duration:null})});
    const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||"CREATE_FAILED");
    if(!d.token)throw new Error("REVEAL_TOKEN_MISSING");
    setLink(`${location.origin}/tools/burn-after-read/${d.id}#k=${enc.key}&t=${encodeURIComponent(String(d.token))}`);setText("");
   }catch{setError(lang==="zh"?"暂时无法生成，请稍后再试。":"Unable to create the link right now.")}
   finally{setBusy(false)}
 }

 async function uploadPrepared(items:PreparedFile[]){
   for(let i=0;i<items.length;i++){
     const meta=items[i],file=files[i];
     const r=await fetch(meta.uploadUrl,{method:"PUT",headers:{"content-type":file.type||"application/octet-stream"},body:file});
     if(!r.ok)throw new Error("UPLOAD_FAILED");
   }
 }

 async function preparePaidShare(quoteId:string){
   const enc=await encryptedText();
   const r=await fetch("/api/tools/burn-after-read/file/prepare",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({
     quoteId,ciphertext:enc.ciphertext,iv:enc.iv,ttlMinutes:ttl,mode,maxViews:mode==="limited"?views:1,viewDurationSeconds:mode==="fast"?duration:null,
     files:files.map(f=>({name:f.name,size:f.size,type:f.type||"application/octet-stream"}))
   })});
   const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||"PREPARE_FAILED");
   await uploadPrepared(d.files||[]);
   const done=await fetch("/api/tools/burn-after-read/file/complete",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({id:d.id})});
   if(!done.ok)throw new Error("UPLOAD_INCOMPLETE");
   if(!d.token)throw new Error("REVEAL_TOKEN_MISSING");
   setLink(`${location.origin}/tools/burn-after-read/${d.id}#k=${enc.key}&t=${encodeURIComponent(String(d.token))}`);setText("");setFiles([]);
 }

 async function payAndUpload(){
   if(!files.length)return;
   setBusy(true);setError("");setLink("");
   try{
     const q=await fetch("/api/tools/quote",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({toolId:"burn-after-read-file",quantity:totalMb,metadata:{bytes:total,fileCount:files.length}})});
     const d=await q.json().catch(()=>({}));
     if(q.status===401){location.href=`/account?next=${encodeURIComponent("/tools/burn-after-read")}`;return}
     if(!q.ok)throw new Error(d.error||"QUOTE_FAILED");
     sessionStorage.setItem("lingxifield:burn-file-quote",d.id);
     sessionStorage.setItem("lingxifield:burn-file-state",JSON.stringify({text,mode,ttl,views,duration}));
     const w=window.open(`/tools/pay?quoteId=${encodeURIComponent(d.id)}`,"lingxi-pay","width=620,height=820");
     if(!w)throw new Error("POPUP_BLOCKED");
     const handler=(e:MessageEvent)=>{
       if(e.origin!==location.origin||e.data?.type!=="LINGXIFIELD_TOOL_PAYMENT_CONFIRMED"||e.data?.quoteId!==d.id)return;
       window.removeEventListener("message",handler);
       void preparePaidShare(d.id).catch(()=>setError(lang==="zh"?"上传没有完成，本次付款可继续重试。":"Upload did not complete. This payment can be retried.")).finally(()=>setBusy(false));
     };
     window.addEventListener("message",handler);
   }catch{
     setBusy(false);setError(lang==="zh"?"暂时无法开始上传，请稍后再试。":"Unable to start the upload right now.");
   }
 }

 async function copy(){if(!link)return;await navigator.clipboard.writeText(link);setCopied(true);setTimeout(()=>setCopied(false),1500)}
 async function share(){if(!link)return;if(navigator.share)await navigator.share({title:t("burnTitle"),text:link}).catch(()=>{});else await copy()}
 function email(){if(link)location.href=`mailto:?subject=${encodeURIComponent(t("burnTitle"))}&body=${encodeURIComponent(link)}`}

 const modes:[Mode,string,string][]=[["once",t("once"),t("onceD")],["timed",t("timed"),t("timedD")],["limited",t("limited"),t("limitedD")],["fast",t("fast"),t("fastD")]];
 return <div className="mx-auto max-w-3xl space-y-5">
  <Link href="/tools" className="lx-tool-back">← {lang==="zh"?"返回实用工具":"Back to tools"}</Link>
  <section className="rounded-3xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-6 lx-tool-panel-shell"><div className="lx-special-tool-title"><LingxiMiniIcon name="burn" size="title"/><h1 className="text-3xl font-semibold text-[var(--lx-ink)]">{t("burnTitle")}</h1></div><p className="mt-2 text-sm leading-6 text-[var(--lx-muted)]">{t("burnLead")}</p></section>
  <section className="rounded-3xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-6">
   <textarea value={text} onChange={e=>setText(e.target.value)} maxLength={120000} rows={7} placeholder={lang==="zh"?"输入要分享的私密内容，也可以只上传文件…":"Enter private content, or share files only…"} className="w-full rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-soft)] p-4 text-[var(--lx-ink)] outline-none focus:border-[var(--lx-line-strong)]"/>
   <div className="mt-4 rounded-2xl border border-dashed border-slate-300 p-4">
    <label className="cursor-pointer font-medium text-slate-900">{t("addFiles")}<input className="hidden" type="file" multiple onChange={e=>{const x=Array.from(e.target.files||[]).slice(0,20);if(x.reduce((n,f)=>n+f.size,0)<=2*1024*1024*1024)setFiles(x);else setError(t("fileLimit"))}}/></label>
    <p className="mt-1 text-xs text-slate-500">{t("fileLimit")} {t("filePaid")}</p>
    {!!files.length&&<div className="mt-3 space-y-1 text-sm text-slate-700">{files.map((f,i)=><div key={`${f.name}-${i}`} className="flex justify-between gap-3"><span className="truncate">{f.name}</span><span>{(f.size/1024/1024).toFixed(1)} MB</span></div>)}</div>}
   </div>
   <div className="mt-4 grid gap-2 sm:grid-cols-2">{modes.map(([id,title,desc])=><button type="button" key={id} onClick={()=>setMode(id)} className={`rounded-2xl border p-4 text-left ${mode===id?"border-slate-900 bg-slate-50":"border-slate-200 bg-white"}`}><b className="block text-sm text-slate-950">{title}</b><span className="mt-1 block text-xs leading-5 text-slate-500">{desc}</span></button>)}</div>
   <div className="mt-4 flex flex-wrap gap-3">
    <label className="text-xs text-slate-500">{t("valid")}<select value={ttl} onChange={e=>setTtl(Number(e.target.value))} className="ml-2 rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-800"><option value={10}>{t("m10")}</option><option value={60}>{t("h1")}</option><option value={1440}>{t("h24")}</option><option value={4320}>{t("d3")}</option><option value={10080}>{t("d7")}</option></select></label>
    {mode==="limited"&&<label className="text-xs text-slate-500">{t("views")}<select value={views} onChange={e=>setViews(Number(e.target.value))} className="ml-2 rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-800"><option value={1}>{t("v1")}</option><option value={3}>{t("v3")}</option><option value={5}>{t("v5")}</option></select></label>}
    {mode==="fast"&&<label className="text-xs text-slate-500">{t("timer")}<select value={duration} onChange={e=>setDuration(Number(e.target.value))} className="ml-2 rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-800"><option value={5}>{t("s5")}</option><option value={10}>{t("s10")}</option><option value={30}>{t("s30")}</option><option value={60}>{t("s60")}</option></select></label>}
   </div>
   <button onClick={files.length?payAndUpload:createText} disabled={busy||(!text.trim()&&!files.length)} className="mt-4 rounded-full bg-[var(--lx-ink)] px-5 py-2.5 text-sm font-medium text-[var(--lx-bg)] disabled:opacity-40">{busy?t("uploading"):(files.length?t("payUpload"):t("generate"))}</button>
   {files.length>0&&<p className="mt-2 text-xs text-slate-500">{lang==="zh"?`本次共 ${totalMb} MB，付款页会显示人民币与美元价格。`:`${totalMb} MB total. The payment page shows CNY and USD prices.`}</p>}
   {link&&<div className="mt-5 rounded-2xl bg-slate-50 p-4"><p className="text-sm font-semibold text-slate-900">{t("ready")}</p><div className="mt-2 break-all rounded-xl bg-white p-3 text-sm text-slate-700">{link}</div><div className="mt-3 flex flex-wrap gap-2"><button onClick={()=>void copy()} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm">{copied?t("copied"):t("copy")}</button><button onClick={()=>void share()} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm">{t("share")}</button><button onClick={email} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm">{t("email")}</button></div></div>}
   {error&&<p className="mt-3 text-sm text-rose-600">{error}</p>}
  </section>
 </div>;
}
