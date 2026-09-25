"use client";
import {useMemo,useState} from "react";
import FileDropzone from "@/components/tools/FileDropzone";
import ResultPanel from "@/components/tools/ResultPanel";
import {useLingxiLang,type LingxiLang} from "@/lib/lingxi-i18n";
import type {ToolResultFile} from "@/lib/tools/types";

type C={run:string;batch:string;working:string;done:string;error:string};
const D:Record<LingxiLang,C>={
 zh:{run:"转换成 JPG",batch:"批量转换",working:"正在转换…",done:"HEIC / HEIF 已转换为 JPG，可以直接下载。",error:"转换没有完成"},
 en:{run:"Convert to JPG",batch:"Convert batch",working:"Converting…",done:"HEIC / HEIF converted to JPG and ready to download.",error:"Conversion did not finish"},
 ja:{run:"JPG に変換",batch:"一括変換",working:"変換中…",done:"HEIC / HEIF を JPG に変換しました。ダウンロードできます。",error:"変換を完了できませんでした"},
 ko:{run:"JPG로 변환",batch:"일괄 변환",working:"변환 중…",done:"HEIC / HEIF를 JPG로 변환했습니다. 바로 다운로드할 수 있습니다.",error:"변환을 완료하지 못했습니다"},
 fr:{run:"Convertir en JPG",batch:"Convertir le lot",working:"Conversion…",done:"HEIC / HEIF convertis en JPG, prêts à télécharger.",error:"La conversion n’a pas abouti"},
 de:{run:"In JPG umwandeln",batch:"Stapel konvertieren",working:"Konvertierung läuft…",done:"HEIC / HEIF wurden in JPG umgewandelt und können heruntergeladen werden.",error:"Konvertierung konnte nicht abgeschlossen werden"},
 es:{run:"Convertir a JPG",batch:"Convertir lote",working:"Convirtiendo…",done:"HEIC / HEIF convertidos a JPG y listos para descargar.",error:"No se pudo completar la conversión"},
 pt:{run:"Converter para JPG",batch:"Converter em lote",working:"Convertendo…",done:"HEIC / HEIF convertidos para JPG e prontos para baixar.",error:"Não foi possível concluir a conversão"},
 ar:{run:"تحويل إلى JPG",batch:"تحويل دفعة",working:"جارٍ التحويل…",done:"تم تحويل HEIC / HEIF إلى JPG وأصبح جاهزًا للتنزيل.",error:"تعذر إكمال التحويل"}
};

export default function HeicWorkbench(){
 const{lang}=useLingxiLang();const c=D[lang]??D.en;
 const[files,setFiles]=useState<File[]>([]),[busy,setBusy]=useState(false),[error,setError]=useState(""),[results,setResults]=useState<ToolResultFile[]>([]);
 async function one(file:File){
   const heic2any=(await import("heic2any")).default;
   const r=await heic2any({blob:file,toType:"image/jpeg",quality:.92});
   const blob=(Array.isArray(r)?r[0]:r) as Blob;
   return {name:file.name.replace(/\.(heic|heif)$/i,"")+".jpg",blob,mime:"image/jpeg",size:blob.size};
 }
 async function run(){
   if(!files.length)return;
   setBusy(true);setError("");setResults([]);
   try{
     const out:ToolResultFile[]=[];
     for(const f of files)out.push(await one(f));
     setResults(out);
   }catch(e){setError(e instanceof Error?e.message:String(e))}
   finally{setBusy(false)}
 }
 const total=useMemo(()=>results.reduce((n,r)=>n+r.size,0),[results]);
 return <div className="space-y-4">
  <FileDropzone accept=".heic,.heif,image/heic,image/heif" multiple maxFiles={30} maxSizeMB={50} files={files} onChange={setFiles} disabled={busy} kind="image"/>
  <button onClick={run} disabled={!files.length||busy} className="rounded-xl bg-[var(--lx-ink)] px-5 py-2.5 text-sm font-medium text-[var(--lx-bg)] disabled:opacity-40">{busy?c.working:files.length>1?`${c.batch} · ${files.length}`:c.run}</button>
  {!!results.length&&<ResultPanel files={results} messageZh={c.done} messageEn={c.done} details={{files:results.length,resultKB:Number((total/1024).toFixed(1))}}/>}
  {error&&<p role="alert" className="rounded-xl border border-[var(--lx-danger)] bg-[var(--lx-panel)] p-4 text-sm text-[var(--lx-danger)]">{c.error} · {error}</p>}
 </div>;
}
