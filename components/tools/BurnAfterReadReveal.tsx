"use client";
import { useState } from "react";
function bytes(s:string){s=s.replace(/-/g,"+").replace(/_/g,"/");while(s.length%4)s+="=";const b=atob(s);return Uint8Array.from(b,c=>c.charCodeAt(0))}
export default function BurnAfterReadReveal({id}:{id:string}){
  const[value,setValue]=useState("");
  const[status,setStatus]=useState<"idle"|"busy"|"shown"|"gone"|"error">("idle");

  async function reveal(){
    const keyPart=new URLSearchParams(location.hash.slice(1)).get("k");
    if(!keyPart){setStatus("error");return}
    setStatus("busy");
    try{
      const r=await fetch("/api/tools/burn-after-read/consume",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({id})});
      const d=await r.json().catch(()=>({}));
      if(r.status===410){setStatus("gone");return}
      if(!r.ok)throw new Error();
      const key=await crypto.subtle.importKey("raw",bytes(keyPart),{name:"AES-GCM"},false,["decrypt"]);
      const plain=await crypto.subtle.decrypt({name:"AES-GCM",iv:bytes(d.iv)},key,bytes(d.ciphertext));
      setValue(new TextDecoder().decode(plain));
      history.replaceState({},document.title,location.pathname);
      setStatus("shown");
    }catch{setStatus("error")}
  }

  return <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-6">
    <p className="text-xs font-semibold uppercase tracking-[.18em] text-slate-400">灵犀场 · 一次性消息</p>
    <h1 className="mt-2 text-2xl font-semibold text-slate-950">有人给你留了一条只能看一次的内容</h1>
    {status==="idle"&&<>
      <p className="mt-3 text-sm leading-6 text-slate-600">点击下面按钮后内容会显示一次，同时销毁服务器上的记录。确认你现在方便阅读再打开。</p>
      <button onClick={reveal} style={{background:"#111827",color:"#fff"}} className="mt-5 rounded-full px-5 py-3 text-sm font-medium">读取一次并销毁</button>
    </>}
    {status==="busy"&&<p className="mt-5 text-sm text-slate-500">正在打开…</p>}
    {status==="shown"&&<div className="mt-5 rounded-2xl bg-slate-50 p-5"><p className="mb-3 text-xs text-slate-500">已销毁服务器记录 · 请自行保存需要的内容</p><pre className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-900">{value}</pre></div>}
    {status==="gone"&&<p className="mt-5 text-sm text-slate-500">这条内容已经被读取、销毁或过期。</p>}
    {status==="error"&&<p className="mt-5 text-sm text-rose-600">无法打开这条内容。链接可能不完整，或者内容已经销毁。</p>}
  </div>;
}
