"use client";
import Link from "next/link";
import OrderExplorer from "@/components/OrderExplorer";
import {orderCopy,orderStatus,orderProvider,orderCategory} from "@/lib/money/order-i18n";
import {useLingxiLang,type LingxiLang} from "@/lib/lingxi-i18n";
import LingxiMiniIcon from "@/components/LingxiMiniIcon";
import ToolOrderRecoveryButton from "@/components/tools/ToolOrderRecoveryButton";
import {useEffect,useState} from 'react';
import {useRouter} from 'next/navigation';
import {useMoneyAutoRefresh} from '@/lib/money/use-money-auto-refresh';

export type AccountOrderViewRow={
 id:string;product_id:string;amount_rmb:number|null;amount_usd:number|null;currency:"CNY"|"USD"|null;
 status:string;provider:string|null;created_at:string;paid_at:string|null;group:string|null;nameZh:string|null;nameEn:string|null;
};
type Props={signedIn:boolean;loadFailed:boolean;paymentState:"pending"|"error"|null;orders:AccountOrderViewRow[]};
const locale=(lang:LingxiLang)=>lang==="zh"?"zh-CN":lang;
function amount(o:AccountOrderViewRow){
 const currency=o.currency||(o.provider==="paypal"?"USD":o.provider==="wechat"||o.provider==="alipay"?"CNY":null);
 if(currency==="USD"&&o.amount_usd!=null)return `$${Number(o.amount_usd).toFixed(2)} USD`;
 if(currency==="CNY"&&o.amount_rmb!=null)return `¥${Number(o.amount_rmb).toFixed(2)} CNY`;
 return o.amount_rmb!=null?`¥${Number(o.amount_rmb).toFixed(2)} CNY`:o.amount_usd!=null?`$${Number(o.amount_usd).toFixed(2)} USD`:"—";
}
export default function AccountOrdersHistory({signedIn,loadFailed,paymentState,orders:initialOrders}:Props){
 const{lang}=useLingxiLang();const zh=lang==="zh";const tr=orderCopy(lang);
 const router=useRouter(),[orders,setOrders]=useState(initialOrders),[deleting,setDeleting]=useState(false),[deleteError,setDeleteError]=useState('');
 useEffect(()=>setOrders(initialOrders),[initialOrders]);
 useMoneyAutoRefresh(()=>router.refresh(),signedIn&&orders.some(o=>o.status==='pending'));
 async function deleteOrders(ids:string[]){
  if(deleting||!ids.length)return;setDeleting(true);setDeleteError('');
  try{const r=await fetch('/api/account/orders',{method:'DELETE',headers:{'content-type':'application/json'},body:JSON.stringify({orderIds:ids})});
   const d=await r.json();if(!r.ok||!Array.isArray(d.deletedIds))throw Error();
   const removed=new Set(d.deletedIds);setOrders(current=>current.filter(o=>!removed.has(o.id)));router.refresh();
  }catch{setDeleteError(tr.deleteError)}finally{setDeleting(false)}
 }
 return <div className="mx-auto max-w-3xl px-6 py-20">
  <div className="flex items-start justify-between gap-4"><div><div className="lx-page-title-line"><LingxiMiniIcon name="orders" size="title"/><p className="lx11-kicker">{tr.account}</p></div><h1 className="mt-3 font-display text-3xl text-[var(--lx-ink)]">{tr.title}</h1></div><Link href="/account" className="text-sm text-[var(--lx-muted)]">← {tr.back}</Link></div>
  <p className="mt-4 text-sm leading-7 text-[var(--lx-muted)]">{tr.intro}</p>
  {paymentState==="pending"&&<p role="status" className="mt-6 rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-soft)] p-4 text-sm text-[var(--lx-ink)]">{tr.paymentPending}</p>}
  {paymentState==="error"&&<p role="alert" className="mt-6 rounded-2xl border border-[var(--lx-danger)] bg-[var(--lx-panel)] p-4 text-sm text-[var(--lx-ink)]">{tr.paymentFailed}</p>}
  {!signedIn&&<p className="mt-8 rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-6 text-[var(--lx-muted)]">{tr.login}</p>}
  {loadFailed&&<p role="alert" className="mt-8 rounded-2xl border border-[var(--lx-danger)] bg-[var(--lx-panel)] p-4 text-[var(--lx-ink)]">{tr.loadFailed}</p>}
  {signedIn&&!loadFailed&&orders.length===0&&<p className="mt-8 rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-6 text-[var(--lx-muted)]">{tr.empty}</p>}
  {signedIn&&!loadFailed&&<OrderExplorer/>}
  <details className="mt-6 rounded-xl border border-[var(--lx-line)] p-4"><summary className="cursor-pointer text-sm text-[var(--lx-muted)]">{tr.legacy}</summary><div className="mt-5 space-y-3">
   {deleteError&&<p role="alert">{deleteError}</p>}
   {orders.some(o=>['refunded','canceled','cancelled','failed'].includes(o.status))&&<button disabled={deleting} className="text-sm underline" onClick={()=>void deleteOrders(orders.filter(o=>['refunded','canceled','cancelled','failed'].includes(o.status)).map(o=>o.id))}>{tr.deleteClosed}</button>}
   {orders.map(o=>{const tool=o.product_id.startsWith("toolquote:"),viewAi=o.group==="ai"||o.product_id.startsWith("ai-usd-balance-"),viewSasi=o.group==="production"||o.product_id.startsWith("sasi-usd-balance-");return <article key={o.id} className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-5 lx-order-card">
    <div className="flex flex-wrap items-start justify-between gap-3">
     <div className="min-w-0 lx-order-main"><LingxiMiniIcon name={tool?"tools":viewSasi?"sasi":viewAi?"wallet":"orders"} size="title"/><div><p className="text-[11px] text-[var(--lx-faint)]">{tr.order} {o.id}</p><h2 className="mt-2 font-display text-lg text-[var(--lx-ink)]">{orderCategory(o.product_id,lang)}</h2><p className="mt-2 text-xs text-[var(--lx-muted)]">{new Date(o.created_at).toLocaleString(locale(lang))} · {orderProvider(o.provider,lang)}</p></div></div>
     <div className="text-right lx-order-side"><b className="text-lg text-[var(--lx-ink)]">{amount(o)}</b><p className={`mt-1 text-xs lx-order-status status-${o.status}`}>{orderStatus(o.status,lang)}</p></div>
    </div>
    {viewAi&&<Link href="/ai-wallet" className="mt-4 inline-block text-sm text-[var(--lx-ink)]">{zh?"查看 AI 余额":"View AI balance"} →</Link>}
    {viewSasi&&<Link href="/sasi/pricing" className="mt-4 inline-block text-sm text-[var(--lx-ink)]">{zh?"查看 SASI 余额":"View SASI balance"} →</Link>}
    {tool&&<div className="mt-4"><ToolOrderRecoveryButton quoteId={o.product_id.slice("toolquote:".length)}/></div>}
    <button disabled={deleting} className="mt-4 block text-sm underline" onClick={()=>void deleteOrders([o.id])}>{tr.deleteOne}</button>
   </article>})}
  </div></details>
 </div>;
}
