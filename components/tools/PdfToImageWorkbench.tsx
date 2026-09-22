"use client";
import { useRef,useState } from "react";
import { openPdf,renderPdfPage,canvasToBlob,downloadBlob } from "@/lib/tools/pdf-render-client";

function parseRange(raw:string,max:number){
  if(!raw.trim())return Array.from({length:max},(_,i)=>i+1);
  const out=new Set<number>();
  for(const token of raw.split(",")){
    const part=token.trim();if(!part)continue;
    if(part.includes("-")){
      const [a,b]=part.split("-").map(Number);
      if(Number.isFinite(a)&&Number.isFinite(b))for(let i=Math.max(1,a);i<=Math.min(max,b);i++)out.add(i);
    }else{
      const n=Number(part);if(n>=1&&n<=max)out.add(n);
    }
  }
  return [...out].sort((a,b)=>a-b);
}
export default function PdfToImageWorkbench(){
  const [file,setFile]=useState<File|null>(null),[pages,setPages]=useState(0),[range,setRange]=useState(""),[format,setFormat]=useState<"jpeg"|"png">("jpeg"),[quality,setQuality]=useState(.9),[scale,setScale]=useState(1.5),[busy,setBusy]=useState(false),[stage,setStage]=useState(""),[error,setError]=useState("");
  const abort=useRef(false);
  async function choose(f:File){setFile(f);setError("");const pdf=await openPdf(f);setPages(pdf.numPages);setRange(`1-${pdf.numPages}`);pdf.destroy?.();}
  async function run(){
    if(!file)return;setBusy(true);setError("");abort.current=false;
    try{
      const pdf=await openPdf(file),selected=parseRange(range,pdf.numPages);
      if(!selected.length)throw new Error("Please enter a valid page range.");
      const JSZip=(await import("jszip")).default,zip=new JSZip();
      for(let i=0;i<selected.length;i++){
        if(abort.current)throw new Error("Canceled.");
        setStage(`Rendering ${i+1}/${selected.length}`);
        const r=await renderPdfPage(pdf,selected[i],scale);
        const type=format==="png"?"image/png":"image/jpeg";
        const b=await canvasToBlob(r.canvas,type,quality);
        zip.file(`page-${String(selected[i]).padStart(3,"0")}.${format==="png"?"png":"jpg"}`,b);
        r.canvas.width=1;r.canvas.height=1;
      }
      pdf.destroy?.();
      setStage("Packing ZIP...");
      const out=await zip.generateAsync({type:"blob"});
      downloadBlob(out,`${file.name.replace(/\.pdf$/i,"")}-${format}.zip`);
      setStage("Done");
    }catch(e){setError(e instanceof Error?e.message:String(e))}
    finally{setBusy(false)}
  }
  return <div className="space-y-4">
    <label className="block cursor-pointer rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-7 text-center"><input type="file" accept="application/pdf" className="hidden" onChange={e=>{const f=e.target.files?.[0];if(f)choose(f)}}/><b>Select PDF</b><p className="mt-1 text-sm text-slate-500">Local rendering. The PDF is not uploaded.</p></label>
    {file&&<div className="rounded-xl bg-blue-50 p-3 text-sm text-blue-900">{file.name} · {pages} pages</div>}
    <div className="grid gap-3 sm:grid-cols-4">
      <label className="text-sm">Pages<input value={range} onChange={e=>setRange(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" placeholder="1-5,8"/></label>
      <label className="text-sm">Format<select value={format} onChange={e=>setFormat(e.target.value as any)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"><option value="jpeg">JPG</option><option value="png">PNG</option></select></label>
      <label className="text-sm">Scale<select value={scale} onChange={e=>setScale(Number(e.target.value))} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"><option value="1">1x</option><option value="1.5">1.5x</option><option value="2">2x</option><option value="3">3x</option></select></label>
      <label className="text-sm">JPG quality<input type="number" min=".4" max="1" step=".05" value={quality} onChange={e=>setQuality(Number(e.target.value)||.9)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"/></label>
    </div>
    <div className="flex gap-3"><button disabled={!file||busy} onClick={run} className="rounded-full bg-blue-600 px-5 py-2.5 text-sm text-white disabled:opacity-40">{busy?"Processing...":"Convert and download ZIP"}</button>{busy&&<button onClick={()=>{abort.current=true}} className="rounded-full border border-rose-200 px-5 py-2.5 text-sm text-rose-600">Cancel</button>}</div>
    {stage&&<p className="text-sm text-slate-500">{stage}</p>}{error&&<p className="text-sm text-rose-600">{error}</p>}
  </div>;
}
