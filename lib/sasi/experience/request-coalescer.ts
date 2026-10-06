import "server-only";
import {createHash}from"node:crypto";
const inflight=new Map<string,Promise<unknown>>();
const recent=new Map<string,{at:number,value:unknown}>();
const TTL=12_000;
const MAX_RECENT=128;

export function coalesceKey(parts:unknown[]){
 return createHash("sha256").update(JSON.stringify(parts)).digest("hex");
}
export async function coalesce<T>(key:string,work:()=>Promise<T>):Promise<T>{
 const now=Date.now();for(const [id,item] of recent)if(now-item.at>=TTL)recent.delete(id);
 const cached=recent.get(key);if(cached&&Date.now()-cached.at<TTL)return cached.value as T;
 const running=inflight.get(key);if(running)return running as Promise<T>;
 const p=work().then(value=>{if(recent.size>=MAX_RECENT){const oldest=recent.keys().next().value;if(oldest)recent.delete(oldest)}recent.set(key,{at:Date.now(),value});return value}).finally(()=>inflight.delete(key));
 inflight.set(key,p);return p;
}
