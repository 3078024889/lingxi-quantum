"use client";
import { useEffect,useState } from "react";

export default function ToolAnalyticsDashboard(){
  const [days,setDays]=useState(30),[data,setData]=useState<any>(null),[error,setError]=useState("");
  useEffect(()=>{setData(null);setError("");fetch(`/api/tools/analytics/summary?days=${days}`,{cache:"no-store"}).then(async r=>{const d=await r.json();if(!r.ok)throw new Error(d.error||"读取失败");setData(d)}).catch(e=>setError(e.message))},[days]);

  return <div className="mx-auto max-w-6xl px-4 py-10">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-3xl font-semibold text-slate-950">工具分析</h1><p className="mt-2 text-sm text-slate-500">只统计工具行为，不采集用户文件内容。</p></div><select value={days} onChange={e=>setDays(Number(e.target.value))} className="rounded-xl border border-slate-200 bg-white px-3 py-2"><option value={7}>近7天</option><option value={30}>近30天</option><option value={90}>近90天</option></select></div>
    {error&&<div className="mt-6 rounded-2xl bg-rose-50 p-4 text-sm text-rose-700">{error}{error==="无权限"&&<div className="mt-2">请在环境变量 <code>TOOL_ADMIN_EMAILS</code> 中加入你的登录邮箱。</div>}</div>}
    {data&&<><div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{[
      ["事件",data.totals.events],["付费订单",data.totals.paidQuotes],["收入",`¥${data.totals.revenueRmb}`],["搜索",data.totals.searches],["未命中",data.totals.unmatchedSearches]
    ].map(([k,v])=><div key={String(k)} className="rounded-2xl border border-slate-200 bg-white p-4"><div className="text-xs text-slate-500">{k}</div><div className="mt-2 text-2xl font-semibold text-slate-950">{v}</div></div>)}</div>
    <div className="mt-8 overflow-x-auto rounded-2xl border border-slate-200 bg-white"><table className="w-full min-w-[760px] text-sm"><thead className="bg-slate-50 text-left text-slate-500"><tr><th className="p-3">工具</th><th>打开</th><th>开始</th><th>完成</th><th>失败</th><th>付费</th><th>收入</th></tr></thead><tbody>{data.tools.map((x:any)=><tr key={x.toolId} className="border-t border-slate-100"><td className="p-3 font-medium">{x.toolId}</td><td>{x.opens}</td><td>{x.started}</td><td>{x.completed}</td><td>{x.failed}</td><td>{x.paid}</td><td>¥{x.revenue}</td></tr>)}</tbody></table></div>
    <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5"><h2 className="font-semibold">未命中搜索</h2><p className="mt-1 text-sm text-slate-500">这些词就是下一批工具需求。</p><div className="mt-4 space-y-2">{data.unmatchedSearches.length?data.unmatchedSearches.map((x:any)=><div key={x.query} className="flex justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm"><span>{x.query}</span><b>{x.count}</b></div>):<div className="text-sm text-slate-400">暂无</div>}</div></div>
    </>}
  </div>
}
