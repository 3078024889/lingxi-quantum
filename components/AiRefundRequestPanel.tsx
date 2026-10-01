"use client";
import Link from 'next/link';
import {useLingxiLang} from '@/lib/lingxi-i18n';
import {moneyText} from '@/lib/notifications/money-copy';
export default function AiRefundRequestPanel(){
 const {lang}=useLingxiLang();
 return <section dir={lang==='ar'?'rtl':'ltr'} className="lx11-wallet-section lx-refund-panel">
  <h2 className="text-xl font-semibold">{moneyText(lang,'refund')}</h2>
  <Link href="/account/withdrawals" className="mt-4 inline-flex rounded-xl bg-[var(--lx-ink)] px-5 py-2.5 text-sm text-[var(--lx-bg)]">{moneyText(lang,'details')} →</Link>
 </section>;
}
