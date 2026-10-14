"use client";
import{createContext,useCallback,useContext,useMemo,useState,useEffect,useRef,type ReactNode}from"react";
import{createUnifiedTurn,completeUnifiedTurn,failUnifiedTurn,type SasiUnifiedMode,type SasiUnifiedTurn}from"@/lib/sasi/core/unified-conversation";
import {workspaceCheckpoint} from '@/lib/sasi/workspace-checkpoint';

type Ctx={
 ownerId:string;threadId:string;workspace:Record<string,any>;restored:boolean;
 identify:(owner:string,thread:string)=>void;
 updateWorkspace:(patch:Record<string,any>)=>void;
 turns:SasiUnifiedTurn[];
 submit:(text:string,mode:SasiUnifiedMode)=>string;
 complete:(id:string,text:string,extra?:Partial<SasiUnifiedTurn>)=>void;
 fail:(id:string,state:"needs-connection"|"failed")=>void;
 clear:()=>void;
};
const Context=createContext<Ctx|null>(null);

export function SasiUnifiedConversationProvider({children}:{children:ReactNode}){
 const[ownerId,setOwnerId]=useState(''),[threadId,setThreadId]=useState(''),[workspace,setWorkspace]=useState<Record<string,any>>({}),[restored,setRestored]=useState(false);
 const ready=useRef(false);
 useEffect(()=>{let active=true;const params=new URLSearchParams(location.search),requested=params.get('threadId'),fresh=!requested&&params.get('fresh')==='1';
  void fetch('/api/sasi/conversations'+(requested?'?threadId='+encodeURIComponent(requested):fresh?'?fresh=1':''),{cache:'no-store'}).then(async response=>({ok:response.ok,data:await response.json()})).then(({ok,data})=>{
   if(!active)return;
   if(ok&&typeof data.ownerId==='string'){
    setOwnerId(data.ownerId);setThreadId(data.threadId||'');
    let local:Record<string,any>|null=null;try{local=JSON.parse(localStorage.getItem('lx-sasi-workspace-v78:'+data.ownerId)||'null')}catch{}
    const saved=data.workspace||{};
    // Authenticate the owner before reading their local recovery checkpoint.
    setWorkspace(fresh?{}:local&&local.threadId===(data.threadId||'')&&Number(local.savedAt)>Number(saved.savedAt)?local:saved);
   }
  }).catch(()=>{}).finally(()=>{if(active){ready.current=true;setRestored(true)}});return()=>{active=false};
 },[]);
 const identify=useCallback((owner:string,thread:string)=>{setOwnerId(owner);setThreadId(thread)},[]);
 const updateWorkspace=useCallback((patch:Record<string,any>)=>setWorkspace(old=>({...old,...patch,savedAt:Date.now()})),[]);
 useEffect(()=>{
  if(!ready.current||!ownerId||!threadId||!workspace.mode)return;
  const snapshot=workspaceCheckpoint({...workspace,threadId});
  try{localStorage.setItem('lx-sasi-workspace-v78:'+ownerId,JSON.stringify(snapshot))}catch{}
  const timer=setTimeout(()=>{void fetch('/api/sasi/conversations/workspace',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({threadId,workspace:snapshot})}).catch(()=>{})},500);
  return()=>clearTimeout(timer);
 },[ownerId,threadId,workspace]);
 const[turns,setTurns]=useState<SasiUnifiedTurn[]>([]);
 const submit=useCallback((text:string,mode:SasiUnifiedMode)=>{
  const turn=createUnifiedTurn(text,mode);setTurns(rows=>[...rows,turn]);return turn.id;
 },[]);
 const complete=useCallback((id:string,text:string,extra:Partial<SasiUnifiedTurn>={})=>{
  setTurns(rows=>rows.map(row=>row.id===id?completeUnifiedTurn(row,text,extra):row));
 },[]);
 const fail=useCallback((id:string,state:"needs-connection"|"failed")=>{
  setTurns(rows=>rows.map(row=>row.id===id?failUnifiedTurn(row,state):row));
 },[]);
 const clear=useCallback(()=>setTurns([]),[]);
 const value=useMemo(()=>({turns,submit,complete,fail,clear,ownerId,threadId,workspace,restored,identify,updateWorkspace}),[turns,submit,complete,fail,clear,ownerId,threadId,workspace,restored,identify,updateWorkspace]);
 return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useSasiUnifiedConversation(){
 const value=useContext(Context);if(!value)throw new Error("SASI_UNIFIED_CONVERSATION_PROVIDER_MISSING");return value;
}
