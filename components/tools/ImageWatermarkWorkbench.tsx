"use client";
import { PointerEvent,useEffect,useMemo,useRef,useState } from "react";
import PaidActionButton from "@/components/tools/PaidActionButton";

type Box={x:number;y:number;w:number;h:number};
const empty:Box={x:.65,y:.72,w:.28,h:.18};
async function fileToImage(file:File){const url=URL.createObjectURL(file);return await new Promise<HTMLImageElement>((resolve,reject)=>{const img=new Image();img.onload=()=>{URL.revokeObjectURL(url);resolve(img)};img.onerror=reject;img.src=url})}
function canvasBlob(c:HTMLCanvasElement){return new Promise<Blob>((res,rej)=>c.toBlob(b=>b?res(b):rej(new Error("无法生成图片")),"image/png"))}
async function prepare(file:File,box:Box){
 const img=await fileToImage(file),max=1536,scale=Math.min(1,max/Math.max(img.naturalWidth,img.naturalHeight));
 const width=Math.max(16,Math.floor((img.naturalWidth*scale)/16)*16),height=Math.max(16,Math.floor((img.naturalHeight*scale)/16)*16);
 const base=document.createElement("canvas");base.width=width;base.height=height;base.getContext("2d")!.drawImage(img,0,0,width,height);
 const mask=document.createElement("canvas");mask.width=width;mask.height=height;const m=mask.getContext("2d")!;m.fillStyle="#fff";m.fillRect(0,0,width,height);m.clearRect(Math.round(box.x*width),Math.round(box.y*height),Math.round(box.w*width),Math.round(box.h*height));
 return {image:new File([await canvasBlob(base)],"image.png",{type:"image/png"}),mask:new File([await canvasBlob(mask)],"mask.png",{type:"image/png"})};
}
function Selector({file,box,onChange}:{file:File;box:Box;onChange:(b:Box)=>void}){
 const wrap=useRef<HTMLDivElement>(null),[start,setStart]=useState<{x:number;y:number}|null>(null),[src,setSrc]=useState("");
 useEffect(()=>{const u=URL.createObjectURL(file);setSrc(u);return()=>URL.revokeObjectURL(u)},[file]);
 function point(e:PointerEvent){const r=wrap.current!.getBoundingClientRect();return{x:Math.min(1,Math.max(0,(e.clientX-r.left)/r.width)),y:Math.min(1,Math.max(0,(e.clientY-r.top)/r.height))}}
 return <div ref={wrap} className="relative mx-auto mt-5 w-fit max-w-full touch-none overflow-hidden rounded-2xl bg-slate-100" onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);const p=point(e);setStart(p);onChange({x:p.x,y:p.y,w:0,h:0})}} onPointerMove={e=>{if(!start)return;const p=point(e);onChange({x:Math.min(start.x,p.x),y:Math.min(start.y,p.y),w:Math.abs(p.x-start.x),h:Math.abs(p.y-start.y)})}} onPointerUp={()=>setStart(null)}>
  {src&&<img src={src} alt="待处理图片" className="block max-h-[560px] max-w-full select-none object-contain" draggable={false}/>}
  <div className="pointer-events-none absolute border-2 border-blue-500 bg-blue-500/15" style={{left:`${box.x*100}%`,top:`${box.y*100}%`,width:`${box.w*100}%`,height:`${box.h*100}%`}}/>
 </div>
}
export default function ImageWatermarkWorkbench({batch=false}:{batch?:boolean}){
 const [files,setFiles]=useState<File[]>([]),[box,setBox]=useState<Box>(empty),[busy,setBusy]=useState(false),[error,setError]=useState(""),[results,setResults]=useState<Array<{name:string;url:string}>>([]);
 async function run(quoteId:string){
  if(!files.length||box.w<.01||box.h<.01)return;setBusy(true);setError("");setResults([]);
  try{
   const out:Array<{name:string;url:string}>=[];
   for(let i=0;i<files.length;i++){
    const f=files[i],prepared=await prepare(f,box),fd=new FormData();
    fd.set("image",prepared.image);fd.set("mask",prepared.mask);fd.set("quote_id",quoteId);fd.set("item_key",`image-${i}`);
    const r=await fetch("/api/ai/image-cleanup",{method:"POST",body:fd});const d=await r.json();
    if(!r.ok)throw new Error(d.error==="OPENAI_NOT_CONFIGURED"?"还没有配置 OPENAI_API_KEY。":(d.detail?.error?.message||d.error||"处理失败"));
    const url=d.b64?`data:image/png;base64,${d.b64}`:d.url;if(url)out.push({name:f.name,url});
   }
   setResults(out);
  }catch(e){setError(e instanceof Error?e.message:String(e))}finally{setBusy(false)}
 }
 const toolId=batch?"batch-image-watermark-remover":"image-watermark-remover";
 return <div>
  <label onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();const arr=Array.from(e.dataTransfer.files).filter(f=>f.type.startsWith("image/")).slice(0,batch?20:1);setFiles(arr);setResults([]);setError("")}} className="block cursor-pointer rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-7 text-center"><input type="file" accept="image/*" multiple={batch} disabled={busy} className="hidden" onChange={e=>{const arr=Array.from(e.target.files||[]).slice(0,batch?20:1);setFiles(arr);setResults([]);setError("")}}/><div className="font-medium">{batch?"上传多张图片":"上传图片"}</div><div className="mt-1 text-sm text-slate-500">{files.length?`${files.length} 张已选择`:(batch?"单次最多 20 张；相同位置最适合批量处理":"JPG / PNG / WebP")}</div></label>
  {files[0]&&<><p className="mt-4 text-sm text-slate-600">在第一张图上拖动框出要移除的区域。{batch?"这个区域会应用到全部图片。":""}</p><Selector file={files[0]} box={box} onChange={setBox}/></>}
  <div className="mt-5">{busy?<button disabled className="rounded-full bg-blue-600 px-5 py-2.5 text-sm text-white opacity-50">正在处理…</button>:files.length>0&&box.w>=.01&&box.h>=.01?<PaidActionButton toolId={toolId} quantity={files.length} onPaid={run} label="查看本次价格"/>:null}</div>
  <p className="mt-3 text-xs leading-5 text-slate-500">付款确认后才调用图像编辑模型。仅处理你拥有版权、已获授权或自己制作的内容。</p>
  {error&&<p className="mt-4 text-sm text-rose-600">{error}</p>}
  {results.length>0&&<div className="mt-6 grid gap-4 sm:grid-cols-2">{results.map((r,i)=><div key={r.name+i} className="rounded-2xl border border-slate-200 p-3"><img src={r.url} alt="处理结果" className="w-full rounded-xl"/><div className="mt-3 flex items-center justify-between gap-2 text-sm"><span className="truncate text-slate-600">{r.name}</span><a href={r.url} download={`clean-${r.name.replace(/\.[^.]+$/,".png")}`} className="shrink-0 font-medium text-blue-600">下载</a></div></div>)}</div>}
 </div>;
}
