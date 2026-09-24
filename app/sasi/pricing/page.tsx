import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { CREDIT_PACKS } from "@/lib/sasi/catalog";
import { USD_BALANCE_AMOUNTS } from "@/lib/usd-products";
import { sasiReadiness } from "@/lib/sasi/readiness";
import { sasiTopupProductEnabled } from "@/lib/sasi/payment-gate";

export const dynamic="force-dynamic";
export const metadata:Metadata={
 title:"SASI 产品与充值｜灵犀场 AI创作工作台",
 description:"SASI 创作余额支持人民币与美元独立记账；CNY 使用国内支付，USD 使用 PayPal。",
 alternates:{canonical:"/sasi/pricing"}
};

export default function SasiPricingPage(){
 const readiness=sasiReadiness();
 const packs=CREDIT_PACKS.filter(pack=>sasiTopupProductEnabled(pack.id));
 return <><Nav/><main className="mx-auto max-w-6xl px-6 py-20">
  <p className="text-sm tracking-[.2em] text-lattice">灵犀场 · SASI</p>
  <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">让想法开始成为作品</h1>
  <p className="mt-6 max-w-3xl text-lg leading-8">先确认作品、规格与预算，再决定使用人民币余额或美元余额。两种余额分别记账，不自动换汇。</p>
  <section className="mt-12 rounded-3xl border p-7 sm:p-10">
   <h2 className="text-2xl font-semibold">CNY 创作余额</h2>
   <p className="mt-3 text-sm leading-6">人民币充值进入 CNY 余额，可使用微信支付或支付宝。</p>
   <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">{packs.map(pack=><Link href="/sasi/drama?view=billing#topup" key={pack.id} className="rounded-xl border p-5"><b className="text-2xl">¥{pack.priceRmb.toLocaleString("zh-CN")}</b><p className="mt-2 text-sm">CNY 创作余额</p></Link>)}</div>
  </section>
  <section className="mt-8 rounded-3xl border p-7 sm:p-10">
   <h2 className="text-2xl font-semibold">USD 创作余额</h2>
   <p className="mt-3 text-sm leading-6">美元充值进入独立 USD 余额，通过 PayPal 支付；不折算成人民币余额。</p>
   <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">{USD_BALANCE_AMOUNTS.map(amount=><Link href={`/checkout-usd?productId=sasi-usd-balance-${amount}`} key={amount} className="rounded-xl border p-5"><b className="text-2xl">${amount.toLocaleString("en-US")}</b><p className="mt-2 text-sm">USD Creation Balance</p></Link>)}</div>
  </section>
  <section className="mt-8 rounded-2xl border p-5"><p role="status">{readiness.productionReady?"制作通道已开放。付费前仍会显示本次任务的真实报价。":"现在可以准备项目与创作需求；制作通道按实时就绪状态开放。"}</p></section>
  <section className="mt-12 space-y-4 border-t pt-8"><h2 className="text-xl font-semibold">购买前了解</h2><p className="leading-7">CNY 与 USD 余额独立保留。退款按原支付币种处理，不提供自动换汇。</p><div className="flex flex-wrap gap-5"><Link href="/legal/sasi">SASI 创作规则</Link><Link href="/refunds">结算与退款说明</Link><Link href="/terms">服务协议</Link><Link href="/privacy">隐私政策</Link></div></section>
 </main><Footer/></>
}
