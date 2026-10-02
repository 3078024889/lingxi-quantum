"use client";
import Link from "next/link";
import {useLingxiLang} from "@/lib/lingxi-i18n";
import {usePreferredCurrency} from "@/components/CurrencyPreferenceProvider";
import CurrencySelector from "@/components/CurrencySelector";
import {CREDIT_PACKS} from "@/lib/sasi/catalog";
import {usdBalanceProducts} from "@/lib/usd-products";

const RATES=[
 {zh:"文本理解 / 生成",en:"Text understanding / generation",cny:"¥0.50 / 100万 Token",usd:"$0.50 / 1M tokens"},
 {zh:"图片生成",en:"Image generation",cny:"¥0.20 / 张",usd:"$0.20 / image"},
 {zh:"高清图片",en:"High-quality image",cny:"¥0.30 / 张",usd:"$0.30 / image"},
 {zh:"视频 720P",en:"Video 720P",cny:"¥0.20 / 成功生成秒",usd:"$0.20 / successful second"},
 {zh:"视频 1080P",en:"Video 1080P",cny:"¥0.30 / 成功生成秒",usd:"$0.30 / successful second"},
 {zh:"网站第 1 页",en:"Website first page",cny:"¥6",usd:"$6"},
 {zh:"网站新增页面",en:"Additional website page",cny:"¥2 / 页",usd:"$2 / page"},
] as const;

export default function SasiPricingCurrencyClient(){
 const{lang}=useLingxiLang();const{currency}=usePreferredCurrency();const zh=lang==="zh";const usd=usdBalanceProducts;
 return <main className="lx11-page"><div className="lx11-wrap py-16 sm:py-20">
  <section className="max-w-3xl"><p className="lx11-kicker">LINGXIFIELD · SASI</p><h1 className="mt-3 text-3xl font-semibold text-[var(--lx-ink)]">{zh?"一个余额，全部 SASI 共用。":"One balance across every SASI."}</h1>
   <p className="mt-4 text-sm leading-7 text-[var(--lx-muted)]">{zh?"连接一次你的智能服务，书本、学习、科研、短剧、图片、视频和网站构建都可以复用。模型费用由对应服务商直接收取；灵犀场只按实际完成的 SASI 能力扣余额。":"Connect your intelligence service once and reuse it across books, learning, research, drama, images, video and website building. Providers bill their own model usage directly; LINGXIFIELD deducts only completed SASI capabilities."}</p>
   <div className="mt-5 max-w-xs"><CurrencySelector/></div>
  </section>
  <section className="mt-9 overflow-hidden rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)]"><div className="border-b border-[var(--lx-line)] p-5"><b>{zh?"统一计费":"Unified pricing"}</b><p className="mt-1 text-xs text-[var(--lx-muted)]">{zh?"CNY 与 USD 是两套独立价格，不按汇率换算。失败任务不收视频 / 图片完成费。":"CNY and USD are independent price books, not FX conversions. Failed image/video generations do not incur completion charges."}</p></div>
   <div className="divide-y divide-[var(--lx-line)]">{RATES.map(r=><div key={r.en} className="grid grid-cols-[1fr_auto] gap-4 px-5 py-3 text-sm"><span>{zh?r.zh:r.en}</span><b>{currency==="CNY"?r.cny:r.usd}</b></div>)}</div>
  </section>
  {currency==="CNY"?<section className="mt-10"><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{CREDIT_PACKS.map(pack=><article key={pack.id} className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-5"><h3 className="text-2xl font-semibold">¥{pack.priceRmb.toLocaleString("zh-CN")}</h3><p className="mt-2 text-sm text-[var(--lx-muted)]">{zh?"充值多少到账多少，长期保留。":"Top up at face value; balance remains until used."}</p><Link href={`/checkout?productId=${encodeURIComponent(pack.id)}&redirect=/sasi/pricing`} className="mt-5 block rounded-xl border border-[var(--lx-line)] bg-[var(--lx-soft)] px-4 py-3 text-center text-sm">{zh?"充值余额":"Top up balance"} →</Link></article>)}</div></section>
  :<section className="mt-10"><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{usd.map(pack=><article key={pack.id} className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-5"><h3 className="text-2xl font-semibold">${pack.amountUsd.toLocaleString("en-US",{minimumFractionDigits:2})}</h3><p className="mt-2 text-sm text-[var(--lx-muted)]">{zh?"美元原值进入 USD 余额。":"USD is credited at face value."}</p><Link href={`/checkout-usd?productId=${encodeURIComponent(pack.id)}`} className="mt-5 block rounded-xl border border-[var(--lx-line)] bg-[var(--lx-soft)] px-4 py-3 text-center text-sm">PayPal →</Link></article>)}</div></section>}
 </div></main>;
}
