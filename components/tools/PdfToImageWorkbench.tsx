"use client";
import{useEffect,useRef,useState}from"react";
import {claimToolStart,ToolAccessError,toolAccessMessage} from "@/lib/tools/commerce/tool-start-client";
import{openPdf,renderPdfPage,canvasToBlob}from"@/lib/tools/pdf-render-client";
import{DOCUMENT_INPUT_ACCEPT,documentIntakeError,documentIntakeText,normalizeDocumentFile,confirmDocumentUpload}from"@/lib/tools/document/intake-client";
import{useLingxiLang,type LingxiLang}from"@/lib/lingxi-i18n";
import ResultPanel from "./ResultPanel";
import type {ToolResultFile} from "@/lib/tools/types";
import {registerExportBundle} from '@/lib/tools/commerce/export-access-client';


type Copy={pages:string;format:string;resolution:string;quality:string;convert:string;cancel:string;ready:string;invalid:string;cancelled:string;failed:string;low:string;high:string;highest:string};
const C:Record<LingxiLang,Copy>={
 zh:{pages:"页码",format:"图片格式",resolution:"清晰度",quality:"JPG 画质",convert:"生成图片",cancel:"取消",ready:"图片已生成，核对后保存 ZIP 文件。",invalid:"页码有误，请输入如 1-3,5 的有效页码。",cancelled:"已取消本次生成。",failed:"转换失败，请检查 PDF 文件后重试。",low:"文件更小",high:"高清",highest:"最高画质"},
 en:{pages:"Pages",format:"Format",resolution:"Resolution",quality:"JPG quality",convert:"Convert",cancel:"Cancel",ready:"Images are ready. Review and save the ZIP file.",invalid:"Invalid page range. Enter pages such as 1-3,5.",cancelled:"Conversion cancelled.",failed:"Conversion failed. Check the PDF and retry.",low:"Smaller file",high:"High quality",highest:"Maximum quality"},
 ja:{pages:"ページ",format:"画像形式",resolution:"解像度",quality:"JPG画質",convert:"画像を作成",cancel:"キャンセル",ready:"画像を作成しました。確認してZIPファイルを保存できます。",invalid:"ページ範囲が正しくありません。例：1-3,5。",cancelled:"変換をキャンセルしました。",failed:"変換に失敗しました。PDFを確認してください。",low:"小さいファイル",high:"高画質",highest:"最高画質"},
 ko:{pages:"페이지",format:"이미지 형식",resolution:"해상도",quality:"JPG 품질",convert:"이미지 생성",cancel:"취소",ready:"이미지가 준비되었습니다. 확인 후 ZIP 파일을 저장하세요.",invalid:"페이지 범위가 잘못되었습니다. 예: 1-3,5.",cancelled:"변환이 취소되었습니다.",failed:"변환에 실패했습니다. PDF를 확인하세요.",low:"파일 크기 줄이기",high:"고화질",highest:"최고 화질"},
 fr:{pages:"Pages",format:"Format",resolution:"Résolution",quality:"Qualité JPG",convert:"Convertir",cancel:"Annuler",ready:"Les images sont prêtes. Vérifiez puis enregistrez le ZIP.",invalid:"Pages invalides. Exemple : 1-3,5.",cancelled:"Conversion annulée.",failed:"Échec de la conversion. Vérifiez le PDF.",low:"Fichier réduit",high:"Haute qualité",highest:"Qualité maximale"},
 de:{pages:"Seiten",format:"Format",resolution:"Auflösung",quality:"JPG-Qualität",convert:"Umwandeln",cancel:"Abbrechen",ready:"Bilder sind fertig. ZIP prüfen und speichern.",invalid:"Ungültiger Seitenbereich. Beispiel: 1-3,5.",cancelled:"Konvertierung abgebrochen.",failed:"Konvertierung fehlgeschlagen. PDF prüfen.",low:"Kleinere Datei",high:"Hohe Qualität",highest:"Maximale Qualität"},
 es:{pages:"Páginas",format:"Formato",resolution:"Resolución",quality:"Calidad JPG",convert:"Convertir",cancel:"Cancelar",ready:"Imágenes listas. Revisa y guarda el ZIP.",invalid:"Rango de páginas inválido. Ejemplo: 1-3,5.",cancelled:"Conversión cancelada.",failed:"Falló la conversión. Revisa el PDF.",low:"Archivo pequeño",high:"Alta calidad",highest:"Calidad máxima"},
 pt:{pages:"Páginas",format:"Formato",resolution:"Resolução",quality:"Qualidade JPG",convert:"Converter",cancel:"Cancelar",ready:"Imagens prontas. Confira e salve o ZIP.",invalid:"Intervalo de páginas inválido. Exemplo: 1-3,5.",cancelled:"Conversão cancelada.",failed:"Falha na conversão. Verifique o PDF.",low:"Arquivo menor",high:"Alta qualidade",highest:"Qualidade máxima"},
 ar:{pages:"الصفحات",format:"التنسيق",resolution:"الدقة",quality:"جودة JPG",convert:"تحويل",cancel:"إلغاء",ready:"الصور جاهزة. راجع النتيجة ثم احفظ ملف ZIP.",invalid:"نطاق الصفحات غير صالح. مثال: 1-3,5.",cancelled:"تم إلغاء التحويل.",failed:"فشل التحويل. تحقق من ملف PDF.",low:"ملف أصغر",high:"جودة عالية",highest:"أعلى جودة"}
};

