"use client";

import {useEffect,useMemo,useRef,useState} from "react";
import FileDropzone from "@/components/tools/FileDropzone";
import PaidActionButton from "@/components/tools/PaidActionButton";
import RemoteMediaImporter from "@/components/tools/RemoteMediaImporter";

type MediaItem={file:File;duration:number;key:string};
type Box={x:number;y:number;w:number;h:number};

function durationOf(file:File){return new Promise<number>((resolve,reject)=>{const el=document.createElement("video"),u=URL.createObjectURL(file),timer=setTimeout(()=>{URL.revokeObjectURL(u);reject(new Error("无法读取视频时长"))},15000);el.preload="metadata";el.onloadedmetadata=()=>{clearTimeout(timer);const d=el.duration;URL.revokeObjectURL(u);Number.isFinite(d)&&d>0?resolve(d):reject(new Error("无法读取视频时长"))};el.onerror=()=>{clearTimeout(timer);URL.revokeObjectURL(u);reject(new Error("视频格式不受当前浏览器支持"))};el.src=u})}

export default function VideoWatermarkWorkbench(){
 const[items,setItems]=useState<MediaItem[]>([]),[preview,setPreview]=useState(""),[meta,setMeta]=useState({w:0,h:0}),[box,setBox]=useState<Box>({x:72,y:78,w:24,h:14}),[busy,setBusy]=useState(false),[progress,setProgress]=useState(""),[results,setResults]=useState<Array<{name:string;url:string}>>([]),[error,setError]=useState("");
 const ff=useRef<any>(null);
 useEffect(()=>()=>{if(preview)URL.revokeObjectURL(preview);results.forEach(r=>URL.revokeObjectURL(r.url));try{ff.current?.terminate()}catch{}},[preview]);

 async function hydrate(files:File[]){setError("");const next:MediaItem[]=[];for(const file of files.slice(0,10)){try{next.push({file,duration:await durationOf(file),key:`${file.name}-${file.size}-${file.lastModified}`})}catch(e){setError(e instanceof Error?e.message:String(e))}}setItems(next);setResults([]);if(preview)URL.revokeObjectURL(preview);setPreview(next[0]?URL.createObjectURL(next[0].file):"")}
 async function addRemote(file:File){await hydrate([...items.map(x=>x.file),file])}
 const units=useMemo(()=>items.reduce((n,x)=>n+Math.max(1,Math.ceil(x.duration/60)),0),[items]);

 async function startLocalPaid(quoteId:string,item:MediaItem,index:number){const r=await fetch("/api/tools/local-paid/job",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({action:"start",quoteId,toolId:"video-watermark-remover",itemKey:`video-${index}`,units:Math.max(1,Math.ceil(item.duration/60))})});const d=await r.json();if(!r.ok||!d.ok)throw new Error(d.error||"付款权限确认失败");return d.jobId as string}
 async function finish(jobId:string,result:any){await fetch("/api/tools/local-paid/job",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({action:"complete",jobId,result})})}
 async function fail(jobId:string,error:string){await fetch("/api/tools/local-paid/job",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({action:"fail",jobId,error})}).catch(()=>{})}

 async function processOne(item:MediaItem,index:number,quoteId:string){
  const jobId=await startLocalPaid(quoteId,item,index);
  try{
   const [{FFmpeg},{fetchFile,toBlobURL}]=await Promise.all([import("@ffmpeg/ffmpeg"),import("@ffmpeg/util")]);
   const f=new FFmpeg();ff.current=f;f.on("progress",({progress}:{progress:number})=>setProgress(`第 ${index+1}/${items.length} 个视频 · ${Math.round(progress*100)}%`));
   await f.load({coreURL:await toBlobURL("/media/ffmpeg-0.12.10/ffmpeg-core.js","text/javascript"),wasmURL:await toBlobURL("/media/ffmpeg-0.12.10/ffmpeg-core.wasm","application/wasm")});
   const ext=item.file.name.split(".").pop()||"mp4",input=`input-${index}.${ext}`,output=`output-${index}.mp4`;
   await f.writeFile(input,await fetchFile(item.file));
   const w=meta.w||1920,h=meta.h||1080,px=Math.round(w*box.x/100),py=Math.round(h*box.y/100),pw=Math.max(8,Math.round(w*box.w/100)),ph=Math.max(8,Math.round(h*box.h/100));
   await f.exec(["-i",input,"-vf",`delogo=x=${px}:y=${py}:w=${pw}:h=${ph}:show=0`,"-c:v","libx264","-preset","veryfast","-crf","20","-c:a","aac","-b:a","160k",output]);
   const data=await f.readFile(output),bytes=data instanceof Uint8Array?data:new TextEncoder().encode(String(data)),copy=new Uint8Array(bytes.length);copy.set(bytes);
   const url=URL.createObjectURL(new Blob([copy.buffer],{type:"video/mp4"}));
   await finish(jobId,{outputBytes:copy.byteLength,durationSeconds:item.duration,localProcessing:true});
   f.terminate();ff.current=null;
   return {name:item.file.name,url};
  }catch(e){await fail(jobId,e instanceof Error?e.message:String(e));throw e}
 }

 async function run(quoteId:string){if(!items.length)return;setBusy(true);setError("");setProgress("准备本地视频引擎…");results.forEach(r=>URL.revokeObjectURL(r.url));setResults([]);try{const out=[] as Array<{name:string;url:string}>;for(let i=0;i<items.length;i++)out.push(await processOne(items[i],i,quoteId));setResults(out);setProgress("全部处理完成")}catch(e){setError(e instanceof Error?e.message:String(e))}finally{setBusy(false)}}
 function cancel(){try{ff.current?.terminate()}catch{}ff.current=null;setBusy(false);setProgress("已取消当前处理。")}

 return <div className="space-y-5">
  <div className="rounded-2xl bg-slate-900 p-5 text-white"><div className="text-lg font-semibold">上传视频，框出固定水印区域，付款后本地去除</div><p className="mt-2 text-sm leading-6 text-white/70">支持单个或批量视频，同一批默认使用同一水印位置。视频本体在浏览器本地 FFmpeg 处理；支付只解锁本次处理额度。</p></div>
  <FileDropzone accept="video/*,.mp4,.mov,.m4v,.webm,.mkv" multiple maxFiles={10} maxSizeMB={500} files={items.map(x=>x.file)} onChange={hydrate} disabled={busy}/>
  <RemoteMediaImporter acceptKind="video" onImported={addRemote} disabled={busy}/>
  <p className="text-xs leading-5 text-slate-500">可直接媒体链接会被载入；抖音、TikTok、小红书、快手等“分享网页”不是视频文件，本工具不会绕过平台访问控制或伪装解析。请使用你拥有权利的原始视频、平台官方导出文件或直接媒体 CDN 链接。</p>
  {preview&&<div className="relative mx-auto max-w-3xl overflow-hidden rounded-2xl bg-black"><video src={preview} controls className="w-full" onLoadedMetadata={e=>setMeta({w:e.currentTarget.videoWidth,h:e.currentTarget.videoHeight})}/><div className="pointer-events-none absolute border-2 border-blue-500 bg-blue-500/20" style={{left:`${box.x}%`,top:`${box.y}%`,width:`${box.w}%`,height:`${box.h}%`}}/></div>}
  {items.length>0&&<><div className="grid gap-3 sm:grid-cols-4">{([["左侧 X","x"],["顶部 Y","y"],["宽度","w"],["高度","h"]] as const).map(([name,key])=><label key={key} className="text-sm text-slate-600">{name} %<input type="range" min={0} max={key==="w"||key==="h"?50:95} value={box[key]} onChange={e=>setBox(v=>({...v,[key]:Number(e.target.value)}))} className="mt-2 w-full"/><span className="text-xs text-slate-400">{box[key]}%</span></label>)}</div><div className="rounded-xl bg-blue-50 p-4 text-sm text-blue-900">共 {items.length} 个视频 · 合计计费 {units} 分钟。当前定价：¥1.20 / 分钟，不足 1 分钟按 1 分钟计；服务器生成最终报价。</div></>}
  <div className="flex flex-wrap gap-3">{busy?<><button disabled className="rounded-full bg-blue-600 px-5 py-2.5 text-sm text-white opacity-50">正在处理…</button><button onClick={cancel} className="rounded-full border border-rose-200 px-5 py-2.5 text-sm text-rose-600">取消当前处理</button></>:units>0?<PaidActionButton toolId="video-watermark-remover" quantity={units} metadata={{videos:items.length}} onPaid={run} label="查看本次去水印价格"/>:null}</div>
  {progress&&<p className="text-sm text-slate-600">{progress}</p>}{error&&<p className="text-sm text-rose-600">{error}</p>}
  {results.length>0&&<div className="grid gap-4 sm:grid-cols-2">{results.map((r,i)=><div key={r.url} className="rounded-2xl border border-slate-200 p-3"><video src={r.url} controls className="w-full rounded-xl"/><div className="mt-3 flex items-center justify-between gap-2"><span className="truncate text-sm text-slate-500">{r.name}</span><a href={r.url} download={`clean-${r.name.replace(/\.[^.]+$/,".mp4")}`} className="shrink-0 rounded-full bg-emerald-600 px-4 py-2 text-sm text-white">下载</a></div></div>)}</div>}
  <div className="rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-900">适用于固定位置的文字、贴纸或水印区域。移动水印、穿过人物面部或复杂动态遮挡需要逐帧视频修复模型，本工具不会把固定区域滤镜伪装成 AI 无痕修复。</div>
 </div>
}
