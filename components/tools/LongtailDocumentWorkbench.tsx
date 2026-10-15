"use client";

import ToolUiText from "@/components/tools/ToolUiText";
import {calendarToCsv,contactsToCsv} from "@/lib/tools/shared/calendar-contact";
import { useState } from "react";
import {openBoundedArchive,readArchiveText} from '@/lib/files/bounded-archive';
import {readEpub} from '@/lib/files/epub-reader';

import FileDropzone from "@/components/tools/FileDropzone";
import ResultPanel from "@/components/tools/ResultPanel";
import type { ToolResultFile } from "@/lib/tools/types";

export type LongtailMode="epub-txt"|"odt-txt"|"ics-csv"|"vcf-csv";

function textBlob(name:string,text:string,type="text/plain;charset=utf-8"):ToolResultFile{
 const blob=new Blob([text],{type});
 return{name,blob,mime:type,size:blob.size};
}
function xml(raw:string){return new DOMParser().parseFromString(raw,"application/xml")}

async function epubToText(file:File){
 return (await readEpub(file)).text;
}

async function odtToText(file:File){
 const zip=await openBoundedArchive(file),raw=await readArchiveText(zip,"content.xml");
 if(!raw)throw new Error("ODT_CONTENT_MISSING");
 const doc=xml(raw),blocks=Array.from(doc.getElementsByTagName("*")).filter(n=>{
  const name=n.localName;return name==="p"||name==="h";
 }).map(n=>(n.textContent||"").trim()).filter(Boolean);
 return blocks.join("\n");
}


export default function LongtailDocumentWorkbench({mode}:{mode:LongtailMode}){
 const[files,setFiles]=useState<File[]>([]),[busy,setBusy]=useState(false),[error,setError]=useState(""),[results,setResults]=useState<ToolResultFile[]>([]);
 const accept=mode==="epub-txt"?".epub,application/epub+zip":mode==="odt-txt"?".odt,application/vnd.oasis.opendocument.text":mode==="ics-csv"?".ics,text/calendar":".vcf,text/vcard,text/x-vcard";
 async function run(){
  setBusy(true);setError("");setResults([]);
  try{
   const out:ToolResultFile[]=[];
   for(const file of files){
    if(mode==="epub-txt")out.push(textBlob(file.name.replace(/\.epub$/i,"")+".txt",await epubToText(file)));
    if(mode==="odt-txt")out.push(textBlob(file.name.replace(/\.odt$/i,"")+".txt",await odtToText(file)));
    if(mode==="ics-csv")out.push(textBlob(file.name.replace(/\.ics$/i,"")+".csv",calendarToCsv(await file.text()),"text/csv;charset=utf-8"));
    if(mode==="vcf-csv")out.push(textBlob(file.name.replace(/\.vcf$/i,"")+".csv",contactsToCsv(await file.text()),"text/csv;charset=utf-8"));
   }
   setResults(out);
  }catch(cause){setError(cause instanceof Error?cause.message:String(cause))}
  finally{setBusy(false)}
 }
 return <div className="space-y-4">
  <FileDropzone accept={accept} multiple append maxFiles={50} maxSizeMB={mode==="ics-csv"||mode==="vcf-csv"?10:50} files={files} onChange={f=>{setFiles(f);setResults([]);setError("")}} disabled={busy}/>

  <button disabled={!files.length||busy} onClick={run} className="rounded-xl bg-[var(--lx-ink)] px-5 py-2.5 text-sm text-[var(--lx-bg)] disabled:opacity-40"><ToolUiText text={busy?"处理中…":"开始处理"} /></button>
  {!!results.length&&<ResultPanel files={results} messageZh={`已处理 ${results.length} 个文件。`} messageEn={`Processed ${results.length} file(s).`}/>}
  {error&&<p className="text-sm text-[var(--lx-danger)]">{error}</p>}
 </div>
}
