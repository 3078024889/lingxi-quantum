"use client";

import EditableNumberInput from "@/components/ui/EditableNumberInput";
import NextImage from "next/image";
import {PointerEvent,useEffect,useRef,useState} from "react";
import {PDFDocument} from "pdf-lib";
import FileDropzone from "@/components/tools/FileDropzone";
import ResultPanel from "@/components/tools/ResultPanel";
import PaidActionButton from "@/components/tools/PaidActionButton";
import {openPdf,renderPdfPage,canvasToBlob} from "@/lib/tools/pdf-render-client";
import {useLingxiLang,type LingxiLang} from "@/lib/lingxi-i18n";
import type {ToolResultFile} from "@/lib/tools/types";
import {clearPdfMetadata} from "@/lib/tools/shared/pdf-metadata";

type Box={x:number;y:number;w:number;h:number};
const controls:Record<LingxiLang,string[]>={
 zh:['滑动浏览','框选遮盖','撤销上一个','清除本页','先点“框选遮盖”，拖动选择一处；松手后可继续滑动。','已选区域','预览免费；导出按文件总页数计费：每页 ¥1 / $1。','正在读取文件…'],
 en:['Scroll pages','Draw redaction','Undo last','Clear page','Choose Draw redaction, drag one area, then scroll normally.','Selected areas','Preview is free. Export costs ¥1 / $1 per document page.','Reading file…'],
 ja:['スクロール','墨消し範囲','元に戻す','ページをクリア','範囲を選び、ドラッグ後はスクロールできます。','選択範囲','プレビュー無料。出力は全ページ数 × ¥1 / $1。','読込中…'],
 ko:['스크롤','가림 영역 선택','실행 취소','페이지 지우기','영역 선택 후 드래그하세요. 손을 떼면 스크롤됩니다.','선택 영역','미리보기 무료. 내보내기: 전체 페이지당 ¥1 / $1.','읽는 중…'],
 fr:['Défiler','Tracer une zone','Annuler','Effacer la page','Tracez une zone ; relâchez pour défiler.','Zones choisies','Aperçu gratuit. Export : ¥1 / $1 par page du document.','Lecture…'],
 de:['Scrollen','Bereich schwärzen','Rückgängig','Seite leeren','Bereich ziehen; danach wieder normal scrollen.','Bereiche','Vorschau kostenlos. Export: ¥1 / $1 je Dokumentseite.','Wird gelesen…'],
 es:['Desplazar','Marcar zona','Deshacer','Borrar página','Arrastra una zona y suelta para volver a desplazar.','Zonas elegidas','Vista previa gratis. Exportación: ¥1 / $1 por página.','Leyendo…'],
 pt:['Rolar','Marcar área','Desfazer','Limpar página','Arraste uma área e solte para voltar a rolar.','Áreas escolhidas','Prévia grátis. Exportação: ¥1 / $1 por página.','Lendo…'],
 ar:['تمرير','تحديد منطقة','تراجع','مسح الصفحة','حدد منطقة بالسحب ثم ارفع إصبعك للتمرير.','المناطق المحددة','المعاينة مجانية. التصدير ¥1 / $1 لكل صفحة في المستند.','جارٍ القراءة…']
};
type C={page:string;one:string;all:string;warning:string;export:string;busy:string;ready:string;error:string};
const D:Record<LingxiLang,C>={
 zh:{page:"页码",one:"只处理这一页",all:"每页相同位置",warning:"安全遮盖会把导出的每一页重新生成成图片，遮盖区域下方的文字不会再被复制恢复；同时，导出的 PDF 也不会保留可搜索、可选择的文字。",export:"生成安全遮盖 PDF",busy:"正在生成…",ready:"安全遮盖 PDF 已生成，可以先核对结果再下载。",error:"安全遮盖没有完成"},
 en:{page:"Page",one:"This page only",all:"Same area on every page",warning:"Safe redaction rebuilds exported pages as images. Text beneath the covered area cannot be recovered by copy/paste, but searchable/selectable text is also removed from the exported PDF.",export:"Create safely redacted PDF",busy:"Creating…",ready:"The safely redacted PDF is ready. Review it before downloading.",error:"Redaction did not finish"},
 ja:{page:"ページ",one:"このページのみ",all:"すべてのページで同じ位置",warning:"安全な墨消しでは書き出すページを画像として再構築します。隠した領域の文字はコピーで復元できませんが、検索・選択可能な文字も失われます。",export:"安全な墨消し PDF を生成",busy:"生成中…",ready:"安全な墨消し PDF を生成しました。確認してからダウンロードできます。",error:"墨消しを完了できませんでした"},
 ko:{page:"페이지",one:"이 페이지만",all:"모든 페이지 같은 위치",warning:"안전한 가림 처리는 내보낸 페이지를 이미지로 다시 만듭니다. 가린 영역의 텍스트는 복사로 복원할 수 없지만 검색/선택 가능한 텍스트도 사라집니다.",export:"안전 가림 PDF 생성",busy:"생성 중…",ready:"안전 가림 PDF가 준비되었습니다. 확인 후 다운로드하세요.",error:"가림 처리를 완료하지 못했습니다"},
 fr:{page:"Page",one:"Cette page uniquement",all:"Même zone sur chaque page",warning:"Le masquage sécurisé reconstruit les pages exportées en images. Le texte sous la zone masquée n’est plus récupérable par copier-coller, mais le texte recherchable/sélectionnable disparaît aussi.",export:"Créer le PDF masqué",busy:"Création…",ready:"Le PDF masqué est prêt. Vérifiez-le avant de télécharger.",error:"Le masquage n’a pas abouti"},
 de:{page:"Seite",one:"Nur diese Seite",all:"Gleicher Bereich auf jeder Seite",warning:"Die sichere Schwärzung erstellt exportierte Seiten als Bilder neu. Text unter der Schwärzung kann nicht per Copy/Paste wiederhergestellt werden; such-/markierbarer Text geht ebenfalls verloren.",export:"Sicher geschwärztes PDF erstellen",busy:"Erstellung…",ready:"Das sicher geschwärzte PDF ist fertig. Vor dem Download prüfen.",error:"Schwärzung konnte nicht abgeschlossen werden"},
 es:{page:"Página",one:"Solo esta página",all:"Misma zona en todas las páginas",warning:"La ocultación segura reconstruye las páginas exportadas como imágenes. El texto bajo la zona no puede recuperarse copiando y pegando, pero también se pierde el texto buscable/seleccionable.",export:"Crear PDF ocultado de forma segura",busy:"Creando…",ready:"El PDF ocultado está listo. Revísalo antes de descargar.",error:"No se pudo completar la ocultación"},
 pt:{page:"Página",one:"Somente esta página",all:"Mesma área em todas as páginas",warning:"A ocultação segura reconstrói as páginas exportadas como imagens. O texto coberto não pode ser recuperado por copiar/colar, mas o texto pesquisável/selecionável também é removido.",export:"Criar PDF com ocultação segura",busy:"Criando…",ready:"O PDF com ocultação segura está pronto. Revise antes de baixar.",error:"Não foi possível concluir a ocultação"},
 ar:{page:"الصفحة",one:"هذه الصفحة فقط",all:"المنطقة نفسها في كل الصفحات",warning:"يعيد الإخفاء الآمن إنشاء الصفحات المصدّرة كصور. لا يمكن استرجاع النص الموجود تحت المنطقة المخفية بالنسخ واللصق، لكن النص القابل للبحث والتحديد سيزول أيضًا.",export:"إنشاء PDF بإخفاء آمن",busy:"جارٍ الإنشاء…",ready:"ملف PDF الآمن جاهز. راجعه قبل التنزيل.",error:"تعذر إكمال الإخفاء"}
};

