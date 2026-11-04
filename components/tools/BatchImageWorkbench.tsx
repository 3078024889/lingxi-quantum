"use client";
import EditableNumberInput from "@/components/ui/EditableNumberInput";
import {useMemo,useRef,useState} from "react";
import FileDropzone from "@/components/tools/FileDropzone";
import ResultPanel from "@/components/tools/ResultPanel";
import {useLingxiLang,type LingxiLang} from "@/lib/lingxi-i18n";
import {convertBatchImage,makeUniqueBatchName,type BatchImageMime} from "@/lib/tools/shared/batch-image-client";
import type {ToolResultFile} from "@/lib/tools/types";

type C={maxW:string;quality:string;format:string;selected:string;run:string;busy:string;ready:string;error:string;source:string;size:string;balanced:string;best:string;original:string;failed:string;privacy:string;custom:string;success:string};
const D:Record<LingxiLang,C>={
 zh:{maxW:"最大宽度 px",quality:"图片质量",format:"输出格式",selected:"已选择",run:"开始批量处理",busy:"正在处理…",ready:"已生成，可核对后单独保存或打包 ZIP。",error:"有图片处理失败",source:"来源大小",size:"较小文件",balanced:"均衡（推荐）",best:"更清晰",original:"原尺寸",failed:"失败的文件",privacy:"图片只在当前浏览器处理；动图不会被误转换成单帧。",custom:"手动调整宽度（可选）",success:"成功"},
 en:{maxW:"Max width px",quality:"Image quality",format:"Output format",selected:"Selected",run:"Process batch",busy:"Processing…",ready:"Results are ready. Review before saving separately or as ZIP.",error:"Some images could not be processed",source:"Source size",size:"Smaller file",balanced:"Balanced (recommended)",best:"Higher quality",original:"Original size",failed:"Failed files",privacy:"Images are processed only in this browser. Animations are never silently flattened.",custom:"Custom width (optional)",success:"Successful"},
 ja:{maxW:"最大幅 px",quality:"画像品質",format:"出力形式",selected:"選択済み",run:"一括処理を開始",busy:"処理中…",ready:"完了しました。確認してから個別または ZIP で保存してください。",error:"一部の画像を処理できませんでした",source:"元のサイズ",size:"小さく",balanced:"標準（推奨）",best:"高画質",original:"元のサイズ",failed:"失敗したファイル",privacy:"画像はブラウザ内で処理されます。アニメーションは単一フレームに変換しません。",custom:"幅を指定（任意）",success:"成功"},
 ko:{maxW:"최대 너비 px",quality:"이미지 품질",format:"출력 형식",selected:"선택됨",run:"일괄 처리 시작",busy:"처리 중…",ready:"처리 완료. 확인 후 개별 또는 ZIP으로 저장하세요.",error:"일부 이미지 처리 실패",source:"원본 크기",size:"작은 파일",balanced:"균형(권장)",best:"고품질",original:"원본 크기",failed:"실패한 파일",privacy:"이미지는 브라우저에서만 처리됩니다. 움직이는 이미지를 한 프레임으로 바꾸지 않습니다.",custom:"너비 직접 입력(선택)",success:"성공"},
 fr:{maxW:"Largeur max px",quality:"Qualité de l’image",format:"Format de sortie",selected:"Sélection",run:"Traiter le lot",busy:"Traitement…",ready:"Résultats prêts. Vérifiez-les avant l’enregistrement.",error:"Certaines images ont échoué",source:"Taille source",size:"Fichier réduit",balanced:"Équilibrée (conseillée)",best:"Qualité supérieure",original:"Taille originale",failed:"Fichiers en erreur",privacy:"Images traitées uniquement dans ce navigateur. Les animations ne sont jamais aplaties sans avertissement.",custom:"Largeur personnalisée (option)",success:"Réussies"},
 de:{maxW:"Max. Breite px",quality:"Bildqualität",format:"Ausgabeformat",selected:"Ausgewählt",run:"Stapel verarbeiten",busy:"Verarbeitung…",ready:"Ergebnisse fertig. Vor dem Speichern prüfen.",error:"Einige Bilder sind fehlgeschlagen",source:"Originalgröße",size:"Kleinere Datei",balanced:"Ausgewogen (empfohlen)",best:"Hohe Qualität",original:"Originalgröße",failed:"Fehlgeschlagene Dateien",privacy:"Bilder werden nur im Browser verarbeitet. Animationen werden nicht stillschweigend auf ein Bild reduziert.",custom:"Breite anpassen (optional)",success:"Erfolgreich"},
 es:{maxW:"Ancho máximo px",quality:"Calidad de imagen",format:"Formato de salida",selected:"Seleccionadas",run:"Procesar lote",busy:"Procesando…",ready:"Resultados listos. Revísalos antes de guardar.",error:"Algunas imágenes fallaron",source:"Tamaño original",size:"Archivo menor",balanced:"Equilibrada (recomendado)",best:"Mayor calidad",original:"Tamaño original",failed:"Archivos fallidos",privacy:"Las imágenes se procesan solo en este navegador. Las animaciones no se convierten silenciosamente en un fotograma.",custom:"Ancho personalizado (opcional)",success:"Correctas"},
 pt:{maxW:"Largura máxima px",quality:"Qualidade da imagem",format:"Formato de saída",selected:"Selecionadas",run:"Processar lote",busy:"Processando…",ready:"Resultados prontos. Confira antes de salvar.",error:"Algumas imagens falharam",source:"Tamanho original",size:"Arquivo menor",balanced:"Equilibrada (recomendada)",best:"Qualidade maior",original:"Tamanho original",failed:"Arquivos com falha",privacy:"As imagens são processadas apenas no navegador. Animações não são convertidas silenciosamente em um quadro.",custom:"Largura personalizada (opcional)",success:"Sucesso"},
 ar:{maxW:"أقصى عرض px",quality:"جودة الصورة",format:"صيغة الإخراج",selected:"المحدد",run:"بدء المعالجة الدُفعية",busy:"جارٍ المعالجة…",ready:"النتائج جاهزة. راجعها قبل الحفظ.",error:"تعذرت معالجة بعض الصور",source:"الحجم الأصلي",size:"ملف أصغر",balanced:"متوازن (موصى به)",best:"جودة أعلى",original:"الأبعاد الأصلية",failed:"ملفات فاشلة",privacy:"تُعالج الصور في هذا المتصفح فقط. لا يتم تحويل الصور المتحركة إلى إطار واحد دون علمك.",custom:"عرض مخصص (اختياري)",success:"نجاح"}
};
const FAILURE_COPY:Record<LingxiLang,{animated:string;type:string;large:string;invalid:string;broken:string}>={
 zh:{animated:"这是动图，请使用支持动画的工具处理，避免丢失其他帧。",type:"文件内容不是受支持的 JPG、PNG 或 WebP 静态图片。",large:"图片尺寸太大，建议缩小原图后重试。",invalid:"宽度设置无效，请换一个尺寸。",broken:"无法读取或转换这张图片，请确认文件完好。"},
 en:{animated:"This is an animated image. Use an animation-aware tool to keep every frame.",type:"This file is not a supported static JPG, PNG or WebP image.",large:"Image dimensions are too large. Reduce the original image and retry.",invalid:"Invalid width. Choose another size.",broken:"Could not read or convert this image. Check the original file."},
 ja:{animated:"アニメーション画像です。フレームを失わない対応ツールを使用してください。",type:"対応していない画像形式です。静止した JPG、PNG、WebP を選んでください。",large:"画像サイズが大きすぎます。元画像を小さくしてください。",invalid:"幅が正しくありません。",broken:"画像を読み込めません。元ファイルを確認してください。"},
 ko:{animated:"움직이는 이미지입니다. 모든 프레임을 유지하는 도구를 사용하세요.",type:"지원되지 않는 형식입니다. 정적 JPG, PNG, WebP를 사용하세요.",large:"이미지가 너무 큽니다. 원본 크기를 줄여 주세요.",invalid:"잘못된 너비입니다.",broken:"이미지를 읽거나 변환할 수 없습니다."},
 fr:{animated:"Image animée : utilisez un outil qui préserve toutes les images de l’animation.",type:"Ce fichier n’est pas une image JPG, PNG ou WebP fixe prise en charge.",large:"Dimensions trop grandes. Réduisez l’image d’origine.",invalid:"Largeur invalide.",broken:"Impossible de lire ou de convertir l’image."},
 de:{animated:"Animiertes Bild: Verwenden Sie ein Werkzeug, das alle Frames erhält.",type:"Keine unterstützte statische JPG-, PNG- oder WebP-Datei.",large:"Bild zu groß. Originalgröße reduzieren.",invalid:"Ungültige Breite.",broken:"Bild konnte nicht gelesen oder umgewandelt werden."},
 es:{animated:"Esta imagen es animada. Usa una herramienta que conserve todos los fotogramas.",type:"El archivo no es una imagen estática JPG, PNG o WebP compatible.",large:"Dimensiones demasiado grandes. Reduce el original.",invalid:"Ancho no válido.",broken:"No se pudo leer o convertir la imagen."},
 pt:{animated:"Imagem animada. Use uma ferramenta que preserve todos os quadros.",type:"O arquivo não é uma imagem estática JPG, PNG ou WebP compatível.",large:"Dimensões muito grandes. Reduza a imagem original.",invalid:"Largura inválida.",broken:"Não foi possível ler ou converter a imagem."},
 ar:{animated:"هذه صورة متحركة. استخدم أداة تحافظ على جميع الإطارات.",type:"هذا الملف ليس صورة JPG أو PNG أو WebP ثابتة مدعومة.",large:"أبعاد الصورة كبيرة جدًا. قلّل حجم الصورة الأصلية.",invalid:"عرض غير صالح.",broken:"تعذرت قراءة الصورة أو تحويلها."}
};
function failureReason(lang:LingxiLang,error:unknown){
 const code=error instanceof Error?error.message:"";
 const copy=FAILURE_COPY[lang]||FAILURE_COPY.en;
 return code==="ANIMATED_IMAGE_UNSUPPORTED"?copy.animated:
  code==="UNSUPPORTED_IMAGE_BYTES"||code==="IMAGE_MIME_MISMATCH"?copy.type:
  code==="IMAGE_DIMENSIONS_TOO_LARGE"?copy.large:code==="IMAGE_WIDTH_INVALID"?copy.invalid:copy.broken;
}

