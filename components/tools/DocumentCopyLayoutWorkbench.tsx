"use client";
import {useMemo,useState} from "react";
import {PDFDocument} from "pdf-lib";
import FileDropzone from "@/components/tools/FileDropzone";
import ResultPanel from "@/components/tools/ResultPanel";
import {useLingxiLang,type LingxiLang} from "@/lib/lingxi-i18n";
import type {ToolResultFile} from "@/lib/tools/types";

function read(f:File){return new Promise<HTMLImageElement>((res,rej)=>{const url=URL.createObjectURL(f),im=new Image();im.onload=()=>{URL.revokeObjectURL(url);res(im)};im.onerror=()=>{URL.revokeObjectURL(url);rej(new Error("IMAGE_LOAD_FAILED"))};im.src=url})}
type C={front:string;back:string;purpose:string;purposeDefault:string;run:string;busy:string;ready:string;lead:string;error:string};
const D:Record<LingxiLang,C>={
 zh:{front:"上传正面",back:"上传反面（可选）",purpose:"用途文字",purposeDefault:"仅用于本次业务办理",run:"生成 A4 PDF",busy:"正在生成…",ready:"A4 复印件已经生成，可以先核对排版和用途水印再下载。",lead:"当前完成 A4 排版与用途水印。自动裁边和透视矫正尚未接入真实边缘检测，因此不会冒充已经完成。",error:"文档复印件生成没有完成"},
 en:{front:"Upload front",back:"Upload back (optional)",purpose:"Purpose text",purposeDefault:"For this transaction only",run:"Create A4 PDF",busy:"Creating…",ready:"The A4 copy is ready. Review the layout and purpose watermark before downloading.",lead:"This tool currently provides A4 layout and a purpose watermark. Auto-cropping and perspective correction are not claimed until real edge detection is integrated.",error:"Document copy creation did not finish"},
 ja:{front:"表面をアップロード",back:"裏面をアップロード（任意）",purpose:"用途文字",purposeDefault:"今回の手続きにのみ使用",run:"A4 PDF を生成",busy:"生成中…",ready:"A4 コピーを生成しました。レイアウトと用途透かしを確認してダウンロードできます。",lead:"現在は A4 レイアウトと用途透かしに対応しています。自動切り抜き・遠近補正は実際の輪郭検出を接続するまで完了扱いにしません。",error:"文書コピーを生成できませんでした"},
 ko:{front:"앞면 업로드",back:"뒷면 업로드 (선택)",purpose:"용도 문구",purposeDefault:"이번 업무 처리에만 사용",run:"A4 PDF 생성",busy:"생성 중…",ready:"A4 사본이 완성되었습니다. 배치와 용도 워터마크를 확인한 뒤 다운로드하세요.",lead:"현재 A4 배치와 용도 워터마크를 제공합니다. 실제 가장자리 감지가 연결되기 전까지 자동 재단/원근 보정을 완료 기능으로 표시하지 않습니다.",error:"문서 사본 생성을 완료하지 못했습니다"},
 fr:{front:"Importer le recto",back:"Importer le verso (facultatif)",purpose:"Texte d’usage",purposeDefault:"Uniquement pour cette démarche",run:"Créer le PDF A4",busy:"Création…",ready:"La copie A4 est prête. Vérifiez la mise en page et le filigrane avant de télécharger.",lead:"Le format A4 et le filigrane d’usage sont disponibles. Le recadrage automatique et la correction de perspective ne seront pas annoncés comme terminés avant une vraie détection des bords.",error:"La copie du document n’a pas pu être créée"},
 de:{front:"Vorderseite hochladen",back:"Rückseite hochladen (optional)",purpose:"Verwendungszweck",purposeDefault:"Nur für diesen Vorgang",run:"A4-PDF erstellen",busy:"Erstellung…",ready:"Die A4-Kopie ist fertig. Layout und Zweck-Wasserzeichen vor dem Download prüfen.",lead:"Aktuell gibt es A4-Layout und Zweck-Wasserzeichen. Automatisches Zuschneiden und Perspektivkorrektur werden erst nach echter Kantenerkennung als fertig bezeichnet.",error:"Dokumentkopie konnte nicht erstellt werden"},
 es:{front:"Subir anverso",back:"Subir reverso (opcional)",purpose:"Texto de uso",purposeDefault:"Solo para este trámite",run:"Crear PDF A4",busy:"Creando…",ready:"La copia A4 está lista. Revisa el diseño y la marca de uso antes de descargar.",lead:"Actualmente ofrece diseño A4 y marca de uso. El recorte automático y la corrección de perspectiva no se presentarán como completos hasta integrar detección real de bordes.",error:"No se pudo crear la copia"},
 pt:{front:"Enviar frente",back:"Enviar verso (opcional)",purpose:"Texto de finalidade",purposeDefault:"Somente para este procedimento",run:"Criar PDF A4",busy:"Criando…",ready:"A cópia A4 está pronta. Revise o layout e a marca de finalidade antes de baixar.",lead:"Atualmente oferece layout A4 e marca de finalidade. Corte automático e correção de perspectiva só serão marcados como concluídos após integração de detecção real de bordas.",error:"Não foi possível criar a cópia"},
 ar:{front:"رفع الوجه الأمامي",back:"رفع الوجه الخلفي (اختياري)",purpose:"نص الغرض",purposeDefault:"للاستخدام في هذه المعاملة فقط",run:"إنشاء PDF بحجم A4",busy:"جارٍ الإنشاء…",ready:"نسخة A4 جاهزة. راجع التنسيق والعلامة قبل التنزيل.",lead:"يوفر حاليًا تنسيق A4 وعلامة الغرض. لن يتم الادعاء باكتمال القص التلقائي وتصحيح المنظور قبل دمج كشف حقيقي للحواف.",error:"تعذر إنشاء نسخة المستند"}
};

