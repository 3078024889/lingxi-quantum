"use client";
import {useMemo,useRef,useState} from "react";
import {PDFDocument} from "pdf-lib";
import FileDropzone from "@/components/tools/FileDropzone";
import ResultPanel from "@/components/tools/ResultPanel";
import {openPdf,renderPdfPage,canvasToBlob} from "@/lib/tools/pdf-render-client";
import {useLingxiLang,type LingxiLang} from "@/lib/lingxi-i18n";
import type {ToolResultFile} from "@/lib/tools/types";

type C={light:string;recommended:string;strong:string;warning:string;compress:string;busy:string;cancel:string;done:string;error:string;before:string;after:string;change:string};
const D:Record<LingxiLang,C>={
 zh:{light:"轻度",recommended:"推荐",strong:"强力",warning:"此模式会把每一页重新生成成图片型 PDF，适合扫描件或图片较多的 PDF。可选择文字、矢量内容和部分交互元素不会被保留。",compress:"开始压缩",busy:"正在压缩…",cancel:"取消",done:"压缩完成，可以先查看体积变化再下载。",error:"压缩没有完成",before:"原文件",after:"压缩后",change:"变化"},
 en:{light:"Light",recommended:"Recommended",strong:"Strong",warning:"This mode rebuilds each page as an image-based PDF. It works best for scanned or image-heavy files. Selectable text, vector content and some interactive elements will not be preserved.",compress:"Compress PDF",busy:"Compressing…",cancel:"Cancel",done:"Compression finished. Review the size change before downloading.",error:"Compression did not finish",before:"Before",after:"After",change:"Change"},
 ja:{light:"軽度",recommended:"おすすめ",strong:"強力",warning:"各ページを画像ベースの PDF として再構築します。スキャンや画像中心の PDF に向いています。選択可能な文字やベクター、一部のインタラクティブ要素は保持されません。",compress:"PDF を圧縮",busy:"圧縮中…",cancel:"キャンセル",done:"圧縮が完了しました。サイズ変化を確認してからダウンロードできます。",error:"圧縮を完了できませんでした",before:"元サイズ",after:"圧縮後",change:"変化"},
 ko:{light:"가볍게",recommended:"권장",strong:"강하게",warning:"각 페이지를 이미지형 PDF로 다시 만듭니다. 스캔본이나 이미지가 많은 PDF에 적합합니다. 선택 가능한 텍스트, 벡터 콘텐츠 및 일부 상호작용 요소는 유지되지 않습니다.",compress:"PDF 압축",busy:"압축 중…",cancel:"취소",done:"압축이 완료되었습니다. 용량 변화를 확인한 뒤 다운로드하세요.",error:"압축을 완료하지 못했습니다",before:"원본",after:"압축 후",change:"변화"},
 fr:{light:"Légère",recommended:"Recommandée",strong:"Forte",warning:"Ce mode reconstruit chaque page comme un PDF basé sur des images. Il convient surtout aux scans et aux PDF riches en images. Le texte sélectionnable, les vecteurs et certains éléments interactifs ne seront pas conservés.",compress:"Compresser le PDF",busy:"Compression…",cancel:"Annuler",done:"Compression terminée. Vérifiez la taille avant de télécharger.",error:"La compression n’a pas abouti",before:"Avant",after:"Après",change:"Variation"},
 de:{light:"Leicht",recommended:"Empfohlen",strong:"Stark",warning:"Dieser Modus erstellt jede Seite als bildbasiertes PDF neu. Geeignet für Scans und bildreiche PDFs. Auswählbarer Text, Vektoren und einige interaktive Elemente bleiben nicht erhalten.",compress:"PDF komprimieren",busy:"Komprimierung…",cancel:"Abbrechen",done:"Komprimierung abgeschlossen. Größenänderung prüfen und herunterladen.",error:"Komprimierung konnte nicht abgeschlossen werden",before:"Vorher",after:"Nachher",change:"Änderung"},
 es:{light:"Ligera",recommended:"Recomendada",strong:"Fuerte",warning:"Este modo reconstruye cada página como PDF basado en imágenes. Es ideal para escaneos o archivos con muchas imágenes. El texto seleccionable, los vectores y algunos elementos interactivos no se conservarán.",compress:"Comprimir PDF",busy:"Comprimiendo…",cancel:"Cancelar",done:"Compresión terminada. Revisa el cambio de tamaño antes de descargar.",error:"No se pudo completar la compresión",before:"Antes",after:"Después",change:"Cambio"},
 pt:{light:"Leve",recommended:"Recomendada",strong:"Forte",warning:"Este modo reconstrói cada página como PDF baseado em imagens. Funciona melhor para digitalizações e PDFs com muitas imagens. Texto selecionável, vetores e alguns elementos interativos não serão preservados.",compress:"Comprimir PDF",busy:"Comprimindo…",cancel:"Cancelar",done:"Compressão concluída. Confira a mudança de tamanho antes de baixar.",error:"Não foi possível concluir a compressão",before:"Antes",after:"Depois",change:"Mudança"},
 ar:{light:"خفيف",recommended:"موصى به",strong:"قوي",warning:"يعيد هذا الوضع إنشاء كل صفحة كملف PDF قائم على الصور. يناسب الملفات الممسوحة أو الغنية بالصور. لن يتم الاحتفاظ بالنص القابل للتحديد أو العناصر المتجهية وبعض العناصر التفاعلية.",compress:"ضغط PDF",busy:"جارٍ الضغط…",cancel:"إلغاء",done:"اكتمل الضغط. راجع تغير الحجم ثم نزّل الملف.",error:"تعذر إكمال الضغط",before:"قبل",after:"بعد",change:"التغير"}
};

