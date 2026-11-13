"use client";
import {useState} from "react";
type Props={slug:"voynich"|"uap";title:string;label:string;copiedLabel:string};
export default function DiscoveryShareAction({slug,title,label,copiedLabel}:Props){
 const [copied,setCopied]=useState(false);
 async function share(){
  const url=new URL("/discoveries#"+slug,location.origin);
  url.searchParams.set("utm_source","discovery_share");
  url.searchParams.set("utm_campaign","field_notes");
  url.searchParams.set("utm_content",slug);
  const target=url.toString();
  try{
   if(navigator.share){await navigator.share({title:"LINGXIFIELD · "+title,text:title,url:target});return;}
   await navigator.clipboard.writeText(target);setCopied(true);
  }catch(error){
   if(error instanceof Error&&error.name==="AbortError")return;
   try{await navigator.clipboard.writeText(target);setCopied(true);}catch{/* Clipboard may be unavailable in restricted contexts. */}
  }
 }
 return <button type="button" className="lx-discovery-share" onClick={()=>void share()}>{copied?copiedLabel:label} <span aria-hidden="true">↗</span></button>;
}
