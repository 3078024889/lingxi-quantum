"use client";
import {useState} from "react";
import type {LingxiLang} from "@/lib/lingxi-i18n";
import {loadClassifier} from "@/components/tools/OptionalAIImageAnalysis";
import {syntheticScore,indicatorText,indicatorPercent} from "@/lib/media/ai-indicator-bands";

type Row={second:number;fakeScore:number|null};
const MAX_BYTES=80*1024*1024;
function waitForMedia(video:HTMLVideoElement, eventName:"loadedmetadata"|"seeked",timeoutMs:number):Promise<void>{
 return new Promise((resolve,reject)=>{
  const timer=setTimeout(()=>finish(new Error("Video decoding timed out")),timeoutMs);
  function finish(error?:Error){clearTimeout(timer);video.removeEventListener(eventName,ok);video.removeEventListener("error",fail);error?reject(error):resolve()}
  function ok(){finish()}
  function fail(){finish(new Error("Video format is not supported in this browser"))}
  video.addEventListener(eventName,ok,{once:true});video.addEventListener("error",fail,{once:true});
 });
}
async function frameBlob(video:HTMLVideoElement):Promise<Blob>{
 const canvas=document.createElement("canvas");
 const w=320, h=Math.max(1,Math.round(video.videoHeight*w/video.videoWidth));
 canvas.width=w;canvas.height=h;
 const context=canvas.getContext("2d");if(!context)throw Error("Canvas unavailable");
 context.drawImage(video,0,0,w,h);
 return new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error("Could not capture video frame")),"image/jpeg",0.9));
}
export default function OptionalAIVideoFrameAnalysis({file,lang}:{file:File;lang:LingxiLang}){
 const zh=lang==="zh";
 const [state,setState]=useState<"idle"|"loading"|"done"|"error">("idle");
 const [rows,setRows]=useState<Row[]>([]);
 const [error,setError]=useState("");
 async function analyze(){
  setState("loading");setRows([]);setError("");
  let url="";const video=document.createElement("video");
  try{
   if(file.size>MAX_BYTES)throw Error("Video exceeds 80 MB browser frame-analysis limit");
   video.preload="auto";video.muted=true;video.playsInline=true;
   const ready=waitForMedia(video,"loadedmetadata",20000);
   url=URL.createObjectURL(file);video.src=url;video.load();await ready;
   if(!Number.isFinite(video.duration)||video.duration<0.3||!video.videoWidth||!video.videoHeight)throw Error("Could not read video metadata");
   const model=await loadClassifier();
   const result:Row[]=[];
   for(const ratio of [0.15,0.5,0.85]){
    const second=Math.max(0.1,Math.min(video.duration-0.1,video.duration*ratio));
    const seeked=waitForMedia(video,"seeked",20000);
    video.currentTime=second;await seeked;
    const frame=await frameBlob(video);
    const output=await model(frame);
    const classes=(Array.isArray(output)?output:[output]).filter(p=>p&&typeof p.label==="string"&&Number.isFinite(p.score));
    const top=classes.sort((a,b)=>b.score-a.score)[0];
    if(!top)throw Error("Model returned no valid prediction");
    result.push({second,fakeScore:syntheticScore(classes)});
   }
   setRows(result);setState("done");
  }catch(e){setError(e instanceof Error?e.message:String(e));setState("error")}
  finally{video.pause();video.removeAttribute("src");video.load();if(url)URL.revokeObjectURL(url)}
 }
 return <div className="mt-3 space-y-2 border-t pt-3 text-sm">
  <p className="font-semibold">{zh?"视频 AI 生成痕迹分析":"Video AI-generation indicator analysis"}</p>
  <p className="opacity-80">{zh?"检查视频中三个不同时间点的画面，寻找可能的 AI 生成痕迹。检测范围不包括整段视频的动作和声音。":"Checks three points in the video for possible AI-generated imagery. Motion and audio are not assessed."}</p>
  <button type="button" className="rounded-lg border px-3 py-2 disabled:opacity-60" disabled={state==="loading"} onClick={()=>void analyze()}>{state==="loading"?(zh?"抽帧与模型分析中…":"Sampling and analyzing…"):(zh?"分析视频画面":"Analyze video images")}</button>
  {state==="error"&&<p role="alert">{zh?"无法完成抽帧分析：":"Frame analysis failed: "}{error}</p>}
  {state==="done"&&<div aria-live="polite" className="space-y-1">
   {rows.map((r,i)=><p key={i} data-ai-indicator-band="video">{r.second.toFixed(1)}s — {r.fakeScore===null?(zh?"暂时无法明确判断":"No clear conclusion"):`${indicatorText(r.fakeScore,lang)} — ${indicatorPercent(r.fakeScore)} ${zh?"AI 特征参考分数":"AI indicator score"}`}</p>)}
   <p className="opacity-75">{zh?"只分析了三个画面。分档只是参考，不能判断整段视频的真实性，也没有检测声音。":"Only three frames were checked. These bands do not establish the authenticity of the full video; audio was not analyzed."}</p>
  </div>}
 </div>;
}
