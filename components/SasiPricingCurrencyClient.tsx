"use client";
import Link from "next/link";
import {useLingxiLang} from "@/lib/lingxi-i18n";
import {usePreferredCurrency} from "@/components/CurrencyPreferenceProvider";
import CurrencySelector from "@/components/CurrencySelector";
import {CREDIT_PACKS} from "@/lib/sasi/catalog";
import {usdBalanceProducts} from "@/lib/usd-products";

export default function SasiPricingCurrencyClient(){
 const{lang}=useLingxiLang();
 const{currency}=usePreferredCurrency();
 const zh=lang==="zh";
 const usd=usdBalanceProducts;
 return <main className="lx11-page"><div className="lx11-wrap py-16 sm:py-20">
  <section className="max-w-3xl">
   <p className="lx11-kicker">LINGXIFIELD · SASI</p>
   <h1 className="mt-3 text-3xl font-semibold text-[var(--lx-ink)]">{zh?"余额":"Balance"}</h1>
   <p className="mt-4 text-sm leading-7 text-[var(--lx-muted)]">{zh?"一个余额，全部 SASI 共用。书本、学习、科研、短剧、图片、视频和网站构建都可以使用。":"One balance across every SASI: books, learning, research, drama, images, video and website building."}</p>
   <div className="mt-5 max-w-xs"><CurrencySelector/></div>
  </section>
  {currency==="CNY"
   ?<section className="mt-10"><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{CREDIT_PACKS.map(pack=><article key={pack.id} className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-5"><h3 className="text-2xl font-semibold">¥{pack.priceRmb.toLocaleString("zh-CN")}</h3><Link href={`/checkout?productId=${encodeURIComponent(pack.id)}&redirect=/sasi/pricing`} className="mt-5 block rounded-xl border border-[var(--lx-line)] bg-[var(--lx-soft)] px-4 py-3 text-center text-sm">{zh?"充值":"Top up"} →</Link></article>)}</div></section>
   :<section className="mt-10"><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{usd.map(pack=><article key={pack.id} className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-5"><h3 className="text-2xl font-semibold">${pack.amountUsd.toLocaleString("en-US",{minimumFractionDigits:2})}</h3><Link href={`/checkout-usd?productId=${encodeURIComponent(pack.id)}`} className="mt-5 block rounded-xl border border-[var(--lx-line)] bg-[var(--lx-soft)] px-4 py-3 text-center text-sm">{zh?"充值":"Top up"} →</Link></article>)}</div></section>}
 </div></main>;
}
