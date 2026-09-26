"use client";
import {PointerEvent,useEffect,useRef,useState} from "react";
import FileDropzone from "@/components/tools/FileDropzone";
import PaidActionButton from "@/components/tools/PaidActionButton";
import {localInpaint,type NormalizedBox} from "@/lib/tools/autonomous/image-local";
import {saveBlob} from "@/lib/tools/autonomous/download-local";

const initial:NormalizedBox={x:.65,y:.72,w:.28,h:.18};
function Selector({file,box,onChange}:{file:File;box:NormalizedBox;onChange:(b:NormalizedBox)=>void}){
 const ref=useRef<HTMLDivElement>(null),[start,setStart]=useState<{x:number;y:number}|null>(null),[src,setSrc]=useState("");
 useEffect(()=>{const u=URL.createObjectURL(file);setSrc(u);return()=>URL.revokeObjectURL(u)},[file]);
 const point=(e:PointerEvent)=>{const r=ref.current!.getBoundingClientRect();return{x:Math.max(0,Math.min(1,(e.clientX-r.left)/r.width)),y:Math.max(0,Math.min(1,(e.clientY-r.top)/r.height))}};
 return <div ref={ref} className="relative mx-auto mt-4 w-fit max-w-full touch-none overflow-hidden rounded-2xl" onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);const p=point(e);setStart(p);onChange({...p,w:0,h:0})}} onPointerMove={e=>{if(!start)return;const p=point(e);onChange({x:Math.min(start.x,p.x),y:Math.min(start.y,p.y),w:Math.abs(start.x-p.x),h:Math.abs(start.y-p.y)})}} onPointerUp={()=>setStart(null)}>
  {src&&<img src={src} alt="" className="block max-h-[560px] max-w-full select-none"/>}
  <div className="pointer-events-none absolute border-2 border-[var(--lx-line-strong)] bg-black/10" style={{left:`${box.x*100}%`,top:`${box.y*100}%`,width:`${box.w*100}%`,height:`${box.h*100}%`}}/>
 </div>
}
export default function ImageWatermarkWorkbench({batch=false}:{batch?:boolean}){
 const[files,setFiles]=useState<File[]>([]),[box,setBox]=useState(initial),[busy,setBusy]=useState(false),[error,setError]=useState(""),[results,setResults]=useState<Array<{name:string;blob:Blob;url:string}>>([]);
 async function run(){if(box.w<.01||box.h<.01)return;setBusy(true);setError("");try{
  for(const r of results)URL.revokeObjectURL(r.url);const out=[] as Array<{name:string;blob:Blob;url:string}>;
  for(const f of files){const blob=await localInpaint(f,box);out.push({name:f.name,blob,url:URL.createObjectURL(blob)})}
  setResults(out);
 }catch(e){setError(e instanceof Error?e.message:String(e))}finally{setBusy(false)}}
 const toolId=batch?"batch-image-watermark-remover":"image-watermark-remover";
 return <div className="space-y-4">
  <FileDropzone accept="image/*" multiple={batch} maxFiles={batch?20:1} maxSizeMB={30} files={files} onChange={setFiles} disabled={busy} kind="image"/>
  {files[0]&&<><p className="text-sm text-[var(--lx-muted)]">在第一张图上拖动框出要移除的区域。相同位置可批量处理。</p><Selector file={files[0]} box={box} onChange={setBox}/></>}
  {files.length>0&&box.w>=.01&&box.h>=.01&&!busy&&<PaidActionButton toolId={toolId} quantity={files.length} metadata={{mode:"local"}} onPaid={run} label="查看本次价格"/>}
  {busy&&<p className="text-sm text-[var(--lx-muted)]">正在修复选中区域…</p>}
  <p className="text-xs text-[var(--lx-faint)]">默认使用浏览器内图像修复算法，只处理你拥有版权、已获授权或自己制作的内容。</p>
  {error&&<p className="text-sm text-[var(--lx-danger)]">{error}</p>}
  {results.length>0&&<div className="grid gap-4 sm:grid-cols-2">{results.map((r,i)=><div key={r.name+i} className="rounded-2xl border border-[var(--lx-line)] p-3"><img src={r.url} alt="处理结果" className="w-full rounded-xl"/><button type="button" onClick={()=>saveBlob(r.blob,`clean-${r.name.replace(/\.[^.]+$/,".png")}`)} className="mt-3 rounded-xl bg-[var(--lx-ink)] px-4 py-2 text-sm text-[var(--lx-bg)]">保存结果</button></div>)}</div>}
 </div>
}
