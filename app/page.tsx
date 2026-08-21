import Link from "next/link";
import LingxiPortal from "@/components/LingxiPortal";
import PracticeLadder from "@/components/PracticeLadder";
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
import OpeningAtrium from "@/components/OpeningAtrium";

const GATES_FAQ: BilingualFaqItem[] = [
  {
    qZh: "什么是灵犀场的「重塑潜意识」？", qEn: "What is Lingxi Field's 'Rewrite the Subconscious'?",
    aZh: "人的很多选择，并不是来自当下的意识决定——很多时候，我们重复某种关系模式、生活轨迹、情绪反应，是因为潜意识里早已形成了一套熟悉的运行方式。灵犀场的「重塑潜意识」，不是让你强迫自己改变，也不是简单地告诉你应该怎样生活，它更像是一面镜子：通过意识观察、象征连接、内在记录与场域练习，帮助你看见那些反复出现的人生主题，那些隐藏却影响选择的信念，那些曾经保护过你、如今却限制你的旧模式。当一个人真正看见自己的内在结构，改变往往不是靠压迫自己完成，而是在理解之后自然发生——因为你不是在对抗自己，你是在重新认识自己。",
    aEn: "Many of our choices don't come from a conscious decision made in the moment — often, we repeat a relationship pattern, a life trajectory, or an emotional reaction because the subconscious has already formed a familiar way of running. Lingxi Field's 'Rewrite the Subconscious' doesn't force you to change, nor does it simply tell you how to live. It's closer to a mirror: through conscious observation, symbolic connection, inner recording, and field practice, it helps you see the life themes that keep resurfacing, the hidden beliefs shaping your choices, and the old patterns that once protected you but now hold you back. When a person truly sees their own inner structure, change tends to happen not by forcing yourself, but naturally, after understanding — because you aren't fighting yourself. You're getting to know yourself again.",
  },
  {
    qZh: "重塑潜意识可以带来什么？", qEn: "What can Rewrite the Subconscious bring?",
    aZh: "潜意识并不是需要被消灭的东西，它储存着你的经历、记忆、情绪与生命经验。真正的改变，不是删除过去，而是重新建立与自己的关系。在灵犀场中，你可以逐渐探索：为什么某些事情总会重复发生，为什么明明想改变却总回到旧模式，哪些内在信念正在影响你的选择，如何让意识、行动与想创造的现实逐渐靠近。当内在结构发生变化，外在生活中的选择方式、人际关系、创造方向，也可能随之展开新的可能。",
    aEn: "The subconscious isn't something to be erased — it holds your experiences, memories, emotions, and life history. Real change isn't deleting the past; it's rebuilding your relationship with yourself. Within Lingxi Field, you can gradually explore why certain things keep repeating, why you return to old patterns even when you want change, which inner beliefs are shaping your choices, and how to bring awareness, action, and the reality you want to create closer together. As the inner structure shifts, the way you choose, relate to others, and create in outer life may open new possibilities too.",
  },
  {
    qZh: "重塑潜意识是不是改变既定的人生？", qEn: "Is Rewrite the Subconscious about changing a fixed life?",
    aZh: "灵犀场不认为人的生命是一条固定轨道，它更相信生命是一场持续生成的过程——过去形成的模式会影响现在的倾向，但觉察，会创造新的选择空间。重塑潜意识不是替你决定未来，而是帮助你拿回更多主动权，当你开始看见自己，你才真正开始参与自己的生命创造。",
    aEn: "Lingxi Field doesn't see life as a fixed track — it holds life closer to an ongoing process of becoming. Patterns formed in the past shape present tendencies, but awareness creates new room to choose. Rewrite the Subconscious doesn't decide your future for you — it helps you reclaim more agency. Once you begin to see yourself, you truly begin to take part in creating your own life.",
  },
  {
    qZh: "重塑潜意识需要每天练习吗？", qEn: "Does Rewrite the Subconscious need to be practiced daily?",
    aZh: "灵犀场不设置强制任务，因为真正深入的变化，不来自外界要求，而来自一个人开始愿意了解自己。有些改变发生在一次深刻的觉察中，有些改变则需要时间，让新的意识模式逐渐融入生活。你可以按照自己的节奏进入——一次阅读，一次练习，一次新的理解，每一次回到自己，都是一次重新连接。",
    aEn: "Lingxi Field sets no mandatory routine, because real depth of change doesn't come from an outside requirement — it comes from a person becoming willing to understand themselves. Some shifts happen in a single moment of deep awareness; others take time, as a new conscious pattern slowly settles into life. You can enter at your own pace — one reading, one practice, one new understanding. Every return to yourself is a reconnection.",
  },
];

const HOME_FAQ: BilingualFaqItem[] = [
  {
    qZh: "灵犀场（Lingxi Field）是什么？", qEn: "What is Lingxi Field?",
    aZh: "灵犀场是一款数字化自我探索平台，提供个性化生命结构分析、象征体系探索、创意叙事内容及数字报告服务。所有内容基于真实的天文历法数据确定性计算生成，用于个人探索与反思，不构成医疗、金融、法律等专业建议。",
    aEn: "Lingxi Field is a digital self-exploration platform offering personalized life-structure analysis, symbolic exploration, creative narrative content, and digital reports. All content is generated from deterministic calculations based on real astronomical and calendrical data, intended for personal exploration and reflection — it does not constitute medical, financial, legal, or other professional advice.",
  },
  {
    qZh: "灵犀场提供哪些产品？", qEn: "What products does Lingxi Field offer?",
    aZh: "场域精测（生命图谱、关系共振、生命灵签、量子生命镜像、生命韧性指数、桃花磁场指数、今日运势潮汐）、梦境智能、四大修炼技术（量子息法、直觉丹道、归零心诀、上升心经）、潜意识重塑、多维叙事。",
    aEn: "Field Insights (Life Map, Relationship Resonance, Life Oracle, Quantum Life Mirror, Life Resilience Index, Romance Magnetism Index, Daily Fortune Tide), Dream Intelligence, the Four Practices (Quantum Breath, The Intuitive Way, Heart Reset, Ascending Heart), Subconscious Rewriting, and Dimensional Narrative.",
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
      <OpeningAtrium />
      <Nav />
      <FarewellBanner />
      <main className="relative overflow-hidden">
        {/* 1. 入口：意识显化系统 */}
        <LingxiPortal />
      <PracticeLadder />

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
              <p className="font-display text-sm uppercase tracking-widest2 text-lattice"><Bi zh="重 塑 潜 意 识" en="Rewrite the Subconscious" /></p>
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
                    <span className="font-display text-4xl text-lattice">{gate.glyph}</span>
                    <h3 className="mt-1 font-display text-2xl text-bone"><Bi zh={gate.title} en={gate.titleEn} /></h3>
                    <p className="mt-3 text-sm leading-6 text-bone-dim"><Bi zh={gate.line} en={gate.lineEn} /></p>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mx-auto mt-16 max-w-2xl">
              <FaqSection items={GATES_FAQ} />
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
            <p className="font-display text-sm uppercase tracking-widest2 text-lattice"><Bi zh="显化 · 能量交换" en="Manifestation · Energy Exchange" /></p>
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