export default function PdfRedactWorkbench(){
 const{lang}=useLingxiLang();const c=D[lang]??D.en;
 const ui=controls[lang]??controls.en;
 const[files,setFiles]=useState<File[]>([]),[pages,setPages]=useState(0),[page,setPage]=useState(1),[preview,setPreview]=useState(""),[previewSize,setPreviewSize]=useState({width:1,height:1}),[marks,setMarks]=useState<Record<number,Box[]>>({}),[shared,setShared]=useState<Box[]>([]),[pending,setPending]=useState<Box|null>(null),[scope,setScope]=useState<"one"|"all">("one"),[draw,setDraw]=useState(false),[loading,setLoading]=useState(false),[busy,setBusy]=useState(false),[progress,setProgress]=useState(0),[error,setError]=useState(""),[result,setResult]=useState<ToolResultFile[]>([]),[draftId,setDraftId]=useState("");
 const wrap=useRef<HTMLDivElement>(null),start=useRef<{x:number;y:number;pointer:number}|null>(null),version=useRef(0),file=files[0]||null;
 const boxes=scope==='all'?shared:marks[page]||[],count=scope==='all'?shared.length:Object.values(marks).reduce((sum,list)=>sum+list.length,0);
 function edit(next:Box[]){if(scope==='all')setShared(next);else setMarks(old=>({...old,[page]:next}));setResult([]);setDraftId(crypto.randomUUID())}
 useEffect(()=>()=>{if(preview)URL.revokeObjectURL(preview)},[preview]);
 useEffect(()=>()=>{version.current++},[]);
 async function load(next:File[]){
  const ticket=++version.current;setFiles(next);setResult([]);setError("");setPages(0);setPage(1);setMarks({});setShared([]);setPending(null);setDraw(false);start.current=null;setDraftId(crypto.randomUUID());
  setPreview("");
  if(!next[0]){setLoading(false);return}setLoading(true);
  try{const pdf=await openPdf(next[0]);try{if(pdf.numPages>200)throw Error('PDF_PAGE_LIMIT_200');if(ticket!==version.current)return;setPages(pdf.numPages);await show(pdf,1,ticket)}finally{await pdf.destroy?.()}}catch(e){if(ticket===version.current)setError(e instanceof Error?e.message:String(e))}finally{if(ticket===version.current)setLoading(false)}
 }
 async function show(pdfOrFile:File|Awaited<ReturnType<typeof openPdf>>,n:number,ticket:number){
  const pdf=pdfOrFile instanceof File?await openPdf(pdfOrFile):pdfOrFile;
  try{const r=await renderPdfPage(pdf,n,1.2);try{const b=await canvasToBlob(r.canvas,"image/png");if(ticket!==version.current)return;setPreviewSize({width:r.width,height:r.height});setPreview(URL.createObjectURL(b))}finally{r.canvas.width=1;r.canvas.height=1}}finally{if(pdfOrFile instanceof File)await pdf.destroy?.()}
 }
 async function changePage(n:number){if(!file||loading||busy||n===page)return;const ticket=++version.current;setPage(n);setDraw(false);setPending(null);start.current=null;setLoading(true);try{await show(file,n,ticket)}catch(e){setError(e instanceof Error?e.message:String(e))}finally{if(ticket===version.current)setLoading(false)}}
 function point(e:PointerEvent){const r=wrap.current!.getBoundingClientRect();return{x:Math.max(0,Math.min(1,(e.clientX-r.left)/r.width)),y:Math.max(0,Math.min(1,(e.clientY-r.top)/r.height))}}
 async function exportRedacted(){
  if(!file||!count||loading)throw Error('PROCESSING_INPUT_MISSING');setBusy(true);setError("");setResult([]);setProgress(0);
  try{
   const pdf=await openPdf(file),out=await PDFDocument.create();
   try{
    for(let n=1;n<=pdf.numPages;n++){
     const r=await renderPdfPage(pdf,n,1.5);try{const ctx=r.canvas.getContext("2d");if(!ctx)throw Error('CANVAS_UNAVAILABLE');ctx.globalAlpha=1;ctx.fillStyle="#000";
     for(const box of scope==='all'?shared:marks[n]||[]){const x=Math.floor(box.x*r.width),y=Math.floor(box.y*r.height);ctx.fillRect(x,y,Math.ceil((box.x+box.w)*r.width)-x,Math.ceil((box.y+box.h)*r.height)-y)}
     const png=await canvasToBlob(r.canvas,"image/png"),img=await out.embedPng(await png.arrayBuffer()),src=await pdf.getPage(n),vp=src.getViewport({scale:1}),p=out.addPage([vp.width,vp.height]);p.drawImage(img,{x:0,y:0,width:vp.width,height:vp.height});setProgress(n);await new Promise(resolve=>setTimeout(resolve,0))}finally{r.canvas.width=1;r.canvas.height=1}
    }
   }finally{pdf.destroy?.()}
   clearPdfMetadata(out);const bytes=await out.save(),copy=new Uint8Array(bytes.length);copy.set(bytes);const blob=new Blob([copy.buffer],{type:"application/pdf"});
   setResult([{name:`redacted-${file.name}`,blob,mime:"application/pdf",size:blob.size}]);
  }catch(e){setError(e instanceof Error?e.message:String(e));throw e}finally{setBusy(false)}
 }
 return <div dir={lang==='ar'?'rtl':'ltr'} className="space-y-4">
  <FileDropzone accept="application/pdf,.pdf" files={files} onChange={load} disabled={busy||loading} kind="pdf" maxSizeMB={40}/>
  {preview&&<><div className="flex flex-wrap items-center gap-3 text-sm text-[var(--lx-muted)]"><label>{c.page} <EditableNumberInput aria-label={c.page} type="number" min={1} max={pages} disabled={busy||loading} value={page} onChange={e=>void changePage(Math.max(1,Math.min(pages,Math.trunc(Number(e.target.value)))))} className="w-20 rounded-lg border border-[var(--lx-line)] bg-[var(--lx-panel)] px-3 py-2 text-[var(--lx-ink)]"/> / {pages}</label><select aria-label={c.all} disabled={busy||loading} value={scope} onChange={e=>{setScope(e.target.value as 'one'|'all');setDraw(false);setPending(null);setResult([]);setDraftId(crypto.randomUUID())}} className="rounded-lg border border-[var(--lx-line)] bg-[var(--lx-panel)] px-3 py-2 text-[var(--lx-ink)]"><option value="one">{c.one}</option><option value="all">{c.all}</option></select></div>
  <div className="flex flex-wrap gap-2">{[false,true].map(active=><button key={String(active)} type="button" aria-pressed={draw===active} disabled={busy||loading} onClick={()=>{setDraw(active);setPending(null);start.current=null}} className="rounded-xl border border-[var(--lx-line)] px-4 py-3 text-sm aria-pressed:bg-[var(--lx-ink)] aria-pressed:text-[var(--lx-bg)]">{ui[active?1:0]}</button>)}<button type="button" disabled={!boxes.length||busy||loading} onClick={()=>edit(boxes.slice(0,-1))} className="rounded-xl border border-[var(--lx-line)] px-3 py-3 text-sm">{ui[2]}</button><button type="button" disabled={!boxes.length||busy||loading} onClick={()=>edit([])} className="rounded-xl border border-[var(--lx-line)] px-3 py-3 text-sm">{ui[3]}</button></div><p className="text-sm text-[var(--lx-muted)]">{ui[4]} · {ui[5]}: {boxes.length}</p>
  <div ref={wrap} data-redaction-surface data-mode={draw?'draw':'scroll'} className="relative mx-auto w-fit max-w-full overflow-hidden border border-[var(--lx-line)] bg-[var(--lx-soft)]" style={{touchAction:draw?'none':'pan-y pinch-zoom',cursor:draw?'crosshair':'auto'}}
   onPointerDown={e=>{if(!draw||loading||busy||!e.isPrimary||e.button!==0||start.current)return;e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);const p=point(e);start.current={...p,pointer:e.pointerId};setPending({...p,w:0,h:0})}}
   onPointerMove={e=>{const s=start.current;if(!s||s.pointer!==e.pointerId)return;const p=point(e);setPending({x:Math.min(s.x,p.x),y:Math.min(s.y,p.y),w:Math.abs(p.x-s.x),h:Math.abs(p.y-s.y)})}}
   onPointerUp={e=>{const s=start.current;if(!s||s.pointer!==e.pointerId)return;const p=point(e),box={x:Math.min(s.x,p.x),y:Math.min(s.y,p.y),w:Math.abs(p.x-s.x),h:Math.abs(p.y-s.y)};start.current=null;setPending(null);setDraw(false);if(box.w>=.003&&box.h>=.003&&count<200)edit([...boxes,box]);if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId)}}
   onPointerCancel={()=>{start.current=null;setPending(null);setDraw(false)}} onLostPointerCapture={()=>{start.current=null;setPending(null);setDraw(false)}}>
   <NextImage src={preview} alt="" draggable={false} className="block max-w-full select-none" style={{width:Math.min(previewSize.width,760),height:'auto'}} width={previewSize.width} height={previewSize.height} unoptimized/>
   {[...boxes,...(pending?[pending]:[])].map((box,index)=><div key={index} data-redaction-box className="pointer-events-none absolute bg-black" style={{left:`${box.x*100}%`,top:`${box.y*100}%`,width:`${box.w*100}%`,height:`${box.h*100}%`}}/>)}
  </div></>}
  {loading&&<p role="status">{ui[7]}</p>}
  <div className="rounded-xl border border-[var(--lx-line)] bg-[var(--lx-soft)] p-3 text-xs leading-5 text-[var(--lx-muted)]">{c.warning}</div>
  <p className="text-sm text-[var(--lx-muted)]">{ui[6]}{pages>0&&<> · {pages} {c.page}: ¥{pages} / ${pages}</>}</p>
  {file&&count>0&&<PaidActionButton toolId="pdf-redact" quantity={pages} draftId={draftId} draftReady={!busy&&!loading} metadata={{pages,scope,regions:count}} onPaid={exportRedacted} label={c.export}/>}
  {busy&&<p role="status" aria-live="polite">{c.busy} {progress} / {pages}</p>}
  {!!result.length&&<ResultPanel files={result} messageZh={c.ready} messageEn={c.ready}/>}
  {error&&<p role="alert" className="text-sm text-[var(--lx-danger)]">{c.error} · {error}</p>}
 </div>;
}
