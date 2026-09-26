"use client";

import Link from "next/link";
import {useLingxiLang} from "@/lib/lingxi-i18n";
import {usePreferredCurrency} from "@/components/CurrencyPreferenceProvider";
import CurrencySelector from "@/components/CurrencySelector";
import {CREDIT_PACKS} from "@/lib/sasi/catalog";
import {usdBalanceProducts} from "@/lib/usd-products";

export default function SasiPricingCurrencyClient(){
 const{lang}=useLingxiLang();const{currency}=usePreferredCurrency();const zh=lang==="zh";
 const usd=usdBalanceProducts.filter(x=>x.wallet==="sasi");
 return <main className="lx11-page"><div className="lx11-wrap py-16 sm:py-20">
  <section className="max-w-3xl">
   <p className="lx11-kicker">SASI · {zh?"创作余额":"Creation balance"}</p>
   <h1 className="mt-3 text-3xl font-semibold text-[var(--lx-ink)]">{zh?"按你选择的支付币种继续。":"Continue in the payment currency you prefer."}</h1>
   <p className="mt-4 text-sm leading-7 text-[var(--lx-muted)]">{zh?"人民币与美元使用各自独立的价格簿，不按实时汇率换算。你的币种选择会在全站保持一致。":"CNY and USD use independent price books, not live exchange-rate conversion. Your currency choice stays consistent across LINGXIFIELD."}</p>
   <div className="mt-5 max-w-xs"><CurrencySelector/></div>
  </section>

  {currency==="CNY"?<section className="mt-10"><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
   {CREDIT_PACKS.map(pack=><article key={pack.id} className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-5">
    <h3 className="text-2xl font-semibold text-[var(--lx-ink)]">¥{pack.priceRmb.toLocaleString("zh-CN")}</h3>
    <p className="mt-2 text-sm text-[var(--lx-muted)]">{zh?pack.zh:pack.en}</p>
    <Link href={`/checkout?productId=${encodeURIComponent(pack.id)}&redirect=/sasi/pricing`} className="mt-5 block rounded-xl border border-[var(--lx-line)] bg-[var(--lx-soft)] px-4 py-3 text-center text-sm text-[var(--lx-ink)]">{zh?"微信 / 支付宝":"WeChat / Alipay"} →</Link>
   </article>)}
  </div></section>:<section className="mt-10"><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
   {usd.map(pack=><article key={pack.id} className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-5">
    <h3 className="text-2xl font-semibold text-[var(--lx-ink)]">${pack.amountUsd.toLocaleString("en-US",{minimumFractionDigits:2})}</h3>
    <p className="mt-2 text-sm text-[var(--lx-muted)]">{zh?"SASI 美元余额":"SASI USD balance"}</p>
    <Link href={`/checkout-usd?productId=${encodeURIComponent(pack.id)}`} className="mt-5 block rounded-xl border border-[var(--lx-line)] bg-[var(--lx-soft)] px-4 py-3 text-center text-sm text-[var(--lx-ink)]">PayPal →</Link>
   </article>)}
  </div></section>}
 </div></main>;
}
