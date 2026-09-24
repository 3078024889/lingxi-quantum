"use client";
import { useState } from "react";

function b64url(bytes:Uint8Array){let s="";bytes.forEach(b=>s+=String.fromCharCode(b));return btoa(s).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"")}

export default function BurnAfterReadWorkbench(){
  const[text,setText]=useState("");
  const[ttl,setTtl]=useState(60);
  const[link,setLink]=useState("");
  const[busy,setBusy]=useState(false);
  const[error,setError]=useState("");
  const[copied,setCopied]=useState(false);

  async function create(){
    if(!text.trim())return;
    setBusy(true);setError("");setLink("");setCopied(false);
    try{
      const key=await crypto.subtle.generateKey({name:"AES-GCM",length:256},true,["encrypt","decrypt"]);
      const rawKey=new Uint8Array(await crypto.subtle.exportKey("raw",key));
      const iv=crypto.getRandomValues(new Uint8Array(12));
      const cipher=new Uint8Array(await crypto.subtle.encrypt({name:"AES-GCM",iv},key,new TextEncoder().encode(text)));
      const r=await fetch("/api/tools/burn-after-read/create",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({ciphertext:b64url(cipher),iv:b64url(iv),ttlMinutes:ttl})});
      const d=await r.json().catch(()=>({}));
      if(!r.ok)throw new Error(d.error||"创建失败");
      setLink(`${location.origin}/tools/burn-after-read/${d.id}#k=${b64url(rawKey)}`);
      setText("");
    }catch(e){setError(e instanceof Error?e.message:String(e))}
    finally{setBusy(false)}
  }

  async function copyLink(){
    if(!link)return;
    await navigator.clipboard.writeText(link);
    setCopied(true);setTimeout(()=>setCopied(false),1800);
  }

  async function shareLink(){
    if(!link)return;
    if(navigator.share){
      await navigator.share({title:"给你一条阅后即焚消息",text:"打开后只能读取一次：",url:link}).catch(()=>{});
    }else{
      await copyLink();
    }
  }

  function emailLink(){
    if(!link)return;
    const subject=encodeURIComponent("给你一条阅后即焚消息");
    const body=encodeURIComponent(`打开下面的链接读取内容。内容只能读取一次，读取后会自动销毁：\n\n${link}`);
    location.href=`mailto:?subject=${subject}&body=${body}`;
  }

  return <div className="mx-auto max-w-3xl space-y-5">
    <div className="rounded-3xl border border-slate-200 bg-white p-6">
      <p className="text-xs font-semibold uppercase tracking-[.18em] text-slate-400">灵犀场 · 私密分享</p>
      <h1 className="mt-2 text-3xl font-semibold text-slate-950">阅后即焚</h1>
      <p className="mt-2 text-sm leading-6 text-slate-600">写下不想长期留在聊天记录里的内容，生成一个一次性链接发给对方。对方无需登录，打开并读取一次后，内容就会销毁。</p>
      <div className="mt-5 grid gap-2 text-sm text-slate-600 sm:grid-cols-4">
        <span className="rounded-xl bg-slate-50 px-3 py-2">1. 输入内容</span>
        <span className="rounded-xl bg-slate-50 px-3 py-2">2. 生成链接</span>
        <span className="rounded-xl bg-slate-50 px-3 py-2">3. 发给对方</span>
        <span className="rounded-xl bg-slate-50 px-3 py-2">4. 读取后销毁</span>
      </div>
    </div>

    <div className="rounded-3xl border border-slate-200 bg-white p-6">
      <textarea value={text} onChange={e=>setText(e.target.value)} maxLength={120000} rows={9} placeholder="输入只想让对方看一次的内容…" className="w-full rounded-2xl border border-slate-200 p-4 text-slate-900 outline-none focus:border-slate-400"/>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <select value={ttl} onChange={e=>setTtl(Number(e.target.value))} className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-800">
          <option value={5}>5 分钟未读自动销毁</option>
          <option value={10}>10 分钟未读自动销毁</option>
          <option value={60}>1 小时未读自动销毁</option>
          <option value={1440}>24 小时未读自动销毁</option>
        </select>
        <button onClick={create} disabled={busy||!text.trim()} style={{background:"#111827",color:"#fff"}} className="rounded-full px-5 py-2.5 text-sm font-medium disabled:opacity-40">{busy?"正在生成…":"生成一次性链接"}</button>
      </div>

      {link&&<div className="mt-5 rounded-2xl bg-slate-50 p-4">
        <p className="text-sm font-semibold text-slate-900">链接已生成，现在把它发给对方：</p>
        <div className="mt-2 break-all rounded-xl bg-white p-3 text-sm text-slate-700">{link}</div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button onClick={copyLink} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-800">{copied?"已复制":"复制链接"}</button>
          <button onClick={()=>void shareLink()} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-800">分享给对方</button>
          <button onClick={emailLink} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-800">用邮件发送</button>
        </div>
        <p className="mt-3 text-xs leading-5 text-slate-500">可以通过微信、短信、邮件或任何聊天工具发送这个链接。不要自己先点开读取，否则内容会立即销毁。</p>
      </div>}
      {error&&<p className="mt-3 text-sm text-rose-600">{error}</p>}
    </div>

    <details className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-600">
      <summary className="cursor-pointer font-medium text-slate-800">隐私是怎么保护的？</summary>
      <p className="mt-3 leading-6">内容会先在你的设备上加密，再保存为无法直接阅读的密文；解密信息只在你分享的链接里。对方主动点击“读取一次并销毁”后，服务器上的记录立即删除。</p>
    </details>
  </div>;
}
