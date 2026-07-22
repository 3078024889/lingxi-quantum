import Link from "next/link";
import Bi from "./Bi";

const CAPS = [
  { key: "manifest", glyph: "显", zh: "意识显化", en: "Manifestation", descZh: "把意图变成现实，每日对齐", descEn: "Turn intention into reality, aligned daily", href: "/live-as" },
  { key: "dream", glyph: "梦", zh: "探索梦境", en: "Dreams", descZh: "读懂梦境给你的讯息", descEn: "Decode the messages in your dreams", href: "/dream" },
  { key: "practice", glyph: "炼", zh: "修炼", en: "Practice", descZh: "量子息法等意识练习", descEn: "Quantum breathing & consciousness practices", href: "/practice" },
];

export default function LingxiPortal() {
  return (
    <section className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-6 py-24 text-center">
      {/* 首页不再单独铺一层星空/轨道环背景——去掉之后，全站统一的极光
          视频背景（跟 /tarot、/qian 这些页面看到的是同一支视频，见
          components/AuroraVideoBand.tsx）会自然透出来，首页第一屏
          跟其余页面用的是同一个"场"，不是单独一套视觉。 */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20" />
      </div>

      {/* 中央发光核心符号 */}
      <div className="lx-core-glyph mb-2 font-display text-2xl text-lattice" style={{ textShadow: "0 0 8px rgba(224,230,255,0.45)" }}>✦</div>

      <p className="font-display text-sm uppercase tracking-widest2 text-lattice sm:text-base" style={{ textShadow: "0 0 8px rgba(224,230,255,0.45)" }}>
        <Bi zh="你已进入" en="You are now inside" />
      </p>

      <h1 className="mt-6 font-display text-5xl font-light text-bone sm:text-7xl" style={{ textShadow: "0 0 20px rgba(216,184,255,0.35)" }}>
        <Bi zh="灵犀场" en="Lingxi Field" />
      </h1>

      <p className="mx-auto mt-7 max-w-2xl font-body text-base leading-9 text-bone-dim sm:text-lg" >
        <Bi
          zh="灵犀不创造你的欲望，只提供一面镜子——显化你的意图，解读你的梦境，练习你身体本来就会的呼吸与觉察。往下看，是你可以从这里开始的几个方向。"
          en="Lingxi doesn't manufacture what you should want. It offers a mirror — to manifest your intent, decode your dreams, and practice the breath and awareness your body already knows. Below are a few places you can begin."
        />
      </p>

      <div className="lx-core-glyph mt-2 font-display text-xl text-lattice" style={{ textShadow: "0 0 8px rgba(224,230,255,0.45)" }}>◇</div>

      <div className="mt-10 grid w-full max-w-4xl gap-5 sm:grid-cols-3">
        {CAPS.map((c) => (
          <Link key={c.key} href={c.href} className="group rounded-sm bg-void-deep p-7 text-center transition hover:brightness-125">
            <span className="font-display text-3xl text-lattice transition group-hover:text-amber">{c.glyph}</span>
            <h3 className="mt-3 font-display text-2xl text-bone"><Bi zh={c.zh} en={c.en} /></h3>
            <p className="mt-3 text-sm leading-6 text-bone-dim"><Bi zh={c.descZh} en={c.descEn} /></p>
          </Link>
        ))}
      </div>

      <Link href="/account" className="mt-14 inline-block bg-lm2-aurora px-12 py-4 font-display text-sm uppercase tracking-widest2 text-[#151222] shadow-[0_0_30px_rgba(216,184,255,0.4)] transition hover:brightness-110">
        <Bi zh="进入场域" en="Enter" />
      </Link>

      <a href="#origin" className="bg-void-deep mt-10 rounded-full px-5 py-2 font-display text-xs uppercase tracking-widest2 text-bone-dim transition hover:text-lattice">
        <Bi zh="灵犀是什么 · 来自何处 ↓" en="What is Lingxi · where it comes from ↓" />
      </a>

      <style>{`
        .lx-core-glyph { animation: lx-tw 3.5s ease-in-out infinite; }
        @keyframes lx-tw { 0%,100% { opacity: 1; } 50% { opacity: .55; } }
        @media (prefers-reduced-motion: reduce) { .lx-core-glyph { animation: none !important; opacity: 1; } }
      `}</style>
    </section>
  );
}
