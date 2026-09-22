"use client";
import { useRef,useState } from "react";
import { openPdf,renderPdfPage,canvasToBlob,downloadBlob } from "@/lib/tools/pdf-render-client";

export default function PdfOcrWorkbench(){
  const [file,setFile]=useState<File|null>(null),[lang,setLang]=useState("chi_sim+eng"),[text,setText]=useState(""),[busy,setBusy]=useState(false),[stage,setStage]=useState(""),[error,setError]=useState("");
  const stop=useRef(false);
  async function run(){
    if(!file)return;setBusy(true);setText("");setError("");stop.current=false;
    let worker:any=null,pdf:any=null;
    try{
      const {createWorker}=await import("tesseract.js");
      setStage("Loading OCR engine...");
      worker=await createWorker(lang,undefined,{logger:m=>{if(m.status&&typeof m.progress==="number")setStage(`${m.status} · ${Math.round(m.progress*100)}%`)}});
      pdf=await openPdf(file);
      const chunks:string[]=[];
      for(let n=1;n<=pdf.numPages;n++){
        if(stop.current)throw new Error("Canceled.");
        setStage(`OCR page ${n}/${pdf.numPages}`);
        const r=await renderPdfPage(pdf,n,1.6),blob=await canvasToBlob(r.canvas,"image/png",1);
        const result=await worker.recognize(blob);
        chunks.push(`===== Page ${n} =====\n${result.data.text.trim()}`);
        r.canvas.width=1;r.canvas.height=1;
      }
      setText(chunks.join("\n\n"));setStage("Done");
    }catch(e){setError(e instanceof Error?e.message:String(e))}
    finally{try{await worker?.terminate()}catch{}try{pdf?.destroy?.()}catch{}setBusy(false)}
  }
  function downloadTxt(){downloadBlob(new Blob([text],{type:"text/plain;charset=utf-8"}),`${file?.name.replace(/\.pdf$/i,"")||"ocr"}.txt`)}
  return <div className="space-y-4">
    <label className="block cursor-pointer rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-7 text-center"><input type="file" accept="application/pdf" className="hidden" onChange={e=>setFile(e.target.files?.[0]||null)}/><b>Select scanned PDF</b><p className="mt-1 text-sm text-slate-500">PDF pages are rendered and OCR runs locally in your browser.</p></label>
    <select value={lang} onChange={e=>setLang(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2.5"><option value="chi_sim+eng">Simplified Chinese + English</option><option value="chi_tra+eng">Traditional Chinese + English</option><option value="eng">English</option><option value="jpn+eng">Japanese + English</option><option value="kor+eng">Korean + English</option></select>
    <div className="flex gap-3"><button disabled={!file||busy} onClick={run} className="rounded-full bg-blue-600 px-5 py-2.5 text-sm text-white disabled:opacity-40">{busy?"Recognizing...":"Run OCR"}</button>{busy&&<button onClick={()=>stop.current=true} className="rounded-full border border-rose-200 px-5 py-2.5 text-sm text-rose-600">Cancel</button>}</div>
    {stage&&<p className="text-sm text-slate-500">{stage}</p>}
    {text&&<><textarea value={text} onChange={e=>setText(e.target.value)} rows={18} className="w-full rounded-2xl border border-slate-200 p-4 font-mono text-sm"/><div className="flex gap-3"><button onClick={()=>navigator.clipboard.writeText(text)} className="rounded-full border border-slate-200 px-4 py-2 text-sm">Copy</button><button onClick={downloadTxt} className="rounded-full bg-emerald-600 px-4 py-2 text-sm text-white">Download TXT</button></div></>}
    {error&&<p className="text-sm text-rose-600">{error}</p>}
  </div>;
}
