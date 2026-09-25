import type {Metadata} from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import LingxiMiniIcon from "@/components/LingxiMiniIcon";
import {CREDIT_PACKS} from "@/lib/sasi/catalog";
import {usdBalanceProducts} from "@/lib/usd-products";

export const dynamic="force-dynamic";
export const metadata:Metadata={
  title:"SASI 创作余额｜灵犀场",
  description:"SASI 创作余额支持人民币充值与 PayPal 美元充值。人民币与美元分别记账，按真实创作使用结算。",
  alternates:{canonical:"/sasi/pricing"},
};

export default function Page(){
  const usd=usdBalanceProducts.filter(x=>x.wallet==="sasi");
  return <><Nav/><main className="mx-auto max-w-6xl px-6 py-16 pt-28">
    <section className="max-w-3xl">
      <div className="lx-page-title-line"><LingxiMiniIcon name="sasi" size="title"/><p className="text-sm text-[var(--lx-faint)]">SASI · 创作余额</p></div>
      <h1 className="mt-3 text-3xl font-semibold text-[var(--lx-ink)]">按你习惯的币种充值，余额各自保留。</h1>
      <p className="mt-4 text-sm leading-7 text-[var(--lx-muted)]">
        国内支付可充值人民币余额；PayPal 可充值美元余额。充值什么币种，就保留什么币种，不会自动改成人民币。
      </p>
    </section>

    <section className="mt-10 lx-pricing-section">
      <h2 className="text-xl font-semibold text-[var(--lx-ink)]">人民币余额</h2>
      <p className="mt-2 text-sm text-[var(--lx-muted)]">使用微信或支付宝充值。</p>
      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {CREDIT_PACKS.map(pack=><article key={pack.id} className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-5 lx-pricing-card">
          <h3 className="text-2xl font-semibold">¥{pack.priceRmb.toLocaleString("zh-CN")}</h3>
          <p className="mt-2 text-sm text-[var(--lx-muted)]">{pack.zh}</p>
          <Link href={`/checkout?productId=${encodeURIComponent(pack.id)}&redirect=/sasi/pricing`} className="mt-5 block rounded-xl border border-[var(--lx-line)] px-4 py-3 text-center text-sm">微信 / 支付宝 →</Link>
        </article>)}
      </div>
    </section>

    <section className="mt-12 lx-pricing-section">
      <h2 className="text-xl font-semibold text-[var(--lx-ink)]">美元余额</h2>
      <p className="mt-2 text-sm text-[var(--lx-muted)]">使用 PayPal 直接充值 USD 余额。</p>
      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {usd.map(pack=><article key={pack.id} className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-5 lx-pricing-card">
          <h3 className="text-2xl font-semibold">${pack.amountUsd.toLocaleString("en-US",{minimumFractionDigits:2})}</h3>
          <p className="mt-2 text-sm text-[var(--lx-muted)]">到账 ${pack.amountUsd.toLocaleString("en-US",{minimumFractionDigits:2})} USD 余额</p>
          <Link href={`/checkout-usd?productId=${encodeURIComponent(pack.id)}`} className="mt-5 block rounded-xl bg-[#0070ba] px-4 py-3 text-center text-sm font-medium text-white">PayPal →</Link>
        </article>)}
      </div>
    </section>

    <section className="mt-12 rounded-2xl border border-[var(--lx-line)] p-5">
      <h2 className="text-base font-semibold">没用完，也不必勉强用掉。</h2>
      <p className="mt-3 text-sm leading-7 text-[var(--lx-muted)]">未使用的真实充值本金可按原支付渠道申请退回。赠送额度、邀请奖励和已经产生服务成本的部分不计入可提现本金。</p>
      <div className="mt-4 flex flex-wrap gap-4 text-sm"><Link href="/account/withdrawals">余额提现 →</Link><Link href="/refunds">退款说明 →</Link></div>
    </section>
  </main><Footer/></>;
}
