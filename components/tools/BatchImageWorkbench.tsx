"use client";
import {useMemo,useState} from "react";
import FileDropzone from "@/components/tools/FileDropzone";
import ResultPanel from "@/components/tools/ResultPanel";
import {useLingxiLang,type LingxiLang} from "@/lib/lingxi-i18n";
import type {ToolResultFile} from "@/lib/tools/types";

async function canvas(file:File,maxW:number,quality:number,type:string){
 const b=await createImageBitmap(file);let w=b.width,h=b.height;
 if(maxW>0&&w>maxW){h=Math.round(h*maxW/w);w=maxW}
 const c=document.createElement("canvas");c.width=w;c.height=h;const x=c.getContext("2d")!;
 if(type==="image/jpeg"){x.fillStyle="#fff";x.fillRect(0,0,w,h)}
 x.drawImage(b,0,0,w,h);b.close?.();
 return await new Promise<Blob>((res,rej)=>c.toBlob(v=>v?res(v):rej(new Error("EXPORT_FAILED")),type,quality));
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
 const[files,setFiles]=useState<File[]>([]),[maxW,setMaxW]=useState(1920),[quality,setQuality]=useState(.82),[type,setType]=useState("image/jpeg"),[busy,setBusy]=useState(false),[stage,setStage]=useState(""),[error,setError]=useState(""),[results,setResults]=useState<ToolResultFile[]>([]);
 async function run(){
  setBusy(true);setStage(c.busy);setError("");setResults([]);
  try{
   const out:ToolResultFile[]=[];
   for(let i=0;i<files.length;i++){
    const f=files[i];setStage(`${c.busy} ${i+1}/${files.length} · ${f.name}`);
    const b=await canvas(f,maxW,Math.min(.95,Math.max(.4,quality)),type),ext=type==="image/png"?"png":type==="image/webp"?"webp":"jpg";
    out.push({name:f.name.replace(/\.[^.]+$/,"")+"."+ext,blob:b,mime:type,size:b.size});
   }
   setResults(out);setStage("");
  }catch(e){setError(e instanceof Error?e.message:String(e));setStage("")}
  finally{setBusy(false)}
 }
 const total=useMemo(()=>results.reduce((n,x)=>n+x.size,0),[results]);
 return <div className="space-y-4">
  <FileDropzone accept="image/*" multiple maxFiles={50} maxSizeMB={50} files={files} onChange={f=>{setFiles(f);setResults([]);setError("")}} disabled={busy} kind="image"/>
  <div className="grid gap-3 sm:grid-cols-3">
   <label className="text-sm text-[var(--lx-muted)]">{c.maxW}<input type="number" min={0} value={maxW} onChange={e=>setMaxW(Math.max(0,Number(e.target.value)||0))} className="mt-1 w-full rounded-xl border border-[var(--lx-line)] bg-[var(--lx-panel)] px-3 py-2 text-[var(--lx-ink)]"/></label>
   <label className="text-sm text-[var(--lx-muted)]">{c.quality}<input type="number" min=".4" max=".95" step=".05" value={quality} onChange={e=>setQuality(Math.min(.95,Math.max(.4,Number(e.target.value)||.82)))} className="mt-1 w-full rounded-xl border border-[var(--lx-line)] bg-[var(--lx-panel)] px-3 py-2 text-[var(--lx-ink)]"/></label>
   <label className="text-sm text-[var(--lx-muted)]">{c.format}<select value={type} onChange={e=>setType(e.target.value)} className="mt-1 w-full rounded-xl border border-[var(--lx-line)] bg-[var(--lx-panel)] px-3 py-2 text-[var(--lx-ink)]"><option value="image/jpeg">JPG</option><option value="image/png">PNG</option><option value="image/webp">WebP</option></select></label>
  </div>
  {files.length>0&&<p className="text-sm text-[var(--lx-faint)]">{c.selected} {files.length}</p>}
  <button disabled={!files.length||busy} onClick={run} className="rounded-xl bg-[var(--lx-ink)] px-5 py-2.5 text-sm text-[var(--lx-bg)] disabled:opacity-40">{busy?c.busy:c.run}</button>
  {stage&&<p className="text-sm text-[var(--lx-faint)]">{stage}</p>}
  {!!results.length&&<ResultPanel files={results} messageZh={c.ready} messageEn={c.ready} details={{files:results.length,resultKB:Number((total/1024).toFixed(1))}}/>}
  {error&&<p role="alert" className="text-sm text-[var(--lx-danger)]">{c.error} · {error}</p>}
 </div>;
}
