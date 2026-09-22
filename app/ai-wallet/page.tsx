import { Suspense } from "react";
import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import AiWalletPanel from "@/components/AiWalletPanel";

export const metadata:Metadata={
  title:"AI 余额｜灵犀场",
  description:"灵犀场 AI 人民币余额。不是会员制，不按周或按月清零，按真实使用量结算。",
  alternates:{canonical:"/ai-wallet"}
};

export default function Page(){
  return <>
    <Nav/>
    <main className="lx11-page">
      <div className="lx11-narrow lx11-wallet-page">
        <p className="lx11-kicker">AI 余额</p>
        <h1 className="lx11-title">让余额留在这里，等你真正需要时再流动。</h1>
        <p className="lx11-lead">不绑定会员，不制造“快过期”的压力。创作、研究与需要 AI 的工具，共用同一个余额入口。</p>
        <div className="lx11-wallet-body">
          <Suspense fallback={<div className="lx11-wallet-loading">正在读取余额…</div>}><AiWalletPanel/></Suspense>
        </div>
      </div>
    </main>
    <Footer/>
  </>;
}