export default function PdfCompressWorkbench(){
 const{lang}=useLingxiLang();const c=D[lang]??D.en;
 const[files,setFiles]=useState<File[]>([]),[mode,setMode]=useState<"light"|"recommended"|"strong">("recommended"),[busy,setBusy]=useState(false),[stage,setStage]=useState(""),[result,setResult]=useState<ToolResultFile[]>([]),[stats,setStats]=useState<{before:number;after:number}|null>(null),[error,setError]=useState("");
 const abort=useRef(false),file=files[0]||null;
 const cfg=mode==="light"?{scale:1.6,q:.84}:mode==="strong"?{scale:1.05,q:.58}:{scale:1.3,q:.72};
 async function run(){
  if(!file)return;setBusy(true);setError("");setResult([]);setStats(null);abort.current=false;
  try{
   const pdf=await openPdf(file),out=await PDFDocument.create();
   try{
    for(let n=1;n<=pdf.numPages;n++){
     if(abort.current)throw new Error(c.cancel);
     setStage(`${n}/${pdf.numPages}`);
     const rr=await renderPdfPage(pdf,n,cfg.scale),jpg=await canvasToBlob(rr.canvas,"image/jpeg",cfg.q),img=await out.embedJpg(await jpg.arrayBuffer());
     const src=await pdf.getPage(n),vp=src.getViewport({scale:1}),page=out.addPage([vp.width,vp.height]);
     page.drawImage(img,{x:0,y:0,width:vp.width,height:vp.height});rr.canvas.width=1;rr.canvas.height=1;
    }
   }finally{pdf.destroy?.()}
   const bytes=await out.save({useObjectStreams:true}),copy=new Uint8Array(bytes.length);copy.set(bytes);
   const b=new Blob([copy.buffer],{type:"application/pdf"});
   setStats({before:file.size,after:b.size});setResult([{name:`compressed-${file.name}`,blob:b,mime:"application/pdf",size:b.size}]);setStage("");
  }catch(e){setError(e instanceof Error?e.message:String(e));setStage("")}
  finally{setBusy(false)}
 }
 const details=useMemo(()=>stats?{
   [c.before]:`${(stats.before/1024/1024).toFixed(2)} MB`,
   [c.after]:`${(stats.after/1024/1024).toFixed(2)} MB`,
   [c.change]:`${Math.round((1-stats.after/stats.before)*100)}%`
 }:undefined,[stats,c]);
 return <div className="space-y-4">
  <FileDropzone accept="application/pdf,.pdf" files={files} onChange={f=>{setFiles(f);setResult([]);setStats(null);setError("")}} disabled={busy} kind="pdf" maxSizeMB={200}/>
  <div className="flex flex-wrap gap-2">{([["light",c.light],["recommended",c.recommended],["strong",c.strong]] as const).map(([v,n])=><button key={v} onClick={()=>setMode(v)} className={`rounded-full px-4 py-2 text-sm ${mode===v?"bg-[var(--lx-ink)] text-[var(--lx-bg)]":"border border-[var(--lx-line)] bg-[var(--lx-panel)] text-[var(--lx-muted)]"}`}>{n}</button>)}</div>
  <div className="rounded-xl border border-[var(--lx-line)] bg-[var(--lx-soft)] p-3 text-xs leading-5 text-[var(--lx-muted)]">{c.warning}</div>
  <div className="flex gap-3">
   <button disabled={!file||busy} onClick={run} className="rounded-xl bg-[var(--lx-ink)] px-5 py-2.5 text-sm text-[var(--lx-bg)] disabled:opacity-40">{busy?c.busy:c.compress}</button>
   {busy&&<button onClick={()=>abort.current=true} className="rounded-xl border border-[var(--lx-danger)] px-5 py-2.5 text-sm text-[var(--lx-danger)]">{c.cancel}</button>}
  </div>
  {stage&&<p className="text-sm text-[var(--lx-faint)]">{stage}</p>}
  {!!result.length&&<ResultPanel files={result} messageZh={c.done} messageEn={c.done} details={details}/>}
  {error&&<p role="alert" className="rounded-xl border border-[var(--lx-danger)] bg-[var(--lx-panel)] p-4 text-sm text-[var(--lx-danger)]">{c.error} · {error}</p>}
 </div>
}
