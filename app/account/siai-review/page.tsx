import type {Metadata} from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import {moneyAdministrator} from "@/lib/money/operator-settings";
import ReviewWorkbench from "./ReviewWorkbench";
import {getPrivateSiaiCandidateIndex} from "@/lingxifield-ai-market/lib/market-private-intake-index";

export const dynamic="force-dynamic";
export const metadata:Metadata={title:"SIAI 厂商审核 | 灵犀场管理账户",robots:{index:false,follow:false}};
export default async function Page(){
 let reviewer=null;
 try{reviewer=await moneyAdministrator();}catch{}
 const index=reviewer?getPrivateSiaiCandidateIndex():null;
 return <><Nav/><main className="lx11-page mx-auto min-h-[65vh] w-full max-w-7xl px-4 py-9">
 {reviewer&&index?<ReviewWorkbench candidates={index.rows}/>:
 <section className="rounded-xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-6"><h1 className="text-2xl font-bold">管理账户验证</h1>
 <p className="mt-3 text-base">厂商申请和候选资料仅向授权站长开放。请用经过邮箱验证的管理账户登录。</p>
 <Link className="mt-4 inline-block text-blue-700 underline" href="/account?mode=signin&next=%2Faccount%2Fsiai-review">前往账户登录</Link></section>}
 </main><Footer/></>;
}
