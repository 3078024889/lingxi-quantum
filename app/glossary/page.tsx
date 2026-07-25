import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Bi from "@/components/Bi";
import FaqSection, { type BilingualFaqItem } from "@/components/FaqSection";

const GLOSSARY_FAQ: BilingualFaqItem[] = [
  {
    qZh: "为什么灵犀场要用「场域」「共振」这类词，不直接说人话？", qEn: "Why does Lingxi Field use words like 'the Field' or 'resonance' instead of plain language?",
    aZh: "这些词是场域用来描述内在体验的一套语言，本身也都有清楚、具体的定义（就在这一页），不是故弄玄虚——熟悉之后，会发现它们其实比日常用语更精确地描述了「注意力」「状态」这类难以言说的体验。",
    aEn: "These are the field's own vocabulary for describing inner experience, each with a clear, specific definition (right here on this page) — not vagueness for its own sake. Once familiar, they often describe experiences like attention or inner state more precisely than everyday language does.",
  },
];



export const metadata = {
  title: "术语表 · 灵犀场核心词汇 | Glossary | Lingxi Field",
  description:
    "灵犀场术语表：场域、共振、临在、校准、相干、忆起、主权、完整等核心概念的清晰定义，是理解显化、解梦与修炼的底层语言。Glossary of Lingxi Field's core terms — the language behind manifestation, dream interpretation, and practice.",
  alternates: { canonical: "/glossary" },
};

