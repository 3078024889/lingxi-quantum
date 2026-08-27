import type { Metadata } from "next";
import Nav from "@/components/Nav";
import FieldProductIntroduction from "@/components/FieldProductIntroduction";
import Bi from "@/components/Bi";

export const metadata: Metadata = {
  title: "生命原型 | 灵犀场",
  description: "八个场域精测节点汇入此刻的主原型、隐藏原型与行动原型。",
};

export default function LifeArchetypePage() {
  return (
    <>
      <Nav />
      <main className="min-h-screen px-5 pb-24 pt-12 sm:pt-20">
        <FieldProductIntroduction href="/archetype" />
        <section id="field-assessment" className="lx-glass mx-auto max-w-4xl border border-lattice/20 p-7 sm:p-10 lg:p-12">
          <p className="font-display text-sm uppercase tracking-widest2 text-lattice">
            <Bi zh="小程序独有 · 灵犀场树突演算" en="MINI PROGRAM EXCLUSIVE · LINGXIFIELD DENDRITIC ENGINE" />
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
            <p><Bi zh="两条路径彼此独立，也可以彼此映照。生命原型，是小程序中八重场域汇流后最集中的一次读取。它不在判断“你属于哪一种人”，而是在读取：此刻，生命中的哪些结构正在同时来到前景。" en="The two paths remain independent, yet can reflect one another. Life Archetype is the most concentrated reading after eight Mini Program fields converge. It does not decide what kind of person you are; it reads which life structures are arriving in the foreground together now." /></p>
            <p><Bi zh="有些节点长期稳定，有些最近才增强；有些彼此支持，也有些正在形成张力。完成的场域精测越丰富，可调用的历史节点越完整；第一次进入，也可以从当前主题与真实选择形成第一组结构记录。" en="Some nodes remain stable over time; others have only recently intensified. Some support one another, while others form tension. More completed Field Insights provide richer historical evidence; a first visit can still form an initial structural record from your current theme and honest choices." /></p>
          </div>

          <div className="mt-9 border-l border-lattice/50 bg-lattice/[.035] px-5 py-4 text-sm leading-7 text-bone-soft">
            <Bi zh="请在微信小程序「灵犀场 lingxifield」→「场域精测」中进入「生命原型」。" en="Open “Life Archetype” in the Lingxifield WeChat Mini Program under “Field Insights”." />
          </div>
        </section>
      </main>
    </>
  );
}
