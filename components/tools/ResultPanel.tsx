"use client";
import {useState} from "react";
import {downloadBlob} from "@/lib/tools/shared/download";
import type {ToolResultFile} from "@/lib/tools/types";
import {useLingxiLang} from "@/lib/lingxi-i18n";
import {toolRuntimeText} from "@/lib/tool-runtime-i18n";
import ContinueProcessing from "./ContinueProcessing";
export default function ResultPanel({files,messageZh,messageEn,details,sourceSlug}:{files?:ToolResultFile[];messageZh?:string;messageEn?:string;details?:Record<string,string|number|boolean>;sourceSlug?:string}){
 const{lang}=useLingxiLang();const t=(zh:string,en:string)=>toolRuntimeText(lang,zh,en);
 const[busy,setBusy]=useState<string|null>(null);
 async function save(file:ToolResultFile){setBusy(file.name);try{await downloadBlob(file.blob,file.name)}finally{setBusy(null)}}
 return <div className="mt-6 rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-5 sm:p-6">
  <p className="text-sm font-medium text-[var(--lx-faint)]">{t("处理完成","Ready")}</p>
  {(messageZh||messageEn)&&<p className="mt-3 text-base leading-7 text-[var(--lx-ink)]">{t(messageZh||"",messageEn||messageZh||"")}</p>}
  {details&&Object.keys(details).length>0&&<dl className="mt-4 grid gap-2 sm:grid-cols-2">{Object.entries(details).map(([k,v])=><div key={k} className="rounded-xl border border-[var(--lx-line)] bg-[var(--lx-soft)] px-3 py-2 text-sm"><dt className="text-[var(--lx-faint)]">{k}</dt><dd className="mt-0.5 break-all font-mono text-[var(--lx-ink)]">{String(v)}</dd></div>)}</dl>}
  {files?.length?<div className="mt-5 space-y-3">{files.map(file=><div key={file.name+file.size} className="flex flex-wrap items-center justify-between gap-3"><div className="min-w-0 text-sm text-[var(--lx-muted)]"><span className="break-all text-[var(--lx-ink)]">{file.name}</span><span className="ml-2">· {(file.size/1024).toFixed(1)} KB</span></div><button type="button" disabled={busy!==null} onClick={()=>save(file)} className="rounded-xl bg-[var(--lx-ink)] px-5 py-2.5 text-sm font-medium text-[var(--lx-bg)]">{busy===file.name?t("正在准备…","Preparing…"):t("保存结果","Save result")}</button></div>)}</div>:null}
  {sourceSlug&&files?.length?<ContinueProcessing sourceSlug={sourceSlug} files={files}/>:null}
 </div>
}
