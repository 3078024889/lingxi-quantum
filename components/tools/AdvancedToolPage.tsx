import ToolPriceHint from "@/components/tools/ToolPriceHint";
import type { ReactNode } from "react";

export default function AdvancedToolPage({title,intro,children,note}:{title:string;intro:string;children:ReactNode;note?:string}){
 return <main className="min-h-screen bg-[var(--lx-bg)] pt-16 text-[var(--lx-ink)] lg:ml-[260px] lg:pt-0"><div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12"><a href="/tools" className="text-sm font-medium text-[var(--lx-muted)] hover:text-[var(--lx-ink)]">← 回到全部工具</a><h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1><p className="mt-3 max-w-3xl text-base leading-7 text-[var(--lx-muted)]">{intro}</p>{note&&<div className="mt-5 rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-soft)] px-4 py-3 text-sm leading-6 text-[var(--lx-ink)]">{note}</div>}<ToolPriceHint/><div className="mt-7 rounded-3xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-4 shadow-[var(--lx-shadow)] sm:p-6">{children}</div></div></main>
}
