import Link from "next/link";
import LingxiPortal from "@/components/LingxiPortal";
import OriginSection from "@/components/OriginSection";
import FieldEntry from "@/components/FieldEntry";
import FieldInsightsSection from "@/components/FieldInsightsSection";
import BreathRing from "@/components/BreathRing";
import GateVisual from "@/components/GateVisual";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import FarewellBanner from "@/components/FarewellBanner";
import { gates } from "@/lib/gates";
import Bi from "@/components/Bi";
import FaqSection, { type BilingualFaqItem } from "@/components/FaqSection";

const HOME_FAQ: BilingualFaqItem[] = [
  {
    qZh: "灵犀场（Lingxi Field）是什么？", qEn: "What is Lingxi Field?",
    aZh: "灵犀场是一款数字化自我探索平台，提供个性化生命结构分析、象征体系探索、创意叙事内容及数字报告服务。所有内容基于真实的天文历法数据确定性计算生成，用于个人探索与反思，不构成医疗、金融、法律等专业建议。",
    aEn: "Lingxi Field is a digital self-exploration platform offering personalized life-structure analysis, symbolic exploration, creative narrative content, and digital reports. All content is generated from deterministic calculations based on real astronomical and calendrical data, intended for personal exploration and reflection — it does not constitute medical, financial, legal, or other professional advice.",
  },
  {
    qZh: "灵犀场提供哪些产品？", qEn: "What products does Lingxi Field offer?",
    aZh: "场域精测（生命图谱、关系共振、生命灵签、量子塔罗、生命韧性指数、桃花磁场指数、今日运势）、梦境智能、四大修炼技术（量子息法、直觉丹道、归零心诀、上升心经）、潜意识重塑、多维叙事。",
    aEn: "Field Insights (Life Map, Relationship Resonance, Life Oracle, Quantum Tarot, Life Resilience Index, Romance Magnetism Index, Daily Resonance), Dream Intelligence, the Four Practices (Quantum Breath, The Intuitive Way, Heart Reset, Ascending Heart), Subconscious Rewriting, and Dimensional Narrative.",
  },
  {
    qZh: "灵犀场是算命网站吗？", qEn: "Is Lingxi Field a fortune-telling website?",
    aZh: "不是。灵犀场的内容基于确定性的天文历法计算生成，目的是帮助用户从不同角度理解自己，不预测具体会发生什么事，也不提供医疗、心理、法律、财务方面的专业建议。",
    aEn: "No. Content on Lingxi Field is generated from deterministic astronomical and calendrical calculations, intended to help users understand themselves from different angles. It does not predict specific future events and does not provide medical, psychological, legal, or financial advice.",
  },
];



