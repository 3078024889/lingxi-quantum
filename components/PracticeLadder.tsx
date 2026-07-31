"use client";

import Link from "next/link";
import Bi from "@/components/Bi";

// 四项修炼技术次第条。
//
// 这不是四个并排的商品卡——那样会把它们读成"选一个买"。
// 它们之间有次第：息 → 零 → 觉 → 升，跳过前面直接练后面，
// 练了也接不住（详见 knowledge/inquiry/practices.json）。
// 所以卡片之间有箭头、有编号，读起来是一条路，不是一个货架。
//
// 图标全部是原创手写 SVG，不引第三方图标库：
//   息 —— 三道呼吸波纹，一进一出
//   零 —— 一个不闭合的圆，缺口即是"归零"留下的入口
//   觉 —— 八瓣，从中心向外张开
//   升 —— 同心轨道，一点沿轨上行
// 每个都用 currentColor，颜色由外层控制，深浅主题都能用。

const GLYPHS: Record<string, JSX.Element> = {
  breath: (
    <>
      <path d="M14 26c6-8 12 8 18 0s12-8 18 0" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity=".9" />
      <path d="M18 34c5-6 10 6 14 0s9-6 14 0" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity=".6" />
      <path d="M22 42c4-4 7 4 10 0s6-4 10 0" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity=".4" />
    </>
  ),
  "heart-reset": (
    <>
      {/* 缺口朝上——归零不是封闭，是留一个让新东西进来的口 */}
      <path d="M32 12a20 20 0 1 1-6 1.1" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="32" cy="32" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.2" opacity=".75" />
    </>
  ),
  intuition: (
    <>
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
        <ellipse key={a} cx="32" cy="32" rx="4" ry="15" fill="none" stroke="currentColor" strokeWidth="1.1"
          opacity={a % 90 === 0 ? 0.9 : 0.45} transform={`rotate(${a} 32 32)`} />
      ))}
      <circle cx="32" cy="32" r="3" fill="currentColor" opacity=".85" />
    </>
  ),
  "ascending-heart": (
    <>
      <circle cx="32" cy="32" r="19" fill="none" stroke="currentColor" strokeWidth="1" opacity=".35" />
      <circle cx="32" cy="32" r="12" fill="none" stroke="currentColor" strokeWidth="1.1" opacity=".6" />
      <circle cx="32" cy="32" r="5" fill="none" stroke="currentColor" strokeWidth="1.2" opacity=".9" />
      <circle cx="32" cy="13" r="2.6" fill="currentColor" />
      <path d="M32 24v-8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity=".7" />
    </>
  ),
};

const PRACTICES = [
  { key: "breath", n: "01", glyph: "息", zh: "量子息法", en: "Quantum Breath",
    dZh: "基础，随时可用的入口。不需要相信任何东西，身体先静，折射就减少。",
    dEn: "The foundation, available anytime. It asks you to believe nothing — the body quiets first.",
    color: "text-lattice", href: "/practice/breath" },
  { key: "heart-reset", n: "02", glyph: "零", zh: "归零心诀", en: "Heart Reset",
    dZh: "清迷雾的核心。息法让身体静，归零让心明——明心见性就是这一步。",
    dEn: "The core clearing. Breath quiets the body; the reset clears the heart.",
    color: "text-lattice", href: "/practice/heart-reset" },
  { key: "intuition", n: "03", glyph: "觉", zh: "直觉丹道", en: "The Intuitive Way",
    dZh: "重铸情感历史、接取内在声音。练的不是变得更准，是不再盖住它。",
    dEn: "Recasting emotional history, reaching the inner voice. Not accuracy — ceasing to cover it.",
    color: "text-amber", href: "/practice/intuition" },
  { key: "ascending-heart", n: "04", glyph: "升", zh: "上升心经", en: "Ascending Heart",
    dZh: "两轴交汇点的活化。前三项解决听得见，这一项解决持续走在上面。",
    dEn: "Activating where the two axes meet. The first three let you hear; this one keeps you on it.",
    color: "text-amber", href: "/practice/ascending-heart" },
];

export default function PracticeLadder() {
  return (
    <section className="mx-auto mt-20 max-w-6xl px-6">
      <div className="lx-glass px-6 py-10 sm:px-10">
        <p className="text-center font-display text-xl font-light tracking-[0.2em] text-bone sm:text-2xl">
          <Bi zh="灵犀场四项修炼技术" en="The Four Practices" />
        </p>
        <p className="mt-2 text-center text-xs tracking-[0.28em] text-bone-mute">
          <Bi zh="— 一条由内而外的回归之路 —" en="— A path of return, from within outward —" />
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PRACTICES.map((p, i) => (
            <div key={p.key} className="relative">
              {/* 卡片之间的箭头：只在够宽的屏幕显示，窄屏改为纵向堆叠，
                  箭头会误导方向，所以隐藏 */}
              {i > 0 && (
                <span className="pointer-events-none absolute -left-3 top-1/2 hidden -translate-y-1/2 text-bone-mute lg:block" aria-hidden="true">›</span>
              )}
              <Link
                href={p.href}
                className="lx-practice-card group flex h-full flex-col items-center px-5 py-8 text-center"
              >
                <span className={`lx-breath ${p.color}`}>
                  <svg viewBox="0 0 64 64" className="h-12 w-12">{GLYPHS[p.key]}</svg>
                </span>
                <p className="mt-4 font-display text-2xl font-light tracking-[0.3em] text-bone">{p.glyph}</p>
                <p className="mt-1 font-display text-sm tracking-widest2 text-bone-soft">
                  <Bi zh={p.zh} en={p.en} />
                </p>
                <p className="mt-3 text-xs leading-6 text-bone-mute">
                  <Bi zh={p.dZh} en={p.dEn} />
                </p>
                <span className="mt-5 text-[11px] tracking-[0.3em] text-bone-mute/70">— {p.n} —</span>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
