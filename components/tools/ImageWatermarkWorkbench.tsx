"use client";
import NextImage from "next/image";
import {PointerEvent,useEffect,useRef,useState} from "react";
import PaidActionButton from "@/components/tools/PaidActionButton";
import FileDropzone from "@/components/tools/FileDropzone";
import {useLingxiLang,type LingxiLang} from "@/lib/lingxi-i18n";
import {downloadUrl} from "@/lib/tools/shared/download";

type Box={x:number;y:number;w:number;h:number};
const empty:Box={x:.65,y:.72,w:.28,h:.18};
async function fileToImage(file:File){const url=URL.createObjectURL(file);return await new Promise<HTMLImageElement>((resolve,reject)=>{const img=new Image();img.onload=()=>{URL.revokeObjectURL(url);resolve(img)};img.onerror=()=>{URL.revokeObjectURL(url);reject(new Error("IMAGE_LOAD_FAILED"))};img.src=url})}
function canvasBlob(c:HTMLCanvasElement){return new Promise<Blob>((res,rej)=>c.toBlob(b=>b?res(b):rej(new Error("IMAGE_EXPORT_FAILED")),"image/png"))}
async function prepare(file:File,box:Box){
 const img=await fileToImage(file),max=1536,scale=Math.min(1,max/Math.max(img.naturalWidth,img.naturalHeight));
 const width=Math.max(16,Math.floor((img.naturalWidth*scale)/16)*16),height=Math.max(16,Math.floor((img.naturalHeight*scale)/16)*16);
 const base=document.createElement("canvas");base.width=width;base.height=height;base.getContext("2d")!.drawImage(img,0,0,width,height);
 const mask=document.createElement("canvas");mask.width=width;mask.height=height;const m=mask.getContext("2d")!;m.fillStyle="#fff";m.fillRect(0,0,width,height);m.clearRect(Math.round(box.x*width),Math.round(box.y*height),Math.round(box.w*width),Math.round(box.h*height));
 return{image:new File([await canvasBlob(base)],"image.png",{type:"image/png"}),mask:new File([await canvasBlob(mask)],"mask.png",{type:"image/png"})};
}
type C={upload:string;batchUpload:string;selected:string;batchHint:string;singleHint:string;draw:string;drawBatch:string;working:string;price:string;paidHint:string;error:string;download:string;result:string};
const D:Record<LingxiLang,C>={
 zh:{upload:"上传图片",batchUpload:"上传多张图片",selected:"已选择",batchHint:"单次最多 20 张；相同位置最适合批量处理",singleHint:"JPG / PNG / WebP",draw:"在第一张图上拖动框出要移除的区域。",drawBatch:"这个区域会应用到全部图片。",working:"正在处理…",price:"查看本次价格",paidHint:"确认价格并付款后开始处理。仅处理拥有版权、已获授权或自行制作的内容。",error:"图片处理没有完成",download:"下载",result:"处理结果"},
 en:{upload:"Upload image",batchUpload:"Upload images",selected:"Selected",batchHint:"Up to 20 images; batch works best when the target is in the same position.",singleHint:"JPG / PNG / WebP",draw:"Drag over the area to remove on the first image.",drawBatch:"The same area will be applied to every image.",working:"Processing…",price:"See this price",paidHint:"Processing starts after price confirmation and payment. Use only content you own, created or are authorized to edit.",error:"Image processing did not finish",download:"Download",result:"Result"},
 ja:{upload:"画像をアップロード",batchUpload:"複数画像をアップロード",selected:"選択済み",batchHint:"最大20枚。同じ位置の対象に向いています。",singleHint:"JPG / PNG / WebP",draw:"最初の画像で削除したい範囲をドラッグしてください。",drawBatch:"同じ範囲をすべての画像に適用します。",working:"処理中…",price:"今回の料金を見る",paidHint:"料金確認と支払い後に処理を開始します。所有または許可されたコンテンツのみ使用してください。",error:"画像処理を完了できませんでした",download:"ダウンロード",result:"処理結果"},
 ko:{upload:"이미지 업로드",batchUpload:"여러 이미지 업로드",selected:"선택됨",batchHint:"최대 20장. 대상 위치가 같을 때 일괄 처리에 적합합니다.",singleHint:"JPG / PNG / WebP",draw:"첫 이미지에서 제거할 영역을 드래그하세요.",drawBatch:"같은 영역이 모든 이미지에 적용됩니다.",working:"처리 중…",price:"이번 가격 보기",paidHint:"가격 확인 및 결제 후 처리합니다. 소유하거나 사용 권한이 있는 콘텐츠만 처리하세요.",error:"이미지 처리를 완료하지 못했습니다",download:"다운로드",result:"처리 결과"},
 fr:{upload:"Importer une image",batchUpload:"Importer plusieurs images",selected:"Sélection",batchHint:"Jusqu’à 20 images ; le lot fonctionne mieux si la zone est au même endroit.",singleHint:"JPG / PNG / WebP",draw:"Tracez la zone à supprimer sur la première image.",drawBatch:"La même zone sera appliquée à toutes les images.",working:"Traitement…",price:"Voir le prix",paidHint:"Le traitement commence après confirmation du prix et paiement. Utilisez uniquement du contenu que vous possédez ou êtes autorisé à modifier.",error:"Le traitement n’a pas abouti",download:"Télécharger",result:"Résultat"},
 de:{upload:"Bild hochladen",batchUpload:"Mehrere Bilder hochladen",selected:"Ausgewählt",batchHint:"Bis zu 20 Bilder; am besten bei gleicher Zielposition.",singleHint:"JPG / PNG / WebP",draw:"Markieren Sie im ersten Bild den zu entfernenden Bereich.",drawBatch:"Dieser Bereich wird auf alle Bilder angewendet.",working:"Verarbeitung…",price:"Preis anzeigen",paidHint:"Verarbeitung startet nach Preisbestätigung und Zahlung. Nur eigene oder freigegebene Inhalte verwenden.",error:"Bildverarbeitung konnte nicht abgeschlossen werden",download:"Herunterladen",result:"Ergebnis"},
 es:{upload:"Subir imagen",batchUpload:"Subir varias imágenes",selected:"Seleccionadas",batchHint:"Hasta 20 imágenes; funciona mejor cuando el área está en la misma posición.",singleHint:"JPG / PNG / WebP",draw:"Marca arrastrando el área que quieres eliminar en la primera imagen.",drawBatch:"La misma área se aplicará a todas las imágenes.",working:"Procesando…",price:"Ver precio",paidHint:"El proceso comienza tras confirmar el precio y pagar. Usa solo contenido propio o autorizado.",error:"No se pudo completar el procesamiento",download:"Descargar",result:"Resultado"},
 pt:{upload:"Enviar imagem",batchUpload:"Enviar várias imagens",selected:"Selecionadas",batchHint:"Até 20 imagens; funciona melhor quando a área está na mesma posição.",singleHint:"JPG / PNG / WebP",draw:"Arraste sobre a área que deseja remover na primeira imagem.",drawBatch:"A mesma área será aplicada a todas as imagens.",working:"Processando…",price:"Ver preço",paidHint:"O processamento começa após confirmar o preço e pagar. Use apenas conteúdo próprio ou autorizado.",error:"Não foi possível concluir o processamento",download:"Baixar",result:"Resultado"},
 ar:{upload:"رفع صورة",batchUpload:"رفع عدة صور",selected:"تم الاختيار",batchHint:"حتى 20 صورة؛ يعمل أفضل عندما تكون المنطقة في الموضع نفسه.",singleHint:"JPG / PNG / WebP",draw:"اسحب فوق المنطقة المراد إزالتها في الصورة الأولى.",drawBatch:"سيتم تطبيق المنطقة نفسها على جميع الصور.",working:"جارٍ المعالجة…",price:"عرض السعر",paidHint:"تبدأ المعالجة بعد تأكيد السعر والدفع. استخدم فقط المحتوى الذي تملكه أو لديك إذن بتعديله.",error:"تعذر إكمال معالجة الصورة",download:"تنزيل",result:"النتيجة"}
};

