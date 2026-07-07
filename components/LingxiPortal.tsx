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
      {/* 活的场：场域光点 + 漂移星层 + 缓转轨道环 */}
      <div className="absolute inset-0 -z-10">
        <img
          src="/images/hero-lightbody.jpg"
          alt=""
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 h-[104%] w-auto min-w-[104%] -translate-x-1/2 -translate-y-1/2 object-cover opacity-95"
          style={{ objectPosition: "50% 30%" }}
        />
        {/* 经络流光：同图叠加，滤镜提亮，移动遮罩让光沿脉络流动 */}
        <img
          src="/images/hero-lightbody.jpg"
          alt=""
          aria-hidden="true"
          className="lx-veins absolute left-1/2 top-1/2 h-[104%] w-auto min-w-[104%] -translate-x-1/2 -translate-y-1/2 object-cover"
          style={{ objectPosition: "50% 30%" }}
        />
        <img
          src="/images/hero-lightbody.jpg"
          alt=""
          aria-hidden="true"
          className="lx-veins lx-veins-2 absolute left-1/2 top-1/2 h-[104%] w-auto min-w-[104%] -translate-x-1/2 -translate-y-1/2 object-cover"
          style={{ objectPosition: "50% 30%" }}
        />
        {/* 两层漂移闪烁的星 */}
        <div className="lx-stars lx-stars-a absolute inset-[-20%]" />
        <div className="lx-stars lx-stars-b absolute inset-[-20%]" />
        {/* 缓转金色轨道环 */}
        <div className="lx-orbit absolute left-1/2 top-1/2 h-[130vmin] w-[130vmin] -translate-x-1/2 -translate-y-1/2 rounded-full" />
        <div className="lx-orbit lx-orbit-2 absolute left-1/2 top-1/2 h-[92vmin] w-[92vmin] -translate-x-1/2 -translate-y-1/2 rounded-full" />
        <div className="absolute inset-0 bg-gradient-to-b from-void/25 via-void/10 to-void/85" />
        <div className="lx-glow absolute left-1/2 top-1/2 h-[46vh] w-[46vh] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber/10 blur-[120px]" />
      </div>

      <p className="font-display text-sm uppercase tracking-widest2 text-lattice sm:text-base" style={{ textShadow: "0 0 24px rgba(124,224,211,0.55)" }}>
        灵 犀 · LINGXI
      </p>

      <h1 className="mt-6 font-display text-5xl font-light text-bone sm:text-7xl" style={{ textShadow: "0 0 60px rgba(255,255,255,0.35), 0 0 120px rgba(232,183,101,0.25)" }}>
        <Bi zh="意识显化系统" en="A Consciousness System" />
      </h1>

      <p className="mx-auto mt-7 max-w-2xl font-body text-base leading-9 text-bone sm:text-lg">
        <Bi zh="灵犀，陪你显化目标、解读梦境、修炼意识的引导系统。" en="Lingxi — a guided system that helps you manifest goals, read your dreams, and practice consciousness." />
      </p>

      <div className="mt-14 grid w-full max-w-4xl gap-5 sm:grid-cols-3">
        {CAPS.map((c) => (
          <Link key={c.key} href={c.href} className="group rounded-sm border border-white/15 bg-void-deep/55 p-7 text-center backdrop-blur-sm transition hover:border-lattice/60 hover:bg-lattice/10">
            <span className="font-display text-3xl text-lattice transition group-hover:text-amber">{c.glyph}</span>
            <h3 className="mt-3 font-display text-2xl text-bone"><Bi zh={c.zh} en={c.en} /></h3>
            <p className="mt-3 text-sm leading-6 text-bone-dim"><Bi zh={c.descZh} en={c.descEn} /></p>
          </Link>
        ))}
      </div>

      <Link href="/account" className="mt-14 inline-block bg-lattice px-12 py-4 font-display text-sm uppercase tracking-widest2 text-void-deep shadow-[0_0_40px_rgba(124,224,211,0.4)] transition hover:bg-amber">
        <Bi zh="进入场域" en="Enter" />
      </Link>

      <a href="#origin" className="mt-10 font-display text-xs uppercase tracking-widest2 text-bone-dim transition hover:text-lattice">
        <Bi zh="灵犀是什么 · 来自何处 ↓" en="What is Lingxi · where it comes from ↓" />
      </a>

      <style>{`
        .lx-veins {
          mix-blend-mode: screen;
          filter: brightness(1.9) saturate(1.5) contrast(1.15);
          -webkit-mask-image: linear-gradient(115deg, transparent 30%, rgba(0,0,0,.95) 48%, rgba(0,0,0,.95) 52%, transparent 70%);
          mask-image: linear-gradient(115deg, transparent 30%, rgba(0,0,0,.95) 48%, rgba(0,0,0,.95) 52%, transparent 70%);
          -webkit-mask-size: 320% 320%; mask-size: 320% 320%;
          animation: lx-vein-flow 9s linear infinite;
          opacity: .85;
        }
        .lx-veins-2 {
          -webkit-mask-image: linear-gradient(245deg, transparent 34%, rgba(0,0,0,.8) 50%, transparent 66%);
          mask-image: linear-gradient(245deg, transparent 34%, rgba(0,0,0,.8) 50%, transparent 66%);
          animation-duration: 14s; animation-delay: -5s; opacity: .6;
          filter: brightness(2.1) saturate(1.6) hue-rotate(-8deg);
        }
        @keyframes lx-vein-flow {
          from { -webkit-mask-position: 120% 120%; mask-position: 120% 120%; }
          to   { -webkit-mask-position: -20% -20%; mask-position: -20% -20%; }
        }
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
        @media (prefers-reduced-motion: reduce) { .lx-veins,.lx-stars,.lx-orbit,.lx-glow { animation: none !important; opacity: 0; } .lx-stars,.lx-orbit,.lx-glow { opacity: 1; } }
      `}</style>
    </section>
  );
}
