"use client";
import {useState} from "react";
import type {LingxiLang} from "@/lib/lingxi-i18n";
import {loadClassifier} from "@/components/tools/OptionalAIImageAnalysis";

type Row={second:number;label:string;score:number};
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
    result.push({second,label:top.label,score:top.score});
   }
   setRows(result);setState("done");
  }catch(e){setError(e instanceof Error?e.message:String(e));setState("error")}
  finally{video.pause();video.removeAttribute("src");video.load();if(url)URL.revokeObjectURL(url)}
 }
 return <div className="mt-3 space-y-2 border-t pt-3 text-sm">
  <p className="font-semibold">{zh?"可选视频画面抽帧分析（实验性）":"Optional video-frame image analysis (experimental)"}</p>
  <p className="opacity-80">{zh?"仅抽取3帧进行 AI 图片模型分析，不能检测全片的换脸动作、音轨或证明视频真假。需要下载约87MB模型。":"Analyzes three sampled frames with the image model only. Cannot authenticate video motion, faces or audio. Requires an ~87 MB model download."}</p>
  <button type="button" className="rounded-lg border px-3 py-2 disabled:opacity-60" disabled={state==="loading"} onClick={()=>void analyze()}>{state==="loading"?(zh?"抽帧与模型分析中…":"Sampling and analyzing…"):(zh?"启动视频抽帧分析":"Analyze sampled video frames")}</button>
  {state==="error"&&<p role="alert">{zh?"无法完成抽帧分析：":"Frame analysis failed: "}{error}</p>}
  {state==="done"&&<div aria-live="polite" className="space-y-1">
   {rows.map((r,i)=><p key={i}>{r.second.toFixed(1)}s — {r.label.toUpperCase()==="FAKE"?(zh?"模型倾向：合成画面":"Model suggests synthetic frame"):r.label.toUpperCase()==="REAL"?(zh?"模型倾向：真实画面":"Model suggests real frame"):r.label} — {(100*r.score).toFixed(1)}% {zh?"模型分类分数":"model score"}</p>)}
   <p className="opacity-75">{zh?"仅是三帧的实验性视觉线索，不代表整段视频，更不是真伪证明。":"Experimental visual clues from three frames, not a verdict on the video."}</p>
  </div>}
 </div>;
}
