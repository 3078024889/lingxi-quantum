import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import LxText from "@/components/LxText";
import WalletLivePanel from "@/components/WalletLivePanel";

export const dynamic="force-static";
export const metadata={
 title:"余额与充值 | 灵犀场 LINGXIFIELD",
 robots:{index:false,follow:false}
};

export default function WalletPage(){
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
    <WalletLivePanel/>
   </section>
  </main>
  <Footer/>
 </>;
}
