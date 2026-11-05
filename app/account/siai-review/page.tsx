import type {Metadata} from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import {moneyAdministrator} from "@/lib/money/operator-settings";
import ReviewWorkbench from "./ReviewWorkbench";
import batch006 from "@/lingxifield-ai-market/data/company-intake/batch-006.json";
import batch007 from "@/lingxifield-ai-market/data/company-intake/batch-007.json";
import batch008 from "@/lingxifield-ai-market/data/company-intake/batch-008.json";
import batch009 from "@/lingxifield-ai-market/data/company-intake/batch-009.json";
import batch010 from "@/lingxifield-ai-market/data/company-intake/batch-010.json";
import checkedVideo from "@/lingxifield-ai-market/data/company-intake/batch-006-official-observations.json";

export const dynamic="force-dynamic";
export const metadata:Metadata={title:"SIAI 厂商审核 | 灵犀场管理账户",robots:{index:false,follow:false}};
export default async function Page(){
 let reviewer=null;
 try{reviewer=await moneyAdministrator();}catch{}
 const candidates=[...batch006.products,...batch007.products,...batch008.products,...batch009.products,...batch010.products];
 const evidenceById=new Map(checkedVideo.products.map(p=>[p.id,p.facts]));
 const reviewable=candidates.map(p=>{
  const facts=evidenceById.get(p.id) as Record<string,{status:string;text?:string;source?:string}>|undefined;
  const evidence=Object.entries(facts||{}).flatMap(([field,fact])=>
   fact.status==="observed"&&typeof fact.source==="string"&&typeof fact.text==="string"
    ?[{field,text:fact.text,source:fact.source}]:[]);
  return {id:p.id,name:p.name,company:p.company,category:p.category,website:p.website,tasks:p.tasks,evidenceUrl:p.evidenceUrl,evidence};
 });
 return <><Nav/><main className="lx11-page mx-auto min-h-[65vh] w-full max-w-7xl px-4 py-9">
 {reviewer?<ReviewWorkbench candidates={reviewable}/>:
 <section className="rounded-xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-6"><h1 className="text-2xl font-bold">管理账户验证</h1>
 <p className="mt-3 text-base">厂商申请和候选资料仅向授权站长开放。请用经过邮箱验证的管理账户登录。</p>
 <Link className="mt-4 inline-block text-blue-700 underline" href="/account?mode=signin&next=%2Faccount%2Fsiai-review">前往账户登录</Link></section>}
 </main><Footer/></>;
}
