import type { Metadata } from "next";
import Nav from "@/components/Nav";
import FieldProductIntroduction from "@/components/FieldProductIntroduction";
import Bi from "@/components/Bi";
import ArchetypeProgress from "./ArchetypeProgress";

export const metadata: Metadata = {
  title: "生命原型 · 八流归一 | 灵犀场",
  description: "核对同一生命主体的八份场域报告，完成后重新推演完整生命原型。",
};

export default function LifeArchetypePage() {
  return <><Nav/><main className="min-h-screen px-5 pb-24 pt-12 sm:pt-20"><FieldProductIntroduction href="/archetype"/><section id="field-assessment" className="lx-glass mx-auto mb-8 max-w-4xl border border-amber/20 p-7 sm:p-10 lg:p-12"><p className="font-display text-sm uppercase tracking-widest2 text-amber"><Bi zh="FIELD 09 · 八流归一" en="FIELD 09 · EIGHT-STREAM CONVERGENCE"/></p><h1 className="mt-5 font-display text-3xl font-light text-bone sm:text-5xl"><Bi zh="生命原型" en="Life Archetype"/></h1><h2 className="mt-4 font-display text-xl text-amber sm:text-2xl"><Bi zh="八份同主体报告，汇成一份完整生命原型" en="Eight reports for one subject converge into one complete Life Archetype"/></h2><div className="mt-7 space-y-5 text-[15px] leading-8 text-bone-dim sm:text-base sm:leading-9"><p><Bi zh="生命原型不是八份结果的摘要。系统先核对报告主体，再把跨域重复、共同增强、场景差异、结构冲突、隐藏力量与现实承接重新放入同一张知识网络。" en="Life Archetype is not a summary of eight results. The system verifies the report subject, then recalculates recurring patterns, amplification, contextual differences, tensions, latent forces, and real-world capacity in one knowledge network."/></p><p><Bi zh="同一账户可以保存不同人的报告，但只有姓名与主体身份一致的八类报告才会计入同一条进度；关系共振只归入发起报告的第一主体，不会因为另一人的姓名出现在报告中而误计。" en="One account may hold reports for several people, but only eight report types bound to the same subject enter one progress record. A relationship report belongs only to its initiating primary subject."/></p></div></section><ArchetypeProgress/></main></>;
}
