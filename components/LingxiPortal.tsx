import Link from "next/link";
import Bi from "./Bi";

// 六大探索领域——每个领域下面挂了具体的子项目清单，跟场域精测下拉
// 菜单里真实存在的7个产品、探索梦境的3个子功能等等一一对应，不是
// 只写六个笼统的标题。
type SubItem = { zh: string; en: string; descZh?: string; descEn?: string; href?: string };
type Cap = {
  key: string; glyph: string; zh: string; en: string;
  descZh: string; descEn: string; href: string;
  subLabelZh?: string; subLabelEn?: string; subs?: SubItem[];
};

const CAPS: Cap[] = [
  {
    key: "manifest", glyph: "🌌", zh: "意识显化", en: "Conscious Manifestation",
    descZh: "探索意识、信念与现实创造之间的连接。", descEn: "Discover the connection between consciousness, intention, and the reality you create.",
    href: "/live-as",
  },
  {
    key: "insights", glyph: "🧬", zh: "场域精测", en: "Field Insights",
    descZh: "通过多维象征系统，探索隐藏在生命中的结构与可能。", descEn: "Explore the hidden patterns and possibilities within your life through multidimensional symbolic systems.",
    href: "/life-map",
    subLabelZh: "包含：", subLabelEn: "Includes:",
    subs: [
      { zh: "生命图谱", en: "Life Blueprint", descZh: "探索你携带而来的生命结构。", descEn: "Explore the life structure you were born carrying.", href: "/life-map" },
      { zh: "灵犀生命灵签", en: "Lingxi Life Oracle", descZh: "唤醒属于你的生命象征。", descEn: "Awaken the life symbols that belong to you.", href: "/qian" },
      { zh: "灵犀量子生命镜像", en: "Lingxi Quantum Life Mirror", descZh: "通过象征镜像，探索此刻意识正在呈现的主题。", descEn: "Explore the theme your consciousness is presenting right now, through symbolic mirrors.", href: "/tarot" },
      { zh: "关系共振", en: "Relationship Resonance", descZh: "探索人与人之间的连接与镜像。", descEn: "Explore the connection and mirroring between two people.", href: "/relationship" },
      { zh: "生命韧性指数", en: "Life Resilience Index", descZh: "探索面对变化时的内在力量。", descEn: "Explore your inner strength in the face of change.", href: "/resilience" },
      { zh: "桃花磁场", en: "Love Resonance", descZh: "探索情感连接中的模式与能量。", descEn: "Explore the patterns and energy within emotional connection.", href: "/romance" },
      { zh: "今日运势潮汐", en: "Daily Fortune Tide", descZh: "感知当下生命节律。", descEn: "Sense the rhythm of life right now.", href: "/daily" },
    ],
  },
  {
    key: "dream", glyph: "🌙", zh: "梦境智能", en: "Dream Intelligence",
    descZh: "梦境并非随机出现的画面，而可能是潜意识与你交流的语言。", descEn: "Dreams are not merely random images, but a language through which your subconscious communicates.",
    href: "/dream",
    subLabelZh: "探索：", subLabelEn: "Explore:",
    subs: [
      { zh: "梦境记录", en: "Dream Journal" },
      { zh: "梦境解析", en: "Dream Interpretation" },
      { zh: "梦境符号", en: "Dream Symbols" },
    ],
  },
  {
    key: "practice", glyph: "🔥", zh: "远古修炼技术", en: "Ancient Wisdom Practice",
    descZh: "连接呼吸、身体与意识，回归内在稳定与觉察。", descEn: "Reconnect with breath, body, and awareness, returning to inner balance and presence.",
    href: "/practice",
    subLabelZh: "包含：", subLabelEn: "Includes:",
    subs: [
      { zh: "量子息法", en: "Quantum Breath" },
      { zh: "上升心经", en: "Ascension Heart" },
      { zh: "直觉智能", en: "Intuition Intelligence" },
      { zh: "归零心诀", en: "Zero Point Practice" },
    ],
  },
  {
    key: "gates", glyph: "🪞", zh: "潜意识重塑", en: "Subconscious Rewrite",
    descZh: "看见深层运行的生命模式，重新书写属于你的内在程序。", descEn: "Recognize the hidden patterns within, and rewrite the subconscious structures shaping your experience.",
    href: "/#gates",
    subLabelZh: "探索：", subLabelEn: "Explore:",
    subs: [
      { zh: "出身模式", en: "Origin Pattern" },
      { zh: "关系模式", en: "Relationship Pattern" },
      { zh: "财富模式", en: "Wealth Pattern" },
      { zh: "健康模式", en: "Health Pattern" },
      { zh: "心灵模式", en: "Inner Pattern" },
      { zh: "一致性模式", en: "Coherence Pattern" },
    ],
  },
  {
    key: "narrative", glyph: "∞", zh: "多维叙事", en: "Dimensional Narrative",
    descZh: "每个人都是自己生命故事的创造者。", descEn: "Every person is the creator of their own life story.",
    href: "/narrative",
    subLabelZh: "探索：", subLabelEn: "Explore:",
    subs: [
      { zh: "宇宙文学", en: "Cosmic Stories" },
      { zh: "未来文明", en: "Future Civilization" },
      { zh: "意识故事", en: "Conscious Narratives" },
      { zh: "无限创造", en: "Infinite Creation" },
    ],
  },
];

