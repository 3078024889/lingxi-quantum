"use client";
import NextImage from "next/image";
import {PointerEvent,useEffect,useMemo,useRef,useState} from "react";
import {PDFDocument} from "pdf-lib";
import FileDropzone from "@/components/tools/FileDropzone";
import ResultPanel from "@/components/tools/ResultPanel";
import {openPdf,renderPdfPage,canvasToBlob} from "@/lib/tools/pdf-render-client";
import {useLingxiLang,type LingxiLang} from "@/lib/lingxi-i18n";
import type {ToolResultFile} from "@/lib/tools/types";

type Box={x:number;y:number;w:number;h:number};
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
 const[files,setFiles]=useState<File[]>([]),[pages,setPages]=useState(0),[page,setPage]=useState(1),[preview,setPreview]=useState(""),[box,setBox]=useState<Box>({x:.15,y:.2,w:.35,h:.08}),[scope,setScope]=useState<"one"|"all">("one"),[busy,setBusy]=useState(false),[error,setError]=useState(""),[result,setResult]=useState<ToolResultFile[]>([]);
 const wrap=useRef<HTMLDivElement>(null),start=useRef<{x:number;y:number}|null>(null),file=files[0]||null;
 useEffect(()=>()=>{if(preview)URL.revokeObjectURL(preview)},[preview]);
 async function load(next:File[]){
  setFiles(next);setResult([]);setError("");setPages(0);setPage(1);
  if(preview)URL.revokeObjectURL(preview);setPreview("");
  if(!next[0])return;
  try{const pdf=await openPdf(next[0]);setPages(pdf.numPages);await show(pdf,1);pdf.destroy?.()}catch(e){setError(e instanceof Error?e.message:String(e))}
 }
 async function show(pdfOrFile:any,n:number){
  const pdf=pdfOrFile instanceof File?await openPdf(pdfOrFile):pdfOrFile;
  const r=await renderPdfPage(pdf,n,1.2),b=await canvasToBlob(r.canvas,"image/jpeg",.9);
  if(preview)URL.revokeObjectURL(preview);setPreview(URL.createObjectURL(b));r.canvas.width=1;r.canvas.height=1;
  if(pdfOrFile instanceof File)pdf.destroy?.();
 }
 async function changePage(n:number){setPage(n);if(file)await show(file,n)}
 function point(e:PointerEvent){const r=wrap.current!.getBoundingClientRect();return{x:Math.max(0,Math.min(1,(e.clientX-r.left)/r.width)),y:Math.max(0,Math.min(1,(e.clientY-r.top)/r.height))}}
 async function exportRedacted(){
  if(!file)return;setBusy(true);setError("");setResult([]);
  try{
   const pdf=await openPdf(file),out=await PDFDocument.create();
   try{
    for(let n=1;n<=pdf.numPages;n++){
     const r=await renderPdfPage(pdf,n,1.5),ctx=r.canvas.getContext("2d")!;
     if(scope==="all"||n===page){ctx.fillStyle="#000";ctx.fillRect(Math.round(box.x*r.width),Math.round(box.y*r.height),Math.round(box.w*r.width),Math.round(box.h*r.height))}
     const jpg=await canvasToBlob(r.canvas,"image/jpeg",.92),img=await out.embedJpg(await jpg.arrayBuffer()),src=await pdf.getPage(n),vp=src.getViewport({scale:1}),p=out.addPage([vp.width,vp.height]);p.drawImage(img,{x:0,y:0,width:vp.width,height:vp.height});r.canvas.width=1;r.canvas.height=1;
    }
   }finally{pdf.destroy?.()}
   const bytes=await out.save(),copy=new Uint8Array(bytes.length);copy.set(bytes);const blob=new Blob([copy.buffer],{type:"application/pdf"});
   setResult([{name:`redacted-${file.name}`,blob,mime:"application/pdf",size:blob.size}]);
  }catch(e){setError(e instanceof Error?e.message:String(e))}finally{setBusy(false)}
 }
 return <div className="space-y-4">
  <FileDropzone accept="application/pdf,.pdf" files={files} onChange={load} disabled={busy} kind="pdf" maxSizeMB={200}/>
  {preview&&<><div className="flex flex-wrap items-center gap-3 text-sm text-[var(--lx-muted)]"><label>{c.page} <input type="number" min={1} max={pages} value={page} onChange={e=>void changePage(Math.max(1,Math.min(pages,Number(e.target.value)||1)))} className="w-16 rounded-lg border border-[var(--lx-line)] bg-[var(--lx-panel)] px-2 py-1 text-[var(--lx-ink)]"/></label><select value={scope} onChange={e=>setScope(e.target.value as "one"|"all")} className="rounded-lg border border-[var(--lx-line)] bg-[var(--lx-panel)] px-3 py-2 text-[var(--lx-ink)]"><option value="one">{c.one}</option><option value="all">{c.all}</option></select></div>
  <div ref={wrap} className="relative mx-auto w-fit max-w-full touch-none overflow-hidden rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-soft)]" onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);const p=point(e);start.current=p;setBox({x:p.x,y:p.y,w:0,h:0})}} onPointerMove={e=>{if(!start.current)return;const p=point(e),s=start.current;setBox({x:Math.min(s.x,p.x),y:Math.min(s.y,p.y),w:Math.abs(p.x-s.x),h:Math.abs(p.y-s.y)})}} onPointerUp={()=>start.current=null}><NextImage src={preview} alt="" className="block max-h-[680px] max-w-full select-none" width={1600} height={1200} unoptimized/><div className="pointer-events-none absolute bg-black/75" style={{left:`${box.x*100}%`,top:`${box.y*100}%`,width:`${box.w*100}%`,height:`${box.h*100}%`}}/></div></>}
  <div className="rounded-xl border border-[var(--lx-line)] bg-[var(--lx-soft)] p-3 text-xs leading-5 text-[var(--lx-muted)]">{c.warning}</div>
  <button disabled={!file||busy||box.w<.005||box.h<.005} onClick={exportRedacted} className="rounded-xl bg-[var(--lx-ink)] px-5 py-2.5 text-sm text-[var(--lx-bg)] disabled:opacity-40">{busy?c.busy:c.export}</button>
  {!!result.length&&<ResultPanel files={result} messageZh={c.ready} messageEn={c.ready}/>}
  {error&&<p role="alert" className="text-sm text-[var(--lx-danger)]">{c.error} · {error}</p>}
 </div>;
}
