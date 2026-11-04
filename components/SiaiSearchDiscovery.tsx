"use client";
import Link from "next/link";
import {useLingxiLang} from "@/lib/lingxi-i18n";
import {SIAI_DISCOVERY} from "@/lib/siai-search-discovery";

const SEO_ICONS=["🌐","🏆","✦","📊","💠","🔎"] as const;
// These links are anchors into real existing tools, not six fabricated landing pages.
const DESTINATIONS=["/siai#siai-market","/siai#siai-ranking-data","/siai#siai-filter-panel","/siai#siai-ranking-data","/siai#siai-cost-calculator","/siai#siai-ranking-data"] as const;
export function SiaiSearchDiscovery({variant}:{variant:"home"|"ranking"}){
 const {lang}=useLingxiLang(),copy=SIAI_DISCOVERY[lang];
 const home=variant==="home",prefix=home?"siai-search-home":"siai-search-ranking";
 return <section className={home?"siai-discovery-section lx11-home-section":"siai-discovery-section siai-discovery-ranking"} aria-labelledby={prefix+"-title"} lang={lang==="zh"?"zh-CN":lang} dir={lang==="ar"?"rtl":"ltr"} data-siai-search-intents={variant}>
  <header className="siai-discovery-header">
   <h2 id={prefix+"-title"}>{home?copy.homeTitle:copy.rankTitle}</h2>
   <p>{home?copy.homeIntro:copy.rankIntro}</p>
  </header>
  <div className="siai-discovery-grid">
   {copy.topics.map((topic,i)=><article key={topic.q} id={prefix+"-"+i} className="siai-discovery-card">
    <Link href={DESTINATIONS[i]} aria-label={topic.q} className="siai-discovery-link">
     <span className="siai-discovery-icon" aria-hidden="true">{SEO_ICONS[i]}</span>
     <h3>{topic.q}</h3>
     <p title={home?topic.home:topic.rank}>{home?topic.home:topic.rank}</p>
    </Link>
   </article>)}
  </div>
 </section>;
}