const EXPLORE_LIST: { zh: string; en: string }[] = [
  { zh: "你的生命结构，", en: "your life structure," },
  { zh: "潜意识中的隐藏模式，", en: "the hidden patterns within your subconscious," },
  { zh: "梦境传递的信息，", en: "the messages within your dreams," },
  { zh: "意识创造现实的力量，", en: "the power of consciousness to shape reality," },
  { zh: "以及正在展开的未来可能。", en: "and the possibilities unfolding ahead." },
];

export default function LingxiPortal() {
  return (
    <section className="relative flex flex-col items-center overflow-hidden px-6 py-24 text-center">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20" />
      </div>

      {/* 所有文字区块都套了不透明的深色卡片背景——之前直接飘在极光
          视频背景上，字看不清，这次统一加框。 */}
      <div className="w-full max-w-3xl rounded-sm border border-white/10 bg-void-deep px-6 py-10 sm:px-10 sm:py-14">
        <div className="lx-core-glyph mb-2 font-display text-2xl text-lattice" style={{ textShadow: "0 0 8px rgba(224,230,255,0.45)" }}>✦</div>
        <p className="font-display text-sm uppercase tracking-widest2 text-lattice sm:text-base">
          <Bi zh="你已进入" en="You Have Entered" />
        </p>
        <h1 className="lx-hero-title mt-6 font-display text-3xl font-light tracking-[0.14em] sm:text-5xl">
          <Bi zh="灵犀场 · 意识数字显化场域" en="Lingxi Field · A Living Digital Manifestation Field" />
        </h1>
        <p className="lx-rule mt-3 font-display text-xs uppercase tracking-widest2 text-lattice sm:text-sm">
          <span>LINGXI FIELD · A LIVING DIGITAL MANIFESTATION FIELD</span>
        </p>

        <p className="mx-auto mt-8 max-w-xl font-display text-lg leading-relaxed text-lattice sm:text-xl">
          <Bi zh="每个人的生命，都隐藏着一套等待被探索的内在结构。" en="Every life carries a hidden structure waiting to be discovered." />
        </p>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-9 text-bone-dim">
          <Bi
            zh="灵犀场是一处探索意识与生命可能性的个人空间。融合生命图谱、场域精测、梦境智能、潜意识重塑、东方智慧修炼与多维叙事，连接你内在的觉察、创造力与无限可能。"
            en="Lingxi Field is a personal space for exploring consciousness and the possibilities of life. Integrating life mapping, field insights, dream intelligence, subconscious transformation, ancient wisdom practices, and dimensional narratives, it connects you with deeper awareness, creativity, and infinite possibilities."
          />
        </p>

        <div className="mx-auto mt-8 max-w-md text-left">
          <p className="font-display text-sm uppercase tracking-widest2 text-amber">
            <Bi zh="在这里，你可以探索：" en="Here, You Can Explore:" />
          </p>
          <ul className="mt-3 space-y-1.5 text-base leading-8 text-bone-dim">
            {EXPLORE_LIST.map((item, i) => (
              <li key={i}><Bi zh={item.zh} en={item.en} /></li>
            ))}
          </ul>
        </div>

        <p className="mx-auto mt-8 max-w-xl text-base leading-9 text-lattice">
          <Bi
            zh="灵犀场不替你定义答案。它创造一个空间，让你重新看见自己，连接内在智慧，创造属于你的生命旅程。"
            en="Lingxi Field does not define your answers. It creates a space for you to rediscover yourself, connect with your inner wisdom, and create your own journey."
          />
        </p>
      </div>

      <div className="lx-core-glyph mt-10 font-display text-xl text-lattice" style={{ textShadow: "0 0 8px rgba(224,230,255,0.45)" }}>◇</div>

      <div className="mt-6 text-center">
        <p className="font-display text-sm uppercase tracking-widest2 text-amber">
          <Bi zh="在这里，你可以探索：" en="Explore Your Inner Universe" />
        </p>
      </div>

      <div className="mt-8 grid w-full max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {CAPS.map((c) => (
          <div key={c.key} className="flex flex-col rounded-sm border border-white/10 bg-void-deep p-7 text-left">
            <Link href={c.href} className="group text-center transition hover:opacity-80">
              <span className="font-display text-3xl transition group-hover:scale-110">{c.glyph}</span>
              <h3 className="mt-3 font-display text-xl text-bone"><Bi zh={c.zh} en={c.en} /></h3>
            </Link>
            <p className="mt-3 text-center text-sm leading-7 text-bone-dim"><Bi zh={c.descZh} en={c.descEn} /></p>

            {c.subs && c.subs.length > 0 && (
              <div className="mt-5 border-t border-white/10 pt-4">
                <p className="text-xs uppercase tracking-widest2 text-lattice">
                  <Bi zh={c.subLabelZh ?? "包含："} en={c.subLabelEn ?? "Includes:"} />
                </p>
                <ul className="mt-3 space-y-2.5">
                  {c.subs.map((s, i) => (
                    <li key={i}>
                      {s.href ? (
                        <Link href={s.href} className="block transition hover:text-lattice">
                          <span className="text-sm text-bone"><Bi zh={s.zh} en={s.en} /></span>
                          {s.descZh && <span className="mt-0.5 block text-xs leading-5 text-bone-dim"><Bi zh={s.descZh} en={s.descEn ?? ""} /></span>}
                        </Link>
                      ) : (
                        <span className="text-sm text-bone-dim"><Bi zh={s.zh} en={s.en} /></span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="lx-glass mt-14 w-full max-w-xl px-8 py-10">
        <p className="font-display text-lg text-lattice sm:text-xl">
          <Bi zh="你的探索，从这里开始。" en="Your journey begins here." />
        </p>
        <Link href="/account" className="lx-portal-btn mt-8 inline-block px-12 py-4 font-display text-sm uppercase tracking-widest2">
          <Bi zh="进入灵犀场" en="Enter The Field" />
        </Link>
      </div>

      <a href="#origin" className="lx-glass mt-10 !rounded-full px-5 py-2 font-display text-xs uppercase tracking-widest2 text-bone-dim transition hover:text-lattice">
        <Bi zh="灵犀场是什么 · 来自何处 ↓" en="What is Lingxi Field · where it comes from ↓" />
      </a>

      <style>{`
        .lx-core-glyph { animation: lx-tw 3.5s ease-in-out infinite; }
        @keyframes lx-tw { 0%,100% { opacity: 1; } 50% { opacity: .55; } }
        @media (prefers-reduced-motion: reduce) { .lx-core-glyph { animation: none !important; opacity: 1; } }
      `}</style>
    </section>
  );
}