function Selector({file,box,onChange}:{file:File;box:Box;onChange:(b:Box)=>void}){
 const wrap=useRef<HTMLDivElement>(null),[start,setStart]=useState<{x:number;y:number}|null>(null),[src,setSrc]=useState("");
 useEffect(()=>{const u=URL.createObjectURL(file);setSrc(u);return()=>URL.revokeObjectURL(u)},[file]);
 function point(e:PointerEvent){const r=wrap.current!.getBoundingClientRect();return{x:Math.min(1,Math.max(0,(e.clientX-r.left)/r.width)),y:Math.min(1,Math.max(0,(e.clientY-r.top)/r.height))}}
 return <div ref={wrap} className="relative mx-auto mt-5 w-fit max-w-full touch-none overflow-hidden rounded-2xl bg-[var(--lx-soft)]" onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);const p=point(e);setStart(p);onChange({x:p.x,y:p.y,w:0,h:0})}} onPointerMove={e=>{if(!start)return;const p=point(e);onChange({x:Math.min(start.x,p.x),y:Math.min(start.y,p.y),w:Math.abs(p.x-start.x),h:Math.abs(p.y-start.y)})}} onPointerUp={()=>setStart(null)}>
  {src&&<NextImage src={src} alt="" className="block max-h-[560px] max-w-full select-none object-contain" draggable={false} width={1600} height={1200} unoptimized/>}
  <div className="pointer-events-none absolute border-2 border-[var(--lx-line-strong)] bg-black/10" style={{left:`${box.x*100}%`,top:`${box.y*100}%`,width:`${box.w*100}%`,height:`${box.h*100}%`}}/>
 </div>
}

