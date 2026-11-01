"use client";
import{useEffect,useState}from"react";
import ToolUiText from "@/components/tools/ToolUiText";
import FileDropzone from "@/components/tools/FileDropzone";
import PaidActionButton from "@/components/tools/PaidActionButton";
import ResultPanel from "@/components/tools/ResultPanel";
import type{ToolResultFile}from"@/lib/tools/types";
import {createOcrWorker} from "@/lib/tools/shared/ocr-runtime";
import{draftFiles,loadPaidTaskDraft,newPaidTaskDraftId,savePaidTaskDraft}from"@/lib/tools/workspace/paid-task-draft";
import{useLingxiLang}from"@/lib/lingxi-i18n";
import type{LingxiLang}from"@/lib/lingxi-i18n";

const LANGS=[["zh","中文"],["en","English"],["ja","日本語"],["ko","한국어"],["fr","Français"],["de","Deutsch"],["es","Español"],["pt","Português"],["ar","العربية"]] as const;
type Copy={recognizing:string;translating:string;complete:string;priceOne:string;priceMany:string;noText:string;translateFailed:string;exportFailed:string;genericError:string;sameLanguage:string;resultReady:string};
const COPY:Record<LingxiLang,Copy>={
 zh:{recognizing:"正在识别文字…",translating:"正在翻译",complete:"处理完成",priceOne:"查看本次图片翻译价格",priceMany:"查看 {count} 张图片翻译价格",noText:"未在“{file}”中识别到清晰文字，请换用更清晰的图片。",translateFailed:"翻译暂时没有完成，原图片已保留。请稍后重试。",exportFailed:"无法生成翻译图片，请重新处理。",genericError:"图片处理没有完成，原文件已保留。请检查图片后重试。",sameLanguage:"原文语言和目标语言相同，请选择不同的目标语言。",resultReady:"图片翻译完成，可以预览并保存。"},
 en:{recognizing:"Recognizing text…",translating:"Translating",complete:"Processing complete",priceOne:"See image translation price",priceMany:"See translation price for {count} images",noText:"No readable text was found in “{file}”. Try a clearer image.",translateFailed:"Translation could not be completed. Your original image is unchanged; please try again.",exportFailed:"The translated image could not be created. Please try again.",genericError:"Image processing did not finish. Your original file is unchanged; check the image and retry.",sameLanguage:"The source and target languages are the same. Choose a different target language.",resultReady:"Image translation is ready to preview and save."},
 ja:{recognizing:"文字を認識中…",translating:"翻訳中",complete:"処理が完了しました",priceOne:"画像翻訳の料金を確認",priceMany:"{count}枚の翻訳料金を確認",noText:"「{file}」から読み取れる文字が見つかりません。より鮮明な画像をお試しください。",translateFailed:"翻訳を完了できませんでした。元の画像は変更されていません。再試行してください。",exportFailed:"翻訳画像を作成できませんでした。もう一度お試しください。",genericError:"画像を処理できませんでした。元のファイルはそのままです。画像を確認して再試行してください。",sameLanguage:"原文と翻訳先の言語が同じです。別の言語を選択してください。",resultReady:"画像の翻訳が完了しました。プレビューして保存できます。"},
 ko:{recognizing:"텍스트 인식 중…",translating:"번역 중",complete:"처리가 완료되었습니다",priceOne:"이미지 번역 가격 확인",priceMany:"이미지 {count}장 번역 가격 확인",noText:"“{file}”에서 읽을 수 있는 텍스트를 찾지 못했습니다. 더 선명한 이미지를 사용하세요.",translateFailed:"번역을 완료하지 못했습니다. 원본 이미지는 그대로 보존됩니다. 다시 시도하세요.",exportFailed:"번역 이미지를 만들지 못했습니다. 다시 시도하세요.",genericError:"이미지 처리가 완료되지 않았습니다. 원본 파일은 그대로 보존됩니다. 확인 후 다시 시도하세요.",sameLanguage:"원본 언어와 대상 언어가 같습니다. 다른 대상 언어를 선택하세요.",resultReady:"이미지 번역이 완료되었습니다. 미리 보고 저장할 수 있습니다."},
 fr:{recognizing:"Reconnaissance du texte…",translating:"Traduction",complete:"Traitement terminé",priceOne:"Voir le prix de traduction de l’image",priceMany:"Voir le prix pour {count} images",noText:"Aucun texte lisible n’a été trouvé dans « {file} ». Essayez une image plus nette.",translateFailed:"La traduction n’a pas abouti. L’image originale est conservée ; réessayez.",exportFailed:"L’image traduite n’a pas pu être créée. Réessayez.",genericError:"Le traitement de l’image n’a pas abouti. Le fichier original est conservé ; vérifiez l’image puis réessayez.",sameLanguage:"La langue source et la langue cible sont identiques. Choisissez une autre langue cible.",resultReady:"La traduction de l’image est prête à être prévisualisée et enregistrée."},
 de:{recognizing:"Text wird erkannt…",translating:"Übersetzung",complete:"Verarbeitung abgeschlossen",priceOne:"Preis für Bildübersetzung anzeigen",priceMany:"Preis für {count} Bilder anzeigen",noText:"In „{file}“ wurde kein lesbarer Text gefunden. Verwenden Sie ein klareres Bild.",translateFailed:"Die Übersetzung konnte nicht abgeschlossen werden. Das Original bleibt unverändert; bitte erneut versuchen.",exportFailed:"Das übersetzte Bild konnte nicht erstellt werden. Bitte erneut versuchen.",genericError:"Die Bildverarbeitung wurde nicht abgeschlossen. Die Originaldatei bleibt erhalten. Prüfen Sie das Bild und versuchen Sie es erneut.",sameLanguage:"Quell- und Zielsprache sind identisch. Wählen Sie eine andere Zielsprache.",resultReady:"Die Bildübersetzung kann jetzt angesehen und gespeichert werden."},
 es:{recognizing:"Reconociendo texto…",translating:"Traduciendo",complete:"Proceso completado",priceOne:"Ver precio de traducción de imagen",priceMany:"Ver precio para {count} imágenes",noText:"No se encontró texto legible en «{file}». Prueba con una imagen más nítida.",translateFailed:"No se pudo completar la traducción. La imagen original se conserva; vuelve a intentarlo.",exportFailed:"No se pudo crear la imagen traducida. Vuelve a intentarlo.",genericError:"No se completó el procesamiento de la imagen. El archivo original se conserva; revisa la imagen e inténtalo de nuevo.",sameLanguage:"El idioma de origen y el de destino son iguales. Elige otro idioma de destino.",resultReady:"La traducción de la imagen está lista para previsualizar y guardar."},
 pt:{recognizing:"Reconhecendo texto…",translating:"Traduzindo",complete:"Processamento concluído",priceOne:"Ver preço da tradução da imagem",priceMany:"Ver preço para {count} imagens",noText:"Não foi encontrado texto legível em “{file}”. Tente uma imagem mais nítida.",translateFailed:"Não foi possível concluir a tradução. A imagem original foi preservada; tente novamente.",exportFailed:"Não foi possível criar a imagem traduzida. Tente novamente.",genericError:"O processamento da imagem não foi concluído. O ficheiro original foi preservado; verifique a imagem e tente novamente.",sameLanguage:"O idioma de origem e o de destino são iguais. Escolha outro idioma de destino.",resultReady:"A tradução da imagem está pronta para pré-visualizar e guardar."},
 ar:{recognizing:"جارٍ التعرّف على النص…",translating:"جارٍ الترجمة",complete:"اكتملت المعالجة",priceOne:"عرض سعر ترجمة الصورة",priceMany:"عرض سعر ترجمة {count} صور",noText:"لم يتم العثور على نص واضح في «{file}». جرّب صورة أوضح.",translateFailed:"تعذرت إكمال الترجمة. تم الاحتفاظ بالصورة الأصلية؛ حاول مرة أخرى.",exportFailed:"تعذر إنشاء الصورة المترجمة. حاول مرة أخرى.",genericError:"لم تكتمل معالجة الصورة. تم الاحتفاظ بالملف الأصلي؛ تحقق من الصورة ثم أعد المحاولة.",sameLanguage:"لغة المصدر ولغة الهدف متطابقتان. اختر لغة هدف مختلفة.",resultReady:"أصبحت ترجمة الصورة جاهزة للمعاينة والحفظ."}
};
const LANGS_BY_SOURCE:Record<string,string>={zh:"chi_sim+eng",en:"eng",ja:"jpn+eng",ko:"kor+eng",fr:"fra+eng",de:"deu+eng",es:"spa+eng",pt:"por+eng",ar:"ara+eng"};

