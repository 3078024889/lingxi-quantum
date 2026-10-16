"use client";
import EditableNumberInput from "@/components/ui/EditableNumberInput";

import {useMemo,useState} from "react";
import FileDropzone from "@/components/tools/FileDropzone";
import ResultPanel from "@/components/tools/ResultPanel";
import {useLingxiLang,type LingxiLang} from "@/lib/lingxi-i18n";
import ToolUiText from "@/components/tools/ToolUiText";
import{toolUiText}from "@/lib/tool-ui-i18n";
import type {ToolResultFile} from "@/lib/tools/types";

async function canvas(file:File,opts:{maxW:number;targetW:number;targetH:number;resizeMode:"max"|"exact"|"contain"|"cover";quality:number;type:string}){
 const b=await createImageBitmap(file);const sw=b.width,sh=b.height;
 let w=sw,h=sh,dx=0,dy=0,dw=sw,dh=sh;
 if(opts.resizeMode==="exact"&&opts.targetW>0&&opts.targetH>0){w=opts.targetW;h=opts.targetH;dw=w;dh=h}
 else if(opts.resizeMode==="contain"&&opts.targetW>0&&opts.targetH>0){w=opts.targetW;h=opts.targetH;const s=Math.min(w/sw,h/sh);dw=Math.max(1,Math.round(sw*s));dh=Math.max(1,Math.round(sh*s));dx=Math.floor((w-dw)/2);dy=Math.floor((h-dh)/2)}
 else if(opts.resizeMode==="cover"&&opts.targetW>0&&opts.targetH>0){w=opts.targetW;h=opts.targetH;const s=Math.max(w/sw,h/sh);dw=Math.max(1,Math.round(sw*s));dh=Math.max(1,Math.round(sh*s));dx=Math.floor((w-dw)/2);dy=Math.floor((h-dh)/2)}
 else if(opts.targetW>0){w=opts.targetW;h=Math.max(1,Math.round(sh*w/sw));dw=w;dh=h}
 else if(opts.maxW>0&&sw>opts.maxW){w=opts.maxW;h=Math.max(1,Math.round(sh*w/sw));dw=w;dh=h}
 const c=document.createElement("canvas");c.width=w;c.height=h;const x=c.getContext("2d")!;
 if(opts.type==="image/jpeg"||opts.resizeMode==="contain"){x.fillStyle="#fff";x.fillRect(0,0,w,h)}
 x.imageSmoothingEnabled=true;x.imageSmoothingQuality="high";x.drawImage(b,dx,dy,dw,dh);b.close?.();
 return await new Promise<Blob>((res,rej)=>c.toBlob(v=>v?res(v):rej(new Error("EXPORT_FAILED")),opts.type,opts.quality));
}
type C={maxW:string;targetW:string;targetH:string;resizeMode:string;quality:string;format:string;selected:string;run:string;busy:string;ready:string;error:string};
const D:Record<LingxiLang,C>={
 zh:{maxW:"最大宽度 px",targetW:"目标宽度 px",targetH:"目标高度 px",resizeMode:"调整方式",quality:"质量 0.4–0.95",format:"输出格式",selected:"已选择",run:"开始批量处理",busy:"正在处理…",ready:"批量图片已处理完成，可以核对结果后单独下载或打包下载。",error:"批量图片处理没有完成"},
 en:{maxW:"Max width px",targetW:"Target width px",targetH:"Target height px",resizeMode:"Resize mode",quality:"Quality 0.4–0.95",format:"Output format",selected:"Selected",run:"Process batch",busy:"Processing…",ready:"Batch processing finished. Review the results, then download individually or as a ZIP.",error:"Batch image processing did not finish"},
 ja:{maxW:"最大幅 px",targetW:"目標幅 px",targetH:"目標高 px",resizeMode:"サイズ調整",quality:"品質 0.4–0.95",format:"出力形式",selected:"選択済み",run:"一括処理を開始",busy:"処理中…",ready:"一括処理が完了しました。確認後、個別または ZIP でダウンロードできます。",error:"一括画像処理を完了できませんでした"},
 ko:{maxW:"최대 너비 px",targetW:"목표 너비 px",targetH:"목표 높이 px",resizeMode:"크기 조정",quality:"품질 0.4–0.95",format:"출력 형식",selected:"선택됨",run:"일괄 처리 시작",busy:"처리 중…",ready:"일괄 처리가 완료되었습니다. 확인 후 개별 또는 ZIP으로 다운로드하세요.",error:"일괄 이미지 처리를 완료하지 못했습니다"},
 fr:{maxW:"Largeur max px",targetW:"Largeur cible px",targetH:"Hauteur cible px",resizeMode:"Redimensionnement",quality:"Qualité 0.4–0.95",format:"Format de sortie",selected:"Sélection",run:"Traiter le lot",busy:"Traitement…",ready:"Traitement terminé. Vérifiez les résultats puis téléchargez-les séparément ou en ZIP.",error:"Le traitement du lot n’a pas abouti"},
 de:{maxW:"Max. Breite px",targetW:"Zielbreite px",targetH:"Zielhöhe px",resizeMode:"Größenanpassung",quality:"Qualität 0.4–0.95",format:"Ausgabeformat",selected:"Ausgewählt",run:"Stapel verarbeiten",busy:"Verarbeitung…",ready:"Stapelverarbeitung abgeschlossen. Ergebnisse prüfen und einzeln oder als ZIP herunterladen.",error:"Stapelverarbeitung konnte nicht abgeschlossen werden"},
 es:{maxW:"Ancho máximo px",targetW:"Ancho objetivo px",targetH:"Alto objetivo px",resizeMode:"Ajuste",quality:"Calidad 0.4–0.95",format:"Formato de salida",selected:"Seleccionadas",run:"Procesar lote",busy:"Procesando…",ready:"Lote procesado. Revisa los resultados y descarga individualmente o en ZIP.",error:"No se pudo completar el lote"},
 pt:{maxW:"Largura máxima px",targetW:"Largura alvo px",targetH:"Altura alvo px",resizeMode:"Redimensionamento",quality:"Qualidade 0.4–0.95",format:"Formato de saída",selected:"Selecionadas",run:"Processar lote",busy:"Processando…",ready:"Lote processado. Revise os resultados e baixe individualmente ou em ZIP.",error:"Não foi possível concluir o lote"},
 ar:{maxW:"أقصى عرض px",targetW:"العرض المستهدف px",targetH:"الارتفاع المستهدف px",resizeMode:"طريقة تغيير الحجم",quality:"الجودة 0.4–0.95",format:"صيغة الإخراج",selected:"تم الاختيار",run:"بدء المعالجة الدُفعية",busy:"جارٍ المعالجة…",ready:"اكتملت المعالجة. راجع النتائج ثم نزّلها منفردة أو في ملف ZIP.",error:"تعذر إكمال معالجة الصور"}
};

