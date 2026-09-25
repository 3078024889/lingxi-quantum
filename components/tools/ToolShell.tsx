"use client";
import Link from "next/link";
import type {ReactNode} from "react";
import FaqSection,{type BilingualFaqItem} from "@/components/FaqSection";
import type {ToolMeta} from "@/lib/tools/types";
import RelatedTools from "./RelatedTools";
import {useLingxiLang} from "@/lib/lingxi-i18n";
import {toolShellText} from "@/lib/tool-shell-i18n";
import {toolTitle} from "@/lib/tools/card-i18n";
import {toolCardLine} from "@/lib/tools/hub-copy-v1470";
export default function ToolShell({tool,children,faq}:{tool:ToolMeta;children:ReactNode;faq?:BilingualFaqItem[];techNoteZh?:string;techNoteEn?:string}){
 const{lang}=useLingxiLang();const t=(zh:string,en:string)=>toolShellText(lang,zh,en);const title=toolTitle(lang,tool.slug,lang==="zh"?tool.titleZh:tool.titleEn);const summary=toolCardLine(lang,tool.slug,tool.category==="pdf"?"document":tool.category==="image"?"image":tool.category==="qr"?"qr":"utility",tool.oneLinerZh,tool.oneLinerEn);
 return <main className="pt-16 lg:pt-8"><section className="px-6 py-12 sm:py-16"><div className="mx-auto max-w-3xl">
  <Link href="/tools" className="lx-tool-back">← {t("返回实用工具","Back to tools")}</Link>
  <p className="mt-6 font-display text-sm uppercase tracking-widest2 text-lattice">{t("灵犀场 · 在线工具","LINGXIFIELD · Tools")}</p>
  <h1 className="mt-4 font-display text-3xl font-light text-bone sm:text-4xl">{title}</h1>
  <p className="mt-4 max-w-2xl text-base leading-8 text-bone-dim">{summary}</p>
  <div className="mt-8">{children}</div>
  {faq&&faq.length>0&&<FaqSection items={faq}/>}
  <RelatedTools slugs={tool.related}/>
 </div></section></main>;
}