// 之前这页只有中文定义，完全没有对应的英文翻译，也没有用Bi组件——
// 不是"只是没切换"，是英文版本本来就不存在。这次给每个词条补上了
// defEn，全部改用Bi组件，页面才是真正意义上支持双语的。
const terms: { zh: string; en: string; def: string; defEn: string }[] = [
  {
    zh: "场域", en: "The Field",
    def: "意识与环境之间，持续互相回应的那片背景——它不是固定的容器，而是随你的注意力与状态，不断成形的活动关系。",
    defEn: "The backdrop between consciousness and environment, continuously responding to each other — not a fixed container, but a living relationship that keeps taking shape with your attention and state.",
  },
  {
    zh: "共振", en: "Resonance",
    def: "两种状态、两个频率之间的相认，不是被制造出来的，是被遇见的。你认出的，往往是自己此刻的频率。",
    defEn: "The mutual recognition between two states, two frequencies — not manufactured, but encountered. What you recognize is often your own frequency, reflected back.",
  },
  {
    zh: "临在", en: "Presence",
    def: "把全部注意力，安放在此刻正在发生的事情上，不急着评判，也不急着离开。",
    defEn: "Placing your full attention on what's happening right now, without rushing to judge it or rushing to leave it.",
  },
  {
    zh: "校准", en: "Attunement",
    def: "一次又一次，把偏离的状态，轻轻带回你选定的方向——不是一次性的动作，是持续的、温和的调整。",
    defEn: "Again and again, gently bringing a drifted state back toward the direction you've chosen — not a one-time act, but a continuous, gentle adjustment.",
  },
  {
    zh: "相干", en: "Coherence",
    def: "念头、感受与行动，朝着同一个方向流动的状态。相干不是强迫一致，是三者不再互相拉扯。",
    defEn: "The state where thought, feeling, and action flow in the same direction. Coherence isn't forced agreement — it's the three no longer pulling against each other.",
  },
  {
    zh: "忆起", en: "Remembering",
    def: "认出一件其实早已知道、只是暂时被遮蔽的事，而不是学习一件全新的事。",
    defEn: "Recognizing something you already knew, just temporarily obscured — not learning something entirely new.",
  },
  {
    zh: "主权", en: "Sovereignty",
    def: "为自己的情绪、念头与选择，负起第一责任——不是凌驾于他人之上，而是不再把自己的状态，交给外界随意摆布。",
    defEn: "Taking first responsibility for your own emotions, thoughts, and choices — not standing over others, but no longer handing your own state over to be pushed around by outside forces.",
  },
  {
    zh: "完整", en: "Wholeness",
    def: "把平日分散在不同角色、不同情绪里的自己，重新看作同一条线上的点，而不是几个互相矛盾的人格。",
    defEn: "Seeing the self that's usually scattered across different roles and different emotions as points on the same line, rather than several contradictory personalities.",
  },
  {
    zh: "归零", en: "Reset",
    def: "把积压、散乱的状态，重新带回一种温暖、清晰、有秩序的基准——不是清空情绪，是让情绪重新变得可以被看清。",
    defEn: "Bringing a built-up, scattered state back to a warm, clear, ordered baseline — not emptying out emotion, but making it visible again.",
  },
  {
    zh: "意识显化", en: "Manifestation",
    def: "让意图、注意力与实际行动，三者对齐的过程——把心里认定的样子，一点一点活成眼前的现实。",
    defEn: "The process of aligning intention, attention, and actual action — living, bit by bit, into the reality you've already decided on inside.",
  },
  {
    zh: "灵犀场", en: "Lingxi Field",
    def: "这个场域的名字，取自「心有灵犀」——不需要言语，就能彼此感应的那种默契。",
    defEn: "The name of this field, drawn from the Chinese idiom for two hearts that understand each other without a word — an unspoken rapport.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "DefinedTermSet",
  name: "灵犀场术语表 Lingxi Field Glossary",
  hasDefinedTerm: terms.flatMap((t) => [
    { "@type": "DefinedTerm", name: t.zh, description: t.def, inDefinedTermSet: "https://lingxifield.com/glossary" },
    { "@type": "DefinedTerm", name: t.en, description: t.defEn, inDefinedTermSet: "https://lingxifield.com/glossary" },
  ]),
};

export default function GlossaryPage() {
  return (
    <>
      <Nav />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="px-6 pb-24 pt-28">
        <div className="mx-auto max-w-2xl">
          <div className="bg-void-deep rounded-sm px-8 py-10">
          <p className="font-display text-sm uppercase tracking-widest2 text-amber">
            <Bi zh="术语表" en="Glossary" />
          </p>
          <h1 className="mt-4 font-display text-4xl font-light leading-tight text-bone sm:text-5xl">
            <Bi zh="核心词汇" en="Core Terms" />
          </h1>
          <p className="mt-6 text-lg leading-9 text-bone-dim">
            <Bi
              zh="灵犀场里反复出现的核心概念。这些词条是理解显化、解梦与修炼的底层语言。"
              en="The core concepts that keep resurfacing across Lingxi Field. These terms are the underlying language behind manifestation, dream interpretation, and practice."
            />
          </p>
          </div>

          <dl className="bg-reading-glass mt-12 divide-y divide-[color:var(--aurora-glass-border)] px-8 py-4 sm:px-10">
            {terms.map((t) => (
              <div key={t.en} className="py-6">
                <dt className="flex flex-wrap items-baseline gap-x-3">
                  <span className="font-display text-2xl font-light text-bone"><Bi zh={t.zh} en={t.en} /></span>
                </dt>
                <dd className="mt-3 leading-8 text-bone-dim"><Bi zh={t.def} en={t.defEn} /></dd>
              </div>
            ))}
          </dl>

          <p className="mt-10 text-sm text-bone-dim/85">
            <Bi zh="延伸：" en="Related: " />
            <Link href="/learn/wingmakers" className="text-lattice hover:text-amber"><Bi zh="主权与完整导览" en="Sovereignty & Wholeness guide" /></Link>
            {" · "}
            <Link href="/learn" className="text-lattice hover:text-amber"><Bi zh="探索中心" en="Explore Center" /></Link>
          </p>
          <FaqSection items={GLOSSARY_FAQ} />
        </div>
      </main>
      <Footer />
    </>
  );
}
