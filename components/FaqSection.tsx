"use client";
import {useState} from "react";
import FaqSchema,{type FaqItem} from "./FaqSchema";
import {useLingxiLang} from "@/lib/lingxi-i18n";
import {toolShellText} from "@/lib/tool-shell-i18n";
export type BilingualFaqItem={qZh:string;qEn:string;aZh:string;aEn:string};
export default function FaqSection({items,titleZh="常见问题",titleEn="Frequently Asked Questions"}:{items:BilingualFaqItem[];titleZh?:string;titleEn?:string}){
 const{lang}=useLingxiLang();const t=(zh:string,en:string)=>toolShellText(lang,zh,en);const[openIndex,setOpenIndex]=useState<number|null>(null);
 const schemaItems:FaqItem[]=items.map(it=>({q:t(it.qZh,it.qEn),a:t(it.aZh,it.aEn)}));
 return <section className="mt-10"><FaqSchema items={schemaItems}/><h2 className="font-display text-2xl font-light text-bone">{t(titleZh,titleEn)}</h2><div className="mt-6 space-y-3">{items.map((item,i)=><div key={i} className="rounded-sm border border-white/10 bg-void-deep"><button onClick={()=>setOpenIndex(openIndex===i?null:i)} className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left"><span className="font-display text-base text-bone">{t(item.qZh,item.qEn)}</span><span className="shrink-0 text-lattice">{openIndex===i?"−":"+"}</span></button>{openIndex===i&&<p className="px-6 pb-5 text-sm leading-7 text-bone-dim">{t(item.aZh,item.aEn)}</p>}</div>)}</div></section>;
}
