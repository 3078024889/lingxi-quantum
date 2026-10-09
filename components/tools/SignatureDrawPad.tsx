"use client";
import {useRef,useState} from "react";
import {useLingxiLang} from "@/lib/lingxi-i18n";
const labels:Record<string,{title:string,clear:string,undo:string,apply:string,empty:string,hint:string}>={
 zh:{title:"在这里手写签名",clear:"清空",undo:"撤销一笔",apply:"放入 PDF",empty:"请先写下签名。",hint:"用鼠标、触控笔或手指直接签字，无需拍照。"},
 en:{title:"Draw your signature",clear:"Clear",undo:"Undo stroke",apply:"Place in PDF",empty:"Draw your signature first.",hint:"Sign with a mouse, stylus or finger. No photo needed."},
 ja:{title:"ここに署名を書く",clear:"消去",undo:"1画戻す",apply:"PDFに配置",empty:"先に署名を書いてください。",hint:"マウス、ペン、指で直接署名できます。"},
 ko:{title:"여기에 서명하세요",clear:"지우기",undo:"획 실행 취소",apply:"PDF에 넣기",empty:"먼저 서명해 주세요.",hint:"마우스, 펜 또는 손가락으로 직접 서명하세요."},
 fr:{title:"Dessinez votre signature",clear:"Effacer",undo:"Annuler un trait",apply:"Placer dans le PDF",empty:"Dessinez d’abord votre signature.",hint:"Signez avec souris, stylet ou doigt, sans photo."},
 de:{title:"Unterschrift zeichnen",clear:"Löschen",undo:"Strich zurück",apply:"In PDF einfügen",empty:"Bitte zuerst unterschreiben.",hint:"Mit Maus, Stift oder Finger unterschreiben, ohne Foto."},
 es:{title:"Dibuja tu firma",clear:"Borrar",undo:"Deshacer trazo",apply:"Colocar en PDF",empty:"Primero dibuja tu firma.",hint:"Firma con ratón, lápiz o dedo, sin foto."},
 pt:{title:"Desenhe sua assinatura",clear:"Limpar",undo:"Desfazer traço",apply:"Colocar no PDF",empty:"Desenhe sua assinatura primeiro.",hint:"Assine com mouse, caneta ou dedo, sem foto."},
 ar:{title:"ارسم توقيعك",clear:"مسح",undo:"تراجع عن خط",apply:"إضافة إلى PDF",empty:"ارسم توقيعك أولاً.",hint:"وقّع بالماوس أو القلم أو الإصبع، دون صورة."}
};
export default function SignatureDrawPad({onApply}:{onApply:(image:string,ratio:number)=>void}){
 const {lang}=useLingxiLang(),t=labels[lang]||labels.en;
 const canvas=useRef<HTMLCanvasElement>(null),active=useRef(false),last=useRef<{x:number;y:number}|null>(null),history=useRef<ImageData[]>([]);
 const [strokes,setStrokes]=useState(0),[error,setError]=useState("");
 const draw=(event:React.PointerEvent<HTMLCanvasElement>)=>{
  if(!active.current||!canvas.current)return;
  const c=canvas.current,ctx=c.getContext("2d");if(!ctx)return;
  const rect=c.getBoundingClientRect(),x=(event.clientX-rect.left)*c.width/rect.width,y=(event.clientY-rect.top)*c.height/rect.height;
  ctx.strokeStyle="#142b59";ctx.lineWidth=3.4;ctx.lineCap="round";ctx.lineJoin="round";
  ctx.beginPath();ctx.moveTo(last.current?.x??x,last.current?.y??y);ctx.lineTo(x,y);ctx.stroke();
  last.current={x,y};
 };
 const clear=()=>{const c=canvas.current;c?.getContext("2d")?.clearRect(0,0,c.width,c.height);history.current=[];setStrokes(0);setError("")};
 const undo=()=>{const ctx=canvas.current?.getContext("2d"),prior=history.current.pop();if(!ctx||!canvas.current||!prior)return;ctx.putImageData(prior,0,0);setStrokes(history.current.length);setError("")};
 const apply=()=>{
  const c=canvas.current;if(!c||!strokes){setError(t.empty);return}
  const ctx=c.getContext("2d");if(!ctx)return;
  const a=ctx.getImageData(0,0,c.width,c.height).data;
  let x0=c.width,y0=c.height,x1=-1,y1=-1;
  for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++)if(a[(y*c.width+x)*4+3]>8){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y)}
  if(x1<x0){setError(t.empty);return}
  const pad=12,w=Math.min(c.width,x1+pad+1)-Math.max(0,x0-pad),h=Math.min(c.height,y1+pad+1)-Math.max(0,y0-pad);
  const cropped=document.createElement("canvas");cropped.width=w;cropped.height=h;
  cropped.getContext("2d")?.drawImage(c,Math.max(0,x0-pad),Math.max(0,y0-pad),w,h,0,0,w,h);
  onApply(cropped.toDataURL("image/png"),w/h);setError("");
 };
 return <section className="space-y-3 rounded-xl border p-4" data-testid="signature-draw-pad">
  <b>{t.title}</b><p className="text-xs opacity-70">{t.hint}</p>
  <canvas ref={canvas} width={560} height={180} role="img" aria-label={t.title} className="block w-full max-w-2xl rounded-lg border bg-white touch-none cursor-crosshair" onPointerDown={e=>{
   const ctx=e.currentTarget.getContext("2d");if(!ctx)return;
   history.current.push(ctx.getImageData(0,0,e.currentTarget.width,e.currentTarget.height));active.current=true;last.current=null;
   e.currentTarget.setPointerCapture(e.pointerId);draw(e);
  }} onPointerMove={draw} onPointerUp={e=>{draw(e);active.current=false;last.current=null;setStrokes(history.current.length)}} onPointerCancel={()=>{active.current=false;last.current=null}}/>
  <div className="flex flex-wrap gap-2"><button type="button" onClick={undo} disabled={!strokes} className="rounded-lg border px-3 py-2 text-sm">{t.undo}</button><button type="button" onClick={clear} className="rounded-lg border px-3 py-2 text-sm">{t.clear}</button><button type="button" onClick={apply} className="rounded-lg border px-3 py-2 text-sm">{t.apply}</button></div>
  {error&&<p role="alert" className="text-sm text-rose-600">{error}</p>}
 </section>;
}
