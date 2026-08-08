import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import GateOrigin from "@/components/gates/GateOrigin";
import Bi from "@/components/Bi";
import FaqSection, { type BilingualFaqItem } from "@/components/FaqSection";

const PRACTICE_FAQ: BilingualFaqItem[] = [
  {
    qZh: "灵犀场的四大修炼技术是什么？", qEn: "What are Lingxi Field's Four Practices?",
    aZh: "灵犀场四大修炼技术，是围绕呼吸、觉察、内在连接、意识扩展建立的探索路径。量子息法从呼吸开始——呼吸是身体与意识之间最直接的桥梁，通过节律呼吸，让散乱的注意力重新回到当下。直觉丹道探索内在感知能力，让你逐渐分辨外界声音与真正来自内心的直觉。归零心诀带你回到内在中心，放下不断拉扯自己的旧模式，重新连接平静、清晰的自己。上升心经从觉察走向展开，让内在理解逐渐进入关系、创造、行动与生命方向。四项技术不是让你成为另一个人，而是帮助你重新认识原本就在你内部的力量。",
    aEn: "Lingxi Field's Four Practices are an exploration path built around breath, awareness, inner connection, and the expansion of consciousness. Quantum Breath starts with breathing — the most direct bridge between body and consciousness, using rhythmic breath to bring scattered attention back to the present. The Intuitive Way explores inner perception, helping you gradually tell apart outside noise from what's genuinely intuition. Heart Reset brings you back to your inner center, releasing the old patterns that keep pulling at you, reconnecting you with a calm, clear self. Ascending Heart moves from awareness into unfolding, letting inner understanding gradually enter your relationships, creation, action, and life direction. None of the four ask you to become someone else — they help you recognize the strength that was already inside you.",
  },
  {
    qZh: "修炼技术需要每天练习吗？", qEn: "Do the practices need to be done daily?",
    aZh: "灵犀场不设置强制打卡，因为真正深入的修炼，不是完成某个任务，而是一场与自己的重新连接。最初，它可能只是几分钟的呼吸与安静，但当一个人真正通过呼吸感受到身体重新放松、意识重新清晰、内在重新归位，会发现这不是在「练习某一种方法」，而是在慢慢记起那个一直存在、却被日常世界覆盖的自己。这是创始人在长期探索中的真实体验：当通过呼吸与觉察，逐渐触碰到那个更完整、更本源的自己之后，探索往往不会因为完成一次练习而结束，相反，它会自然产生一种向内深入的力量——那是一种难以用语言描述的体验。随着持续深入，许多传统修炼体系中所描述的能力与体验，也可能以不同形式逐渐显现：更敏锐的直觉感知，更稳定的内在状态，更清晰的意识觉察，更强的创造力与生命连接感。灵犀场不定义这些体验应该是什么样子，因为每个人打开自己的方式都不同——它提供的是一条入口：从呼吸开始，回到自己，然后继续探索生命更深层的可能性。",
    aEn: "Lingxi Field sets no mandatory check-ins, because real depth in practice isn't about completing a task — it's a reconnection with yourself. At first, it might be just a few minutes of breath and stillness. But once you genuinely feel your body relax, your consciousness clear, and your center return through breath, you'll find this isn't 'practicing a method' — it's slowly remembering the self that was always there, just covered by the everyday world. This is a real experience from the founder's own long exploration: once breath and awareness bring you into contact with a more whole, more original self, the exploration rarely ends when a single practice session does. Instead, it tends to generate its own pull inward — an experience difficult to put into words. As it deepens, many of the capacities and experiences described in traditional practice systems may also begin to surface in different forms: sharper intuitive perception, a steadier inner state, clearer awareness, and a stronger sense of creativity and connection to life. Lingxi Field doesn't define what these experiences should look like, because everyone opens themselves differently — what it offers is an entrance: start with breath, come back to yourself, and keep exploring the deeper possibilities of life.",
  },
];


import PracticeJournal from "./PracticeJournal";

export const metadata = { title: "修炼技术 | 灵犀 · Practices | Lingxi", description: "四项意识修炼技术：量子息法、直觉丹道、归零心诀、上升心经，各自成径，也可合一深入。Four consciousness practices — the Quantum Breath Method, the Intuitive Way, Heart Reset, and the Ascending Heart Sutra — each a complete path on its own.", alternates: { canonical: "/practice" } };

