"use client";
import{useRef,useState}from"react";
import{openPdf,renderPdfPage,canvasToBlob,downloadBlob}from"@/lib/tools/pdf-render-client";
import{DOCUMENT_INPUT_ACCEPT,documentIntakeError,documentIntakeText,normalizeDocumentFile}from"@/lib/tools/document/intake-client";
import{useLingxiLang}from"@/lib/lingxi-i18n";

function parseRange(raw:string,max:number){
 if(!raw.trim())return Array.from({length:max},(_,i)=>i+1);
 const out=new Set<number>();
 for(const token of raw.split(",")){const part=token.trim();if(!part)continue;if(part.includes("-")){const[a,b]=part.split("-").map(Number);if(Number.isFinite(a)&&Number.isFinite(b))for(let i=Math.max(1,a);i<=Math.min(max,b);i++)out.add(i)}else{const n=Number(part);if(n>=1&&n<=max)out.add(n)}}
 return[...out].sort((a,b)=>a-b);
}
export default function PdfToImageWorkbench(){
 const{lang}=useLingxiLang();
 const[file,setFile]=useState<File|null>(null),[pages,setPages]=useState(0),[range,setRange]=useState(""),[format,setFormat]=useState<"jpeg"|"png">("jpeg"),[quality,setQuality]=useState(.9),[scale,setScale]=useState(1.5),[busy,setBusy]=useState(false),[stage,setStage]=useState(""),[error,setError]=useState("");
 const abort=useRef(false);
 async function choose(input:File){
  setBusy(true);setError("");
  try{const f=await normalizeDocumentFile(input);setFile(f);const pdf=await openPdf(f);setPages(pdf.numPages);setRange(`1-${pdf.numPages}`);pdf.destroy?.()}
  catch(e){setFile(null);setPages(0);setError(documentIntakeError(lang,e))}
  finally{setBusy(false)}
 }
 async function run(){
  if(!file)return;setBusy(true);setError("");abort.current=false;
  try{const pdf=await openPdf(file),selected=parseRange(range,pdf.numPages);if(!selected.length)throw new Error("INVALID_RANGE");const JSZip=(await import("jszip")).default,zip=new JSZip();
   for(let i=0;i<selected.length;i++){if(abort.current)throw new Error("CANCELED");setStage(`${i+1}/${selected.length}`);const r=await renderPdfPage(pdf,selected[i],scale),type=format==="png"?"image/png":"image/jpeg",b=await canvasToBlob(r.canvas,type,quality);zip.file(`page-${String(selected[i]).padStart(3,"0")}.${format==="png"?"png":"jpg"}`,b);r.canvas.width=1;r.canvas.height=1}
   pdf.destroy?.();setStage("ZIP");const out=await zip.generateAsync({type:"blob"});downloadBlob(out,`${file.name.replace(/\.pdf$/i,"")}-${format}.zip`);setStage("");
  }catch(e){setError(e instanceof Error?e.message:String(e))}finally{setBusy(false)}
 }
 return <div className="space-y-4">
  <label onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();const f=e.dataTransfer.files?.[0];if(f)void choose(f)}} className="block cursor-pointer rounded-2xl border border-dashed border-[var(--lx-line)] bg-[var(--lx-soft)] p-7 text-center">
   <input type="file" accept={DOCUMENT_INPUT_ACCEPT} className="hidden" onChange={e=>{const f=e.target.files?.[0];if(f)void choose(f)}}/>
   <b>{busy?documentIntakeText(lang,"busy"):documentIntakeText(lang,"hint")}</b>
  </label>
  {file&&<div className="rounded-xl border border-[var(--lx-line)] bg-[var(--lx-soft)] p-3 text-sm text-[var(--lx-ink)]">{file.name} · {pages}</div>}
  <div className="grid gap-3 sm:grid-cols-4">
   <label className="text-sm">Pages<input value={range} onChange={e=>setRange(e.target.value)} className="mt-1 w-full rounded-xl border border-[var(--lx-line)] px-3 py-2" placeholder="1-5,8"/></label>
   <label className="text-sm">Format<select value={format} onChange={e=>setFormat(e.target.value as any)} className="mt-1 w-full rounded-xl border border-[var(--lx-line)] px-3 py-2"><option value="jpeg">JPG</option><option value="png">PNG</option></select></label>
   <label className="text-sm">Scale<select value={scale} onChange={e=>setScale(Number(e.target.value))} className="mt-1 w-full rounded-xl border border-[var(--lx-line)] px-3 py-2"><option value="1">1x</option><option value="1.5">1.5x</option><option value="2">2x</option><option value="3">3x</option></select></label>
   <label className="text-sm">JPG<input type="number" min=".4" max="1" step=".05" value={quality} onChange={e=>setQuality(Number(e.target.value)||.9)} className="mt-1 w-full rounded-xl border border-[var(--lx-line)] px-3 py-2"/></label>
  </div>
  <div className="flex gap-3"><button disabled={!file||busy} onClick={run} className="rounded-xl bg-[var(--lx-ink)] px-5 py-2.5 text-sm text-[var(--lx-bg)] disabled:opacity-40">{busy?documentIntakeText(lang,"busy"):"Convert"}</button>{busy&&<button onClick={()=>abort.current=true} className="rounded-xl border border-[var(--lx-danger)] px-5 py-2.5 text-sm text-[var(--lx-danger)]">Cancel</button>}</div>
  {stage&&<p className="text-sm text-[var(--lx-muted)]">{stage}</p>}{error&&<p className="text-sm text-[var(--lx-danger)]">{error}</p>}
 </div>;
}
