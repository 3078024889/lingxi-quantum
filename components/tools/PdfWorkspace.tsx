"use client";
import {useEffect,useRef,useState} from 'react';
import {PDFDocument} from 'pdf-lib';
import {useIncomingToolFiles} from '@/lib/tools/workspace/use-incoming-tool-files';
import {useLingxiLang} from '@/lib/lingxi-i18n';
import {openPdf,renderPdfPage} from '@/lib/tools/pdf-render-client';
import {buildWorkspacePdfs,moveWorkspacePage,type WorkspacePage} from '@/lib/tools/shared/pdf-workspace';
import {claimToolStart,toolAccessMessage,ToolAccessError} from '@/lib/tools/commerce/tool-start-client';
import type {ToolResultFile} from '@/lib/tools/types';
import FileDropzone from './FileDropzone';
import ResultPanel from './ResultPanel';

function Thumbnail({file,page,rotation}:{file:File;page:number;rotation:number}){
 const canvas=useRef<HTMLCanvasElement>(null),host=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  let cancelled=false,pdf:any,started=false;
  const draw=async()=>{if(started)return;started=true;try{
   pdf=await openPdf(file);if(cancelled)return;
   const rendered=await renderPdfPage(pdf,page+1,.25);
   if(!cancelled&&canvas.current){canvas.current.width=rendered.width;canvas.current.height=rendered.height;canvas.current.getContext('2d')?.drawImage(rendered.canvas,0,0)}
  }catch{/* Page numbers and controls remain available if preview fails. */}finally{void pdf?.destroy()}};
  const observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){observer.disconnect();void draw()}},{rootMargin:'100px'});
  if(host.current)observer.observe(host.current);
  return()=>{cancelled=true;observer.disconnect();void pdf?.destroy()};
 },[file,page]);
 return <div ref={host} className="flex h-44 items-center justify-center overflow-hidden rounded-xl bg-slate-100 p-4"><canvas ref={canvas} aria-hidden="true" className="max-h-full max-w-full bg-white shadow-sm" style={{transform:`rotate(${rotation}deg)`}}/></div>;
}

