"use client";

import {useState} from "react";
import {downloadBlob} from "@/lib/tools/pdf-render-client";
import {useLingxiLang} from "@/lib/lingxi-i18n";
import {workbenchCopy} from "@/lib/tools/workbench-i18n-v1473";

type Cue={start:string;end:string;text:string};

function parseTime(s:string){
  const p=s.trim().replace(",",".").split(":").map(Number);
  if(p.some(x=>!Number.isFinite(x)))return 0;
  return p.length===3?p[0]*3600+p[1]*60+p[2]:p[0]*60+p[1];
}
function fmt(sec:number,vtt=false){
  sec=Math.max(0,sec);
  const h=Math.floor(sec/3600),m=Math.floor((sec%3600)/60),s=(sec%60).toFixed(3).padStart(6,"0");
  return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${s.replace(".",vtt?".":",")}`;
}
function parseSubtitle(raw:string):Cue[]{
  const normalized=raw.replace(/^\uFEFF/,"").replace(/\r/g,"").replace(/^WEBVTT[^\n]*\n+/i,"").trim();
  if(!normalized)return [];
  return normalized.split(/\n\s*\n/).map(block=>{
    const lines=block.split("\n").filter(Boolean);
    const idx=lines.findIndex(x=>x.includes("-->"));
    if(idx<0)return null;
    const timing=lines[idx].split("-->");
    if(timing.length!==2)return null;
    const start=timing[0].trim().split(/\s+/)[0];
    const end=timing[1].trim().split(/\s+/)[0];
    const text=lines.slice(idx+1).join("\n").trim();
    return text?{start,end,text}:null;
  }).filter(Boolean) as Cue[];
}

export default function SubtitleWorkbench(){
  const{lang}=useLingxiLang();
  const t=(key:Parameters<typeof workbenchCopy>[1])=>workbenchCopy(lang,key);
  const[raw,setRaw]=useState(""),[shift,setShift]=useState(0),[error,setError]=useState("");

  function transformed(){
    const cues=parseSubtitle(raw);
    if(!cues.length)throw new Error(t("subtitleInvalid"));
    return cues.map(c=>({
      ...c,
      start:fmt(parseTime(c.start)+shift/1000),
      end:fmt(parseTime(c.end)+shift/1000),
    }));
  }
  function dl(kind:"srt"|"vtt"|"txt"){
    try{
      setError("");
      const cues=transformed();
      let out="";
      if(kind==="srt")out=cues.map((c,i)=>`${i+1}\n${c.start} --> ${c.end}\n${c.text}`).join("\n\n");
      if(kind==="vtt")out="WEBVTT\n\n"+cues.map(c=>`${c.start.replace(",",".")} --> ${c.end.replace(",",".")}\n${c.text}`).join("\n\n");
      if(kind==="txt")out=cues.map(c=>c.text).join("\n");
      downloadBlob(new Blob([out],{type:"text/plain;charset=utf-8"}),`subtitle.${kind}`);
    }catch(e){setError(e instanceof Error?e.message:String(e))}
  }

  return <div className="space-y-4">
    <label onDragOver={e=>e.preventDefault()} onDrop={async e=>{e.preventDefault();const f=e.dataTransfer.files?.[0];if(f)setRaw(await f.text())}} className="block cursor-pointer rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-7 text-center">
      <input type="file" accept=".srt,.vtt,text/plain,text/vtt" className="hidden" onChange={async e=>{const f=e.target.files?.[0];if(f)setRaw(await f.text())}}/>
      <b>{t("subtitleLoad")}</b>
      <p className="mt-1 text-sm text-slate-500">{t("subtitlePaste")}</p>
    </label>
    <textarea rows={14} value={raw} onChange={e=>setRaw(e.target.value)} placeholder={"1\n00:00:01,000 --> 00:00:03,000\nHello"} className="w-full rounded-2xl border border-slate-200 p-4 font-mono text-sm"/>
    <label className="block text-sm">{t("subtitleShift")} <input type="number" value={shift} onChange={e=>setShift(Number(e.target.value)||0)} className="ml-2 rounded border px-3 py-2"/></label>
    <div className="flex flex-wrap gap-3">
      <button onClick={()=>dl("srt")} className="rounded-full bg-blue-600 px-4 py-2 text-sm text-white">{t("subtitleExportSrt")}</button>
      <button onClick={()=>dl("vtt")} className="rounded-full border px-4 py-2 text-sm">{t("subtitleExportVtt")}</button>
      <button onClick={()=>dl("txt")} className="rounded-full border px-4 py-2 text-sm">{t("subtitleExportTxt")}</button>
    </div>
    {error&&<p className="text-sm text-rose-600">{error}</p>}
  </div>;
}
