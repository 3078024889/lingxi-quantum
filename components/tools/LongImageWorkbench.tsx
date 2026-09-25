"use client";
import {useMemo,useState} from "react";
import FileDropzone from "@/components/tools/FileDropzone";
import ResultPanel from "@/components/tools/ResultPanel";
import {useLingxiLang,type LingxiLang} from "@/lib/lingxi-i18n";
import type {ToolResultFile} from "@/lib/tools/types";

type C={gap:string;background:string;run:string;busy:string;ready:string;tooLarge:string;error:string};
const D:Record<LingxiLang,C>={
 zh:{gap:"图片间距 px",background:"背景颜色",run:"生成长图",busy:"正在拼接…",ready:"长图已经生成，可以先核对尺寸和体积再下载。",tooLarge:"生成结果太大，浏览器无法安全处理。请减少图片数量或降低分辨率。",error:"长图生成没有完成"},
 en:{gap:"Gap px",background:"Background",run:"Create long image",busy:"Stitching…",ready:"The long image is ready. Review its size before downloading.",tooLarge:"The result is too large for the browser. Reduce image count or resolution.",error:"Long-image creation did not finish"},
 ja:{gap:"画像間隔 px",background:"背景色",run:"長画像を生成",busy:"結合中…",ready:"長画像を生成しました。サイズを確認してからダウンロードできます。",tooLarge:"結果が大きすぎます。画像数または解像度を下げてください。",error:"長画像を生成できませんでした"},
 ko:{gap:"이미지 간격 px",background:"배경색",run:"긴 이미지 만들기",busy:"이어 붙이는 중…",ready:"긴 이미지가 완성되었습니다. 크기를 확인한 뒤 다운로드하세요.",tooLarge:"결과가 너무 큽니다. 이미지 수나 해상도를 줄여 주세요.",error:"긴 이미지 생성을 완료하지 못했습니다"},
 fr:{gap:"Espacement px",background:"Arrière-plan",run:"Créer l’image longue",busy:"Assemblage…",ready:"L’image longue est prête. Vérifiez sa taille avant de télécharger.",tooLarge:"Le résultat est trop grand pour le navigateur. Réduisez le nombre d’images ou leur résolution.",error:"La création n’a pas abouti"},
 de:{gap:"Abstand px",background:"Hintergrund",run:"Langes Bild erstellen",busy:"Zusammenfügen…",ready:"Das lange Bild ist fertig. Größe prüfen und herunterladen.",tooLarge:"Das Ergebnis ist für den Browser zu groß. Weniger Bilder oder geringere Auflösung verwenden.",error:"Das lange Bild konnte nicht erstellt werden"},
 es:{gap:"Separación px",background:"Fondo",run:"Crear imagen larga",busy:"Uniendo…",ready:"La imagen larga está lista. Revisa el tamaño antes de descargar.",tooLarge:"El resultado es demasiado grande para el navegador. Reduce el número de imágenes o su resolución.",error:"No se pudo crear la imagen larga"},
 pt:{gap:"Espaçamento px",background:"Fundo",run:"Criar imagem longa",busy:"Juntando…",ready:"A imagem longa está pronta. Confira o tamanho antes de baixar.",tooLarge:"O resultado é grande demais para o navegador. Reduza a quantidade de imagens ou a resolução.",error:"Não foi possível criar a imagem longa"},
 ar:{gap:"المسافة px",background:"الخلفية",run:"إنشاء صورة طويلة",busy:"جارٍ الدمج…",ready:"الصورة الطويلة جاهزة. راجع الحجم قبل التنزيل.",tooLarge:"النتيجة كبيرة جدًا على المتصفح. قلّل عدد الصور أو الدقة.",error:"تعذر إنشاء الصورة الطويلة"}
};

export default function LongImageWorkbench(){
 const{lang}=useLingxiLang();const c=D[lang]??D.en;
 const[files,setFiles]=useState<File[]>([]),[gap,setGap]=useState(0),[bg,setBg]=useState("#ffffff"),[busy,setBusy]=useState(false),[error,setError]=useState(""),[result,setResult]=useState<ToolResultFile[]>([]),[dims,setDims]=useState<{w:number;h:number}|null>(null);

 async function run(){
  if(!files.length)return;setBusy(true);setError("");setResult([]);setDims(null);
  let bitmaps:ImageBitmap[]=[];
  try{
   const imgs=await Promise.all(files.map(async f=>{const b=await createImageBitmap(f);bitmaps.push(b);return{f,b}}));
   const width=Math.max(...imgs.map(x=>x.b.width)),heights=imgs.map(x=>Math.round(x.b.height*width/x.b.width)),height=heights.reduce((a,b)=>a+b,0)+gap*(imgs.length-1);
   if(width*height>120_000_000)throw new Error(c.tooLarge);
   const canvas=document.createElement("canvas");canvas.width=width;canvas.height=height;const ctx=canvas.getContext("2d")!;
   ctx.fillStyle=bg;ctx.fillRect(0,0,width,height);let y=0;
   imgs.forEach((it,i)=>{ctx.drawImage(it.b,0,y,width,heights[i]);y+=heights[i]+gap});
   const out=await new Promise<Blob>((res,rej)=>canvas.toBlob(b=>b?res(b):rej(new Error("EXPORT_FAILED")),"image/jpeg",.92));
   setDims({w:width,h:height});setResult([{name:"lingxifield-long-image.jpg",blob:out,mime:"image/jpeg",size:out.size}]);
   canvas.width=1;canvas.height=1;
  }catch(e){setError(e instanceof Error?e.message:String(e))}
  finally{for(const b of bitmaps)b.close?.();setBusy(false)}
 }
 const details=useMemo(()=>dims?{width:dims.w,height:dims.h}:undefined,[dims]);
 return <div className="space-y-4">
  <FileDropzone accept="image/*" multiple maxFiles={50} maxSizeMB={50} files={files} onChange={f=>{setFiles(f);setResult([]);setError("")}} disabled={busy} kind="image"/>
  <div className="flex flex-wrap gap-4">
   <label className="text-sm text-[var(--lx-muted)]">{c.gap}<input type="number" min={0} max={100} value={gap} onChange={e=>setGap(Math.min(100,Math.max(0,Number(e.target.value)||0)))} className="ml-2 w-24 rounded-lg border border-[var(--lx-line)] bg-[var(--lx-panel)] px-2 py-1 text-[var(--lx-ink)]"/></label>
   <label className="text-sm text-[var(--lx-muted)]">{c.background}<input type="color" value={bg} onChange={e=>setBg(e.target.value)} className="ml-2 align-middle"/></label>
  </div>
  <button disabled={!files.length||busy} onClick={run} className="rounded-xl bg-[var(--lx-ink)] px-5 py-2.5 text-sm text-[var(--lx-bg)] disabled:opacity-40">{busy?c.busy:c.run}</button>
  {!!result.length&&<ResultPanel files={result} messageZh={c.ready} messageEn={c.ready} details={details}/>}
  {error&&<p role="alert" className="rounded-xl border border-[var(--lx-danger)] bg-[var(--lx-panel)] p-4 text-sm text-[var(--lx-danger)]">{c.error} · {error}</p>}
 </div>;
}
