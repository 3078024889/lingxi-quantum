"use client";
import Link from "next/link";
import {useLingxiLang} from "@/lib/lingxi-i18n";
import {SIAI_DISCOVERY} from "@/lib/siai-search-discovery";
export function SiaiSearchDiscovery({variant}:{variant:"home"|"ranking"}){
 const {lang}=useLingxiLang(),copy=SIAI_DISCOVERY[lang];
 const icons=["🌐","🏆","✨","🧭","📊","👑"] as const;
 // Only open a narrowed view when its meaning matches the search intent.
 const intents=["cost","all","all","all","api","all"] as const;
 const home=variant==="home",prefix=home?"siai-search-home":"siai-search-ranking";
 return <section className={home?"lx11-home-section my-8":"mx-auto my-5 w-full px-3 sm:px-5"} aria-labelledby={prefix+"-title"} lang={lang==="zh"?"zh-CN":lang} dir={lang==="ar"?"rtl":"ltr"} data-siai-search-intents={variant}>
  <div className="mb-4">
   <h2 id={prefix+"-title"} className="text-xl font-bold sm:text-2xl">{home?copy.homeTitle:copy.rankTitle}</h2>
   <p className="mt-2 text-sm leading-7">{home?copy.homeIntro:copy.rankIntro}</p>
  </div>
  <div className={home?"grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3":"siai-discovery-six"}>
   {copy.topics.map((topic,i)=>home?
    <article key={topic.q} id={prefix+"-"+i} className="rounded-xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-4">
     <h3 className="text-base font-bold">{topic.q}</h3>
     <p className="mt-2 text-sm leading-6">{topic.home}</p>
     <Link href="/siai" className="mt-3 inline-block text-sm font-semibold underline underline-offset-4">{lang==="zh"?"查看全球 SIAI 产品资料":lang==="en"?"Browse global SIAI tools":copy.footerTitle} →</Link>
    </article>:
    <article key={topic.q} id={prefix+"-"+i} className="siai-discovery-card">
      <a href={"/siai?intent="+intents[i]+(intents[i]==="cost"||intents[i]==="api"?"#siai-cost-estimator":"#siai-market")} aria-label={topic.q}>
       <span className="siai-discovery-icon" aria-hidden="true">{icons[i]}</span>
       <h3>{topic.q}</h3><p>{topic.rank}</p>
      </a>
    </article>)}
  </div>
 </section>;
}
