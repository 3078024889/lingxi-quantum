"use client";
import {useEffect,useState} from 'react';

/** Own one preview URL per Blob; parameter edits must not allocate new URLs. */
export function useObjectUrl(blob:Blob|null|undefined){
 const [preview,setPreview]=useState<{blob:Blob;url:string}|null>(null);
 useEffect(()=>{
  if(!blob){setPreview(null);return}
  const url=URL.createObjectURL(blob);setPreview({blob,url});
  return()=>URL.revokeObjectURL(url);
 },[blob]);
 return preview?.blob===blob?preview?.url||'':'';
}
