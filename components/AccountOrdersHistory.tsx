"use client";
import Link from "next/link";
import {useLingxiLang,type LingxiLang} from "@/lib/lingxi-i18n";
import LingxiMiniIcon from "@/components/LingxiMiniIcon";
import ToolOrderRecoveryButton from "@/components/tools/ToolOrderRecoveryButton";

export type AccountOrderViewRow={
 id:string;product_id:string;amount_rmb:number|null;amount_usd:number|null;currency:"CNY"|"USD"|null;
 status:string;provider:string|null;created_at:string;paid_at:string|null;group:string|null;nameZh:string|null;nameEn:string|null;
};
type Props={signedIn:boolean;loadFailed:boolean;paymentState:"pending"|"error"|null;orders:AccountOrderViewRow[]};
const locale=(lang:LingxiLang)=>lang==="zh"?"zh-CN":lang;
const stateText=(s:string,zh:boolean)=>s==="pending"?(zh?"等待付款":"Awaiting payment"):s==="paid"?(zh?"已到账":"Paid"):s==="failed"?(zh?"未完成":"Not completed"):s==="refunded"?(zh?"已退款":"Refunded"):s==="cancelled"?(zh?"已取消":"Cancelled"):s;
const provider=(p:string|null)=>p==="paypal"?"PayPal":p==="wechat"?"WeChat Pay":p==="alipay"?"Alipay":"—";

function amount(o:AccountOrderViewRow){
 const currency=o.currency||(o.provider==="paypal"?"USD":o.provider==="wechat"||o.provider==="alipay"?"CNY":null);
 if(currency==="USD"&&o.amount_usd!=null)return `$${Number(o.amount_usd).toFixed(2)} USD`;
 if(currency==="CNY"&&o.amount_rmb!=null)return `¥${Number(o.amount_rmb).toFixed(2)} CNY`;
 return o.amount_rmb!=null?`¥${Number(o.amount_rmb).toFixed(2)} CNY`:o.amount_usd!=null?`$${Number(o.amount_usd).toFixed(2)} USD`:"—";
}
function label(o:AccountOrderViewRow,lang:LingxiLang){
 const zh=lang==="zh";
 if(o.product_id.startsWith("toolquote:"))return zh?"实用工具任务":"Utility tool task";
 if(o.product_id.startsWith("ai-usd-balance-")||o.product_id.startsWith("ai-balance-"))return zh?"AI 余额充值":"AI balance top-up";
 if(o.product_id.startsWith("sasi-usd-balance-")||o.product_id.startsWith("sasi-balance-")||o.product_id.startsWith("sasi-credit-"))return zh?"SASI 创作余额充值":"SASI creation balance top-up";
 if(zh&&o.nameZh)return o.nameZh;
 return o.nameEn||(zh?"其他历史记录":"Other historical record");
}

export default function AccountOrdersHistory({signedIn,loadFailed,paymentState,orders}:Props){
 const{lang}=useLingxiLang();const zh=lang==="zh";
 return <div className="mx-auto max-w-3xl px-6 py-20">
  <div className="flex items-start justify-between gap-4"><div><div className="lx-page-title-line"><LingxiMiniIcon name="orders" size="title"/><p className="lx11-kicker">{zh?"账户":"Account"}</p></div><h1 className="mt-3 font-display text-3xl text-[var(--lx-ink)]">{zh?"订单与使用记录":"Orders & usage"}</h1></div><Link href="/account" className="text-sm text-[var(--lx-muted)]">← {zh?"返回账户":"Back to account"}</Link></div>
  <p className="mt-4 text-sm leading-7 text-[var(--lx-muted)]">{zh?"每一笔订单都保留购买时的币种、金额与支付方式。":"Every order keeps the currency, amount and payment method used at purchase."}</p>
  {paymentState==="pending"&&<p role="status" className="mt-6 rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-soft)] p-4 text-sm text-[var(--lx-ink)]">{zh?"付款已经返回，正在确认到账。请不要重复支付。":"Payment returned and is being confirmed. Do not pay again."}</p>}
  {paymentState==="error"&&<p role="alert" className="mt-6 rounded-2xl border border-[var(--lx-danger)] bg-[var(--lx-panel)] p-4 text-sm text-[var(--lx-ink)]">{zh?"这次付款还没有确认到账。":"This payment has not been confirmed yet."}</p>}
  {!signedIn&&<p className="mt-8 rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-6 text-[var(--lx-muted)]">{zh?"请先登录查看订单。":"Please sign in to view orders."}</p>}
  {loadFailed&&<p role="alert" className="mt-8 rounded-2xl border border-[var(--lx-danger)] bg-[var(--lx-panel)] p-4 text-[var(--lx-ink)]">{zh?"订单暂时无法读取，请刷新重试。":"Orders could not be loaded. Refresh and try again."}</p>}
  {signedIn&&!loadFailed&&orders.length===0&&<p className="mt-8 rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-6 text-[var(--lx-muted)]">{zh?"还没有订单。":"No orders yet."}</p>}
  <div className="mt-8 space-y-3">
   {orders.map(o=>{const tool=o.product_id.startsWith("toolquote:"),viewAi=o.group==="ai"||o.product_id.startsWith("ai-usd-balance-"),viewSasi=o.group==="production"||o.product_id.startsWith("sasi-usd-balance-");return <article key={o.id} className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-5 lx-order-card">
    <div className="flex flex-wrap items-start justify-between gap-3">
     <div className="min-w-0 lx-order-main"><LingxiMiniIcon name={tool?"tools":viewSasi?"sasi":viewAi?"wallet":"orders"} size="title"/><div><p className="text-[11px] text-[var(--lx-faint)]">{zh?"订单号":"Order"} {o.id}</p><h2 className="mt-2 font-display text-lg text-[var(--lx-ink)]">{label(o,lang)}</h2><p className="mt-2 text-xs text-[var(--lx-muted)]">{new Date(o.created_at).toLocaleString(locale(lang))} · {provider(o.provider)}</p></div></div>
     <div className="text-right lx-order-side"><b className="text-lg text-[var(--lx-ink)]">{amount(o)}</b><p className={`mt-1 text-xs lx-order-status status-${o.status}`}>{stateText(o.status,zh)}</p></div>
    </div>
    {viewAi&&<Link href="/ai-wallet" className="mt-4 inline-block text-sm text-[var(--lx-ink)]">{zh?"查看 AI 余额":"View AI balance"} →</Link>}
    {viewSasi&&<Link href="/sasi/pricing" className="mt-4 inline-block text-sm text-[var(--lx-ink)]">{zh?"查看 SASI 余额":"View SASI balance"} →</Link>}
    {tool&&<div className="mt-4"><ToolOrderRecoveryButton quoteId={o.product_id.slice("toolquote:".length)}/></div>}
   </article>})}
  </div>
 </div>;
}
