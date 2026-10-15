"use client";
import {ensureToolExportAccess} from './export-access-client';
const cache=new Map<string,Blob>();
export async function copyToolResult(text:string,sourceBlob?:Blob){
 const key=location.pathname+'\0'+text;let blob=cache.get(key);
 if(!blob){blob=new Blob([text],{type:'text/plain;charset=utf-8'});cache.set(key,blob);if(cache.size>20)cache.delete(cache.keys().next().value!)}
 await ensureToolExportAccess(sourceBlob||blob,'result.txt');
 await navigator.clipboard.writeText(text);
}
