"use client";
import {useState} from "react";
import {PDFDocument} from "pdf-lib";
import FileDropzone from "@/components/tools/FileDropzone";
import ResultPanel from "@/components/tools/ResultPanel";
import {useLingxiLang,type LingxiLang} from "@/lib/lingxi-i18n";
import type {ToolResultFile} from "@/lib/tools/types";
type PageSize="fit"|"a4"|"letter";
type Orientation="auto"|"portrait"|"landscape";
type Margin="none"|"small"|"big";
type C={lead:string;run:string;busy:string;ready:string;error:string;pageSize:string;orientation:string;margin:string;fit:string;a4:string;letter:string;auto:string;portrait:string;landscape:string;none:string;small:string;big:string;up:string;down:string;remove:string};
const D:Record<LingxiLang,C>={
 zh:{lead:"多张图片可以一次整理成 PDF：拖动调整顺序，并选择页面大小、方向和边距。",run:"生成 PDF",busy:"正在生成…",ready:"PDF 已生成，可以核对页数后下载。",error:"图片转 PDF 没有完成",pageSize:"页面大小",orientation:"方向",margin:"边距",fit:"按图片原尺寸",a4:"A4",letter:"US Letter",auto:"自动",portrait:"竖向",landscape:"横向",none:"无",small:"小",big:"大",up:"上移",down:"下移",remove:"移除"},
 en:{lead:"Turn multiple images into one PDF, reorder them, and choose page size, orientation, and margins.",run:"Create PDF",busy:"Creating…",ready:"The PDF is ready. Review the page count before downloading.",error:"Image-to-PDF did not finish",pageSize:"Page size",orientation:"Orientation",margin:"Margin",fit:"Fit image size",a4:"A4",letter:"US Letter",auto:"Auto",portrait:"Portrait",landscape:"Landscape",none:"None",small:"Small",big:"Large",up:"Up",down:"Down",remove:"Remove"},
 ja:{lead:"複数の画像を1つのPDFにまとめ、順序・用紙サイズ・向き・余白を調整できます。",run:"PDFを生成",busy:"生成中…",ready:"PDFを生成しました。ページ数を確認して保存できます。",error:"PDFを生成できませんでした",pageSize:"用紙サイズ",orientation:"向き",margin:"余白",fit:"画像サイズ",a4:"A4",letter:"US Letter",auto:"自動",portrait:"縦",landscape:"横",none:"なし",small:"小",big:"大",up:"上へ",down:"下へ",remove:"削除"},
 ko:{lead:"여러 이미지를 하나의 PDF로 만들고 순서, 용지 크기, 방향과 여백을 조정할 수 있습니다.",run:"PDF 생성",busy:"생성 중…",ready:"PDF가 준비되었습니다. 페이지 수를 확인한 후 저장하세요.",error:"이미지 PDF 변환을 완료하지 못했습니다",pageSize:"페이지 크기",orientation:"방향",margin:"여백",fit:"이미지 크기",a4:"A4",letter:"US Letter",auto:"자동",portrait:"세로",landscape:"가로",none:"없음",small:"작게",big:"크게",up:"위로",down:"아래로",remove:"삭제"},
 fr:{lead:"Réunissez plusieurs images en un PDF, réorganisez-les et choisissez le format, l’orientation et les marges.",run:"Créer le PDF",busy:"Création…",ready:"Le PDF est prêt. Vérifiez le nombre de pages avant de télécharger.",error:"La création du PDF n’a pas abouti",pageSize:"Format",orientation:"Orientation",margin:"Marge",fit:"Taille de l’image",a4:"A4",letter:"US Letter",auto:"Auto",portrait:"Portrait",landscape:"Paysage",none:"Aucune",small:"Petite",big:"Grande",up:"Monter",down:"Descendre",remove:"Supprimer"},
 de:{lead:"Mehrere Bilder zu einem PDF zusammenfassen, sortieren und Seitengröße, Ausrichtung und Ränder wählen.",run:"PDF erstellen",busy:"Erstellung…",ready:"PDF ist fertig. Seitenzahl vor dem Download prüfen.",error:"PDF-Erstellung fehlgeschlagen",pageSize:"Seitengröße",orientation:"Ausrichtung",margin:"Rand",fit:"Bildgröße",a4:"A4",letter:"US Letter",auto:"Automatisch",portrait:"Hochformat",landscape:"Querformat",none:"Keine",small:"Klein",big:"Groß",up:"Nach oben",down:"Nach unten",remove:"Entfernen"},
 es:{lead:"Une varias imágenes en un PDF, cambia el orden y elige tamaño, orientación y márgenes.",run:"Crear PDF",busy:"Creando…",ready:"El PDF está listo. Revisa el número de páginas antes de descargar.",error:"No se pudo crear el PDF",pageSize:"Tamaño",orientation:"Orientación",margin:"Margen",fit:"Tamaño de imagen",a4:"A4",letter:"US Letter",auto:"Automática",portrait:"Vertical",landscape:"Horizontal",none:"Ninguno",small:"Pequeño",big:"Grande",up:"Subir",down:"Bajar",remove:"Quitar"},
 pt:{lead:"Junte várias imagens em um PDF, reorganize a ordem e escolha tamanho, orientação e margens.",run:"Criar PDF",busy:"Criando…",ready:"O PDF está pronto. Confira o número de páginas antes de baixar.",error:"Não foi possível criar o PDF",pageSize:"Tamanho",orientation:"Orientação",margin:"Margem",fit:"Tamanho da imagem",a4:"A4",letter:"US Letter",auto:"Automática",portrait:"Retrato",landscape:"Paisagem",none:"Nenhuma",small:"Pequena",big:"Grande",up:"Subir",down:"Descer",remove:"Remover"},
 ar:{lead:"حوّل عدة صور إلى ملف PDF واحد، ورتّبها واختر حجم الصفحة والاتجاه والهوامش.",run:"إنشاء PDF",busy:"جارٍ الإنشاء…",ready:"ملف PDF جاهز. راجع عدد الصفحات قبل التنزيل.",error:"تعذر إنشاء PDF",pageSize:"حجم الصفحة",orientation:"الاتجاه",margin:"الهامش",fit:"حجم الصورة",a4:"A4",letter:"US Letter",auto:"تلقائي",portrait:"عمودي",landscape:"أفقي",none:"بدون",small:"صغير",big:"كبير",up:"أعلى",down:"أسفل",remove:"إزالة"}
};
function mm(value:Margin){return value==="none"?0:value==="small"?18:36}
function pageBox(size:PageSize,orientation:Orientation,imageW:number,imageH:number){
 if(size==="fit")return{w:imageW,h:imageH};
 const base=size==="a4"?[595.28,841.89]:[612,792];
 let [w,h]=base as [number,number];
 const landscape=orientation==="landscape"||(orientation==="auto"&&imageW>imageH);
 if(landscape)[w,h]=[h,w];
 return{w,h};
}
export default function ImageToPdfWorkbench(){
 const{lang}=useLingxiLang();const c=D[lang]??D.en;
 const[files,setFiles]=useState<File[]>([]),[busy,setBusy]=useState(false),[error,setError]=useState(""),[result,setResult]=useState<ToolResultFile[]>([]);
 const[pageSize,setPageSize]=useState<PageSize>("a4"),[orientation,setOrientation]=useState<Orientation>("auto"),[margin,setMargin]=useState<Margin>("small");
 function move(index:number,direction:-1|1){setFiles(current=>{const next=[...current],target=index+direction;if(target<0||target>=next.length)return current;[next[index],next[target]]=[next[target],next[index]];return next})}
 async function run(){
  if(!files.length)return;setBusy(true);setError("");setResult([]);
  try{
   const out=await PDFDocument.create();
   for(const f of files){
    const ab=await f.arrayBuffer(),isPng=f.type==="image/png"||/\.png$/i.test(f.name),isJpg=f.type==="image/jpeg"||/\.jpe?g$/i.test(f.name);
    if(!isPng&&!isJpg)throw new Error("UNSUPPORTED_IMAGE");
    const img=isPng?await out.embedPng(ab):await out.embedJpg(ab);
    const box=pageBox(pageSize,orientation,img.width,img.height),m=mm(margin);
    const availableW=Math.max(1,box.w-m*2),availableH=Math.max(1,box.h-m*2),scale=Math.min(availableW/img.width,availableH/img.height);
    const drawW=pageSize==="fit"?img.width:img.width*scale,drawH=pageSize==="fit"?img.height:img.height*scale;
    const page=out.addPage([box.w,box.h]);
    page.drawImage(img,{x:(box.w-drawW)/2,y:(box.h-drawH)/2,width:drawW,height:drawH});
   }
   const bytes=await out.save(),copy=new Uint8Array(bytes.length);copy.set(bytes);
   const blob=new Blob([copy.buffer],{type:"application/pdf"});
   setResult([{name:"lingxifield-images.pdf",blob,mime:"application/pdf",size:blob.size}]);
  }catch{setError(c.error)}finally{setBusy(false)}
 }
 return <div className="space-y-4">
  <FileDropzone accept="image/jpeg,image/png,.jpg,.jpeg,.png" multiple maxFiles={100} maxSizeMB={50} files={files} onChange={f=>{setFiles(f);setResult([]);setError("")}} disabled={busy} kind="image"/>
  <p className="text-sm text-[var(--lx-muted)]">{c.lead}</p>
  {files.length>0&&<div className="space-y-2 rounded-xl border border-[var(--lx-line)] bg-[var(--lx-soft)] p-3 text-sm">
   {files.map((f,i)=><div key={f.name+"-"+f.lastModified} className="flex items-center gap-2"><span className="min-w-0 flex-1 truncate">{i+1}. {f.name}</span><button type="button" disabled={i===0||busy} onClick={()=>move(i,-1)} className="rounded-lg border px-2 py-1 text-xs">{c.up}</button><button type="button" disabled={i===files.length-1||busy} onClick={()=>move(i,1)} className="rounded-lg border px-2 py-1 text-xs">{c.down}</button><button type="button" disabled={busy} onClick={()=>setFiles(current=>current.filter((_,j)=>j!==i))} className="rounded-lg border px-2 py-1 text-xs">{c.remove}</button></div>)}
  </div>}
  {files.length>0&&<div className="grid gap-3 sm:grid-cols-3">
   <label className="space-y-1 text-sm"><span>{c.pageSize}</span><select disabled={busy} value={pageSize} onChange={e=>setPageSize(e.target.value as PageSize)} className="w-full rounded-xl border bg-[var(--lx-panel)] p-3"><option value="fit">{c.fit}</option><option value="a4">{c.a4}</option><option value="letter">{c.letter}</option></select></label>
   <label className="space-y-1 text-sm"><span>{c.orientation}</span><select disabled={busy} value={orientation} onChange={e=>setOrientation(e.target.value as Orientation)} className="w-full rounded-xl border bg-[var(--lx-panel)] p-3"><option value="auto">{c.auto}</option><option value="portrait">{c.portrait}</option><option value="landscape">{c.landscape}</option></select></label>
   <label className="space-y-1 text-sm"><span>{c.margin}</span><select disabled={busy} value={margin} onChange={e=>setMargin(e.target.value as Margin)} className="w-full rounded-xl border bg-[var(--lx-panel)] p-3"><option value="none">{c.none}</option><option value="small">{c.small}</option><option value="big">{c.big}</option></select></label>
  </div>}
  <button disabled={!files.length||busy} onClick={()=>void run()} className="rounded-xl bg-[var(--lx-ink)] px-5 py-2.5 text-sm text-[var(--lx-bg)] disabled:opacity-40">{busy?c.busy:c.run}</button>
  {!!result.length&&<ResultPanel files={result} messageZh={c.ready} messageEn={c.ready} details={{pages:files.length}}/>}
  {error&&<p role="alert" className="text-sm text-[var(--lx-danger)]">{error}</p>}
 </div>;
}
