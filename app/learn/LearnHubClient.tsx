"use client";
import Link from "next/link";
import {useLingxiLang} from "@/lib/lingxi-i18n";
import {brandText,EXPLORE_GROUPS} from "@/lib/brand-system-i18n";

export default function LearnHubClient(){
 const{lang}=useLingxiLang();
 const t=(key:Parameters<typeof brandText>[1])=>brandText(lang,key);
 return <main className="pt-16 lg:pt-8">
  <section className="px-5 pb-16 pt-8 sm:px-8 lg:px-10">
   <div className="mx-auto max-w-[1180px]">
    <header className="overflow-hidden rounded-[28px] border border-[var(--lx-line)] bg-[var(--lx-panel)]">
     <div className="grid lg:grid-cols-[1.08fr_.92fr]">
      <div className="p-7 sm:p-10 lg:p-12">
       <p className="text-[11px] font-semibold tracking-[.18em] text-sky-500">{t("learnKicker")}</p>
       <h1 className="mt-5 max-w-3xl text-[34px] font-semibold leading-[1.18] tracking-[-.035em] text-[var(--lx-ink)] sm:text-[44px]">{t("learnTitle")}</h1>
       <p className="mt-5 max-w-2xl text-[15px] leading-8 text-[var(--lx-muted)]">{t("learnLead")}</p>
      </div>
      <div className="min-h-[250px] bg-[radial-gradient(circle_at_70%_28%,rgba(137,111,212,.30),transparent_24%),radial-gradient(circle_at_48%_56%,rgba(73,162,205,.22),transparent_30%),linear-gradient(135deg,#edf3fb,#f8f4ff_55%,#eef7f8)] p-8">
       <div className="flex h-full min-h-[210px] items-center justify-center">
        <div className="relative h-36 w-36 rounded-[38px] border border-white/70 bg-white/55 shadow-[0_30px_80px_rgba(65,75,105,.14)] backdrop-blur">
         <span className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-indigo-300/50"/>
         <span className="absolute left-1/2 top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rotate-45 border border-sky-400/60"/>
         <span className="absolute right-6 top-5 text-sm text-indigo-400">✦</span>
        </div>
       </div>
      </div>
     </div>
    </header>

    <div className="mt-5 grid gap-4 lg:grid-cols-2">
     <section className="rounded-[22px] border border-[var(--lx-line)] bg-[var(--lx-panel)] p-6 sm:p-7">
      <div className="flex items-start gap-4"><span className="lx-explore-index">01</span><div><h2 className="lx-explore-section-title">{t("howTitle")}</h2><p className="lx-explore-section-copy">{t("howBody")}</p></div></div>
     </section>
     <section className="rounded-[22px] border border-[var(--lx-line)] bg-[var(--lx-panel)] p-6 sm:p-7">
      <div className="flex items-start gap-4"><span className="lx-explore-index">02</span><div><h2 className="lx-explore-section-title">{t("fieldTitle")}</h2><p className="lx-explore-section-copy">{t("fieldBody")}</p><Link href="/live-as" className="mt-4 inline-flex text-sm font-medium text-sky-600">{t("open")} →</Link></div></div>
     </section>
    </div>

    <div className="mt-12 space-y-12">
     {EXPLORE_GROUPS.map(group=><section key={group.code}>
      <div className="mb-5 flex items-start gap-4">
       <span className="lx-explore-index">{group.code}</span>
       <div><h2 className="text-[23px] font-semibold tracking-[-.025em] text-[var(--lx-ink)]">{group.title[lang]}</h2><p className="mt-1 text-[13px] leading-6 text-[var(--lx-muted)]">{group.lead[lang]}</p></div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
       {group.items.map(item=><Link href={item[0]} key={item[0]} className="group rounded-[20px] border border-[var(--lx-line)] bg-[var(--lx-panel)] p-5 transition duration-200 hover:-translate-y-0.5 hover:border-[var(--lx-line-strong)] hover:shadow-[0_14px_40px_rgba(30,45,70,.07)]">
        <div className="flex items-center justify-between"><span className="lx-explore-card-icon">{item[1]}</span><span className="text-sm text-[var(--lx-faint)] transition group-hover:text-sky-600">↗</span></div>
        <h3 className="mt-5 text-[17px] font-semibold tracking-[-.01em] text-[var(--lx-ink)]">{item[2][lang]}</h3>
        <p className="mt-2 min-h-[52px] text-[13px] leading-[1.75] text-[var(--lx-muted)]">{item[3][lang]}</p>
        <span className="mt-4 inline-flex text-xs font-medium text-sky-600">{t("open")} →</span>
       </Link>)}
      </div>
     </section>)}
    </div>
   </div>
  </section>
 </main>;
}
