"use client";
import type{ToolResultFile}from"@/lib/tools/types";
import{openWorkspaceDb,RESULT_STORE}from"./db";

export type RecoverableResultRecord={id:string;sourceSlug:string;createdAt:number;expiresAt:number;files:Array<{name:string;mime:string;size:number;blob:Blob}>};
const TTL_MS=7*24*60*60*1000;
const MAX_RESULT_BYTES=64*1024*1024;
const STORAGE_HEADROOM=.85;

function randomId(){const bytes=new Uint8Array(18);crypto.getRandomValues(bytes);return Array.from(bytes,b=>b.toString(16).padStart(2,"0")).join("")}
async function hasCapacity(bytes:number){
 try{const estimate=await navigator.storage?.estimate?.();if(!estimate?.quota)return true;return (estimate.usage||0)+bytes<=estimate.quota*STORAGE_HEADROOM}catch{return true}
}
export async function purgeExpiredRecoverableResults(now=Date.now()){
 const d=await openWorkspaceDb();
 await new Promise<void>((resolve,reject)=>{const tx=d.transaction(RESULT_STORE,"readwrite"),store=tx.objectStore(RESULT_STORE),req=store.openCursor();req.onsuccess=()=>{const c=req.result;if(!c)return;const value=c.value as RecoverableResultRecord;if(!value?.expiresAt||value.expiresAt<=now)c.delete();c.continue()};tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error||new Error("RECOVERABLE_RESULT_PURGE_FAILED"))});
 d.close();
}
export async function saveRecoverableResult(sourceSlug:string,files:ToolResultFile[]):Promise<string|null>{
 if(typeof window==="undefined"||!sourceSlug||!files.length)return null;
 const bytes=files.reduce((n,f)=>n+Number(f.blob?.size||f.size||0),0);
 if(bytes<=0||bytes>MAX_RESULT_BYTES||!(await hasCapacity(bytes)))return null;
 await purgeExpiredRecoverableResults().catch(()=>{});
 const id=randomId(),now=Date.now();
 const record:RecoverableResultRecord={id,sourceSlug,createdAt:now,expiresAt:now+TTL_MS,files:files.map(f=>({name:f.name,mime:f.mime||f.blob.type||"application/octet-stream",size:f.blob.size,blob:f.blob}))};
 const d=await openWorkspaceDb();
 try{await new Promise<void>((resolve,reject)=>{const tx=d.transaction(RESULT_STORE,"readwrite");tx.objectStore(RESULT_STORE).put(record);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error||new Error("RECOVERABLE_RESULT_WRITE_FAILED"))});return id}finally{d.close()}
}
export async function loadRecoverableResult(id:string):Promise<{sourceSlug:string;files:ToolResultFile[]}|null>{
 if(!/^[0-9a-f]{36}$/i.test(id))return null;
 const d=await openWorkspaceDb();
 const record=await new Promise<RecoverableResultRecord|null>((resolve,reject)=>{const tx=d.transaction(RESULT_STORE,"readonly"),req=tx.objectStore(RESULT_STORE).get(id);req.onsuccess=()=>resolve((req.result as RecoverableResultRecord)||null);req.onerror=()=>reject(req.error||new Error("RECOVERABLE_RESULT_READ_FAILED"))});
 d.close();if(!record)return null;
 if(record.expiresAt<=Date.now()){await deleteRecoverableResult(id).catch(()=>{});return null}
 return{sourceSlug:record.sourceSlug,files:record.files.map(f=>({name:f.name,mime:f.mime,size:f.blob.size,blob:f.blob}))};
}
export async function deleteRecoverableResult(id:string){
 const d=await openWorkspaceDb();
 await new Promise<void>((resolve,reject)=>{const tx=d.transaction(RESULT_STORE,"readwrite");tx.objectStore(RESULT_STORE).delete(id);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error||new Error("RECOVERABLE_RESULT_DELETE_FAILED"))});
 d.close();
}
