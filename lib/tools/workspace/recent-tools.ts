"use client";

export type RecentToolActivity={slug:string;at:number;fileCount:number;bytes:number};
const KEY="lingxifield-recent-tool-results-v1";
const MAX=6;
const TTL_MS=14*24*60*60*1000;
const EVENT="lingxifield:recent-tools";

function valid(x:any,now:number):x is RecentToolActivity{
 return Boolean(x&&typeof x.slug==="string"&&Number.isFinite(x.at)&&x.at>0&&x.at<=now&&now-x.at<=TTL_MS&&Number.isFinite(x.fileCount)&&Number.isFinite(x.bytes));
}
function safeRead(now=Date.now()):RecentToolActivity[]{
 try{
  const raw=localStorage.getItem(KEY);if(!raw)return[];
  const value=JSON.parse(raw);if(!Array.isArray(value))return[];
  const next=value.filter(x=>valid(x,now)).slice(0,MAX);
  if(next.length!==value.length)localStorage.setItem(KEY,JSON.stringify(next));
  return next;
 }catch{return[]}
}

export function readRecentToolActivity(){return typeof window==="undefined"?[]:safeRead()}

export function recordRecentToolResult(slug:string,files:Array<{size:number}>=[]){
 if(!slug||typeof window==="undefined")return;
 const item:RecentToolActivity={slug,at:Date.now(),fileCount:files.length,bytes:files.reduce((n,f)=>n+Number(f.size||0),0)};
 try{
  const next=[item,...safeRead().filter(x=>x.slug!==slug)].slice(0,MAX);
  localStorage.setItem(KEY,JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(EVENT));
 }catch{}
}

export function purgeExpiredRecentToolActivity(){
 if(typeof window==="undefined")return[];
 return safeRead();
}

export function onRecentToolActivityChange(fn:()=>void){
 if(typeof window==="undefined")return()=>{};
 window.addEventListener(EVENT,fn);window.addEventListener("storage",fn);
 return()=>{window.removeEventListener(EVENT,fn);window.removeEventListener("storage",fn)};
}
