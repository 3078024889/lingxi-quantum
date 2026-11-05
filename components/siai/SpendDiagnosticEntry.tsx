"use client";
import Link from "next/link";
import {useLingxiLang} from "@/lib/lingxi-i18n";
import {DIAGNOSTIC_COPY} from "@/lib/siai/spend-diagnostic-i18n";

export default function SpendDiagnosticEntry(){
 const {lang}=useLingxiLang();
 const t=DIAGNOSTIC_COPY[lang];
 const path=lang==="zh"?"/siai/spend-diagnostic":"/"+lang+"/siai/spend-diagnostic";
 return <aside aria-label={t.title} className="my-3 flex w-full min-w-0 flex-col gap-3 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-sky-50 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:gap-5" dir={lang==="ar"?"rtl":"ltr"}>
  <div className="min-w-0 flex-1">
   <div className="mb-1 flex flex-wrap items-center gap-2"><strong className="text-[17px] font-bold text-slate-900">{t.title}</strong><span className="rounded-full bg-emerald-100 px-2.5 py-1 text-sm font-semibold text-emerald-800">{t.eyebrow}</span></div>
   <p className="text-[15px] leading-relaxed text-slate-700">{t.subtitle}</p>
   <p className="mt-1 text-sm text-slate-500">{[t.save,t.quota,t.compare].join(" · ")}</p>
  </div>
  <Link href={path} className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-emerald-700 px-5 py-3 text-[15px] font-semibold text-white no-underline shadow-sm transition-colors hover:bg-emerald-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700">{t.start} <span aria-hidden="true" className="ms-2">→</span></Link>
 </aside>;
}
