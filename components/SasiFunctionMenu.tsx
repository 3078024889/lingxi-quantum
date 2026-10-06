"use client";

import {useEffect,useId,useRef,useState,type ReactNode} from "react";
import Link from "next/link";
import {FUNCTION_OPTIONS,type FunctionTask} from "@/lib/sasi/function-options";
import {useLingxiLang} from "@/lib/lingxi-i18n";
import {localizedFunctionOptions,functionMenuText} from "@/lib/sasi/function-menu-i18n";

export default function SasiFunctionMenu({
 task,selected,onChange,onUpload,disabled=false,extraContent
}:{task:FunctionTask;selected:string[];onChange:(ids:string[])=>void;onUpload?:()=>void;disabled?:boolean;extraContent?:ReactNode}){
 const{lang}=useLingxiLang();
 const mt=(key:Parameters<typeof functionMenuText>[1])=>functionMenuText(lang,key);
 const[open,setOpen]=useState(false);
 const[maxHeight,setMaxHeight]=useState(300);
 const root=useRef<HTMLDivElement>(null);
 const trigger=useRef<HTMLButtonElement>(null);
 const id=useId();
 const options=localizedFunctionOptions(task,lang,FUNCTION_OPTIONS);

 useEffect(()=>{
  if(!open)return;
  const outside=(event:PointerEvent)=>{if(!root.current?.contains(event.target as Node))setOpen(false)};
  const escape=(event:KeyboardEvent)=>{if(event.key==="Escape"){setOpen(false);trigger.current?.focus()}};
  document.addEventListener("pointerdown",outside);
  document.addEventListener("keydown",escape);
  return()=>{document.removeEventListener("pointerdown",outside);document.removeEventListener("keydown",escape)};
 },[open]);
 useEffect(()=>{if(disabled)setOpen(false)},[disabled]);

 return <div ref={root} className="relative">
  <button ref={trigger} type="button" disabled={disabled} aria-label={mt("add")} aria-expanded={open} aria-controls={id}
   onClick={()=>{setMaxHeight(Math.max(120,Math.min(460,(trigger.current?.getBoundingClientRect().top??400)-88)));setOpen(v=>!v)}}
   className="grid h-10 w-10 place-items-center rounded-full text-2xl transition hover:bg-[var(--lx-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">＋</button>
  {open&&<div id={id} role="region" aria-label={mt("add")} style={{maxHeight}} className="absolute bottom-12 start-0 z-50 flex w-[min(340px,calc(100vw-64px))] flex-col rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-2 shadow-[0_12px_48px_rgba(0,0,0,.16)]">
   {onUpload&&<button type="button" className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm hover:bg-[var(--lx-soft)]"
    onClick={()=>{setOpen(false);onUpload()}}>
    <span aria-hidden>↥</span><span>{mt("upload")}<span className="mt-0.5 block text-xs text-[var(--lx-muted)]">{mt("uploadLead")}</span></span>
   </button>}
   <div className="min-h-0 overflow-y-auto"><div className="px-3 pb-2 pt-3 text-xs text-[var(--lx-muted)]">{mt("choose")}</div>
   {options.map(option=><label key={option.id} className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-[var(--lx-soft)]">
    <input type="checkbox" className="h-4 w-4 accent-violet-600" checked={selected.includes(option.id)}
      onChange={()=>onChange(selected.includes(option.id)?selected.filter(x=>x!==option.id):[...selected,option.id])}/>
    <span className="text-sm">{option.label}<span className="mt-0.5 block text-xs text-[var(--lx-muted)]">{option.description}</span></span>
   </label>)}
   {extraContent&&<div className="mt-2 border-t border-[var(--lx-line)] px-2 py-2">{extraContent}</div>}</div>
   <div className="mt-2 border-t border-[var(--lx-line)] pt-1">
    <Link href="/sasi/connections" className="block rounded-xl px-3 py-3 text-sm hover:bg-[var(--lx-soft)]">{mt("connect")} <span aria-hidden className="float-right">↗</span></Link>
   </div>
  </div>}
 </div>;
}

export function SasiSelectedFunctions({task,selected,onChange,disabled=false}:{task:FunctionTask;selected:string[];onChange:(ids:string[])=>void;disabled?:boolean}){
 const{lang}=useLingxiLang();
 const mt=(key:Parameters<typeof functionMenuText>[1])=>functionMenuText(lang,key);
 const options=localizedFunctionOptions(task,lang,FUNCTION_OPTIONS);
 return <div className="flex flex-wrap gap-2" aria-label={mt("selected")}>
  {options.filter(x=>selected.includes(x.id)).map(x=><button key={x.id} type="button" disabled={disabled}
   aria-label={`${mt("remove")} ${x.label}`} onClick={()=>onChange(selected.filter(id=>id!==x.id))}
   className="rounded-full border border-violet-300/40 bg-violet-500/5 px-3 py-1.5 text-xs">
   {x.label}<span aria-hidden className="ml-2 opacity-50">×</span>
  </button>)}
 </div>;
}
