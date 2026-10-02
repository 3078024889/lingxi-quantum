"use client";
import Link from"next/link";
import{useCallback,useEffect,useMemo,useRef,useState}from"react";
import{useLingxiLang}from"@/lib/lingxi-i18n";
import{accountText}from"@/lib/account-experience-i18n";
import LingxiMiniIcon from"@/components/LingxiMiniIcon";
type Item={read?:boolean;eventKey?:string;id:string;kind:"announcement"|"payment"|"refund"|"withdrawal";createdAt:string;href?:string|null;amountRmb?:number|null;status?:string|null;version?:string;title?:string;body?:string};

const LABELS={
 zh:{title:"消息中心",all:"查看全部消息",close:"关闭",new:"新消息"},
 en:{title:"Notifications",all:"View all notifications",close:"Close",new:"New"},
 ja:{title:"通知",all:"すべての通知を見る",close:"閉じる",new:"新着"},
 ko:{title:"알림",all:"모든 알림 보기",close:"닫기",new:"새 알림"},
 fr:{title:"Notifications",all:"Voir toutes les notifications",close:"Fermer",new:"Nouveau"},
 de:{title:"Mitteilungen",all:"Alle Mitteilungen",close:"Schließen",new:"Neu"},
 es:{title:"Notificaciones",all:"Ver todas",close:"Cerrar",new:"Nuevo"},
 pt:{title:"Notificações",all:"Ver todas",close:"Fechar",new:"Novo"},
 ar:{title:"الإشعارات",all:"عرض كل الإشعارات",close:"إغلاق",new:"جديد"},
}as const;

export default function NotificationBell(){
 const{lang}=useLingxiLang();const t=(k:string,v?:Record<string,string|number>)=>accountText(lang,k,v);const l=LABELS[lang]??LABELS.en;
 const[open,setOpen]=useState(false),[items,setItems]=useState<Item[]>([]),[seenAt,setSeenAt]=useState("");const ref=useRef<HTMLDivElement|null>(null);
 const load=useCallback(async()=>{try{const r=await fetch(`/api/notifications?lang=${lang}`,{cache:"no-store"});if(r.ok){const d=await r.json();setItems(Array.isArray(d.items)?d.items:[])}}catch{}},[lang]);
 useEffect(()=>{setSeenAt(localStorage.getItem("lx-notifications-seen-at")||"");void load();const id=setInterval(load,60000);window.addEventListener("lingxi-money-updated",load);return()=>{clearInterval(id);window.removeEventListener("lingxi-money-updated",load)}},[load]);
 useEffect(()=>{const h=(e:MouseEvent)=>{if(open&&ref.current&&!ref.current.contains(e.target as Node))setOpen(false)};document.addEventListener("mousedown",h);return()=>document.removeEventListener("mousedown",h)},[open]);
 useEffect(()=>{document.documentElement.classList.toggle("lx-v40-notification-open",open);return()=>document.documentElement.classList.remove("lx-v40-notification-open")},[open]);
 const unread=useMemo(()=>items.filter(i=>i.read===false||(i.read==null&&(!seenAt||new Date(i.createdAt).getTime()>new Date(seenAt).getTime()))).length,[items,seenAt]);
 function toggle(){const next=!open;setOpen(next);if(next){void fetch("/api/account/notifications",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({eventKeys:items.map(x=>x.eventKey||x.id)})}).then(r=>{if(r.ok)setItems(xs=>xs.map(x=>({...x,read:true})))}).catch(()=>{});const now=new Date().toISOString();localStorage.setItem("lx-notifications-seen-at",now);setSeenAt(now)}}
 const icon=(kind:Item["kind"])=>kind==="payment"?"✓":kind==="refund"?"↩":kind==="withdrawal"?"↗":"✦";
 return <div className="lx11-notification-wrap" ref={ref}>
  <button className="lx11-icon-btn lx11-bell" aria-label={l.title} aria-expanded={open} onClick={toggle}><LingxiMiniIcon name="sparkles" size="tiny"/>{unread>0&&<span className="lx11-notification-count">{unread>9?"9+":unread}</span>}</button>
  {open&&<><button className="lx-v40-notification-backdrop" aria-label={l.close} onClick={()=>setOpen(false)}/><section className="lx-v40-notification-sheet" role="dialog" aria-modal="true" aria-label={l.title}>
   <div className="lx-v40-sheet-grabber"/>
   <header><div><span>{unread>0?`${unread} ${l.new}`:"LINGXIFIELD"}</span><h2>{l.title}</h2></div><button onClick={()=>setOpen(false)} aria-label={l.close}>×</button></header>
   {items.length===0?<div className="lx-v40-notification-empty"><b>✓</b><p>{t("allCaughtUp")}</p></div>:<div className="lx-v40-notification-list">{items.slice(0,8).map(i=>{const title=i.title||t("notifications"),body=i.body||"";const content=<><em data-kind={i.kind}>{icon(i.kind)}</em><div><strong>{title}</strong>{body&&<p>{body}</p>}<small>{new Date(i.createdAt).toLocaleString(lang==="zh"?"zh-CN":lang)}</small></div><i>→</i></>;return i.href?<Link key={i.id} href={i.href} onClick={()=>setOpen(false)}>{content}</Link>:<article key={i.id}>{content}</article>})}</div>}
   <footer><Link href="/account/notifications" onClick={()=>setOpen(false)}>{l.all}<span>→</span></Link></footer>
  </section></>}
 </div>;
}
