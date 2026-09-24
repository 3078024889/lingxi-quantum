import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Bi from "@/components/Bi";
import { createClient, getServerUser, isSupabasePublicConfigured } from "@/lib/supabase/server";
import { getProduct } from "@/lib/plans";
import ToolOrderRecoveryButton from "@/components/tools/ToolOrderRecoveryButton";

export const metadata = { title: "付费任务中心 | 灵犀场 LINGXIFIELD", robots:{index:false,follow:false} };

type OrderRow={
  id:string; product_id:string; amount_rmb:number|null; amount_usd:number|null;
  status:string; provider:string|null; created_at:string; paid_at:string|null;
};

function currentProductLabel(id:string){
  if(id.startsWith("toolquote:")) return {zh:"实用工具任务",en:"Utility tool task"};
  const p=getProduct(id);
  if(p) return {zh:p.name,en:p.nameEn};
  return {zh:"历史服务（已下架）",en:"Legacy service (retired)"};
}

export default async function OrdersPage(){
  const supabase=isSupabasePublicConfigured()?createClient():null;
  const user=supabase?await getServerUser(supabase):null;
  let orders:OrderRow[]=[];
  let loadFailed=false;

  if(user&&supabase){
    const {data,error}=await supabase.from("orders")
      .select("id,product_id,amount_rmb,amount_usd,status,provider,created_at,paid_at")
      .eq("user_id",user.id)
      .order("created_at",{ascending:false})
      .limit(100);
    loadFailed=!!error;
    orders=(data as OrderRow[]|null)??[];
  }

  return <>
    <Nav/>
    <main className="lx11-page">
      <div className="mx-auto max-w-3xl px-6 py-20">
        <div className="flex items-start justify-between gap-4">
          <div><p className="lx11-kicker"><Bi zh="账户" en="Account"/></p><h1 className="mt-3 font-display text-3xl text-[var(--lx-ink)]"><Bi zh="付费任务中心" en="Paid Tasks"/></h1></div>
          <Link href="/account" className="text-sm">← <Bi zh="返回账户" en="Back"/></Link>
        </div>
        <p className="mt-4 text-sm leading-7 text-[var(--lx-muted)]"><Bi zh="这里保留当前余额、工具任务与历史交易记录。已下架的旧服务不再提供新购买入口，但历史支付记录不会被删除。" en="Current balances, utility tasks and historical transactions stay here. Retired services no longer accept new purchases, while historical payment records remain intact."/></p>

        {!user&&<p className="mt-8 rounded-2xl border p-6"><Bi zh="请先登录查看订单。" en="Please sign in to view orders."/></p>}
        {loadFailed&&<p role="alert" className="mt-8 text-rose"><Bi zh="订单暂时无法读取，请刷新重试。" en="Orders could not be loaded. Refresh and try again."/></p>}
        {user&&!loadFailed&&orders.length===0&&<p className="mt-8 rounded-2xl border p-6"><Bi zh="还没有订单。" en="No orders yet."/></p>}

        <div className="mt-8 space-y-3">
          {orders.map(o=>{
            const label=currentProductLabel(o.product_id);
            const current=getProduct(o.product_id);
            const amount=o.amount_rmb!=null?`¥${o.amount_rmb}`:(o.amount_usd?`$${o.amount_usd}`:"—");
            const tool=o.product_id.startsWith("toolquote:");
            return <article key={o.id} className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] text-[var(--lx-faint)]">{o.id}</p>
                  <h2 className="mt-2 font-display text-lg text-[var(--lx-ink)]"><Bi zh={label.zh} en={label.en}/></h2>
                  <p className="mt-2 text-xs text-[var(--lx-muted)]">{new Date(o.created_at).toLocaleString()} · {o.provider||"—"}</p>
                </div>
                <div className="text-right"><b className="text-lg text-[var(--lx-ink)]">{amount}</b><p className="mt-1 text-xs text-[var(--lx-muted)]">{o.status}</p></div>
              </div>

              {current?.group==="ai"&&<Link href="/ai-wallet" className="mt-4 inline-block text-sm">AI Balance →</Link>}
              {current?.group==="production"&&<Link href="/sasi/pricing" className="mt-4 inline-block text-sm">SASI Balance →</Link>}
              {tool&&<div className="mt-4"><ToolOrderRecoveryButton quoteId={o.product_id.slice("toolquote:".length)}/></div>}
            </article>;
          })}
        </div>
      </div>
    </main>
    <Footer/>
  </>;
}
