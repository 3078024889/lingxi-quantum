"use client";
import{createContext,useCallback,useContext,useMemo,useState,type ReactNode}from"react";
import{createUnifiedTurn,completeUnifiedTurn,failUnifiedTurn,type SasiUnifiedMode,type SasiUnifiedTurn}from"@/lib/sasi/core/unified-conversation";

type Ctx={
 turns:SasiUnifiedTurn[];
 submit:(text:string,mode:SasiUnifiedMode)=>string;
 complete:(id:string,text:string,extra?:Partial<SasiUnifiedTurn>)=>void;
 fail:(id:string,state:"needs-connection"|"failed")=>void;
 clear:()=>void;
};
const Context=createContext<Ctx|null>(null);

export function SasiUnifiedConversationProvider({children}:{children:ReactNode}){
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
 const value=useMemo(()=>({turns,submit,complete,fail,clear}),[turns,submit,complete,fail,clear]);
 return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useSasiUnifiedConversation(){
 const value=useContext(Context);if(!value)throw new Error("SASI_UNIFIED_CONVERSATION_PROVIDER_MISSING");return value;
}
