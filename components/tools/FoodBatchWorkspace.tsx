"use client";
import {useEffect,useMemo,useState} from "react";
import {usePreferredCurrency} from "@/components/CurrencyPreferenceProvider";
import type {FoodVisionPrediction} from "@/lib/tools/food/image-recognition-local";

export type BatchRecognition={id:string;file:File;preview:string;predictions:FoodVisionPrediction[];status:"ready"|"checking"|"recognized"|"needs-confirmation"|"error"};
export default function FoodBatchWorkspace({onRecognize}:{onRecognize:(files:File[])=>Promise<Array<{file:File;predictions:FoodVisionPrediction[]}>>}){
 const{currency}=usePreferredCurrency();const[slots,setSlots]=useState<BatchRecognition[]>([]),[busy,setBusy]=useState(false),[msg,setMsg]=useState("");
 useEffect(()=>()=>{for(const s of slots)URL.revokeObjectURL(s.preview)},[slots]);
 const quantity=slots.length,total=useMemo(()=>quantity*3,[quantity]),price=currency==="CNY"?`¥${total}`:`$${total}`;
 function choose(files:FileList|null){
  if(!files)return;for(const s of slots)URL.revokeObjectURL(s.preview);
  const next=Array.from(files).map((file,i)=>({id:`${Date.now()}-${i}`,file,preview:URL.createObjectURL(file),predictions:[],status:"ready" as const}));
  setSlots(next);setMsg(next.length?`已选择 ${next.length} 张照片。先识别并逐张确认，确认后才会进入付款。`:"");
 }
 async function recognize(){
  if(!slots.length||busy)return;setBusy(true);setMsg(`正在逐张识别 ${slots.length} 张照片…`);
  try{
   const out=await onRecognize(slots.map(x=>x.file));
   setSlots(old=>old.map(s=>{const hit=out.find(x=>x.file===s.file);const predictions=hit?.predictions||[];return{...s,predictions,status:predictions.length?"needs-confirmation":"error"}}));
   setMsg("识别完成。请逐张确认食物和份量；没有确认前不会收费。");
  }catch{setMsg("这次没有全部识别成功，请重新尝试。")}
  finally{setBusy(false)}
 }
 return <section className="rounded-3xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-5">
  <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-lg font-semibold">一次分析多张照片</h3><p className="mt-1 text-sm text-[var(--lx-muted)]">选几张，就按几张计算。每张都会分别识别和确认。</p></div>{quantity>0&&<b>{price} · {quantity} 张</b>}</div>
  <input className="mt-4" type="file" accept="image/*" multiple onChange={e=>choose(e.target.files)}/>
  {quantity>0&&<div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">{slots.map((s,i)=><article key={s.id} className="overflow-hidden rounded-2xl border border-[var(--lx-line)]"><img src={s.preview} alt={`第 ${i+1} 张`} className="aspect-video w-full object-cover"/><div className="p-3"><b className="text-sm">第 {i+1} 张</b>{s.predictions.length>0?<div className="mt-2 flex flex-wrap gap-1.5">{s.predictions.slice(0,4).map(p=><span key={`${p.source}-${p.label}`} className="rounded-full bg-[var(--lx-soft)] px-2 py-1 text-xs">{p.label}</span>)}</div>:<p className="mt-2 text-xs text-[var(--lx-muted)]">{s.status==="error"?"暂时没有可靠结果":"等待识别"}</p>}</div></article>)}</div>}
  {msg&&<p className="mt-3 text-sm text-[var(--lx-muted)]">{msg}</p>}
  <div className="mt-4"><button onClick={()=>void recognize()} disabled={!quantity||busy} className="rounded-xl bg-[var(--lx-ink)] px-5 py-2.5 text-sm font-medium text-[var(--lx-bg)] disabled:opacity-40">{busy?"正在逐张识别…":quantity?`先识别这 ${quantity} 张`:"先选择照片"}</button></div>
  <p className="mt-2 text-xs text-[var(--lx-muted)]">¥3 / 张 · $3 / 张。确认食物和份量后才进入付款。</p>
 </section>
}