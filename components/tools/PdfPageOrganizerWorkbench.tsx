"use client";
import {useEffect,useRef,useState} from "react";
import {PDFDocument,degrees} from "pdf-lib";
import {openPdf,renderPdfPage,canvasToBlob} from "@/lib/tools/pdf-render-client";
import {useLingxiLang,type LingxiLang} from "@/lib/lingxi-i18n";
import ResultPanel from "./ResultPanel";
import type {ToolResultFile} from "@/lib/tools/types";

type PageItem={id:string;file:number;page:number;angle:number};
type History={past:PageItem[][];current:PageItem[];future:PageItem[][]};
const empty=():History=>({past:[],current:[],future:[]});
const MAX_PAGES=120;
type Copy={title:string;hint:string;loading:string;preview:string;up:string;down:string;left:string;right:string;duplicate:string;remove:string;undo:string;redo:string;reset:string;save:string;working:string;page:string;of:string;limit:string;error:string;empty:string;notice:string};
const WORDS:Record<LingxiLang,Copy>={
 zh:{title:"可视化整理 PDF 页面",hint:"拖动缩略图调整顺序；手机点击左右移动。支持旋转、复制、删除和撤销，保存为新 PDF。",loading:"正在读取 PDF 页面…",preview:"正在生成页面缩略图…",up:"向前移动",down:"向后移动",left:"左转 90°",right:"右转 90°",duplicate:"复制页面",remove:"删除页面",undo:"撤销",redo:"重做",reset:"恢复原顺序",save:"生成整理后的 PDF",working:"正在生成 PDF…",page:"原始第",of:"页",limit:"单次最多整理 120 页；更多页面请分批处理。",error:"无法打开或导出此 PDF，请检查文件是否完整或受密码保护。",empty:"至少保留一页。",notice:"原始文件保持不变，文本及矢量内容不会被截图替换。"},
 en:{title:"Organize PDF pages visually",hint:"Drag thumbnails to reorder. On mobile use Move back/forward. Rotate, duplicate, delete, undo and save a new PDF.",loading:"Reading PDF pages…",preview:"Creating thumbnails…",up:"Move back",down:"Move forward",left:"Rotate 90° left",right:"Rotate 90° right",duplicate:"Duplicate page",remove:"Delete page",undo:"Undo",redo:"Redo",reset:"Restore original order",save:"Create organized PDF",working:"Creating PDF…",page:"Source page",of:"",limit:"Up to 120 pages per operation. Split larger files first.",error:"Could not read or export this PDF. Check file integrity or password protection.",empty:"Keep at least one page.",notice:"Your original files remain unchanged; text and vectors are not rasterized."},
 ja:{title:"PDFページを並べ替え",hint:"サムネイルをドラッグして順序を変更。スマートフォンでは移動ボタンを使えます。",loading:"PDFを読み込み中…",preview:"プレビュー作成中…",up:"前へ",down:"次へ",left:"左に90度",right:"右に90度",duplicate:"複製",remove:"削除",undo:"元に戻す",redo:"やり直し",reset:"順序をリセット",save:"PDFを作成",working:"作成中…",page:"元ページ",of:"",limit:"一度に最大120ページ。",error:"PDFを開くか保存できません。",empty:"1ページ以上残してください。",notice:"元ファイルを保持し、テキストやベクターも残ります。"},
 ko:{title:"PDF 페이지 정리",hint:"썸네일을 드래그하거나 이동 버튼으로 순서를 변경하세요.",loading:"PDF 읽는 중…",preview:"미리보기 생성 중…",up:"앞으로",down:"뒤로",left:"왼쪽 90°",right:"오른쪽 90°",duplicate:"복제",remove:"삭제",undo:"실행 취소",redo:"다시 실행",reset:"순서 복원",save:"PDF 생성",working:"생성 중…",page:"원본 페이지",of:"",limit:"한 번에 최대 120페이지.",error:"PDF를 열거나 내보낼 수 없습니다.",empty:"최소 한 페이지를 유지하세요.",notice:"원본과 텍스트 및 벡터 콘텐츠가 유지됩니다."},
 fr:{title:"Organiser les pages PDF",hint:"Glissez les miniatures pour réorganiser; utilisez les boutons sur mobile.",loading:"Lecture du PDF…",preview:"Création des miniatures…",up:"Reculer",down:"Avancer",left:"Rotation gauche",right:"Rotation droite",duplicate:"Dupliquer",remove:"Supprimer",undo:"Annuler",redo:"Rétablir",reset:"Réinitialiser",save:"Créer le PDF",working:"Création…",page:"Page source",of:"",limit:"120 pages maximum par opération.",error:"Impossible de lire ou d'exporter le PDF.",empty:"Conservez au moins une page.",notice:"Les originaux restent intacts, sans pixelliser le texte."},
 de:{title:"PDF-Seiten anordnen",hint:"Miniaturen ziehen oder auf Mobilgeräten die Verschieben-Tasten verwenden.",loading:"PDF wird geladen…",preview:"Vorschauen werden erstellt…",up:"Zurück",down:"Weiter",left:"Links drehen",right:"Rechts drehen",duplicate:"Duplizieren",remove:"Löschen",undo:"Rückgängig",redo:"Wiederholen",reset:"Zurücksetzen",save:"PDF erstellen",working:"Wird erstellt…",page:"Originalseite",of:"",limit:"Maximal 120 Seiten pro Vorgang.",error:"PDF konnte nicht gelesen oder exportiert werden.",empty:"Mindestens eine Seite behalten.",notice:"Originaldateien und Vektortext bleiben erhalten."},
 es:{title:"Organizar páginas PDF",hint:"Arrastra las miniaturas para ordenar; usa los botones en el móvil.",loading:"Leyendo PDF…",preview:"Creando miniaturas…",up:"Mover atrás",down:"Mover adelante",left:"Girar a la izquierda",right:"Girar a la derecha",duplicate:"Duplicar",remove:"Eliminar",undo:"Deshacer",redo:"Rehacer",reset:"Restablecer",save:"Crear PDF",working:"Creando PDF…",page:"Página origen",of:"",limit:"Máximo 120 páginas por operación.",error:"No se pudo leer o exportar el PDF.",empty:"Conserva al menos una página.",notice:"Los originales y el contenido vectorial se conservan."},
 pt:{title:"Organizar páginas PDF",hint:"Arraste miniaturas para reordenar ou use os botões no celular.",loading:"Lendo PDF…",preview:"Gerando miniaturas…",up:"Mover atrás",down:"Mover à frente",left:"Girar à esquerda",right:"Girar à direita",duplicate:"Duplicar",remove:"Excluir",undo:"Desfazer",redo:"Refazer",reset:"Restaurar",save:"Criar PDF",working:"Criando PDF…",page:"Página original",of:"",limit:"Até 120 páginas por operação.",error:"Não foi possível ler ou exportar o PDF.",empty:"Mantenha ao menos uma página.",notice:"Arquivos originais e conteúdo vetorial são preservados."},
 ar:{title:"ترتيب صفحات PDF",hint:"اسحب الصور المصغرة للترتيب أو استخدم أزرار النقل على الهاتف.",loading:"جارٍ قراءة PDF…",preview:"جارٍ إنشاء الصور المصغرة…",up:"نقل للخلف",down:"نقل للأمام",left:"تدوير يسارًا",right:"تدوير يمينًا",duplicate:"نسخ",remove:"حذف",undo:"تراجع",redo:"إعادة",reset:"استعادة الترتيب",save:"إنشاء PDF",working:"جارٍ الإنشاء…",page:"الصفحة الأصلية",of:"",limit:"حد أقصى 120 صفحة في المرة.",error:"تعذّر قراءة ملف PDF أو تصديره.",empty:"احتفظ بصفحة واحدة على الأقل.",notice:"تبقى الملفات الأصلية والنصوص والرسوم المتجهة كما هي."}
};
function movePage(items:PageItem[],from:number,to:number){if(from===to||from<0||to<0||from>=items.length||to>=items.length)return items;const next=[...items];const [picked]=next.splice(from,1);next.splice(to,0,picked);return next;}
export default function PdfPageOrganizerWorkbench({files,sourceSlug}:{files:readonly File[];sourceSlug:string}){
 const{lang}=useLingxiLang();const t=WORDS[lang]??WORDS.en;
 const[history,setHistory]=useState<History>(empty);
 const[thumbs,setThumbs]=useState<Record<string,string>>({});
 const[loading,setLoading]=useState(false),[generating,setGenerating]=useState(false),[previewing,setPreviewing]=useState(false);
 const[error,setError]=useState(""),[saved,setSaved]=useState<ToolResultFile|null>(null);
 const[dragged,setDragged]=useState<number|null>(null);
 const[initial,setInitial]=useState<PageItem[]>([]);
 const sourceVersion=useRef(0);
 useEffect(()=>{
  let alive=true;sourceVersion.current++;
  const objectUrls:string[]=[];
  const opened:any[]=[];
  setHistory(empty());setInitial([]);setThumbs({});setError("");setSaved(null);setLoading(files.length>0);setPreviewing(false);
  async function load(){
   if(!files.length)return;
   try{
    const entries:PageItem[]=[];
    for(let f=0;f<files.length;f++){
     const pdf=await openPdf(files[f]);opened.push(pdf);
     if(!alive)return;
     if(entries.length+pdf.numPages>MAX_PAGES)throw Error("PAGE_LIMIT");
     for(let p=1;p<=pdf.numPages;p++)entries.push({id:String(f)+"-"+String(p),file:f,page:p,angle:0});
    }
    if(!entries.length)throw Error("EMPTY_PDF");
    if(!alive)return;
    setInitial(entries);setHistory({past:[],current:entries,future:[]});setLoading(false);setPreviewing(true);
    for(const item of entries){
     if(!alive)return;
     try{
      const rendered=await renderPdfPage(opened[item.file],item.page,.22);
      const blob=await canvasToBlob(rendered.canvas,"image/jpeg",.7);
      rendered.canvas.width=1;rendered.canvas.height=1;
      const url=URL.createObjectURL(blob);objectUrls.push(url);
      if(!alive)return;
      setThumbs(prev=>({...prev,[item.id]:url}));
     }catch{ /* Preview failures must not delete source pages from the editor. */ }
    }
   }catch(err){
    if(alive){setError(err instanceof Error&&err.message==="PAGE_LIMIT"?t.limit:t.error);setHistory(empty());}
   }finally{
    for(const pdf of opened)try{await pdf.destroy?.()}catch{}
    if(alive){setLoading(false);setPreviewing(false)}
   }
  }
  void load();
  return()=>{alive=false;sourceVersion.current++;for(const url of objectUrls)URL.revokeObjectURL(url);for(const pdf of opened)void pdf.destroy?.().catch?.(()=>{})};
 },[files,t.error,t.limit]);
 function edit(change:(items:PageItem[])=>PageItem[]){
  setHistory(h=>{const next=change(h.current);if(next===h.current)return h;return{past:[...h.past.slice(-24),h.current],current:next,future:[]};});
  setSaved(null);setError("");
 }
 const current=history.current;
 function undo(){setHistory(h=>h.past.length?{past:h.past.slice(0,-1),current:h.past[h.past.length-1],future:[h.current,...h.future]}:h);setSaved(null)}
 function redo(){setHistory(h=>h.future.length?{past:[...h.past,h.current],current:h.future[0],future:h.future.slice(1)}:h);setSaved(null)}
 async function exportPdf(){
  if(!current.length||generating)return;
  const version=sourceVersion.current;
  setGenerating(true);setSaved(null);setError("");
  try{
   const originals=await Promise.all(files.map(async f=>PDFDocument.load(await f.arrayBuffer(),{ignoreEncryption:false})));
   const output=await PDFDocument.create();
   for(const item of current){
    const [copied]=await output.copyPages(originals[item.file],[item.page-1]);
    if(item.angle){const original=(copied.getRotation().angle||0);copied.setRotation(degrees(((original+item.angle)%360+360)%360));}
    output.addPage(copied);
   }
   const bytes=await output.save({useObjectStreams:true,addDefaultPage:false});
   const blob=new Blob([new Uint8Array(bytes)],{type:"application/pdf"});
   const base=files[0]?.name.replace(/\.pdf$/i,"")||"document";
   if(sourceVersion.current===version)setSaved({name:base+"-organized.pdf",blob,mime:"application/pdf",size:blob.size});
  }catch{setError(t.error)}finally{setGenerating(false)}
 }
 if(!files.length)return null;
 return <section data-testid="pdf-page-organizer" className="mt-4 space-y-4 rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-4 sm:p-5">
  <div className="space-y-1"><h3 className="font-semibold">{t.title}</h3><p className="text-sm leading-6 text-[var(--lx-muted)]">{t.hint}</p></div>
  {loading&&<p role="status">{t.loading}</p>}
  {!loading&&previewing&&<p role="status" className="text-sm text-[var(--lx-muted)]">{t.preview}</p>}
  {error&&<p role="alert" className="text-sm text-[var(--lx-danger)]">{error}</p>}
  {current.length>0&&<>
   <div className="flex flex-wrap items-center gap-2">
    <button type="button" disabled={!history.past.length||generating} onClick={undo} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40">{t.undo}</button>
    <button type="button" disabled={!history.future.length||generating} onClick={redo} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40">{t.redo}</button>
    <button type="button" disabled={!history.past.length||generating} onClick={()=>{setHistory(h=>({past:[...h.past,h.current],current:initial,future:[]}));setSaved(null)}} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40">{t.reset}</button>
    <span data-testid="pdf-organizer-count" className="ml-auto text-sm tabular-nums">{current.length} {t.of}</span>
   </div>
   <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4" data-testid="pdf-organizer-grid">
    {current.map((item,index)=><article key={item.id+"-"+index} data-testid="pdf-organizer-page" draggable={!generating} onDragStart={e=>{setDragged(index);e.dataTransfer.effectAllowed="move";e.dataTransfer.setData("text/plain",String(index));}} onDragOver={e=>{e.preventDefault();e.dataTransfer.dropEffect="move"}} onDrop={e=>{e.preventDefault();const from=Number(e.dataTransfer.getData("text/plain"));if(Number.isInteger(from))edit(items=>movePage(items,from,index));setDragged(null)}} onDragEnd={()=>setDragged(null)} className={"min-w-0 rounded-xl border bg-[var(--lx-soft)] p-2 "+(dragged===index?"opacity-60":"")}>
     <div className="flex h-36 items-center justify-center overflow-hidden rounded-lg bg-white" dir="ltr">
      {thumbs[item.id]?<img alt={t.page+" "+item.page} draggable={false} src={thumbs[item.id]} style={{transform:"rotate("+item.angle+"deg)"}} className="max-h-full max-w-full object-contain"/>:<span className="text-xs text-gray-600">{t.preview}</span>}
     </div>
     <div className="mt-2 break-all text-xs text-[var(--lx-muted)]"><strong className="text-[var(--lx-ink)]">{index+1}.</strong> {files[item.file]?.name} · {t.page} {item.page}</div>
     <div className="mt-2 grid grid-cols-3 gap-1">
      <button type="button" aria-label={t.up+" "+(index+1)} title={t.up} disabled={index===0||generating} onClick={()=>edit(items=>movePage(items,index,index-1))} className="rounded-md border px-1 py-1.5 disabled:opacity-30">←</button>
      <button type="button" aria-label={t.down+" "+(index+1)} title={t.down} disabled={index===current.length-1||generating} onClick={()=>edit(items=>movePage(items,index,index+1))} className="rounded-md border px-1 py-1.5 disabled:opacity-30">→</button>
      <button type="button" aria-label={t.duplicate+" "+(index+1)} title={t.duplicate} disabled={current.length>=MAX_PAGES||generating} onClick={()=>edit(items=>{const next=[...items];next.splice(index+1,0,{...item});return next;})} className="rounded-md border px-1 py-1.5 disabled:opacity-30">＋</button>
      <button type="button" aria-label={t.left+" "+(index+1)} title={t.left} disabled={generating} onClick={()=>edit(items=>items.map((p,j)=>j===index?{...p,angle:(p.angle+270)%360}:p))} className="rounded-md border px-1 py-1.5">↶</button>
      <button type="button" aria-label={t.right+" "+(index+1)} title={t.right} disabled={generating} onClick={()=>edit(items=>items.map((p,j)=>j===index?{...p,angle:(p.angle+90)%360}:p))} className="rounded-md border px-1 py-1.5">↷</button>
      <button type="button" aria-label={t.remove+" "+(index+1)} title={t.remove} disabled={current.length<=1||generating} onClick={()=>edit(items=>items.filter((_,j)=>j!==index))} className="rounded-md border px-1 py-1.5 disabled:opacity-30">×</button>
     </div>
    </article>)}
   </div>
   <p className="text-xs leading-5 text-[var(--lx-muted)]">{t.notice}</p>
   <button type="button" data-testid="pdf-organizer-export" disabled={generating||loading||!current.length} onClick={()=>void exportPdf()} className="rounded-xl bg-[var(--lx-ink)] px-5 py-3 font-medium text-[var(--lx-bg)] disabled:opacity-50">{generating?t.working:t.save}</button>
   {saved&&<ResultPanel files={[saved]} messageZh="PDF 页面整理完成。" messageEn="Organized PDF is ready." sourceSlug={sourceSlug}/>}
  </>}
 </section>;
}