const THUMBNAILS_PER_VIEW=8;

function parseRange(raw:string,max:number){
 if(!raw.trim())return Array.from({length:max},(_,i)=>i+1);
 const out=new Set<number>();
 for(const token of raw.split(",")){const part=token.trim();if(!/^\d+(?:\s*-\s*\d+)?$/.test(part))return[];const[a,b=a]=part.split("-").map(Number);if(!Number.isSafeInteger(a)||!Number.isSafeInteger(b)||a<1||b>max||b<a)return[];for(let i=a;i<=b;i++)out.add(i)}
 return[...out].sort((a,b)=>a-b);
}
export default function PdfToImageWorkbench(){
 const{lang}=useLingxiLang(),c=C[lang]||C.en;
 const[file,setFile]=useState<File|null>(null),[pages,setPages]=useState(0),[range,setRange]=useState(""),[format,setFormat]=useState<"jpeg"|"png">("jpeg"),[quality,setQuality]=useState(.9),[scale,setScale]=useState(1.5),[busy,setBusy]=useState(false),[stage,setStage]=useState(""),[error,setError]=useState("");
 const abort=useRef(false);
 const [result,setResult]=useState<ToolResultFile[]>([]);
 const [previewGroup,setPreviewGroup]=useState(0);
 const [thumbs,setThumbs]=useState<Record<number,string>>({});
 const firstVisible=previewGroup*THUMBNAILS_PER_VIEW+1;
 const lastVisible=Math.min(pages,firstVisible+THUMBNAILS_PER_VIEW-1);
 const selected=range.trim()?parseRange(range,pages):[];
 const updateRange=(next:string)=>{setRange(next);setResult([]);setError("")};
 function togglePage(page:number){
  const next=new Set(selected);
  if(next.has(page))next.delete(page);
  else next.add(page);
  updateRange([...next].sort((a,b)=>a-b).join(","));
 }
 useEffect(()=>{
  if(!file||!pages)return;
  let current=true;
  let doc:Awaited<ReturnType<typeof openPdf>>|undefined;
  setThumbs({});
  void(async()=>{
   try{
    doc=await openPdf(file);
    for(let n=firstVisible;n<=lastVisible&&current;n++){
     const page=await doc.getPage(n),size=page.getViewport({scale:1});
     const rendered=await renderPdfPage(doc,n,Math.min(.3,220/Math.max(size.width,size.height)));
     try{
      const url=rendered.canvas.toDataURL("image/jpeg",.72);
      if(current)setThumbs(old=>({...old,[n]:url}));
     }finally{rendered.canvas.width=1;rendered.canvas.height=1}
    }
   }catch{
    // Page numbers remain usable if preview rendering fails.
   }finally{await doc?.destroy?.().catch(()=>{})}
  })();
  return()=>{current=false};
 },[file,pages,firstVisible,lastVisible]);
 async function choose(input:File){
  if(busy||!confirmDocumentUpload([input],lang))return;
  setBusy(true);
  try{await claimToolStart("pdf-to-jpg",1)}catch(e){setError(toolAccessMessage(lang,e instanceof ToolAccessError?e.code:"TOOL_ACCESS_UNAVAILABLE"));setBusy(false);return;}
  setError("");setResult([]);setFile(null);setPages(0);setPreviewGroup(0);setThumbs({});setRange("");
  try{const f=await normalizeDocumentFile(input);const pdf=await openPdf(f);const count=pdf.numPages;await pdf.destroy?.();setFile(f);setPages(count)}
  catch(e){setFile(null);setPages(0);setError(documentIntakeError(lang,e))}
  finally{setBusy(false)}
 }
 async function run(){
  if(!file)return;setBusy(true);setError("");setResult([]);abort.current=false;let pdf:Awaited<ReturnType<typeof openPdf>>|undefined;
  try{pdf=await openPdf(file);const selected=parseRange(range,pdf.numPages);if(!selected.length)throw new Error("INVALID_RANGE");const JSZip=(await import("jszip")).default,zip=new JSZip();
   for(let i=0;i<selected.length;i++){if(abort.current)throw new Error("CANCELED");setStage(`${i+1}/${selected.length}`);const r=await renderPdfPage(pdf,selected[i],scale);try{const type=format==="png"?"image/png":"image/jpeg",b=await canvasToBlob(r.canvas,type,quality);zip.file(`page-${String(selected[i]).padStart(3,"0")}.${format==="png"?"png":"jpg"}`,b)}finally{r.canvas.width=1;r.canvas.height=1}}
   setStage("ZIP");const out=await zip.generateAsync({type:"blob",mimeType:"application/zip"});if(abort.current)throw new Error("CANCELED");registerExportBundle(out,selected.map(()=>new Blob()));const name=`${file.name.replace(/\.pdf$/i,"")}-${format}.zip`;setResult([{name,blob:out,size:out.size,mime:"application/zip"}]);
  }catch(e){const message=e instanceof Error?e.message:"";setError(message==="INVALID_RANGE"?c.invalid:message==="CANCELED"?c.cancelled:c.failed)}finally{pdf?.destroy?.();setBusy(false);setStage("")}
 }
 return <div className="space-y-4">
  <label onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();const f=e.dataTransfer.files?.[0];if(f)void choose(f)}} className="block cursor-pointer rounded-2xl border border-dashed border-[var(--lx-line)] bg-[var(--lx-soft)] p-7 text-center">
   <input type="file" accept={DOCUMENT_INPUT_ACCEPT} disabled={busy} className="hidden" onChange={e=>{const f=e.target.files?.[0];if(f)void choose(f)}}/>
   <b>{busy?documentIntakeText(lang,"busy"):documentIntakeText(lang,"hint")}</b>
  </label>
  {file&&<div className="rounded-xl border border-[var(--lx-line)] bg-[var(--lx-soft)] p-3 text-sm text-[var(--lx-ink)]">{file.name} · {pages}</div>}
  {pages>0&&<section aria-label={lang==="zh"?"选取 PDF 页面":"Choose PDF pages"} className="space-y-3">
   <div className="flex flex-wrap items-center justify-between gap-2">
    <p className="text-sm">{lang==="zh"?"点选要导出的页面":"Tap the pages you want"}</p>
    <button type="button" disabled={busy} aria-pressed={!range.trim()} onClick={()=>updateRange("")}
     className="min-h-[44px] rounded-xl border border-[var(--lx-line)] px-3 text-sm aria-pressed:bg-[var(--lx-soft)]">
     {lang==="zh"?"全部页面":"All pages"}
    </button>
   </div>
   <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
    {Array.from({length:lastVisible-firstVisible+1},(_,index)=>{
     const n=firstVisible+index;
     return <button key={n} type="button" disabled={busy} data-testid={"pdf-image-page-"+n}
      aria-label={(lang==="zh"?"第 ":"Page ")+n} aria-pressed={selected.includes(n)} onClick={()=>togglePage(n)}
      className="flex min-h-[44px] min-w-0 flex-col items-center justify-end gap-1 rounded-lg border border-[var(--lx-line)] p-1.5 text-sm aria-pressed:border-sky-500 aria-pressed:bg-sky-500/15">
      <span className="flex aspect-[3/4] w-full items-center justify-center overflow-hidden rounded bg-[var(--lx-soft)]">
       {thumbs[n]&&<img src={thumbs[n]} alt="" className="h-full w-full object-contain"/>}
      </span>
      <span>{n}{selected.includes(n)?" ✓":""}</span>
     </button>
    })}
   </div>
   {pages>THUMBNAILS_PER_VIEW&&<div className="flex items-center justify-center gap-3 text-sm">
    <button type="button" disabled={busy||previewGroup===0} onClick={()=>setPreviewGroup(g=>g-1)} className="min-h-[44px] rounded-lg border px-3 disabled:opacity-40">{lang==="zh"?"上一组":"Previous pages"}</button>
    <span>{firstVisible}–{lastVisible} / {pages}</span>
    <button type="button" disabled={busy||lastVisible===pages} onClick={()=>setPreviewGroup(g=>g+1)} className="min-h-[44px] rounded-lg border px-3 disabled:opacity-40">{lang==="zh"?"下一组":"Next pages"}</button>
   </div>}
   <details className="text-sm text-[var(--lx-muted)]">
    <summary className="cursor-pointer">{lang==="zh"?"按页码输入（可选）":"Enter page numbers (optional)"}</summary>
    <label className="mt-2 block">{c.pages}<input disabled={busy} value={range} onChange={e=>updateRange(e.target.value)} className="ml-2 rounded-lg border border-[var(--lx-line)] px-3 py-2" placeholder="1-5,8"/></label>
   </details>
  </section>}
  <div className="grid gap-3 sm:grid-cols-3">
   <label className="text-sm">{c.format}<select disabled={busy} value={format} onChange={e=>{setFormat(e.target.value as "jpeg"|"png");setResult([]);setError("")}} className="mt-1 w-full rounded-xl border border-[var(--lx-line)] px-3 py-2"><option value="jpeg">JPG</option><option value="png">PNG</option></select></label>
   <label className="text-sm">{c.resolution}<select disabled={busy} value={scale} onChange={e=>{setScale(Number(e.target.value));setResult([]);setError("")}} className="mt-1 w-full rounded-xl border border-[var(--lx-line)] px-3 py-2"><option value="1">1x</option><option value="1.5">1.5x</option><option value="2">2x</option><option value="3">3x</option></select></label>
   <>{format==="jpeg"&&<label className="text-sm">{c.quality}<select disabled={busy} value={quality} onChange={e=>{setQuality(Number(e.target.value));setResult([]);setError("")}} className="mt-1 w-full rounded-xl border border-[var(--lx-line)] px-3 py-2"><option value="0.7">{c.low}</option><option value="0.9">{c.high}</option><option value="1">{c.highest}</option></select></label>}</>
  </div>
  <div className="flex gap-3"><button disabled={!file||busy} onClick={run} className="min-h-[44px] rounded-xl bg-[var(--lx-ink)] px-5 py-2.5 text-sm text-[var(--lx-bg)] disabled:opacity-40">{busy?documentIntakeText(lang,"busy"):c.convert}</button>{busy&&<button onClick={()=>abort.current=true} className="min-h-[44px] rounded-xl border border-[var(--lx-danger)] px-5 py-2.5 text-sm text-[var(--lx-danger)]">{c.cancel}</button>}</div>
  {stage&&<p className="text-sm text-[var(--lx-muted)]">{stage}</p>}{error&&<p role="alert" className="text-sm text-[var(--lx-danger)]">{error}</p>}{result.length>0&&<ResultPanel files={result} sourceSlug="pdf-to-jpg" messageZh={c.ready} messageEn={c.ready}/>}
 </div>;
}
