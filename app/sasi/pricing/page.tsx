import type {Metadata} from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import {CREDIT_PACKS} from "@/lib/sasi/catalog";
import {sasiTopupProductEnabled} from "@/lib/sasi/payment-gate";

export const dynamic="force-dynamic";
export const metadata:Metadata={
  title:"SASI 创作余额｜灵犀场",
  description:"SASI 创作余额支持微信、支付宝和 PayPal 美元支付；全部进入同一份可实际消费的 CNY 创作余额。",
  alternates:{canonical:"/sasi/pricing"},
};

export default function Page(){
  const packs=CREDIT_PACKS.filter(pack=>sasiTopupProductEnabled(pack.id));
  return <><Nav/><main className="mx-auto max-w-6xl px-6 py-16 pt-28">
    <section className="max-w-3xl">
      <p className="text-sm text-[var(--lx-faint)]">SASI · 创作余额</p>
      <h1 className="mt-3 text-3xl font-semibold text-[var(--lx-ink)]">一份余额，两种支付方式。</h1>
      <p className="mt-4 text-sm leading-7 text-[var(--lx-muted)]">
        微信和支付宝按人民币支付；PayPal 按 USD 支付。无论用哪一种，到账后都进入同一个可实际用于 SASI 制作的 CNY 创作余额。
      </p>
    </section>

    <section className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {packs.map(pack=><article key={pack.id} className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-5">
        <div className="flex items-start justify-between gap-4">
          <div><p className="text-sm text-[var(--lx-faint)]">{pack.zh}</p><h2 className="mt-2 text-2xl font-semibold text-[var(--lx-ink)]">¥{pack.priceRmb.toLocaleString("zh-CN")}</h2></div>
          <span className="text-sm text-[var(--lx-muted)]">${pack.priceUsd.toFixed(2)}</span>
        </div>
        <p className="mt-4 text-sm leading-6 text-[var(--lx-muted)]">到账 ¥{pack.priceRmb.toLocaleString("zh-CN")} CNY 创作余额。</p>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <Link href={`/checkout?productId=${encodeURIComponent(pack.id)}&redirect=/sasi/pricing`} className="rounded-xl border border-[var(--lx-line)] px-3 py-3 text-center text-sm text-[var(--lx-ink)]">微信 / 支付宝</Link>
          <Link href={`/checkout-usd?productId=${encodeURIComponent(pack.id)}`} className="rounded-xl bg-[#0070ba] px-3 py-3 text-center text-sm font-medium text-white">PayPal · USD</Link>
        </div>
      </article>)}
    </section>

    <section className="mt-10 rounded-2xl border border-[var(--lx-line)] p-5">
      <h2 className="text-base font-semibold text-[var(--lx-ink)]">支付与退款</h2>
      <p className="mt-3 text-sm leading-7 text-[var(--lx-muted)]">
        PayPal 的美元金额是这个人民币余额套餐的支付价格，不再创建独立 USD 钱包。未使用的真实充值本金支持按原订单、原支付渠道退款。
      </p>
      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        <Link href="/account/withdrawals">余额提现 →</Link>
        <Link href="/refunds">退款说明 →</Link>
        <Link href="/legal/sasi">SASI 创作规则 →</Link>
      </div>
    </section>
  </main><Footer/></>;
}
