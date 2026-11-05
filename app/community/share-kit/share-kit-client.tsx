"use client";

import {useState} from "react";
import Link from "next/link";
import type {TelegramSlot} from "@/lib/telegram/editorial";

type Post={slot:TelegramSlot;label:string;text:string};
type Props={day:string;telegram:Post[];qq:Post[]};

export default function ShareKitClient({day,telegram,qq}:Props){
 const [channel,setChannel]=useState<"telegram"|"qq">("qq");
 const [copied,setCopied]=useState("");
 const posts=channel==="qq"?qq:telegram;
 async function copy(value:string,id:string){
   try{
     await navigator.clipboard.writeText(value);
     setCopied(id);
   }catch{
     setCopied("请使用浏览器长按文字复制");
   }
 }
 return <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-indigo-50 px-4 py-10 text-slate-900">
   <div className="mx-auto max-w-4xl">
     <header className="mb-8">
       <Link href="/siai" className="text-sm font-semibold text-indigo-700 hover:underline">全球 SIAI 排行榜</Link>
       <h1 className="mt-4 text-3xl font-bold tracking-tight">每日五条 · 社区运营工作台</h1>
       <p className="mt-2 text-base text-slate-600">{day}｜直接复制到 QQ 群或 Telegram。所有链接附独立来源标记，便于后续核对引流效果。</p>
     </header>
     <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-indigo-100 bg-white p-4">
       <button onClick={()=>{setChannel("qq");setCopied("");}} className={`rounded-xl px-5 py-2 text-base font-semibold ${channel==="qq"?"bg-indigo-700 text-white":"bg-slate-100 text-slate-700"}`}>QQ群文案</button>
       <button onClick={()=>{setChannel("telegram");setCopied("");}} className={`rounded-xl px-5 py-2 text-base font-semibold ${channel==="telegram"?"bg-indigo-700 text-white":"bg-slate-100 text-slate-700"}`}>Telegram 文案</button>
       <button onClick={()=>copy(posts.map((p,i)=>`【第${i+1}条｜${p.label}】\n${p.text}`).join("\n\n──────────\n\n"),"all")} className="ml-auto rounded-xl border border-indigo-500 bg-indigo-50 px-4 py-2 text-base font-semibold text-indigo-800">复制全部 5 条</button>
     </div>
     {copied&&<p role="status" className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-base text-emerald-800">{copied==="all"?"五条文案已复制":copied.startsWith("请")?copied:"已复制第 "+copied+" 条"}</p>}
     <section className="grid gap-5">
      {posts.map((p,i)=><article key={p.slot} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
       <div className="mb-4 flex items-center justify-between gap-3">
         <div><p className="text-sm font-semibold tracking-wide text-indigo-700">第 {i+1} 条 · {p.label}</p><h2 className="mt-1 text-lg font-bold">{["早间发现","实用教程","工具对比","智能创作","晚间问答"][i]}</h2></div>
         <button onClick={()=>copy(p.text,String(i+1))} className="shrink-0 rounded-xl bg-indigo-700 px-4 py-2 text-base font-semibold text-white hover:bg-indigo-800">复制这条</button>
       </div>
       <pre className="whitespace-pre-wrap break-words rounded-xl bg-slate-50 p-4 font-sans text-base leading-7 text-slate-700">{p.text}</pre>
      </article>)}
     </section>
     <p className="mt-8 text-sm leading-7 text-slate-600">发布前核对实际产品状态及官方价格；不购买假成员，不批量私信陌生用户。月度收入必须以真实付款减去退款和成本核算。</p>
   </div>
 </main>;
}
