"use client";

export type DraftFile={
 blob:Blob;name:string;type:string;lastModified:number;
};
export type PaidTaskDraft<T=unknown>={
 id:string;toolId:string;updatedAt:number;expiresAt:number;
 file?:Blob;fileName?:string;fileType?:string;
 files?:DraftFile[];
 state:T;
};

const DB="lingxifield-paid-task-drafts",VERSION=2,STORE="drafts",TTL=7*24*60*60*1000;

function openDb(){return new Promise<IDBDatabase>((resolve,reject)=>{
 const r=indexedDB.open(DB,VERSION);
 r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains(STORE))r.result.createObjectStore(STORE,{keyPath:"id"})};
 r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);
})}
export function newPaidTaskDraftId(){return crypto.randomUUID()}
function toDraftFile(file:File):DraftFile{return{blob:file,name:file.name,type:file.type,lastModified:file.lastModified}}

export async function savePaidTaskDraft<T>(input:{
 id:string;toolId:string;file?:File|Blob;fileName?:string;fileType?:string;files?:File[];state:T
}){
 const d=await openDb(),now=Date.now();
 const row:PaidTaskDraft<T>={
  id:input.id,toolId:input.toolId,updatedAt:now,expiresAt:now+TTL,
  file:input.file,fileName:input.fileName,fileType:input.fileType,
  files:input.files?.map(toDraftFile),
  state:input.state
 };
 await new Promise<void>((resolve,reject)=>{const tx=d.transaction(STORE,"readwrite");tx.objectStore(STORE).put(row);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error)});
 d.close();try{localStorage.setItem(`lingxifield:paid-draft:latest:${input.toolId}`,input.id)}catch{}
 return input.id;
}

export async function loadPaidTaskDraft<T=unknown>(id:string){
 if(!id)return null;
 const d=await openDb();
 const row=await new Promise<PaidTaskDraft<T>|null>((resolve,reject)=>{const tx=d.transaction(STORE,"readonly"),r=tx.objectStore(STORE).get(id);r.onsuccess=()=>resolve((r.result as PaidTaskDraft<T>)||null);r.onerror=()=>reject(r.error)});
 if(row&&row.expiresAt<=Date.now()){
  await new Promise<void>(resolve=>{const tx=d.transaction(STORE,"readwrite");tx.objectStore(STORE).delete(id);tx.oncomplete=()=>resolve();tx.onerror=()=>resolve()});
  d.close();return null;
 }
 d.close();return row;
}
export function draftFiles(row:PaidTaskDraft<any>|null):File[]{
 if(!row)return[];
 if(row.files?.length)return row.files.map(x=>new File([x.blob],x.name,{type:x.type,lastModified:x.lastModified}));
 if(row.file)return[new File([row.file],row.fileName||"file",{type:row.fileType||"application/octet-stream"})];
 return[];
}
export async function deletePaidTaskDraft(id:string){
 const d=await openDb();await new Promise<void>(resolve=>{const tx=d.transaction(STORE,"readwrite");tx.objectStore(STORE).delete(id);tx.oncomplete=()=>resolve();tx.onerror=()=>resolve()});d.close();
}
export function latestPaidTaskDraftId(toolId:string){try{return localStorage.getItem(`lingxifield:paid-draft:latest:${toolId}`)||""}catch{return""}}
