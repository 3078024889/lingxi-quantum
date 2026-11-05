"use client";
import {useEffect,useRef} from "react";
import {usePathname} from "next/navigation";
import {publicVisitPath} from "@/lib/analytics/public-visit";

export default function SiteVisitTracker(){
 const pathname=usePathname(),last=useRef("");
 useEffect(()=>{
  if(last.current===pathname)return;
  last.current=pathname;
  const path=publicVisitPath(pathname);
  // Real browser usage only. Playwright/Codex automation must not count as customers.
  if(!path||navigator.webdriver===true||navigator.doNotTrack==="1"||(navigator as Navigator&{globalPrivacyControl?:boolean}).globalPrivacyControl)return;
  if(!["lingxifield.com","lingxifield.cn"].includes(location.hostname))return;
  try{
   const day=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Shanghai"}).format(new Date()),key="lx-visit:"+day;
   let session=sessionStorage.getItem(key);
   if(!session){session=crypto.randomUUID();for(let i=sessionStorage.length-1;i>=0;i--){const old=sessionStorage.key(i);if(old?.startsWith("lx-visit:"))sessionStorage.removeItem(old)}sessionStorage.setItem(key,session)}
   let referrer="";try{referrer=document.referrer?new URL(document.referrer).hostname:""}catch{}
   // Keep only explicit, bounded marketing labels; never capture query text or personal data.
   const safe=(value:string|null)=>value&&/^[a-z0-9][a-z0-9_-]{0,47}$/i.test(value)?value.toLowerCase():null;
   const query=new URLSearchParams(location.search);
   const incoming={
    utm_source:safe(query.get("utm_source")),
    utm_campaign:safe(query.get("utm_campaign")),
    utm_content:safe(query.get("utm_content"))
   };
   const attributionKey="lx-attribution:"+day;
   if(incoming.utm_source)sessionStorage.setItem(attributionKey,JSON.stringify(incoming));
   let attribution:{utm_source:string|null;utm_campaign:string|null;utm_content:string|null}={utm_source:null,utm_campaign:null,utm_content:null};
   try{
    const stored=JSON.parse(sessionStorage.getItem(attributionKey)||"null");
    if(stored&&typeof stored==="object")attribution={
     utm_source:safe(stored.utm_source),utm_campaign:safe(stored.utm_campaign),utm_content:safe(stored.utm_content)
    };
   }catch{}
   const body=JSON.stringify({id:crypto.randomUUID(),session,path,referrer,device:matchMedia("(max-width: 700px)").matches?"mobile":"desktop",...attribution});
   void fetch("/api/analytics/visit",{method:"POST",headers:{"content-type":"application/json"},body,keepalive:true}).catch(()=>{});
  }catch{/* Browsing works when storage or statistics are disabled. */}
 },[pathname]);
 return null;
}