export default function ImageWatermarkWorkbench({batch=false}:{batch?:boolean}){
 const{lang}=useLingxiLang();const c=D[lang]??D.en;
 const[files,setFiles]=useState<File[]>([]),[box,setBox]=useState<Box>(empty),[busy,setBusy]=useState(false),[error,setError]=useState(""),[results,setResults]=useState<Array<{name:string;url:string}>>([]);
 useEffect(()=>()=>{for(const r of results)if(r.url.startsWith("blob:"))URL.revokeObjectURL(r.url)},[results]);
 function clearResults(){for(const r of results)if(r.url.startsWith("blob:"))URL.revokeObjectURL(r.url);setResults([])}
 async function run(quoteId:string){
  if(!files.length||box.w<.01||box.h<.01)return;setBusy(true);setError("");clearResults();
  try{
   const out:Array<{name:string;url:string}>=[];
   for(let i=0;i<files.length;i++){
    const f=files[i],prepared=await prepare(f,box),fd=new FormData();
    fd.set("image",prepared.image);fd.set("mask",prepared.mask);fd.set("quote_id",quoteId);fd.set("item_key",`image-${i}`);
    const r=await fetch("/api/ai/image-cleanup",{method:"POST",body:fd});const d=await r.json().catch(()=>({}));
    if(!r.ok)throw new Error(d.error==="OPENAI_NOT_CONFIGURED"?c.error:(d.detail?.error?.message||d.error||c.error));
    const url=d.b64?`data:image/png;base64,${d.b64}`:d.url;
    if(!url)throw new Error("EMPTY_RESULT");
    out.push({name:f.name,url});
   }
   setResults(out);
  }catch(e){setError(e instanceof Error?e.message:String(e))}
  finally{setBusy(false)}
 }
 const toolId=batch?"batch-image-watermark-remover":"image-watermark-remover";
 return <div className="space-y-4">
  <FileDropzone accept="image/*" multiple={batch} maxFiles={batch?20:1} maxSizeMB={30} files={files} onChange={f=>{setFiles(f);clearResults();setError("")}} disabled={busy} kind="image"/>
  {files[0]&&<><p className="text-sm text-[var(--lx-muted)]">{c.draw}{batch?` ${c.drawBatch}`:""}</p><Selector file={files[0]} box={box} onChange={setBox}/></>}
  <div>{busy?<button disabled className="rounded-xl bg-[var(--lx-ink)] px-5 py-2.5 text-sm text-[var(--lx-bg)] opacity-50">{c.working}</button>:files.length>0&&box.w>=.01&&box.h>=.01?<PaidActionButton toolId={toolId} quantity={files.length} onPaid={run} label={c.price}/>:null}</div>
  <p className="text-xs leading-5 text-[var(--lx-faint)]">{c.paidHint}</p>
  {error&&<p role="alert" className="rounded-xl border border-[var(--lx-danger)] bg-[var(--lx-panel)] p-4 text-sm text-[var(--lx-danger)]">{c.error} · {error}</p>}
  {results.length>0&&<div className="grid gap-4 sm:grid-cols-2">{results.map((r,i)=><div key={r.name+i} className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-3"><NextImage src={r.url} alt={c.result} className="w-full rounded-xl" width={1600} height={1200} unoptimized/><div className="mt-3 flex items-center justify-between gap-2 text-sm"><span className="truncate text-[var(--lx-muted)]">{r.name}</span><button type="button" onClick={()=>void downloadUrl(r.url,`clean-${r.name.replace(/\.[^.]+$/,".png")}`)} className="shrink-0 font-medium text-[var(--lx-ink)]">{c.download}</button></div></div>)}</div>}
 </div>
}
