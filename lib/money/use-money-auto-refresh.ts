"use client";
import {useEffect,useRef} from 'react';
type Subscriber={refresh:()=>Promise<unknown>|void;active:()=>boolean;operator:boolean};
const subscribers=new Set<Subscriber>();let running=false;let timer:ReturnType<typeof setInterval>|null=null;
async function refreshMoney(queryProgress:boolean){
 if(running||document.visibilityState==='hidden'||navigator.onLine===false)return;
 running=true;
 try{
  const active=[...subscribers].filter(s=>s.active());
  if(queryProgress&&active.length){try{await fetch('/api/account/withdrawals/progress',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({operator:active.some(s=>s.operator)})})}catch{ /* Read stored progress even when the provider query is unavailable. */ }}
  await Promise.allSettled([...subscribers].map(s=>Promise.resolve().then(()=>subscribers.has(s)?s.refresh():undefined)));
 }finally{running=false;}
}
const updated=()=>void refreshMoney(false);
const resume=()=>void refreshMoney(true);
const tick=()=>{if([...subscribers].some(s=>s.active()))void refreshMoney(true)};
export function useMoneyAutoRefresh(refresh:()=>Promise<unknown>|void,active:boolean,operator=false){
 const latest=useRef({refresh,active});latest.current={refresh,active};
 useEffect(()=>{
  const subscriber:Subscriber={refresh:()=>latest.current.refresh(),active:()=>latest.current.active,operator};subscribers.add(subscriber);
  if(!timer){timer=setInterval(tick,30000);window.addEventListener('lingxi-money-updated',updated);window.addEventListener('focus',resume);window.addEventListener('online',resume);document.addEventListener('visibilitychange',resume);}
  return()=>{subscribers.delete(subscriber);if(!subscribers.size&&timer){clearInterval(timer);timer=null;window.removeEventListener('lingxi-money-updated',updated);window.removeEventListener('focus',resume);window.removeEventListener('online',resume);document.removeEventListener('visibilitychange',resume);}};
 },[operator]);
}
