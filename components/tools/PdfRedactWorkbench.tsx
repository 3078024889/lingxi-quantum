"use client";
import { PointerEvent,useEffect,useRef,useState } from "react";
import { PDFDocument } from "pdf-lib";
import { openPdf,renderPdfPage,canvasToBlob,downloadBlob } from "@/lib/tools/pdf-render-client";

type Box={x:number;y:number;w:number;h:number};
export default function PdfRedactWorkbench(){
  const [file,setFile]=useState<File|null>(null),[pages,setPages]=useState(0),[page,setPage]=useState(1),[preview,setPreview]=useState(""),[box,setBox]=useState<Box>({x:.15,y:.2,w:.35,h:.08}),[scope,setScope]=useState<"one"|"all">("one"),[busy,setBusy]=useState(false),[error,setError]=useState("");
  const wrap=useRef<HTMLDivElement>(null),start=useRef<{x:number;y:number}|null>(null);
  useEffect(()=>()=>{if(preview)URL.revokeObjectURL(preview)},[preview]);
  async function load(f:File){setFile(f);const pdf=await openPdf(f);setPages(pdf.numPages);await show(pdf,1);pdf.destroy?.();}
  async function show(pdfOrFile:any,n:number){
    const pdf=pdfOrFile instanceof File?await openPdf(pdfOrFile):pdfOrFile;
    const r=await renderPdfPage(pdf,n,1.2),b=await canvasToBlob(r.canvas,"image/jpeg",.9);
    if(preview)URL.revokeObjectURL(preview);setPreview(URL.createObjectURL(b));r.canvas.width=1;r.canvas.height=1;
    if(pdfOrFile instanceof File)pdf.destroy?.();
  }
  async function changePage(n:number){setPage(n);if(file)await show(file,n)}
  function point(e:PointerEvent){const r=wrap.current!.getBoundingClientRect();return{x:Math.max(0,Math.min(1,(e.clientX-r.left)/r.width)),y:Math.max(0,Math.min(1,(e.clientY-r.top)/r.height))}}
  async function exportRedacted(){
    if(!file)return;setBusy(true);setError("");
    try{
      const pdf=await openPdf(file),out=await PDFDocument.create();
      for(let n=1;n<=pdf.numPages;n++){
        const r=await renderPdfPage(pdf,n,1.5),ctx=r.canvas.getContext("2d")!;
        if(scope==="all"||n===page){
          ctx.fillStyle="#000";
          ctx.fillRect(Math.round(box.x*r.width),Math.round(box.y*r.height),Math.round(box.w*r.width),Math.round(box.h*r.height));
        }
        const jpg=await canvasToBlob(r.canvas,"image/jpeg",.92),img=await out.embedJpg(await jpg.arrayBuffer()),src=await pdf.getPage(n),vp=src.getViewport({scale:1}),p=out.addPage([vp.width,vp.height]);p.drawImage(img,{x:0,y:0,width:vp.width,height:vp.height});r.canvas.width=1;r.canvas.height=1;
      }
      pdf.destroy?.();const b=await out.save(),c=new Uint8Array(b.length);c.set(b);downloadBlob(new Blob([c.buffer],{type:"application/pdf"}),`redacted-${file.name}`);
    }catch(e){setError(e instanceof Error?e.message:String(e))}finally{setBusy(false)}
  }
  return <div className="space-y-4">
    <label className="block cursor-pointer rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-7 text-center"><input type="file" accept="application/pdf" className="hidden" onChange={e=>{const f=e.target.files?.[0];if(f)load(f)}}/><b>Select PDF</b><p className="mt-1 text-sm text-slate-500">True visual redaction by rasterizing the exported PDF, so covered text cannot be recovered by copy/paste.</p></label>
    {preview&&<><div className="flex flex-wrap items-center gap-3 text-sm"><label>Page <input type="number" min={1} max={pages} value={page} onChange={e=>changePage(Math.max(1,Math.min(pages,Number(e.target.value)||1)))} className="w-16 rounded border px-2 py-1"/></label><select value={scope} onChange={e=>setScope(e.target.value as any)} className="rounded border px-2 py-1"><option value="one">This page only</option><option value="all">Same area on every page</option></select></div>
    <div ref={wrap} className="relative mx-auto w-fit max-w-full touch-none overflow-hidden rounded-2xl border border-slate-200" onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);const p=point(e);start.current=p;setBox({x:p.x,y:p.y,w:0,h:0})}} onPointerMove={e=>{if(!start.current)return;const p=point(e),s=start.current;setBox({x:Math.min(s.x,p.x),y:Math.min(s.y,p.y),w:Math.abs(p.x-s.x),h:Math.abs(p.y-s.y)})}} onPointerUp={()=>start.current=null}><img src={preview} alt="PDF page" className="block max-h-[680px] max-w-full select-none"/><div className="pointer-events-none absolute bg-black/75" style={{left:`${box.x*100}%`,top:`${box.y*100}%`,width:`${box.w*100}%`,height:`${box.h*100}%`}}/></div></>}
    <div className="rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-900">This safe mode permanently rasterizes pages. It removes recoverable text under the redaction box, but also removes searchable/selectable text from the exported PDF.</div>
    <button disabled={!file||busy||box.w<.005||box.h<.005} onClick={exportRedacted} className="rounded-full bg-blue-600 px-5 py-2.5 text-sm text-white disabled:opacity-40">{busy?"Exporting...":"Export redacted PDF"}</button>{error&&<p className="text-sm text-rose-600">{error}</p>}
  </div>;
}