export default function DocumentCopyLayoutWorkbench(){
 const{lang}=useLingxiLang();const c=D[lang]??D.en;
 const[front,setFront]=useState<File[]>([]),[back,setBack]=useState<File[]>([]),[purpose,setPurpose]=useState(c.purposeDefault),[busy,setBusy]=useState(false),[error,setError]=useState(""),[result,setResult]=useState<ToolResultFile[]>([]);
 const frontFile=front[0]||null,backFile=back[0]||null;
 async function run(){
  if(!frontFile)return;setBusy(true);setError("");setResult([]);
  try{
   const canvas=document.createElement("canvas");canvas.width=1240;canvas.height=1754;const ctx=canvas.getContext("2d")!;ctx.fillStyle="#fff";ctx.fillRect(0,0,canvas.width,canvas.height);
   const imgs=[await read(frontFile),...(backFile?[await read(backFile)]:[])];
   imgs.forEach((im,i)=>{const maxW=760,maxH=430,scale=Math.min(maxW/im.naturalWidth,maxH/im.naturalHeight),w=im.naturalWidth*scale,h=im.naturalHeight*scale;ctx.drawImage(im,(canvas.width-w)/2,220+i*560,w,h)});
   ctx.save();ctx.translate(canvas.width/2,canvas.height/2);ctx.rotate(-Math.PI/8);ctx.fillStyle="rgba(185,28,28,.18)";ctx.font="bold 48px sans-serif";ctx.textAlign="center";
   for(let yy=-600;yy<=600;yy+=170)for(let xx=-700;xx<=700;xx+=560)ctx.fillText(purpose.trim()||c.purposeDefault,xx,yy);
   ctx.restore();
   const jpg=await new Promise<Blob>((res,rej)=>canvas.toBlob(b=>b?res(b):rej(new Error("EXPORT_FAILED")),"image/jpeg",.94));
   const pdf=await PDFDocument.create(),img=await pdf.embedJpg(await jpg.arrayBuffer()),page=pdf.addPage([595.28,841.89]);page.drawImage(img,{x:0,y:0,width:595.28,height:841.89});
   const bytes=await pdf.save(),copy=new Uint8Array(bytes.length);copy.set(bytes);const blob=new Blob([copy.buffer],{type:"application/pdf"});
   setResult([{name:"lingxifield-document-copy.pdf",blob,mime:"application/pdf",size:blob.size}]);canvas.width=1;canvas.height=1;
  }catch(e){setError(e instanceof Error?e.message:String(e))}
  finally{setBusy(false)}
 }
 const details=useMemo(()=>({sides:backFile?2:1}),[backFile]);
 return <div className="space-y-4">
  <div className="grid gap-3 sm:grid-cols-2">
   <div><p className="mb-2 text-sm text-[var(--lx-muted)]">{c.front}</p><FileDropzone accept="image/*" files={front} onChange={f=>{setFront(f);setResult([])}} disabled={busy} kind="image" maxSizeMB={30}/></div>
   <div><p className="mb-2 text-sm text-[var(--lx-muted)]">{c.back}</p><FileDropzone accept="image/*" files={back} onChange={f=>{setBack(f);setResult([])}} disabled={busy} kind="image" maxSizeMB={30}/></div>
  </div>
  <label className="block text-sm text-[var(--lx-muted)]">{c.purpose}<input value={purpose} onChange={e=>setPurpose(e.target.value)} className="mt-1 w-full rounded-xl border border-[var(--lx-line)] bg-[var(--lx-panel)] px-3 py-2.5 text-[var(--lx-ink)]"/></label>
  <button disabled={!frontFile||busy} onClick={run} className="rounded-xl bg-[var(--lx-ink)] px-5 py-2.5 text-sm text-[var(--lx-bg)] disabled:opacity-40">{busy?c.busy:c.run}</button>
  <p className="text-xs leading-5 text-[var(--lx-muted)]">{c.lead}</p>
  {!!result.length&&<ResultPanel files={result} messageZh={c.ready} messageEn={c.ready} details={details}/>}
  {error&&<p role="alert" className="text-sm text-[var(--lx-danger)]">{c.error} · {error}</p>}
 </div>;
}
