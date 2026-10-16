"use client";
import EditableNumberInput from "@/components/ui/EditableNumberInput";

import {useMemo,useState} from "react";
import FileDropzone from "@/components/tools/FileDropzone";
import ResultPanel from "@/components/tools/ResultPanel";
import {useLingxiLang,type LingxiLang} from "@/lib/lingxi-i18n";
import type {ToolResultFile} from "@/lib/tools/types";

type ResizeMode="maxWidth"|"exact"|"contain"|"cover";
type ResizeOptions={mode:ResizeMode;width:number;height:number;quality:number;type:string;background:string};
export function outputDimensions(sourceW:number,sourceH:number,o:Pick<ResizeOptions,"mode"|"width"|"height">){
 if(!Number.isFinite(sourceW)||!Number.isFinite(sourceH)||sourceW<1||sourceH<1)throw new Error("INVALID_IMAGE_DIMENSIONS");
 const width=Math.floor(o.width),height=Math.floor(o.height);
 if(!Number.isFinite(width)||width<1||width>8192||!Number.isFinite(height)||height<1||height>8192)throw new Error("TARGET_DIMENSIONS_OUT_OF_RANGE");
 if(o.mode==="maxWidth"){
  const factor=Math.min(1,width/sourceW);
  return{width:Math.max(1,Math.round(sourceW*factor)),height:Math.max(1,Math.round(sourceH*factor))};
 }
 return{width,height};
}
async function canvas(file:File,o:ResizeOptions){
 const b=await createImageBitmap(file);
 try{
  const {width:w,height:h}=outputDimensions(b.width,b.height,o);
  if(w*h>33554432)throw new Error("IMAGE_TOO_LARGE");
  const c=document.createElement("canvas");c.width=w;c.height=h;
  const x=c.getContext("2d");if(!x)throw new Error("CANVAS_UNAVAILABLE");
  x.imageSmoothingEnabled=true;x.imageSmoothingQuality="high";
  const needsBackground=o.type==="image/jpeg"||o.mode==="contain";
  if(needsBackground){x.fillStyle=o.background;x.fillRect(0,0,w,h)}
  if(o.mode==="exact"||o.mode==="maxWidth")x.drawImage(b,0,0,w,h);
  else {
   const factor=o.mode==="cover"?Math.max(w/b.width,h/b.height):Math.min(w/b.width,h/b.height);
   const sw=b.width*factor,sh=b.height*factor;
   x.drawImage(b,(w-sw)/2,(h-sh)/2,sw,sh);
  }
  return await new Promise<Blob>((res,rej)=>c.toBlob(v=>v?res(v):rej(new Error("EXPORT_FAILED")),o.type,o.quality));
 }finally{b.close?.()}
}

