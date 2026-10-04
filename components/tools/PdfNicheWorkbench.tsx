"use client";
import {useState} from "react";
import {PDFDocument} from "pdf-lib";
import FileDropzone from "@/components/tools/FileDropzone";
import ResultPanel from "@/components/tools/ResultPanel";
import type{ToolResultFile}from"@/lib/tools/types";
import{openPdf,renderPdfPage,canvasToBlob}from"@/lib/tools/pdf-render-client";
type Mode="rasterize"|"nup"|"remove-metadata";
const asBlob=(b:Uint8Array)=>new Blob([new Uint8Array(b)],{type:"application/pdf"});
export default function PdfNicheWorkbench({mode}:{mode:Mode}){
 const[files,setFiles]=useState<File[]>([]),[busy,setBusy]=useState(false),[error,setError]=useState(""),[results,setResults]=useState<ToolResultFile[]>([]),[scale,setScale]=useState(1.5),[perSheet,setPerSheet]=useState<2|4|6|9>(4);
 async function run(){setBusy(true);setError("");setResults([]);try{
  const file=files[0];if(!file)throw new Error("FILE_REQUIRED");
  if(mode==="remove-metadata"){
   const d=await PDFDocument.load(await file.arrayBuffer());
   d.setTitle("");d.setAuthor("");d.setSubject("");d.setKeywords([]);d.setCreator("");d.setProducer("");
   const b=asBlob(await d.save());setResults([{name:"clean-metadata-"+file.name,blob:b,mime:"application/pdf",size:b.size}]);return;
  }
  const src=await openPdf(file),out=await PDFDocument.create();
  if(mode==="rasterize"){
   for(let p=1;p<=src.numPages;p++){const r=await renderPdfPage(src,p,scale),imgBlob=await canvasToBlob(r.canvas,"image/jpeg",.9),jpg=await out.embedJpg(await imgBlob.arrayBuffer()),page=out.addPage([r.width,r.height]);page.drawImage(jpg,{x:0,y:0,width:r.width,height:r.height});r.canvas.width=r.canvas.height=1}
  }else{
   const cols=perSheet===2?2:perSheet===4?2:perSheet===6?3:3,rows=Math.ceil(perSheet/cols),W=842,H=595,cellW=W/cols,cellH=H/rows;
   for(let start=1;start<=src.numPages;start+=perSheet){
    const page=out.addPage([W,H]);
    for(let i=0;i<perSheet&&start+i<=src.numPages;i++){
     const r=await renderPdfPage(src,start+i,.8),imgBlob=await canvasToBlob(r.canvas,"image/jpeg",.82),jpg=await out.embedJpg(await imgBlob.arrayBuffer()),ratio=Math.min((cellW-12)/r.width,(cellH-12)/r.height),w=r.width*ratio,h=r.height*ratio,col=i%cols,row=Math.floor(i/cols);
     page.drawImage(jpg,{x:col*cellW+(cellW-w)/2,y:H-(row+1)*cellH+(cellH-h)/2,width:w,height:h});r.canvas.width=r.canvas.height=1;
    }
   }
  }
  src.destroy?.();const b=asBlob(await out.save());setResults([{name:(mode==="rasterize"?"rasterized-":"nup-")+file.name,blob:b,mime:"application/pdf",size:b.size}]);
 }catch(e){setError(e instanceof Error?e.message:String(e))}finally{setBusy(false)}}
 return <div className="space-y-4"><FileDropzone accept="application/pdf,.pdf" files={files} onChange={f=>{setFiles(f);setResults([]);setError("")}} disabled={busy} kind="pdf"/>
 {mode==="rasterize"&&<label className="text-sm">渲染清晰度<select value={scale} onChange={e=>setScale(Number(e.target.value))} className="ml-3 rounded-lg border p-2"><option value="1">1×</option><option value="1.5">1.5×</option><option value="2">2×</option></select></label>}
 {mode==="nup"&&<label className="text-sm">每张纸页面数<select value={perSheet} onChange={e=>setPerSheet(Number(e.target.value) as any)} className="ml-3 rounded-lg border p-2"><option value="2">2</option><option value="4">4</option><option value="6">6</option><option value="9">9</option></select></label>}
 <p className="text-xs text-[var(--lx-muted)]">{mode==="rasterize"?"把每页重新渲染为图像再生成 PDF，可固定外观并移除可编辑文本层；不等同于加密。":mode==="nup"?"将多个原始页面缩排到一张横向 A4 页面，适合讲义/打印。":"清除常见 PDF 文档属性；不会删除页面正文里肉眼可见的个人信息。"}</p>
 <button disabled={!files.length||busy} onClick={run} className="rounded-xl bg-[var(--lx-ink)] px-5 py-2.5 text-sm text-[var(--lx-bg)] disabled:opacity-40">{busy?"处理中…":"开始处理"}</button>{!!results.length&&<ResultPanel files={results} messageZh="处理完成。" messageEn="Done."/>}{error&&<p className="text-sm text-[var(--lx-danger)]">{error}</p>}</div>
}
