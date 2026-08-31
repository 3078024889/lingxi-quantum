"use client";

import { useEffect, useMemo, useState } from "react";
import type { StellarTraceResult } from "@/lib/stellar-trace";

type VisualizationMode = "live" | "print";
const stages = ["定时", "落证", "合度", "显域"] as const;
const evidenceColors = ["#d6b978", "#86aaa5", "#a894bb", "#d9d7ce"];

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

  const status = result.priority.statusZh;
  const centerDirection = result.priority.primaryBearing;
  const sectorSpread = Math.max(8, (result.priority.primarySector[1] - result.priority.primarySector[0] + 360) % 360);
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
          <g opacity={phase >= 2 ? 1 : 0} style={{ transition: "opacity .7s ease" }}>{result.evidence.map((item, index) => { const p = polar(item.bearing, 142); const color=evidenceColors[index%evidenceColors.length]; return <g key={item.id} style={{ transition: "opacity .55s ease", transitionDelay: `${index * 180}ms` }}><line x1="180" y1="180" x2={p.x} y2={p.y} stroke={color} strokeWidth={index === 0 ? 2.2 : 1.6} strokeDasharray={index % 2 === 0 ? "3 5" : "8 5"}/><circle cx={p.x} cy={p.y} r="8" fill="none" stroke={color} strokeOpacity=".38"/><circle cx={p.x} cy={p.y} r="4.8" fill="#e6c987" stroke={color} strokeWidth="1.4" filter={`url(#stellar-glow-${mode})`}/><text x={p.x + (p.x >= 180 ? 10 : -10)} y={p.y + (p.y >= 180 ? 15 : -10)} textAnchor={p.x >= 180 ? "start" : "end"} fontSize="11" fill={live ? "#eee8df" : "#4f4959"}>{item.bearing}°</text></g>; })}</g>
          {phase >= 3 && <g><circle cx="180" cy="180" r="57" fill={`url(#stellar-core-${mode})`} stroke="rgba(214,185,120,.26)"/><text x="180" y="172" textAnchor="middle" fontSize="11" letterSpacing="2" fill={live ? "#d6b978" : "#8d7550"}>R</text><text x="180" y="193" textAnchor="middle" fontSize="23" fill={live ? "#f2e5c5" : "#302941"}>{result.direction.resultantLength.toFixed(3)}</text><text x="180" y="212" textAnchor="middle" fontSize="11" fill={live ? "#c7dcd9" : "#557f79"}>{status}</text></g>}
          {phase >= 4 && result.priority.available && <g opacity=".72"><path d={`M 180 180 L ${polar(centerDirection - sectorSpread / 2, 155).x} ${polar(centerDirection - sectorSpread / 2, 155).y} A 155 155 0 0 1 ${polar(centerDirection + sectorSpread / 2, 155).x} ${polar(centerDirection + sectorSpread / 2, 155).y} Z`} fill="rgba(145,121,182,.22)" stroke="rgba(222,201,151,.62)"/><text x="180" y="334" textAnchor="middle" fontSize="10" fill={live ? "#cfc8bd" : "#696473"}>原典候选扇区 · {result.priority.primaryDirectionZh} {result.priority.primaryBearing}°</text></g>}
        </svg>
        <div className={live ? "text-bone" : "text-[#454151]"}><p className={`text-[11px] tracking-[.24em] ${live ? "text-amber" : "text-[#557f79]"}`}>{String(phase).padStart(2, "0")} · {stages[phase - 1]}</p><p className="mt-3 font-display text-2xl">{phase < 2 ? "九域初定" : phase < 3 ? "实验投影入位" : phase < 4 ? `原典合度 · ${status}` : result.priority.available ? `原典候选方位 · ${result.priority.primaryDirectionZh}` : "原典证据尚未成向"}</p><p className={`mt-3 text-xs leading-6 ${live ? "text-bone-dim" : "text-[#696473]"}`}>{phase < 2 ? "九个天体按当前真实黄经落位。" : phase < 3 ? "九域实验投影独立展示，不参与原典主向。" : phase < 4 ? "只有带来源、可复算的真实起局结果才能进入原典圆周合度。" : result.priority.basisZh}</p>{phase >= 4 && <div className={`mt-5 grid gap-2 text-xs ${live ? "text-bone-dim" : "text-[#565162]"}`}><p>原典覆盖 · <strong>{result.ancient.fused.usedSystems.length} / 4</strong></p><p>候选方位 · <strong>{result.priority.available ? `${result.priority.primaryDirectionZh} ${result.priority.primaryBearing}°` : "未成"}</strong></p><p>现实方向核验 · <strong>{result.ancient.realityValidation.noteZh}</strong></p></div>}</div>
      </div>
    </section>
  );
}
