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
import { ConsoleCard, ConsolePanel, ConsoleSectionTitle, ConsoleStatus, FieldConsole } from "@/components/FieldConsole";

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
      <FieldConsole eyebrow="修炼技术 · INNER PRACTICE" eyebrowEn="INNER PRACTICE" title="修炼技术，让更好的自己成为日常" titleEn="Let a clearer self become your daily life" description="把古老觉知与现代节律结合，形成可实践、可感受、可持续的内在修炼路径。" descriptionEn="Bring ancient awareness into a contemporary rhythm through practical, felt and sustainable inner work." heroImage="/images/practice/quantum-pause-chart.jpg" features={[{zh:"科学节律",en:"Measured rhythm",glyph:"◌"},{zh:"每日可练",en:"Daily practice",glyph:"ϟ"},{zh:"真实记录",en:"Real journal",glyph:"▥"},{zh:"回到自己",en:"Return within",glyph:"♡"}]} aside={<><ConsoleStatus title="今日练习" titleEn="Today's practice" tone="cyan"><p className="mt-3"><Bi zh="从最简单的一次呼吸开始。系统不会伪造连续天数；完成记录后，你的真实轨迹才会在个人场域中累积。" en="Begin with one simple breath. No streak is invented; your trajectory grows only from completed records in your private field." /></p><Link href="/practice/breath" className="mt-4 inline-flex text-xs text-lattice"><Bi zh="开始量子息法 →" en="Begin Quantum Breath →" /></Link></ConsoleStatus><ConsoleStatus glyph="✦" title="修炼次序" titleEn="Practice sequence"><ul><li><Bi zh="设定当下意图" en="Set the present intention" /></li><li><Bi zh="进入身体与呼吸" en="Enter body and breath" /></li><li><Bi zh="观察而不评判" en="Observe without judgment" /></li><li><Bi zh="记录真实感受" en="Record what was felt" /></li><li><Bi zh="把清晰带回行动" en="Carry clarity into action" /></li></ul></ConsoleStatus></>}>
        <ConsolePanel>
          <div className="grid items-center gap-6 md:grid-cols-[180px_1fr]"><div className="mx-auto"><GateOrigin className="h-[150px] w-[150px]" /></div><div><p className="text-xs uppercase tracking-[.18em] text-lattice"><Bi zh="四道修炼 · 一座内在场域" en="FOUR PATHS · ONE INNER FIELD" /></p><h2 className="mt-3 text-2xl font-semibold text-bone"><Bi zh="心为门户，万法由心而启" en="The heart is the gateway" /></h2><div className="mt-4 space-y-3 text-sm leading-7 text-bone-dim">
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
            <p className="font-display text-lg leading-8 text-lattice">
              <Bi
                zh="呼吸，是回归觉知的入口。"
                en="Breath is the entrance through which awareness returns."
              />
            </p>
            <p>
              <Bi
                zh="当呼吸逐渐深入，意识开始从外在纷扰中回收，重新触及内在的清明与稳定。当心的门户开启，万千方法皆成为认识自身的路径。"
                en="As the breath deepens, consciousness withdraws from outer disturbance and touches again the clarity and steadiness within. When the gateway of the heart opens, ten thousand methods all become ways of knowing yourself."
              />
            </p>
            <p>
              <Bi
                zh="那些原本存在于生命深处的能力，会随着意识的展开逐渐显现。你不是获得了某种新的力量，而是在一次次回归之中，重新忆起自身本有的完整。"
                en="The capacities that were always present in the depths of your life emerge gradually as consciousness unfolds. You are not acquiring some new power — with each return, you are remembering the wholeness that was yours to begin with."
              />
            </p>
          </div></div></div>
        </ConsolePanel>
        <ConsoleSectionTitle zh="四道修炼" en="Four practices" />
        <div className="lx-console-card-grid">
          <ConsoleCard href="/practice/breath" image="/images/breath-rhythm.jpeg" title="量子息法" titleEn="Quantum Breath" description={practices[0].line} descriptionEn={practices[0].lineEn} />
          <ConsoleCard href="/practice/ascending-heart" image="/images/hero-lightbody.jpg" title="上升心经" titleEn="Ascending Heart" description={practices[3].line} descriptionEn={practices[3].lineEn} />
          <ConsoleCard href="/practice/intuition" image="/images/narratives/our-sovereign-infinite-self-1.jpg" title="直觉丹道" titleEn="Intuitive Way" description={practices[1].line} descriptionEn={practices[1].lineEn} />
          <ConsoleCard href="/practice/heart-reset" image="/images/narratives/role-of-the-heart-1.jpg" title="归零心诀" titleEn="Heart Reset" description={practices[2].line} descriptionEn={practices[2].lineEn} />
        </div>
        <ConsoleSectionTitle zh="修炼记录" en="Practice journal" />
        <PracticeJournal />
        <div className="mt-9"><FaqSection items={PRACTICE_FAQ} /></div>
      </FieldConsole>
      <Footer />
    </>
  );
}
