"use client";

import {PDF_EDITOR_COPY} from "@/lib/tools/pdf-editor-copy";
import {renderPdfTextImage} from "@/lib/tools/pdf-overlay-text";
import {pdfEditorPreviewScale} from "@/lib/tools/pdf-overlay-geometry";
import {plainText,plainMessage} from "@/lib/tools/plain-copy";
import {useCallback,useEffect,useMemo,useRef,useState} from "react";
import {PDFDocument,rgb,degrees} from "pdf-lib";
import {openPdf,renderPdfPage} from "@/lib/tools/pdf-render-client";
import {deliveryText} from '@/lib/tools/commerce/delivery-copy';
import PaidExportButton from "@/components/tools/PaidExportButton";
import {downloadBlob} from "@/lib/tools/shared/download";
import ResultFileActions from "./ResultFileActions";
import {createExportPlan} from "@/lib/tools/document/export-plan";
import {prepareSignatureOrStamp} from "@/lib/tools/document/image-preparation";
import HandwrittenSignatureCleanup from "@/components/tools/HandwrittenSignatureCleanup";
import SignatureDrawPad from "@/components/tools/SignatureDrawPad";
import {useLingxiLang} from "@/lib/lingxi-i18n";
import {deletePaidTaskDraft,loadPaidTaskDraft,newPaidTaskDraftId,savePaidTaskDraft} from "@/lib/tools/workspace/paid-task-draft";
import {DOCUMENT_INPUT_ACCEPT,documentIntakeError,isDocumentInputFile,normalizeDocumentFile,confirmDocumentUpload} from "@/lib/tools/document/intake-client";

const DRAW_SIGN:Record<string,string>={zh:"直接手写签名",en:"Draw signature",ja:"署名を直接書く",ko:"서명 직접 쓰기",fr:"Dessiner ma signature",de:"Unterschrift zeichnen",es:"Dibujar mi firma",pt:"Desenhar assinatura",ar:"رسم التوقيع"};
const RESIZE_LABEL:Record<string,string>={zh:"拖动角标调整大小",en:"Drag to resize",ja:"ドラッグでサイズを変更",ko:"끌어서 크기 조절",fr:"Glisser pour redimensionner",de:"Zum Skalieren ziehen",es:"Arrastra para cambiar el tamaño",pt:"Arraste para redimensionar",ar:"اسحب لتغيير الحجم"};
const SIGNING_WORDS:Record<string,{ink:string;seal:string;extract:string;again:string;download:string;preview:string;failure:string;hint:string}>={
 zh:{ink:"提取手写签名",seal:"添加印章",extract:"笔迹清晰度",again:"重新提取",download:"保存透明笔迹",preview:"透明笔迹预览",failure:"没有找到清晰的笔迹。请裁剪纸张周围的杂物、改善光线后重试。",hint:"自动去除纸张和阴影，只保留笔迹。处理在当前设备完成。"},
 en:{ink:"Extract handwritten signature",seal:"Add stamp",extract:"Ink sensitivity",again:"Extract again",download:"Save transparent signature",preview:"Transparent signature preview",failure:"No clear handwriting was found. Crop away surrounding objects and try again in better light.",hint:"Remove paper and shadows to keep only the handwriting. Processing stays on this device."},
 ja:{ink:"手書き署名を抽出",seal:"印鑑を追加",extract:"筆跡の濃さ",again:"再抽出",download:"透明署名を保存",preview:"透明な署名の確認",failure:"明確な筆跡が見つかりません。周囲を切り取り、明るい場所で再試行してください。",hint:"紙と影を除去して筆跡だけを残します。処理は端末内で行われます。"},
 ko:{ink:"손글씨 서명 추출",seal:"도장 추가",extract:"필기 감도",again:"다시 추출",download:"투명 서명 저장",preview:"투명 서명 미리보기",failure:"선명한 필기 흔적이 없습니다. 주변 물체를 잘라내고 밝은 곳에서 다시 시도하세요.",hint:"종이와 그림자를 제거하고 필기만 남깁니다. 처리는 기기에서 진행됩니다."},
 fr:{ink:"Extraire la signature manuscrite",seal:"Ajouter un tampon",extract:"Sensibilité de l’encre",again:"Réextraire",download:"Enregistrer la signature",preview:"Aperçu de la signature transparente",failure:"Aucune écriture nette détectée. Recadrez et réessayez avec un meilleur éclairage.",hint:"Retirez le papier et les ombres pour ne garder que l’écriture, directement sur cet appareil."},
 de:{ink:"Handschriftliche Signatur freistellen",seal:"Stempel hinzufügen",extract:"Strichempfindlichkeit",again:"Erneut freistellen",download:"Transparente Signatur speichern",preview:"Transparente Signatur prüfen",failure:"Keine klare Handschrift erkannt. Bitte Bild zuschneiden und bei besserem Licht erneut versuchen.",hint:"Papier und Schatten entfernen, nur die Handschrift bleibt. Alles auf diesem Gerät."},
 es:{ink:"Extraer firma manuscrita",seal:"Añadir sello",extract:"Sensibilidad de tinta",again:"Extraer de nuevo",download:"Guardar firma transparente",preview:"Vista previa de firma transparente",failure:"No se detectó escritura clara. Recorta el fondo y vuelve a intentarlo con mejor luz.",hint:"Elimina papel y sombras, conservando solo la firma. El proceso se realiza en este dispositivo."},
 pt:{ink:"Extrair assinatura manuscrita",seal:"Adicionar carimbo",extract:"Sensibilidade da tinta",again:"Extrair novamente",download:"Salvar assinatura transparente",preview:"Prévia da assinatura transparente",failure:"Não foi possível identificar a escrita. Recorte o fundo e tente novamente com mais luz.",hint:"Remove papel e sombras, mantendo só a escrita. Processamento no dispositivo."},
 ar:{ink:"استخراج التوقيع بخط اليد",seal:"إضافة ختم",extract:"حساسية الحبر",again:"استخراج مجددًا",download:"حفظ التوقيع الشفاف",preview:"معاينة توقيع شفاف",failure:"لم يتم العثور على كتابة واضحة. اقتطع الخلفية وحاول مجددًا بإضاءة أفضل.",hint:"إزالة الورق والظلال والإبقاء على الكتابة فقط. تتم المعالجة على جهازك."}
};
type Overlay={id:number;kind:"text"|"cover"|"image";page:number;x:number;y:number;w:number;h:number;ratio?:number;angle?:number;text?:string;size?:number;data?:string};
type Grip="move"|"rotate"|"nw"|"n"|"ne"|"e"|"se"|"s"|"sw"|"w";
type Gesture={id:number;pointerId:number;grip:Grip;startX:number;startY:number;angle0:number;rect:DOMRect;origin:Overlay};

