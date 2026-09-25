import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Bi from "@/components/Bi";
import { createClient, getServerUser, isSupabasePublicConfigured } from "@/lib/supabase/server";
import { getProduct } from "@/lib/plans";
import ToolOrderRecoveryButton from "@/components/tools/ToolOrderRecoveryButton";

export const metadata = { title: "订单与使用记录 | 灵犀场 LINGXIFIELD", robots:{index:false,follow:false} };

type OrderRow={
  id:string; product_id:string; amount_rmb:number|null; amount_usd:number|null;
  status:string; provider:string|null; created_at:string; paid_at:string|null;
};

function statusText(status:string,lang:"zh"|"en"){
  const map:Record<string,{zh:string;en:string}>={
    pending:{zh:"等待付款",en:"Awaiting payment"},
    paid:{zh:"已到账",en:"Paid"},
    failed:{zh:"未完成",en:"Not completed"},
    refunded:{zh:"已退款",en:"Refunded"},
    cancelled:{zh:"已取消",en:"Cancelled"},
  };
  return map[status]?.[lang]??status;
}
function providerText(provider:string|null,lang:"zh"|"en"){
  if(provider==="paypal")return "PayPal";
  if(provider==="wechat")return lang==="zh"?"微信支付":"WeChat Pay";
  if(provider==="alipay")return lang==="zh"?"支付宝":"Alipay";
  return lang==="zh"?"其他支付":"Other payment";
}

function currentProductLabel(id:string){
  if(id.startsWith("toolquote:")) return {zh:"实用工具任务",en:"Utility tool task"};
  const p=getProduct(id);
  if(p) return {zh:p.name,en:p.nameEn};
  if(id.startsWith("ai-usd-balance-"))return {zh:"AI USD 余额充值",en:"AI USD balance top-up"};
  if(id.startsWith("sasi-usd-balance-"))return {zh:"SASI USD 创作余额充值",en:"SASI USD creation balance top-up"};
  return {zh:"其他历史记录",en:"Other historical record"};
}

export default async function OrdersPage({searchParams}:{searchParams?:{payment?:string}}){
  const supabase=isSupabasePublicConfigured()?createClient():null;
  const user=supabase?await getServerUser(supabase):null;
  let orders:OrderRow[]=[];
  let loadFailed=false;
  const paymentState=searchParams?.payment==="pending"?"pending":searchParams?.payment==="error"?"error":null;

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
          <div><p className="lx11-kicker"><Bi zh="账户" en="Account"/></p><h1 className="mt-3 font-display text-3xl text-[var(--lx-ink)]"><Bi zh="订单与使用记录" en="Paid Tasks"/></h1></div>
          <Link href="/account" className="text-sm">← <Bi zh="返回账户" en="Back"/></Link>
        </div>
        <p className="mt-4 text-sm leading-7 text-[var(--lx-muted)]"><Bi zh="充值、工具处理和已经完成的付款都留在这里，方便你随时回来核对。" en="Top-ups, paid tool runs and completed payments stay here so you can check them whenever needed."/></p>

        {paymentState==="pending"&&<p role="status" className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><Bi zh="付款已经返回，正在确认到账。请不要重复支付；确认完成后余额会自动更新。" en="Your payment has returned and is being confirmed. Do not pay again; the balance will update automatically once confirmed."/></p>}
        {paymentState==="error"&&<p role="alert" className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900"><Bi zh="这次付款还没有确认到账。请先查看下面的订单状态；未确认前不会增加余额。" en="This payment has not been confirmed yet. Check the order below; your balance will not change before confirmation."/></p>}

        {!user&&<p className="mt-8 rounded-2xl border p-6"><Bi zh="请先登录查看订单。" en="Please sign in to view orders."/></p>}
        {loadFailed&&<p role="alert" className="mt-8 text-rose"><Bi zh="订单暂时无法读取，请刷新重试。" en="Orders could not be loaded. Refresh and try again."/></p>}
        {user&&!loadFailed&&orders.length===0&&<p className="mt-8 rounded-2xl border p-6"><Bi zh="还没有订单。" en="No orders yet."/></p>}

        <div className="mt-8 space-y-3">
          {orders.map(o=>{
            const label=currentProductLabel(o.product_id);
            const current=getProduct(o.product_id);
            const amount=o.provider==="paypal"&&o.amount_usd!=null
              ?`$${Number(o.amount_usd).toFixed(2)}`
              :o.amount_rmb!=null
                ?`¥${Number(o.amount_rmb).toFixed(2)}`
                :o.amount_usd!=null
                  ?`$${Number(o.amount_usd).toFixed(2)}`
                  :"—";
            const tool=o.product_id.startsWith("toolquote:");
            return <article key={o.id} className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] text-[var(--lx-faint)]"><Bi zh={`订单号 ${o.id}`} en={`Order ${o.id}`}/></p>
                  <h2 className="mt-2 font-display text-lg text-[var(--lx-ink)]"><Bi zh={label.zh} en={label.en}/></h2>
                  <p className="mt-2 text-xs text-[var(--lx-muted)]">{new Date(o.created_at).toLocaleString()} · <Bi zh={providerText(o.provider,"zh")} en={providerText(o.provider,"en")}/></p>
                </div>
                <div className="text-right"><b className="text-lg text-[var(--lx-ink)]">{amount}</b><p className="mt-1 text-xs text-[var(--lx-muted)]"><Bi zh={statusText(o.status,"zh")} en={statusText(o.status,"en")}/></p></div>
              </div>

              {current?.group==="ai"&&<Link href="/ai-wallet" className="mt-4 inline-block text-sm">AI Balance →</Link>}
              {current?.group==="production"&&<Link href="/sasi/pricing" className="mt-4 inline-block text-sm">SASI Balance →</Link>}
              {o.product_id.startsWith("ai-usd-balance-")&&<Link href="/ai-wallet" className="mt-4 inline-block text-sm">AI Balance →</Link>}
              {o.product_id.startsWith("sasi-usd-balance-")&&<Link href="/sasi/pricing" className="mt-4 inline-block text-sm">SASI Balance →</Link>}
              {tool&&<div className="mt-4"><ToolOrderRecoveryButton quoteId={o.product_id.slice("toolquote:".length)}/></div>}
            </article>;
          })}
        </div>
      </div>
    </main>
    <Footer/>
  </>;
}
