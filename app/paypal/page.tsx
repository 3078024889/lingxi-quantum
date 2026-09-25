import type {Metadata} from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import {usdBalanceProducts} from "@/lib/usd-products";

export const metadata:Metadata={
  title:"PayPal 美元支付｜灵犀场",
  description:"使用 PayPal 为灵犀场 AI 与 SASI 创作余额充值美元。支付成功后按实际 USD 金额到账。",
  alternates:{canonical:"/paypal"},
};

export default function Page(){
  const ai=usdBalanceProducts.filter(x=>x.wallet==="ai").slice(0,4);
  const sasi=usdBalanceProducts.filter(x=>x.wallet==="sasi").slice(0,4);

  return <><Nav/><main className="mx-auto max-w-6xl px-6 py-16 pt-28">
    <section className="max-w-3xl">
      <p className="text-sm text-[var(--lx-faint)]">PayPal · USD</p>
      <h1 className="mt-3 text-3xl font-semibold text-[var(--lx-ink)]">用 PayPal 直接充值美元余额。</h1>
      <p className="mt-4 text-sm leading-7 text-[var(--lx-muted)]">
        PayPal 支付用于灵犀场的 AI 与 SASI 创作服务。选择美元金额后进入 PayPal 完成付款，
        支付成功后同额 USD 进入对应余额；未使用的真实充值本金可按退款规则申请原路退回。
      </p>
    </section>

    <section className="mt-10 grid gap-8 lg:grid-cols-2">
      <div className="rounded-3xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-6">
        <h2 className="text-xl font-semibold">AI 美元余额</h2>
        <p className="mt-2 text-sm text-[var(--lx-muted)]">用于资料处理、学习、科研与 AI 调用。</p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          {ai.map(p=><Link key={p.id} href={`/checkout-usd?productId=${p.id}`} className="rounded-2xl border border-[var(--lx-line)] p-4 hover:border-[var(--lx-line-strong)]">
            <b className="text-lg">${p.amountUsd.toFixed(2)}</b>
            <span className="mt-2 block text-sm text-[var(--lx-muted)]">PayPal 支付 →</span>
          </Link>)}
        </div>
      </div>

      <div className="rounded-3xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-6">
        <h2 className="text-xl font-semibold">SASI 创作美元余额</h2>
        <p className="mt-2 text-sm text-[var(--lx-muted)]">用于 AI 短剧、镜头生成与 SASI 创作任务。</p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          {sasi.map(p=><Link key={p.id} href={`/checkout-usd?productId=${p.id}`} className="rounded-2xl border border-[var(--lx-line)] p-4 hover:border-[var(--lx-line-strong)]">
            <b className="text-lg">${p.amountUsd.toFixed(2)}</b>
            <span className="mt-2 block text-sm text-[var(--lx-muted)]">PayPal 支付 →</span>
          </Link>)}
        </div>
      </div>
    </section>

    <section className="mt-8 rounded-2xl border border-[var(--lx-line)] p-5 text-sm leading-7 text-[var(--lx-muted)]">
      <b className="text-[var(--lx-ink)]">支付说明</b>
      <p className="mt-2">付款时会跳转至 PayPal 官方页面。若 PayPal 账户使用 EUR、GBP 等其他币种，换汇由 PayPal 在付款页处理；灵犀场只按订单中的 USD 金额确认到账。</p>
    </section>
  </main><Footer/></>;
}
