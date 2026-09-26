"use client";
import Link from "next/link";
import {useLingxiLang} from "@/lib/lingxi-i18n";

export default function AiRefundRequestPanel(){
 const{lang}=useLingxiLang();const zh=lang==="zh";
 return <section className="lx11-wallet-section lx-refund-panel">
  <h2 className="text-xl font-semibold">{zh?"余额退款已统一到自动原路退回":"Balance refunds now use one automatic flow"}</h2>
  <p className="mt-2 text-sm leading-6 text-[var(--lx-muted)]">{zh?"新的余额提现会直接尝试退回原微信、支付宝或 PayPal，不再走旧的人工审核入口。":"New balance withdrawals attempt a refund to the original WeChat Pay, Alipay or PayPal method; the old manual-review flow is retired."}</p>
  <Link href="/account/withdrawals" className="mt-4 inline-flex rounded-xl bg-[var(--lx-ink)] px-5 py-2.5 text-sm text-[var(--lx-bg)]">{zh?"进入余额提现":"Open balance withdrawals"}</Link>
 </section>;
}
