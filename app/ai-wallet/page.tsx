import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import LxText from "@/components/LxText";
import {createClient,getServerUser,isSupabasePublicConfigured} from "@/lib/supabase/server";
import {readUnifiedBalanceSnapshot} from "@/lib/money/unified-balance";
import {formatMinor} from "@/lib/money/invariants";
import {BALANCE_TOPUP_AMOUNTS} from "@/lib/balance-topups";
import {wechatPayEnabled} from "@/lib/wechatpay";
import {alipayEnabled} from "@/lib/alipay";

export const dynamic="force-dynamic";
export const metadata={
 title:"余额与充值 | 灵犀场 LINGXIFIELD",
 robots:{index:false,follow:false}
};

export default async function WalletPage(){
 const supabase=isSupabasePublicConfigured()?createClient():null;
 const user=supabase?await getServerUser(supabase):null;
 let balances:Awaited<ReturnType<typeof readUnifiedBalanceSnapshot>>|null=null;
 let readFailed=false;
 if(user&&supabase){
  try{
   balances=await readUnifiedBalanceSnapshot(supabase,user.id);
  }catch{
   readFailed=true;
  }
 }
 const wechat=wechatPayEnabled();
 const alipay=alipayEnabled();
 const anyPayment=wechat||alipay;
 return <>
  <Nav/>
  <main className="lx11-page">
   <section className="mx-auto max-w-5xl px-5 py-10 md:px-8 md:py-16">
    <div className="mb-8">
     <p className="text-xs font-semibold tracking-[.2em] text-[var(--lx-faint)]">LINGXIFIELD · WALLET</p>
     <h1 className="mt-3 font-display text-3xl font-semibold text-[var(--lx-ink)]">
      <LxText zh="余额与充值" en="Balance & top-ups" ja="残高とチャージ" ko="잔액 및 충전" fr="Solde et recharges" de="Guthaben & Aufladungen" es="Saldo y recargas" pt="Saldo e recargas" ar="الرصيد والشحن"/>
     </h1>
     <p className="mt-3 text-sm leading-7 text-[var(--lx-muted)]">
      <LxText zh="余额、充值、订单和退款记录分开显示。支付成功须经服务端确认后才会入账。" en="Balances, top-ups, orders and refunds are shown separately. Credit is added only after server-verified payment."/>
     </p>
    </div>
    {!user ? (
     <div className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-8">
      <p className="text-sm text-[var(--lx-ink)]"><LxText zh="登录后查看真实余额与账本记录。" en="Sign in to view your actual balance and ledger."/></p>
      <Link href="/account?next=%2Fai-wallet" className="mt-5 inline-flex rounded-lg bg-[var(--lx-ink)] px-5 py-3 text-sm text-[var(--lx-bg)]">
       <LxText zh="登录账户" en="Sign in"/>
      </Link>
     </div>
    ) : (
     <>
      {readFailed && <p role="alert" className="mb-6 rounded-xl border border-[var(--lx-line)] p-4 text-sm text-[var(--lx-ink)]">
       <LxText zh="余额账本暂时无法读取，金额不会显示为零。请稍后刷新或查看订单记录。" en="The balance ledger is temporarily unavailable. Missing amounts are not shown as zero. Please retry or check your orders."/>
      </p>}
      <div className="grid gap-4 sm:grid-cols-2">
       {(["CNY","USD"] as const).map(currency=>{
        const balance=balances?.[currency];
        return <section key={currency} className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-6 shadow-sm">
         <p className="text-sm text-[var(--lx-muted)]">{currency==="CNY"?<LxText zh="人民币余额" en="CNY balance"/>:<LxText zh="美元余额" en="USD balance"/>}</p>
         <p className="mt-4 font-display text-3xl font-semibold text-[var(--lx-ink)]">
          {balance?formatMinor(currency,balance.availableMinor):"—"}
         </p>
         <div className="mt-6 grid grid-cols-2 gap-3 border-t border-[var(--lx-line)] pt-4 text-xs text-[var(--lx-muted)]">
          <div><p><LxText zh="可退金额" en="Refundable"/></p><p className="mt-2 font-semibold text-[var(--lx-ink)]">{balance?formatMinor(currency,balance.refundableMinor):"—"}</p></div>
          <div><p><LxText zh="退款占用" en="Refund hold"/></p><p className="mt-2 font-semibold text-[var(--lx-ink)]">{balance?formatMinor(currency,balance.refundHoldMinor):"—"}</p></div>
         </div>
        </section>;
       })}
      </div>
      <section className="mt-8 rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-6">
       <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
         <h2 className="text-xl font-semibold text-[var(--lx-ink)]"><LxText zh="人民币余额充值" en="Top up CNY balance"/></h2>
         <p className="mt-2 text-sm text-[var(--lx-muted)]">
          <LxText zh="先确认金额，再进入支付页面。仅支付回调验证成功后入账。" en="Review the amount before checkout. Credit is posted only after verified payment."/>
         </p>
        </div>
        <p role="status" className="text-sm text-[var(--lx-muted)]">
         {anyPayment?<LxText zh="支付通道状态：有可用渠道" en="Payment provider: available"/>:<LxText zh="支付通道暂未开放，无法创建收费订单" en="Payment provider: temporarily unavailable; no charge will be created"/>}
        </p>
       </div>
       <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {BALANCE_TOPUP_AMOUNTS.map(amount=>(
         <Link key={amount} href={`/checkout?productId=sasi-balance-${amount}&redirect=%2Fai-wallet`}
          className="rounded-xl border border-[var(--lx-line)] bg-[var(--lx-soft)] px-4 py-4 text-center text-lg font-semibold text-[var(--lx-ink)] transition hover:border-[var(--lx-line-strong)]">
          ¥{amount}
         </Link>
        ))}
       </div>
       {!anyPayment&&<p className="mt-4 text-xs text-[var(--lx-muted)]">
        <LxText zh="金额可点击查看支付确认页。支付通道关闭时不会扣款，也不会自动创建订单。" en="You can review the checkout page. No charge or order is created while payment providers are disabled."/>
       </p>}
      </section>
      <div className="mt-6 flex flex-wrap gap-3 text-sm">
       <Link href="/account/orders" className="rounded-xl border border-[var(--lx-line)] px-5 py-3 text-[var(--lx-ink)]">
        <LxText zh="订单与充值记录" en="Orders & top-up history"/>
       </Link>
       <Link href="/account/withdrawals" className="rounded-xl border border-[var(--lx-line)] px-5 py-3 text-[var(--lx-ink)]">
        <LxText zh="退款与提现" en="Refunds & withdrawals"/>
       </Link>
       <Link href="/account" className="rounded-xl border border-[var(--lx-line)] px-5 py-3 text-[var(--lx-ink)]">
        <LxText zh="账户信息" en="Account"/>
       </Link>
      </div>
     </>
    )}
   </section>
  </main>
  <Footer/>
 </>;
}
