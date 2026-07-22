import Link from "next/link";
import Bi from "./Bi";

// 六大探索领域——按小仙女给的最终定稿文案重写，取代原来只有3张卡片
// 的版本（意识显化/探索梦境/修炼），这次是完整的六个方向，跟场域
// 精测下拉菜单里的产品呼应起来（场域精测这张卡片链接到生命图谱，
// 因为"场域精测"本身是导航栏的一个下拉分类，不是一个独立页面，
// 生命图谱是这个分类里最旗舰的产品）。
const CAPS = [
  { key: "manifest", glyph: "🌌", zh: "意识显化", en: "Conscious Manifestation", descZh: "探索意图、信念与现实创造之间的连接。", descEn: "Explore the connection between intention, belief, and the creation of reality.", href: "/live-as" },
  { key: "insights", glyph: "🧬", zh: "场域精测", en: "Field Insights", descZh: "通过生命图谱、关系共振、生命灵签、量子塔罗等多维方式，探索你的生命结构。", descEn: "Explore your life structure through life mapping, relationship resonance, life signs, and quantum tarot.", href: "/life-map" },
  { key: "dream", glyph: "🌙", zh: "梦境智能", en: "Dream Intelligence", descZh: "理解潜意识通过梦境传递的信息。", descEn: "Understand what the subconscious communicates through dreams.", href: "/dream" },
  { key: "practice", glyph: "🔥", zh: "远古修炼技术", en: "Ancient Wisdom Practice", descZh: "通过呼吸、觉察与练习，连接内在稳定。", descEn: "Connect with inner stability through breath, awareness, and practice.", href: "/practice" },
  { key: "gates", glyph: "🪞", zh: "潜意识重塑", en: "Subconscious Rewriting", descZh: "看见隐藏模式，重新书写生命路径。", descEn: "See the hidden patterns, and rewrite the path of your life.", href: "/#gates" },
  { key: "narrative", glyph: "∞", zh: "多维叙事", en: "Dimensional Narrative", descZh: "探索不同生命视角，创造属于你的故事。", descEn: "Explore different perspectives on life, and create a story that's your own.", href: "/narrative" },
];

export default function LingxiPortal() {
  return (
    <section className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-6 py-24 text-center">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20" />
      </div>

      <div className="lx-core-glyph mb-2 font-display text-2xl text-lattice" style={{ textShadow: "0 0 8px rgba(224,230,255,0.45)" }}>✦</div>

      <p className="font-display text-sm uppercase tracking-widest2 text-lattice sm:text-base" style={{ textShadow: "0 0 8px rgba(224,230,255,0.45)" }}>
        <Bi zh="你已进入" en="You Have Entered" />
      </p>

      <h1 className="mt-6 font-display text-4xl font-light text-bone sm:text-6xl" style={{ textShadow: "0 0 20px rgba(216,184,255,0.35)" }}>
        <Bi zh="灵犀场 · 意识显化系统" en="Lingxi Field · Consciousness Manifestation System" />
      </h1>
      <p className="mt-2 font-display text-xs uppercase tracking-widest2 text-lattice/70 sm:text-sm">
        LINGXI FIELD · CONSCIOUSNESS MANIFESTATION SYSTEM
      </p>

      <p className="mx-auto mt-7 max-w-2xl font-body text-base leading-9 text-bone-dim sm:text-lg">
        <Bi
          zh="一个探索意识、重塑潜意识、连接生命智慧与创造未来可能性的个人意识空间。"
          en="A personal consciousness space for exploring awareness, reshaping the subconscious, connecting with inner wisdom, and creating new possibilities."
        />
      </p>

      <div className="lx-core-glyph mt-8 font-display text-xl text-lattice" style={{ textShadow: "0 0 8px rgba(224,230,255,0.45)" }}>◇</div>

      <p className="mt-4 font-display text-sm uppercase tracking-widest2 text-amber">
        <Bi zh="在这里，你将开启：" en="Here, Your Exploration Begins" />
      </p>

      <div className="mt-8 grid w-full max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {CAPS.map((c) => (
          <Link key={c.key} href={c.href} className="group rounded-sm bg-void-deep p-7 text-center transition hover:brightness-125">
            <span className="font-display text-3xl transition group-hover:scale-110">{c.glyph}</span>
            <h3 className="mt-3 font-display text-xl text-bone"><Bi zh={c.zh} en={c.en} /></h3>
            <p className="mt-3 text-sm leading-6 text-bone-dim"><Bi zh={c.descZh} en={c.descEn} /></p>
          </Link>
        ))}
      </div>

      <p className="mx-auto mt-14 max-w-xl font-display text-lg leading-relaxed text-lattice sm:text-xl">
        <Bi
          zh="灵犀场，让你看见正在创造人生的自己，充满无限可能的自己——继续向内探索。"
          en="Lingxi Field lets you see the self who is already creating this life — a self full of infinite possibility. Keep exploring inward."
        />
      </p>

      <Link href="/account" className="mt-10 inline-block bg-lm2-aurora px-12 py-4 font-display text-sm uppercase tracking-widest2 text-[#151222] shadow-[0_0_30px_rgba(216,184,255,0.4)] transition hover:brightness-110">
        <Bi zh="进入场域" en="Enter" />
      </Link>

      <a href="#origin" className="bg-void-deep mt-10 rounded-full px-5 py-2 font-display text-xs uppercase tracking-widest2 text-bone-dim transition hover:text-lattice">
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
