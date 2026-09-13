"use client";
import {useState} from "react";
import {useRouter} from "next/navigation";
import Link from "next/link";
export default function DeletableReportRow({id,kind,href,title,date}:{id:string;kind:string;href:string;title:string|null;date:string}){
 const router=useRouter();const [confirm,setConfirm]=useState(false);const [busy,setBusy]=useState(false);const [deleted,setDeleted]=useState(false);const [error,setError]=useState("");
 async function remove(){setBusy(true);setError("");try{const r=await fetch("/api/account/report/delete",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,kind}),signal:AbortSignal.timeout(15000)});const result=await r.json();if(!r.ok)throw new Error(result.error||"删除失败");setDeleted(true);router.refresh()}catch(e){setError(e instanceof Error&&e.name!=="TimeoutError"?e.message:"响应超时，请刷新核对记录后重试")}finally{setBusy(false)}}
 if(deleted)return null;
 return <div className="rounded-sm border border-white/10 px-4 py-3"><div className="flex flex-wrap items-center gap-3"><Link href={href} className="min-w-0 flex-1 text-lattice">{title||"未命名报告"}</Link><span className="text-xs text-bone-dim">{date}</span><button type="button" disabled={busy} onClick={()=>setConfirm(true)} className="text-xs text-blue-500 disabled:opacity-50" aria-label={"删除报告："+(title||"未命名报告")}>删除</button></div>{confirm&&<div className="mt-3 text-sm"><p>删除这份报告后无法恢复；支付订单仍保留。</p><div className="mt-2 flex gap-4"><button type="button" disabled={busy} onClick={remove} className="text-rose">{busy?"正在删除…":"确认删除"}</button><button type="button" disabled={busy} onClick={()=>{setConfirm(false);setError("")}}>取消</button></div></div>}{error&&<p role="alert" className="mt-2 text-sm text-rose">{error}</p>}</div>
}
