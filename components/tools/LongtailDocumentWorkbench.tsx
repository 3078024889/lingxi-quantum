"use client";

import { useState } from "react";
import JSZip from "jszip";
import FileDropzone from "@/components/tools/FileDropzone";
import ResultPanel from "@/components/tools/ResultPanel";
import type { ToolResultFile } from "@/lib/tools/types";

export type LongtailMode="epub-txt"|"odt-txt"|"ics-csv"|"vcf-csv";

function textBlob(name:string,text:string,type="text/plain;charset=utf-8"):ToolResultFile{
 const blob=new Blob([text],{type});
 return{name,blob,mime:type,size:blob.size};
}
function xml(raw:string){return new DOMParser().parseFromString(raw,"application/xml")}
function htmlText(raw:string){
 const doc=new DOMParser().parseFromString(raw,"text/html");
 return (doc.body?.innerText||doc.body?.textContent||"").replace(/\n{3,}/g,"\n\n").trim();
}
function csvCell(value:string){return `"${String(value||"").replace(/"/g,'""').replace(/\r?\n/g," ")}"`}

async function epubToText(file:File){
 const zip=await JSZip.loadAsync(file);
 const container=await zip.file("META-INF/container.xml")?.async("string");
 if(!container)throw new Error("EPUB_CONTAINER_MISSING");
 const c=xml(container),root=c.querySelector("rootfile")?.getAttribute("full-path");
 if(!root)throw new Error("EPUB_PACKAGE_MISSING");
 const opfRaw=await zip.file(root)?.async("string");
 if(!opfRaw)throw new Error("EPUB_OPF_MISSING");
 const opf=xml(opfRaw),base=root.includes("/")?root.slice(0,root.lastIndexOf("/")+1):"";
 const manifest=new Map<string,string>();
 opf.querySelectorAll("manifest item").forEach(node=>{
  const id=node.getAttribute("id"),href=node.getAttribute("href");
  if(id&&href)manifest.set(id,decodeURIComponent(href));
 });
 const parts:string[]=[];
 for(const item of Array.from(opf.querySelectorAll("spine itemref"))){
  const href=manifest.get(item.getAttribute("idref")||"");if(!href)continue;
  const raw=await zip.file(base+href)?.async("string");if(!raw)continue;
  const text=htmlText(raw);if(text)parts.push(text);
 }
 if(!parts.length)throw new Error("EPUB_TEXT_EMPTY");
 return parts.join("\n\n");
}

async function odtToText(file:File){
 const zip=await JSZip.loadAsync(file),raw=await zip.file("content.xml")?.async("string");
 if(!raw)throw new Error("ODT_CONTENT_MISSING");
 const doc=xml(raw),blocks=Array.from(doc.getElementsByTagName("*")).filter(n=>{
  const name=n.localName;return name==="p"||name==="h";
 }).map(n=>(n.textContent||"").trim()).filter(Boolean);
 return blocks.join("\n");
}

function unfold(raw:string){return raw.replace(/\r?\n[ \t]/g,"")}
function parseIcs(raw:string){
 const events=unfold(raw).split("BEGIN:VEVENT").slice(1).map(part=>part.split("END:VEVENT")[0]);
 const rows=[["summary","start","end","location","description","uid"]];
 const get=(block:string,key:string)=>block.match(new RegExp(`(?:^|\\n)${key}(?:;[^:]*)?:(.*)`,"i"))?.[1]?.trim()||"";
 for(const e of events)rows.push([get(e,"SUMMARY"),get(e,"DTSTART"),get(e,"DTEND"),get(e,"LOCATION"),get(e,"DESCRIPTION").replace(/\\\\n/g," "),get(e,"UID")]);
 return rows.map(r=>r.map(csvCell).join(",")).join("\n");
}
function parseVcf(raw:string){
 const cards=unfold(raw).split(/BEGIN:VCARD/i).slice(1).map(x=>x.split(/END:VCARD/i)[0]);
 const rows=[["name","organization","title","phones","emails"]];
 const vals=(block:string,key:string)=>[...block.matchAll(new RegExp(`(?:^|\\n)${key}(?:;[^:]*)?:(.*)`,"ig"))].map(m=>m[1].trim());
 for(const c of cards)rows.push([vals(c,"FN")[0]||vals(c,"N")[0]||"",vals(c,"ORG")[0]||"",vals(c,"TITLE")[0]||"",vals(c,"TEL").join(" | "),vals(c,"EMAIL").join(" | ")]);
 return rows.map(r=>r.map(csvCell).join(",")).join("\n");
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
    if(mode==="ics-csv")out.push(textBlob(file.name.replace(/\.ics$/i,"")+".csv",parseIcs(await file.text()),"text/csv;charset=utf-8"));
    if(mode==="vcf-csv")out.push(textBlob(file.name.replace(/\.vcf$/i,"")+".csv",parseVcf(await file.text()),"text/csv;charset=utf-8"));
   }
   setResults(out);
  }catch(cause){setError(cause instanceof Error?cause.message:String(cause))}
  finally{setBusy(false)}
 }
 return <div className="space-y-4">
  <FileDropzone accept={accept} multiple append maxFiles={50} maxSizeMB={100} files={files} onChange={f=>{setFiles(f);setResults([]);setError("")}} disabled={busy}/>
  <p className="text-xs leading-5 text-[var(--lx-muted)]">{mode==="epub-txt"?"按 EPUB 的 OPF spine 阅读顺序提取 XHTML 正文，不只是盲扫 ZIP 文件。":mode==="odt-txt"?"从 OpenDocument content.xml 提取段落和标题文字。":mode==="ics-csv"?"提取日历事件的标题、开始、结束、地点、说明和 UID。":"提取 vCard 姓名、机构、职位、电话和邮箱。"} 全程浏览器本地处理。</p>
  <button disabled={!files.length||busy} onClick={run} className="rounded-xl bg-[var(--lx-ink)] px-5 py-2.5 text-sm text-[var(--lx-bg)] disabled:opacity-40">{busy?"处理中…":"开始处理"}</button>
  {!!results.length&&<ResultPanel files={results} messageZh={`已处理 ${results.length} 个文件。`} messageEn={`Processed ${results.length} file(s).`}/>}
  {error&&<p className="text-sm text-[var(--lx-danger)]">{error}</p>}
 </div>
}
