"use client";
import {plainText,plainMessage} from "@/lib/tools/plain-copy";

import {useRef,useState} from "react";import {PDFDocument,degrees} from "pdf-lib";import ResultPanel from "@/components/tools/ResultPanel";import FileDropzone from "@/components/tools/FileDropzone";import {useLingxiLang} from "@/lib/lingxi-i18n";import type {ToolResultFile} from "@/lib/tools/types";
type Item={source:number;rotation:number};
export default function PdfPageManagerWorkbench(){const{lang}=useLingxiLang();const[files,setFiles]=useState<File[]>([]),[items,setItems]=useState<Item[]>([]),[busy,setBusy]=useState(false),[error,setError]=useState(""),[result,setResult]=useState<ToolResultFile[]>([]);const file=files[0]||null;const selectionVersion=useRef(0);
 function applyItems(updater:(items:Item[])=>Item[]){setResult([]);setError("");setItems(updater)}
 async function choose(next:File[]){
  const version=++selectionVersion.current;
  setFiles(next);setResult([]);setError("");setItems([]);
  if(!next[0])return;
  try{
   const doc=await PDFDocument.load(await next[0].arrayBuffer());
   if(version===selectionVersion.current)setItems(Array.from({length:doc.getPageCount()},(_,i)=>({source:i,rotation:0})));
  }catch{
   if(version===selectionVersion.current){setItems([]);setError(plainText(lang,"pdfError"))}
  }
 }
 function move(i:number,delta:number){
  applyItems(v=>{const j=i+delta;if(j<0||j>=v.length)return v;const next=[...v];[next[i],next[j]]=[next[j],next[i]];return next})
 }
 async function exportPdf(){if(!file||!items.length)return;setBusy(true);setError("");setResult([]);try{const src=await PDFDocument.load(await file.arrayBuffer()),out=await PDFDocument.create();for(const it of items){const[p]=await out.copyPages(src,[it.source]);p.setRotation(degrees(((p.getRotation().angle+it.rotation)%360+360)%360));out.addPage(p)}const bytes=await out.save({useObjectStreams:true}),blob=new Blob([new Uint8Array(bytes)],{type:"application/pdf"});setResult([{name:`pages-${file.name}`,blob,mime:"application/pdf",size:blob.size}])}catch(e){setError(plainText(lang,"pdfError"))}finally{setBusy(false)}}
 return <div className="space-y-4"><FileDropzone accept="application/pdf,.pdf" files={files} onChange={f=>void choose(f)} disabled={busy} kind="pdf" maxSizeMB={200}/>{items.length>0&&<><div className="flex items-center justify-between gap-3"><p className="text-sm text-[var(--lx-muted)]">{plainText(lang,"pageCount",{count:items.length})+" · "+plainText(lang,"reorder")}</p><button onClick={()=>applyItems(()=>[])} disabled={busy} className="text-xs text-[var(--lx-faint)] hover:text-[var(--lx-ink)]">{plainText(lang,"clearPages")}</button></div><div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{items.map((it,i)=><div key={`${it.source}-${i}`} data-testid="pdf-page-manager-item" className="flex flex-wrap items-center gap-2 rounded-xl border border-[var(--lx-line)] bg-[var(--lx-soft)] p-3 text-sm"><b className="basis-full text-[var(--lx-ink)] sm:mr-auto sm:basis-auto">{plainText(lang,"page",{count:it.source+1})}</b><button disabled={busy||i===0} onClick={()=>move(i,-1)} className="min-h-[44px] rounded-lg border border-[var(--lx-line)] px-3 py-2 text-sm disabled:opacity-30" aria-label={plainText(lang,"up")}>↑</button><button disabled={busy||i===items.length-1} onClick={()=>move(i,1)} className="min-h-[44px] rounded-lg border border-[var(--lx-line)] px-3 py-2 text-sm disabled:opacity-30" aria-label={plainText(lang,"down")}>↓</button><button disabled={busy} onClick={()=>applyItems(v=>v.map((x,j)=>j===i?{...x,rotation:(x.rotation+90)%360}:x))} className="min-h-[44px] rounded-lg border border-[var(--lx-line)] px-3 py-2 text-sm" aria-label={plainText(lang,"rotate")}>↻{it.rotation?` ${it.rotation}°`:""}</button><button disabled={busy} onClick={()=>applyItems(v=>v.filter((_,j)=>j!==i))} className="min-h-[44px] rounded-lg border border-[var(--lx-line)] px-3 py-2 text-sm text-[var(--lx-danger)]">{plainText(lang,"delete")}</button></div>)}</div></>}<button disabled={!items.length||busy} onClick={exportPdf} className="rounded-xl bg-[var(--lx-ink)] px-5 py-2.5 text-sm font-medium text-[var(--lx-bg)] disabled:opacity-40">{busy?plainText(lang,"working"):plainText(lang,"preview")}</button>{result.length>0&&<ResultPanel files={result} messageZh={plainText(lang,"ready")} messageEn={plainText(lang,"ready")} details={{pages:items.length}}/>}{error&&<p role="alert" className="text-sm text-[var(--lx-danger)]">{plainMessage(lang,error)}</p>}</div>}
