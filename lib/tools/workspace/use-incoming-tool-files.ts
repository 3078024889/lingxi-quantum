"use client";
import {useEffect,useRef} from 'react';
import {consumeToolHandoff} from './handoff';
const incoming=new Map<string,ReturnType<typeof consumeToolHandoff>>();
/** Reuse a pending read across StrictMode effects; never upload transferred files. */
export function useIncomingToolFiles(accept:(files:File[])=>void|Promise<void>){
 const callback=useRef(accept);callback.current=accept;
 useEffect(()=>{
  const url=new URL(location.href),id=url.searchParams.get('handoff');if(!id)return;
  let active=true;
  let task=incoming.get(id);if(!task){task=consumeToolHandoff(id);incoming.set(id,task)}
  void task.then(async payload=>{
   if(!active||!payload?.files.length)return;
   await callback.current(payload.files);
   if(!active)return;
   url.searchParams.delete('handoff');history.replaceState(history.state,'',url.pathname+url.search+url.hash);incoming.delete(id);
  }).catch(()=>{incoming.delete(id)});
  return()=>{active=false};
 },[]);
}