export default function PdfWorkspace(){
 const {lang}=useLingxiLang(),zh=lang==='zh';
 const [files,setFiles]=useState<File[]>([]),[items,setItems]=useState<WorkspacePage[]>([]),[past,setPast]=useState<WorkspacePage[][]>([]);
 const [busy,setBusy]=useState(false),[separate,setSeparate]=useState(false),[error,setError]=useState(''),[results,setResults]=useState<ToolResultFile[]>([]);
 const itemsRef=useRef(items);itemsRef.current=items;
 const version=useRef(0),drag=useRef<string|null>(null),claim=useRef<string|null>(null);
 function edit(update:(items:WorkspacePage[])=>WorkspacePage[]){const current=itemsRef.current,next=update(current);if(next===current)return;itemsRef.current=next;setPast(history=>[...history.slice(-19),current]);setResults([]);setItems(next)}
 async function choose(next:File[]){
  const current=++version.current;setFiles(next);setResults([]);setItems([]);setPast([]);setError('');claim.current=null;
  try{
   if(next.reduce((sum,file)=>sum+file.size,0)>400*1024*1024)throw Error('SIZE_LIMIT');
   const pages:WorkspacePage[]=[];
   for(const [fileIndex,file] of next.entries()){
    const document=await PDFDocument.load(await file.arrayBuffer());
    for(let page=0;page<document.getPageCount();page++){pages.push({id:`${fileIndex}:${page}`,file:fileIndex,page,rotation:0});if(pages.length>500)throw Error('PAGE_LIMIT')}
   }
   if(current===version.current)setItems(pages);
  }catch{if(current===version.current)setError(zh?'无法读取这批 PDF。请检查文件，最多可整理500页、共400MB。':'Cannot read these PDFs. Use up to 500 pages and 400 MB total.')}
 }
 useIncomingToolFiles(next=>choose(next));
 async function run(){
  if(busy||!items.length)return;setBusy(true);setError('');setResults([]);
  try{
   claim.current??=crypto.randomUUID();await claimToolStart('pdf-workspace',1,claim.current);
   const output=await buildWorkspacePdfs(files,items,separate);
   setResults(output.map(file=>{const blob=new Blob([new Uint8Array(file.bytes)],{type:'application/pdf'});return{name:file.name,blob,mime:blob.type,size:blob.size}}));claim.current=null;
  }catch(error){setError(error instanceof ToolAccessError?toolAccessMessage(lang,error.code):zh?'处理没有完成，原文件未修改。请检查文件后重试。':'Processing did not finish. Your original files are unchanged; check them and retry.')}
  finally{setBusy(false)}
 }
 return <div className="space-y-5">
  <FileDropzone accept="application/pdf,.pdf" multiple maxFiles={20} maxSizeMB={200} files={files} onChange={next=>void choose(next)} disabled={busy} kind="pdf" authorize={false} normalizeDocuments={false}/>
  <p className="text-sm text-slate-500">{zh?'一次选择多个 PDF 即可合并。按住页面上的拖动按钮排序，也可以用前后移动按钮。':'Choose several PDFs to merge them. Drag page handles to reorder, or use the move buttons.'}</p>
  {!!(items.length||past.length)&&<>
   <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4"><b>{items.length} {zh?'页':'pages'}</b><button type="button" disabled={!past.length||busy} className="min-h-11 rounded-xl border px-4 disabled:opacity-40" onClick={()=>{const last=past[past.length-1];if(last){setItems(last);setPast(past.slice(0,-1));setResults([])}}}>{zh?'撤销':'Undo'}</button><label className="flex min-h-11 items-center gap-2"><input type="checkbox" checked={separate} disabled={busy} onChange={event=>{setSeparate(event.target.checked);setResults([])}}/>{zh?'每页分别保存':'Save each page separately'}</label></div>
   <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">{items.map((item,index)=><article key={item.id} data-page-key={item.id} className="min-w-0 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
    <Thumbnail file={files[item.file]} page={item.page} rotation={item.rotation}/><p className="mt-3 truncate text-sm font-medium" title={files[item.file].name}>{files[item.file].name}</p><p className="text-xs text-slate-500">{zh?'原页码':'Original page'} {item.page+1} · {zh?'当前位置':'Position'} {index+1}</p>
    <div className="mt-3 flex flex-wrap gap-1.5">
     <button type="button" disabled={busy} aria-label={zh?'拖动排序':'Drag to reorder'} className="min-h-11 touch-none rounded-lg border px-3" onPointerDown={event=>{drag.current=item.id;event.currentTarget.setPointerCapture(event.pointerId)}} onPointerMove={event=>{if(!drag.current)return;const target=document.elementFromPoint(event.clientX,event.clientY)?.closest<HTMLElement>('[data-page-key]')?.dataset.pageKey;if(target)edit(current=>moveWorkspacePage(current,drag.current!,target))}} onPointerUp={()=>{drag.current=null}} onPointerCancel={()=>{drag.current=null}}>⠿</button>
     <button type="button" disabled={busy||index===0} aria-label={zh?'向前移动':'Move earlier'} className="min-h-11 rounded-lg border px-3 disabled:opacity-30" onClick={()=>edit(current=>moveWorkspacePage(current,item.id,current[index-1].id))}>←</button>
     <button type="button" disabled={busy||index===items.length-1} aria-label={zh?'向后移动':'Move later'} className="min-h-11 rounded-lg border px-3 disabled:opacity-30" onClick={()=>edit(current=>moveWorkspacePage(current,item.id,current[index+1].id))}>→</button>
     <button type="button" disabled={busy} aria-label={zh?'旋转页面':'Rotate page'} className="min-h-11 rounded-lg border px-3" onClick={()=>edit(current=>current.map(page=>page.id===item.id?{...page,rotation:(page.rotation+90)%360}:page))}>↻</button>
     <button type="button" disabled={busy} className="min-h-11 rounded-lg border px-3 text-rose-600" onClick={()=>edit(current=>current.filter(page=>page.id!==item.id))}>{zh?'删除':'Delete'}</button>
    </div>
   </article>)}</div>
  </>}
  <button type="button" disabled={busy||!items.length} onClick={()=>void run()} className="min-h-12 rounded-xl bg-violet-600 px-6 py-3 font-semibold text-white disabled:opacity-40">{busy?(zh?'正在生成…':'Preparing…'):(zh?'生成整理后的 PDF':'Create organized PDF')}</button>
  {error&&<p role="alert" className="text-sm text-rose-700">{error}</p>}
  {results.length>0&&<ResultPanel sourceSlug="pdf-workspace" files={results} messageZh="页面已整理完成，可保存或继续处理。" messageEn="Your pages are organized. Save or continue processing."/>}
 </div>;
}
