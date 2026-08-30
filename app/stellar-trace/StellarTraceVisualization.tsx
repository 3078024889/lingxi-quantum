"use client";

import { useEffect, useMemo, useState } from "react";
import type { StellarTraceResult } from "@/lib/stellar-trace";

type VisualizationMode = "live" | "print";
const stages = ["定时", "落证", "合度", "显域"] as const;
const evidenceColors = ["#d6b978", "#86aaa5", "#a894bb", "#d9d7ce"];
const levelZh = { divergent: "未收敛", weak: "弱收敛", moderate: "中等收敛", strong: "较强收敛", high: "高度收敛" } as const;

function polar(bearing: number, radius: number, center = 180) {
  const angle = ((bearing - 90) * Math.PI) / 180;
  return { x: center + Math.cos(angle) * radius, y: center + Math.sin(angle) * radius };
}

export default function StellarTraceVisualization({ result, mode }: { result: StellarTraceResult; mode: VisualizationMode }) {
  const [phase, setPhase] = useState(mode === "print" ? 4 : 1);
  const currentFields = result.snapshots.find((snapshot) => snapshot.epoch === "current")?.fields ?? [];
  const reducedMotion = useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, []);

  useEffect(() => {
    if (mode === "print" || reducedMotion) { setPhase(4); return; }
    setPhase(1);
    const timers = [2, 3, 4].map((next, index) => window.setTimeout(() => setPhase(next), 1050 * (index + 1)));
    return () => timers.forEach(window.clearTimeout);
  }, [mode, reducedMotion, result.generatedAt]);

  const status = result.direction.qualified ? levelZh[result.direction.level] : "未收敛";
  const centerDirection = result.direction.diagnosticMean ?? 0;
  const sectorSpread = result.direction.sector ? Math.max(8, (result.direction.sector[1] - result.direction.sector[0] + 360) % 360) : 0;
  const live = mode === "live";

  return (
    <section className={live ? "overflow-hidden border border-white/15 bg-[linear-gradient(145deg,rgba(34,50,91,.88),rgba(31,28,70,.76))] p-5 shadow-[0_24px_80px_rgba(0,0,0,.28)] backdrop-blur-xl sm:p-8" : "mt-5"} data-stellar-visualization={mode} data-phase={phase} aria-label={`星迹四阶段演算，当前为${stages[phase - 1]}`}>
      {live && <><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-[10px] tracking-[.34em] text-lattice">LINGXIFIELD · STELLAR TRACE</p><h2 className="mt-2 font-display text-2xl text-bone sm:text-3xl">灵犀场星迹 · 万里寻踪</h2></div><p className="text-xs tracking-[.22em] text-bone-dim">仪器演算 · 非固定图片</p></div><div className="mt-6 grid grid-cols-4 border-y border-white/10 py-3">{stages.map((stage, index) => <div key={stage} className={`text-center text-[11px] tracking-[.2em] transition-colors duration-500 ${phase === index + 1 ? "text-amber" : phase > index + 1 ? "text-lattice" : "text-white/35"}`}>{String(index + 1).padStart(2, "0")} · {stage}</div>)}</div></>}
      <div className={`grid items-center gap-5 ${live ? "mt-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(240px,.75fr)]" : "sm:grid-cols-[310px_1fr]"}`}>
        <svg viewBox="0 0 360 360" className="mx-auto w-full max-w-[430px]" role="img" aria-label="九域与四层证据圆周汇流图">
          <defs><radialGradient id={`stellar-core-${mode}`}><stop offset="0" stopColor="#fff5cf" stopOpacity=".9"/><stop offset=".28" stopColor="#ccb5ff" stopOpacity=".28"/><stop offset="1" stopColor="#56699d" stopOpacity="0"/></radialGradient><filter id={`stellar-glow-${mode}`}><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
          <circle cx="180" cy="180" r="170" fill={live ? "rgba(7,17,45,.34)" : "rgba(255,255,255,.16)"} stroke={live ? "rgba(222,201,151,.34)" : "rgba(85,127,121,.28)"}/>
          {Array.from({ length: 72 }, (_, index) => index * 5).map((bearing) => { const outer = polar(bearing, 166); const inner = polar(bearing, bearing % 30 === 0 ? 156 : 161); return <line key={`tick-${bearing}`} x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke={bearing % 30 === 0 ? "rgba(214,185,120,.72)" : live ? "rgba(234,219,184,.28)" : "rgba(122,105,80,.28)"} strokeWidth={bearing % 30 === 0 ? 1.4 : .65}/>; })}
          {[42, 68, 94, 120, 146].map((radius) => <circle key={radius} cx="180" cy="180" r={radius} fill="none" stroke={live ? "rgba(203,213,243,.11)" : "rgba(76,73,102,.10)"}/>)}
          {[0, 90, 180, 270].map((bearing) => { const p = polar(bearing, 158); return <g key={bearing}><line x1="180" y1="180" x2={p.x} y2={p.y} stroke={live ? "rgba(222,201,151,.18)" : "rgba(76,73,102,.13)"}/><text x={p.x} y={p.y + (bearing === 0 ? -5 : bearing === 180 ? 13 : 4)} textAnchor="middle" fontSize="10" fill={live ? "#cfc8bd" : "#696473"}>{bearing}°</text></g>; })}
          <g opacity={phase >= 1 ? 1 : 0} style={{ transition: "opacity .8s ease" }}>{currentFields.map((field, index) => { const p = polar(field.longitude, 44 + index * 12.5); return <g key={field.id} style={{ transition: "opacity .5s ease", transitionDelay: `${index * 70}ms` }} filter={`url(#stellar-glow-${mode})`}><circle cx={p.x} cy={p.y} r={index === 0 ? 4.2 : 3} fill={live ? "#ead7a6" : "#88715b"}/><title>{field.nameZh} {field.longitude}°</title></g>; })}</g>
          <g opacity={phase >= 2 ? 1 : 0} style={{ transition: "opacity .7s ease" }}>{result.evidence.map((item, index) => { const p = polar(item.bearing, 142); return <g key={item.id} style={{ transition: "opacity .55s ease", transitionDelay: `${index * 180}ms` }}><line x1="180" y1="180" x2={p.x} y2={p.y} stroke={evidenceColors[index]} strokeWidth={index === 0 ? 2.2 : 1.6} strokeDasharray={index % 2 === 0 ? "3 5" : "8 5"}/><circle cx={p.x} cy={p.y} r="8" fill="none" stroke={evidenceColors[index]} strokeOpacity=".38"/><circle cx={p.x} cy={p.y} r="4.8" fill="#e6c987" stroke={evidenceColors[index]} strokeWidth="1.4" filter={`url(#stellar-glow-${mode})`}/><text x={p.x + (p.x >= 180 ? 10 : -10)} y={p.y + (p.y >= 180 ? 15 : -10)} textAnchor={p.x >= 180 ? "start" : "end"} fontSize="11" fill={live ? "#eee8df" : "#4f4959"}>{item.bearing}°</text></g>; })}</g>
          {phase >= 3 && <g><circle cx="180" cy="180" r="57" fill={`url(#stellar-core-${mode})`} stroke="rgba(214,185,120,.26)"/><text x="180" y="172" textAnchor="middle" fontSize="11" letterSpacing="2" fill={live ? "#d6b978" : "#8d7550"}>R</text><text x="180" y="193" textAnchor="middle" fontSize="23" fill={live ? "#f2e5c5" : "#302941"}>{result.direction.resultantLength.toFixed(3)}</text><text x="180" y="212" textAnchor="middle" fontSize="11" fill={live ? "#c7dcd9" : "#557f79"}>{status}</text></g>}
          {phase >= 4 && result.direction.qualified && result.direction.sector && <g opacity=".72"><path d={`M 180 180 L ${polar(centerDirection - sectorSpread / 2, 155).x} ${polar(centerDirection - sectorSpread / 2, 155).y} A 155 155 0 0 1 ${polar(centerDirection + sectorSpread / 2, 155).x} ${polar(centerDirection + sectorSpread / 2, 155).y} Z`} fill="rgba(145,121,182,.22)" stroke="rgba(222,201,151,.62)"/><text x="180" y="334" textAnchor="middle" fontSize="10" fill={live ? "#cfc8bd" : "#696473"}>仅形成方向扇区 · 距离仍未校准</text></g>}
        </svg>
        <div className={live ? "text-bone" : "text-[#454151]"}><p className={`text-[11px] tracking-[.24em] ${live ? "text-amber" : "text-[#557f79]"}`}>{String(phase).padStart(2, "0")} · {stages[phase - 1]}</p><p className="mt-3 font-display text-2xl">{phase < 2 ? "九域初定" : phase < 3 ? "四证入位" : phase < 4 ? `合度 · ${status}` : result.direction.qualified ? "候选方位已成" : "证据发散，止于证界"}</p><p className={`mt-3 text-xs leading-6 ${live ? "text-bone-dim" : "text-[#696473]"}`}>{phase < 2 ? "九个天体按当前真实黄经落位。" : phase < 3 ? "四层证据逐一进入圆周，不先设答案。" : phase < 4 ? "集中度决定推演继续或止于此层。" : result.direction.qualified ? "四证合度已成立；公里距离及现实坐标仍须等待校准。" : "不输出唯一中心点，不制造候选坐标或伪概率云。"}</p>{phase >= 4 && <div className={`mt-5 grid gap-2 text-xs ${live ? "text-bone-dim" : "text-[#565162]"}`}><p>方位合度 · <strong>{status}</strong></p><p>距离层 · <strong>尚无可校准距离</strong></p><p>候选坐标 · <strong>尚未成域</strong></p></div>}</div>
      </div>
    </section>
  );
}
