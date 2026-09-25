"use client";
import {useRef,useState} from "react";
import FileDropzone from "@/components/tools/FileDropzone";
import ResultPanel from "@/components/tools/ResultPanel";
import {openPdf,renderPdfPage,canvasToBlob} from "@/lib/tools/pdf-render-client";
import {useLingxiLang,type LingxiLang} from "@/lib/lingxi-i18n";
import type {ToolResultFile} from "@/lib/tools/types";
type C={lead:string;run:string;busy:string;cancel:string;done:string;copy:string;copied:string;ready:string;error:string;canceled:string;loading:string;page:string};
const D:Record<LingxiLang,C>={
 zh:{lead:"PDF 页面会在浏览器本地渲染并进行 OCR，文件不上传。",run:"开始 OCR",busy:"正在识别…",cancel:"取消",done:"完成",copy:"复制文字",copied:"已复制",ready:"OCR 文字已经生成，可以编辑、复制或下载 TXT。",error:"PDF OCR 没有完成",canceled:"已取消",loading:"正在加载 OCR 引擎…",page:"识别页"},
 en:{lead:"PDF pages are rendered and OCR runs locally in your browser. The file is not uploaded.",run:"Run OCR",busy:"Recognizing…",cancel:"Cancel",done:"Done",copy:"Copy text",copied:"Copied",ready:"OCR text is ready. Edit, copy or download the TXT.",error:"PDF OCR did not finish",canceled:"Canceled",loading:"Loading OCR engine…",page:"OCR page"},
 ja:{lead:"PDF ページをブラウザ内でレンダリングし OCR します。ファイルはアップロードしません。",run:"OCR を開始",busy:"認識中…",cancel:"キャンセル",done:"完了",copy:"文字をコピー",copied:"コピー済み",ready:"OCR 文字を生成しました。編集・コピー・TXT ダウンロードができます。",error:"PDF OCR を完了できませんでした",canceled:"キャンセルしました",loading:"OCR エンジンを読み込み中…",page:"OCR ページ"},
 ko:{lead:"PDF 페이지를 브라우저에서 렌더링하고 OCR합니다. 파일은 업로드하지 않습니다.",run:"OCR 시작",busy:"인식 중…",cancel:"취소",done:"완료",copy:"텍스트 복사",copied:"복사됨",ready:"OCR 텍스트가 준비되었습니다. 편집, 복사 또는 TXT 다운로드가 가능합니다.",error:"PDF OCR을 완료하지 못했습니다",canceled:"취소됨",loading:"OCR 엔진 로드 중…",page:"OCR 페이지"},
 fr:{lead:"Les pages PDF sont rendues et reconnues localement dans le navigateur. Le fichier n’est pas envoyé.",run:"Lancer l’OCR",busy:"Reconnaissance…",cancel:"Annuler",done:"Terminé",copy:"Copier le texte",copied:"Copié",ready:"Le texte OCR est prêt. Modifiez, copiez ou téléchargez le TXT.",error:"L’OCR PDF n’a pas abouti",canceled:"Annulé",loading:"Chargement du moteur OCR…",page:"Page OCR"},
 de:{lead:"PDF-Seiten werden lokal im Browser gerendert und per OCR erkannt. Die Datei wird nicht hochgeladen.",run:"OCR starten",busy:"Erkennung…",cancel:"Abbrechen",done:"Fertig",copy:"Text kopieren",copied:"Kopiert",ready:"OCR-Text ist fertig. Bearbeiten, kopieren oder als TXT herunterladen.",error:"PDF-OCR fehlgeschlagen",canceled:"Abgebrochen",loading:"OCR-Engine wird geladen…",page:"OCR-Seite"},
 es:{lead:"Las páginas PDF se renderizan y reconocen localmente en el navegador. El archivo no se sube.",run:"Iniciar OCR",busy:"Reconociendo…",cancel:"Cancelar",done:"Hecho",copy:"Copiar texto",copied:"Copiado",ready:"El texto OCR está listo. Edítalo, cópialo o descarga TXT.",error:"No se pudo completar el OCR",canceled:"Cancelado",loading:"Cargando motor OCR…",page:"Página OCR"},
 pt:{lead:"As páginas PDF são renderizadas e reconhecidas localmente no navegador. O arquivo não é enviado.",run:"Iniciar OCR",busy:"Reconhecendo…",cancel:"Cancelar",done:"Concluído",copy:"Copiar texto",copied:"Copiado",ready:"O texto OCR está pronto. Edite, copie ou baixe o TXT.",error:"Não foi possível concluir o OCR",canceled:"Cancelado",loading:"Carregando motor OCR…",page:"Página OCR"},
 ar:{lead:"تُعرض صفحات PDF ويعمل OCR محليًا داخل المتصفح. لا يتم رفع الملف.",run:"بدء OCR",busy:"جارٍ التعرف…",cancel:"إلغاء",done:"تم",copy:"نسخ النص",copied:"تم النسخ",ready:"نص OCR جاهز. يمكنك تعديله أو نسخه أو تنزيل TXT.",error:"تعذر إكمال OCR",canceled:"تم الإلغاء",loading:"جارٍ تحميل محرك OCR…",page:"صفحة OCR"}
};
type OcrWorker={recognize:(input:Blob)=>Promise<{data:{text:string}}> ;terminate:()=>Promise<void>};
export default function PdfOcrWorkbench(){
 const{lang:uiLang}=useLingxiLang();const c=D[uiLang]??D.en;
 const[files,setFiles]=useState<File[]>([]),[ocrLang,setOcrLang]=useState("chi_sim+eng"),[text,setText]=useState(""),[busy,setBusy]=useState(false),[stage,setStage]=useState(""),[error,setError]=useState(""),[copied,setCopied]=useState(false);
 const stop=useRef(false),file=files[0]||null;
 async function run(){
  if(!file)return;setBusy(true);setText("");setError("");stop.current=false;let worker:OcrWorker|null=null,pdf:Awaited<ReturnType<typeof openPdf>>|null=null;
  try{
   const {createWorker}=await import("tesseract.js");setStage(c.loading);
   worker=await createWorker(ocrLang,undefined,{logger:(m:{status?:string;progress?:number})=>{if(m.status&&typeof m.progress==="number")setStage(`${m.status} · ${Math.round(m.progress*100)}%`)}}) as unknown as OcrWorker;
   pdf=await openPdf(file);const chunks:string[]=[];
   for(let n=1;n<=pdf.numPages;n++){
    if(stop.current){setStage(c.canceled);return}
    setStage(`${c.page} ${n}/${pdf.numPages}`);
    const r=await renderPdfPage(pdf,n,1.6);
    try{const blob=await canvasToBlob(r.canvas,"image/png",1),result=await worker.recognize(blob);chunks.push(`===== Page ${n} =====\n${result.data.text.trim()}`)}
    finally{r.canvas.width=1;r.canvas.height=1}
   }
   setText(chunks.join("\n\n"));setStage(c.done);
  }catch(e){setError(e instanceof Error?e.message:String(e))}
  finally{try{await worker?.terminate()}catch{}try{pdf?.destroy?.()}catch{}setBusy(false)}
 }
 const result=text&&file?[{name:`${file.name.replace(/\.pdf$/i,"")||"ocr"}.txt`,blob:new Blob([text],{type:"text/plain;charset=utf-8"}),mime:"text/plain",size:new Blob([text]).size} as ToolResultFile]:[];
 return <div className="space-y-4">
  <FileDropzone accept="application/pdf,.pdf" files={files} onChange={f=>{setFiles(f);setText("");setError("")}} disabled={busy} kind="pdf" maxSizeMB={200}/>
  <p className="text-sm text-[var(--lx-muted)]">{c.lead}</p>
  <select value={ocrLang} onChange={e=>setOcrLang(e.target.value)} disabled={busy} className="rounded-xl border border-[var(--lx-line)] bg-[var(--lx-panel)] px-3 py-2.5 text-[var(--lx-ink)]"><option value="chi_sim+eng">简体中文 + English</option><option value="chi_tra+eng">繁體中文 + English</option><option value="eng">English</option><option value="jpn+eng">日本語 + English</option><option value="kor+eng">한국어 + English</option></select>
  <div className="flex gap-3"><button disabled={!file||busy} onClick={run} className="rounded-xl bg-[var(--lx-ink)] px-5 py-2.5 text-sm text-[var(--lx-bg)] disabled:opacity-40">{busy?c.busy:c.run}</button>{busy&&<button onClick={()=>stop.current=true} className="rounded-xl border border-[var(--lx-danger)] px-5 py-2.5 text-sm text-[var(--lx-danger)]">{c.cancel}</button>}</div>
  {stage&&<p className="text-sm text-[var(--lx-muted)]">{stage}</p>}
  {text&&<><textarea value={text} onChange={e=>setText(e.target.value)} rows={18} className="w-full rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-4 font-mono text-sm text-[var(--lx-ink)]"/><button onClick={async()=>{await navigator.clipboard.writeText(text);setCopied(true);setTimeout(()=>setCopied(false),1200)}} className="rounded-xl border border-[var(--lx-line)] px-4 py-2 text-sm text-[var(--lx-ink)]">{copied?c.copied:c.copy}</button><ResultPanel files={result} messageZh={c.ready} messageEn={c.ready}/></>}
  {error&&<p role="alert" className="text-sm text-[var(--lx-danger)]">{c.error} · {error}</p>}
 </div>;
}
