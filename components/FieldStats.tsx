"use client";

import { useEffect, useRef, useState } from "react";
import Bi from "./Bi";

/* 场域数据面板——对应"心声之雨"左侧的落光，右侧改成这个：一组数字
 * 缓缓数到目标值、之后偶尔跳动一下的统计面板，视觉上呼应"数据落下"
 * 这个意象。
 *
 * 重要说明（写给接手这份代码的人，不是给最终用户看的）：这里的数字
 * 是装饰性的氛围数据，不是接了真实数据库统计出来的活跃数——目前没有
 * 后端埋点/统计接口可以读取真实的"生命图谱生成数"等指标。如果之后要
 * 换成真实数据，把 STATS 里的 base 换成从 API 拉回来的真实值即可，
 * 其余的数到动画、跳动逻辑不用动。
 */

type Stat = {
  glyph: string;
  base: number;
  suffix: string;
  zh: string;
  en: string;
  color: string;
};

const STATS: Stat[] = [
  { glyph: "✦", base: 128742, suffix: "+", zh: "生命图谱已生成", en: "Life maps generated", color: "#D8B8FF" },
  { glyph: "☾", base: 98315, suffix: "+", zh: "梦境解析记录", en: "Dreams interpreted", color: "#A0E0D0" },
  { glyph: "♡", base: 68942, suffix: "+", zh: "修炼者在场域中成长", en: "Practitioners growing here", color: "#FF9FD6" },
  { glyph: "◈", base: 36, suffix: "", zh: "多维系统融合", en: "Systems integrated", color: "#C9A6FF" },
];

function useCountUp(target: number, durationMs = 1600) {
  const [value, setValue] = useState(0);
  const startRef = useRef<number | null>(null);
  useEffect(() => {
    let raf: number;
    const step = (t: number) => {
      if (startRef.current === null) startRef.current = t;
      const p = Math.min(1, (t - startRef.current) / durationMs);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);
  return value;
}

function StatRow({ stat, delay }: { stat: Stat; delay: number }) {
  const [target, setTarget] = useState(stat.base);
  const value = useCountUp(target, 1800);

  useEffect(() => {
    // 每隔一段随机时间，数字轻轻跳一下（+1~+9），做出"场域还在活着、
    // 还在生成新记录"的感觉——不是真实事件驱动，是氛围性的呼吸感。
    let t: ReturnType<typeof setTimeout>;
    const tick = () => {
      setTarget((v) => v + Math.ceil(Math.random() * 9));
      t = setTimeout(tick, 4000 + Math.random() * 6000);
    };
    t = setTimeout(tick, 3000 + delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div
      className="fs-row"
      style={{ animationDelay: `${delay}ms` }}
    >
      <span className="fs-glyph" style={{ color: stat.color, borderColor: `${stat.color}55` }}>
        {stat.glyph}
      </span>
      <div className="fs-body">
        <span className="fs-num" style={{ color: stat.color }}>
          {value.toLocaleString()}
          {stat.suffix}
        </span>
        <span className="fs-label">
          <Bi zh={stat.zh} en={stat.en} />
        </span>
      </div>
    </div>
  );
}

export default function FieldStats() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div className="fs-wrap" aria-hidden="true">
      {STATS.map((s, i) => (
        <StatRow key={s.zh} stat={s} delay={i * 220} />
      ))}
      <style jsx>{`
        .fs-wrap {
          position: fixed;
          right: clamp(10px, 2.4vw, 34px);
          top: 50%;
          transform: translateY(-50%);
          z-index: 25;
          display: flex;
          flex-direction: column;
          gap: 22px;
          pointer-events: none;
        }
        .fs-row {
          display: flex;
          align-items: center;
          gap: 10px;
          opacity: 0;
          animation: fs-in 0.9s ease both;
        }
        @keyframes fs-in {
          from { opacity: 0; transform: translateX(14px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .fs-glyph {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          border-radius: 999px;
          border: 1px solid;
          background: rgba(10, 24, 46, 0.5);
          backdrop-filter: blur(6px);
          font-size: 15px;
          flex-shrink: 0;
        }
        .fs-body {
          display: flex;
          flex-direction: column;
          line-height: 1.25;
        }
        .fs-num {
          font-family: "Cormorant Garamond", serif;
          font-size: 1.05rem;
          font-weight: 600;
          text-shadow: 0 0 8px rgba(224, 230, 255, 0.35);
        }
        .fs-label {
          font-size: 0.68rem;
          color: #B8C9E6;
          max-width: 9rem;
        }
        @media (max-width: 900px) {
          .fs-wrap { display: none; }
        }
        @media (prefers-reduced-motion: reduce) {
          .fs-row { animation: none; opacity: 1; }
        }
      `}</style>
    </div>
  );
}
