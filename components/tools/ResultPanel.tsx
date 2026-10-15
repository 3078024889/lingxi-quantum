"use client";
import {plainText,plainMessage} from "@/lib/tools/plain-copy";

import {useEffect,useRef,useState} from "react";
import{recordRecentToolResult}from"@/lib/tools/workspace/recent-tools";
import {downloadBlob} from "@/lib/tools/shared/download";
import type {ToolResultFile} from "@/lib/tools/types";
import {useLingxiLang} from "@/lib/lingxi-i18n";
import {toolRuntimeText} from "@/lib/tool-runtime-i18n";
import ContinueProcessing from "./ContinueProcessing";
import ResultFileActions from "./ResultFileActions";
export default function ResultPanel({files,messageZh,messageEn,details,sourceSlug}:{files?:ToolResultFile[];messageZh?:string;messageEn?:string;details?:Record<string,string|number|boolean>;sourceSlug?:string}){
 const{lang}=useLingxiLang();const t=(zh:string,en:string)=>toolRuntimeText(lang,zh,en);
 const[busy,setBusy]=useState<string|null>(null);
 const[error,setError]=useState(false);
 const resultMessage=(messageZh||messageEn)?t(messageZh||"",messageEn||messageZh||""):"";
 const zipCache=useRef<{files:ToolResultFile[];archive:{blob:Blob;name:string}}|null>(null);
 useEffect(()=>{if(sourceSlug)recordRecentToolResult(sourceSlug,files||[])},[sourceSlug,files]);
 async function saveZip(){if(!files?.length||busy!==null)return;setBusy('__all__');setError(false);try{let archive=zipCache.current?.files===files?zipCache.current.archive:null;if(!archive){const {filesToZip}=await import('@/lib/tools/shared/batch-files');archive=await filesToZip(files);zipCache.current={files,archive}}await downloadBlob(archive.blob,archive.name)}catch{setError(true)}finally{setBusy(null)}}
 return <div className="mt-6 min-w-0 max-w-full rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-5 sm:p-6">
  <p className="text-sm font-medium text-[var(--lx-faint)]">{plainText(lang,"ready")}</p>
  {resultMessage&&resultMessage!==plainText(lang,"ready")&&<p className="mt-3 text-base leading-7 text-[var(--lx-ink)]">{resultMessage}</p>}
  {details&&Object.keys(details).length>0&&<dl className="mt-4 grid gap-2 sm:grid-cols-2">{Object.entries(details).map(([k,v])=><div key={k} className="rounded-xl border border-[var(--lx-line)] bg-[var(--lx-soft)] px-3 py-2 text-sm"><dt className="text-[var(--lx-faint)]">{(["files","pages","resultKB"] as string[]).includes(k)?plainText(lang,k as "files"|"pages"|"resultKB"):k}</dt><dd className="mt-0.5 break-all font-mono text-[var(--lx-ink)]">{String(v)}</dd></div>)}</dl>}
  {files?.length?<div className="mt-5 min-w-0 space-y-5">{files.map((file,index)=><div key={index+'-'+file.name+file.size} className="min-w-0 max-w-full space-y-3"><div className="min-w-0 max-w-full break-all text-sm text-[var(--lx-muted)]"><span className="text-[var(--lx-ink)]">{file.name}</span><span className="ml-2">· {(file.size/1024).toFixed(1)} KB</span></div><ResultFileActions blob={file.blob} name={file.name}/></div>)}</div>:null}
  {files&&files.length>1&&<button type="button" disabled={busy!==null} onClick={saveZip} className="mt-4 rounded-xl border border-[var(--lx-line)] px-5 py-2.5 text-sm">{busy==='__all__'?plainText(lang,'working'):plainText(lang,'saveZip')}</button>}
  {error&&<p role="alert">{plainText(lang,"saveError")}</p>}
  {sourceSlug&&files?.length?<ContinueProcessing sourceSlug={sourceSlug} files={files}/>:null}
 </div>
}
