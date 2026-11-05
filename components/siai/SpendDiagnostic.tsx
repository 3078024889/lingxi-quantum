"use client";
import {useMemo,useState} from "react";
import {useLingxiLang} from "@/lib/lingxi-i18n";
import Link from "next/link";
import {DIAGNOSTIC_COPY,DIAGNOSIS_RESULT_COPY} from "@/lib/siai/spend-diagnostic-i18n";
import {diagnoseAiSpend} from "@/lib/siai/free-spend-diagnostic";
import type {SpendItem} from "@/lib/siai/free-spend-diagnostic";
const initial=():SpendItem=>({name:"",monthlyPrice:0,usedPerMonth:0});
const field="mt-1 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-3 text-base text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100";
export default function SpendDiagnostic(){
 const {lang}=useLingxiLang(),t=DIAGNOSTIC_COPY[lang],r=DIAGNOSIS_RESULT_COPY[lang];
 const [currency,setCurrency]=useState<"CNY"|"USD">("CNY");
 const [items,setItems]=useState<SpendItem[]>([initial()]);
 const [submitted,setSubmitted]=useState(false);
 const [copyStatus,setCopyStatus]=useState(false);
 const money=(n:number)=>new Intl.NumberFormat(lang==="zh"?"zh-CN":lang,{style:"currency",currency}).format(n);
 const update=(i:number,patch:Partial<SpendItem>)=>{setItems(v=>v.map((x,j)=>i===j?{...x,...patch}:x));setSubmitted(false);};
 const calculation=useMemo(()=>{try{return {result:diagnoseAiSpend({currency,items}),error:""};}catch(e){return {result:null,error:e instanceof Error?e.message:t.error};}},[currency,items,t.error]);
 const loadExample=()=>{setItems([{name:r.exampleName,monthlyPrice:99,usedPerMonth:0,expectedPerMonth:0},{name:"AI B",monthlyPrice:49,usedPerMonth:12,expectedPerMonth:12}]);setSubmitted(true);};
 const share=async()=>{if(!calculation.result)return;const v=calculation.result;const text=t.title+"\n"+t.current+": "+money(v.monthlySpend)+"\n"+t.potential+": "+money(v.potentialMonthlySavings)+"\n"+r.disclaimer+"\nhttps://lingxifield.com/siai/spend-diagnostic";try{await navigator.clipboard.writeText(text);setCopyStatus(true);}catch{setCopyStatus(false);}};
 return <main className="mx-auto w-full max-w-4xl px-4 pb-20 pt-7 text-slate-900 sm:px-6" dir={lang==="ar"?"rtl":"ltr"} lang={lang==="zh"?"zh-CN":lang}>
  <div className="mb-6 rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-sky-50 px-5 py-7 shadow-sm sm:px-8">
   <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1.5 text-sm font-semibold text-emerald-800">{t.eyebrow}</span>
   <h1 className="mt-3 text-2xl font-bold leading-tight sm:text-3xl">{t.pageTitle}</h1>
   <p className="mt-3 text-base leading-relaxed text-slate-700">{t.pageIntro}</p>
   <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-600">{[t.save,t.quota,t.compare].map(x=><span key={x}>✓ {x}</span>)}</div>
  </div>
  <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
   <label className="w-48 text-sm font-semibold text-slate-700">{t.currency}<select className={field} value={currency} onChange={e=>{setCurrency(e.target.value as "CNY"|"USD");setSubmitted(false);}}><option value="CNY">CNY ¥</option><option value="USD">USD $</option></select></label>
   <button type="button" onClick={loadExample} className="min-h-11 rounded-xl border border-emerald-200 bg-white px-4 text-sm font-semibold text-emerald-800 hover:bg-emerald-50">{r.exampleLabel}</button>
  </div>
  <div className="space-y-3">{items.map((item,i)=><section key={i} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
    <div className="mb-3 flex items-center justify-between gap-3"><h2 className="text-lg font-bold">{i+1}. {t.name}</h2>{items.length>1&&<button type="button" className="rounded-lg px-2 py-2 text-sm text-rose-700 hover:bg-rose-50" onClick={()=>{setItems(v=>v.filter((_,j)=>j!==i));setSubmitted(false);}}>{t.remove}</button>}</div>
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
     <label className="text-sm font-medium text-slate-700">{t.name}<input className={field} maxLength={100} value={item.name} placeholder={r.exampleName} onChange={e=>update(i,{name:e.target.value})}/></label>
     <label className="text-sm font-medium text-slate-700">{t.price}<input className={field} type="number" min="0" max="1000000" step="0.01" value={item.monthlyPrice} onChange={e=>update(i,{monthlyPrice:e.target.valueAsNumber})}/></label>
     <label className="text-sm font-medium text-slate-700">{t.usage}<input className={field} type="number" min="0" max="1000000" step="1" value={item.usedPerMonth} onChange={e=>update(i,{usedPerMonth:e.target.valueAsNumber})}/></label>
    </div>
    <details className="mt-3 rounded-xl bg-slate-50 p-3"><summary className="cursor-pointer text-sm font-semibold text-emerald-800">{t.compare} · {t.expected}</summary>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
       <label className="text-sm font-medium text-slate-700">{t.expected}<input className={field} type="number" min="0" max="1000000" step="1" placeholder={String(item.usedPerMonth)} value={item.expectedPerMonth??""} onChange={e=>update(i,{expectedPerMonth:e.target.value===""?undefined:e.target.valueAsNumber})}/></label>
       <label className="text-sm font-medium text-slate-700">{t.alternate}<input className={field} type="number" min="0" max="1000000" step="0.01" placeholder="—" value={item.alternativeMonthlyPrice??""} onChange={e=>update(i,{alternativeMonthlyPrice:e.target.value===""?undefined:e.target.valueAsNumber})}/></label>
      </div>
    </details>
    <label className="mt-4 inline-flex min-h-9 items-center gap-3 text-sm text-slate-700"><input type="checkbox" className="h-4 w-4 accent-emerald-700" checked={!!item.essential} onChange={e=>update(i,{essential:e.target.checked})}/>{t.essential}</label>
   </section>)}</div>
  <div className="mt-5 flex flex-wrap gap-3"><button type="button" disabled={items.length>=30} onClick={()=>{setItems(v=>[...v,initial()]);setSubmitted(false);}} className="min-h-12 rounded-xl border border-slate-300 bg-white px-5 text-base font-semibold text-slate-800 disabled:opacity-50">+ {t.add}</button><button type="button" onClick={()=>setSubmitted(true)} className="min-h-12 flex-1 rounded-xl bg-emerald-700 px-6 text-base font-bold text-white hover:bg-emerald-800 sm:flex-none">{t.run} →</button></div>
  {submitted&&(calculation.result?<section className="mt-7 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 sm:p-6" aria-live="polite">
   <h2 className="text-xl font-bold">{t.outcome}</h2>
   <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">{[[t.current,calculation.result.monthlySpend],[t.potential,calculation.result.potentialMonthlySavings],[t.annual,calculation.result.annualizedPotentialSavings]].map(([k,v])=><div key={String(k)} className="rounded-xl bg-white p-4"><div className="text-sm text-slate-600">{k}</div><div className="mt-1 text-2xl font-bold tabular-nums text-emerald-800">{money(Number(v))}</div></div>)}</div>
   <div className="mt-4 space-y-2">{calculation.result.findings.map(f=><article className="rounded-xl border border-emerald-100 bg-white p-4" key={f.name}><h3 className="font-semibold">{f.name}</h3><p className="mt-1 text-sm leading-relaxed text-slate-700">{f.status==="review"?r.review:f.status==="downgrade_candidate"?r.downgrade:r.keep}</p><p className="mt-2 text-sm text-slate-600">{r.perUse}: {f.costPerUse===null?"—":money(f.costPerUse)}</p></article>)}</div>
   <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-white p-4">
    <p className="max-w-xl text-sm leading-relaxed text-slate-700">{r.disclaimer}</p>
    <Link href={lang==="zh"?"/siai":"/"+lang+"/siai"} className="inline-flex min-h-11 items-center rounded-xl bg-emerald-700 px-4 text-sm font-semibold text-white no-underline hover:bg-emerald-800">{t.compare} →</Link>
   </div>
   <button type="button" onClick={share} className="min-h-11 rounded-xl border border-emerald-600 bg-white px-4 text-sm font-semibold text-emerald-800">{t.share}</button>{copyStatus&&<span role="status" className="ms-3 text-sm text-emerald-800">✓</span>}
  </section>:<p role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-800">{t.error}</p>)}
  <p className="mt-6 text-sm leading-relaxed text-slate-500">{t.privacy}</p>
 </main>;
}
