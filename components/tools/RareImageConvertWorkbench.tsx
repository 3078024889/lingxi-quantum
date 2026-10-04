"use client";

import { useState } from "react";
import FileDropzone from "@/components/tools/FileDropzone";
import ResultPanel from "@/components/tools/ResultPanel";
import type { ToolResultFile } from "@/lib/tools/types";

type Mime="image/jpeg"|"image/png"|"image/webp";

async function decode(file:File){
 try{
  const bitmap=await createImageBitmap(file);
  return {
   width:bitmap.width,
   height:bitmap.height,
   draw:(ctx:CanvasRenderingContext2D)=>ctx.drawImage(bitmap,0,0),
   close:()=>bitmap.close?.(),
  };
 }catch{
  const url=URL.createObjectURL(file);
  const image=new Image();
  await new Promise<void>((resolve,reject)=>{
   image.onload=()=>resolve();
   image.onerror=()=>reject(new Error("IMAGE_DECODE_UNSUPPORTED"));
   image.src=url;
  });
  return {
   width:image.naturalWidth,
   height:image.naturalHeight,
   draw:(ctx:CanvasRenderingContext2D)=>ctx.drawImage(image,0,0),
   close:()=>URL.revokeObjectURL(url),
  };
 }
}

function ext(type:Mime){return type==="image/png"?"png":type==="image/webp"?"webp":"jpg"}

export default function RareImageConvertWorkbench({
 sourceLabel,
 target="image/jpeg",
 note,
}:{sourceLabel:string;target?:Mime;note?:string}){
 const[files,setFiles]=useState<File[]>([]);
 const[format,setFormat]=useState<Mime>(target);
 const[quality,setQuality]=useState(.92);
 const[busy,setBusy]=useState(false);
 const[error,setError]=useState("");
 const[results,setResults]=useState<ToolResultFile[]>([]);

 async function run(){
  setBusy(true);setError("");setResults([]);
  try{
   const output:ToolResultFile[]=[];
   for(const file of files){
    const decoded=await decode(file);
    try{
     const canvas=document.createElement("canvas");
     canvas.width=decoded.width;canvas.height=decoded.height;
     const context=canvas.getContext("2d");
     if(!context)throw new Error("CANVAS_UNAVAILABLE");
     if(format==="image/jpeg"){context.fillStyle="#fff";context.fillRect(0,0,canvas.width,canvas.height)}
     decoded.draw(context);
     const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(
      value=>value?resolve(value):reject(new Error("IMAGE_EXPORT_FAILED")),
      format,format==="image/png"?undefined:quality
     ));
     output.push({
      name:file.name.replace(/\.[^.]+$/,"")+"."+ext(format),
      blob,mime:format,size:blob.size
     });
     canvas.width=canvas.height=1;
    }finally{decoded.close()}
   }
   setResults(output);
  }catch(cause){setError(cause instanceof Error?cause.message:String(cause))}
  finally{setBusy(false)}
 }

 return <div className="space-y-4">
  <FileDropzone accept="image/*,.jfif,.bmp,.avif,.ico,.gif" multiple append maxFiles={30} maxSizeMB={60} files={files} onChange={f=>{setFiles(f);setResults([]);setError("")}} disabled={busy} kind="image"/>
  <div className="grid gap-3 sm:grid-cols-2">
   <label className="text-sm">输出格式
    <select value={format} onChange={e=>setFormat(e.target.value as Mime)} className="mt-1 w-full rounded-xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-2">
     <option value="image/jpeg">JPG</option><option value="image/png">PNG</option><option value="image/webp">WebP</option>
    </select>
   </label>
   {format!=="image/png"&&<label className="text-sm">质量 {Math.round(quality*100)}%
    <input type="range" min=".4" max="1" step=".01" value={quality} onChange={e=>setQuality(Number(e.target.value))} className="mt-3 w-full"/>
   </label>}
  </div>
  <p className="text-xs leading-5 text-[var(--lx-muted)]">{sourceLabel} · {note||"优先使用浏览器原生解码，本地转换，不上传图片。若浏览器本身不支持该源格式，会明确报错而不是生成假文件。"}</p>
  <button disabled={!files.length||busy} onClick={run} className="rounded-xl bg-[var(--lx-ink)] px-5 py-2.5 text-sm text-[var(--lx-bg)] disabled:opacity-40">{busy?"正在转换…":"开始转换"}</button>
  {!!results.length&&<ResultPanel files={results} messageZh={`已转换 ${results.length} 个文件。`} messageEn={`Converted ${results.length} file(s).`}/>}
  {error&&<p className="text-sm text-[var(--lx-danger)]">{error}</p>}
 </div>
}