const practices = [
  { href: "/practice/breath", name: "量子息法", nameEn: "Quantum Breath Method", line: "回到当下，一道随身携带的门。", lineEn: "Return to now — a doorway you always carry." },
  { href: "/practice/intuition", name: "直觉丹道", nameEn: "The Intuitive Way", line: "区分世界的声音与心之深处的耳语。", lineEn: "Tell the world's noise from the whisper deep in the heart." },
  { href: "/practice/heart-reset", name: "归零心诀", nameEn: "Heart Reset", line: "把温暖与清晰的能量唤回心的中央。", lineEn: "Call warm, clear energy back to the center of the heart." },
  { href: "/practice/ascending-heart", name: "上升心经", nameEn: "Ascending Heart Sutra", line: "没有终点的对齐练习，一点一点更精细。", lineEn: "An alignment practice with no endpoint, refined one degree at a time." },
];

export default function PracticeIndex() {
  return (
    <>
      <Nav />
      <main className="pt-16">
        <section className="relative overflow-hidden px-6 py-24 text-center">
          <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center opacity-35">
            <GateOrigin className="h-[440px] w-[440px]" />
          </div>
          <div className="bg-reading-glass mx-auto max-w-2xl rounded-sm px-8 py-10">
          <p className="font-display text-sm uppercase tracking-widest2 text-lattice">
            <Bi zh="修炼技术" en="Practices" />
          </p>
          <h1 className="mt-6 font-display text-4xl font-light text-bone sm:text-5xl">
            <Bi zh="心为门户，万法由心而启" en="The heart is the gateway — all ways open from within it" />
          </h1>
          <p className="mx-auto mt-3 max-w-xl font-display text-sm italic text-lattice/85 sm:text-base">
            <Bi
              zh="源自遥远星系的智慧传承，以古老文明的觉知语言，结合当下生命体验重新呈现。"
              en="A wisdom lineage from distant star systems — carried in the language of an ancient civilisation's awareness, and given form again through the life you are living now."
            />
          </p>
          <div className="mx-auto mt-8 max-w-2xl space-y-5 text-base leading-9 text-bone-dim">
            <p>
              <Bi
                zh="四道修炼，各自构成一条完整的内在路径。它们可以独立深入，也可以彼此交融，在不同阶段形成相互支持的修炼体系。"
                en="Each of the four practices forms a complete inner path in its own right. They can be entered alone or allowed to interweave, becoming, at different stages, a system in which each supports the others."
              />
            </p>
            <p>
              <Bi
                zh="「四项合集」汇聚这四条路径，并作为灵犀场修炼体系的核心入口。未来新增的修炼方式，也将在这一体系中自然连接、持续展开。"
                en="The Four-in-One Set gathers these four paths and serves as the central entrance to the Lingxi Field practice system. Practices added in future will connect within this same system and continue to unfold there."
              />
            </p>
          </div>
          <div className="mx-auto mt-10 max-w-2xl space-y-5">
            <p className="font-display text-xl leading-9 text-lattice sm:text-2xl">
              <Bi
                zh="呼吸，是回归觉知的入口。"
                en="Breath is the entrance through which awareness returns."
              />
            </p>
            <p className="text-base leading-9 text-bone-dim">
              <Bi
                zh="当呼吸逐渐深入，意识开始从外在纷扰中回收，重新触及内在的清明与稳定。当心的门户开启，万千方法皆成为认识自身的路径。"
                en="As the breath deepens, consciousness withdraws from outer disturbance and touches again the clarity and steadiness within. When the gateway of the heart opens, ten thousand methods all become ways of knowing yourself."
              />
            </p>
            <p className="text-base leading-9 text-bone-dim">
              <Bi
                zh="那些原本存在于生命深处的能力，会随着意识的展开逐渐显现。你不是获得了某种新的力量，而是在一次次回归之中，重新忆起自身本有的完整。"
                en="The capacities that were always present in the depths of your life emerge gradually as consciousness unfolds. You are not acquiring some new power — with each return, you are remembering the wholeness that was yours to begin with."
              />
            </p>
          </div>
          </div>
        </section>

        <section className="px-6 pb-28">
          <div className="mx-auto max-w-4xl">
            <div className="grid gap-6 sm:grid-cols-2">
              {practices.map((p) => (
                <Link
                  key={p.href}
                  href={p.href}
                  className="group rounded-sm border border-white/10 bg-void-deep p-8 transition hover:border-lattice/40"
                >
                  <h2 className="font-display text-2xl text-bone group-hover:text-lattice">
                    <Bi zh={p.name} en={p.nameEn} />
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-bone-dim"><Bi zh={p.line} en={p.lineEn} /></p>
                  <span className="mt-5 inline-block font-display text-xs uppercase tracking-widest2 text-lattice">
                    <Bi zh="进入 →" en="Enter →" />
                  </span>
                </Link>
              ))}
            </div>

            <div className="mt-10">
              <PracticeJournal />
            </div>
            <FaqSection items={PRACTICE_FAQ} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