function blobBytes(bytes:Uint8Array){const copy=new Uint8Array(bytes.length);copy.set(bytes);return new Blob([copy.buffer],{type:"application/pdf"});}
export default function PdfEditorWorkbench({signingOnly=false}:{signingOnly?:boolean}){
 const {lang}=useLingxiLang();const c=PDF_EDITOR_COPY[lang];
 const sw=SIGNING_WORDS[lang]||SIGNING_WORDS.en;
 const [inkPreview,setInkPreview]=useState<{file:File;id:number;data:string}|null>(null);
 const [inkSensitivity,setInkSensitivity]=useState(60);
 const [showDrawPad,setShowDrawPad]=useState(false);
 const [inkError,setInkError]=useState("");
 const[file,setFile]=useState<File|null>(null),[pages,setPages]=useState(0),[draftId,setDraftId]=useState(""),[officeReady,setOfficeReady]=useState(false),[officeFormats,setOfficeFormats]=useState<string[]>(["pdf"]),[overlays,setOverlays]=useState<Overlay[]>([]),[selectedPageInput,setSelectedPageInput]=useState("1"),[selectedPage,setSelectedPage]=useState(1),[text,setText]=useState(""),[busy,setBusy]=useState(false),[error,setError]=useState(""),[pageRange,setPageRange]=useState(""),[stamp,setStamp]=useState<{data:string;ratio:number}|null>(null),[seamSide,setSeamSide]=useState<"right"|"left"|"top"|"bottom">("right"),[pageImage,setPageImage]=useState(""),[previewImages,setPreviewImages]=useState<string[]>([]),[previewNote,setPreviewNote]=useState(""),[rendering,setRendering]=useState(false),[seamNote,setSeamNote]=useState(""),[doneNote,setDoneNote]=useState("");
 const [output,setOutput]=useState<{blob:Blob;name:string}|null>(null);
  const [editingTextId,setEditingTextId]=useState<number|null>(null);
 const [selectedOverlayId,setSelectedOverlayId]=useState<number|null>(null);
 const gestureRef=useRef<Gesture|null>(null);
 const gestureUpdate=useRef<(x:number,y:number,id:number)=>void>(()=>{});
 useEffect(()=>{
  const move=(e:PointerEvent)=>gestureUpdate.current(e.clientX,e.clientY,e.pointerId);
  const up=(e:PointerEvent)=>{if(gestureRef.current?.pointerId===e.pointerId)gestureRef.current=null};
  window.addEventListener("pointermove",move);window.addEventListener("pointerup",up);window.addEventListener("pointercancel",up);
  return()=>{window.removeEventListener("pointermove",move);window.removeEventListener("pointerup",up);window.removeEventListener("pointercancel",up)};
 },[]);
 const renderRevision=useRef(0);
 const [hydrated,setHydrated]=useState(false);
 const [draftSaved,setDraftSaved]=useState(false);
 useEffect(()=>setHydrated(true),[]);
 const pendingDownload=useRef<{blob:Blob;name:string}|null>(null);
 const resultKey=`paid-result:${signingOnly?'e-sign-pdf':'pdf-editor'}`;
 useEffect(()=>{let alive=true;void loadPaidTaskDraft(resultKey).then(d=>{if(alive&&d?.file)setOutput({blob:d.file,name:d.fileName||'edited.pdf'})}).catch(()=>{});return()=>{alive=false}},[resultKey]);
 const stageRef=useRef<HTMLDivElement|null>(null);const plan=useMemo(()=>createExportPlan(pageRange,pages),[pageRange,pages]);const visible=overlays.filter(o=>o.page===selectedPage);
 const renderSourcePage=useCallback(async(f:File,pageNumber:number)=>{
 const ticket=++renderRevision.current;setRendering(true);
 let pdf:any=null;
 try{
  pdf=await openPdf(f);
  const page=await pdf.getPage(pageNumber),bounds=page.getViewport({scale:1});
  const scale=pdfEditorPreviewScale(bounds.width,bounds.height,window.devicePixelRatio||1,"editor");
  const result=await renderPdfPage(pdf,pageNumber,scale);
  if(ticket===renderRevision.current)setPageImage(result.canvas.toDataURL("image/png"));
 }catch{
  if(ticket===renderRevision.current){setPageImage("");setError("previewError")}
 }finally{
  try{await pdf?.destroy?.()}catch{}
  if(ticket===renderRevision.current)setRendering(false);
 }
},[]);

 async function persistDraft(){setDraftSaved(false);if(!file||!draftId)throw new Error(deliveryText(lang,"draftSaveFailed"));try{await savePaidTaskDraft({id:draftId,toolId:signingOnly?"e-sign-pdf":"pdf-editor",file,fileName:file.name,fileType:file.type,state:{pages,overlays,selectedPage,pageRange,stamp,seamSide}});setDraftSaved(true)}catch{throw new Error(deliveryText(lang,"draftSaveFailed"))}}
 // PDF_EDITOR_DRAFT_V22
 useEffect(()=>{void fetch("/api/tools/document/capabilities",{cache:"no-store"}).then(r=>r.json()).then(d=>{const f=Array.isArray(d?.formats)?d.formats:["pdf"];setOfficeFormats(f);setOfficeReady(d?.officeReady===true)}).catch(()=>{setOfficeFormats(["pdf"]);setOfficeReady(false)})},[]);
 useEffect(()=>{const id=new URLSearchParams(location.search).get("resumeDraft")||"";if(!id)return;void(async()=>{const d=await loadPaidTaskDraft<any>(id);if(!d?.file)return;const tool=signingOnly?"e-sign-pdf":"pdf-editor";if(d.toolId!==tool)return;const st=d.state||{},f=new File([d.file],d.fileName||"document.pdf",{type:d.fileType||"application/pdf"});setDraftId(id);setFile(f);setPages(Number(st.pages||0));setOverlays(st.overlays||[]);setSelectedPage(Number(st.selectedPage||1));setSelectedPageInput(String(st.selectedPage||1));setPageRange(st.pageRange||"");setStamp(st.stamp||null);setSeamSide(st.seamSide||"right");await renderSourcePage(f,Number(st.selectedPage||1))})().catch(()=>setError("restoreError"))},[signingOnly,renderSourcePage]);
 useEffect(()=>{setDraftSaved(false);if(!file||!draftId)return;let active=true;const timer=setTimeout(()=>void savePaidTaskDraft({id:draftId,toolId:signingOnly?"e-sign-pdf":"pdf-editor",file,fileName:file.name,fileType:file.type,state:{pages,overlays,selectedPage,pageRange,stamp,seamSide}}).then(()=>{if(active)setDraftSaved(true)}).catch(()=>{if(active)setError(plainText(lang,"draftError"))}),250);return()=>{active=false;clearTimeout(timer)}},[file,draftId,pages,overlays,selectedPage,pageRange,stamp,seamSide,signingOnly,lang]);
  async function normalizeInput(f:File){return normalizeDocumentFile(f)}
 async function load(f:File){if(!confirmDocumentUpload([f],lang))return;setDoneNote("");setError("");if(!isDocumentInputFile(f)){setError(c.unsupported);return}setBusy(true);setPreviewImages([]);setOverlays([]);try{const normalized=await normalizeInput(f);const d=await PDFDocument.load(await normalized.arrayBuffer());const count=d.getPageCount();if(count<1)throw new Error("EMPTY_PDF");const id=newPaidTaskDraftId();setOutput(null);pendingDownload.current=null;setStamp(null);setInkPreview(null);setInkError("");setSeamNote("");await deletePaidTaskDraft(resultKey).catch(()=>{});setDraftId(id);setFile(normalized);setPages(count);setSelectedPage(1);setSelectedPageInput("1");setPageRange(`1-${count}`);await renderSourcePage(normalized,1);}catch(e){setFile(null);setPages(0);setPageImage("");setError(e instanceof Error&&e.message.startsWith("DOCUMENT_")?documentIntakeError(lang,e):plainText(lang,"pdfError"));}finally{setBusy(false)}}
 useEffect(()=>{if(file)void renderSourcePage(file,selectedPage)},[file,selectedPage,renderSourcePage]);
 function commitPageInput(){const n=Number(selectedPageInput);if(Number.isInteger(n)&&n>=1&&n<=pages){setSelectedPage(n);setSelectedPageInput(String(n));}else setSelectedPageInput(String(selectedPage));}
 function patch(id:number,k:Partial<Overlay>){setOverlays(v=>v.map(o=>o.id===id?{...o,...k}:o));}
 function patchDimension(id:number,key:"w"|"h",value:number){setOverlays(v=>v.map(o=>{if(o.id!==id)return o;const safe=Math.max(.5,Math.min(100,Number.isFinite(value)?value:o[key]));if(o.kind==="image"&&o.ratio){if(key==="w")return{...o,w:safe,h:Math.max(.5,Math.min(100,safe/o.ratio))};return{...o,h:safe,w:Math.max(.5,Math.min(100,safe*o.ratio))};}return{...o,[key]:safe};}));}
 function addText(){const v=text.trim();if(!v)return;const id=Date.now(),lines=v.split("\n");const w=Math.min(85,Math.max(6,Math.max(...lines.map(x=>Array.from(x).length))*1.65+2)),h=Math.min(65,Math.max(3.5,lines.length*3.2));setOverlays(prev=>[...prev,{id,kind:"text",page:selectedPage,x:10,y:12,w,h,text:v,size:14}]);setSelectedOverlayId(id);setEditingTextId(id);setText("");}
 function addCover(){setOverlays(v=>[...v,{id:Date.now(),kind:"cover",page:selectedPage,x:10,y:12,w:35,h:8}]);}
 async function addImage(f:File,asStamp=false,kind:"signature"|"stamp"="stamp"){
  setError("");setInkError("");
  try{
   if(asStamp){
    const prepared=await prepareSignatureOrStamp(f,kind,inkSensitivity);
    const ratio=prepared.width/prepared.height;
    const id=Date.now();
    if(kind==="stamp")setStamp({data:prepared.dataUrl,ratio});
    const w=22,pageAspect=stageRef.current?stageRef.current.clientWidth/Math.max(1,stageRef.current.clientHeight):.707,h=Math.min(30,w*pageAspect/ratio);
    setOverlays(v=>[...v,{id,kind:"image",page:selectedPage,x:50,y:58,w,h,ratio,data:prepared.dataUrl}]);setSelectedOverlayId(id);
    if(kind==="signature")setInkPreview({file:f,id,data:prepared.dataUrl});
   }else{
    const data=await new Promise<string>((res,rej)=>{const r=new FileReader();r.onload=()=>res(String(r.result));r.onerror=()=>rej(new Error("IMAGE_READ_FAILED"));r.readAsDataURL(f)});
    const im=await new Promise<HTMLImageElement>((res,rej)=>{const x=new Image();x.onload=()=>res(x);x.onerror=rej;x.src=data});
    const ratio=im.naturalWidth/im.naturalHeight,w=22,pageAspect=stageRef.current?stageRef.current.clientWidth/Math.max(1,stageRef.current.clientHeight):.707,h=Math.min(30,w*pageAspect/ratio);
    const id=Date.now();setOverlays(v=>[...v,{id,kind:"image",page:selectedPage,x:50,y:58,w,h,ratio,data}]);setSelectedOverlayId(id);
   }
  }catch(e){
   if(kind==="signature")setInkError(sw.failure);
   else setError(plainText(lang,"imageError"));
  }
 }
 async function repeatInkExtraction(){
  if(!inkPreview)return;
  try{
   setInkError("");
   const prepared=await prepareSignatureOrStamp(inkPreview.file,"signature",inkSensitivity);
   const ratio=prepared.width/prepared.height;
   setInkPreview(v=>v?{...v,data:prepared.dataUrl}:v);
   setOverlays(v=>v.map(o=>o.id===inkPreview.id?{...o,data:prepared.dataUrl,ratio,w:Math.min(o.w,Math.max(.5,o.h*ratio))}:o));
  }catch{setInkError(sw.failure)}
 }

 async function seam(){setSeamNote("");if(!stamp||!plan.valid)return;const img=await new Promise<HTMLImageElement>((res,rej)=>{const im=new Image();im.onload=()=>res(im);im.onerror=rej;im.src=stamp.data});const horizontal=seamSide==="top"||seamSide==="bottom",pieces:{data:string;ratio:number}[]=[];for(let i=0;i<plan.pages.length;i++){const part=document.createElement("canvas"),ctx=part.getContext("2d");if(!ctx)continue;if(horizontal){const sy=Math.floor(img.naturalHeight*i/plan.pages.length),ey=Math.floor(img.naturalHeight*(i+1)/plan.pages.length),sh=Math.max(1,ey-sy);part.width=img.naturalWidth;part.height=sh;ctx.drawImage(img,0,sy,img.naturalWidth,sh,0,0,img.naturalWidth,sh);}else{const sx=Math.floor(img.naturalWidth*i/plan.pages.length),ex=Math.floor(img.naturalWidth*(i+1)/plan.pages.length),sw=Math.max(1,ex-sx);part.width=sw;part.height=img.naturalHeight;ctx.drawImage(img,sx,0,sw,img.naturalHeight,0,0,sw,img.naturalHeight);}pieces.push({data:part.toDataURL("image/png"),ratio:part.width/part.height});}
  setOverlays(v=>[...v,...pieces.map((piece,i)=>{const page=plan.pages[i],base=horizontal?52:9,w=horizontal?base:Math.max(2,Math.min(12,base)),h=horizontal?Math.max(2,Math.min(12,w/piece.ratio)):Math.max(18,Math.min(65,w/piece.ratio));return{id:Date.now()+i,kind:"image" as const,page,x:seamSide==="right"?100-w:seamSide==="left"?0:24,y:seamSide==="bottom"?100-h:seamSide==="top"?0:22,w,h,ratio:piece.ratio,data:piece.data};})]);setSeamNote(plainText(lang,"appliedCount",{count:plan.pages.length}));}
 async function build(){if(!file)throw new Error("NO_FILE");if(!plan.valid)throw new Error(plan.error||"INVALID_EXPORT_PLAN");const doc=await PDFDocument.load(await file.arrayBuffer());for(const o of overlays){const p=doc.getPage(o.page-1);if(!p)continue;const W=p.getWidth(),H=p.getHeight(),x=W*o.x/100,y=H-(H*o.y/100)-(H*o.h/100),w=W*o.w/100,h=H*o.h/100;if(o.kind==="cover")p.drawRectangle({x,y,width:w,height:h,color:rgb(1,1,1)});else if(o.kind==="text"){const png=await doc.embedPng(await renderPdfTextImage(o.text||"",Math.max(18,(o.size||14)*2))),ratio=png.width/png.height,dh=Math.min(h,Math.max(10,w/ratio));const dw=Math.min(w,dh*ratio),theta=-(o.angle||0)*Math.PI/180;p.drawImage(png,{x:x+w/2-(dw*Math.cos(theta)-dh*Math.sin(theta))/2,y:y+h/2-(dw*Math.sin(theta)+dh*Math.cos(theta))/2,width:dw,height:dh,rotate:degrees(-(o.angle||0))});}else if(o.kind==="image"&&o.data){const bytes=Uint8Array.from(atob(o.data.split(",")[1]),v=>v.charCodeAt(0)),img=o.data.startsWith("data:image/png")?await doc.embedPng(bytes):await doc.embedJpg(bytes);const ratio=o.ratio||img.width/img.height;let dw=w,dh=dw/ratio;if(dh>h){dh=h;dw=dh*ratio}p.drawImage(img,{x:x+dw/2-(dw*Math.cos((o.angle||0)*Math.PI/180)-dh*Math.sin((o.angle||0)*Math.PI/180))/2,y:y+(h-dh)/2+dh/2-(dw*Math.sin((o.angle||0)*Math.PI/180)+dh*Math.cos((o.angle||0)*Math.PI/180))/2,width:dw,height:dh,rotate:degrees(o.angle||0)});}}
  const ids=plan.pages.map(n=>n-1);if(ids.length!==doc.getPageCount()||ids.some((v,i)=>v!==i)){const out=await PDFDocument.create();for(const p of await out.copyPages(doc,ids))out.addPage(p);return new Uint8Array(await out.save())}return new Uint8Array(await doc.save());}
 async function previewNow(){
 setBusy(true);setError("");setPreviewImages([]);setPreviewNote("");
 let pdf:any=null;
 try{
  const bytes=await build();pdf=await openPdf(new File([blobBytes(bytes)],"preview.pdf",{type:"application/pdf"}));
  const limit=Math.min(pdf.numPages,12),images:string[]=[];
  for(let i=1;i<=limit;i++){
   const page=await pdf.getPage(i),bounds=page.getViewport({scale:1});
   const scale=pdfEditorPreviewScale(bounds.width,bounds.height,window.devicePixelRatio||1,"preview");
   const rendered=await renderPdfPage(pdf,i,scale);
   images.push(rendered.canvas.toDataURL("image/png"));
  }
  setPreviewImages(images);setPreviewNote(c.ready+": "+(pdf.numPages>limit?limit+"/"+pdf.numPages:pdf.numPages));
 }catch{setError(plainText(lang,"previewError"))}
 finally{try{await pdf?.destroy?.()}catch{}setBusy(false)}
}
 // PDF_PAID_TASK_RESET_V46
 async function resetPaidTask(){const old=draftId;setDraftSaved(false);setFile(null);setPages(0);setDraftId("");setOverlays([]);setEditingTextId(null);setSelectedPage(1);setSelectedPageInput("1");setText("");setError("");setPageRange("");setStamp(null);setInkPreview(null);setInkError("");setPageImage("");setPreviewImages([]);setPreviewNote("");setSeamNote("");if(old)await deletePaidTaskDraft(old).catch(()=>{});try{const u=new URL(location.href);u.searchParams.delete("resumeQuote");u.searchParams.delete("resumeDraft");history.replaceState(null,"",u.pathname+(u.search?u.search:"")+u.hash)}catch{}}
 async function exportNow(){setBusy(true);setError("");try{const bytes=await build();const result={blob:blobBytes(bytes),name:`lingxifield-${file?.name||"edited.pdf"}`};setOutput(result);pendingDownload.current=result;await savePaidTaskDraft({id:resultKey,toolId:resultKey,file:result.blob,fileName:result.name,fileType:result.blob.type,state:{ready:true}}).catch(()=>{});setDoneNote(deliveryText(lang,"ready"))}catch(e){setError(plainText(lang,"fileError"));throw e}finally{setBusy(false)}}
 async function completeExport(){await resetPaidTask();const result=pendingDownload.current;pendingDownload.current=null;if(result)await downloadBlob(result.blob,result.name);else setDoneNote(deliveryText(lang,"existing"));}
 async function rotateCurrent(){if(!file)return;setBusy(true);try{const d=await PDFDocument.load(await file.arrayBuffer()),p=d.getPage(selectedPage-1);p.setRotation(degrees((p.getRotation().angle+90)%360));const bytes=new Uint8Array(await d.save()),nf=new File([blobBytes(bytes)],file.name,{type:"application/pdf"});setOverlays(v=>v.filter(o=>o.page!==selectedPage));setFile(nf);await renderSourcePage(nf,selectedPage)}catch{setError(plainText(lang,"pdfError"))}finally{setBusy(false)}}
 function startGesture(e:React.PointerEvent,id:number,grip:Grip){
 const stage=stageRef.current,o=overlays.find(v=>v.id===id);if(!stage||!o||editingTextId===id)return;
 if(grip!=="move")e.preventDefault();e.stopPropagation();setSelectedOverlayId(id);
 const r=stage.getBoundingClientRect(),cx=r.left+(o.x+o.w/2)*r.width/100,cy=r.top+(o.y+o.h/2)*r.height/100;
 gestureRef.current={id,pointerId:e.pointerId,grip,startX:e.clientX,startY:e.clientY,angle0:Math.atan2(e.clientY-cy,e.clientX-cx),rect:r,origin:{...o}};
 try{e.currentTarget.setPointerCapture(e.pointerId)}catch{}
}
gestureUpdate.current=(px,py,pid)=>{
 const g=gestureRef.current;if(!g||g.pointerId!==pid)return;
 const o=g.origin,dx=(px-g.startX)/g.rect.width*100,dy=(py-g.startY)/g.rect.height*100;
 const clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));
 if(g.grip==="move"){const a=(o.angle||0)*Math.PI/180,c=Math.abs(Math.cos(a)),sn=Math.abs(Math.sin(a)),bw=c*o.w+sn*o.h*g.rect.height/g.rect.width,bh=sn*o.w*g.rect.width/g.rect.height+c*o.h;const cx=clamp(o.x+o.w/2+dx,bw/2,100-bw/2),cy=clamp(o.y+o.h/2+dy,bh/2,100-bh/2);patch(g.id,{x:cx-o.w/2,y:cy-o.h/2});return}
 if(g.grip==="rotate"){const cx=g.rect.left+(o.x+o.w/2)*g.rect.width/100,cy=g.rect.top+(o.y+o.h/2)*g.rect.height/100;patch(g.id,{angle:Math.round(((o.angle||0)+(Math.atan2(py-cy,px-cx)-g.angle0)*180/Math.PI)*10)/10});return}
 const west=g.grip.includes("w"),east=g.grip.includes("e"),north=g.grip.includes("n"),south=g.grip.includes("s");
 let w=Math.max(.7,o.w+(east?dx:west?-dx:0)),h=Math.max(.7,o.h+(south?dy:north?-dy:0));
 if(o.kind==="image"&&o.ratio&&o.ratio>0){const rel=o.ratio*g.rect.height/g.rect.width;if(!east&&!west)w=h*rel;else h=w/rel}
 const maxW=west?o.x+o.w:100-o.x,maxH=north?o.y+o.h:100-o.y,f=Math.min(1,maxW/w,maxH/h);
 w=Math.max(.7,w*f);h=Math.max(.7,h*f);
 const x=west?o.x+o.w-w:o.x,y=north?o.y+o.h-h:o.y,size=o.kind==="text"?clamp((o.size||14)*Math.min(w/Math.max(o.w,.7),h/Math.max(o.h,.7)),6,144):o.size;
 patch(g.id,{x:clamp(x,0,100-w),y:clamp(y,0,100-h),w,h,size});
};
function handlePointerMove(e:React.PointerEvent){gestureUpdate.current(e.clientX,e.clientY,e.pointerId)}
function stopPointer(){gestureRef.current=null}
 return <div className="space-y-5">{output&&<section data-testid="paid-export-result" className="rounded-2xl border p-5 space-y-3"><h2 className="font-semibold">{deliveryText(lang,"complete")}</h2><p className="break-all">{output.name}</p><p className="text-sm">{deliveryText(lang,"ready")}</p><div className="flex flex-wrap gap-3"><ResultFileActions blob={output.blob} name={output.name}/><button className="rounded-xl border px-4 py-3" onClick={()=>{setOutput(null);setDoneNote("");void deletePaidTaskDraft(resultKey);void resetPaidTask()}}>{deliveryText(lang,"fresh")}</button></div></section>}{!output&&doneNote&&<div role="status" className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-soft)] px-4 py-3 text-sm"><b>{doneNote}</b></div>}<label onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();const f=e.dataTransfer.files?.[0];if(f)void load(f)}} className="block cursor-pointer rounded-2xl border border-dashed border-[var(--lx-line)] bg-[var(--lx-soft)] p-7 text-center"><input type="file" accept={DOCUMENT_INPUT_ACCEPT} disabled={!hydrated||busy} className="hidden" onChange={e=>{const f=e.target.files?.[0];e.target.value="";if(f)void load(f)}}/><b>{busy&&!file?c.opening:c.upload}</b></label>{file&&<><div className="flex flex-wrap items-center gap-2 text-sm"><span data-testid="pdf-source-page-count" className="rounded-full bg-[var(--lx-soft)] px-3 py-2">{plainText(lang,"pageCount",{count:pages})}</span><button disabled={selectedPage<=1} onClick={()=>{const n=Math.max(1,selectedPage-1);setSelectedPage(n);setSelectedPageInput(String(n))}} className="rounded-full border px-3 py-2">{c.prev}</button><label className="rounded-full border px-3 py-2">{c.page} <input data-testid="pdf-page-number-input" aria-label={c.page} inputMode="numeric" value={selectedPageInput} onChange={e=>setSelectedPageInput(e.target.value)} onBlur={commitPageInput} onKeyDown={e=>{if(e.key==="Enter")commitPageInput()}} className="w-12 bg-transparent text-center"/></label><button disabled={selectedPage>=pages} onClick={()=>{const n=Math.min(pages,selectedPage+1);setSelectedPage(n);setSelectedPageInput(String(n))}} className="rounded-full border px-3 py-2">{c.next}</button><button onClick={()=>void rotateCurrent()} className="rounded-full border px-3 py-2">{c.rotate}</button></div><section className="rounded-2xl border bg-[var(--lx-soft)] p-3 sm:p-5"><div className="mb-3"><b>{c.edit}</b><p className="text-xs text-[var(--lx-muted)]">{c.editHint}</p></div><div ref={stageRef} data-testid="pdf-stage" onPointerMove={handlePointerMove} onPointerUp={stopPointer} onPointerCancel={stopPointer} className="relative mx-auto w-full max-w-[760px] overflow-visible rounded-xl border bg-white shadow-sm touch-none">{pageImage?<img src={pageImage} alt="" className="block h-auto w-full select-none"/>:<div className="aspect-[0.707/1] w-full"/>}{visible.map(o=><div key={o.id} data-testid="pdf-overlay" data-kind={o.kind} role="group" tabIndex={0}
 onPointerDown={e=>{if(editingTextId!==o.id)startGesture(e,o.id,"move")}}
 onDoubleClick={e=>{if(o.kind==="text"){e.stopPropagation();setSelectedOverlayId(o.id);setEditingTextId(o.id)}}}
 onKeyDown={e=>{if(e.target!==e.currentTarget)return;if(e.key==="Delete"||e.key==="Backspace"){e.preventDefault();setOverlays(v=>v.filter(x=>x.id!==o.id))}else if(e.key==="Enter"&&o.kind==="text"){e.preventDefault();setEditingTextId(o.id)}}}
 className={"absolute select-none border-2 "+(selectedOverlayId===o.id&&editingTextId!==o.id?"border-sky-500":"border-transparent")}
 style={{left:o.x+"%",top:o.y+"%",width:o.w+"%",height:o.h+"%",transform:"rotate("+(o.angle||0)+"deg)",transformOrigin:"center center",touchAction:"none",overflow:"visible"}}>
 {o.kind==="image"&&o.data&&<img src={o.data} alt="" draggable={false} className="pointer-events-none h-full w-full object-contain"/>}
 {o.kind==="cover"&&<div className="pointer-events-none h-full w-full bg-white"/>}
 {o.kind==="text"&&(editingTextId===o.id?
  <textarea autoFocus aria-label={lang==="zh"?"编辑已添加文字":"Edit added text"} value={o.text||""}
   onChange={e=>{const next=e.target.value,lines=next.split("\n"),length=Math.max(1,...lines.map(v=>Array.from(v).length));patch(o.id,{text:next,w:Math.min(85,Math.max(6,length*1.65+2)),h:Math.min(65,Math.max(3.5,lines.length*3.2))})}}
   onPointerDown={e=>e.stopPropagation()} onKeyDown={e=>{if(e.key==="Escape"||(e.key==="Enter"&&!e.shiftKey)){e.preventDefault();setEditingTextId(null);setSelectedOverlayId(null)}}}
   onBlur={()=>{setEditingTextId(null);setSelectedOverlayId(null)}} rows={Math.max(1,(o.text||"").split("\n").length)}
   className="h-full w-full resize-none overflow-visible border-0 bg-white/95 p-0 text-slate-900 outline outline-1 outline-sky-400"
   style={{fontSize:Math.max(8,o.size||14)+"px",lineHeight:1.25}}/>:
  <div className="pointer-events-none h-full w-full whitespace-pre-wrap break-words p-0 text-slate-900" style={{fontSize:Math.max(8,o.size||14)+"px",lineHeight:1.25}}>{o.text}</div>)}
 {selectedOverlayId===o.id&&editingTextId!==o.id&&<>
  {(["nw","n","ne","e","se","s","sw","w"] as const).map(grip=><button key={grip} type="button" data-testid={"pdf-grip-"+grip}
    aria-label={(RESIZE_LABEL[lang]||RESIZE_LABEL.en)+" "+grip}
    onPointerDown={e=>startGesture(e,o.id,grip)} onPointerMove={handlePointerMove}
    className="absolute z-30 h-6 w-6 rounded-full border-2 border-sky-600 bg-white shadow-sm touch-none sm:h-4 sm:w-4"
    style={{left:grip.includes("w")?"0%":grip.includes("e")?"100%":"50%",top:grip.includes("n")?"0%":grip.includes("s")?"100%":"50%",transform:"translate(-50%,-50%)"}}/>)}
  <button type="button" data-testid="pdf-grip-rotate" aria-label={lang==="zh"?"自由旋转":"Rotate freely"}
    onPointerDown={e=>startGesture(e,o.id,"rotate")} onPointerMove={handlePointerMove}
    className="absolute left-1/2 top-0 z-30 flex h-8 w-8 -translate-x-1/2 -translate-y-12 items-center justify-center rounded-full border-2 border-sky-600 bg-white text-sky-800 shadow touch-none">↻</button>
  <button type="button" aria-label={c.delete} onPointerDown={e=>e.stopPropagation()} onClick={()=>{setOverlays(v=>v.filter(x=>x.id!==o.id));setSelectedOverlayId(null)}}
    className="absolute -right-2 -top-11 z-30 rounded-full border bg-white px-2 py-1 text-rose-600 shadow">×</button>
 </>}
 </div>)}</div>{rendering&&<p className="text-xs text-[var(--lx-muted)]">…</p>}</section>{!signingOnly&&<div className="grid gap-3 md:grid-cols-[1fr_auto_auto]"><input value={text} onChange={e=>setText(e.target.value)} placeholder={c.textPlaceholder} className="rounded-xl border px-3 py-2.5"/><button onClick={addText} className="rounded-xl border px-4 py-2">{c.addText}</button><button onClick={addCover} className="rounded-xl border px-4 py-2">{c.addCover}</button></div>}<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5"><label className="cursor-pointer rounded-2xl border p-4 text-sm"><input type="file" accept="image/*" className="hidden" onChange={e=>{const f=e.target.files?.[0];if(f)void addImage(f)}}/><b>{c.addImage}</b></label><label className="cursor-pointer rounded-2xl border p-4 text-sm"><input type="file" accept="image/*" className="hidden" onChange={e=>{const f=e.target.files?.[0];if(f)void addImage(f,true)}}/><b>{sw.seal}</b><p className="text-xs text-[var(--lx-muted)]">{c.stampHint}</p></label><label className="cursor-pointer rounded-2xl border p-4 text-sm"><input type="file" accept="image/*" className="hidden" onChange={e=>{const f=e.target.files?.[0];e.target.value="";if(f)void addImage(f,true,"signature")}}/><b>{sw.ink}</b><p className="text-xs text-[var(--lx-muted)]">{sw.hint}</p></label><button type="button" onClick={()=>setShowDrawPad(x=>!x)} className="rounded-2xl border p-4 text-left text-sm">{DRAW_SIGN[lang]||DRAW_SIGN.en}</button><button onClick={()=>setOverlays(v=>v.filter(o=>o.page!==selectedPage))} className="rounded-2xl border p-4 text-left text-sm">{c.clear}</button></div>{showDrawPad&&<SignatureDrawPad onApply={(data,ratio)=>{const w=24,h=Math.max(2,Math.min(24,w/ratio));setOverlays(list=>[...list,{id:Date.now(),kind:"image",page:selectedPage,x:60,y:65,w,h,ratio,data}]);setShowDrawPad(false)}}/>}{inkPreview&&<div className="space-y-3 rounded-2xl border p-4" data-testid="signature-ink-preview"><b>{sw.preview}</b><HandwrittenSignatureCleanup key={inkPreview.id+":"+inkSensitivity} source={inkPreview.data} onChange={next=>{setInkPreview(v=>v?{...v,data:next}:v);setOverlays(items=>items.map(item=>item.id===inkPreview.id?{...item,data:next}:item))}}/><div className="flex items-center justify-center rounded-xl border p-4" style={{backgroundColor:"#fff",backgroundImage:"linear-gradient(45deg,#eee 25%,transparent 25%),linear-gradient(-45deg,#eee 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#eee 75%),linear-gradient(-45deg,transparent 75%,#eee 75%)",backgroundSize:"16px 16px",backgroundPosition:"0 0,0 8px,8px -8px,-8px 0"}}><img src={inkPreview.data} alt={sw.preview} className="max-h-32 max-w-full object-contain"/></div><div className="flex flex-wrap items-center gap-3"><label className="text-sm">{sw.extract} <input aria-label={sw.extract} type="range" min="0" max="100" value={inkSensitivity} onChange={e=>setInkSensitivity(Number(e.target.value))}/></label><button type="button" className="rounded-xl border px-4 py-2" onClick={()=>void repeatInkExtraction()}>{sw.again}</button><button type="button" className="rounded-xl border px-4 py-2" onClick={()=>{void fetch(inkPreview.data).then(r=>r.blob()).then(b=>downloadBlob(b,"lingxifield-handwritten-signature.png")).catch(()=>setInkError(sw.failure))}}>{sw.download}</button></div></div>}{inkError&&<p role="alert" className="text-sm text-[var(--lx-danger)]">{inkError}</p>}{stamp&&<div className="rounded-2xl border p-4"><div className="flex flex-wrap gap-3"><b>{c.seam}</b><select value={seamSide} onChange={e=>setSeamSide(e.target.value as any)} className="rounded-xl border px-3 py-2"><option value="right">{plainText(lang,"right")}</option><option value="left">{plainText(lang,"left")}</option><option value="top">{plainText(lang,"top")}</option><option value="bottom">{plainText(lang,"bottom")}</option></select><button disabled={!plan.valid} onClick={()=>void seam().catch(()=>setError(plainText(lang,"imageError")))} className="rounded-xl border px-4 py-2">{c.apply}</button></div>{seamNote&&<p className="mt-2 text-sm">{seamNote}</p>}</div>}<label className="block text-sm">{c.range}<input data-testid="pdf-export-range-input" aria-label={c.range} value={pageRange} onChange={e=>setPageRange(e.target.value)} placeholder="1-10,12" className="mt-1 w-full rounded-xl border px-3 py-2.5"/><span data-testid="pdf-export-plan-summary" className="block text-xs text-[var(--lx-muted)]">{plan.valid?plainText(lang,"exportCount",{count:plan.quantity}):c.invalid} · {c.rangeHint}</span></label><p className="text-sm text-[var(--lx-muted)]">{deliveryText(lang,"tier")}</p><div className="flex flex-wrap gap-3"><button onClick={()=>void previewNow()} disabled={busy||!plan.valid} className="rounded-xl border px-5 py-2.5">{busy?c.working:c.preview}</button><PaidExportButton toolId={signingOnly?"e-sign-pdf":"pdf-editor"} quantity={1} disabled={busy||!plan.valid} draftId={draftId} metadata={{kind:"pdf-export",pages:plan.valid?plan.quantity:0}} beforePayment={persistDraft} onUnlocked={exportNow} onCompleted={completeExport} label={c.confirm}/></div>{previewNote&&<p className="text-sm text-[var(--lx-muted)]">{previewNote}</p>}{previewImages.map((src,i)=><img key={i} src={src} alt="" className="mx-auto w-full max-w-[760px] rounded-lg border bg-white"/>)}</>}{file&&draftSaved&&<p role="status" data-testid="draft-saved" className="text-xs text-[var(--lx-muted)]">{plainText(lang,"draftSaved")}</p>}{error&&<p role="alert" className="rounded-xl border p-4 text-sm text-[var(--lx-danger)]">{plainMessage(lang,error)}</p>}</div>
}
