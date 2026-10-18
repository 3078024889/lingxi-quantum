"use client";
import ToolUiText from "@/components/tools/ToolUiText";
import EditableNumberInput from "@/components/ui/EditableNumberInput";

import {useState} from "react";
import {preparePdfLabel} from "@/lib/tools/shared/pdf-label";
import {PDFDocument,StandardFonts,rgb,degrees} from "pdf-lib";
import FileDropzone from "@/components/tools/FileDropzone";
import ResultPanel from "@/components/tools/ResultPanel";
import type {ToolResultFile} from "@/lib/tools/types";
import {openPdf} from "@/lib/tools/pdf-render-client";
import {flattenPdfForm} from "@/lib/tools/shared/pdf-flatten";
type Mode="watermark"|"page-numbers"|"crop"|"flatten"|"compare"|"text"|"markdown";
async function extract(file:File){const pdf=await openPdf(file),pages:string[]=[];for(let p=1;p<=pdf.numPages;p++){const page=await pdf.getPage(p),c=await page.getTextContent();pages.push((c.items||[]).map((x:any)=>String(x.str||"")).join(" "))}pdf.destroy?.();return pages}
const blob=(bytes:Uint8Array)=>new Blob([new Uint8Array(bytes)],{type:"application/pdf"});
export default function PdfExtraWorkbench({mode}:{mode:Mode}){
 const[files,setFiles]=useState<File[]>([]),[busy,setBusy]=useState(false),[error,setError]=useState(""),[results,setResults]=useState<ToolResultFile[]>([]),[text,setText]=useState("CONFIDENTIAL"),[opacity,setOpacity]=useState(.18),[size,setSize]=useState(42),[margin,setMargin]=useState(20),[crop,setCrop]=useState(10);
 const multi=mode==="compare";
 async function run(){setBusy(true);setError("");setResults([]);try{
  if((mode==="compare"&&files.length<2)||(!multi&&!files[0]))throw new Error("FILE_REQUIRED");
  if(mode==="watermark"){const d=await PDFDocument.load(await files[0].arrayBuffer()),label=await preparePdfLabel(d,text,size,rgb(.35,.35,.35));for(const p of d.getPages()){const{width,height}=p.getSize();label.draw(p,{x:width*.18,y:height*.48,opacity,rotate:degrees(-30)})}const b=blob(await d.save());setResults([{name:"watermarked-"+files[0].name,blob:b,mime:"application/pdf",size:b.size}])}
  if(mode==="page-numbers"){const d=await PDFDocument.load(await files[0].arrayBuffer()),font=await d.embedFont(StandardFonts.Helvetica),ps=d.getPages();ps.forEach((p,i)=>{const{width}=p.getSize(),s=String(i+1),w=font.widthOfTextAtSize(s,10);p.drawText(s,{x:(width-w)/2,y:Math.max(8,margin),size:10,font,color:rgb(.2,.2,.2)})});const b=blob(await d.save());setResults([{name:"numbered-"+files[0].name,blob:b,mime:"application/pdf",size:b.size}])}
  if(mode==="crop"){const d=await PDFDocument.load(await files[0].arrayBuffer());for(const p of d.getPages()){const box=p.getCropBox(),m=crop;if(!Number.isFinite(m)||m<0||m*2>=box.width||m*2>=box.height)throw Error('CROP_MARGIN_EXCEEDS_PAGE');p.setCropBox(box.x+m,box.y+m,box.width-m*2,box.height-m*2)}const b=blob(await d.save());setResults([{name:"cropped-"+files[0].name,blob:b,mime:"application/pdf",size:b.size}])}
  if(mode==="flatten"){const d=await PDFDocument.load(await files[0].arrayBuffer());flattenPdfForm(d);const b=blob(await d.save({useObjectStreams:true}));setResults([{name:"flattened-"+files[0].name,blob:b,mime:"application/pdf",size:b.size}])}
  if(mode==="compare"){const[a,b]=await Promise.all([extract(files[0]),extract(files[1])]),max=Math.max(a.length,b.length),lines:string[]=[];for(let i=0;i<max;i++){if((a[i]||"")!==(b[i]||""))lines.push(`## Page ${i+1}\n\n### A\n${a[i]||""}\n\n### B\n${b[i]||""}\n`)}const out=lines.length?lines.join("\n"):"No text-layer differences detected.";const bl=new Blob([out],{type:"text/markdown;charset=utf-8"});setResults([{name:"pdf-compare.md",blob:bl,mime:"text/markdown",size:bl.size}])}
  if(mode==="text"||mode==="markdown"){const pages=await extract(files[0]),content=mode==="markdown"?pages.map((p,i)=>`# Page ${i+1}\n\n${p}`).join("\n\n"):pages.map((p,i)=>`--- Page ${i+1} ---\n${p}`).join("\n\n"),ext=mode==="markdown"?"md":"txt",mime=mode==="markdown"?"text/markdown":"text/plain";const bl=new Blob([content],{type:mime+";charset=utf-8"});setResults([{name:files[0].name.replace(/\.pdf$/i,"")+"."+ext,blob:bl,mime,size:bl.size}])}
 }catch(e){setError(e instanceof Error?e.message:String(e))}finally{setBusy(false)}}
 const title={watermark:"PDF 加水印","page-numbers":"PDF 加页码",crop:"PDF 裁边",flatten:"PDF 扁平化",compare:"PDF 比较",text:"PDF 转 TXT",markdown:"PDF 转 Markdown"}[mode];
 return <div className="space-y-4"><FileDropzone accept="application/pdf,.pdf" multiple={multi} append={multi} maxFiles={multi?2:1} maxSizeMB={200} files={files} onChange={f=>{setFiles(multi?f.slice(0,2):f.slice(0,1));setResults([]);setError("")}} disabled={busy} kind="pdf"/>
 {mode==="watermark"&&<div className="grid gap-3 sm:grid-cols-3"><label className="text-sm"><ToolUiText text="水印文字" /><input value={text} disabled={busy} onChange={e=>{setText(e.target.value);setResults([])}} className="mt-1 w-full rounded-xl border p-2"/></label><label className="text-sm"><ToolUiText text="字号" /><EditableNumberInput type="number" min={8} max={120} value={size} disabled={busy} onChange={e=>{setSize(Number(e.target.value));setResults([])}} className="mt-1 w-full rounded-xl border p-2"/></label><label className="text-sm"><ToolUiText text="透明度" /> {Math.round(opacity*100)}%<input type="range" min=".05" max=".8" step=".05" value={opacity} disabled={busy} onChange={e=>{setOpacity(Number(e.target.value));setResults([])}} className="mt-3 w-full"/></label></div>}
 {mode==="page-numbers"&&<label className="block text-sm"><ToolUiText text="距页面底部 pt" /><EditableNumberInput type="number" min={8} max={200} value={margin} disabled={busy} onChange={e=>{setMargin(Number(e.target.value));setResults([])}} className="ml-3 rounded-lg border p-2"/></label>}
 {mode==="crop"&&<label className="block text-sm"><ToolUiText text="四边裁掉 pt" /><EditableNumberInput type="number" min={0} max={300} value={crop} disabled={busy} onChange={e=>{setCrop(Number(e.target.value));setResults([])}} className="ml-3 rounded-lg border p-2"/></label>}
 {mode==="flatten"&&<p className="text-sm text-[var(--lx-muted)]"><ToolUiText text="将 PDF 表单字段写入页面内容，适合提交、归档或避免字段继续被修改；建议先保留原件。" /></p>}
 {mode==="compare"&&<p className="text-sm text-[var(--lx-muted)]"><ToolUiText text="当前比较 PDF 文本层并按页面列出差异；扫描件应先 OCR。不会把“视觉像素比较”冒充成已经实现。" /></p>}
 {(mode==="text"||mode==="markdown")&&<p className="text-sm text-[var(--lx-muted)]"><ToolUiText text="提取已有文本层；扫描 PDF 请先使用 PDF OCR 或 PDF 转 Word 的自动 OCR。" /></p>}
 <button disabled={busy||files.length<(multi?2:1)} onClick={run} className="rounded-xl bg-[var(--lx-ink)] px-5 py-2.5 text-sm text-[var(--lx-bg)] disabled:opacity-40"><ToolUiText text={busy?"处理中…":title} /></button>{results.length>0&&<ResultPanel files={results} messageZh={`${title}完成。`} messageEn="Done."/>}{error&&<p role="alert" className="text-sm text-[var(--lx-danger)]"><ToolUiText text={error==='CROP_MARGIN_EXCEEDS_PAGE'?'裁边距必须小于每页宽度和高度的一半。':error}/></p>}</div>
}
