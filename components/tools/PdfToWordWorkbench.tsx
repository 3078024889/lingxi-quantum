"use client";
import {useEffect,useState} from "react";
import FileDropzone from "@/components/tools/FileDropzone";
import ResultPanel from "@/components/tools/ResultPanel";
import PaidActionButton from "@/components/tools/PaidActionButton";
import type {ToolResultFile} from "@/lib/tools/types";
import {openPdf,renderPdfPage,canvasToBlob} from "@/lib/tools/pdf-render-client";
import {buildEditableDocx,buildVisualDocx} from "@/lib/tools/shared/docx-builder";
type Mode="editable"|"visual"|"both";
const LANGS=[["chi_sim+eng","简体中文 + English"],["chi_tra+eng","繁體中文 + English"],["eng","English"],["jpn+eng","日本語 + English"],["kor+eng","한국어 + English"],["fra+eng","Français + English"],["deu+eng","Deutsch + English"],["spa+eng","Español + English"]] as const;
async function pageText(page:any){
 const c=await page.getTextContent();let lastY:number|null=null,out="";
 for(const it of c.items||[]){const y=Number(it.transform?.[5]||0),s=String(it.str||"");if(lastY!==null&&Math.abs(y-lastY)>3)out+="\n";else if(out&&!out.endsWith("\n"))out+=" ";out+=s;lastY=y}
 return out.trim();
}
export default function PdfToWordWorkbench(){
 const[files,setFiles]=useState<File[]>([]),[pageCount,setPageCount]=useState(0),[mode,setMode]=useState<Mode>("both"),[ocr,setOcr]=useState(true),[lang,setLang]=useState("chi_sim+eng"),[busy,setBusy]=useState(false),[stage,setStage]=useState(""),[error,setError]=useState(""),[results,setResults]=useState<ToolResultFile[]>([]);
 useEffect(()=>{let active=true;void(async()=>{let total=0;for(const f of files){try{const pdf=await openPdf(f);total+=pdf.numPages;pdf.destroy?.()}catch{}}if(active)setPageCount(total)})();return()=>{active=false}},[files]);
 async function run(){
  setBusy(true);setResults([]);setError("");let worker:any=null;
  try{
   if(ocr){const{createWorker}=await import("tesseract.js");worker=await createWorker(lang,undefined,{logger:m=>{if(m.status&&typeof m.progress==="number")setStage(`${m.status} · ${Math.round(m.progress*100)}%`)}})}
   const outs:ToolResultFile[]=[];
   for(let fi=0;fi<files.length;fi++){
    const file=files[fi],pdf=await openPdf(file),texts:string[]=[],images:Array<{bytes:Uint8Array;width:number;height:number}>=[];
    for(let p=1;p<=pdf.numPages;p++){
     setStage(`${fi+1}/${files.length} · page ${p}/${pdf.numPages}`);
     const page=await pdf.getPage(p);let text=await pageText(page);
     if((mode==="editable"||mode==="both")&&ocr&&text.replace(/\s/g,"").length<24){
      const r=await renderPdfPage(pdf,p,2);
      const b=await canvasToBlob(r.canvas,"image/png");
      const rr=await worker.recognize(b);text=String(rr.data.text||"").trim();r.canvas.width=r.canvas.height=1;
     }
     texts.push(text);
     if(mode==="visual"||mode==="both"){
      const r=await renderPdfPage(pdf,p,1.7),b=await canvasToBlob(r.canvas,"image/png"),bytes=new Uint8Array(await b.arrayBuffer());
      images.push({bytes,width:r.width,height:r.height});r.canvas.width=r.canvas.height=1;
     }
    }
    pdf.destroy?.();const stem=file.name.replace(/\.pdf$/i,"");
    if(mode==="editable"||mode==="both")outs.push(await buildEditableDocx(texts,`${stem}-editable.docx`));
    if(mode==="visual"||mode==="both")outs.push(await buildVisualDocx(images,`${stem}-visual.docx`));
   }
   setResults(outs);setStage("完成");
  }catch(e){setError(e instanceof Error?e.message:String(e));setStage("")}finally{try{await worker?.terminate()}catch{}setBusy(false)}
 }
 return <div className="space-y-4"><FileDropzone accept="application/pdf,.pdf" multiple append maxFiles={10} maxSizeMB={200} files={files} onChange={f=>{setFiles(f);setResults([]);setError("")}} disabled={busy} kind="pdf"/>
 <div className="grid gap-3 sm:grid-cols-2"><label className="text-sm">Word 输出方式<select value={mode} onChange={e=>setMode(e.target.value as Mode)} className="mt-1 w-full rounded-xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-2"><option value="both">可编辑版 + 版式保真版</option><option value="editable">可编辑 Word</option><option value="visual">版式保真 Word</option></select></label><label className="text-sm">扫描件 OCR 语言<select value={lang} onChange={e=>setLang(e.target.value)} className="mt-1 w-full rounded-xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-2">{LANGS.map(([v,n])=><option key={v} value={v}>{n}</option>)}</select></label></div>
 <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={ocr} onChange={e=>setOcr(e.target.checked)}/>文本层不足时自动 OCR 扫描页</label>
 <div className="rounded-xl bg-[var(--lx-soft)] p-3 text-xs leading-5 text-[var(--lx-muted)]">可编辑版优先提取 PDF 原始文本层；扫描页再 OCR。版式保真版把每页原貌嵌入 Word，适合保持视觉结构。复杂表格、分栏和字体不保证与原稿 1:1，还应人工核对。</div>
 {files.length>0&&pageCount>0&&!busy&&<PaidActionButton toolId="pdf-to-word" quantity={pageCount} metadata={{pages:pageCount,files:files.length,mode,ocr}} onPaid={run} label={`查看 PDF 转 Word 价格 · ${pageCount}页`}/>}{stage&&<p className="text-sm text-[var(--lx-muted)]">{stage}</p>}{results.length>0&&<ResultPanel sourceSlug="pdf-to-word" files={results} messageZh="Word 已生成；建议先核对复杂排版和 OCR 内容。" messageEn="Word files are ready. Review complex layout and OCR output."/>}{error&&<p className="text-sm text-[var(--lx-danger)]">{error}</p>}</div>
}
