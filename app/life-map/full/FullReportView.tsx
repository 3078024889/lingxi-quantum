"use client";

import { Fragment, useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import Bi from "@/components/Bi";
import PortalSpinner from "@/components/PortalSpinner";
import NatalChartWheel from "../NatalChartWheel";
import { stripMarkdownArtifacts } from "@/lib/text-clean";
import { lifemapTypeImage } from "@/lib/lifemap-type-images";
import ShareButton from "@/components/ShareButton";

type GateActivation = { key: string; zh: string; en: string; gate: number; line: number; longitude: number };
type HumanDesignResult = { personality: GateActivation[]; design: GateActivation[]; sunConsciousGate: number; sunUnconsciousGate: number };

type ChartFacts = {
  sunLongitude: number; moonLongitude: number;
  mercury: { longitude: number }; venus: { longitude: number }; mars: { longitude: number };
  jupiter: { longitude: number }; saturn: { longitude: number };
  wuXingCount: { wood: number; fire: number; earth: number; metal: number; water: number };
  ziwei: {
    palaces: { name: string; earthlyBranch: string; majorStars: { name: string; brightness: string }[]; isSoulPalace: boolean; isBodyPalace: boolean; decadalRange: [number, number] }[];
  } | null;
  daYunStartAge: number | null;
  humanDesign: HumanDesignResult | null;
};

const SECTION_TITLES = [
  { zh: "七大行星逐一解读", en: "The Seven Planets, One by One" },
  { zh: "八字深层结构", en: "The Deep Structure of Your Bazi" },
  { zh: "紫微命盘详解", en: "Your Ziwei Chart, Decoded" },
  { zh: "胎元 · 命宫 · 身宫（四柱体系）", en: "Fetal Origin · Life Palace · Body Palace (Bazi System)" },
  { zh: "玛雅印记详解", en: "Your Maya Sign, Decoded" },
  { zh: "大运走势", en: "Your Major Luck Cycles" },
  { zh: "频率自测解读", en: "Your Frequency Self-Assessment, Interpreted" },
  { zh: "财富与事业频率地图", en: "Your Wealth & Career Map" },
  { zh: "关系共振地图", en: "Your Relationship Resonance Map" },
  { zh: "人生周期导航", en: "Your Life Cycle Navigation" },
  { zh: "专属灵犀场练习", en: "A Personal Lingxi Field Practice" },
  { zh: "前世今生印记", en: "Past & Future Imprint" },
  { zh: "灵犀场守望", en: "Lingxi Field Watch" },
];

export default function FullReportView({ id }: { id: string }) {
  const [langEn, setLangEn] = useState(false);
  useEffect(() => {
    setLangEn(document.documentElement.classList.contains("lang-en"));
  }, []);
  const t = (zh: string, en: string) => (langEn ? en : zh);

  const [status, setStatus] = useState<"checking" | "locked" | "generating" | "ready" | "error">("checking");
  const [sections, setSections] = useState<string[]>([]);
  const [coreTypeName, setCoreTypeName] = useState("");
  const [facts, setFacts] = useState<ChartFacts | null>(null);
  const [freqScores, setFreqScores] = useState<{ energy: number; clarity: number; alignment: number } | null>(null);
  const [numberEnergy, setNumberEnergy] = useState<{ label: string; total: number }[]>([]);
  const [freePreview, setFreePreview] = useState<{ echoText: string; stageName: string; stageDesc: string; keywords: { word: string; desc: string }[] } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const run = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = "/account";
        return;
      }

      const { data: submission } = await supabase
        .from("life_map_submissions")
        .select("core_type_name, facts, birth_input, energy_level, clarity_level, alignment_level, focus, free_narrative")
        .eq("id", id)
        .single();
        
      if (submission?.core_type_name) setCoreTypeName(submission.core_type_name);
      
      let loadedFacts = submission?.facts as ChartFacts | undefined;
      if (loadedFacts) setFacts(loadedFacts);

      if (submission) {
        setFreqScores({
          energy: submission.energy_level ?? 3,
          clarity: submission.clarity_level ?? 3,
          alignment: submission.alignment_level ?? 3,
        });
      }

      if (submission?.focus) {
        const matches: { label: string; total: number }[] = [];
        const phoneMatch = /手机号数字能量：\S+（总和(\d+)/.exec(submission.focus);
        if (phoneMatch) matches.push({ label: "手机号", total: parseInt(phoneMatch[1], 10) });
        const plateMatch = /车牌号数字能量：\S+（总和(\d+)/.exec(submission.focus);
        if (plateMatch) matches.push({ label: "车牌号", total: parseInt(plateMatch[1], 10) });
        setNumberEnergy(matches);
      }

      if (submission?.free_narrative) {
        const cleanedNarrative = stripMarkdownArtifacts(submission.free_narrative as string);
        const parts = cleanedNarrative.split(/\n\s*\n/).map((s: string) => s.trim()).filter(Boolean);
        const echoText = parts[0] || "";
        const normalizeDelims = (s: string) => s.replace(/[｜]/g, "|").replace(/[，、]/g, ",");
        const [stageName, stageDesc] = normalizeDelims(parts[1] || "").split("|").map((s) => s?.trim());
        const keywordParts = normalizeDelims(parts[2] || "").split("|").map((s) => s.trim()).filter(Boolean);
        
        const keywords = keywordParts
          .map((kp) => kp.split(",").map((s) => s?.trim()).filter(Boolean))
          .filter((pair) => pair.length === 2 && pair[0].length <= 8 && !/^【?关键词\s*\d/.test(pair[0]))
          .map(([w, d]) => ({ word: w, desc: d }));
        setFreePreview({ echoText, stageName: stageName || "", stageDesc: stageDesc || "", keywords });
      }

      setStatus("generating");
      try {
        const currentLangEn = document.documentElement.classList.contains("lang-en");
        const res = await fetch("/api/lifemap/generate-full", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, lang: currentLangEn ? "en" : "zh" }),
        });
        const data = await res.json();
        
        if (res.status === 402) {
          setStatus("locked");
          return;
        }
        
        if (!res.ok || (!data.fullReport && !data.report)) {
          setError(data.error || t("生成失败，请刷新重试。", "Generation failed — please refresh and try again."));
          setStatus("error");
          return;
        }
        
        const reportText = data.report || data.fullReport;
        const parts = reportText
          .split(/===\s*\d+\s*===/)
          .map((s: string) => s.trim())
          .filter(Boolean);
          
        setSections(parts);
        setStatus("ready");
      } catch {
        setError(t("连接场域时出错，请刷新重试。", "Error connecting to the field — please refresh and try again."));
        setStatus("error");
      }
    };
    run();
  }, [id]);

  if (status === "checking" || status === "generating") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        <div className="lm-core lm-core-active" />
        <p className="mt-8 font-display text-lg text-lm2-text">
          {status === "checking" ? t("正在确认解锁状态…", "Confirming your unlock…") : t("灵犀场正在为你，逐层展开这份完整命盘…", "Lingxi Field is unfolding your full chart…")}
        </p>
        <p className="mt-2 text-sm text-lm2-text-dim/80">{t("这可能需要一点时间，请不要关闭页面。", "This may take a moment — please don't close this page.")}</p>
        <style>{`.lm-core { width: 90px; height: 90px; border-radius: 999px; background: conic-gradient(from 0deg, #E8869E, #E7B85C, #5FC79B, #5A9FDE, #A47ADC, #E8869E); animation: lm-breathe 1.5s ease-in-out infinite, lm-spin 6s linear infinite; filter: blur(7px) saturate(0.9); opacity: .85; } @keyframes lm-breathe { 0%,100% { transform: scale(1); opacity: .7; } 50% { transform: scale(1.15); opacity: .95; } } @keyframes lm-spin { from { filter: blur(7px) saturate(0.9) hue-rotate(0deg); } to { filter: blur(7px) saturate(0.9) hue-rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (status === "locked") return <div className="py-24 text-center">🔒 尚未解锁</div>;
  if (status === "error") return <div className="py-24 text-center text-rose-300">{error}</div>;

  return (
    <div className="pb-24 px-2 md:px-6 max-w-4xl mx-auto mt-8">
      {/* 恢复右上角顶栏与下载按钮 */}
      <div className="flex items-center justify-between print:hidden mb-6 pl-2">
        <p className="font-display text-sm uppercase tracking-widest2 text-lm2-violet">
          🌌 <Bi zh="完整生命频率图谱" en="Your Full Life Frequency Map" />
        </p>
        <button
          onClick={() => window.print()}
          className="flex shrink-0 items-center gap-2 rounded-sm border border-emerald-400/40 px-6 py-2.5 text-xs font-bold uppercase tracking-widest2 text-emerald-300 transition hover:border-emerald-300 hover:text-bone shadow-lg"
        >
          <Bi zh="下载 / 打印 PDF" en="Download PDF" />
        </button>
      </div>

      <div className="space-y-12">
        {/* ========================================================
            第 1 页：封面图 + 核心原型图 + 星盘图 (Background: page-0.png)
            ======================================================== */}
        <div className="relative w-full aspect-[1/1.414] overflow-hidden rounded-xl shadow-2xl print:shadow-none print:w-full print:h-screen print:rounded-none page-break-after-always">
          <div className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
               style={{ backgroundImage: `url('/images/lifemap/page-0.png'), linear-gradient(135deg, #1e293b, #0f172a)` }} />
          <div className="absolute inset-0 z-10 flex flex-col justify-center items-center p-6 md:p-12">
            <div className="lx-report-glass p-8 md:p-10 w-full max-h-[96%] overflow-y-auto custom-scrollbar shadow-2xl flex flex-col items-center gap-6">
              
              <h1 className="font-display text-3xl md:text-5xl font-bold tracking-widest text-heading text-center" style={{ textShadow: "0 2px 18px rgba(0,0,0,0.55)" }}>
                {coreTypeName}
              </h1>

              {lifemapTypeImage(coreTypeName) && (
                <div className="overflow-hidden rounded-xl border border-[#3A2E52]/20 shadow-2xl" style={{ maxWidth: '280px', width: '100%' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={lifemapTypeImage(coreTypeName)!} alt={coreTypeName} className="block w-full object-cover" />
                </div>
              )}

              {facts && (
                <div className="w-full">
                  <p className="text-center font-display text-sm md:text-base uppercase tracking-widest2 text-[#6D4A9C] mb-2 font-bold">
                    <Bi zh="你的宇宙星盘" en="Your Natal Chart" />
                  </p>
                  <NatalChartWheel
                    sunLongitude={facts.sunLongitude} moonLongitude={facts.moonLongitude}
                    mercury={facts.mercury.longitude} venus={facts.venus.longitude} mars={facts.mars.longitude}
                    jupiter={facts.jupiter.longitude} saturn={facts.saturn.longitude}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================
            第 2 页：当前生命阶段与人类图门位 (Background: page-1.png)
            ======================================================== */}
        {(freePreview || facts?.humanDesign) && (
          <div className="relative w-full aspect-[1/1.414] overflow-hidden rounded-xl shadow-2xl print:shadow-none print:w-full print:h-screen print:rounded-none page-break-after-always">
            <div className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
                 style={{ backgroundImage: `url('/images/lifemap/page-1.png'), linear-gradient(135deg, #1e293b, #0f172a)` }} />
            <div className="absolute inset-0 z-10 flex flex-col justify-center items-center p-6 md:p-12">
              <div className="lx-report-glass p-8 md:p-10 w-full max-h-[96%] overflow-y-auto custom-scrollbar shadow-2xl space-y-8">
                
                {freePreview && (
                  <div className="space-y-6">
                    {freePreview.echoText && (
                      <p className="text-base md:text-lg leading-[2.2] tracking-wider text-[#2E2742] text-justify indent-8">
                        {freePreview.echoText}
                      </p>
                    )}
                    {freePreview.stageName && (
                      <div className="border-t border-[#3A2E52]/10 pt-6">
                        <p className="font-display text-sm uppercase tracking-widest2 text-[#8C7FA8] text-center mb-2">
                          <Bi zh="当前生命阶段" en="Your Current Life Stage" />
                        </p>
                        <h3 className="font-display text-2xl md:text-3xl text-[#3A2E52] font-bold text-center">
                          「{freePreview.stageName}」
                        </h3>
                        <p className="mt-4 text-base md:text-lg leading-[2.2] tracking-wider text-[#2E2742] text-justify indent-8">
                          {freePreview.stageDesc}
                        </p>
                      </div>
                    )}
                    {freePreview.keywords.length > 0 && (
                      <div className="border-t border-[#3A2E52]/10 pt-6">
                        <p className="font-display text-sm uppercase tracking-widest2 text-[#8C7FA8] text-center mb-4">
                          <Bi zh="你的三个场域关键词" en="Your Three Keywords" />
                        </p>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                          {freePreview.keywords.map((k, i) => (
                            <div key={i} className="bg-white/40 rounded-lg p-4 text-center shadow-sm">
                              <p className="font-display text-xl text-[#6D4A9C] font-bold mb-1">✨ {k.word}</p>
                              <p className="text-sm text-[#3A2E52]/80">{k.desc}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {facts?.humanDesign && (
                  <div className="border-t border-[#3A2E52]/10 pt-6">
                    <p className="font-display text-sm uppercase tracking-widest2 text-[#8C7FA8] text-center mb-2">
                      <Bi zh="人类图 · 意识印记" en="Human Design · Gates" />
                    </p>
                    <HumanDesignChart hd={facts.humanDesign} />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            第 3-15 页：正文章节与嵌入式动态图表
            ======================================================== */}
        {sections.map((content, i) => {
          const isSkippedNumberSection = i === 12 && /未提供手机号或车牌号/.test(content);
          if (isSkippedNumberSection) return null;

          const bgNum = (i % 10) + 2; 
          const bgImageUrl = `/images/lifemap/page-${bgNum}.png`;
          const title = SECTION_TITLES[i] ?? { zh: `第${i + 1}章`, en: `Section ${i + 1}` };

          return (
            <div key={i} className="relative w-full aspect-[1/1.414] overflow-hidden rounded-xl shadow-2xl print:shadow-none print:w-full print:h-screen print:rounded-none page-break-after-always">
              <div 
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url('${bgImageUrl}'), linear-gradient(135deg, #1e293b, #0f172a)` }}
              />
              
              <div className="absolute inset-0 z-10 flex flex-col justify-center items-center p-6 md:p-12">
                <div className="lx-report-glass p-8 md:p-10 w-full max-h-[96%] overflow-y-auto custom-scrollbar shadow-2xl flex flex-col">
                  
                  <div className="text-center mb-6 border-b border-[#3A2E52]/10 pb-4">
                    <p className="font-display text-[11px] md:text-sm font-bold uppercase tracking-[0.3em] text-[#8C7FA8] mb-2">
                      LIFE MAP · {String(i + 1).padStart(2, "0")} / {String(sections.length).padStart(2, "0")}
                    </p>
                    <h3 className="font-display text-2xl md:text-3xl font-bold tracking-widest text-[#3A2E52]">
                      <Bi zh={title.zh} en={title.en} />
                    </h3>
                  </div>
                  
                  {/* 【字号缩小防溢出】：改为 text-base md:text-lg */}
                  <div className="prose prose-invert max-w-none text-base md:text-lg leading-[2.2] tracking-wide text-[#2E2742] flex-1">
                    {stripMarkdownArtifacts(content).split('\n').map((para, pIdx) => (
                      para.trim() === '' ? null :
                      (para.startsWith('【') && para.endsWith('】')) ? (
                        <h2 key={pIdx} className="text-xl md:text-2xl text-[#6D4A9C] font-bold mt-6 mb-4 text-center">
                          {para}
                        </h2>
                      ) : (
                        <p key={pIdx} className="mb-4 text-justify indent-8">
                          {para}
                        </p>
                      )
                    ))}
                  </div>

                  <div className="mt-6 w-full">
                    {i === 1 && facts && <WuXingChart wx={facts.wuXingCount} />}
                    {i === 2 && facts?.ziwei && <ZiweiGrid palaces={facts.ziwei.palaces} />}
                    {i === 5 && facts && <DaYunTimeline startAge={facts.daYunStartAge} />}
                    {i === 6 && freqScores && <FrequencyChart scores={freqScores} />}
                    {i === 12 && numberEnergy.length > 0 && <NumberEnergyChart items={numberEnergy} />}
                  </div>

                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-12 text-center print:hidden">
        <ShareButton
          text={t("我做了一份灵犀生命图谱，去看看你自己的：", "I got my Lingxi Field Life Map — check out your own:")}
          url="https://lingxifield.com/life-map"
          label={{ zh: "分享这份报告", en: "Share this reading" }}
        />
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// 高级图表组件 (文字全部改为深色 #3A2E52 以适配浅色极光玻璃)
// -----------------------------------------------------------------------------

function NumberEnergyChart({ items }: { items: { label: string; total: number }[] }) {
  const colors = ["#E7A13C", "#3FA89C"];
  return (
    <div className="mt-5 grid grid-cols-2 gap-4 bg-white/40 p-6 rounded-xl border border-[#3A2E52]/10 shadow-sm">
      {items.map((it, idx) => {
        const norm = ((it.total - 1) % 30) + 1;
        const pct = (norm / 30) * 100;
        const color = colors[idx % colors.length];
        const r = 30, c = 2 * Math.PI * r;
        return (
          <div key={it.label} className="flex flex-col items-center">
            <svg viewBox="0 0 72 72" className="w-20 md:w-24">
              <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="6" />
              <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" strokeDasharray={`${c}`} strokeDashoffset={`${c * (1 - pct / 100)}`} transform="rotate(-90 36 36)" />
              <text x="36" y="41" textAnchor="middle" fontSize="17" fill="#3A2E52" fontFamily="serif" fontWeight="bold">{it.total}</text>
            </svg>
            <p className="mt-2 text-center text-sm md:text-base text-[#3A2E52] font-bold">{it.label}</p>
          </div>
        );
      })}
    </div>
  );
}

function HumanDesignChart({ hd }: { hd: HumanDesignResult }) {
  const cx = 130, cy = 130, r = 96;
  const glyphs: Record<string, string> = { sun: "☉", earth: "⊕", moon: "☽", mercury: "☿", venus: "♀", mars: "♂", jupiter: "♃", saturn: "♄", uranus: "♅", neptune: "♆", pluto: "♇" };
  const colors = ["#E7A13C", "#3FA89C", "#9A7BD9", "#D968A9"];
  return (
    <div className="mt-4 flex flex-col items-center gap-6 bg-white/40 p-6 rounded-xl border border-[#3A2E52]/10 shadow-sm sm:flex-row sm:items-center justify-center">
      <svg viewBox="0 0 260 260" className="w-48 md:w-56 shrink-0">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
        <circle cx={cx} cy={cy} r={r - 20} fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="1" />
        {hd.personality.map((g, i) => {
          const rad = ((g.longitude - 90) * Math.PI) / 180;
          const x = cx + r * Math.cos(rad);
          const y = cy + r * Math.sin(rad);
          const color = colors[i % colors.length];
          return (
            <g key={g.key}>
              <line x1={cx} y1={cy} x2={x} y2={y} stroke={color} strokeOpacity="0.6" strokeWidth="1" />
              <circle cx={x} cy={y} r="10" fill="rgba(255,255,255,0.9)" stroke={color} strokeWidth="1.5" />
              <text x={x} y={y + 4} textAnchor="middle" fontSize="10" fill={color}>{glyphs[g.key] || "•"}</text>
            </g>
          );
        })}
        <circle cx={cx} cy={cy} r="34" fill="rgba(240,200,104,0.2)" stroke="#E7A13C" strokeWidth="1" />
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize="13" fill="#3A2E52" fontFamily="serif" fontWeight="bold">{hd.sunConsciousGate}</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize="8" fill="#8C7FA8" fontWeight="bold">门 {hd.sunUnconsciousGate}</text>
      </svg>
      <div className="grid flex-1 grid-cols-2 gap-x-4 gap-y-2 text-sm md:text-base text-[#3A2E52] font-medium">
        {hd.personality.map((g) => (
          <span key={g.key}>{g.zh} — 门 {g.gate}.{g.line}</span>
        ))}
      </div>
    </div>
  );
}

function WuXingChart({ wx }: { wx: { wood: number; fire: number; earth: number; metal: number; water: number } }) {
  const items = [
    { label: "木", v: wx.wood, color: "#3FA89C" },
    { label: "火", v: wx.fire, color: "#D968A9" },
    { label: "土", v: wx.earth, color: "#E7A13C" },
    { label: "金", v: wx.metal, color: "#9A7BD9" },
    { label: "水", v: wx.water, color: "#4B9ED9" },
  ];
  const max = Math.max(1, ...items.map((i) => i.v));
  const RADAR_SIZE = 140, CENTER = 70, MAX_R = 54;
  const radarPoints = items.map((it, i) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / items.length;
    const r = (Math.max(0.15, it.v / max)) * MAX_R;
    return { x: CENTER + r * Math.cos(angle), y: CENTER + r * Math.sin(angle), labelX: CENTER + (MAX_R + 16) * Math.cos(angle), labelY: CENTER + (MAX_R + 16) * Math.sin(angle) };
  });
  const radarPath = radarPoints.map((p) => `${p.x},${p.y}`).join(" ");
  const gridRings = [0.33, 0.66, 1].map((frac) =>
    items.map((_, i) => {
      const angle = -Math.PI / 2 + (i * 2 * Math.PI) / items.length;
      return `${CENTER + frac * MAX_R * Math.cos(angle)},${CENTER + frac * MAX_R * Math.sin(angle)}`;
    }).join(" ")
  );
  return (
    <div className="mt-4 bg-white/40 p-6 rounded-xl border border-[#3A2E52]/10 shadow-sm">
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
        <svg viewBox={`0 0 ${RADAR_SIZE} ${RADAR_SIZE}`} className="h-36 w-36 shrink-0">
          {gridRings.map((pts, i) => (
            <polygon key={i} points={pts} fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
          ))}
          <polygon points={radarPath} fill="rgba(199,156,255,0.4)" stroke="#6D4A9C" strokeWidth="1.5" />
          {radarPoints.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="2.6" fill={items[i].color} />
          ))}
          {radarPoints.map((p, i) => (
            <text key={i} x={p.labelX} y={p.labelY} textAnchor="middle" dominantBaseline="middle" fontSize="10" fill="#3A2E52" fontWeight="bold">
              {items[i].label}
            </text>
          ))}
        </svg>
        <div className="w-full flex-1 space-y-3">
        {items.map((it) => (
          <div key={it.label} className="flex items-center gap-3">
            <span className="w-8 shrink-0 font-display text-sm md:text-base text-[#3A2E52] font-bold">{it.label}</span>
            <div className="h-3 md:h-4 flex-1 overflow-hidden rounded-full bg-[#3A2E52]/10">
              <div className="h-full rounded-full" style={{ width: `${Math.max(6, (it.v / max) * 100)}%`, background: it.color }} />
            </div>
            <span className="w-4 shrink-0 text-right text-sm md:text-base text-[#3A2E52] font-bold">{it.v}</span>
          </div>
        ))}
        </div>
      </div>
    </div>
  );
}

function FrequencyChart({ scores }: { scores: { energy: number; clarity: number; alignment: number } }) {
  const items = [
    { label: "能量水平", v: scores.energy, color: "#D968A9" },
    { label: "头脑清晰", v: scores.clarity, color: "#4B9ED9" },
    { label: "内外对齐", v: scores.alignment, color: "#E7A13C" },
  ];
  return (
    <div className="mt-4 grid grid-cols-3 gap-4 bg-white/40 p-6 rounded-xl border border-[#3A2E52]/10 shadow-sm">
      {items.map((it, idx) => {
        const pct = (it.v / 5) * 100;
        const r = 26, c = 2 * Math.PI * r;
        return (
          <div key={it.label} className="flex flex-col items-center">
            <svg viewBox="0 0 64 64" className="w-16 md:w-20">
              <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="6" />
              <circle cx="32" cy="32" r={r} fill="none" stroke={it.color} strokeWidth="6" strokeLinecap="round" strokeDasharray={`${c}`} strokeDashoffset={`${c * (1 - pct / 100)}`} transform="rotate(-90 32 32)" />
              <text x="32" y="37" textAnchor="middle" fontSize="16" fill="#3A2E52" fontFamily="serif" fontWeight="bold">{it.v}</text>
            </svg>
            <p className="mt-2 text-center text-xs md:text-sm text-[#3A2E52] font-bold">{it.label}</p>
          </div>
        );
      })}
    </div>
  );
}

const ZIWEI_GRID_BRANCHES = [["巳", "午", "未", "申"], ["辰", null, null, "酉"], ["卯", null, null, "戌"], ["寅", "丑", "子", "亥"]];
function ZiweiGrid({ palaces }: { palaces: any[] }) {
  const byBranch = new Map(palaces.map((p) => [p.earthlyBranch, p]));
  const auroraColors = ["#D968A9", "#E7A13C", "#3FA89C", "#4B9ED9", "#9A7BD9"];
  return (
    <div className="mt-4 bg-white/40 p-5 md:p-6 rounded-xl border border-[#3A2E52]/10 shadow-sm">
      <div className="mt-2 grid grid-cols-4 gap-1.5 md:gap-2">
        {ZIWEI_GRID_BRANCHES.flat().map((branch, i) => {
          if (branch === null) {
            if (i === 5) return (
              <div key="center" className="col-span-2 row-span-2 flex flex-col items-center justify-center rounded-lg border border-[#6D4A9C]/20 bg-[#6D4A9C]/10 shadow-inner">
                <span className="font-display text-2xl md:text-3xl text-[#6D4A9C] font-bold">紫微</span>
              </div>
            );
            return null;
          }
          const p = byBranch.get(branch);
          const color = auroraColors[i % auroraColors.length];
          return (
            <div key={branch} className="flex min-h-[85px] md:min-h-[100px] flex-col justify-between rounded-lg border p-2 bg-white/60 shadow-sm" style={{ borderColor: p?.isSoulPalace || p?.isBodyPalace ? color : "rgba(0,0,0,0.05)" }}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] md:text-xs text-[#8C7FA8] font-bold">{branch}</span>
                {(p?.isSoulPalace || p?.isBodyPalace) && <span className="text-[9px] md:text-[10px] font-bold px-1 rounded-sm text-white" style={{ backgroundColor: color }}>{p?.isSoulPalace ? "命" : ""}{p?.isBodyPalace ? "身" : ""}</span>}
              </div>
              <p className="text-xs md:text-base font-bold text-[#3A2E52] text-center">{p?.name ?? ""}</p>
              <p className="text-[9px] md:text-[11px] leading-tight text-[#3A2E52]/70 text-center">{p?.majorStars.map((s:any) => s.name).join("·") || "—"}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DaYunTimeline({ startAge }: { startAge: number | null }) {
  const start = startAge ?? 8;
  const periods = Array.from({ length: 5 }).map((_, i) => start + i * 10);
  const auroraColors = ["#D968A9", "#E7A13C", "#3FA89C", "#4B9ED9", "#9A7BD9"];
  return (
    <div className="mt-4 bg-white/40 p-6 md:p-8 rounded-xl border border-[#3A2E52]/10 shadow-sm">
      <div className="relative mt-4 pb-2 px-2 md:px-4">
        <div className="absolute left-2 right-2 top-3 md:top-4 h-1 bg-[#3A2E52]/20 rounded-full" />
        <div className="flex justify-between relative z-10">
          {periods.map((age, i) => (
            <div key={age} className="flex flex-col items-center">
              <span className="h-6 w-6 md:h-8 md:w-8 rounded-full border-2 md:border-4 border-white shadow-md" style={{ background: auroraColors[i % auroraColors.length] }} />
              <span className="mt-3 font-display text-sm md:text-base font-bold text-[#3A2E52]">{age}<Bi zh="岁" en="" /></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
