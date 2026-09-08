import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Bi from "@/components/Bi";
import FaqSection, { type BilingualFaqItem } from "@/components/FaqSection";
import { ConsoleCard, ConsolePanel, ConsoleSectionTitle, ConsoleStatus, FieldConsole } from "@/components/FieldConsole";

const LEARN_FAQ: BilingualFaqItem[] = [
  {
    qZh: "灵犀场的学习中心包含什么内容？", qEn: "What does Lingxi Field's Learn center cover?",
    aZh: "显化方法与心态、解梦与梦境象征、意识与灵性成长这几大主题的原创中英双语内容，还包含一份核心术语表，是理解显化、解梦与修炼这几项功能背后逻辑的入门材料。",
    aEn: "Original bilingual content across manifestation methods and mindset, dream interpretation and dream symbols, and consciousness and spiritual growth — plus a core glossary of terms. It's introductory material for understanding the logic behind the manifestation, dream interpretation, and practice features.",
  },
];



export const metadata = {
  title: "探索 · 显化 / 解梦 / 灵性体系全指南",
  description:
    "灵犀场的原创内容中心：显化方法与心态、解梦与梦境象征、意识与灵性成长。中英双语，含核心术语表。Manifestation, dreams, and spiritual growth — bilingual guides.",
  alternates: { canonical: "/learn" },
};

type Item = { href: string; zh: string; en: string };
type Group = { zh: string; en: string; items: Item[] };

const groups: Group[] = [
  {
    zh: "显化", en: "Manifestation",
    items: [
      { href: "/learn/manifestation", zh: "什么是显化，以及如何真正显化", en: "What manifestation is, and how to do it" },
      { href: "/learn/manifestation-methods", zh: "显化方法大全：369法、观想、写下与睡前显化", en: "Manifestation methods: 369, visualization, scripting" },
      { href: "/learn/manifestation-not-working", zh: "显化没效果？原因与修正", en: "Manifestation not working? Why and how to fix it" },
      { href: "/learn/manifestation-signs", zh: "显化正在生效的 7 个征兆", en: "7 signs your manifestation is working" },
      { href: "/learn/manifestation-journal", zh: "显化日记怎么写", en: "How to keep a manifestation journal" },
      { href: "/learn/manifest-money", zh: "如何显化金钱与财富", en: "How to manifest money and abundance" },
      { href: "/learn/manifest-love", zh: "如何显化爱情与理想伴侣", en: "How to manifest love and an ideal partner" },
      { href: "/learn/method-369", zh: "369 显化法怎么做", en: "The 369 method: steps & how it works" },
      { href: "/learn/affirmations", zh: "肯定语怎么用才有效", en: "How to use affirmations effectively" },
      { href: "/learn/manifest-person", zh: "如何显化一个人或一段关系", en: "How to manifest a person or relationship" },
      { href: "/learn/moon-manifestation", zh: "新月显化与满月释放", en: "New moon manifesting & full moon releasing" },
      { href: "/learn/law-of-attraction-vs", zh: "显化和吸引力法则的区别", en: "Manifestation vs. the law of attraction" },
      { href: "/learn/subconscious-power", zh: "潜意识的力量：墨菲的方法", en: "The power of the subconscious: Murphy's method" },
    ],
  },
  {
    zh: "解梦", en: "Dreams",
    items: [
      { href: "/learn/dream", zh: "如何解梦：读懂潜意识写给你的信", en: "How to interpret dreams" },
      { href: "/learn/dream-symbols", zh: "常见梦境象征大全", en: "A guide to common dream symbols" },
      { href: "/learn/more-dream-meanings", zh: "更多常见梦境含义：怀孕、水、火、掉头发…", en: "More common dream meanings" },
      { href: "/learn/recurring-dreams", zh: "为什么反复做同一个梦", en: "Why you keep having the same dream" },
      { href: "/learn/dream-same-person", zh: "总是梦见同一个人，是他在想我吗", en: "Dreaming of the same person" },
      { href: "/learn/lucid-dreaming", zh: "清醒梦怎么做：入门指南", en: "How to lucid dream" },
      { href: "/learn/remember-dreams", zh: "为什么记不住梦，怎么改善", en: "Why you can't remember dreams" },
      { href: "/learn/sleep-paralysis", zh: "鬼压床（睡眠瘫痪）是什么", en: "What is sleep paralysis" },
      { href: "/learn/dreams-premonition", zh: "梦是预兆吗？梦能预知未来吗", en: "Are dreams premonitions?" },
    ],
  },
  {
    zh: "灵性与修炼", en: "Spirit & Practice",
    items: [
      { href: "/learn/inner-sovereignty", zh: "主权与完整：灵犀场修炼体系的思路", en: "Sovereignty & Wholeness: The Thinking Behind the Practices" },
      { href: "/learn/higher-self", zh: "什么是高我？如何与高我连接", en: "What is the higher self, and how to connect" },
      { href: "/learn/how-to-meditate", zh: "如何冥想：新手入门指南", en: "How to meditate: a beginner's guide" },
      { href: "/learn/raise-frequency", zh: "如何提升意识频率", en: "How to raise your frequency" },
      { href: "/learn/chakras", zh: "七脉轮入门：含义与平衡", en: "The seven chakras" },
      { href: "/learn/synchronicity", zh: "共时性是什么？有意义的巧合", en: "What is synchronicity" },
      { href: "/learn/awakening", zh: "什么是灵性觉醒？", en: "What is spiritual awakening" },
      { href: "/learn/twin-flame", zh: "双生火焰与灵魂伴侣的区别", en: "Twin flames & soulmates" },
      { href: "/learn/inner-friction", zh: "精神内耗怎么停下来", en: "End inner friction" },
      { href: "/learn/what-is-consciousness", zh: "什么是意识", en: "What is consciousness" },
      { href: "/learn/letting-go", zh: "放不下一个人怎么办", en: "When you can't let someone go" },
      { href: "/learn/angel-numbers", zh: "总是看到 11:11？重复数字的含义", en: "Seeing 11:11? Repeating numbers" },
      { href: "/learn/emptiness", zh: "总觉得人生没有意义，怎么办", en: "When life feels meaningless" },
      { href: "/learn/energy-drain", zh: "和某些人相处特别累，是怎么回事", en: "Why some people leave you drained" },
      { href: "/glossary", zh: "术语表 · 核心词汇", en: "Glossary · core terms" },
    ],
  },
];

