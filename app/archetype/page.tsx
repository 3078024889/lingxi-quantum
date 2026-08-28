import type { Metadata } from "next";
import Nav from "@/components/Nav";
import FieldProductIntroduction from "@/components/FieldProductIntroduction";
import Bi from "@/components/Bi";
import ArchetypeProgress from "./ArchetypeProgress";

export const metadata: Metadata = {
  title: "生命原型 | 灵犀场",
  description: "八个独立场域的有效节点汇入此刻，形成当前生命原型结构。",
};

export default function LifeArchetypePage() {
  return (
    <>
      <Nav />
      <main className="min-h-screen px-5 pb-24 pt-12 sm:pt-20">
        <FieldProductIntroduction href="/archetype" />
        <section id="field-assessment" className="lx-glass mx-auto max-w-4xl border border-lattice/20 p-7 sm:p-10 lg:p-12">
          <p className="font-display text-sm uppercase tracking-widest2 text-lattice">
            <Bi zh="双入口汇流 · 灵犀场树突演算" en="TWO ENTRANCES · LINGXIFIELD DENDRITIC ENGINE" />
          </p>
          <h2 className="mt-5 font-display text-2xl font-light text-bone sm:text-3xl">
            <Bi zh="同一组生命主题，两种不同的读取方式" en="The same life themes, read through two distinct paths" />
          </h2>

          <div className="mt-7 space-y-5 text-[15px] leading-8 text-bone-dim sm:text-base sm:leading-9">
            <p><Bi zh="灵犀场官网与微信小程序保留相同的场域主题，但采用不同的结构入口。" en="The Lingxi Field website and WeChat Mini Program share the same field themes, but enter their structures differently." /></p>
            <p><strong className="font-medium text-bone"><Bi zh="官网" en="The website" /></strong><Bi zh="从出生日期、具体时刻、历法与天文位置进入，通过时间坐标、天文数据与多种结构体系，展开相对稳定的生命结构。" en=" begins with birth date, specific time, calendar system, and astronomical position, unfolding relatively stable life structures through temporal coordinates and multiple structural systems." /></p>
            <p><strong className="font-medium text-bone"><Bi zh="微信小程序" en="The Mini Program" /></strong><Bi zh="从真实选择、行为情境与当下状态进入。每一次真实选择都会激活对应的知识节点；不同场域精测留下的有效记录，会沿灵犀场树突知识网络重新连接、增强、抑制并交叉校准。" en=" begins with real choices, lived situations, and present state. Each response activates knowledge nodes; valid records from different Field Insights reconnect, reinforce, inhibit, and cross-calibrate through the Lingxifield Dendritic Knowledge Network." /></p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="border border-white/10 bg-white/[.025] p-5">
              <p className="text-xs uppercase tracking-[.25em] text-bone-mute">WEB</p>
              <p className="mt-3 font-display text-xl text-lattice"><Bi zh="从时间坐标，看见生命结构。" en="See life structure through temporal coordinates." /></p>
            </div>
            <div className="border border-white/10 bg-white/[.025] p-5">
              <p className="text-xs uppercase tracking-[.25em] text-bone-mute">MINI PROGRAM</p>
              <p className="mt-3 font-display text-xl text-lattice"><Bi zh="从正在发生的选择，看见生命结构。" en="See life structure through choices now unfolding." /></p>
            </div>
          </div>

          <div className="mt-8 space-y-5 border-t border-white/10 pt-8 text-[15px] leading-8 text-bone-dim sm:text-base sm:leading-9">
            <p><Bi zh="生命原型并非一次测定，而是由八条生命支流共同汇聚而成。自第一条支流开启之日起，365 天内完成八项场域精测；当八条支流全部解锁，灵犀场将自动整合每一次场域记录，生成完整的生命原型报告。" en="Life Archetype is not a single assessment. It emerges when eight tributaries of life converge. Complete and unlock all eight Field Insights within 365 days of the first tributary, and Lingxi Field will automatically generate the full Life Archetype archive." /></p>
            <p><Bi zh="它呈现的不是八份结果的叠加，而是当关系、韧性、创造、状态与生命结构彼此交汇后，逐渐显现出的整体轮廓。有些节点彼此增强，有些构成张力，也有些为现实承接保留空间。" en="It is not eight results stacked together. It reveals the whole contour that appears when relationship, resilience, creation, state, and life structure intersect: some nodes reinforce one another, some form tension, and others preserve capacity for reality to receive change." /></p>
            <p className="font-display text-xl text-lattice"><Bi zh="八流汇聚，原型自现。" en="When eight streams converge, the archetype reveals itself." /></p>
          </div>

          <div className="mt-9 border-l border-lattice/50 bg-lattice/[.035] px-5 py-4 text-sm leading-7 text-bone-soft">
            <Bi zh="关系共振的深度关系、合伙商业与其他关系采用三套独立题目；完成其中任意一种，即计入一条关系支流。若三种都完成，它们会作为更丰富的关系证据进入同一份生命原型，不重复占位。" en="Relationship Resonance has three independent paths: deep relationship, business partnership, and other relationship. Completing any one counts as the relationship tributary; completing all three enriches the same Life Archetype with broader relational evidence without occupying extra tributary slots." />
          </div>
          <ArchetypeProgress />
        </section>
      </main>
    </>
  );
}
