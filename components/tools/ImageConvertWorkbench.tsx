"use client";
import {useState} from "react";
import FileDropzone from "@/components/tools/FileDropzone";
import ResultPanel from "@/components/tools/ResultPanel";
import {useLingxiLang,type LingxiLang} from "@/lib/lingxi-i18n";
import type {ToolResultFile} from "@/lib/tools/types";
type Props={output:"jpeg"|"png"|"webp";accept?:string;title:string};
type C={quality:string;run:string;busy:string;ready:string;error:string};
const D:Record<LingxiLang,C>={
 zh:{quality:"输出质量",run:"开始转换",busy:"正在转换…",ready:"图片转换完成，可以核对结果后单独下载或打包下载。",error:"图片转换没有完成"},
 en:{quality:"Output quality",run:"Convert",busy:"Converting…",ready:"Conversion finished. Review the results, then download individually or as a ZIP.",error:"Image conversion did not finish"},
 ja:{quality:"出力品質",run:"変換",busy:"変換中…",ready:"変換が完了しました。確認後、個別または ZIP でダウンロードできます。",error:"画像変換を完了できませんでした"},
 ko:{quality:"출력 품질",run:"변환",busy:"변환 중…",ready:"변환이 완료되었습니다. 확인 후 개별 또는 ZIP으로 다운로드하세요.",error:"이미지 변환을 완료하지 못했습니다"},
 fr:{quality:"Qualité de sortie",run:"Convertir",busy:"Conversion…",ready:"Conversion terminée. Vérifiez les résultats puis téléchargez-les séparément ou en ZIP.",error:"La conversion n’a pas abouti"},
 de:{quality:"Ausgabequalität",run:"Konvertieren",busy:"Konvertierung…",ready:"Konvertierung abgeschlossen. Ergebnisse prüfen und einzeln oder als ZIP herunterladen.",error:"Bildkonvertierung fehlgeschlagen"},
 es:{quality:"Calidad de salida",run:"Convertir",busy:"Convirtiendo…",ready:"Conversión terminada. Revisa los resultados y descarga individualmente o en ZIP.",error:"No se pudo completar la conversión"},
 pt:{quality:"Qualidade de saída",run:"Converter",busy:"Convertendo…",ready:"Conversão concluída. Revise os resultados e baixe individualmente ou em ZIP.",error:"Não foi possível concluir a conversão"},
 ar:{quality:"جودة الإخراج",run:"تحويل",busy:"جارٍ التحويل…",ready:"اكتمل التحويل. راجع النتائج ثم نزّلها منفردة أو في ZIP.",error:"تعذر إكمال تحويل الصور"}
};
async function convert(file:File,output:string,quality:number){
 const bmp=await createImageBitmap(file);try{
  const c=document.createElement("canvas");c.width=bmp.width;c.height=bmp.height;const x=c.getContext("2d")!;
  if(output==="jpeg"){x.fillStyle="#fff";x.fillRect(0,0,c.width,c.height)}x.drawImage(bmp,0,0);
  const mime=`image/${output}`;
  return await new Promise<Blob>((res,rej)=>c.toBlob(b=>b?res(b):rej(new Error("ENCODE_FAILED")),mime,quality));
 }finally{bmp.close?.()}
}
export default function ImageConvertWorkbench({output,accept="image/*",title}:Props){
 const{lang}=useLingxiLang();const c=D[lang]??D.en;
 const[files,setFiles]=useState<File[]>([]),[quality,setQuality]=useState(.92),[busy,setBusy]=useState(false),[error,setError]=useState(""),[results,setResults]=useState<ToolResultFile[]>([]);
 async function run(){
  setBusy(true);setError("");setResults([]);
  try{
   const ext=output==="jpeg"?"jpg":output,out:ToolResultFile[]=[];
   for(const f of files){
    const blob=await convert(f,output,Math.min(1,Math.max(.4,quality)));
    out.push({name:`${f.name.replace(/\.[^.]+$/,"")}.${ext}`,blob,mime:blob.type||`image/${output}`,size:blob.size});
   }
   setResults(out);
  }catch(e){setError(e instanceof Error?e.message:String(e))}
  finally{setBusy(false)}
 }
 return <div className="space-y-4">
  <FileDropzone accept={accept} multiple maxFiles={50} maxSizeMB={40} files={files} onChange={f=>{setFiles(f);setResults([]);setError("")}} disabled={busy} kind="image"/>
  {output!=="png"&&<label className="block text-sm text-[var(--lx-muted)]">{c.quality}<input type="range" min=".4" max="1" step=".05" value={quality} onChange={e=>setQuality(Math.min(1,Math.max(.4,Number(e.target.value)||.92)))} className="ml-3 align-middle"/><span className="ml-2">{Math.round(quality*100)}%</span></label>}
  <button disabled={!files.length||busy} onClick={run} className="rounded-xl bg-[var(--lx-ink)] px-5 py-2.5 text-sm text-[var(--lx-bg)] disabled:opacity-40">{busy?c.busy:`${c.run} · ${title}`}</button>
  {!!results.length&&<ResultPanel files={results} messageZh={c.ready} messageEn={c.ready}/>}
  {error&&<p role="alert" className="text-sm text-[var(--lx-danger)]">{c.error} · {error}</p>}
 </div>;
}
