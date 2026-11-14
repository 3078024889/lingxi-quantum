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
  <main className="lx11-page lx26-wallet-page">
   <section className="lx26-wallet-page-inner">
    <header className="lx26-wallet-hero">
     <div className="lx26-wallet-hero-copy">
      <p className="lx26-overline">LINGXIFIELD / WALLET</p>
      <h1><span className="lx26-title-bar" aria-hidden="true"/><span aria-hidden="true">▤</span><LxText zh="余额与充值" en="Balance & top-ups" ja="残高とチャージ" ko="잔액 및 충전" fr="Solde et recharges" de="Guthaben & Aufladungen" es="Saldo y recargas" pt="Saldo e recargas" ar="الرصيد والشحن"/></h1>
      <p><LxText zh="双币余额 · 充值与退款记录" en="CNY & USD balances · top-ups and refunds"/></p>
     </div>
     <div className="lx26-wallet-orbit" aria-hidden="true"><i/><i/><i/></div>
    </header>
    <WalletLivePanel/>
   </section>
  </main>
  <Footer/>
 </>;
}