"use client";
import{HANDOFF_STORE,openWorkspaceDb}from"./db";

export type HandoffFileMeta={name:string;type:string;size:number;lastModified:number};
export type HandoffRecord={id:string;createdAt:number;expiresAt:number;sourceSlug:string;files:Array<{meta:HandoffFileMeta;blob:Blob}>};
const TTL_MS=30*60*1000;

function randomId(){const bytes=new Uint8Array(18);crypto.getRandomValues(bytes);return Array.from(bytes,b=>b.toString(16).padStart(2,"0")).join("")}

export async function purgeExpiredHandoffs(now=Date.now()){
 const d=await openWorkspaceDb();
 await new Promise<void>((resolve,reject)=>{const tx=d.transaction(HANDOFF_STORE,"readwrite"),store=tx.objectStore(HANDOFF_STORE),req=store.openCursor();req.onsuccess=()=>{const c=req.result;if(!c)return;const value=c.value as HandoffRecord;if(!value?.expiresAt||value.expiresAt<=now)c.delete();c.continue()};tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error||new Error("HANDOFF_PURGE_FAILED"))});
 d.close();
}

export async function createToolHandoff(sourceSlug:string,files:Array<{name:string;blob:Blob;mime:string;size:number}>){
 if(!files.length)throw new Error("HANDOFF_EMPTY");
 await purgeExpiredHandoffs().catch(()=>{});
 const id=randomId(),now=Date.now();
 const record:HandoffRecord={id,createdAt:now,expiresAt:now+TTL_MS,sourceSlug,files:files.map(file=>({meta:{name:file.name,type:file.mime||file.blob.type||"application/octet-stream",size:file.blob.size,lastModified:now},blob:file.blob}))};
 const d=await openWorkspaceDb();
 await new Promise<void>((resolve,reject)=>{const tx=d.transaction(HANDOFF_STORE,"readwrite");tx.objectStore(HANDOFF_STORE).put(record);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error||new Error("HANDOFF_WRITE_FAILED"))});
 d.close();return id;
}

export async function consumeToolHandoff(id:string){
 if(!/^[0-9a-f]{36}$/i.test(id))return null;
 const d=await openWorkspaceDb();
 const record=await new Promise<HandoffRecord|null>((resolve,reject)=>{const tx=d.transaction(HANDOFF_STORE,"readonly"),req=tx.objectStore(HANDOFF_STORE).get(id);req.onsuccess=()=>resolve((req.result as HandoffRecord)||null);req.onerror=()=>reject(req.error||new Error("HANDOFF_READ_FAILED"))});
 if(!record){d.close();return null}
 if(record.expiresAt<=Date.now()){await new Promise<void>((resolve,reject)=>{const tx=d.transaction(HANDOFF_STORE,"readwrite");tx.objectStore(HANDOFF_STORE).delete(id);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error||new Error("HANDOFF_DELETE_FAILED"))}).catch(()=>{});d.close();return null}
 await new Promise<void>((resolve,reject)=>{const tx=d.transaction(HANDOFF_STORE,"readwrite");tx.objectStore(HANDOFF_STORE).delete(id);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error||new Error("HANDOFF_DELETE_FAILED"))}).catch(()=>{});
 d.close();
 return{sourceSlug:record.sourceSlug,files:record.files.map(x=>new File([x.blob],x.meta.name,{type:x.meta.type,lastModified:x.meta.lastModified}))};
}
