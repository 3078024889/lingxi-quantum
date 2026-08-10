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
  { zh: "前世今生印记 · 纯属脑洞", en: "Past & Future Imprint · Just for Fun" },
  { zh: "数字能量解读（手机号 / 车牌号）", en: "Number Energy Reading (Phone & Plate)" },
  { zh: "生命韧性指数", en: "Your Life Resilience Index" },
  { zh: "桃花磁场地图", en: "Your Romance Magnetism Map" },
];

export default function FullReportView({ id }: { id: string }) {
  const [langEn, setLangEn] = useState(false);
  useEffect(() => {
    setLangEn(document.documentElement.classList.contains("lang-en"));
    const observer = new MutationObserver(() => {
      setLangEn(document.documentElement.classList.contains("lang-en"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
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

      if (loadedFacts && !loadedFacts.humanDesign) {
        try {
          const res = await fetch("/api/lifemap/backfill-facts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
          });
          const data = await res.json();
          if (res.ok && data.facts) {
            loadedFacts = data.facts as ChartFacts;
            setFacts(loadedFacts);
          }
        } catch {}
      }

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
          .filter((pair) => {
            if (pair.length !== 2 || pair[0].length > 8) return false;
            if (/^【?关键词\s*\d/.test(pair[0]) || /^说明\s*\d/.test(pair[1])) return false;
            return true;
          })
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
          {status === "checking" ? t("正在确认解锁状态…", "Confirming your unlock…") : t("灵犀场正在为你，逐层展开这份完整命盘…", "Lingxi Field is unfolding your full chart, layer by layer…")}
        </p>
        <p className="mt-2 text-sm text-lm2-text-dim/80">{t("这可能需要一点时间，请不要关闭页面。", "This may take a moment — please don't close this page.")}</p>
        <style>{`.lm-core { width: 90px; height: 90px; border-radius: 999px; background: conic-gradient(from 0deg, #E8869E, #E7B85C, #5FC79B, #5A9FDE, #A47ADC, #E8869E); animation: lm-breathe 1.5s ease-in-out infinite, lm-spin 6s linear infinite; filter: blur(7px) saturate(0.9); opacity: .85; } @keyframes lm-breathe { 0%,100% { transform: scale(1); opacity: .7; } 50% { transform: scale(1.15); opacity: .95; } } @keyframes lm-spin { from { filter: blur(7px) saturate(0.9) hue-rotate(0deg); } to { filter: blur(7px) saturate(0.9) hue-rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (status === "locked") {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <p className="font-display text-2xl text-lm2-text">🔒 <Bi zh="尚未解锁这份报告" en="This report isn't unlocked yet" /></p>
        <p className="mt-4 text-sm leading-7 text-lm2-text-dim">
          <Bi zh="回到生命图谱页面，重新走一次解锁流程。" en="Head back to the Life Map page to complete the unlock." />
        </p>
        <a href="/life-map" className="mt-8 inline-block border border-lm2-violet/40 px-8 py-3 font-display text-sm uppercase tracking-widest2 text-lm2-violet transition hover:border-lm2-violet hover:text-lm2-text">
          <Bi zh="返回生命图谱" en="Back to Life Map" />
        </a>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="mx-auto max-w-md px-6 py-32 text-center text-xl text-rose-300 tracking-wider">
        <p>{error}</p>
      </div>
    );
  }

  // 抛弃容易截断的 html2canvas，使用极简高级的原生打印模式
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="pb-24 px-2 md:px-8">
      {/* 隐藏全局极光背景，舞台交给 A4 比例的绝美画框 */}
      <div className="max-w-4xl mx-auto space-y-12 mt-12">
        
        {/* 顶部标题区 */}
        <div className="text-center space-y-4 mb-8 print:hidden">
          <p className="font-display text-sm uppercase tracking-widest2 text-lm2-violet">
            🌌 <Bi zh="完整生命频率图谱" en="Your Full Life Frequency Map" />
          </p>
          <h1 className="text-3xl md:text-5xl font-light tracking-widest text-heading">
            {coreTypeName || "拓印者生命图谱"}
          </h1>
          <p className="text-base opacity-70 tracking-widest">
            Sovereign Field Life Map Architecture
          </p>
        </div>

        {/* ========================================================
            第 1 页：封面图 + 核心原型图 + 星盘图 (Background: page-0.png)
            ======================================================== */}
        <div className="relative w-full aspect-[1/1.414] overflow-hidden rounded-xl shadow-2xl print:shadow-none print:w-full print:h-screen print:rounded-none page-break-after-always">
          <div className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
               style={{ backgroundImage: `url('/images/lifemap/page-0.png'), linear-gradient(135deg, #1e293b, #0f172a)` }} />
          <div className="absolute inset-0 z-10 flex flex-col justify-center items-center p-6 md:p-16">
            <div className="lx-report-glass p-8 md:p-12 w-full max-h-[95%] overflow-y-auto custom-scrollbar shadow-2xl flex flex-col items-center gap-8">
              
              <h1 className="font-display text-4xl md:text-5xl font-bold tracking-widest text-heading text-center" style={{ textShadow: "0 2px 18px rgba(0,0,0,0.55)" }}>
                {coreTypeName}
              </h1>

              {/* 极其惊艳的人格原型原画 */}
              {lifemapTypeImage(coreTypeName) && (
                <div className="overflow-hidden rounded-xl border border-lm2-text/20 shadow-2xl" style={{ maxWidth: '320px', width: '100%' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={lifemapTypeImage(coreTypeName)!} alt={coreTypeName} className="block w-full object-cover" />
                </div>
              )}

              {/* 专属星盘 */}
              {facts && (
                <div className="w-full">
                  <p className="text-center font-display text-sm md:text-lg uppercase tracking-widest2 text-lm2-violet mb-4">
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
            <div className="absolute inset-0 z-10 flex flex-col justify-center items-center p-6 md:p-16">
              <div className="lx-report-glass p-8 md:p-12 w-full max-h-[95%] overflow-y-auto custom-scrollbar shadow-2xl space-y-10">
                
                {freePreview && (
                  <div className="space-y-6">
                    {freePreview.echoText && (
                      <p className="text-xl md:text-2xl leading-[2.2] tracking-wider text-bone text-justify">
                        {freePreview.echoText}
                      </p>
                    )}
                    {freePreview.stageName && (
                      <div className="border-t border-lm2-text/20 pt-6">
                        <p className="font-display text-sm md:text-base uppercase tracking-widest2 text-lm2-violet">
                          <Bi zh="当前生命阶段" en="Your Current Life Stage" />
                        </p>
                        <h3 className="mt-4 font-display text-3xl md:text-4xl text-bone font-bold text-center">
                          「{freePreview.stageName}」
                        </h3>
                        <p className="mt-4 text-xl md:text-2xl leading-[2.2] tracking-wider text-bone/90 text-justify">
                          {freePreview.stageDesc}
                        </p>
                      </div>
                    )}
                    {freePreview.keywords.length > 0 && (
                      <div className="border-t border-lm2-text/20 pt-6">
                        <p className="font-display text-sm md:text-base uppercase tracking-widest2 text-lm2-violet text-center mb-6">
                          <Bi zh="你的三个场域关键词" en="Your Three Keywords" />
                        </p>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                          {freePreview.keywords.map((k, i) => (
                            <div key={i} className="bg-black/20 rounded-lg p-6 text-center border border-white/10">
                              <p className="font-display text-2xl text-lattice font-bold mb-2">✨ {k.word}</p>
                              <p className="text-sm md:text-base text-bone/80">{k.desc}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {facts?.humanDesign && (
                  <div className="border-t border-lm2-text/20 pt-6">
                    <p className="font-display text-sm md:text-base uppercase tracking-widest2 text-lm2-violet text-center mb-4">
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
            第 3-15 页：13 个正文章节与嵌入式动态图表
            ======================================================== */}
        {sections.map((content, i) => {
          const isSkippedNumberSection = i === 12 && /未提供手机号或车牌号/.test(content);
          if (isSkippedNumberSection) return null;

          // 循环使用 11 张内页图 (page-2 到 page-11，因为 page-0是封面，page-1是数据页)
          const bgNum = (i % 10) + 2; 
          const bgImageUrl = `/images/lifemap/page-${bgNum}.png`;

          return (
            <div key={i} className="relative w-full aspect-[1/1.414] overflow-hidden rounded-xl shadow-2xl print:shadow-none print:w-full print:h-screen print:rounded-none page-break-after-always">
              {/* 高清 PDF 底图层 */}
              <div 
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url('${bgImageUrl}'), linear-gradient(135deg, #1e293b, #0f172a)` }}
              />
              
              {/* 核心玻璃面板与文字排版层 */}
              <div className="absolute inset-0 z-10 flex flex-col justify-center items-center p-6 md:p-16">
                <div className="lx-report-glass p-8 md:p-12 w-full max-h-[90%] overflow-y-auto custom-scrollbar shadow-2xl flex flex-col">
                  
                  {/* 章节小标题 */}
                  <p className="font-display text-sm md:text-base uppercase tracking-widest2 text-lm2-violet text-center mb-8 border-b border-white/10 pb-4">
                    {String(i + 1).padStart(2, "0")} · <Bi zh={SECTION_TITLES[i]?.zh ?? ""} en={SECTION_TITLES[i]?.en ?? ""} />
                  </p>
                  
                  {/* 【字号放大核心区】：text-xl md:text-2xl lg:text-3xl */}
                  <div className="prose prose-invert max-w-none text-xl md:text-2xl lg:text-3xl leading-[2.4] tracking-wider text-bone flex-1">
                    {stripMarkdownArtifacts(content).split('\n').map((para, pIdx) => (
                      para.trim() === '' ? null :
                      (para.startsWith('【') && para.endsWith('】')) ? (
                        <h2 key={pIdx} className="text-2xl md:text-3xl lg:text-4xl text-lattice font-bold mt-8 mb-6 text-center">
                          {para}
                        </h2>
                      ) : (
                        <p key={pIdx} className="mb-6 text-justify indent-8">
                          {para}
                        </p>
                      )
                    ))}
                  </div>

                  {/* 针对特定章节，在正文下方直接渲染对应的动态图表！完美无缝融合 */}
                  <div className="mt-8 w-full">
                    {i === 1 && facts && <WuXingChart wx={facts.wuXingCount} />}
                    {i === 2 && facts?.ziwei && <ZiweiGrid palaces={facts.ziwei.palaces} />}
                    {i === 5 && facts && <DaYunTimeline startAge={facts.daYunStartAge} />}
                    {i === 6 && freqScores && <FrequencyChart scores={freqScores} />}
                    {i === 12 && numberEnergy.length > 0 && <NumberEnergyChart items={numberEnergy} />}
                    
                    {/* 生命韧性 & 桃花磁场 引流横幅图 */}
                    {i === 13 && (
                      <div className="mt-8 flex justify-center">
                        <div className="overflow-hidden rounded-xl border border-lm2-text/20 shadow-lg max-w-sm">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src="/images/resilience/resilience.jpg" alt="Life Resilience Index" className="block w-full object-cover" />
                        </div>
                      </div>
                    )}
                    {i === 14 && (
                      <div className="mt-8 flex justify-center">
                        <div className="overflow-hidden rounded-xl border border-lm2-text/20 shadow-lg max-w-sm">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src="/images/romance/romance.jpg" alt="Romance Magnetism Map" className="block w-full object-cover" />
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            </div>
          );
        })}

        {/* 底部功能区 */}
        <div className="text-center space-y-8 pt-12 print:hidden">
          <p className="text-sm md:text-base leading-6 text-lm2-text-dim/80">
            <Bi
              zh="这是一份自我探索与反思的参考，不是命运预言——生命的走向，始终由你自己选择。"
              en="This is a tool for self-exploration and reflection, not a prophecy — the direction of your life is always your own to choose."
            />
          </p>
          <div className="flex flex-col items-center gap-6">
            <button 
              onClick={handlePrint}
              className="lx-portal-btn px-10 py-4 text-lg md:text-xl font-bold tracking-widest cursor-pointer"
            >
              <Bi zh="保存 / 打印完整档案 (PDF)" en="Save / Print Full Archive (PDF)" />
            </button>
            <ShareButton
              text={t("我做了一份灵犀生命图谱，去看看你自己的：", "I got my Lingxi Field Life Map — check out your own:")}
              url="https://lingxifield.com/life-map"
              label={{ zh: "分享这份报告", en: "Share this reading" }}
            />
          </div>
        </div>

      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// 原有的高级图表组件全部原封不动保留，完美融入新版 A4 极光玻璃中！
// -----------------------------------------------------------------------------

function NumberEnergyChart({ items }: { items: { label: string; total: number }[] }) {
  const colors = ["#F0C868", "#8EDBD2"];
  return (
    <div className="mt-5 grid grid-cols-2 gap-4 bg-black/20 p-6 rounded-xl border border-white/10">
      {items.map((it, idx) => {
        const norm = ((it.total - 1) % 30) + 1;
        const pct = (norm / 30) * 100;
        const color = colors[idx % colors.length];
        const r = 30, c = 2 * Math.PI * r;
        return (
          <div key={it.label} className="flex flex-col items-center">
            <svg viewBox="0 0 72 72" className="w-24 md:w-28" style={{ filter: `drop-shadow(0 0 8px ${color}70)` }}>
              <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
              <circle
                cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"
                strokeDasharray={`${c}`} strokeDashoffset={`${c * (1 - pct / 100)}`}
                transform="rotate(-90 36 36)"
              >
                <animate attributeName="stroke-width" values="5.5;6.5;5.5" dur={`${2.8 + idx * 0.4}s`} repeatCount="indefinite" />
              </circle>
              <circle cx="36" cy="36" r="3" fill={color} opacity="0.9">
                <animate attributeName="r" values="2.5;3.5;2.5" dur={`${2.2 + idx * 0.5}s`} repeatCount="indefinite" />
              </circle>
              <text x="36" y="41" textAnchor="middle" fontSize="17" fill="#F4EFFF" fontFamily="serif">{it.total}</text>
            </svg>
            <p className="mt-3 text-center text-sm md:text-base text-lm2-text-dim">{it.label}</p>
          </div>
        );
      })}
    </div>
  );
}

function HumanDesignChart({ hd }: { hd: HumanDesignResult }) {
  const cx = 130, cy = 130, r = 96;
  const glyphs: Record<string, string> = {
    sun: "☉", earth: "⊕", moon: "☽", mercury: "☿", venus: "♀",
    mars: "♂", jupiter: "♃", saturn: "♄", uranus: "♅", neptune: "♆", pluto: "♇",
  };
  const colors = ["#F0C868", "#8EDBD2", "#D8B8FF", "#FF9FD6"];
  return (
    <div className="mt-5 flex flex-col items-center gap-8 bg-black/20 p-8 rounded-xl border border-white/10 sm:flex-row sm:items-center justify-center">
      <svg viewBox="0 0 260 260" className="w-48 md:w-64 shrink-0">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
        <circle cx={cx} cy={cy} r={r - 20} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        {hd.personality.map((g, i) => {
          const rad = ((g.longitude - 90) * Math.PI) / 180;
          const x = cx + r * Math.cos(rad);
          const y = cy + r * Math.sin(rad);
          const color = colors[i % colors.length];
          return (
            <g key={g.key}>
              <line x1={cx} y1={cy} x2={x} y2={y} stroke={color} strokeOpacity="0.15" strokeWidth="1" />
              <circle cx={x} cy={y} r="10" fill="rgba(10,20,38,0.85)" stroke={color} strokeWidth="1.5">
                <animate attributeName="r" values="9;11;9" dur={`${2.6 + i * 0.3}s`} repeatCount="indefinite" />
              </circle>
              <text x={x} y={y + 4} textAnchor="middle" fontSize="10" fill={color}>{glyphs[g.key] || "•"}</text>
            </g>
          );
        })}
        <circle cx={cx} cy={cy} r="34" fill="rgba(240,200,104,0.12)" stroke="#F0C868" strokeWidth="1" />
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize="11" fill="#F0C868" fontFamily="serif">{hd.sunConsciousGate}</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize="8" fill="#D9D3E8">门 {hd.sunUnconsciousGate}</text>
      </svg>
      <div className="grid flex-1 grid-cols-2 gap-x-6 gap-y-3 text-sm md:text-base text-lm2-text-dim">
        {hd.personality.map((g) => (
          <span key={g.key}>{g.zh} — 门 {g.gate}.{g.line}</span>
        ))}
      </div>
    </div>
  );
}

function WuXingChart({ wx }: { wx: { wood: number; fire: number; earth: number; metal: number; water: number } }) {
  const items = [
    { label: "木", en: "Wood", v: wx.wood, color: "#7FE7C4" },
    { label: "火", en: "Fire", v: wx.fire, color: "#FF8FD1" },
    { label: "土", en: "Earth", v: wx.earth, color: "#FFCB61" },
    { label: "金", en: "Metal", v: wx.metal, color: "#D8CDFF" },
    { label: "水", en: "Water", v: wx.water, color: "#5FE8FF" },
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
    <div className="mt-5 bg-black/20 p-6 rounded-xl border border-white/10">
      <div className="mt-4 flex flex-col items-center gap-8 sm:flex-row sm:items-center">
        <svg viewBox={`0 0 ${RADAR_SIZE} ${RADAR_SIZE}`} className="h-40 w-40 md:h-48 md:w-48 shrink-0">
          {gridRings.map((pts, i) => (
            <polygon key={i} points={pts} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          ))}
          <polygon points={radarPath} fill="rgba(199,156,255,0.28)" stroke="#C79CFF" strokeWidth="1.5">
            <animate attributeName="opacity" values=".75;1;.75" dur="3.4s" repeatCount="indefinite" />
          </polygon>
          {radarPoints.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="2.6" fill={items[i].color} />
          ))}
          {radarPoints.map((p, i) => (
            <text key={i} x={p.labelX} y={p.labelY} textAnchor="middle" dominantBaseline="middle" fontSize="9" fill="#DDE6FF">
              {items[i].label}
            </text>
          ))}
        </svg>
        <div className="w-full flex-1 space-y-4">
        {items.map((it, idx) => (
          <div key={it.label} className="flex items-center gap-4">
            <span className="w-12 shrink-0 font-display text-base md:text-lg text-lm2-text">{it.label}</span>
            <div className="h-4 md:h-5 flex-1 overflow-hidden rounded-full bg-lm2-text/10">
              <div
                className="lm2-wx-bar h-full rounded-full"
                style={{
                  width: `${Math.max(6, (it.v / max) * 100)}%`,
                  background: `linear-gradient(90deg, ${it.color}99, ${it.color})`,
                  boxShadow: `0 0 10px ${it.color}80`,
                  animationDelay: `${idx * 0.15}s`,
                }}
              />
            </div>
            <span className="w-6 shrink-0 text-right text-sm md:text-base text-lm2-text-dim">{it.v}</span>
          </div>
        ))}
        </div>
      </div>
      <style>{`
        .lm2-wx-bar { animation: lm2-wx-grow 1.1s cubic-bezier(.22,1,.36,1) both, lm2-wx-glow 3s ease-in-out infinite; }
        @keyframes lm2-wx-grow { from { transform: scaleX(0); transform-origin: left; } to { transform: scaleX(1); transform-origin: left; } }
        @keyframes lm2-wx-glow { 0%,100% { filter: brightness(1); } 50% { filter: brightness(1.25); } }
      `}</style>
    </div>
  );
}

function FrequencyChart({ scores }: { scores: { energy: number; clarity: number; alignment: number } }) {
  const items = [
    { label: "能量水平", en: "Energy", v: scores.energy, color: "#FF8FD1" },
    { label: "头脑清晰度", en: "Clarity", v: scores.clarity, color: "#5FE8FF" },
    { label: "内外对齐感", en: "Alignment", v: scores.alignment, color: "#FFCB61" },
  ];
  return (
    <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-6 bg-black/20 p-8 rounded-xl border border-white/10">
      {items.map((it, idx) => {
        const pct = (it.v / 5) * 100;
        const r = 26, c = 2 * Math.PI * r;
        return (
          <div key={it.label} className="flex flex-col items-center">
            <svg viewBox="0 0 64 64" className="w-24 md:w-28" style={{ filter: `drop-shadow(0 0 6px ${it.color}70)` }}>
              <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
              <circle
                cx="32" cy="32" r={r} fill="none" stroke={it.color} strokeWidth="6" strokeLinecap="round"
                strokeDasharray={`${c}`} strokeDashoffset={`${c * (1 - pct / 100)}`}
                transform="rotate(-90 32 32)"
              >
                <animate attributeName="stroke-width" values="5.5;6.5;5.5" dur={`${2.6 + idx * 0.3}s`} repeatCount="indefinite" />
              </circle>
              <circle cx="32" cy="32" r="3" fill={it.color} opacity="0.9">
                <animate attributeName="r" values="2.5;3.5;2.5" dur={`${2.2 + idx * 0.4}s`} repeatCount="indefinite" />
              </circle>
              <text x="32" y="37" textAnchor="middle" fontSize="16" fill="#F4EFFF" fontFamily="serif">{it.v}</text>
            </svg>
            <p className="mt-3 text-center text-sm md:text-base text-lm2-text-dim">{it.label}</p>
          </div>
        );
      })}
    </div>
  );
}

const ZIWEI_GRID_BRANCHES = [
  ["巳", "午", "未", "申"],
  ["辰", null, null, "酉"],
  ["卯", null, null, "戌"],
  ["寅", "丑", "子", "亥"],
];

function ZiweiGrid({ palaces }: { palaces: any[] }) {
  const byBranch = new Map(palaces.map((p) => [p.earthlyBranch, p]));
  const auroraColors = ["#FF8FD1", "#FFCB61", "#7FE7C4", "#5FE8FF", "#C79CFF"];
  return (
    <div className="mt-5 bg-black/20 p-6 md:p-8 rounded-xl border border-white/10">
      <div className="mt-4 grid grid-cols-4 gap-2">
        {ZIWEI_GRID_BRANCHES.flat().map((branch, i) => {
          if (branch === null) {
            if (i === 5) {
              return (
                <div key="center" className="col-span-2 row-span-2 flex flex-col items-center justify-center rounded-lg border border-lm2-violet/30 bg-lm2-violet/10">
                  <span className="lm2-ziwei-glow font-display text-2xl md:text-3xl text-lm2-violet font-bold">紫微</span>
                  <span className="mt-2 text-xs md:text-sm text-lm2-text-dim tracking-widest">Ziwei Doushu</span>
                </div>
              );
            }
            return null;
          }
          const p = byBranch.get(branch);
          const color = auroraColors[i % auroraColors.length];
          return (
            <div
              key={branch}
              className="flex min-h-[90px] md:min-h-[110px] flex-col justify-between rounded-lg border p-2 shadow-inner"
              style={{
                borderColor: p?.isSoulPalace || p?.isBodyPalace ? color : "rgba(255,255,255,0.15)",
                background: p?.isSoulPalace ? `${color}20` : "transparent",
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs md:text-sm text-lm2-text-dim">{branch}</span>
                {(p?.isSoulPalace || p?.isBodyPalace) && (
                  <span className="text-[10px] md:text-xs font-bold px-1 py-0.5 rounded-sm" style={{ backgroundColor: `${color}40`, color }}>
                    {p?.isSoulPalace ? "命" : ""}{p?.isBodyPalace ? "身" : ""}
                  </span>
                )}
              </div>
              <p className="text-sm md:text-lg font-bold text-lm2-text text-center">{p?.name ?? ""}</p>
              <p className="text-[10px] md:text-xs leading-tight text-lm2-text-dim text-center">
                {p?.majorStars.map((s:any) => s.name).join("·") || "—"}
              </p>
            </div>
          );
        })}
      </div>
      <style>{`
        .lm2-ziwei-glow { animation: lm2-ziwei-pulse 3.5s ease-in-out infinite; }
        @keyframes lm2-ziwei-pulse { 0%,100% { opacity: 0.7; text-shadow: 0 0 6px rgba(199,156,255,0.3); } 50% { opacity: 1; text-shadow: 0 0 14px rgba(199,156,255,0.7); } }
      `}</style>
    </div>
  );
}

function DaYunTimeline({ startAge }: { startAge: number | null }) {
  const start = startAge ?? 8;
  const periods = Array.from({ length: 5 }).map((_, i) => start + i * 10);
  const auroraColors = ["#FF8FD1", "#FFCB61", "#7FE7C4", "#5FE8FF", "#C79CFF"];
  return (
    <div className="mt-5 bg-black/20 p-6 md:p-8 rounded-xl border border-white/10">
      <div className="relative mt-6 pb-2 px-4">
        <div className="absolute left-4 right-4 top-4 h-1 bg-gradient-to-r from-lm2-rose via-lm2-amber via-lm2-mint to-lm2-violet opacity-60 rounded-full" />
        <div className="flex justify-between relative z-10">
          {periods.map((age, i) => (
            <div key={age} className="flex flex-col items-center">
              <span
                className="lm2-dayun-dot h-6 w-6 md:h-8 md:w-8 rounded-full border-4 border-[#0a1626] shadow-lg"
                style={{ background: auroraColors[i % auroraColors.length], animationDelay: `${i * 0.4}s` }}
              />
              <span className="mt-4 font-display text-sm md:text-base font-bold text-lm2-text">{age}<Bi zh="岁" en="" /></span>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        .lm2-dayun-dot { animation: lm2-dayun-glow 2.4s ease-in-out infinite; }
        @keyframes lm2-dayun-glow { 0%,100% { transform: scale(1); filter: brightness(1); box-shadow: 0 0 10px currentColor; } 50% { transform: scale(1.2); filter: brightness(1.3); box-shadow: 0 0 20px currentColor; } }
      `}</style>
    </div>
  );
}
