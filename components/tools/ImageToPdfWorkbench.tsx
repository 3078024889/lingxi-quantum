"use client";
import {useMemo,useState} from "react";
import {PDFDocument} from "pdf-lib";
import FileDropzone from "@/components/tools/FileDropzone";
import ResultPanel from "@/components/tools/ResultPanel";
import {useLingxiLang,type LingxiLang} from "@/lib/lingxi-i18n";
import type {ToolResultFile} from "@/lib/tools/types";
type C={lead:string;run:string;busy:string;ready:string;error:string};
const D:Record<LingxiLang,C>={
 zh:{lead:"选择 JPG / PNG，文件顺序就是 PDF 页顺序。",run:"生成 PDF",busy:"正在生成…",ready:"PDF 已生成，可以核对页数和文件后下载。",error:"图片转 PDF 没有完成"},
 en:{lead:"Choose JPG / PNG files. Their order becomes the PDF page order.",run:"Create PDF",busy:"Creating…",ready:"The PDF is ready. Review the pages before downloading.",error:"Image-to-PDF did not finish"},
 ja:{lead:"JPG / PNG を選択してください。選択順が PDF のページ順になります。",run:"PDF を生成",busy:"生成中…",ready:"PDF を生成しました。ページを確認してダウンロードできます。",error:"PDF を生成できませんでした"},
 ko:{lead:"JPG / PNG를 선택하세요. 선택 순서가 PDF 페이지 순서가 됩니다.",run:"PDF 생성",busy:"생성 중…",ready:"PDF가 준비되었습니다. 페이지를 확인한 후 다운로드하세요.",error:"이미지 PDF 변환을 완료하지 못했습니다"},
 fr:{lead:"Choisissez des JPG / PNG. Leur ordre devient l’ordre des pages du PDF.",run:"Créer le PDF",busy:"Création…",ready:"Le PDF est prêt. Vérifiez les pages avant de télécharger.",error:"La création du PDF n’a pas abouti"},
 de:{lead:"JPG / PNG auswählen. Die Reihenfolge wird zur Seitenreihenfolge im PDF.",run:"PDF erstellen",busy:"Erstellung…",ready:"PDF ist fertig. Seiten vor dem Download prüfen.",error:"PDF-Erstellung fehlgeschlagen"},
 es:{lead:"Elige JPG / PNG. El orden será el orden de las páginas del PDF.",run:"Crear PDF",busy:"Creando…",ready:"El PDF está listo. Revisa las páginas antes de descargar.",error:"No se pudo crear el PDF"},
 pt:{lead:"Escolha JPG / PNG. A ordem será a ordem das páginas do PDF.",run:"Criar PDF",busy:"Criando…",ready:"O PDF está pronto. Revise as páginas antes de baixar.",error:"Não foi possível criar o PDF"},
 ar:{lead:"اختر ملفات JPG / PNG. ترتيبها سيكون ترتيب صفحات PDF.",run:"إنشاء PDF",busy:"جارٍ الإنشاء…",ready:"ملف PDF جاهز. راجع الصفحات قبل التنزيل.",error:"تعذر إنشاء PDF"}
};
export default function ImageToPdfWorkbench(){
 const{lang}=useLingxiLang();const c=D[lang]??D.en;
 const[files,setFiles]=useState<File[]>([]),[busy,setBusy]=useState(false),[error,setError]=useState(""),[result,setResult]=useState<ToolResultFile[]>([]);
 async function run(){
  setBusy(true);setError("");setResult([]);
  try{
   const out=await PDFDocument.create();
   for(const f of files){
    const ab=await f.arrayBuffer(),isPng=f.type==="image/png"||/\.png$/i.test(f.name),isJpg=f.type==="image/jpeg"||/\.jpe?g$/i.test(f.name);
    if(!isPng&&!isJpg)throw new Error(`UNSUPPORTED_IMAGE · ${f.name}`);
    const img=isPng?await out.embedPng(ab):await out.embedJpg(ab),page=out.addPage([img.width,img.height]);page.drawImage(img,{x:0,y:0,width:img.width,height:img.height});
   }
   const bytes=await out.save(),copy=new Uint8Array(bytes.length);copy.set(bytes);const blob=new Blob([copy.buffer],{type:"application/pdf"});
   setResult([{name:"lingxifield-images.pdf",blob,mime:"application/pdf",size:blob.size}]);
  }catch(e){setError(e instanceof Error?e.message:String(e))}
  finally{setBusy(false)}
 }
 const details=useMemo(()=>({pages:files.length}),[files.length]);
 return <div className="space-y-4">
  <FileDropzone accept="image/jpeg,image/png,.jpg,.jpeg,.png" multiple maxFiles={100} maxSizeMB={50} files={files} onChange={f=>{setFiles(f);setResult([]);setError("")}} disabled={busy} kind="image"/>
  <p className="text-sm text-[var(--lx-muted)]">{c.lead}</p>
  {files.length>0&&<div className="max-h-56 overflow-auto rounded-xl border border-[var(--lx-line)] bg-[var(--lx-soft)] p-3 text-sm text-[var(--lx-muted)]">{files.map((f,i)=><div key={`${f.name}-${f.lastModified}`}>{i+1}. {f.name}</div>)}</div>}
  <button disabled={!files.length||busy} onClick={run} className="rounded-xl bg-[var(--lx-ink)] px-5 py-2.5 text-sm text-[var(--lx-bg)] disabled:opacity-40">{busy?c.busy:c.run}</button>
  {!!result.length&&<ResultPanel files={result} messageZh={c.ready} messageEn={c.ready} details={details}/>}
  {error&&<p role="alert" className="text-sm text-[var(--lx-danger)]">{c.error} · {error}</p>}
 </div>;
}
