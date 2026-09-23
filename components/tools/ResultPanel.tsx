"use client";
import {downloadBlob} from "@/lib/tools/shared/download";
import type {ToolResultFile} from "@/lib/tools/types";
import {useLingxiLang} from "@/lib/lingxi-i18n";
import {toolRuntimeText} from "@/lib/tool-runtime-i18n";

export default function ResultPanel({files,messageZh,messageEn,details}:{files?:ToolResultFile[];messageZh?:string;messageEn?:string;details?:Record<string,string|number|boolean>}){
 const{lang}=useLingxiLang();const t=(zh:string,en:string)=>toolRuntimeText(lang,zh,en);
 return <div className="mt-6 rounded-sm border border-lattice/25 bg-void-deep p-5 sm:p-6">
  <p className="text-sm uppercase tracking-widest2 text-lattice">{t("处理结果","Result")}</p>
  {(messageZh||messageEn)&&<p className="mt-3 text-base leading-7 text-bone">{t(messageZh||"",messageEn||messageZh||"")}</p>}
  {details&&Object.keys(details).length>0&&<dl className="mt-4 grid gap-2 sm:grid-cols-2">{Object.entries(details).map(([k,v])=><div key={k} className="rounded-sm border border-white/10 bg-void px-3 py-2 text-sm"><dt className="text-bone-mute">{k}</dt><dd className="mt-0.5 font-mono text-bone">{String(v)}</dd></div>)}</dl>}
  {files&&files.length>0&&<div className="mt-5 space-y-3">{files.map(f=><div key={f.name+f.size} className="flex flex-wrap items-center justify-between gap-3"><div className="text-sm text-bone-dim"><span className="text-bone">{f.name}</span><span className="ml-2">· {(f.size/1024).toFixed(1)} KB</span></div><button type="button" onClick={()=>downloadBlob(f.blob,f.name)} className="rounded-sm bg-lattice px-5 py-2.5 text-sm font-medium uppercase tracking-widest2 text-void-deep transition hover:bg-amber">{t("下载","Download")}</button></div>)}</div>}
 </div>;
}