type C={maxW:string;quality:string;format:string;selected:string;run:string;busy:string;ready:string;error:string};
const D:Record<LingxiLang,C>={
 zh:{maxW:"最大宽度 px",quality:"质量 0.4–0.95",format:"输出格式",selected:"已选择",run:"开始批量处理",busy:"正在处理…",ready:"批量图片已处理完成，可以核对结果后单独下载或打包下载。",error:"批量图片处理没有完成"},
 en:{maxW:"Max width px",quality:"Quality 0.4–0.95",format:"Output format",selected:"Selected",run:"Process batch",busy:"Processing…",ready:"Batch processing finished. Review the results, then download individually or as a ZIP.",error:"Batch image processing did not finish"},
 ja:{maxW:"最大幅 px",quality:"品質 0.4–0.95",format:"出力形式",selected:"選択済み",run:"一括処理を開始",busy:"処理中…",ready:"一括処理が完了しました。確認後、個別または ZIP でダウンロードできます。",error:"一括画像処理を完了できませんでした"},
 ko:{maxW:"최대 너비 px",quality:"품질 0.4–0.95",format:"출력 형식",selected:"선택됨",run:"일괄 처리 시작",busy:"처리 중…",ready:"일괄 처리가 완료되었습니다. 확인 후 개별 또는 ZIP으로 다운로드하세요.",error:"일괄 이미지 처리를 완료하지 못했습니다"},
 fr:{maxW:"Largeur max px",quality:"Qualité 0.4–0.95",format:"Format de sortie",selected:"Sélection",run:"Traiter le lot",busy:"Traitement…",ready:"Traitement terminé. Vérifiez les résultats puis téléchargez-les séparément ou en ZIP.",error:"Le traitement du lot n’a pas abouti"},
 de:{maxW:"Max. Breite px",quality:"Qualität 0.4–0.95",format:"Ausgabeformat",selected:"Ausgewählt",run:"Stapel verarbeiten",busy:"Verarbeitung…",ready:"Stapelverarbeitung abgeschlossen. Ergebnisse prüfen und einzeln oder als ZIP herunterladen.",error:"Stapelverarbeitung konnte nicht abgeschlossen werden"},
 es:{maxW:"Ancho máximo px",quality:"Calidad 0.4–0.95",format:"Formato de salida",selected:"Seleccionadas",run:"Procesar lote",busy:"Procesando…",ready:"Lote procesado. Revisa los resultados y descarga individualmente o en ZIP.",error:"No se pudo completar el lote"},
 pt:{maxW:"Largura máxima px",quality:"Qualidade 0.4–0.95",format:"Formato de saída",selected:"Selecionadas",run:"Processar lote",busy:"Processando…",ready:"Lote processado. Revise os resultados e baixe individualmente ou em ZIP.",error:"Não foi possível concluir o lote"},
 ar:{maxW:"أقصى عرض px",quality:"الجودة 0.4–0.95",format:"صيغة الإخراج",selected:"تم الاختيار",run:"بدء المعالجة الدُفعية",busy:"جارٍ المعالجة…",ready:"اكتملت المعالجة. راجع النتائج ثم نزّلها منفردة أو في ملف ZIP.",error:"تعذر إكمال معالجة الصور"}
};

