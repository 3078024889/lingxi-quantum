import { Suspense } from "react";
import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import AiWalletPanel from "@/components/AiWalletPanel";
export const metadata:Metadata={
 title:"AI余额",
 description:"灵犀场 AI 人民币余额：按量使用，余额长期保留；支持轻量、标准、高智能三档模式。",
 alternates:{canonical:"/ai-wallet"}
};
export default function Page(){
 return <><Nav/><main className="min-h-screen bg-[#fbfcfe] px-5 pb-20 pt-24 lg:ml-[260px] lg:px-10">
  <div className="mx-auto max-w-4xl">
   <p className="text-sm font-semibold tracking-[.16em] text-blue-600">LINGXIFIELD · AI BALANCE</p>
   <h1 className="mt-4 text-4xl font-semibold tracking-[-.03em]">AI 余额</h1>
   <p className="mt-4 max-w-2xl leading-7 text-slate-600">不是会员制，也没有每周重置。充值后按实际使用量扣费，未使用余额一直保留。</p>
   <div className="mt-8"><Suspense fallback={<div>加载中…</div>}><AiWalletPanel/></Suspense></div>
  </div>
 </main><Footer/></>;
}
