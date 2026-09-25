"use client";
import NextImage from "next/image";
import {PointerEvent,useEffect,useRef,useState} from "react";
import FileDropzone from "@/components/tools/FileDropzone";
import ResultPanel from "@/components/tools/ResultPanel";
import {useLingxiLang,type LingxiLang} from "@/lib/lingxi-i18n";
import type {ToolResultFile} from "@/lib/tools/types";

type Box={x:number;y:number;w:number;h:number;mode:"blur"|"black"};
type C={blur:string;black:string;clear:string;export:string;busy:string;ready:string;error:string;lead:string};
const D:Record<LingxiLang,C>={
 zh:{blur:"模糊",black:"黑块遮盖",clear:"清空",export:"生成隐私截图",busy:"正在生成…",ready:"隐私截图已生成，可以核对后下载。",error:"截图处理没有完成",lead:"在姓名、证件号、地址、聊天内容或账号信息上拖动框选。"},
 en:{blur:"Blur",black:"Black redact",clear:"Clear",export:"Create privacy-safe screenshot",busy:"Creating…",ready:"The privacy-safe screenshot is ready. Review it before downloading.",error:"Screenshot processing did not finish",lead:"Draw boxes over names, IDs, addresses, chats or account numbers."},
 ja:{blur:"ぼかし",black:"黒塗り",clear:"クリア",export:"プライバシー画像を生成",busy:"生成中…",ready:"プライバシー画像を生成しました。確認してからダウンロードできます。",error:"画像処理を完了できませんでした",lead:"氏名、ID、住所、チャット、口座情報などをドラッグして隠します。"},
 ko:{blur:"흐림",black:"검정 가림",clear:"지우기",export:"개인정보 보호 이미지 생성",busy:"생성 중…",ready:"개인정보 보호 이미지가 준비되었습니다. 확인 후 다운로드하세요.",error:"스크린샷 처리를 완료하지 못했습니다",lead:"이름, 신분증 번호, 주소, 채팅 또는 계정 정보를 드래그해 가리세요."},
 fr:{blur:"Flou",black:"Masque noir",clear:"Effacer",export:"Créer la capture protégée",busy:"Création…",ready:"La capture protégée est prête. Vérifiez-la avant de télécharger.",error:"Le traitement n’a pas abouti",lead:"Tracez des zones sur les noms, identifiants, adresses, discussions ou numéros de compte."},
 de:{blur:"Weichzeichnen",black:"Schwarz schwärzen",clear:"Leeren",export:"Datenschutz-Screenshot erstellen",busy:"Erstellung…",ready:"Der Datenschutz-Screenshot ist fertig. Vor dem Download prüfen.",error:"Screenshot-Verarbeitung fehlgeschlagen",lead:"Bereiche über Namen, IDs, Adressen, Chats oder Kontonummern markieren."},
 es:{blur:"Desenfocar",black:"Ocultar en negro",clear:"Limpiar",export:"Crear captura protegida",busy:"Creando…",ready:"La captura protegida está lista. Revísala antes de descargar.",error:"No se pudo completar el tratamiento",lead:"Marca nombres, documentos, direcciones, chats o números de cuenta."},
 pt:{blur:"Desfocar",black:"Ocultar em preto",clear:"Limpar",export:"Criar captura protegida",busy:"Criando…",ready:"A captura protegida está pronta. Revise antes de baixar.",error:"Não foi possível concluir o processamento",lead:"Marque nomes, documentos, endereços, conversas ou números de conta."},
 ar:{blur:"تمويه",black:"إخفاء بالأسود",clear:"مسح",export:"إنشاء لقطة تحمي الخصوصية",busy:"جارٍ الإنشاء…",ready:"لقطة الخصوصية جاهزة. راجعها قبل التنزيل.",error:"تعذر إكمال معالجة الصورة",lead:"حدد الأسماء أو أرقام الهوية أو العناوين أو المحادثات أو أرقام الحسابات."}
};