export default function BatchImageWorkbench(){
 const{lang}=useLingxiLang();const c=D[lang]??D.en;
 const[files,setFiles]=useState<File[]>([]),[maxW,setMaxW]=useState(1920),[targetW,setTargetW]=useState(0),[targetH,setTargetH]=useState(0),[resizeMode,setResizeMode]=useState<"max"|"exact"|"contain"|"cover">("max"),[quality,setQuality]=useState(.82),[type,setType]=useState("image/jpeg"),[busy,setBusy]=useState(false),[stage,setStage]=useState(""),[error,setError]=useState(""),[results,setResults]=useState<ToolResultFile[]>([]);
 async function run(){
  setBusy(true);setStage(c.busy);setError("");setResults([]);
  try{
   const out:ToolResultFile[]=[];
   for(let i=0;i<files.length;i++){
    const f=files[i];setStage(`${c.busy} ${i+1}/${files.length} · ${f.name}`);
    const b=await canvas(f,{maxW,targetW,targetH,resizeMode,quality:Math.min(.95,Math.max(.4,quality)),type}),ext=type==="image/png"?"png":type==="image/webp"?"webp":"jpg";
    out.push({name:f.name.replace(/\.[^.]+$/,"")+"."+ext,blob:b,mime:type,size:b.size});
   }
   setResults(out);setStage("");
  }catch(e){setError(e instanceof Error?e.message:String(e));setStage("")}
  finally{setBusy(false)}
 }
 const total=useMemo(()=>results.reduce((n,x)=>n+x.size,0),[results]);
 return <div className="space-y-4">
  <FileDropzone accept="image/*" multiple append maxFiles={50} maxSizeMB={50} files={files} onChange={f=>{setFiles(f);setResults([]);setError("")}} disabled={busy} kind="image"/>
  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
   <label className="text-sm text-[var(--lx-muted)]">{c.resizeMode}<select value={resizeMode} onChange={e=>setResizeMode(e.target.value as any)} className="mt-1 w-full rounded-xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-2 text-[var(--lx-ink)]"><option value="max">{toolUiText(lang,"按最大宽度","By max width")}</option><option value="exact">{toolUiText(lang,"强制目标尺寸","Exact size")}</option><option value="contain">{toolUiText(lang,"完整放入目标框","Contain in target")}</option><option value="cover">{toolUiText(lang,"铺满目标框","Cover target")}</option></select></label><label className="text-sm text-[var(--lx-muted)]">{c.targetW}<EditableNumberInput type="number" min={0} value={targetW} onChange={e=>setTargetW(Math.max(0,Number(e.target.value)))} className="mt-1 w-full rounded-xl border border-[var(--lx-line)] bg-[var(--lx-panel)] px-3 py-2 text-[var(--lx-ink)]"/></label>
   <label className="text-sm text-[var(--lx-muted)]">{c.targetH}<EditableNumberInput type="number" min={0} max={20000} step={1} value={targetH} onChange={e=>setTargetH(Math.max(0,Number(e.target.value)))} className="mt-1 w-full rounded-xl border border-[var(--lx-line)] bg-[var(--lx-panel)] px-3 py-2 text-[var(--lx-ink)]"/></label>
   <label className="text-sm text-[var(--lx-muted)]">{c.maxW}<EditableNumberInput type="number" min={0} value={maxW} onChange={e=>setMaxW(Math.max(0,Number(e.target.value)))} className="mt-1 w-full rounded-xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-2 text-[var(--lx-ink)]"/></label><label className="text-sm text-[var(--lx-muted)]">{c.quality}<EditableNumberInput type="number" min=".4" max=".95" step=".05" value={quality} onChange={e=>setQuality(Math.min(.95,Math.max(.4,Number(e.target.value))))} className="mt-1 w-full rounded-xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-2 text-[var(--lx-ink)]"/></label><label className="text-sm text-[var(--lx-muted)]">{c.format}<select value={type} onChange={e=>setType(e.target.value)} className="mt-1 w-full rounded-xl border border-[var(--lx-line)] bg-[var(--lx-panel)] px-3 py-2 text-[var(--lx-ink)]"><option value="image/jpeg">JPG</option><option value="image/png">PNG</option><option value="image/webp">WebP</option></select></label>
  </div>
  {files.length>0&&<p className="text-sm text-[var(--lx-faint)]">{c.selected} {files.length}</p>}
  <button disabled={!files.length||busy} onClick={run} className="rounded-xl bg-[var(--lx-ink)] px-5 py-2.5 text-sm text-[var(--lx-bg)] disabled:opacity-40">{busy?c.busy:c.run}</button>
  {stage&&<p className="text-sm text-[var(--lx-faint)]">{stage}</p>}
  {!!results.length&&<ResultPanel files={results} messageZh={c.ready} messageEn={c.ready} details={{files:results.length,resultKB:Number((total/1024).toFixed(1))}}/>}
  {error&&<p role="alert" className="text-sm text-[var(--lx-danger)]">{c.error} · {error}</p>}
 </div>;
}
