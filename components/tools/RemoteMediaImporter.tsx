"use client";

import {useMemo,useState} from "react";
import {useLingxiLang} from "@/lib/lingxi-i18n";
import {workbenchCopy} from "@/lib/tools/workbench-i18n-v1473";

type ImportResult={input:string;ok:boolean;platform?:string|null;filename?:string;file?:File;error?:string};

function platformOf(raw:string){
  try{
    const host=new URL(raw).hostname.toLowerCase();
    if(host.includes("douyin.com"))return "抖音";
    if(host.includes("tiktok.com"))return "TikTok";
    if(host.includes("xiaohongshu.com")||host.includes("xhslink.com"))return "小红书";
    if(host.includes("kuaishou.com")||host.includes("v.kuaishou.com"))return "快手";
    return "Media";
  }catch{return "Link"}
}

export default function RemoteMediaImporter({acceptKind,onImported,disabled}:{acceptKind:"video"|"audio"|"image";onImported:(file:File)=>void|Promise<void>;disabled?:boolean}){
  const{lang}=useLingxiLang();
  const t=(key:Parameters<typeof workbenchCopy>[1])=>workbenchCopy(lang,key);
  const[raw,setRaw]=useState(""),[busy,setBusy]=useState(false),[results,setResults]=useState<ImportResult[]>([]);
  const links=useMemo(()=>raw.split(/\r?\n/).map(x=>x.trim()).filter(Boolean).slice(0,20),[raw]);

  async function importOne(input:string):Promise<ImportResult>{
    let parsed:URL;
    try{
      parsed=new URL(input);
      if(parsed.protocol!=="https:")throw new Error("HTTPS");
    }catch{
      return{input,ok:false,platform:platformOf(input),error:t("remoteFallback")};
    }
    try{
      const res=await fetch("/api/tools/media-import",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({url:parsed.toString(),kind:acceptKind,allowSharePageResolve:true})});
      const type=res.headers.get("content-type")||"";
      const platform=res.headers.get("x-lingxi-source-platform")||platformOf(input);
      if(!res.ok){
        const data=type.includes("application/json")?await res.json().catch(()=>({})):{};
        return{input,ok:false,platform,error:data.error||t("remoteFallback")};
      }
      const blob=await res.blob();
      const disposition=res.headers.get("content-disposition")||"";
      const match=disposition.match(/filename="?([^"]+)"?/i);
      const filename=match?.[1]||`remote-${acceptKind}.${acceptKind==="video"?"mp4":acceptKind==="audio"?"mp3":"jpg"}`;
      const file=new File([blob],filename,{type:blob.type||`${acceptKind}/*`});
      await onImported(file);
      return{input,ok:true,platform,filename,file};
    }catch{return{input,ok:false,platform:platformOf(input),error:t("remoteFallback")}}
  }

  async function run(){
    if(!links.length)return;
    setBusy(true);setResults([]);
    const out:ImportResult[]=[];
    for(const link of links){const result=await importOne(link);out.push(result);setResults([...out])}
    setBusy(false);
  }

  return <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
    <div className="text-sm font-medium text-slate-800">{t("remoteTitle")}</div>
    <p className="mt-1 text-xs leading-5 text-slate-500">{t("remoteLead")}</p>
    <textarea value={raw} onChange={e=>setRaw(e.target.value)} disabled={disabled||busy} rows={5}
      placeholder={"https://v.douyin.com/...\nhttps://www.tiktok.com/...\nhttps://xhslink.com/...\nhttps://v.kuaishou.com/..."}
      className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-400"/>
    <div className="mt-3 flex flex-wrap items-center gap-3">
      <button type="button" onClick={run} disabled={disabled||busy||!links.length} className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm text-white disabled:opacity-40">
        {busy?`${t("remoteRunning")} ${results.length+1}/${links.length}…`:`${t("remoteRun")} ${links.length||0}`}
      </button>
    </div>
    {results.length>0&&<div className="mt-4 space-y-2">{results.map((r,i)=><div key={`${r.input}-${i}`} className={`rounded-xl border px-3 py-2 text-xs ${r.ok?"border-emerald-200 bg-emerald-50 text-emerald-800":"border-rose-200 bg-rose-50 text-rose-700"}`}>
      <div className="font-medium">{r.ok?"✓":"×"} {r.platform||"Link"} · {r.ok?t("remoteLoaded"):t("remoteFailed")}</div>
      <div className="mt-1 break-all opacity-80">{r.input}</div>
      {r.filename&&<div className="mt-1">{r.filename}</div>}
      {r.error&&<div className="mt-1">{r.error}</div>}
    </div>)}</div>}
    <p className="mt-3 text-[11px] leading-5 text-slate-400">{t("remoteRights")}</p>
  </div>;
}
