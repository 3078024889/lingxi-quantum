"use client";
import { useState } from "react";

function b64url(bytes:Uint8Array){let s="";bytes.forEach(b=>s+=String.fromCharCode(b));return btoa(s).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"")}
export default function BurnAfterReadWorkbench(){
  const [text,setText]=useState(""),[ttl,setTtl]=useState(60),[link,setLink]=useState(""),[busy,setBusy]=useState(false),[error,setError]=useState("");
  async function create(){
    if(!text.trim())return;setBusy(true);setError("");setLink("");
    try{
      const key=await crypto.subtle.generateKey({name:"AES-GCM",length:256},true,["encrypt","decrypt"]);
      const rawKey=new Uint8Array(await crypto.subtle.exportKey("raw",key));
      const iv=crypto.getRandomValues(new Uint8Array(12));
      const cipher=new Uint8Array(await crypto.subtle.encrypt({name:"AES-GCM",iv},key,new TextEncoder().encode(text)));
      const r=await fetch("/api/tools/burn-after-read/create",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({ciphertext:b64url(cipher),iv:b64url(iv),ttlMinutes:ttl})});
      const d=await r.json();if(!r.ok)throw new Error(d.error||"创建失败");
      const url=`${location.origin}/tools/burn-after-read/${d.id}#k=${b64url(rawKey)}`;
      setLink(url);setText("");
    }catch(e){setError(e instanceof Error?e.message:String(e))}finally{setBusy(false)}
  }
  return <div className="mx-auto max-w-3xl space-y-5">
    <div className="rounded-3xl border border-slate-200 bg-white p-6"><p className="text-xs font-semibold uppercase tracking-[.18em] text-slate-400">LINGXIFIELD PRIVACY</p><h1 className="mt-2 text-3xl font-semibold">阅后即焚</h1><p className="mt-2 text-sm leading-6 text-slate-600">文本在浏览器中使用 AES-GCM 加密；服务器只保存密文。解密钥匙只存在于链接 # 后面，不会随 HTTP 请求发送给服务器。首次真正读取后，服务器记录立即删除。</p></div>
    <div className="rounded-3xl border border-slate-200 bg-white p-6">
      <textarea value={text} onChange={e=>setText(e.target.value)} maxLength={120000} rows={9} placeholder="输入只想让对方看一次的内容…" className="w-full rounded-2xl border border-slate-200 p-4 outline-none"/>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <select value={ttl} onChange={e=>setTtl(Number(e.target.value))} className="rounded-full border border-slate-200 px-4 py-2 text-sm"><option value={10}>10 分钟未读自动销毁</option><option value={60}>1 小时未读自动销毁</option><option value={1440}>24 小时未读自动销毁</option></select>
        <button onClick={create} disabled={busy||!text.trim()} className="rounded-full bg-slate-950 px-5 py-2.5 text-sm text-white disabled:opacity-40">{busy?"正在加密…":"生成一次性链接"}</button>
      </div>
      {link&&<div className="mt-5 rounded-2xl bg-slate-50 p-4"><div className="break-all text-sm">{link}</div><button onClick={()=>navigator.clipboard.writeText(link)} className="mt-3 rounded-full border border-slate-200 px-4 py-2 text-sm">复制链接</button></div>}
      {error&&<p className="mt-3 text-sm text-rose-600">{error}</p>}
    </div>
  </div>
}