type FailedImage={name:string;reason:string};
const extensions:Record<BatchImageMime,"jpg"|"png"|"webp">={"image/jpeg":"jpg","image/png":"png","image/webp":"webp"};
export default function BatchImageWorkbench(){
 const {lang}=useLingxiLang(),c=D[lang]??D.en;
 const[files,setFiles]=useState<File[]>([]),[maxW,setMaxW]=useState(1920),[quality,setQuality]=useState(.82),[type,setType]=useState<BatchImageMime>("image/jpeg");
 const[busy,setBusy]=useState(false),[stage,setStage]=useState(""),[error,setError]=useState("");
 const[results,setResults]=useState<ToolResultFile[]>([]),[failed,setFailed]=useState<FailedImage[]>([]),[sourceBytes,setSourceBytes]=useState(0);
 const version=useRef(0);
 function invalidate(){version.current++;setResults([]);setFailed([]);setSourceBytes(0);setError("");}
 async function run(){
  if(!files.length||busy)return;
  const token=++version.current,inputs=[...files],opts={maxW,quality,type};
  setBusy(true);setStage(c.busy);setError("");setResults([]);setFailed([]);setSourceBytes(0);
  const out:ToolResultFile[]=[],failedItems:FailedImage[]=[],used=new Set<string>();let originalBytes=0;
  try{
   for(let i=0;i<inputs.length;i++){
    const file=inputs[i];
    setStage(c.busy+" "+(i+1)+"/"+inputs.length+" · "+file.name);
    try{
     const blob=await convertBatchImage(file,opts.maxW,opts.quality,opts.type);
     out.push({name:makeUniqueBatchName(file.name,extensions[opts.type],used),blob,mime:opts.type,size:blob.size});
     originalBytes+=file.size;
    }catch(e){
     failedItems.push({name:file.name,reason:failureReason(lang,e)});
    }
   }
   if(token===version.current){
    setResults(out);setFailed(failedItems);setSourceBytes(originalBytes);
    if(failedItems.length)setError(c.error);
   }
  }finally{setStage("");setBusy(false)}
 }
 const total=useMemo(()=>results.reduce((n,x)=>n+x.size,0),[results]);
 return <div className="space-y-4" data-batch-image="true">
  <FileDropzone accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" multiple append maxFiles={50} maxSizeMB={50}
   files={files} onChange={f=>{invalidate();setFiles(f)}} disabled={busy} kind="image"/>
  <p className="text-sm leading-6 text-[var(--lx-muted)]">{c.privacy}</p>
  <div className="flex flex-wrap gap-2" aria-label={c.maxW}>
   {([[0,c.original],[1080,"1080 px"],[1920,"1920 px"],[2560,"2560 px"]] as const).map(([value,label])=>
    <button type="button" key={value} disabled={busy} aria-pressed={maxW===value} onClick={()=>{invalidate();setMaxW(value)}}
     className={"min-h-[44px] rounded-xl border px-4 py-2 text-sm "+(maxW===value?"border-[var(--lx-ink)] bg-[var(--lx-soft)] text-[var(--lx-ink)]":"border-[var(--lx-line)] text-[var(--lx-muted)]")}>{label}</button>
   )}
  </div>
  <div className="grid gap-3 sm:grid-cols-3">
   <label className="text-sm text-[var(--lx-muted)]">{c.maxW}<EditableNumberInput type="number" min={0} max={16384} value={maxW} disabled={busy}
    onChange={e=>{invalidate();setMaxW(Math.min(16384,Math.max(0,Math.round(Number(e.target.value)))))}} className="mt-1 min-h-[44px] w-full rounded-xl border border-[var(--lx-line)] bg-[var(--lx-panel)] px-3 py-2 text-[var(--lx-ink)]"/></label>
   <label className="text-sm text-[var(--lx-muted)]">{c.format}<select disabled={busy} value={type}
    onChange={e=>{invalidate();setType(e.target.value as BatchImageMime)}} className="mt-1 min-h-[44px] w-full rounded-xl border border-[var(--lx-line)] bg-[var(--lx-panel)] px-3 py-2 text-[var(--lx-ink)]">
    <option value="image/jpeg">JPG</option><option value="image/png">PNG</option><option value="image/webp">WebP</option></select></label>
   {type!=="image/png"&&<label className="text-sm text-[var(--lx-muted)]">{c.quality}<select disabled={busy} value={quality}
    onChange={e=>{invalidate();setQuality(Number(e.target.value))}} className="mt-1 min-h-[44px] w-full rounded-xl border border-[var(--lx-line)] bg-[var(--lx-panel)] px-3 py-2 text-[var(--lx-ink)]">
    <option value={.65}>{c.size}</option><option value={.82}>{c.balanced}</option><option value={.95}>{c.best}</option>
   </select></label>}
  </div>
  {files.length>0&&<p className="text-sm text-[var(--lx-muted)]">{c.selected} {files.length}</p>}
  <button disabled={!files.length||busy} onClick={run} className="min-h-[44px] rounded-xl bg-[var(--lx-ink)] px-5 py-2.5 text-sm text-[var(--lx-bg)] disabled:opacity-40">{busy?c.busy:c.run}</button>
  {stage&&<p className="text-sm text-[var(--lx-muted)]" role="status">{stage}</p>}
  {!!results.length&&<ResultPanel files={results} sourceSlug="batch-image" messageZh={c.ready} messageEn={c.ready}
    details={{files:results.length,[c.source]:Number((sourceBytes/1024).toFixed(1))+" KB",resultKB:Number((total/1024).toFixed(1))}}/>}
  {!!failed.length&&<section className="rounded-xl border border-[var(--lx-line)] p-4 text-sm" aria-label={c.failed}>
   <strong>{c.failed} ({failed.length})</strong>
   <ul className="mt-2 space-y-1">{failed.map((item,i)=><li key={i} className="break-all">{item.name} · {item.reason}</li>)}</ul>
  </section>}
  {error&&<p role="alert" className="text-sm text-[var(--lx-danger)]">{error}</p>}
 </div>;
}
