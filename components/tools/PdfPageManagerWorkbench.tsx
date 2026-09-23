"use client";
import { useState } from "react";
import { PDFDocument,degrees } from "pdf-lib";
import { downloadBlob } from "@/lib/tools/pdf-render-client";

type Item={source:number;rotation:number};
export default function PdfPageManagerWorkbench(){
  const [file,setFile]=useState<File|null>(null),[items,setItems]=useState<Item[]>([]),[busy,setBusy]=useState(false),[error,setError]=useState("");
  async function choose(f:File){setFile(f);const d=await PDFDocument.load(await f.arrayBuffer());setItems(Array.from({length:d.getPageCount()},(_,i)=>({source:i,rotation:0})));}
  function move(i:number,delta:number){setItems(v=>{const n=[...v],j=i+delta;if(j<0||j>=n.length)return v;[n[i],n[j]]=[n[j],n[i]];return n})}
  async function exportPdf(){if(!file)return;setBusy(true);setError("");try{const src=await PDFDocument.load(await file.arrayBuffer()),out=await PDFDocument.create();for(const it of items){const [p]=await out.copyPages(src,[it.source]);p.setRotation(degrees(((p.getRotation().angle+it.rotation)%360+360)%360));out.addPage(p)}const b=await out.save(),c=new Uint8Array(b.length);c.set(b);downloadBlob(new Blob([c.buffer],{type:"application/pdf"}),`pages-${file.name}`)}catch(e){setError(e instanceof Error?e.message:String(e))}finally{setBusy(false)}}
  return <div className="space-y-4">
    <label onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();const f=e.dataTransfer.files?.[0];if(f)choose(f)}} className="block cursor-pointer rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-7 text-center"><input type="file" accept="application/pdf" className="hidden" onChange={e=>{const f=e.target.files?.[0];if(f)choose(f)}}/><b>Select PDF</b><p className="mt-1 text-sm text-slate-500">Reorder, delete and rotate pages without uploading the file.</p></label>
    {items.length>0&&<div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{items.map((it,i)=><div key={`${it.source}-${i}`} className="flex items-center gap-2 rounded-xl border border-slate-200 p-3 text-sm"><b className="mr-auto">Page {it.source+1}</b><button onClick={()=>move(i,-1)} className="rounded border px-2 py-1">↑</button><button onClick={()=>move(i,1)} className="rounded border px-2 py-1">↓</button><button onClick={()=>setItems(v=>v.map((x,j)=>j===i?{...x,rotation:(x.rotation+90)%360}:x))} className="rounded border px-2 py-1">↻ {it.rotation||""}</button><button onClick={()=>setItems(v=>v.filter((_,j)=>j!==i))} className="rounded border border-rose-200 px-2 py-1 text-rose-600">Delete</button></div>)}</div>}
    <button disabled={!items.length||busy} onClick={exportPdf} className="rounded-full bg-blue-600 px-5 py-2.5 text-sm text-white disabled:opacity-40">{busy?"Exporting...":"Export reordered PDF"}</button>
    {error&&<p className="text-sm text-rose-600">{error}</p>}
  </div>;
}