async function translate(text:string,source:string,target:string,quoteId:string){
 if(source===target)return text;
 const r=await fetch("/api/tools/media/translate",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({text,source,target,quoteId})});
 const d=await r.json().catch(()=>({}));
 if(!r.ok)throw new Error(String(d.error||"TRANSLATE_FAILED"));
 const translated=typeof d.translated==="string"?d.translated.trim():"";
 if(!translated)throw new Error("EMPTY_TRANSLATION_RESULT");
 return translated;
}
function blobOf(c:HTMLCanvasElement){return new Promise<Blob>((resolve,reject)=>c.toBlob(x=>x?resolve(x):reject(new Error("IMAGE_EXPORT_FAILED")),"image/png"))}
function sample(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number){const pts=[[x-2,y-2],[x+w+2,y-2],[x-2,y+h+2],[x+w+2,y+h+2]].map(([px,py])=>ctx.getImageData(Math.max(0,Math.min(ctx.canvas.width-1,px)),Math.max(0,Math.min(ctx.canvas.height-1,py)),1,1).data);return[0,1,2].map(c=>Math.round(pts.reduce((s,p)=>s+p[c],0)/pts.length))}
function linesFromBlocks(blocks:any[]){const out:any[]=[];for(const b of blocks||[])for(const p of b.paragraphs||[])for(const l of p.lines||[])if(l?.text?.trim()&&l?.bbox)out.push({text:String(l.text).trim(),bbox:l.bbox});return out}
function friendlyError(error:unknown,c:Copy){const message=error instanceof Error?error.message:String(error);if(message.startsWith("NO_TEXT_FOUND:"))return c.noText.replace("{file}",message.slice("NO_TEXT_FOUND:".length));if(message==="TRANSLATE_FAILED"||message==="EMPTY_TRANSLATION_RESULT")return c.translateFailed;if(message==="IMAGE_EXPORT_FAILED")return c.exportFailed;return c.genericError}

