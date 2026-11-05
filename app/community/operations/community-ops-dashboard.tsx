"use client";

import {useEffect,useState} from "react";
import Link from "next/link";

type Snapshot={snapshot_day:string;member_count:number|null;posts_delivered:number};
type Report={periodDays:number;telegramVisits:number;qqVisits:number;postsDelivered:number;postsFailed:number;members:number|null;latestSnapshot:string|null;snapshots:Snapshot[];revenueAttribution:string;note:string};
export default function CommunityOpsDashboard(){
 const [data,setData]=useState<Report|null>(null);
 const [status,setStatus]=useState("读取运营数据……");
 useEffect(()=>{
  const controller=new AbortController();
  fetch("/api/account/telegram-operations",{credentials:"same-origin",cache:"no-store",signal:controller.signal})
   .then(async response=>{
    if(response.status===403)throw new Error("只有网站管理账户可以查看");
    if(!response.ok)throw new Error("数据暂时不可用");
    return response.json() as Promise<Report>;
   }).then(value=>{setData(value);setStatus("")}).catch(e=>{if(!controller.signal.aborted)setStatus(String(e?.message||"读取失败"))});
  return ()=>controller.abort();
 },[]);
 return <main className="min-h-screen bg-gradient-to-b from-indigo-50 to-white px-4 py-10 text-slate-900">
  <div className="mx-auto max-w-5xl">
   <Link href="/community" className="text-base font-semibold text-indigo-700">返回官方社区介绍</Link>
   <h1 className="mt-4 text-3xl font-bold">全球 SIAI · 社区运营看板</h1>
   <p className="mt-2 text-base text-slate-600">仅限网站管理账户。最近 30 天真实记录，不把访问当作付款。</p>
   {status&&<p role="status" className="mt-6 rounded-2xl border bg-white p-5 text-base">{status}</p>}
   {data&&<>
    <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
     {[
      {label:"Telegram 来源访问",value:data.telegramVisits},
      {label:"QQ群来源访问",value:data.qqVisits},
      {label:"30 日已发送内容",value:data.postsDelivered},
      {label:"当前群成员数",value:data.members??"尚无采集"},
     ].map(x=><div key={x.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-base text-slate-500">{x.label}</p><p className="mt-3 text-3xl font-bold">{x.value}</p></div>)}
    </section>
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
     <h2 className="text-xl font-bold">发布与增长</h2>
     <p className="mt-2 text-base text-slate-600">失败发送：{data.postsFailed} 次；最新成员快照：{data.latestSnapshot||"尚无"}。</p>
     <div className="mt-4 overflow-auto">
      <table className="w-full min-w-[440px] text-left text-base">
       <thead><tr className="border-b"><th className="py-3">日期</th><th>群成员</th><th>已发布条数</th></tr></thead>
       <tbody>{data.snapshots.map(s=><tr className="border-b" key={s.snapshot_day}><td className="py-3">{s.snapshot_day}</td><td>{s.member_count??"待核"}</td><td>{s.posts_delivered}/5</td></tr>)}</tbody>
      </table>
      {!data.snapshots.length&&<p className="py-4 text-base text-slate-500">自动发布开始后才会生成实际数据。</p>}
     </div>
    </section>
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="text-xl font-bold">收入归因</h2>
      <p className="mt-3 text-base text-slate-700">当前未建立从 Telegram/QQ 点击到已核实订单的完整归因链，因此不展示猜测营业额或虚构转化率。</p>
      <p className="mt-3 text-sm text-slate-500">{data.note}</p>
    </section>
    <Link href="/community/share-kit" className="mt-6 inline-block rounded-xl bg-indigo-700 px-5 py-3 text-base font-semibold text-white">打开今日五条推广文案</Link>
   </>}
  </div>
 </main>;
}
