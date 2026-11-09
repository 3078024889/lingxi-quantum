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
 const [tab,setTab]=useState<"ledger"|"withdrawals">("ledger");
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
 return <div className="lx26-wallet">
  <section className="lx26-wallet-overview">
   <h2 className="lx26-section-title"><span className="lx26-wallet-symbol">◇</span><LxText zh="资产总览" en="Balance overview" ja="資産概要" ko="잔액 개요" fr="Vue d'ensemble" de="Guthabenübersicht" es="Resumen de saldo" pt="Resumo do saldo" ar="نظرة عامة"/></h2>
   <div className="lx26-balance-grid">
    {(["CNY","USD"] as const).map(currency=>{
      const b=balances[currency];
      return <section key={currency} className={"lx26-balance-card "+(currency==="CNY"?"is-cny":"is-usd")} aria-label={currency}>
       <div className="lx26-balance-primary">
        <span className="lx26-currency-symbol" aria-hidden="true">{currency==="CNY"?"¥":"$"}</span>
        <span><small>{currency==="CNY"?<LxText zh="人民币余额" en="CNY balance"/>:<LxText zh="美元余额" en="USD balance"/>}</small><strong>{money(currency,b.availableMinor)}</strong></span>
       </div>
       <div className="lx26-balance-metrics">
        <span><small><LxText zh="可退金额" en="Refundable"/></small><b>{money(currency,b.refundableMinor)}</b></span>
        <span><small><LxText zh="退款占用" en="Refund hold"/></small><b>{money(currency,b.refundHoldMinor)}</b></span>
       </div>
      </section>;
    })}
   </div>
  </section>
  <section className="lx26-wallet-topup">
   <div className="lx26-topup-selector">
    <h2 className="lx26-section-title"><span aria-hidden="true">▣</span><LxText zh="人民币充值" en="CNY top-up"/></h2>
    <p><LxText zh="选择充值金额" en="Choose an amount"/></p>
    <div className="lx26-topup-amounts">
     {BALANCE_TOPUP_AMOUNTS.map(amount=>payReady?
      <Link key={amount} href={`/checkout?productId=sasi-balance-${amount}&redirect=%2Fai-wallet`} className="lx26-topup-choice">¥{amount}</Link>:
      <span key={amount} className="lx26-topup-choice is-unavailable" aria-disabled="true">¥{amount}</span>)}
    </div>
   </div>
   <div className="lx26-wallet-quicklinks">
    <h2 className="lx26-section-title"><span aria-hidden="true">✧</span><LxText zh="账户服务" en="Account services"/></h2>
    <Link href="/account/orders"><LxText zh="订单与使用记录" en="Orders & history"/><span aria-hidden="true">›</span></Link>
    <Link href="/account/withdrawals"><LxText zh="退款与提现" en="Refunds & withdrawals"/><span aria-hidden="true">›</span></Link>
    <Link href="/account/support"><LxText zh="处理进度" en="Support progress"/><span aria-hidden="true">›</span></Link>
   </div>
  </section>
  <section className="lx26-wallet-history">
   <div className="lx26-wallet-history-tabs" role="tablist" aria-label="Wallet history">
    <button type="button" role="tab" aria-selected={tab==="ledger"} className={tab==="ledger"?"is-active":""} onClick={()=>setTab("ledger")}><LxText zh="充值与余额流水" en="Wallet activity"/></button>
    <button type="button" role="tab" aria-selected={tab==="withdrawals"} className={tab==="withdrawals"?"is-active":""} onClick={()=>setTab("withdrawals")}><LxText zh="退款与提现" en="Refunds & withdrawals"/></button>
   </div>
   {tab==="ledger"?<div role="tabpanel" className="lx26-wallet-ledgers"><WalletLedgerPanel currency="CNY"/><WalletLedgerPanel currency="USD"/></div>:
    <div role="tabpanel" className="lx26-wallet-withdrawals">
      {withdrawals.length?withdrawals.map(r=><div className="lx26-withdrawal-row" key={r.id}><span><strong>{money(r.currency==="USD"?"USD":"CNY",Number(r.amount_minor))}</strong><small>{new Date(r.created_at).toLocaleDateString()}</small></span><span>{String(r.normalized_status||"—")}</span></div>):
       <div className="lx26-wallet-empty"><span aria-hidden="true">▤</span><h3><LxText zh="暂无记录" en="No records yet"/></h3><p><LxText zh="当前暂无退款或提现记录。" en="No refunds or withdrawals recorded."/></p></div>}
    </div>}
  </section>
 </div>;
}
