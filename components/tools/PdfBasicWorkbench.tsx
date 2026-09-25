"use client";
import {useMemo,useState} from "react";
import {PDFDocument,degrees} from "pdf-lib";
import FileDropzone from "@/components/tools/FileDropzone";
import ResultPanel from "@/components/tools/ResultPanel";
import {useLingxiLang,type LingxiLang} from "@/lib/lingxi-i18n";
import type {ToolResultFile} from "@/lib/tools/types";

function pdfBlob(bytes:Uint8Array){const c=new Uint8Array(bytes.length);c.set(bytes);return new Blob([c.buffer],{type:"application/pdf"});}
function parsePages(v:string,max:number){
 const set=new Set<number>();
 for(const part of v.split(",")){
  const p=part.trim();if(!p)continue;
  if(p.includes("-")){
   const [a,b]=p.split("-").map(Number);
   if(!Number.isFinite(a)||!Number.isFinite(b)||a>b)continue;
   for(let i=Math.max(1,a);i<=Math.min(max,b);i++)set.add(i-1);
  }else{
   const n=Number(p);if(Number.isInteger(n)&&n>=1&&n<=max)set.add(n-1);
  }
 }
 return [...set].sort((a,b)=>a-b);
}
type C={choose:string;note:string;pages:string;range:string;merge:string;extract:string;rotate:string;busy:string;ready:string;badRange:string;error:string};
const D:Record<LingxiLang,C>={
 zh:{choose:"选择一个或多个 PDF",note:"合并可多选；提取和旋转使用第一个文件。",pages:"第一个文件页数",range:"页码范围（提取 / 旋转）",merge:"合并 PDF",extract:"提取这些页",rotate:"选中页旋转 90°",busy:"正在处理…",ready:"PDF 已处理完成，可以先核对结果再下载。",badRange:"请输入有效页码，例如 1-3,5。",error:"这次 PDF 处理没有完成"},
 en:{choose:"Choose one or more PDFs",note:"Select multiple files to merge; extract and rotate use the first file.",pages:"Pages in first file",range:"Page range (extract / rotate)",merge:"Merge PDFs",extract:"Extract pages",rotate:"Rotate selected pages 90°",busy:"Working…",ready:"PDF processing finished. Review the result before downloading.",badRange:"Enter valid pages such as 1-3,5.",error:"PDF processing did not finish"},
 ja:{choose:"PDF を1つ以上選択",note:"結合は複数選択、抽出と回転は最初のファイルを使用します。",pages:"最初のファイルのページ数",range:"ページ範囲（抽出 / 回転）",merge:"PDF を結合",extract:"ページを抽出",rotate:"選択ページを90°回転",busy:"処理中…",ready:"PDF の処理が完了しました。確認してからダウンロードできます。",badRange:"1-3,5 のように有効なページを入力してください。",error:"PDF の処理を完了できませんでした"},
 ko:{choose:"PDF 하나 이상 선택",note:"병합은 여러 파일, 추출과 회전은 첫 번째 파일을 사용합니다.",pages:"첫 번째 파일 페이지 수",range:"페이지 범위 (추출 / 회전)",merge:"PDF 병합",extract:"페이지 추출",rotate:"선택 페이지 90° 회전",busy:"처리 중…",ready:"PDF 처리가 완료되었습니다. 확인 후 다운로드하세요.",badRange:"1-3,5처럼 유효한 페이지를 입력하세요.",error:"PDF 처리를 완료하지 못했습니다"},
 fr:{choose:"Choisissez un ou plusieurs PDF",note:"La fusion accepte plusieurs fichiers ; extraction et rotation utilisent le premier.",pages:"Pages du premier fichier",range:"Pages (extraction / rotation)",merge:"Fusionner les PDF",extract:"Extraire les pages",rotate:"Tourner les pages de 90°",busy:"Traitement…",ready:"Le PDF est prêt. Vérifiez le résultat avant de télécharger.",badRange:"Saisissez des pages valides, par ex. 1-3,5.",error:"Le traitement PDF n’a pas abouti"},
 de:{choose:"Eine oder mehrere PDFs wählen",note:"Zum Zusammenführen mehrere Dateien; Extrahieren und Drehen verwenden die erste Datei.",pages:"Seiten der ersten Datei",range:"Seitenbereich (Extrahieren / Drehen)",merge:"PDFs zusammenführen",extract:"Seiten extrahieren",rotate:"Ausgewählte Seiten 90° drehen",busy:"Verarbeitung…",ready:"PDF-Verarbeitung abgeschlossen. Ergebnis prüfen und herunterladen.",badRange:"Gültige Seiten eingeben, z. B. 1-3,5.",error:"PDF-Verarbeitung konnte nicht abgeschlossen werden"},
 es:{choose:"Elige uno o varios PDF",note:"La unión admite varios archivos; extraer y girar usan el primero.",pages:"Páginas del primer archivo",range:"Rango de páginas (extraer / girar)",merge:"Unir PDF",extract:"Extraer páginas",rotate:"Girar páginas 90°",busy:"Procesando…",ready:"El PDF está listo. Revisa el resultado antes de descargar.",badRange:"Introduce páginas válidas, por ejemplo 1-3,5.",error:"No se pudo completar el procesamiento PDF"},
 pt:{choose:"Escolha um ou mais PDFs",note:"A mesclagem aceita vários arquivos; extrair e girar usam o primeiro.",pages:"Páginas do primeiro arquivo",range:"Intervalo de páginas (extrair / girar)",merge:"Mesclar PDFs",extract:"Extrair páginas",rotate:"Girar páginas 90°",busy:"Processando…",ready:"O PDF está pronto. Revise o resultado antes de baixar.",badRange:"Insira páginas válidas, por exemplo 1-3,5.",error:"Não foi possível concluir o processamento PDF"},
 ar:{choose:"اختر ملف PDF واحدًا أو أكثر",note:"الدمج يقبل عدة ملفات، أما الاستخراج والتدوير فيستخدمان الملف الأول.",pages:"عدد صفحات الملف الأول",range:"نطاق الصفحات (استخراج / تدوير)",merge:"دمج ملفات PDF",extract:"استخراج الصفحات",rotate:"تدوير الصفحات المحددة 90°",busy:"جارٍ المعالجة…",ready:"اكتملت معالجة PDF. راجع النتيجة ثم نزّلها.",badRange:"أدخل صفحات صالحة مثل 1-3,5.",error:"تعذر إكمال معالجة PDF"}
};