export default function ImageTranslatorWorkbench(){
 const{lang}=useLingxiLang();const c=COPY[lang]??COPY.en;
 const[files,setFiles]=useState<File[]>([]),[source,setSource]=useState("zh"),[target,setTarget]=useState("en"),[busy,setBusy]=useState(false),[stage,setStage]=useState(""),[error,setError]=useState(""),[outputs,setOutputs]=useState<ToolResultFile[]>([]),[draftId,setDraftId]=useState(""),[draftReady,setDraftReady]=useState(false);
 useEffect(()=>{const id=new URLSearchParams(location.search).get("resumeDraft")||"";if(!id){setDraftReady(true);return}void(async()=>{const d=await loadPaidTaskDraft<any>(id),f=draftFiles(d);if(d?.toolId==="image-translator"){setDraftId(id);setFiles(f);setSource(d.state?.source||"zh");setTarget(d.state?.target||"en")}setDraftReady(true)})()},[]);
 useEffect(()=>{if(!draftReady||!files.length)return;const id=draftId||newPaidTaskDraftId();if(!draftId)setDraftId(id);const tm=setTimeout(()=>void savePaidTaskDraft({id,toolId:"image-translator",files,state:{source,target}}),120);return()=>clearTimeout(tm)},[files,source,target,draftId,draftReady]);
 async function run(quoteId:string){
  setBusy(true);setOutputs([]);setError("");let worker:any=null;
  try{
   worker=await createOcrWorker(LANGS_BY_SOURCE[source]||"eng");
   const all:ToolResultFile[]=[];
   for(let i=0;i<files.length;i++){
    const f=files[i];setStage(`${i+1}/${files.length} · ${c.recognizing}`);
    const r=await worker.recognize(f,{}, {text:true,blocks:true});
    const lines=linesFromBlocks(r.data.blocks||[]);
    if(!lines.length)throw new Error(`NO_TEXT_FOUND:${f.name}`);
    const bmp=await createImageBitmap(f),canvas=document.createElement("canvas");canvas.width=bmp.width;canvas.height=bmp.height;const ctx=canvas.getContext("2d");if(!ctx)throw new Error("IMAGE_EXPORT_FAILED");ctx.drawImage(bmp,0,0);bmp.close?.();
    for(let j=0;j<lines.length;j++){
     const line=lines[j],b=line.bbox,x=Math.max(0,Math.floor(b.x0)),y=Math.max(0,Math.floor(b.y0)),w=Math.max(4,Math.ceil(b.x1-b.x0)),h=Math.max(4,Math.ceil(b.y1-b.y0));
     setStage(`${i+1}/${files.length} · ${c.translating} ${j+1}/${lines.length}`);
     const tx=await translate(line.text,source,target,quoteId);
     const bg=sample(ctx,x,y,w,h);ctx.fillStyle=`rgb(${bg[0]},${bg[1]},${bg[2]})`;ctx.fillRect(x,y,w,h);
     const lum=(bg[0]*.299+bg[1]*.587+bg[2]*.114);ctx.fillStyle=lum>150?"#111":"#fff";
     let size=Math.max(10,Math.floor(h*.72));ctx.font=`${size}px system-ui, sans-serif`;while(size>9&&ctx.measureText(tx).width>w*1.08){size-=1;ctx.font=`${size}px system-ui, sans-serif`}
     ctx.textBaseline="middle";ctx.fillText(tx,x,y+h/2,Math.max(8,w));
    }
    const blob=await blobOf(canvas);all.push({name:f.name.replace(/\.[^.]+$/,"")+ `-${target}.png`,blob,mime:"image/png",size:blob.size});
   }
   setOutputs(all);setStage(c.complete);
  }catch(e){setError(friendlyError(e,c));setStage("");throw e}
  finally{try{await worker?.terminate()}catch{}setBusy(false)}
 }
 const sameLanguage=source===target;
 const priceLabel=files.length>1?c.priceMany.replace("{count}",String(files.length)):c.priceOne;
 return <div className="space-y-4">
  <FileDropzone accept="image/*,.jpg,.jpeg,.png,.webp,.heic" multiple maxFiles={20} maxSizeMB={30} files={files} onChange={f=>{setFiles(f);setOutputs([]);setError("");setDraftId("")}} disabled={busy} kind="image"/>
  <div className="grid gap-3 sm:grid-cols-2">
   <label className="text-sm"><ToolUiText text="图片原文"/><select value={source} onChange={e=>setSource(e.target.value)} className="mt-1 w-full rounded-xl border border-[var(--lx-line)] bg-[var(--lx-panel)] px-3 py-2">{LANGS.map(([v,n])=><option key={v} value={v}>{n}</option>)}</select></label>
   <label className="text-sm"><ToolUiText text="翻译为"/><select value={target} onChange={e=>setTarget(e.target.value)} className="mt-1 w-full rounded-xl border border-[var(--lx-line)] bg-[var(--lx-panel)] px-3 py-2">{LANGS.map(([v,n])=><option key={v} value={v}>{n}</option>)}</select></label>
  </div>
  {files.length>0&&sameLanguage&&<p role="status" className="rounded-xl bg-[var(--lx-soft)] px-4 py-3 text-sm text-[var(--lx-muted)]">{c.sameLanguage}</p>}
  {files.length>0&&!sameLanguage&&<PaidActionButton toolId="image-translator" quantity={files.length} draftId={draftId} draftReady={draftReady} metadata={{files:files.length,source,target}} onPaid={run} label={priceLabel}/>}
  {busy&&<p className="text-sm text-[var(--lx-muted)]">{stage}</p>}
  <p className="text-xs leading-5 text-[var(--lx-faint)]"><ToolUiText text="先识别图片里的文字，再翻译并尽量按原文字区域覆盖。复杂艺术字、弧形字或低清图片可能需要手动微调。"/></p>
  {error&&<p role="alert" className="rounded-xl border border-[var(--lx-danger)] p-4 text-sm text-[var(--lx-danger)]">{error}</p>}
  {outputs.length>0&&<ResultPanel sourceSlug="image-translator" files={outputs} messageZh={c.resultReady} messageEn={c.resultReady}/>}
 </div>
}
