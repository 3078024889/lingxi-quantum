import { Suspense } from "react";
import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import AiWalletPanel from "@/components/AiWalletPanel";
import WalletHeroCopy from "@/components/WalletHeroCopy";
import AiRefundRequestPanel from "@/components/AiRefundRequestPanel";

export const metadata:Metadata={
  title:"AI Balance｜LINGXIFIELD",
  description:"LINGXIFIELD prepaid AI balance. No membership lock-in or weekly/monthly reset; charged by actual use.",
  alternates:{canonical:"/ai-wallet"}
};

export default function Page(){
  return <>
    <Nav/>
    <main className="lx11-page">
      <div className="lx11-narrow lx11-wallet-page">
        <WalletHeroCopy />
        <div className="lx11-wallet-body">
          <Suspense fallback={<div className="lx11-wallet-loading">Loading balance…</div>}><AiWalletPanel/></Suspense>
          <AiRefundRequestPanel/>
        </div>
      </div>
    </main>
    <Footer/>
  </>;
}
