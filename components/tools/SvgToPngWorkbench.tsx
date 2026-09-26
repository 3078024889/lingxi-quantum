"use client";
import {useState} from "react";
import FileDropzone from "@/components/tools/FileDropzone";
import ResultPanel from "@/components/tools/ResultPanel";
import {useLingxiLang,type LingxiLang} from "@/lib/lingxi-i18n";
import type {ToolResultFile} from "@/lib/tools/types";

type C={scale:string;run:string;busy:string;ready:string;error:string;unsafe:string;lead:string};
const D:Record<LingxiLang,C>={
 zh:{scale:"输出倍率",run:"转换为 PNG",busy:"正在转换…",ready:"PNG 已生成，可以核对尺寸后下载。",error:"SVG 转换没有完成",unsafe:"这个 SVG 包含外部资源、脚本或可执行内容。为保护隐私和浏览器安全，已停止转换。",lead:"在直接把安全 SVG 渲染为 PNG，不上传文件。"},
 en:{scale:"Output scale",run:"Convert to PNG",busy:"Converting…",ready:"The PNG is ready. Review it before downloading.",error:"SVG conversion did not finish",unsafe:"This SVG contains external resources, scripts or executable content. Conversion was stopped for privacy and browser safety.",lead:"Render a safe SVG to PNG locally in your browser without uploading the file."},
 ja:{scale:"出力倍率",run:"PNG に変換",busy:"変換中…",ready:"PNG を生成しました。確認してダウンロードできます。",error:"SVG 変換を完了できませんでした",unsafe:"外部リソース、スクリプト、実行可能な内容を含む SVG のため、安全のため変換を停止しました。",lead:"安全な SVG をブラウザ内で PNG に変換します。ファイルはアップロードしません。"},
 ko:{scale:"출력 배율",run:"PNG로 변환",busy:"변환 중…",ready:"PNG가 준비되었습니다. 확인 후 다운로드하세요.",error:"SVG 변환을 완료하지 못했습니다",unsafe:"외부 리소스, 스크립트 또는 실행 가능한 내용이 포함된 SVG입니다. 안전을 위해 변환을 중단했습니다.",lead:"안전한 SVG를 브라우저 안에서 PNG로 변환하며 파일을 업로드하지 않습니다."},
 fr:{scale:"Échelle de sortie",run:"Convertir en PNG",busy:"Conversion…",ready:"Le PNG est prêt. Vérifiez-le avant de télécharger.",error:"La conversion SVG n’a pas abouti",unsafe:"Ce SVG contient des ressources externes, scripts ou contenus exécutables. La conversion a été arrêtée pour protéger votre confidentialité et votre navigateur.",lead:"Rendez un SVG sûr en PNG localement dans votre navigateur, sans envoi du fichier."},
 de:{scale:"Ausgabeskalierung",run:"In PNG umwandeln",busy:"Konvertierung…",ready:"PNG ist fertig. Vor dem Download prüfen.",error:"SVG-Konvertierung fehlgeschlagen",unsafe:"Dieses SVG enthält externe Ressourcen, Skripte oder ausführbare Inhalte. Die Konvertierung wurde aus Sicherheitsgründen gestoppt.",lead:"Ein sicheres SVG lokal im Browser in PNG rendern, ohne Upload."},
 es:{scale:"Escala de salida",run:"Convertir a PNG",busy:"Convirtiendo…",ready:"El PNG está listo. Revísalo antes de descargar.",error:"No se pudo completar la conversión",unsafe:"Este SVG contiene recursos externos, scripts o contenido ejecutable. Se detuvo la conversión por seguridad y privacidad.",lead:"Renderiza un SVG seguro a PNG localmente en el navegador, sin subir el archivo."},
 pt:{scale:"Escala de saída",run:"Converter para PNG",busy:"Convertendo…",ready:"O PNG está pronto. Revise antes de baixar.",error:"Não foi possível concluir a conversão",unsafe:"Este SVG contém recursos externos, scripts ou conteúdo executável. A conversão foi interrompida por segurança e privacidade.",lead:"Renderize um SVG seguro para PNG localmente no navegador, sem enviar o arquivo."},
 ar:{scale:"مقياس الإخراج",run:"تحويل إلى PNG",busy:"جارٍ التحويل…",ready:"ملف PNG جاهز. راجعه قبل التنزيل.",error:"تعذر إكمال تحويل SVG",unsafe:"يحتوي SVG على موارد خارجية أو نصوص برمجية أو محتوى قابل للتنفيذ. أوقف التحويل لحماية الخصوصية وأمان المتصفح.",lead:"حوّل SVG الآمن إلى PNG محليًا داخل المتصفح دون رفع الملف."}
};
function unsafeSvg(text:string){
 const doc=new DOMParser().parseFromString(text,"image/svg+xml");
 if(doc.querySelector("parsererror,script,foreignObject"))return true;
 for(const el of Array.from(doc.querySelectorAll("*"))){
  for(const a of Array.from(el.attributes)){
   const n=a.name.toLowerCase(),v=a.value.trim().toLowerCase();
   if(n.startsWith("on"))return true;
   if(v.startsWith("javascript:"))return true;
   if((n==="href"||n.endsWith(":href")||n==="src")&&/^https?:\/\//.test(v))return true;
  }
 }
 return false;
}
export default function SvgToPngWorkbench(){
 const{lang}=useLingxiLang();const c=D[lang]??D.en;
 const[files,setFiles]=useState<File[]>([]),[scale,setScale]=useState(2),[busy,setBusy]=useState(false),[error,setError]=useState(""),[result,setResult]=useState<ToolResultFile[]>([]);
 const file=files[0]||null;
 async function run(){
  if(!file)return;setBusy(true);setError("");setResult([]);let url="";
  try{
   const text=await file.text();if(unsafeSvg(text))throw new Error(c.unsafe);
   url=URL.createObjectURL(new Blob([text],{type:"image/svg+xml"}));
   const img=await new Promise<HTMLImageElement>((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=()=>rej(new Error("SVG_LOAD_FAILED"));i.src=url});
   const w=Math.max(1,Math.round((img.naturalWidth||800)*scale)),h=Math.max(1,Math.round((img.naturalHeight||600)*scale));
   if(w*h>80_000_000)throw new Error("CANVAS_TOO_LARGE");
   const canvas=document.createElement("canvas");canvas.width=w;canvas.height=h;canvas.getContext("2d")!.drawImage(img,0,0,w,h);
   const out=await new Promise<Blob>((res,rej)=>canvas.toBlob(b=>b?res(b):rej(new Error("PNG_EXPORT_FAILED")),"image/png"));
   setResult([{name:file.name.replace(/\.svg$/i,"")+".png",blob:out,mime:"image/png",size:out.size}]);canvas.width=1;canvas.height=1;
  }catch(e){setError(e instanceof Error?e.message:String(e))}
  finally{if(url)URL.revokeObjectURL(url);setBusy(false)}
 }
 return <div className="space-y-4">
  <FileDropzone accept=".svg,image/svg+xml" files={files} onChange={f=>{setFiles(f);setResult([]);setError("")}} disabled={busy}/>
  <p className="text-sm text-[var(--lx-muted)]">{c.lead}</p>
  <label className="block text-sm text-[var(--lx-muted)]">{c.scale}<select value={scale} onChange={e=>setScale(Number(e.target.value))} className="ml-2 rounded-lg border border-[var(--lx-line)] bg-[var(--lx-panel)] px-3 py-2 text-[var(--lx-ink)]"><option value={1}>1x</option><option value={2}>2x</option><option value={3}>3x</option><option value={4}>4x</option></select></label>
  <button disabled={!file||busy} onClick={run} className="rounded-xl bg-[var(--lx-ink)] px-5 py-2.5 text-sm text-[var(--lx-bg)] disabled:opacity-40">{busy?c.busy:c.run}</button>
  {!!result.length&&<ResultPanel files={result} messageZh={c.ready} messageEn={c.ready}/>}
  {error&&<p role="alert" className="text-sm text-[var(--lx-danger)]">{c.error} · {error}</p>}
 </div>;
}
