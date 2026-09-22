"use client";
import { useEffect,useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
const TOPUPS=[10,30,50,100,300,500];

export default function AiWalletPanel(){
 const sp=useSearchParams()??new URLSearchParams();
 const [data,setData]=useState<any>(null),[code,setCode]=useState<any>(null),[msg,setMsg]=useState("");
 async function load(){
  const r=await fetch("/api/ai/wallet",{cache:"no-store"}),d=await r.json();
  if(r.ok)setData(d);else setMsg(d.error||"请先登录");
 }
 useEffect(()=>{
  load();
  const ref=sp.get("ref");
  if(ref)fetch("/api/ai/referral/claim",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({code:ref})})
   .then(async r=>{const d=await r.json();setMsg(r.ok?"邀请关系已记录。好友每笔真实充值满 ¥50，你可获得该笔充值 10% 的 AI 使用额度。":d.error||"邀请码绑定失败。")})
   .catch(()=>{});
 },[]);
 async function invite(){const r=await fetch("/api/ai/referral/code"),d=await r.json();if(r.ok)setCode(d)}
 if(!data)return <div className="rounded-3xl border border-slate-200 bg-white p-6">{msg||"正在读取余额…"}</div>;
 const p=data.remainingPercent;
 return <div className="space-y-6">
  <section className="rounded-[30px] border border-slate-200 bg-white p-7">
   <div className="flex flex-wrap items-end justify-between gap-4">
    <div>
     <p className="text-sm text-slate-500">灵犀 AI 余额</p>
     <div className="mt-1 text-4xl font-semibold">¥{data.balanceRmb.toFixed(2)}</div>
     <p className="mt-2 text-xs text-slate-400">余额不会按周或按月清零，用多少扣多少，剩余长期保留。</p>
    </div>
    <div className="text-right"><p className="text-sm text-slate-500">余额状态</p><strong className="text-3xl">{p}%</strong></div>
   </div>
   <div className="mt-6 h-2.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-600 transition-all" style={{width:`${p}%`}}/></div>
   <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-3">
    <div>充值本金 <b>¥{data.principalRmb.toFixed(2)}</b></div>
    <div>赠送额度 <b>¥{data.bonusRmb.toFixed(2)}</b></div>
    <div>可申请原路退款本金 <b>¥{data.refundableRmb.toFixed(2)}</b></div>
   </div>
  </section>

  <section className="rounded-[30px] border border-slate-200 bg-white p-7">
   <h2 className="text-xl font-semibold">充值余额</h2>
   <p className="mt-2 text-sm leading-6 text-slate-500">充值多少到账多少。实际消耗取决于任务内容、上下文长度、回答长度与所选智能模式；不承诺固定可使用天数。</p>
   <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
    {TOPUPS.map(n=><Link key={n} href={`/checkout?productId=ai-balance-${n}&redirect=/ai-wallet`} className={`rounded-2xl border p-4 text-center ${n===50?"border-blue-300 bg-blue-50":"border-slate-200"}`}>
     <div className="text-2xl font-semibold">¥{n}</div>{n===50&&<div className="mt-1 text-xs text-blue-600">常用</div>}
    </Link>)}
   </div>
  </section>

  <section className="rounded-[30px] border border-slate-200 bg-white p-7">
   <h2 className="text-xl font-semibold">三档智能模式</h2>
   <div className="mt-4 grid gap-3 sm:grid-cols-3">
    <div className="rounded-2xl border border-slate-200 p-4"><b>轻量 · 1×</b><p className="mt-1 text-sm text-slate-500">快速问答、摘要、提取、简单资料任务。</p></div>
    <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4"><b>标准 · 2×</b><p className="mt-1 text-sm text-slate-500">默认推荐，文件分析、学习与常规 Agent。</p></div>
    <div className="rounded-2xl border border-slate-200 p-4"><b>高智能 · 5×</b><p className="mt-1 text-sm text-slate-500">复杂研究、代码、多步骤推理和更长回答。</p></div>
   </div>
   <p className="mt-3 text-xs leading-5 text-slate-400">“×”表示灵犀场计费消耗系数；最终仍以本次真实模型用量结算。</p>
  </section>

  <section className="rounded-[30px] border border-slate-200 bg-white p-7">
   <h2 className="text-xl font-semibold">邀请奖励</h2>
   <p className="mt-2 text-sm leading-6 text-slate-500">邀请的新用户绑定关系后，每笔真实 AI 余额充值达到 ¥50 或以上，你获得该笔充值金额 10% 的 AI 使用额度。赠送额度不能提现、不可退款、不可转账，并会优先于充值本金消耗。</p>
   <button onClick={invite} className="mt-4 rounded-full bg-slate-950 px-5 py-2.5 text-sm text-white">生成邀请链接</button>
   {code&&<div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm break-all">{code.url}<button onClick={()=>navigator.clipboard.writeText(code.url)} className="ml-3 text-blue-600">复制</button></div>}
  </section>
  {msg&&<p className="text-sm text-slate-600">{msg}</p>}
 </div>
}