export default function BatchImageWorkbench(){
 const{lang}=useLingxiLang();const c=D[lang]??D.en;
 const[files,setFiles]=useState<File[]>([]),[maxW,setMaxW]=useState(1920),[height,setHeight]=useState(1080),[resizeMode,setResizeMode]=useState<ResizeMode>("maxWidth"),[background,setBackground]=useState("#ffffff"),[quality,setQuality]=useState(.82),[type,setType]=useState("image/jpeg"),[busy,setBusy]=useState(false),[stage,setStage]=useState(""),[error,setError]=useState(""),[results,setResults]=useState<ToolResultFile[]>([]);
 async function run(){
  setBusy(true);setStage(c.busy);setError("");setResults([]);
  try{
   const out:ToolResultFile[]=[];
   for(let i=0;i<files.length;i++){
    const f=files[i];setStage(`${c.busy} ${i+1}/${files.length} · ${f.name}`);
    const b=await canvas(f,{mode:resizeMode,width:maxW,height,background,quality:Math.min(.95,Math.max(.4,quality)),type}),ext=type==="image/png"?"png":type==="image/webp"?"webp":"jpg";
    out.push({name:f.name.replace(/\.[^.]+$/,"")+"."+ext,blob:b,mime:type,size:b.size});
   }
   setResults(out);setStage("");
  }catch(e){setError(e instanceof Error?e.message:String(e));setStage("")}
  finally{setBusy(false)}
 }
 const total=useMemo(()=>results.reduce((n,x)=>n+x.size,0),[results]);
 return <div className="space-y-4">
  <FileDropzone accept="image/*" multiple append maxFiles={50} maxSizeMB={50} files={files} onChange={f=>{setFiles(f);setResults([]);setError("")}} disabled={busy} kind="image"/>
  <div className="grid gap-3 sm:grid-cols-3">
   <label className="text-sm text-[var(--lx-muted)]">{lang==="zh"?"尺寸方式":lang==="ja"?"サイズ方法":lang==="ko"?"크기 방식":lang==="fr"?"Mode de taille":lang==="de"?"Größenmodus":lang==="es"?"Modo de tamaño":lang==="pt"?"Modo de tamanho":lang==="ar"?"وضع الحجم":"Resize mode"}<select value={resizeMode} onChange={e=>setResizeMode(e.target.value as ResizeMode)} className="mt-1 w-full rounded-xl border border-[var(--lx-line)] bg-[var(--lx-panel)] px-3 py-2 text-[var(--lx-ink)]"><option value="maxWidth">{lang==="zh"?"仅限制最大宽度":"Max width (keep ratio)"}</option><option value="contain">{lang==="zh"?"完整放入指定尺寸（留边）":"Fit inside (padding)"}</option><option value="cover">{lang==="zh"?"填满指定尺寸（居中裁切）":"Fill and crop"}</option><option value="exact">{lang==="zh"?"强制指定宽高（可能拉伸）":"Exact width & height (stretch)"}</option></select></label>
   <label className="text-sm text-[var(--lx-muted)]">{lang==="zh"?"目标宽度（像素）":"Target width (px)"}<EditableNumberInput type="number" min={1} max={8192} value={maxW} onChange={e=>setMaxW(Math.min(8192,Math.max(1,Math.round(Number(e.target.value)||1))))} className="mt-1 w-full rounded-xl border border-[var(--lx-line)] bg-[var(--lx-panel)] px-3 py-2 text-[var(--lx-ink)]"/></label>
   {resizeMode!=="maxWidth"&&<label className="text-sm text-[var(--lx-muted)]">{lang==="zh"?"目标高度（像素）":"Target height (px)"}<EditableNumberInput type="number" min={1} max={8192} value={height} onChange={e=>setHeight(Math.min(8192,Math.max(1,Math.round(Number(e.target.value)||1))))} className="mt-1 w-full rounded-xl border border-[var(--lx-line)] bg-[var(--lx-panel)] px-3 py-2 text-[var(--lx-ink)]"/></label>}
   {(resizeMode==="contain"||type==="image/jpeg")&&<label className="text-sm text-[var(--lx-muted)]">{lang==="zh"?"背景填充色":"Background color"}<input type="color" value={background} onChange={e=>setBackground(e.target.value)} className="mt-1 block h-11 w-full cursor-pointer rounded-xl border border-[var(--lx-line)] bg-[var(--lx-panel)]"/></label>}
  </div>
  <div className="grid gap-3 sm:grid-cols-2"><button type="button" onClick={()=>{setResizeMode("exact");setMaxW(200);setHeight(200)}} className="rounded-xl border border-[var(--lx-line)] px-3 py-2 text-sm">200 × 200 px</button><button type="button" onClick={()=>{setResizeMode("exact");setMaxW(359);setHeight(195)}} className="rounded-xl border border-[var(--lx-line)] px-3 py-2 text-sm">359 × 195 px</button></div>
  <div className="grid gap-3 sm:grid-cols-3">
   
   <label className="text-sm text-[var(--lx-muted)]">{c.quality}<EditableNumberInput type="number" min=".4" max=".95" step=".05" value={quality} onChange={e=>setQuality(Math.min(.95,Math.max(.4,Number(e.target.value))))} className="mt-1 w-full rounded-xl border border-[var(--lx-line)] bg-[var(--lx-panel)] px-3 py-2 text-[var(--lx-ink)]"/></label>
   <label className="text-sm text-[var(--lx-muted)]">{c.format}<select value={type} onChange={e=>setType(e.target.value)} className="mt-1 w-full rounded-xl border border-[var(--lx-line)] bg-[var(--lx-panel)] px-3 py-2 text-[var(--lx-ink)]"><option value="image/jpeg">JPG</option><option value="image/png">PNG</option><option value="image/webp">WebP</option></select></label>
  </div>
  {files.length>0&&<p className="text-sm text-[var(--lx-faint)]">{c.selected} {files.length}</p>}
  <button disabled={!files.length||busy} onClick={run} className="rounded-xl bg-[var(--lx-ink)] px-5 py-2.5 text-sm text-[var(--lx-bg)] disabled:opacity-40">{busy?c.busy:c.run}</button>
  {stage&&<p className="text-sm text-[var(--lx-faint)]">{stage}</p>}
  {!!results.length&&<ResultPanel files={results} messageZh={c.ready} messageEn={c.ready} details={{files:results.length,resultKB:Number((total/1024).toFixed(1))}}/>}
  {error&&<p role="alert" className="text-sm text-[var(--lx-danger)]">{c.error} · {error}</p>}
 </div>;
}
