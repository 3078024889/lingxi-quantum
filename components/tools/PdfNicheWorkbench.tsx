"use client";
import ToolUiText from "@/components/tools/ToolUiText";
import {useRef,useState} from "react";
import {PDFDocument} from "pdf-lib";
import {cleanPdfMetadata,type PdfMetadataSnapshot} from "@/lib/tools/shared/pdf-metadata";
import {makePdfNupVector,type PagesPerSheet} from "@/lib/tools/pdf-nup-vector";
import {useLingxiLang,type LingxiLang} from "@/lib/lingxi-i18n";
import PdfMetadataReport from "./PdfMetadataReport";
import FileDropzone from "./FileDropzone";
import ResultPanel from "./ResultPanel";
import type {ToolResultFile} from "@/lib/tools/types";
import {openPdf,renderPdfPage,canvasToBlob} from "@/lib/tools/pdf-render-client";

type Mode="rasterize"|"nup"|"remove-metadata";
type Localized={nup:string;raster:string;metadata:string;complete:string;failed:string};
const COPY:Record<LingxiLang,Localized>={
 zh:{nup:"多页合一保留可搜索、可复制的清晰矢量文字。原有表单与注释可能不被保留，分享前请核对。",raster:"每页转换成图片版 PDF，原始可选文字层会消失，但可见文字仍可被识别。这不是安全脱敏或加密。",metadata:"仅清除文档属性和 XMP；页面正文、注释、附件及图片 EXIF 不会删除。",complete:"已重新打开输出 PDF 核验，检查后再保存。",failed:"PDF 处理失败。请确认文件没有损坏或加密。"},
 en:{nup:"Vector pages: text remains searchable, selectable and sharp when printed. Forms and annotations may not survive. Review before sharing.",raster:"Creates an image-based PDF. Selectable text is removed, but visible words can still be recognized. This is not secure redaction.",metadata:"Removes document properties and XMP only. Visible text, annotations, attachments and image EXIF remain.",complete:"Output PDF reopened and verified. Review before saving.",failed:"Could not process the PDF. Check for corruption or encryption."},
 ja:{nup:"文字を画像化せず、検索・選択・コピーできます。フォームや注釈は残らない場合があります。",raster:"ページを画像化します。表示中の文字は認識可能です。安全な墨消しではありません。",metadata:"文書属性とXMPのみ削除します。本文、注釈、添付、EXIFは残ります。",complete:"出力PDFを再度開いて検証しました。",failed:"PDFを処理できません。破損や暗号化を確認してください。"},
 ko:{nup:"원본 글자를 유지하여 검색·복사하고 선명하게 인쇄할 수 있습니다. 양식과 주석은 사라질 수 있습니다.",raster:"페이지를 이미지로 만듭니다. 보이는 글자는 여전히 인식될 수 있습니다. 안전한 삭제가 아닙니다.",metadata:"문서 속성과 XMP만 제거합니다. 본문, 주석, 첨부, EXIF는 남습니다.",complete:"출력 PDF를 다시 열어 확인했습니다.",failed:"PDF 처리에 실패했습니다. 파일 손상이나 암호화를 확인하세요."},
 fr:{nup:"Le texte vectoriel reste net, consultable et copiable. Les formulaires et annotations peuvent disparaître.",raster:"Chaque page devient une image. Le texte visible reste reconnaissable : ce n’est pas un caviardage sûr.",metadata:"Propriétés et XMP seulement. Le contenu, les annotations, les pièces jointes et l’EXIF demeurent.",complete:"PDF rouvert et vérifié. Contrôlez avant d’enregistrer.",failed:"Impossible de traiter le PDF. Vérifiez les dommages ou le chiffrement."},
 de:{nup:"Durchsuchbarer Vektortext bleibt scharf und kopierbar. Formulare oder Anmerkungen können verloren gehen.",raster:"Seiten werden Bilder. Sichtbarer Text bleibt erkennbar. Keine sichere Schwärzung.",metadata:"Nur Eigenschaften und XMP entfernt. Text, Anmerkungen, Anhänge und EXIF bleiben.",complete:"Ausgabe-PDF erneut geöffnet und geprüft.",failed:"PDF konnte nicht verarbeitet werden. Datei und Verschlüsselung prüfen."},
 es:{nup:"El texto vectorial sigue nítido, seleccionable y copiable. Pueden perderse formularios y anotaciones.",raster:"Cada página se vuelve imagen. El texto visible aún se reconoce. No es eliminación segura.",metadata:"Solo elimina propiedades y XMP. El contenido, las anotaciones, los adjuntos y EXIF permanecen.",complete:"PDF reabierto y verificado. Revisa antes de guardar.",failed:"No se pudo procesar el PDF. Comprueba daños o cifrado."},
 pt:{nup:"O texto vetorial continua nítido, pesquisável e copiável. Formulários e anotações podem desaparecer.",raster:"Cada página vira imagem. O texto visível continua reconhecível. Não é remoção segura.",metadata:"Apenas propriedades e XMP são removidos. Texto, anotações, anexos e EXIF permanecem.",complete:"PDF reaberto e verificado. Confira antes de salvar.",failed:"Falha ao processar PDF. Verifique danos ou criptografia."},
 ar:{nup:"تبقى النصوص المتجهية قابلة للبحث والنسخ وواضحة. قد لا تبقى النماذج والتعليقات.",raster:"كل صفحة تصبح صورة. يظل النص المرئي قابلًا للتعرف. هذا ليس حجبًا آمنًا.",metadata:"تُزال الخصائص وXMP فقط. يبقى نص الصفحات والمرفقات وEXIF.",complete:"أعيد فتح ملف PDF والتحقق منه.",failed:"تعذرت معالجة PDF. تحقق من التلف أو التشفير."}
};
const asBlob=(bytes:Uint8Array)=>new Blob([new Uint8Array(bytes)],{type:"application/pdf"});
export default function PdfNicheWorkbench({mode}:{mode:Mode}){
 const {lang}=useLingxiLang(),c=COPY[lang]||COPY.en;
 const[metadata,setMetadata]=useState<{before:PdfMetadataSnapshot;after:PdfMetadataSnapshot}|null>(null);
 const[files,setFiles]=useState<File[]>([]),[busy,setBusy]=useState(false),[error,setError]=useState("");
 const[results,setResults]=useState<ToolResultFile[]>([]),[scale,setScale]=useState(1.5),[perSheet,setPerSheet]=useState<PagesPerSheet>(4);
 const version=useRef(0);
 function invalidate(){version.current++;setResults([]);setMetadata(null);setError("");}
 async function run(){
  if(!files[0]||busy)return;
  const token=++version.current,file=files[0];setBusy(true);setError("");setResults([]);setMetadata(null);
  let src:Awaited<ReturnType<typeof openPdf>>|null=null;
  try{
   let bytes:Uint8Array,prefix="";
   if(mode==="remove-metadata"){
    const cleaned=await cleanPdfMetadata(await file.arrayBuffer());
    bytes=cleaned.bytes;prefix="clean-metadata-";
    if(token===version.current)setMetadata({before:cleaned.before,after:cleaned.after});
   }else if(mode==="nup"){
    const output=await makePdfNupVector(await file.arrayBuffer(),perSheet);
    bytes=output.bytes;prefix="nup-";
   }else{
    src=await openPdf(file);
    const output=await PDFDocument.create();
    for(let p=1;p<=src.numPages;p++){
     const original=await src.getPage(p),bounds=original.getViewport({scale:1});
     const rendered=await renderPdfPage(src,p,scale);
     try{
      const jpgBlob=await canvasToBlob(rendered.canvas,"image/jpeg",.9);
      const jpg=await output.embedJpg(await jpgBlob.arrayBuffer());
      output.addPage([bounds.width,bounds.height]).drawImage(jpg,{x:0,y:0,width:bounds.width,height:bounds.height});
     }finally{rendered.canvas.width=1;rendered.canvas.height=1}
    }
    bytes=await output.save();prefix="rasterized-";
    const reopened=await PDFDocument.load(bytes,{updateMetadata:false});
    if(reopened.getPageCount()!==src.numPages)throw new Error("PDF_OUTPUT_REOPEN_FAILED");
   }
   if(token===version.current){
    const blob=asBlob(bytes);
    setResults([{name:prefix+file.name.replace(/\.pdf$/i,"")+".pdf",blob,mime:"application/pdf",size:blob.size}]);
   }
  }catch(e){
   if(token===version.current)setError(c.failed+(e instanceof Error?" ("+e.message.slice(0,100)+")":""));
  }finally{
   try{await src?.destroy?.()}catch{}
   setBusy(false);
  }
 }
 return <div className="space-y-4" data-niche-mode={mode}>
  <FileDropzone accept="application/pdf,.pdf" files={files} onChange={next=>{invalidate();setFiles(next)}} disabled={busy} kind="pdf"/>
  {mode==="rasterize"&&<label className="flex flex-wrap items-center gap-3 text-sm"><ToolUiText text="渲染清晰度"/><select disabled={busy} value={scale} onChange={e=>{invalidate();setScale(Number(e.target.value))}} className="min-h-[44px] rounded-lg border border-[var(--lx-line)] bg-[var(--lx-panel)] px-3 py-2"><option value="1">1×</option><option value="1.5">1.5×</option><option value="2">2×</option></select></label>}
  {mode==="nup"&&<label className="flex flex-wrap items-center gap-3 text-sm"><ToolUiText text="每张纸页面数"/><select disabled={busy} value={perSheet} onChange={e=>{invalidate();setPerSheet(Number(e.target.value) as PagesPerSheet)}} className="min-h-[44px] rounded-lg border border-[var(--lx-line)] bg-[var(--lx-panel)] px-3 py-2"><option value="2">2</option><option value="4">4</option><option value="6">6</option><option value="9">9</option></select></label>}
  <p className="text-sm leading-7 text-[var(--lx-muted)]">{c[mode==="nup"?"nup":mode==="rasterize"?"raster":"metadata"]}</p>
  <button disabled={!files.length||busy} onClick={run} className="min-h-[44px] rounded-xl bg-[var(--lx-ink)] px-5 py-2.5 text-sm text-[var(--lx-bg)] disabled:opacity-40"><ToolUiText text={busy?"处理中…":"开始处理"}/></button>
  {metadata&&<PdfMetadataReport {...metadata}/>}
  {!!results.length&&<ResultPanel files={results} sourceSlug={mode==="nup"?"pdf-pages-per-sheet":mode==="rasterize"?"pdf-rasterize":"pdf-remove-metadata"} messageZh={c.complete} messageEn={c.complete}/>}
  {error&&<p role="alert" className="text-sm text-[var(--lx-danger)]">{error}</p>}
 </div>;
}
