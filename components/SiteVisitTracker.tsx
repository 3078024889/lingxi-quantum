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
  if(!path||navigator.doNotTrack==="1"||(navigator as Navigator&{globalPrivacyControl?:boolean}).globalPrivacyControl)return;
  if(!["lingxifield.com","lingxifield.cn"].includes(location.hostname))return;
  try{
   const day=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Shanghai"}).format(new Date()),key="lx-visit:"+day;
   let session=sessionStorage.getItem(key);
   if(!session){session=crypto.randomUUID();for(let i=sessionStorage.length-1;i>=0;i--){const old=sessionStorage.key(i);if(old?.startsWith("lx-visit:"))sessionStorage.removeItem(old)}sessionStorage.setItem(key,session)}
   let referrer="";try{referrer=document.referrer?new URL(document.referrer).hostname:""}catch{}
   const body=JSON.stringify({id:crypto.randomUUID(),session,path,referrer,device:matchMedia("(max-width: 700px)").matches?"mobile":"desktop"});
   void fetch("/api/analytics/visit",{method:"POST",headers:{"content-type":"application/json"},body,keepalive:true}).catch(()=>{});
  }catch{/* Browsing works when storage or statistics are disabled. */}
 },[pathname]);
 return null;
}
