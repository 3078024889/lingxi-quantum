"use client";
import {useEffect,useRef,useState} from "react";
import {useLingxiLang} from "@/lib/lingxi-i18n";

const words:Record<string,{erase:string,size:string,reset:string,hint:string}> = {
 zh:{erase:"手动擦除杂点",size:"橡皮擦大小",reset:"撤销本次擦除",hint:"用鼠标或手指擦掉剩余阴影、杂点。这里看到的效果会用于最终 PDF。"},
 en:{erase:"Erase unwanted marks",size:"Eraser size",reset:"Undo erasing",hint:"Remove leftover shadows or spots with your finger or mouse. This exact result will be used in the PDF."},
 ja:{erase:"不要な部分を消す",size:"消しゴムのサイズ",reset:"消去を元に戻す",hint:"指やマウスで影や汚れを消せます。表示された署名がPDFに使われます。"},
 ko:{erase:"불필요한 흔적 지우기",size:"지우개 크기",reset:"지우기 취소",hint:"손가락이나 마우스로 그림자와 얼룩을 지우세요. 보이는 서명이 PDF에 적용됩니다."},
 fr:{erase:"Effacer les marques",size:"Taille de la gomme",reset:"Annuler l’effacement",hint:"Effacez les taches avec le doigt ou la souris. Le résultat affiché sera placé dans le PDF."},
 de:{erase:"Unerwünschte Spuren entfernen",size:"Radiergummigröße",reset:"Radieren rückgängig",hint:"Schatten und Flecken mit Finger oder Maus entfernen. Das Ergebnis wird im PDF verwendet."},
 es:{erase:"Borrar marcas",size:"Tamaño del borrador",reset:"Deshacer borrado",hint:"Quita las manchas con el dedo o el ratón. El resultado mostrado se colocará en el PDF."},
 pt:{erase:"Apagar marcas",size:"Tamanho da borracha",reset:"Desfazer apagamento",hint:"Apague manchas com o dedo ou mouse. O resultado exibido será usado no PDF."},
 ar:{erase:"مسح العلامات الزائدة",size:"حجم الممحاة",reset:"التراجع عن المسح",hint:"امسح البقع بإصبعك أو بالماوس. سيُستخدم هذا التوقيع في ملف PDF."}
};
export default function HandwrittenSignatureCleanup({source,onChange}:{source:string;onChange:(next:string)=>void}){
 const {lang}=useLingxiLang(),t=words[lang]||words.en;
 const canvas=useRef<HTMLCanvasElement>(null),active=useRef(false),initial=useRef<string>(source),previous=useRef<{x:number;y:number}|null>(null);
 const [width,setWidth]=useState(14);
 useEffect(()=>{
  const target=canvas.current;if(!target)return;
  let alive=true;
  const image=new Image();
  image.onload=()=>{
   if(!alive)return;
   target.width=image.naturalWidth;target.height=image.naturalHeight;
   const context=target.getContext("2d",{willReadFrequently:true});
   if(!context)return;
   context.clearRect(0,0,target.width,target.height);context.drawImage(image,0,0);
  };
  image.src=source;return()=>{alive=false};
 },[source]);
 function erase(event:React.PointerEvent<HTMLCanvasElement>){
  if(!active.current)return;
  const target=canvas.current,ctx=target?.getContext("2d");if(!target||!ctx)return;
  const rect=target.getBoundingClientRect();
  if(rect.width<=0||rect.height<=0)return;
  const x=(event.clientX-rect.left)*target.width/rect.width,y=(event.clientY-rect.top)*target.height/rect.height;
  ctx.save();ctx.globalCompositeOperation="destination-out";ctx.strokeStyle="#000";ctx.lineCap="round";ctx.lineJoin="round";
  const radius=Math.max(2,Math.min(target.width,target.height)*width/300);
  ctx.lineWidth=radius*2;
  ctx.beginPath();ctx.moveTo(previous.current?.x??x,previous.current?.y??y);ctx.lineTo(x,y);ctx.stroke();
  // A stationary pointer tap must still erase ink.
  ctx.beginPath();ctx.arc(x,y,radius,0,Math.PI*2);ctx.fill();
  ctx.restore();previous.current={x,y};
 }
 function finish(event:React.PointerEvent<HTMLCanvasElement>){
  if(!active.current)return;
  erase(event);active.current=false;previous.current=null;
  try{if(canvas.current)onChange(canvas.current.toDataURL("image/png"))}catch{}
 }
 function reset(){onChange(initial.current)}
 return <div className="space-y-2" data-testid="signature-manual-cleanup">
  <b className="text-sm">{t.erase}</b>
  <p className="text-xs opacity-75">{t.hint}</p>
  <canvas ref={canvas} aria-label={t.erase} role="img" onPointerDown={e=>{active.current=true;previous.current=null;e.currentTarget.setPointerCapture(e.pointerId);erase(e)}} onPointerMove={erase} onPointerUp={finish} onPointerCancel={()=>{active.current=false;previous.current=null}} className="mx-auto block max-h-56 w-full max-w-lg rounded-lg border touch-none cursor-crosshair" style={{backgroundColor:"#f7f7f7",backgroundImage:"linear-gradient(45deg,#ddd 25%,transparent 25%),linear-gradient(-45deg,#ddd 25%,transparent 25%)",backgroundSize:"16px 16px"}}/>
  <div className="flex flex-wrap items-center gap-3"><label className="text-sm">{t.size} <input aria-label={t.size} type="range" min="4" max="35" value={width} onChange={e=>setWidth(Number(e.target.value))}/></label>
  <button type="button" className="rounded-lg border px-3 py-2 text-sm" onClick={reset}>{t.reset}</button></div>
 </div>;
}