export default function LearnHub() {
  return (
    <>
      <Nav />
      <FieldConsole eyebrow="探索 · ORIGINAL KNOWLEDGE" eyebrowEn="EXPLORE · ORIGINAL KNOWLEDGE" title="探索，发现更多可能" titleEn="Explore more ways of seeing" description="发现原创文章、实践指南、梦境语言与场域叙事，让理解成为下一次创造的起点。" descriptionEn="Discover original essays, practical guides, dream language and field narratives that can become the beginning of your next creation." heroArtwork="platform-explore" features={[{zh:"原创内容",en:"Original writing",glyph:"♧"},{zh:"真实方法",en:"Practical guides",glyph:"▣"},{zh:"中英双语",en:"Bilingual",glyph:"◇"},{zh:"持续生长",en:"Living archive",glyph:"◌"}]} aside={<><ConsoleStatus title="从这里开始" titleEn="Start here" tone="cyan"><p className="mt-3"><Bi zh="第一次进入灵犀场，建议先读“什么是意识”“如何真正显化”和“主权与完整”，再根据当下问题进入专题。" en="If this is your first visit, begin with consciousness, manifestation, and sovereignty, then enter a subject from the question that matters now." /></p></ConsoleStatus><ConsoleStatus glyph="✦" title="内容边界" titleEn="Editorial boundary"><p className="mt-3"><Bi zh="探索内容用于理解与自我观察，不替代医疗、心理、法律或财务专业意见。梦境与象征没有唯一解释。" en="Explore content supports understanding and reflection; it does not replace medical, psychological, legal or financial advice. Dreams and symbols have no single interpretation." /></p></ConsoleStatus></>}>
        <ConsolePanel><p className="text-xs font-semibold uppercase tracking-[.18em] text-lattice"><Bi zh="知识星图" en="KNOWLEDGE CONSTELLATION" /></p><h2 className="mt-3 text-2xl font-semibold text-bone"><Bi zh="从一个真实问题，进入一条完整路径" en="Enter a complete path through one honest question" /></h2><p className="mt-3 text-sm leading-7 text-bone-dim"><Bi zh="这里不以虚构热度排列内容。三个知识域保留全部原有文章，并以问题、方法与深度关系重新组织。" en="Nothing here is ranked by invented popularity. All original articles remain, reorganized through question, method and depth across three knowledge domains." /></p></ConsolePanel>
        <ConsoleSectionTitle zh="精选入口" en="Featured entrances" />
        <div className="lx-console-card-grid"><ConsoleCard href="/learn/what-is-consciousness" artwork="platform-subconscious" title="什么是意识" titleEn="What is consciousness" description="从经验、觉察与主体性理解意识。" descriptionEn="Approach consciousness through experience, awareness and subjectivity."/><ConsoleCard href="/learn/manifestation" artwork="platform-manifestation" title="如何真正显化" titleEn="How manifestation works" description="把愿景转化为状态、选择与现实行动。" descriptionEn="Translate vision into state, choice and real action."/><ConsoleCard href="/learn/dream" artwork="platform-knowledge" title="读懂梦境语言" titleEn="Read the language of dreams" description="把梦作为个人经验的隐喻，而非固定预言。" descriptionEn="Meet dreams as personal metaphor rather than fixed prophecy."/><ConsoleCard href="/learn/inner-sovereignty" artwork="platform-practice" title="主权与完整" titleEn="Sovereignty and wholeness" description="建立不依附外部权威的内在坐标。" descriptionEn="Build an inner coordinate not dependent on external authority."/></div>

        <ConsoleSectionTitle zh="全部原创内容" en="Complete original archive" />
        <div className="grid gap-4 xl:grid-cols-3">
          {groups.map((g) => (
            <section key={g.en} className="lx-console-panel">
              <h2 className="text-lg font-semibold text-bone"><Bi zh={g.zh} en={g.en} /></h2>
              <p className="mt-1 text-[10px] uppercase tracking-[.16em] text-lattice">{g.en}</p>
              <div className="mt-4 divide-y divide-white/10">
                {g.items.map((it) => (
                  <Link key={it.href} href={it.href} className="flex items-baseline justify-between gap-4 py-3 transition hover:text-lattice">
                    <span className="text-sm leading-6 text-bone"><Bi zh={it.zh} en={it.en} /></span>
                    <span className="shrink-0 text-lattice">→</span>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
        <div className="mt-9">
          <FaqSection items={LEARN_FAQ} />
        </div>
      </FieldConsole>
      <Footer />
    </>
  );
}
