import Link from "next/link";
import Bi from "./Bi";

const CAPS = [
  { key: "manifest", glyph: "显", zh: "意识显化", en: "Manifestation", descZh: "把意图变成现实，每日对齐", descEn: "Turn intention into reality, aligned daily", href: "/live-as" },
  { key: "dream", glyph: "梦", zh: "探索梦境", en: "Dreams", descZh: "读懂梦境给你的讯息", descEn: "Decode the messages in your dreams", href: "/dream" },
  { key: "practice", glyph: "炼", zh: "修炼", en: "Practice", descZh: "量子呼吸等意识练习", descEn: "Quantum breathing & consciousness practices", href: "/practice" },
];

export default function LingxiPortal() {
  return (
    <section className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-6 py-24 text-center">
      {/* 活的场：Shader彩虹云海从这里透出来，只保留装饰性的星层与轨道环 */}
      <div className="absolute inset-0 -z-10">
        {/* 两层漂移闪烁的星 */}
        <div className="lx-stars lx-stars-a absolute inset-[-20%]" />
        <div className="lx-stars lx-stars-b absolute inset-[-20%]" />
        {/* 缓转金色轨道环 */}
        <div className="lx-orbit absolute left-1/2 top-1/2 h-[130vmin] w-[130vmin] -translate-x-1/2 -translate-y-1/2 rounded-full" />
        <div className="lx-orbit lx-orbit-2 absolute left-1/2 top-1/2 h-[92vmin] w-[92vmin] -translate-x-1/2 -translate-y-1/2 rounded-full" />
        {/* 轻薄的顶部/底部渐暗，只为了让文字在任何位置都保持可读，不遮住Shader色彩 */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20" />
        <div className="lx-glow absolute left-1/2 top-1/2 h-[50vh] w-[50vh] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/25 blur-[120px]" />
      </div>

      {/* 中央发光核心符号 */}
      <div className="lx-core-glyph mb-2 font-display text-2xl text-lattice" style={{ textShadow: "0 0 8px rgba(224,230,255,0.45)" }}>✦</div>

      <p className="font-display text-sm uppercase tracking-widest2 text-lattice sm:text-base" style={{ textShadow: "0 0 8px rgba(224,230,255,0.45)" }}>
        灵 犀 场 · LINGXI FIELD
      </p>

      <h1 className="mt-6 font-display text-5xl font-light text-bone sm:text-7xl" style={{ textShadow: "0 0 20px rgba(216,184,255,0.35)" }}>
        <Bi zh="意识显化系统" en="A Consciousness System" />
      </h1>

      <p className="mx-auto mt-7 max-w-2xl font-body text-base leading-9 text-bone-dim sm:text-lg" >
        <Bi zh="灵犀不创造你的欲望，只提供一面镜子——显化你的意图，解读你的梦境，练习你身体本来就会的呼吸与觉察。" en="Lingxi doesn't manufacture what you should want. It offers a mirror — to manifest your intent, decode your dreams, and practice the breath and awareness your body already knows." />
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
        .lx-stars { background-repeat: repeat; pointer-events: none; }
        .lx-stars-a {
          background-image: radial-gradient(1.6px 1.6px at 22px 34px, rgba(242,226,196,.9), transparent 55%),
            radial-gradient(1.2px 1.2px at 120px 80px, rgba(124,224,211,.8), transparent 55%),
            radial-gradient(1px 1px at 210px 150px, rgba(255,255,255,.7), transparent 55%),
            radial-gradient(1.4px 1.4px at 300px 60px, rgba(232,183,101,.85), transparent 55%),
            radial-gradient(1px 1px at 80px 200px, rgba(201,165,216,.7), transparent 55%);
          background-size: 340px 260px;
          animation: lx-star-drift-a 90s linear infinite, lx-tw 5.5s ease-in-out infinite;
        }
        .lx-stars-b {
          background-image: radial-gradient(1px 1px at 60px 40px, rgba(255,255,255,.55), transparent 55%),
            radial-gradient(1.3px 1.3px at 170px 130px, rgba(232,183,101,.6), transparent 55%),
            radial-gradient(1px 1px at 260px 210px, rgba(124,224,211,.55), transparent 55%);
          background-size: 420px 320px;
          animation: lx-star-drift-b 140s linear infinite, lx-tw 7s ease-in-out infinite reverse;
          opacity:.8;
        }
        @keyframes lx-star-drift-a { from { transform: translate(0,0); } to { transform: translate(-340px, 260px); } }
        @keyframes lx-star-drift-b { from { transform: translate(0,0); } to { transform: translate(420px, 320px); } }
        @keyframes lx-tw { 0%,100% { opacity: 1; } 50% { opacity: .55; } }
        .lx-orbit { border: 1px solid rgba(232,183,101,.14); box-shadow: 0 0 60px rgba(232,183,101,.05) inset; animation: lx-spin 120s linear infinite; }
        .lx-orbit::before { content:""; position:absolute; top:-3px; left:50%; width:6px; height:6px; border-radius:50%; background:rgba(232,183,101,.9); box-shadow:0 0 12px 3px rgba(232,183,101,.5); }
        .lx-orbit-2 { border-color: rgba(124,224,211,.12); animation: lx-spin 80s linear infinite reverse; }
        .lx-orbit-2::before { background: rgba(124,224,211,.9); box-shadow:0 0 12px 3px rgba(124,224,211,.5); }
        @keyframes lx-spin { from { transform: translate(-50%,-50%) rotate(0deg); } to { transform: translate(-50%,-50%) rotate(360deg); } }
        .lx-glow { animation: lx-tw 9s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .lx-stars,.lx-orbit,.lx-glow,.lx-core-glyph { animation: none !important; opacity: 1; } }
      `}</style>
    </section>
  );
}
