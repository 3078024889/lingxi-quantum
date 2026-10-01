"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
import {useLingxiLang} from "@/lib/lingxi-i18n";
import {moneyText} from "@/lib/notifications/money-copy";
type Item={eventKey:string;kind:string;title:string;body:string;createdAt:string;href?:string;read?:boolean};
export default function AccountNotificationsPanel(){
 const {lang}=useLingxiLang();
 const[items,setItems]=useState<Item[]>([]);const[loading,setLoading]=useState(true);const[error,setError]=useState(false);
 async function load(){try{const r=await fetch(`/api/account/notifications?lang=${lang}`,{cache:"no-store"});const d=await r.json();if(!r.ok||d.partial)throw new Error();setItems(Array.isArray(d.items)?d.items:[]);setError(false)}catch{setError(true)}finally{setLoading(false)}}
 useEffect(()=>{void load();const timer=setInterval(load,30000);return()=>clearInterval(timer)},[lang]);
 async function mark(x:Item){if(x.read)return;try{const r=await fetch("/api/account/notifications",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({eventKeys:[x.eventKey]})});if(r.ok){setItems(v=>v.map(i=>i.eventKey===x.eventKey?{...i,read:true}:i));window.dispatchEvent(new Event('lingxi-money-updated'))}}catch{setError(true)}}
 if(loading)return <p className="text-sm text-[var(--lx-muted)]">{moneyText(lang,"loading")}</p>;
 if(error)return <p role="alert">{moneyText(lang,'unavailable')} <button className="underline" onClick={()=>void load()}>{moneyText(lang,'refresh')}</button></p>;
 if(!items.length)return <div className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-6 text-sm text-[var(--lx-muted)]">{moneyText(lang,"empty")}</div>;
 return <div className="space-y-3">{items.map(x=><div key={x.eventKey} className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-5">
  <div className="flex items-start justify-between gap-4"><div><b className="text-[var(--lx-ink)]">{x.title}</b><p className="mt-2 text-sm leading-6 text-[var(--lx-muted)]">{x.body}</p><p className="mt-2 text-xs text-[var(--lx-faint)]">{new Date(x.createdAt).toLocaleString(lang)}</p></div>{!x.read&&<span className="text-xs">●</span>}</div>
  {x.href&&<Link onClick={()=>mark(x)} href={x.href} className="mt-3 inline-block text-sm underline">{moneyText(lang,"details")} →</Link>}
  {!x.read&&!x.href&&<button onClick={()=>mark(x)} className="mt-3 text-sm underline">{moneyText(lang,"read")}</button>}
 </div>)}</div>
}
