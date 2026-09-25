"use client";
import Link from "next/link";
import {useEffect,useMemo,useRef,useState} from "react";
import {useLingxiLang} from "@/lib/lingxi-i18n";
import {accountText} from "@/lib/account-experience-i18n";
import {releaseText} from "@/lib/release-notifications-i18n";
import LingxiMiniIcon from "@/components/LingxiMiniIcon";
type Item={id:string;kind:"announcement"|"payment"|"refund";createdAt:string;href?:string|null;amountRmb?:number|null;status?:string|null;announcementKey?:string;version?:string};
export default function NotificationBell(){
 const{lang}=useLingxiLang();const t=(k:string,v?:Record<string,string|number>)=>accountText(lang,k,v);
 const[open,setOpen]=useState(false),[items,setItems]=useState<Item[]>([]),[seenAt,setSeenAt]=useState("");const ref=useRef<HTMLDivElement|null>(null);
 async function load(){try{const r=await fetch("/api/notifications",{cache:"no-store"});if(!r.ok)return;const d=await r.json();setItems(Array.isArray(d.items)?d.items:[])}catch{}}
 useEffect(()=>{setSeenAt(localStorage.getItem("lx-notifications-seen-at")||"");void load();const id=setInterval(load,60000);return()=>clearInterval(id)},[]);
 useEffect(()=>{const h=(e:MouseEvent)=>{if(open&&ref.current&&!ref.current.contains(e.target as Node))setOpen(false)};document.addEventListener("mousedown",h);return()=>document.removeEventListener("mousedown",h)},[open]);
 const unread=useMemo(()=>items.filter(i=>!seenAt||new Date(i.createdAt).getTime()>new Date(seenAt).getTime()).length,[items,seenAt]);
 function toggle(){const next=!open;setOpen(next);if(next){const now=new Date().toISOString();localStorage.setItem("lx-notifications-seen-at",now);setSeenAt(now)}}
 function copyFor(i:Item){if(i.kind==="announcement")return{title:t("announcementTitle"),body:releaseText(lang,i.announcementKey||"web",{version:i.version||""})};if(i.kind==="payment")return{title:t("paymentArrived"),body:t("paymentBody",{amount:Number(i.amountRmb||0).toFixed(2)})};const s=i.status||"requested";return{title:t("refundUpdate"),body:t(s==="completed"?"refundCompleted":s==="approved"?"refundApproved":s==="rejected"?"refundRejected":"refundRequested")}}
 return <div className="lx11-notification-wrap" ref={ref}><button className="lx11-icon-btn lx11-bell" aria-label={t("notifications")} aria-expanded={open} onClick={toggle}><LingxiMiniIcon name="sparkles" size="tiny"/>{unread>0&&<span className="lx11-notification-count">{unread>9?"9+":unread}</span>}</button>{open&&<div className="lx11-notification-panel"><header><b>{t("notifications")}</b>{unread>0&&<span>{unread}</span>}</header>{items.length===0?<p className="lx11-notification-empty"><span aria-hidden="true">✓</span>{t("allCaughtUp")}</p>:<div className="lx11-notification-list">{items.slice(0,12).map(i=>{const c=copyFor(i);const body=<><strong>{c.title}</strong><p>{c.body}</p><small>{new Date(i.createdAt).toLocaleString(lang==="zh"?"zh-CN":lang)}</small></>;return i.href?<Link key={i.id} href={i.href} onClick={()=>setOpen(false)}>{body}</Link>:<article key={i.id}>{body}</article>})}</div>}</div>}</div>
}
