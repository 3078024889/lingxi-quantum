"use client";
import { useRef,useState } from "react";
import { PDFDocument } from "pdf-lib";
import { openPdf,renderPdfPage,canvasToBlob,downloadBlob } from "@/lib/tools/pdf-render-client";

export default function PdfCompressWorkbench(){
  const [file,setFile]=useState<File|null>(null),[mode,setMode]=useState("recommended"),[busy,setBusy]=useState(false),[stage,setStage]=useState(""),[result,setResult]=useState<{before:number;after:number}|null>(null),[error,setError]=useState("");
  const abort=useRef(false);
  const cfg=mode==="light"?{scale:1.6,q:.84}:mode==="strong"?{scale:1.05,q:.58}:{scale:1.3,q:.72};
  async function run(){
    if(!file)return;setBusy(true);setError("");setResult(null);abort.current=false;
    try{
      const pdf=await openPdf(file),out=await PDFDocument.create();
      for(let n=1;n<=pdf.numPages;n++){
        if(abort.current)throw new Error("Canceled.");
        setStage(`Compressing page ${n}/${pdf.numPages}`);
        const r=await renderPdfPage(pdf,n,cfg.scale),jpg=await canvasToBlob(r.canvas,"image/jpeg",cfg.q),img=await out.embedJpg(await jpg.arrayBuffer());
        const src=await pdf.getPage(n),vp=src.getViewport({scale:1});
        const page=out.addPage([vp.width,vp.height]);
        page.drawImage(img,{x:0,y:0,width:vp.width,height:vp.height});
        r.canvas.width=1;r.canvas.height=1;
      }
      pdf.destroy?.();
      const bytes=await out.save({useObjectStreams:true}),copy=new Uint8Array(bytes.length);copy.set(bytes);
      const blob=new Blob([copy.buffer],{type:"application/pdf"});
      setResult({before:file.size,after:blob.size});
      downloadBlob(blob,`compressed-${file.name}`);
      setStage("Done");
    }catch(e){setError(e instanceof Error?e.message:String(e))}
    finally{setBusy(false)}
  }
  return <div className="space-y-4">
    <label className="block cursor-pointer rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-7 text-center"><input type="file" accept="application/pdf" className="hidden" onChange={e=>setFile(e.target.files?.[0]||null)}/><b>Select PDF</b><p className="mt-1 text-sm text-slate-500">This mode compresses by rasterizing pages. It is best for scanned/image-heavy PDFs.</p></label>
    <div className="flex flex-wrap gap-2">{[["light","Light"],["recommended","Recommended"],["strong","Strong"]].map(([v,n])=><button key={v} onClick={()=>setMode(v)} className={`rounded-full px-4 py-2 text-sm ${mode===v?"bg-blue-600 text-white":"border border-slate-200"}`}>{n}</button>)}</div>
    <div className="rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-900">Compression is real, but selectable text/vector content will be rasterized in this mode. Use it when smaller size matters more than preserving editable text.</div>
    <div className="flex gap-3"><button disabled={!file||busy} onClick={run} className="rounded-full bg-blue-600 px-5 py-2.5 text-sm text-white disabled:opacity-40">{busy?"Compressing...":"Compress PDF"}</button>{busy&&<button onClick={()=>abort.current=true} className="rounded-full border border-rose-200 px-5 py-2.5 text-sm text-rose-600">Cancel</button>}</div>
    {stage&&<p className="text-sm text-slate-500">{stage}</p>}
    {result&&<div className="rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-900">Before {(result.before/1024/1024).toFixed(2)} MB → after {(result.after/1024/1024).toFixed(2)} MB · change {Math.round((1-result.after/result.before)*100)}%</div>}
    {error&&<p className="text-sm text-rose-600">{error}</p>}
  </div>;
}
