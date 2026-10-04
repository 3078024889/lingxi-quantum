"use client";
export const WORKSPACE_DB_NAME="lingxifield-tool-workspace";
export const WORKSPACE_DB_VERSION=2;
export const HANDOFF_STORE="handoffs";
export const RESULT_STORE="results";

export function openWorkspaceDb():Promise<IDBDatabase>{
 return new Promise((resolve,reject)=>{
  const req=indexedDB.open(WORKSPACE_DB_NAME,WORKSPACE_DB_VERSION);
  req.onupgradeneeded=()=>{
   const d=req.result;
   if(!d.objectStoreNames.contains(HANDOFF_STORE))d.createObjectStore(HANDOFF_STORE,{keyPath:"id"});
   if(!d.objectStoreNames.contains(RESULT_STORE))d.createObjectStore(RESULT_STORE,{keyPath:"id"});
  };
  req.onsuccess=()=>resolve(req.result);
  req.onerror=()=>reject(req.error||new Error("WORKSPACE_DB_OPEN_FAILED"));
 });
}
