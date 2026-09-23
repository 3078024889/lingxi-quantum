"use client";
import type {ReactNode} from "react";
import FaqSection,{type BilingualFaqItem} from "@/components/FaqSection";
import type {ToolMeta} from "@/lib/tools/types";
import PrivacyBadge from "./PrivacyBadge";
import RelatedTools from "./RelatedTools";
import {useLingxiLang} from "@/lib/lingxi-i18n";
import {toolShellText} from "@/lib/tool-shell-i18n";
export default function ToolShell({tool,children,faq,techNoteZh,techNoteEn}:{tool:ToolMeta;children:ReactNode;faq?:BilingualFaqItem[];techNoteZh?:string;techNoteEn?:string}){
 const{lang}=useLingxiLang();const t=(zh:string,en:string)=>toolShellText(lang,zh,en);
 return <main className="pt-16 lg:pt-8"><section className="px-6 py-12 sm:py-16"><div className="mx-auto max-w-3xl">
  <p className="font-display text-sm uppercase tracking-widest2 text-lattice">{t("灵犀场 · 在线工具","LINGXIFIELD · Tools")}</p>
  <h1 className="mt-4 font-display text-3xl font-light text-bone sm:text-4xl">{lang==="zh"?tool.titleZh:tool.titleEn}</h1>
  <p className="mt-4 max-w-2xl text-base leading-8 text-bone-dim">{lang==="zh"?tool.oneLinerZh:tool.oneLinerEn}</p>
  <div className="mt-5"><PrivacyBadge localOnly={tool.localOnly}/></div><div className="mt-10">{children}</div>
  {faq&&faq.length>0&&<FaqSection items={faq}/>}
  {(techNoteZh||techNoteEn)&&<section className="mt-10"><h2 className="font-display text-xl font-light text-bone">{t("简短技术说明","Technical note")}</h2><p className="mt-3 text-sm leading-7 text-bone-dim">{t(techNoteZh||"",techNoteEn||techNoteZh||"")}</p></section>}
  <section className="mt-10"><h2 className="font-display text-xl font-light text-bone">{t("隐私说明","Privacy")}</h2><p className="mt-3 text-sm leading-7 text-bone-dim">{t("本工具默认在您的浏览器本地完成计算与转换。文件不会上传到灵犀场服务器，也不会写入我们的对象存储。刷新或关闭页面后，内存中的文件即被释放。","This tool processes data in your browser by default. Files are not uploaded to LINGXIFIELD servers or object storage. Closing or refreshing the page releases them from memory.")}</p></section>
  <RelatedTools slugs={tool.related}/>
 </div></section></main>;
}