export default function Home() {
  return (
    <>
      <Nav />
      <FarewellBanner />
      <main className="relative overflow-hidden">
        {/* 1. 入口：意识显化系统 */}
        <LingxiPortal />

        {/* 2. 灵犀是什么 / 来自何处（创造源，紧跟入口） */}
        <OriginSection />

        {/* 3. 场域回应你的当下 */}
        <FieldEntry />

        {/* 3.5 场域精测——列出全部测试产品，每个都配一句具体的"获得什么" */}
        <FieldInsightsSection />

        {/* 4. 核心信条 */}
        <section className="border-t border-white/5 bg-void-deep px-6 py-28 sm:py-36">
          <div className="mx-auto grid max-w-5xl gap-16 sm:grid-cols-2">
            <div>
              <p className="font-display text-sm uppercase tracking-widest2 text-amber"><Bi zh="为何修炼" en="Why practice" /></p>
              <p className="mt-6 font-display text-xl leading-relaxed text-bone sm:text-2xl">
                <Bi
                  zh={<>因为真正的探索，不是向外寻找答案，<br />而是重新认识自己——向内，看见意识深处的声音，觉察、理解，逐渐忆起那个真实的自己。</>}
                  en={<>Because true exploration isn't about searching outward for answers —<br />it's about knowing yourself again. Turn inward, hear the voice beneath awareness, notice, understand, and slowly remember who you really are.</>}
                />
              </p>
            </div>
            <div>
              <p className="font-display text-sm uppercase tracking-widest2 text-amber"><Bi zh="为何显化" en="Why manifest" /></p>
              <p className="mt-6 font-display text-xl leading-relaxed text-bone sm:text-2xl">
                <Bi
                  zh={<>显化不是改变世界，而是让你的意识、行动、选择，与想创造的现实逐渐对齐——当内在清晰，现实开始回应。</>}
                  en={<>Manifestation isn't about changing the world — it's about bringing your awareness, actions, and choices into alignment with the reality you want to create. When the inside is clear, reality starts to answer.</>}
                />
              </p>
            </div>
          </div>
        </section>

        {/* 5. 重塑潜意识 */}
        <section id="gates" className="px-6 py-28 sm:py-36">
          <div className="mx-auto max-w-6xl">
            <div className="bg-void-deep mx-auto max-w-2xl rounded-sm px-8 py-10 text-center">
              <p className="font-display text-sm uppercase tracking-widest2 text-lattice/80"><Bi zh="重 塑 潜 意 识" en="Rewrite the Subconscious" /></p>
              <h2 className="mt-6 font-display text-4xl font-light text-bone sm:text-5xl"><Bi zh="每一道阻碍，都是生命留下的一面镜子" en="Every obstacle is a mirror life has left behind" /></h2>
              <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-bone-dim"><Bi zh="它不是限制，它是在等待被理解——看见它，穿越它，重新选择。" en="It isn't a limitation. It's waiting to be understood — see it, move through it, choose again." /></p>
            </div>
            <div className="mt-20 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {gates.map((gate) => (
                <Link key={gate.id} href={`/gate/${gate.id}`} className="group relative block overflow-hidden rounded-sm border border-[color:var(--aurora-glass-border)] transition hover:border-lattice/60">
                  <div className="relative h-80 bg-void-deep">
                    <GateVisual id={gate.id} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[rgba(10,20,38,0.55)] via-[rgba(10,20,38,0.12)] to-transparent" />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-7">
                    <span className="font-display text-4xl text-lattice/70">{gate.glyph}</span>
                    <h3 className="mt-1 font-display text-2xl text-bone"><Bi zh={gate.title} en={gate.titleEn} /></h3>
                    <p className="mt-3 text-sm leading-6 text-bone-dim"><Bi zh={gate.line} en={gate.lineEn} /></p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* 6. 量子息法 */}
        {/* 5.5 多维叙事入口 */}
        <section className="px-6 py-24 sm:py-28">
          <div className="bg-void-deep mx-auto max-w-3xl rounded-sm px-8 py-12 text-center">
            <p className="font-display text-sm uppercase tracking-widest2 text-amber"><Bi zh="多维叙事入口" en="Dimensional Narratives" /></p>
            <h2 className="mt-6 font-display text-4xl font-light text-bone"><Bi zh="阅读不同意识层级中的现实结构" en="Read reality across levels of consciousness" /></h2>
            <p className="mx-auto mt-6 max-w-xl text-base leading-9 text-bone-dim">
              <Bi zh="长篇传输 · 现实重写记录 · 场域叙事 · 场域观测日志——灵犀原创，持续生长的意识记录。现实不是被经历的，而是被不同层级的意识持续生成。" en="Novels · Reality Rewrite Records · Field Narratives · Field Observation Logs — original records from the Field, growing without end. Reality is not experienced; it is continuously generated." />
            </p>
            <Link href="/narrative" className="mt-10 inline-block border border-amber/50 px-10 py-4 font-display text-sm uppercase tracking-widest2 text-amber transition hover:bg-amber hover:text-void-deep">
              <Bi zh="进入多维叙事" en="Enter the Narratives" />
            </Link>
          </div>
        </section>

        <section className="border-t border-white/5 bg-void-deep px-6 py-28 sm:py-36">
          <div className="mx-auto flex max-w-5xl flex-col items-center gap-16 sm:flex-row sm:justify-between">
            <div className="max-w-md">
              <p className="font-display text-sm uppercase tracking-widest2 text-amber"><Bi zh="每日练习" en="Daily practice" /></p>
              <h2 className="mt-6 font-display text-4xl font-light text-bone"><Bi zh="量子息法" en="The Quantum Breath Method" /></h2>
              <p className="mt-6 text-base leading-9 text-bone-dim">
                <Bi
                  zh="呼吸从你出生的第一刻起就没有停过，也是少数几件意志能够直接接管的身体活动之一。它不需要任何器材，随时可以开始——吸气、停顿、呼气、停顿，四段均等的节律，把散乱的注意力，重新带回此刻。"
                  en="Breath has never once stopped since your first moment of life, and it is one of the few bodily rhythms your will can directly reach into. It needs no equipment, and can begin anytime — inhale, pause, exhale, pause; four equal parts, bringing scattered attention back to this moment."
                />
              </p>
              <Link href="/practice/breath" className="mt-10 inline-block border border-lattice/40 px-8 py-4 font-display text-sm uppercase tracking-widest2 text-lattice transition hover:border-amber hover:text-amber"><Bi zh="开始练习" en="Begin the practice" /></Link>
            </div>
            <BreathRing />
          </div>
        </section>

        {/* 7. 显化 · 能量交换 */}
        <section className="px-6 py-28 sm:py-36">
          <div className="bg-void-deep mx-auto max-w-3xl rounded-sm px-8 py-12 text-center">
            <p className="font-display text-sm uppercase tracking-widest2 text-lattice/80"><Bi zh="显化 · 能量交换" en="Manifestation · Energy Exchange" /></p>
            <h2 className="mt-6 font-display text-4xl font-light text-bone sm:text-5xl"><Bi zh="活在此版本中的你" en="Live as the you in this version" /></h2>
            <p className="mx-auto mt-8 max-w-xl text-base leading-9 text-bone-dim">
              <Bi
                zh="每天 5–10 分钟，进入已经拥有的生活状态，写下今天的感受与你正在做的事，像它已经发生一样去记录它。不断重复，保持对齐，保持信任与连贯——直到某天，物质世界中早已对齐的指引来临。"
                en="Five to ten minutes a day: enter the state of already having it, and write today's feelings and what you are doing — recording it as if it has already happened. Repeat, stay aligned, keep trust and coherence — until one day the guidance already aligned in the material world arrives."
              />
            </p>
            <Link href="/live-as" className="mt-12 inline-block bg-lattice px-10 py-4 font-display text-sm uppercase tracking-widest2 text-void-deep transition hover:bg-amber"><Bi zh="进入我的现实回路" en="Enter my Reality Loop" /></Link>
          </div>
        </section>
      <div className="mx-auto max-w-2xl px-6 pb-24">
        <FaqSection items={HOME_FAQ} />
      </div>
      </main>
      <Footer />
    </>
  );
}
