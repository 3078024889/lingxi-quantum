import Link from "next/link";
import {redirect} from "next/navigation";
import {createClient,getServerUser,isSupabasePublicConfigured} from "@/lib/supabase/server";
import {safeMarketProductId} from "@/lib/ai-market-vendor-claims";
import VendorClaimsPanel from "./VendorClaimsPanel";
export const runtime="nodejs";export const dynamic="force-dynamic";
export const metadata={title:"全球 SIAI 厂商认领 | 灵犀场"};
export default async function MarketVendorPage({searchParams}:{searchParams:Promise<{product?:string}>}){
 const query=await searchParams;
 const product=safeMarketProductId(query?.product)||"";
 if(!isSupabasePublicConfigured())return <main className="mx-auto max-w-3xl px-6 py-14"><h1>厂商中心</h1><p>账户服务暂不可用。</p></main>;
 const user=await getServerUser(createClient());
 if(!user?.email_confirmed_at){
  const destination="/account/ai-market"+(product?"?product="+encodeURIComponent(product):"");
  redirect("/account?next="+encodeURIComponent(destination));
 }
 return <main className="mx-auto max-w-3xl px-5 py-12">
  <p className="mb-3"><Link href="/account">← 返回我的灵犀场账户</Link></p>
  <h1 className="text-3xl font-bold">全球 SIAI 厂商中心</h1>
  <p className="mt-3 text-sm leading-7">使用你现有的灵犀场账户，免费认领最多 3 个产品。企业身份审核通过后才会获得管理权限；赞助展示与客观排名独立，付费尚未启用。</p>
  <VendorClaimsPanel initialProduct={product}/>
 </main>
}
