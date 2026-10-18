"use client";
import ToolUiText from "@/components/tools/ToolUiText";
import {useMemo,useState} from "react";
import {PDFDocument} from "pdf-lib";
import {cleanPdfMetadata,inspectPdfMetadata} from '@/lib/tools/shared/pdf-metadata';
import {stripImageMetadata} from '@/lib/tools/shared/image-canvas';
import FileDropzone from "@/components/tools/FileDropzone";
import ResultPanel from "@/components/tools/ResultPanel";
import {useLingxiLang} from "@/lib/lingxi-i18n";
import type {ToolResultFile} from "@/lib/tools/types";
type Scan={name:string;kind:string;risks:string[]};
async function scanOne(file:File):Promise<Scan>{if(file.type==="application/pdf"||file.name.toLowerCase().endsWith(".pdf")){const d=await PDFDocument.load(await file.arrayBuffer(),{updateMetadata:false});const meta=inspectPdfMetadata(d),risks=Object.keys(meta.fields);if(meta.xmpStreams)risks.push("XMP: "+meta.xmpStreams);return{name:file.name,kind:"PDF",risks}}if(file.type.startsWith("image/"))return{name:file.name,kind:"Image",risks:["EXIF / GPS / device metadata may exist; browser re-encode removes common metadata"]};return{name:file.name,kind:"Unsupported",risks:["Unsupported file type"]}}
async function cleanOne(file:File){
 if(file.type==="application/pdf"||file.name.toLowerCase().endsWith(".pdf")){
  const {bytes}=await cleanPdfMetadata(await file.arrayBuffer()),copy=new Uint8Array(bytes.length);copy.set(bytes);
  return{name:file.name,blob:new Blob([copy.buffer],{type:"application/pdf"})};
 }
 if(file.type.startsWith("image/"))return stripImageMetadata(file);
 throw new Error("UNSUPPORTED_FILE");
}
export default function PrivacyCleanerWorkbench(){const{lang}=useLingxiLang(),zh=lang==="zh";const[files,setFiles]=useState<File[]>([]),[busy,setBusy]=useState(false),[error,setError]=useState(""),[scans,setScans]=useState<Scan[]>([]),[results,setResults]=useState<ToolResultFile[]>([]);
 async function scan(){setBusy(true);setError("");setScans([]);try{const out=[] as Scan[];for(const f of files)out.push(await scanOne(f));setScans(out)}catch{setError("无法处理此文件。请确认文件完整、可以打开，解锁加密文件后再试。")}finally{setBusy(false)}}
 async function clean(){setBusy(true);setError("");setResults([]);try{const out:ToolResultFile[]=[];for(const f of files){const {name,blob}=await cleanOne(f);out.push({name:"clean-"+name,blob,mime:blob.type||"application/octet-stream",size:blob.size})}setResults(out)}catch{setError("无法处理此文件。请确认文件完整、可以打开，解锁加密文件后再试。")}finally{setBusy(false)}}
 const total=useMemo(()=>results.reduce((n,x)=>n+x.size,0),[results]);return <div className="space-y-4"><FileDropzone accept="image/*,application/pdf,.pdf" multiple maxFiles={50} maxSizeMB={50} files={files} onChange={f=>{setFiles(f);setResults([]);setScans([]);setError("")}} disabled={busy}/><p className="text-sm leading-6 text-[var(--lx-muted)]"><ToolUiText text={zh?"先扫描风险，再决定是否清理。图片通过重新编码去除常见 EXIF/GPS；PDF 清除标题、作者、主题、关键词、Creator/Producer 等属性。":"Scan first, then clean. Images are re-encoded to remove common EXIF/GPS data; PDF document metadata is cleared."} /></p><div className="flex gap-2"><button disabled={!files.length||busy} onClick={scan} className="rounded-xl border border-[var(--lx-line)] px-5 py-2.5 text-sm disabled:opacity-40"><ToolUiText text={zh?"扫描隐私信息":"Scan metadata"} /></button><button disabled={!files.length||busy} onClick={clean} className="rounded-xl bg-[var(--lx-ink)] px-5 py-2.5 text-sm text-[var(--lx-bg)] disabled:opacity-40"><ToolUiText text={zh?"清除并导出":"Clean & export"} /></button></div>{scans.length>0&&<div className="space-y-2">{scans.map(s=><div key={s.name} className="rounded-xl border border-[var(--lx-line)] p-3 text-sm"><b>{s.name}</b><span className="ml-2 text-xs text-[var(--lx-faint)]">{s.kind}</span><p className="mt-1 text-xs leading-5 text-[var(--lx-muted)]">{s.risks.length?s.risks.join(" · "):(zh?"未发现常见文档属性风险":"No common document-metadata risk found")}</p></div>)}</div>}{!!results.length&&<ResultPanel files={results} messageZh="隐私信息清理完成，可以核对结果再下载。" messageEn="Privacy cleanup finished. Review before downloading." details={{files:results.length,resultKB:Number((total/1024).toFixed(1))}}/>}{error&&<p role="alert" className="text-sm text-[var(--lx-danger)]"><ToolUiText text={error}/></p>}</div>}
