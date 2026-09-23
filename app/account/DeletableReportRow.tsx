"use client";
import {useState} from "react";
import {useRouter} from "next/navigation";
import Link from "next/link";
import {useLingxiLang} from "@/lib/lingxi-i18n";
import {v104sText} from "@/lib/v104s-i18n";

export default function DeletableReportRow({id,kind,href,title,date}:{id:string;kind:string;href:string;title:string|null;date:string}){
 const router=useRouter();const{lang}=useLingxiLang();const t=(zh:string,en:string)=>v104sText(lang,zh,en);
 const [confirm,setConfirm]=useState(false);const [busy,setBusy]=useState(false);const [deleted,setDeleted]=useState(false);const [error,setError]=useState("");
 async function remove(){setBusy(true);setError("");try{const r=await fetch("/api/account/report/delete",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,kind}),signal:AbortSignal.timeout(15000)});const result=await r.json();if(!r.ok)throw new Error(result.error||t("删除失败","Delete failed"));setDeleted(true);router.refresh()}catch(e){setError(e instanceof Error&&e.name!=="TimeoutError"?e.message:t("响应超时，请刷新核对记录后重试","Response timed out. Refresh, verify the record, and try again."))}finally{setBusy(false)}}
 if(deleted)return null;
 const displayTitle=title||t("未命名报告","Untitled report");
 return <div className="rounded-sm border border-white/10 px-4 py-3"><div className="flex flex-wrap items-center gap-3"><Link href={href} className="min-w-0 flex-1 text-lattice">{displayTitle}</Link><span className="text-xs text-bone-dim">{date}</span><button type="button" disabled={busy} onClick={()=>setConfirm(true)} className="text-xs text-blue-500 disabled:opacity-50" aria-label={t("删除报告：","Delete report: ")+displayTitle}>{t("删除","Delete")}</button></div>{confirm&&<div className="mt-3 text-sm"><p>{t("删除这份报告后无法恢复；支付订单仍保留。","This report cannot be recovered after deletion; the payment order will remain.")}</p><div className="mt-2 flex gap-4"><button type="button" disabled={busy} onClick={remove} className="text-rose">{busy?t("正在删除…","Deleting…"):t("确认删除","Confirm deletion")}</button><button type="button" disabled={busy} onClick={()=>{setConfirm(false);setError("")}}>{t("取消","Cancel")}</button></div></div>}{error&&<p role="alert" className="mt-2 text-sm text-rose">{error}</p>}</div>
}
