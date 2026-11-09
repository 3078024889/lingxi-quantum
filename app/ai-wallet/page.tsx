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
   <section className="lx-cel-wallet-page mx-auto max-w-6xl px-5 py-7 md:px-8 md:py-10">
    <div className="lx-cel-wallet-head mb-6">
     <p className="text-xs font-semibold tracking-[.2em] text-[var(--lx-faint)]">LINGXIFIELD · WALLET</p>
     <h1 className="mt-3 font-display text-3xl font-semibold text-[var(--lx-ink)]">
      <LxText zh="余额与充值" en="Balance & top-ups" ja="残高とチャージ" ko="잔액 및 충전" fr="Solde et recharges" de="Guthaben & Aufladungen" es="Saldo y recargas" pt="Saldo e recargas" ar="الرصيد والشحن"/>
     </h1>
     
    </div>
    <WalletLivePanel/>
   </section>
  </main>
  <Footer/>
 </>;
}