export default function PdfBasicWorkbench(){
 const{lang}=useLingxiLang();const c=D[lang]??D.en;
 const[files,setFiles]=useState<File[]>([]),[pages,setPages]=useState(0),[range,setRange]=useState(""),[busy,setBusy]=useState(false),[error,setError]=useState(""),[results,setResults]=useState<ToolResultFile[]>([]);
 const first=files[0]||null;

 async function syncFiles(next:File[]){
   setFiles(next);setResults([]);setError("");setPages(0);
   if(next[0]){
     try{const d=await PDFDocument.load(await next[0].arrayBuffer());setPages(d.getPageCount())}
     catch(e){setError(e instanceof Error?e.message:String(e))}
   }
 }
 async function wrap(name:string,fn:()=>Promise<Blob>){
   setBusy(true);setError("");setResults([]);
   try{const b=await fn();setResults([{name,blob:b,mime:"application/pdf",size:b.size}])}
   catch(e){setError(e instanceof Error?e.message:String(e))}
   finally{setBusy(false)}
 }
 async function merge(){if(files.length<2)return;await wrap("lingxifield-merged.pdf",async()=>{const out=await PDFDocument.create();for(const f of files){const s=await PDFDocument.load(await f.arrayBuffer());for(const p of await out.copyPages(s,s.getPageIndices()))out.addPage(p)}return pdfBlob(await out.save())})}
 async function extract(){if(!first)return;await wrap("lingxifield-pages.pdf",async()=>{const s=await PDFDocument.load(await first.arrayBuffer());const ids=parsePages(range,s.getPageCount());if(!ids.length)throw new Error(c.badRange);const out=await PDFDocument.create();for(const p of await out.copyPages(s,ids))out.addPage(p);return pdfBlob(await out.save())})}
 async function rotate(){if(!first)return;await wrap("lingxifield-rotated.pdf",async()=>{const d=await PDFDocument.load(await first.arrayBuffer());const ids=parsePages(range||`1-${d.getPageCount()}`,d.getPageCount());if(!ids.length)throw new Error(c.badRange);for(const i of ids){const p=d.getPage(i);p.setRotation(degrees((p.getRotation().angle+90)%360))}return pdfBlob(await d.save())})}
 return <div className="space-y-5">
  <FileDropzone accept="application/pdf,.pdf" multiple maxFiles={30} maxSizeMB={200} files={files} onChange={syncFiles} disabled={busy} kind="pdf"/>
  {files.length>0&&<div className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-3 text-sm text-[var(--lx-muted)]">
   {files.map(f=><div key={`${f.name}-${f.size}`}>{f.name}</div>)}
   {pages>0&&<div className="mt-1 text-[var(--lx-ink)]">{c.pages}: {pages}</div>}
  </div>}
  <label className="block text-sm text-[var(--lx-muted)]">{c.range}
   <input value={range} onChange={e=>setRange(e.target.value)} placeholder="1-3,5,8-10" className="mt-1 w-full rounded-xl border border-[var(--lx-line)] bg-[var(--lx-panel)] px-3 py-2.5 text-[var(--lx-ink)] outline-none focus:border-[var(--lx-line-strong)]"/>
  </label>
  <div className="flex flex-wrap gap-3">
   <button disabled={files.length<2||busy} onClick={merge} className="rounded-xl bg-[var(--lx-ink)] px-5 py-2.5 text-sm text-[var(--lx-bg)] disabled:opacity-40">{busy?c.busy:c.merge}</button>
   <button disabled={!first||busy} onClick={extract} className="rounded-xl border border-[var(--lx-line)] bg-[var(--lx-panel)] px-5 py-2.5 text-sm text-[var(--lx-ink)] disabled:opacity-40">{c.extract}</button>
   <button disabled={!first||busy} onClick={rotate} className="rounded-xl border border-[var(--lx-line)] bg-[var(--lx-panel)] px-5 py-2.5 text-sm text-[var(--lx-ink)] disabled:opacity-40">{c.rotate}</button>
  </div>
  {!!results.length&&<ResultPanel files={results} messageZh={c.ready} messageEn={c.ready}/>}
  {error&&<p role="alert" className="rounded-xl border border-[var(--lx-danger)] bg-[var(--lx-panel)] p-4 text-sm text-[var(--lx-danger)]">{c.error} · {error}</p>}
 </div>
}
