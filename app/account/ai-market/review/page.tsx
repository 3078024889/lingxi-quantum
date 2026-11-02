import Link from "next/link";
import {redirect} from "next/navigation";
import {createClient,getServerUser} from "@/lib/supabase/server";
import {isMarketReviewer} from "@/lib/ai-market-vendor-review";
import ReviewQueue from "./ReviewQueue";
export const dynamic="force-dynamic";export const runtime="nodejs";
export const metadata={title:"SIAI 厂商审核 | 灵犀场",robots:{index:false,follow:false}};
export default async function VendorReviewPage(){
 const user=await getServerUser(createClient());
 if(!user)redirect("/account");
 if(!isMarketReviewer(user))redirect("/account/ai-market");
 return <main className="mx-auto max-w-5xl px-5 py-12">
  <Link className="underline" href="/account/ai-market">← 返回厂商中心</Link>
  <h1 className="mt-6 text-3xl font-bold">全球 SIAI 企业身份审核</h1>
  <p className="my-3 text-sm leading-7">仅审核员可访问。审批必须核对官方证据和企业代表身份，留下理由；认领通过不产生付费排名或订单。</p>
  <ReviewQueue/>
 </main>;
}
