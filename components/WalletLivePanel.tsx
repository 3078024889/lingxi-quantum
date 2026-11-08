"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import LxText from "@/components/LxText";
import WalletLedgerPanel from "@/components/WalletLedgerPanel";
import {BALANCE_TOPUP_AMOUNTS} from "@/lib/balance-topups";

type Currency="CNY"|"USD";
type Balance={availableMinor:number;refundableMinor:number;refundHoldMinor:number};
type Withdrawal={id:string;currency:string;amount_minor:number;created_at:string;normalized_status:string};
type Summary={balances:Record<Currency,Balance>;withdrawals:Withdrawal[]};
type State={status:"loading"|"login"|"error"|"ready";summary?:Summary};
const money=(currency:Currency,amount:number)=>{
 if(!Number.isSafeInteger(amount))return "—";
 return new Intl.NumberFormat(currency==="CNY"?"zh-CN":"en-US",{style:"currency",currency}).format(amount/100);
};
function validBalance(value:unknown):value is Balance{
 if(!value||typeof value!=="object")return false;
 const b=value as Partial<Balance>;
 return [b.availableMinor,b.refundableMinor,b.refundHoldMinor].every(n=>typeof n==="number"&&Number.isSafeInteger(n));
}
function validSummary(value:unknown):value is Summary{
 if(!value||typeof value!=="object")return false;
 const v=value as Partial<Summary>;
 return !!v.balances&&validBalance(v.balances.CNY)&&validBalance(v.balances.USD)&&Array.isArray(v.withdrawals);
}
export default function WalletLivePanel(){
 const [data,setData]=useState<State>({status:"loading"});
 const [providers,setProviders]=useState<{wechat:boolean;alipay:boolean}|null>(null);
 useEffect(()=>{
  const controller=new AbortController();
  const load=async()=>{
   try{
    const response=await fetch("/api/money/summary",{
     method:"GET",cache:"no-store",credentials:"same-origin",signal:controller.signal,
     headers:{"Accept":"application/json"}
    });
    if(response.status===401){setData({status:"login"});return;}
    if(!response.ok)throw Error("MONEY_SUMMARY_UNAVAILABLE");
    const result:unknown=await response.json();
    if(!validSummary(result))throw Error("INVALID_BALANCE_SNAPSHOT");
    setData({status:"ready",summary:result});
   }catch{
    if(!controller.signal.aborted)setData({status:"error"});
   }
  };
  const loadProviders=async()=>{
   try{
    const response=await fetch("/api/pay/providers",{cache:"no-store",credentials:"same-origin",signal:controller.signal});
    if(!response.ok)return;
    const p=await response.json();
    if(!controller.signal.aborted)setProviders({wechat:p.wechat===true,alipay:p.alipay===true});
   }catch{}
  };
  void load();void loadProviders();
  return()=>controller.abort();
 },[]);
 if(data.status==="loading")return <div role="status" aria-live="polite" className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-8">
  <LxText zh="正在安全读取账户余额…" en="Loading your secure account balance…"/>
 </div>;
 if(data.status==="login")return <div className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-8">
  <p><LxText zh="登录后查看真实余额与账本记录。" en="Sign in to view your real balance and ledger."/></p>
  <Link href="/account?next=%2Fai-wallet" className="mt-5 inline-flex rounded-lg bg-[var(--lx-ink)] px-5 py-3 text-sm text-[var(--lx-bg)]">
   <LxText zh="登录账户" en="Sign in"/>
  </Link>
 </div>;
 if(data.status!=="ready"||!data.summary)return <section role="alert" className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-8">
  <p><LxText zh="余额账本暂时无法读取。为防止显示错误金额，当前不展示任何余额。" en="The balance service is unavailable. No unverified amount will be shown."/></p>
  <button type="button" onClick={()=>window.location.reload()} className="mt-4 rounded-xl border px-4 py-2">
   <LxText zh="重新读取" en="Retry"/>
  </button>
  <Link href="/account/orders" className="ml-4 underline"><LxText zh="订单记录" en="Orders"/></Link>
 </section>;
 const {balances,withdrawals}=data.summary;
 const payReady=providers?.wechat===true||providers?.alipay===true;
 return <>
  <div className="grid gap-4 sm:grid-cols-2">
   {(["CNY","USD"] as const).map(currency=>{
    const balance=balances[currency];
    return <section key={currency} className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-6 shadow-sm">
     <p className="text-sm text-[var(--lx-muted)]">{currency==="CNY"?<LxText zh="人民币余额" en="CNY balance"/>:<LxText zh="美元余额" en="USD balance"/>}</p>
     <p className="mt-4 font-display text-3xl font-semibold text-[var(--lx-ink)]">{money(currency,balance.availableMinor)}</p>
     <div className="mt-6 grid grid-cols-2 gap-3 border-t border-[var(--lx-line)] pt-4 text-xs text-[var(--lx-muted)]">
      <div><p><LxText zh="可退金额" en="Refundable"/></p><p className="mt-2 font-semibold">{money(currency,balance.refundableMinor)}</p></div>
      <div><p><LxText zh="退款占用" en="Refund hold"/></p><p className="mt-2 font-semibold">{money(currency,balance.refundHoldMinor)}</p></div>
     </div>
    </section>;
   })}
  </div>
  <section className="mt-8 rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-6">
   <h2 className="text-xl font-semibold"><LxText zh="人民币余额充值" en="Top up CNY balance"/></h2>
   <p className="mt-2 text-sm text-[var(--lx-muted)]"><LxText zh="仅在支付回调完成服务端验证后入账。" en="Credit is added only after verified payment."/></p>
   <p role="status" className="mt-3 text-sm text-[var(--lx-muted)]">{payReady?
    <LxText zh="当前存在可用支付通道" en="Payment provider available"/>:
    <LxText zh="支付通道未开放时不会扣款或创建收费订单" en="No charge or paid order is created while providers are disabled"/>}</p>
   <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
    {BALANCE_TOPUP_AMOUNTS.map(amount=><Link key={amount} href={`/checkout?productId=sasi-balance-${amount}&redirect=%2Fai-wallet`}
      className="rounded-xl border border-[var(--lx-line)] bg-[var(--lx-soft)] px-4 py-4 text-center text-lg font-semibold transition hover:border-[var(--lx-line-strong)]">¥{amount}</Link>)}
   </div>
  </section>
  <section className="mt-8 rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-6">
   <h2 className="text-xl font-semibold"><LxText zh="退款与提现记录" en="Refund and withdrawal history"/></h2>
   {withdrawals.length? <div className="mt-4 divide-y divide-[var(--lx-line)]">
    {withdrawals.map((r,i)=><div key={r.id||i} className="flex items-center justify-between gap-3 py-3 text-sm">
     <div><p className="font-semibold">{money(r.currency==="USD"?"USD":"CNY",Number(r.amount_minor))}</p>
      <p className="mt-1 text-xs text-[var(--lx-muted)]">{new Date(r.created_at).toLocaleDateString()}</p></div>
     <span className="text-[var(--lx-muted)]">{String(r.normalized_status||"—")}</span>
    </div>)}
   </div>:<p className="mt-4 text-sm text-[var(--lx-muted)]"><LxText zh="暂无退款或提现记录。" en="No refunds or withdrawals recorded."/></p>}
   <Link href="/account/support" className="mt-4 inline-block text-sm underline"><LxText zh="退款问题与处理进度" en="Refund support"/></Link>
  </section>
  <div className="mt-6 flex flex-wrap gap-3 text-sm">
   <Link href="/account/orders" className="rounded-xl border px-5 py-3"><LxText zh="订单与充值记录" en="Orders & top-up history"/></Link>
   <Link href="/account/withdrawals" className="rounded-xl border px-5 py-3"><LxText zh="退款与提现" en="Refunds & withdrawals"/></Link>
   <Link href="/account" className="rounded-xl border px-5 py-3"><LxText zh="账户信息" en="Account"/></Link>
  </div>
  <WalletLedgerPanel currency="CNY"/>
  <WalletLedgerPanel currency="USD"/>
 </>;
}
