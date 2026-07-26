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
          <p className="font-display text-sm uppercase tracking-widest2 text-lattice/80">
            <Bi zh="修炼技术" en="Practices" />
          </p>
          <h1 className="mt-6 font-display text-4xl font-light text-bone sm:text-5xl">
            <Bi zh="心为门户，万法唯心" en="The heart is the gateway; all ways are of the heart" />
          </h1>
          <p className="mx-auto mt-3 max-w-xl font-display text-sm italic text-lattice/85 sm:text-base">
            <Bi
              zh="源自远古遥远星系的智慧传承，以古老又切合当下的声音呈现。"
              en="A wisdom lineage from ancient, distant star systems — voiced anew for the present moment."
            />
          </p>
          <p className="mx-auto mt-8 max-w-2xl text-base leading-9 text-bone-dim">
            <Bi
              zh="四道修炼各自成一条完整的路，也可以一起深入，让彼此呼应。「四项合集」收纳了这四条路径，此后新加入的练习，也会自然汇入其中。"
              en="Each of the four practices is a complete path on its own — or walk them together and let them echo one another. The Four-in-One Set holds all four paths, and any practice added later flows naturally into it."
            />
          </p>
          <p className="mx-auto mt-8 max-w-2xl font-display text-xl leading-9 text-lattice sm:text-2xl">
            <Bi zh="越呼吸越清明，唯有心通道打开，万法皆成。" en="The more you breathe, the clearer you become; only when the heart's channel opens do all ways complete." />
          </p>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-9 text-bone-dim">
            <Bi zh="解锁的其他早已存在的能力，会随之显现——你只是忆起了自己。" en="Other abilities, already within you, appear in turn — you are only remembering yourself." />
          </p>
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
                  <span className="mt-5 inline-block font-display text-xs uppercase tracking-widest2 text-lattice/70">
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
