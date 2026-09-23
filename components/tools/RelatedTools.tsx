"use client";
import Link from "next/link";
import {getTool} from "@/lib/tools/registry";
import {useLingxiLang} from "@/lib/lingxi-i18n";
import {toolShellText} from "@/lib/tool-shell-i18n";
export default function RelatedTools({slugs}:{slugs?:string[]}){const{lang}=useLingxiLang();const t=(zh:string,en:string)=>toolShellText(lang,zh,en);if(!slugs?.length)return null;const tools=slugs.map(s=>getTool(s)).filter(Boolean);if(!tools.length)return null;return <section className="mt-12"><h2 className="font-display text-2xl font-light text-bone">{t("相关工具","Related tools")}</h2><div className="mt-4 grid gap-3 sm:grid-cols-2">{tools.map(x=>x?<Link key={x.slug} href={`/tools/${x.slug}`} className="rounded-sm border border-white/10 bg-void-deep px-4 py-3 transition hover:border-lattice/40"><p className="text-sm text-bone">{lang==="zh"?x.titleZh:x.titleEn}</p><p className="mt-1 text-xs leading-5 text-bone-dim">{lang==="zh"?x.oneLinerZh:x.oneLinerEn}</p></Link>:null)}</div></section>}
