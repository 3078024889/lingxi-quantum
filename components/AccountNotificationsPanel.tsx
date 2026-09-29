"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
type Item={eventKey:string;kind:string;title:string;body:string;createdAt:string;href?:string;read?:boolean};
export default function AccountNotificationsPanel(){
 const[items,setItems]=useState<Item[]>([]);const[loading,setLoading]=useState(true);
 async function load(){setLoading(true);try{const r=await fetch("/api/account/notifications",{cache:"no-store"});const d=await r.json().catch(()=>({}));setItems(r.ok&&Array.isArray(d.items)?d.items:[])}finally{setLoading(false)}}
 useEffect(()=>{load()},[]);
 async function mark(x:Item){if(x.read)return;await fetch("/api/account/notifications",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({eventKeys:[x.eventKey]})});setItems(v=>v.map(i=>i.eventKey===x.eventKey?{...i,read:true}:i))}
 if(loading)return <p className="text-sm text-[var(--lx-muted)]">正在读取消息…</p>;
 if(!items.length)return <div className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-6 text-sm text-[var(--lx-muted)]">暂时没有新消息。</div>;
 return <div className="space-y-3">{items.map(x=><div key={x.eventKey} className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-5">
  <div className="flex items-start justify-between gap-4"><div><b className="text-[var(--lx-ink)]">{x.title}</b><p className="mt-2 text-sm leading-6 text-[var(--lx-muted)]">{x.body}</p><p className="mt-2 text-xs text-[var(--lx-faint)]">{new Date(x.createdAt).toLocaleString()}</p></div>{!x.read&&<span className="text-xs">●</span>}</div>
  {x.href&&<Link onClick={()=>mark(x)} href={x.href} className="mt-3 inline-block text-sm underline">查看详情 →</Link>}
  {!x.read&&!x.href&&<button onClick={()=>mark(x)} className="mt-3 text-sm underline">标为已读</button>}
 </div>)}</div>
}
