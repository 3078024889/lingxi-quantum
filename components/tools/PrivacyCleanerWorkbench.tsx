"use client";
import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import {useLingxiLang} from "@/lib/lingxi-i18n";
import {toolUiText} from "@/lib/tool-ui-i18n";
function dl(b:Blob,n:string){const u=URL.createObjectURL(b),a=document.createElement("a");a.href=u;a.download=n;a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);}
export default function PrivacyCleanerWorkbench(){
 const{lang}=useLingxiLang();const t=(zh:string,en:string)=>toolUiText(lang,zh,en);
 const [file,setFile]=useState<File|null>(null);const [status,setStatus]=useState("");const [error,setError]=useState("");
 async function clean(){if(!file)return;setError("");setStatus(t("正在清理…","Cleaning…"));try{
   if(file.type==="application/pdf"||file.name.toLowerCase().endsWith(".pdf")){const d=await PDFDocument.load(await file.arrayBuffer());d.setTitle("");d.setAuthor("");d.setSubject("");d.setKeywords([]);d.setProducer("Lingxifield");d.setCreator("Lingxifield");const bytes=await d.save();const c=new Uint8Array(bytes.length);c.set(bytes);dl(new Blob([c.buffer],{type:"application/pdf"}),"clean-"+file.name);setStatus(t("已清理 PDF 文档属性并导出。","PDF document properties were cleared and exported."));return;}
   if(file.type.startsWith("image/")){const bmp=await createImageBitmap(file);const c=document.createElement("canvas");c.width=bmp.width;c.height=bmp.height;const x=c.getContext("2d");if(!x)throw new Error(t("浏览器不支持画布","Canvas is not supported by this browser"));x.drawImage(bmp,0,0);bmp.close?.();const out=await new Promise<Blob>((resolve,reject)=>c.toBlob(b=>b?resolve(b):reject(new Error(t("导出失败","Export failed"))),file.type==="image/png"?"image/png":"image/jpeg",.95));dl(out,"clean-"+file.name.replace(/\.(heic|heif)$/i,".jpg"));setStatus(t("已通过重新编码移除图片 EXIF / GPS 等常见元数据。","Common image metadata such as EXIF / GPS was removed by re-encoding."));return;}
   throw new Error(t("当前真实支持图片与 PDF。Office 文档元数据清理将在验证后接入，暂不假装支持。","Images and PDFs are genuinely supported now. Office metadata cleaning will be added after verification; it is not presented as supported yet."));
 }catch(e){setError(e instanceof Error?e.message:String(e));setStatus("");}}
 return <div className="space-y-4"><label className="block cursor-pointer rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-7 text-center"><input type="file" accept="image/*,application/pdf" className="hidden" onChange={e=>setFile(e.target.files?.[0]||null)}/><b>{t("选择图片或 PDF","Choose an image or PDF")}</b><p className="mt-1 text-sm text-slate-500">{t("文件只在浏览器处理。","The file is processed only in your browser.")}</p></label>{file&&<div className="rounded-xl bg-blue-600 px-4 py-3 text-sm text-white">{file.name}</div>}<button disabled={!file} onClick={clean} className="rounded-full bg-blue-600 px-5 py-2.5 text-sm text-white disabled:opacity-40">{t("清除隐私信息并导出","Remove private metadata & export")}</button>{status&&<p className="text-sm text-emerald-700">{status}</p>}{error&&<p className="text-sm text-rose-600">{error}</p>}</div>;
}
