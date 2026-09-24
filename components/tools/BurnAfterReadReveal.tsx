"use client";
import { useState } from "react";
function bytes(s:string){s=s.replace(/-/g,"+").replace(/_/g,"/");while(s.length%4)s+="=";const b=atob(s);return Uint8Array.from(b,c=>c.charCodeAt(0))}
export default function BurnAfterReadReveal({id}:{id:string}){
  const [value,setValue]=useState(""),[status,setStatus]=useState<"idle"|"busy"|"shown"|"gone"|"error">("idle");
  async function reveal(){
    const keyPart=new URLSearchParams(location.hash.slice(1)).get("k");
    if(!keyPart){setStatus("error");return}
    setStatus("busy");
    try{
      const r=await fetch("/api/tools/burn-after-read/consume",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({id})});
      const d=await r.json();if(r.status===410){setStatus("gone");return}if(!r.ok)throw new Error();
      const key=await crypto.subtle.importKey("raw",bytes(keyPart),{name:"AES-GCM"},false,["decrypt"]);
      const plain=await crypto.subtle.decrypt({name:"AES-GCM",iv:bytes(d.iv)},key,bytes(d.ciphertext));
      setValue(new TextDecoder().decode(plain));history.replaceState({},document.title,location.pathname);setStatus("shown");
    }catch{setStatus("error")}
  }
  return <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-6">
    <p className="text-xs font-semibold uppercase tracking-[.18em] text-slate-400">ONE-TIME SECRET</p>
    <h1 className="mt-2 text-2xl font-semibold">这段内容只能真正读取一次</h1>
    {status==="idle"&&<><p className="mt-3 text-sm leading-6 text-slate-600">点击后服务器会立即把这条密文标记为已读取并删除。不要刷新，也不要让链接预览机器人替你点击。</p><button onClick={reveal} className="mt-5 rounded-full bg-slate-950 px-5 py-3 text-sm text-white">读取并销毁</button></>}
    {status==="busy"&&<p className="mt-5 text-sm text-slate-500">正在读取…</p>}
    {status==="shown"&&<pre className="mt-5 whitespace-pre-wrap break-words rounded-2xl bg-slate-50 p-5 text-sm leading-6">{value}</pre>}
    {status==="gone"&&<p className="mt-5 text-sm text-slate-500">内容已被读取、销毁或已经过期。</p>}
    {status==="error"&&<p className="mt-5 text-sm text-rose-600">无法解密：链接可能不完整，或内容已经销毁。</p>}
  </div>
}
