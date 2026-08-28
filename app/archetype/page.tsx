import type { Metadata } from "next";
import Nav from "@/components/Nav";
import FieldProductIntroduction from "@/components/FieldProductIntroduction";
import Bi from "@/components/Bi";
import WebArchetypeExperience from "./WebArchetypeExperience";

export const metadata: Metadata = {
  title: "生命原型 · 本源原型矩阵 | 灵犀场",
  description: "从时间坐标、历法与天文位置进入，读取相对稳定的长期生命原型结构。",
};

export default function LifeArchetypePage() {
  return <><Nav/><main className="min-h-screen px-5 pb-24 pt-12 sm:pt-20"><FieldProductIntroduction href="/archetype"/><section id="field-assessment" className="lx-glass mx-auto max-w-4xl border border-amber/20 p-7 sm:p-10 lg:p-12"><p className="font-display text-sm uppercase tracking-widest2 text-amber"><Bi zh="FIELD 09 · 官网天文结构版" en="FIELD 09 · WEB ASTRONOMICAL STRUCTURE"/></p><h1 className="mt-5 font-display text-3xl font-light text-bone sm:text-5xl"><Bi zh="生命原型" en="Life Archetype"/></h1><h2 className="mt-4 font-display text-xl text-amber sm:text-2xl"><Bi zh="从时间坐标中，读取长期存在的原型结构" en="Read enduring archetype structure through time coordinates"/></h2><div className="mt-7 space-y-5 text-[15px] leading-8 text-bone-dim sm:text-base sm:leading-9"><p><Bi zh="同一生命中往往不止存在一种力量。有些长期处于核心，有些持续提供支撑，有些只有在特定环境才被调用，也有些力量长期与核心结构保持张力。" en="More than one force can inhabit a life. Some remain central, some provide enduring support, some awaken only under specific conditions, and some preserve a long-term tension with the core."/></p><p><Bi zh="官网生命原型从出生日期、具体时刻、历法转换、天文位置与既有结构演算进入，把这些信号组合成一幅本源原型矩阵。它呈现相对稳定的生命结构，不读取小程序八流进度，也不是对未来的判断。" en="The website begins with birth date, exact time when available, calendar conversion, astronomical position, and established structural calculation. These signals form an Origin Archetype Matrix: an enduring structure, independent from Mini Program convergence and never a prediction of the future."/></p></div><div className="mt-8 grid gap-4 sm:grid-cols-4">{[["核心原型","CORE"],["支撑原型","SUPPORT"],["条件原型","CONDITIONAL"],["张力原型","TENSION"]].map(([zh,en])=><div key={en} className="border border-white/10 bg-white/[.025] p-4"><p className="text-xs tracking-[.2em] text-bone-mute">{en}</p><p className="mt-2 font-display text-lg text-amber">{zh}</p></div>)}</div><div className="mt-8 border-l border-lattice/50 bg-lattice/[.035] px-5 py-4 text-sm leading-7 text-bone-soft"><Bi zh="小程序中的同名产品是另一条独立路径：它从八条生命支流读取当前原型。官网回答“什么长期构成生命”；小程序回答“此刻什么正在来到前景”。两份结果不会共用算法、缓存、章节或 PDF。" en="The Mini Program product is a separate path: eight life streams reveal the current archetype. The website asks what endures; the Mini Program asks what is moving into the foreground now. They do not share algorithms, caches, chapters, or PDFs."/></div></section><WebArchetypeExperience/></main></>;
}
