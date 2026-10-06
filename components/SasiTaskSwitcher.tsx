"use client";
import{useState}from"react";
import{useLingxiLang}from"@/lib/lingxi-i18n";
import type{SasiMode}from"@/lib/sasi/core/session-contract";
import {SASI_TASK_COPY} from "@/lib/sasi/task-ui-copy";
const IDS:SasiMode[]=["website","drama","book","learning","research"];
export default function SasiTaskSwitcher({mode,onSelect}:{mode:SasiMode;onSelect:(mode:SasiMode)=>void}){const{lang}=useLingxiLang();const c=SASI_TASK_COPY[lang];const[open,setOpen]=useState(false);return <div className="mx-auto w-full max-w-4xl px-2 pt-3 sm:px-4"><div className="relative inline-flex"><button type="button" aria-expanded={open} onKeyDown={e=>{if(e.key==="Escape")setOpen(false)}} onClick={()=>setOpen(v=>!v)} className="rounded-full border border-[var(--lx-line)] bg-[var(--lx-panel)] px-3 py-1.5 text-xs text-[var(--lx-muted)]">{c.change} · {c[mode]}⌄</button>{open&&<div className="absolute start-0 top-9 z-50 w-56 rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-2 shadow-[0_14px_48px_rgba(0,0,0,.16)]" onKeyDown={e=>{if(e.key==="Escape")setOpen(false)}}>{IDS.map(id=><button key={id} type="button" onClick={()=>{setOpen(false);onSelect(id)}} className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-start text-sm hover:bg-[var(--lx-soft)] ${id===mode?"font-semibold":""}`}><span>{c[id]}</span>{id===mode?<span>✓</span>:null}</button>)}</div>}</div></div>}