export default function ScreenshotRedactWorkbench(){
 const{lang}=useLingxiLang();const c=D[lang]??D.en;
 const[files,setFiles]=useState<File[]>([]),[src,setSrc]=useState(""),[boxes,setBoxes]=useState<Box[]>([]),[mode,setMode]=useState<"blur"|"black">("blur"),[busy,setBusy]=useState(false),[error,setError]=useState(""),[result,setResult]=useState<ToolResultFile[]>([]);
 const wrap=useRef<HTMLDivElement>(null),start=useRef<{x:number;y:number}|null>(null),current=useRef<Box|null>(null),file=files[0]||null;
 useEffect(()=>()=>{if(src)URL.revokeObjectURL(src)},[src]);
 function choose(next:File[]){
  if(src)URL.revokeObjectURL(src);setFiles(next);setBoxes([]);setResult([]);setError("");
  setSrc(next[0]?URL.createObjectURL(next[0]):"");
 }
 function pt(e:PointerEvent){const r=wrap.current!.getBoundingClientRect();return{x:Math.max(0,Math.min(1,(e.clientX-r.left)/r.width)),y:Math.max(0,Math.min(1,(e.clientY-r.top)/r.height))}}
 async function exportImg(){
  if(!file)return;setBusy(true);setError("");setResult([]);
  let bmp:ImageBitmap|null=null;
  try{
   bmp=await createImageBitmap(file);const canvas=document.createElement("canvas");canvas.width=bmp.width;canvas.height=bmp.height;const ctx=canvas.getContext("2d")!;ctx.drawImage(bmp,0,0);
   for(const b of boxes){
    const X=Math.round(b.x*canvas.width),Y=Math.round(b.y*canvas.height),W=Math.round(b.w*canvas.width),H=Math.round(b.h*canvas.height);
    if(b.mode==="black"){ctx.fillStyle="#000";ctx.fillRect(X,Y,W,H)}
    else{
     const pad=20,sx=Math.max(0,X-pad),sy=Math.max(0,Y-pad),sw=Math.min(canvas.width-sx,W+pad*2),sh=Math.min(canvas.height-sy,H+pad*2),tmp=document.createElement("canvas");
     tmp.width=sw;tmp.height=sh;tmp.getContext("2d")!.drawImage(canvas,sx,sy,sw,sh,0,0,sw,sh);ctx.save();ctx.filter="blur(18px)";ctx.drawImage(tmp,sx,sy,sw,sh);ctx.restore();tmp.width=1;tmp.height=1;
    }
   }
   const out=await new Promise<Blob>((res,rej)=>canvas.toBlob(b=>b?res(b):rej(new Error("EXPORT_FAILED")),"image/png"));
   setResult([{name:"redacted-"+file.name.replace(/\.[^.]+$/,"")+".png",blob:out,mime:"image/png",size:out.size}]);canvas.width=1;canvas.height=1;
  }catch(e){setError(e instanceof Error?e.message:String(e))}
  finally{bmp?.close?.();setBusy(false)}
 }
 return <div className="space-y-4">
  <FileDropzone accept="image/*" files={files} onChange={choose} disabled={busy} kind="image" maxSizeMB={30}/>
  <p className="text-sm text-[var(--lx-muted)]">{c.lead}</p>
  <div className="flex flex-wrap gap-2">
   <button onClick={()=>setMode("blur")} className={`rounded-full px-4 py-2 text-sm ${mode==="blur"?"bg-[var(--lx-ink)] text-[var(--lx-bg)]":"border border-[var(--lx-line)] text-[var(--lx-ink)]"}`}>{c.blur}</button>
   <button onClick={()=>setMode("black")} className={`rounded-full px-4 py-2 text-sm ${mode==="black"?"bg-[var(--lx-ink)] text-[var(--lx-bg)]":"border border-[var(--lx-line)] text-[var(--lx-ink)]"}`}>{c.black}</button>
   <button onClick={()=>{setBoxes([]);setResult([])}} className="rounded-full border border-[var(--lx-line)] px-4 py-2 text-sm text-[var(--lx-ink)]">{c.clear}</button>
  </div>
  {src&&<div ref={wrap} className="relative mx-auto w-fit max-w-full touch-none overflow-hidden rounded-xl border border-[var(--lx-line)]" onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);const p=pt(e);start.current=p;current.current={x:p.x,y:p.y,w:0,h:0,mode};setBoxes(v=>[...v,current.current!])}} onPointerMove={e=>{if(!start.current||!current.current)return;const p=pt(e),s=start.current,b={x:Math.min(s.x,p.x),y:Math.min(s.y,p.y),w:Math.abs(p.x-s.x),h:Math.abs(p.y-s.y),mode} as Box;current.current=b;setBoxes(v=>[...v.slice(0,-1),b])}} onPointerUp={()=>{start.current=null;current.current=null}}><NextImage src={src} alt="" className="block max-h-[680px] max-w-full select-none" width={1600} height={1200} unoptimized/>{boxes.map((b,i)=><div key={i} className={`pointer-events-none absolute ${b.mode==="black"?"bg-black":"backdrop-blur-md bg-white/10"} border border-[var(--lx-line-strong)]`} style={{left:`${b.x*100}%`,top:`${b.y*100}%`,width:`${b.w*100}%`,height:`${b.h*100}%`}}/>)}</div>}
  <button disabled={!file||!boxes.length||busy} onClick={exportImg} className="rounded-xl bg-[var(--lx-ink)] px-5 py-2.5 text-sm text-[var(--lx-bg)] disabled:opacity-40">{busy?c.busy:c.export}</button>
  {!!result.length&&<ResultPanel files={result} messageZh={c.ready} messageEn={c.ready}/>}
  {error&&<p role="alert" className="text-sm text-[var(--lx-danger)]">{c.error} · {error}</p>}
 </div>;
}
