import { Suspense } from "react";
import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import AiWalletPanel from "@/components/AiWalletPanel";
import WalletHeroCopy from "@/components/WalletHeroCopy";
import AiRefundRequestPanel from "@/components/AiRefundRequestPanel";

export const metadata:Metadata={
  title:"余额｜灵犀场 LINGXIFIELD",
  description:"灵犀场余额支持人民币与美元独立充值与使用，可查看充值记录、余额提现与退款说明。",
  alternates:{canonical:"/ai-wallet"}
};

export default function Page(){
  return <>
    <Nav/>
    <main className="lx11-page">
      <div className="lx11-narrow lx11-wallet-page">
        <WalletHeroCopy />
        <div className="lx11-wallet-body">
          <Suspense fallback={<div className="lx11-wallet-loading" aria-busy="true">…</div>}><AiWalletPanel/></Suspense>
          <AiRefundRequestPanel/>
        </div>
      </div>
    </main>
    <Footer/>
  </>;
}
