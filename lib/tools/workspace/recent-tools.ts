"use client";
import type{ToolResultFile}from"@/lib/tools/types";
import{deleteRecoverableResult,saveRecoverableResult}from"./recoverable-results";

export type RecentToolActivity={slug:string;at:number;fileCount:number;bytes:number;workspaceId?:string};
const KEY="lingxifield-recent-tool-results-v2";
const LEGACY_KEY="lingxifield-recent-tool-results-v1";
const MAX=6;
const TTL_MS=14*24*60*60*1000;
const EVENT="lingxifield:recent-tools";
function valid(x:any,now:number):x is RecentToolActivity{return Boolean(x&&typeof x.slug==="string"&&Number.isFinite(x.at)&&x.at>0&&x.at<=now&&now-x.at<=TTL_MS&&Number.isFinite(x.fileCount)&&Number.isFinite(x.bytes)&&(!x.workspaceId||/^[0-9a-f]{36}$/i.test(x.workspaceId)))}
function safeRead(now=Date.now()):RecentToolActivity[]{
 try{const raw=localStorage.getItem(KEY)||localStorage.getItem(LEGACY_KEY);if(!raw)return[];const value=JSON.parse(raw);if(!Array.isArray(value))return[];const next=value.filter(x=>valid(x,now)).slice(0,MAX);localStorage.setItem(KEY,JSON.stringify(next));if(localStorage.getItem(LEGACY_KEY))localStorage.removeItem(LEGACY_KEY);return next}catch{return[]}
}
function write(next:RecentToolActivity[]){try{localStorage.setItem(KEY,JSON.stringify(next.slice(0,MAX)));window.dispatchEvent(new CustomEvent(EVENT))}catch{}}
export function readRecentToolActivity(){return typeof window==="undefined"?[]:safeRead()}
export function recordRecentToolResult(slug:string,files:ToolResultFile[]=[]){
 if(!slug||typeof window==="undefined")return;
 const now=Date.now(),previous=safeRead(),old=previous.find(x=>x.slug===slug);
 const base:RecentToolActivity={slug,at:now,fileCount:files.length,bytes:files.reduce((n,f)=>n+Number(f.size||f.blob?.size||0),0)};
 write([base,...previous.filter(x=>x.slug!==slug)]);
 if(!files.length)return;
 void saveRecoverableResult(slug,files).then(workspaceId=>{
  if(!workspaceId)return;
  const current=safeRead();const hit=current.find(x=>x.slug===slug&&x.at===now);if(!hit){void deleteRecoverableResult(workspaceId).catch(()=>{});return}
  write(current.map(x=>x.slug===slug&&x.at===now?{...x,workspaceId}:x));
  if(old?.workspaceId&&old.workspaceId!==workspaceId)void deleteRecoverableResult(old.workspaceId).catch(()=>{});
 }).catch(()=>{});
}
export function purgeExpiredRecentToolActivity(){if(typeof window==="undefined")return[];return safeRead()}
export function onRecentToolActivityChange(fn:()=>void){if(typeof window==="undefined")return()=>{};window.addEventListener(EVENT,fn);window.addEventListener("storage",fn);return()=>{window.removeEventListener(EVENT,fn);window.removeEventListener("storage",fn)}}
