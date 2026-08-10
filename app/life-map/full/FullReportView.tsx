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
  ziwei: { palaces: { name: string; earthlyBranch: string; majorStars: { name: string; brightness: string }[]; isSoulPalace: boolean; isBodyPalace: boolean; decadalRange: [number, number] }[]; } | null;
  daYunStartAge: number | null;
  humanDesign: HumanDesignResult | null;
};

const SECTION_TITLES = [
  { zh: "七大行星逐一解读", en: "The Seven Planets, One by One" },
  { zh: "八字深层结构", en: "The Deep Structure of Your Bazi" },
  { zh: "紫微命盘详解", en: "Your Ziwei Chart, Decoded" },
  { zh: "胎元 · 命宫 · 身宫", en: "Fetal Origin · Life & Body Palace" },
  { zh: "玛雅印记详解", en: "Your Maya Sign, Decoded" },
  { zh: "大运走势", en: "Your Major Luck Cycles" },
  { zh: "频率自测解读", en: "Your Frequency Self-Assessment" },
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
    const observer = new MutationObserver(() => setLangEn(document.documentElement.classList.contains("lang-en")));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);
  const t = (zh: string, en: string) => (langEn ? en : zh);

  const [status, setStatus] = useState<"checking" | "locked" | "generating" | "ready" | "error">("checking");
  const [sections, setSections] = useState<string[]>([]);
  const [coreTypeName, setCoreTypeName] = useState("");
  const [facts, setFacts] = useState<ChartFacts | null>(null);
  const [freqScores, setFreqScores] = useState<any>(null);
  const [numberEnergy, setNumberEnergy] = useState<any[]>([]);
  const [freePreview, setFreePreview] = useState<any>(null);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);

  // 绑定图表引用，为了 PDF 导出时能无损截图嵌入
  const figureRefs = useRef<Record<number, HTMLDivElement | null>>({});

  useEffect(() => {
    const run = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/account"; return; }

      const { data: submission } = await supabase.from("life_map_submissions").select("*").eq("id", id).single();
      if (submission?.core_type_name) setCoreTypeName(submission.core_type_name);
      
      let loadedFacts = submission?.facts;
      if (loadedFacts) setFacts(loadedFacts);

      if (submission) setFreqScores({ energy: submission.energy_level ?? 3, clarity: submission.clarity_level ?? 3, alignment: submission.alignment_level ?? 3 });

      if (submission?.focus) {
        const matches: any[] = [];
        const pm = /手机号数字能量：\S+（总和(\d+)/.exec(submission.focus);
        if (pm) matches.push({ label: "手机号", total: parseInt(pm[1], 10) });
        const plm = /车牌号数字能量：\S+（总和(\d+)/.exec(submission.focus);
        if (plm) matches.push({ label: "车牌号", total: parseInt(plm[1], 10) });
        setNumberEnergy(matches);
      }

      if (submission?.free_narrative) {
        const cleanedNarrative = stripMarkdownArtifacts(submission.free_narrative as string);
        const parts = cleanedNarrative.split(/\n\s*\n/).map((s: string) => s.trim()).filter(Boolean);
        const echoText = parts[0] || "";
        const normalizeDelims = (s: string) => s.replace(/[｜]/g, "|").replace(/[，、]/g, ",");
        const [stageName, stageDesc] = normalizeDelims(parts[1] || "").split("|").map((s) => s?.trim());
        const keywordParts = normalizeDelims(parts[2] || "").split("|").map((s) => s.trim()).filter(Boolean);
        const keywords = keywordParts.map((kp) => kp.split(",").map((s) => s?.trim()).filter(Boolean)).filter((pair) => pair.length === 2 && !/^【?关键词\s*\d/.test(pair[0])).map(([w, d]) => ({ word: w, desc: d }));
        setFreePreview({ echoText, stageName: stageName || "", stageDesc: stageDesc || "", keywords });
      }

      setStatus("generating");
      try {
        const isEn = document.documentElement.classList.contains("lang-en");
        // 这里携带 lang 请求双语缓存
        const res = await fetch("/api/lifemap/generate-full", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, lang: isEn ? "en" : "zh", forceRegenerate: false }),
        });
        const data = await res.json();
        
        if (res.status === 402) { setStatus("locked"); return; }
        if (!res.ok || (!data.fullReport && !data.report)) {
          setError(data.error || t("生成失败，请重试。", "Generation failed."));
          setStatus("error"); return;
        }
        
        const reportText = data.report || data.fullReport;
        setSections(reportText.split(/===\s*\d+\s*===/).map((s: string) => s.trim()).filter(Boolean));
        setStatus("ready");
      } catch {
        setError(t("连接失败。", "Connection error."));
        setStatus("error");
      }
    };
    run();
  }, [id, langEn]);

  // 恢复完美的 PDF 导出逻辑
  const downloadPdf = async () => {
    setDownloading(true);
    try {
      const { exportArchivePdf, ARCHIVE_THEMES } = await import("@/lib/pdf-export");
      const FIGURE_CAPTIONS: Record<number, { zh: string; en: string }> = {
        1: { zh: "五行分布", en: "Five Elements" },
        2: { zh: "紫微命盘", en: "Ziwei Chart" },
        5: { zh: "大运时间线", en: "Luck Cycles" },
        6: { zh: "频率雷达", en: "Frequency Radar" },
        12: { zh: "数字灵动环", en: "Number Energy Rings" },
      };
      
      await exportArchivePdf({
        chapters: sections.map((body, i) => ({
          title: (langEn ? SECTION_TITLES[i]?.en : SECTION_TITLES[i]?.zh) ?? `第 ${i + 1} 章`,
          body: stripMarkdownArtifacts(body),
          figure: figureRefs.current[i] && figureRefs.current[i]!.offsetHeight > 8 ? figureRefs.current[i] : null,
          figureCaption: FIGURE_CAPTIONS[i] ? t(FIGURE_CAPTIONS[i].zh, FIGURE_CAPTIONS[i].en) : undefined,
        })),
        fileName: `灵犀生命图谱-${coreTypeName || "report"}.pdf`,
        titleZh: `${coreTypeName || "你的"}生命图谱`,
        titleEn: `${coreTypeName || "Your"} Life Map`,
        eyebrow: "LIFE MAP",
        theme: ARCHIVE_THEMES.lifemap,
        coverImage: "/images/lifemap/page-0.png",
        bodyImages: Array.from({ length: 11 }, (_, k) => `/images/lifemap/page-${k + 1}.png`),
        endImage: "/images/lifemap/page-11.png",
      });
    } catch (e) {
      console.error("PDF Generate Error:", e);
      alert(t("PDF 生成失败，请稍后再试。", "PDF generation failed."));
    } finally {
      setDownloading(false);
    }
  };

  if (status === "checking" || status === "generating") return <div className="py-32 flex justify-center"><PortalSpinner /></div>;
  if (status === "locked") return <div className="py-32 text-center text-bone">🔒 请先解锁报告</div>;
  if (status === "error") return <div className="py-32 text-center text-rose-300">{error}</div>;

  return (
    <div className="pb-24 px-2 md:px-6 max-w-[800px] mx-auto mt-6">
      
      {/* 完美的顶部下载栏与返回导航 */}
      <div className="flex items-center justify-between mb-8 px-2 print:hidden relative z-50">
        <p className="font-display text-sm uppercase tracking-widest2 text-[#8C7FA8]">
          🌌 <Bi zh="完整生命频率图谱" en="Life Frequency Map" />
        </p>
        <button
          onClick={downloadPdf}
          disabled={downloading}
          className="flex items-center gap-2 rounded-full border border-white/30 bg-white/10 backdrop-blur-md px-5 py-2.5 text-xs font-bold tracking-widest text-[#2E2742] transition hover:bg-white/30 hover:scale-105 shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
        >
          {downloading ? <><PortalSpinner /><Bi zh="生成中…" en="Generating…" /></> : <Bi zh="保存完整档案 (PDF)" en="Download PDF" />}
        </button>
      </div>

      <div className="space-y-12">
        {/* ========================================================
            第 1 页：封面 (page-0)
            ======================================================== */}
        <div className="relative w-full aspect-[1/1.414] overflow-hidden rounded-[20px] shadow-2xl print:shadow-none print:w-full print:h-screen print:rounded-none page-break-after-always">
          <div className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url('/images/lifemap/page-0.png')` }} />
          
          <div className="absolute inset-0 z-10 flex flex-col justify-center items-center p-6 md:p-10">
            {/* ✨ 仙气飘飘的超薄玻璃罩 ✨ */}
            <div className="relative p-8 md:p-10 w-full max-h-[96%] overflow-y-auto custom-scrollbar flex flex-col items-center gap-8 rounded-[24px] border border-white/20 bg-white/5 backdrop-blur-[12px] shadow-[0_8px_32px_rgba(255,255,255,0.2)]">
              
              <h1 className="font-display text-4xl md:text-5xl font-light tracking-[0.1em] text-[#2E2742] text-center">
                {coreTypeName}
              </h1>

              {lifemapTypeImage(coreTypeName) && (
                <div className="overflow-hidden rounded-2xl border border-white/40 shadow-xl" style={{ maxWidth: '280px', width: '100%' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={lifemapTypeImage(coreTypeName)!} alt={coreTypeName} className="block w-full object-cover" />
                </div>
              )}

              {facts && (
                <div className="w-full mt-4">
                  <p className="text-center font-display text-xs md:text-sm uppercase tracking-[0.2em] text-[#6D4A9C]/80 mb-4 font-bold">
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
            第 2 页：当前阶段 (page-1)
            ======================================================== */}
        {(freePreview || facts?.humanDesign) && (
          <div className="relative w-full aspect-[1/1.414] overflow-hidden rounded-[20px] shadow-2xl print:shadow-none print:w-full print:h-screen print:rounded-none page-break-after-always">
            <div className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url('/images/lifemap/page-1.png')` }} />
            <div className="absolute inset-0 z-10 flex flex-col justify-center items-center p-6 md:p-10">
              <div className="relative p-8 md:p-10 w-full max-h-[96%] overflow-y-auto custom-scrollbar space-y-8 rounded-[24px] border border-white/20 bg-white/5 backdrop-blur-[12px] shadow-[0_8px_32px_rgba(255,255,255,0.2)]">
                
                {freePreview && (
                  <div className="space-y-6">
                    {freePreview.echoText && <p className="text-[15px] md:text-[17px] leading-[2.2] tracking-wider text-[#2E2742]/90 text-justify indent-8">{freePreview.echoText}</p>}
                    {freePreview.stageName && (
                      <div className="border-t border-[#8C7FA8]/20 pt-6">
                        <p className="font-display text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] text-[#6D4A9C]/60 text-center mb-2">
                          <Bi zh="当前生命阶段" en="Current Life Stage" />
                        </p>
                        <h3 className="font-display text-2xl md:text-3xl text-[#2E2742] font-light tracking-widest text-center">「{freePreview.stageName}」</h3>
                        <p className="mt-4 text-[15px] md:text-[17px] leading-[2.2] tracking-wider text-[#2E2742]/90 text-justify indent-8">{freePreview.stageDesc}</p>
                      </div>
                    )}
                    {freePreview.keywords.length > 0 && (
                      <div className="border-t border-[#8C7FA8]/20 pt-6">
                        <p className="font-display text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] text-[#6D4A9C]/60 text-center mb-4">
                          <Bi zh="你的场域关键词" en="Your Keywords" />
                        </p>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                          {freePreview.keywords.map((k:any, i:number) => (
                            <div key={i} className="bg-white/30 rounded-xl p-4 text-center border border-white/40 shadow-sm">
                              <p className="font-display text-lg text-[#6D4A9C] font-bold mb-1">✨ {k.word}</p>
                              <p className="text-xs text-[#2E2742]/70">{k.desc}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {facts?.humanDesign && (
                  <div className="border-t border-[#8C7FA8]/20 pt-6">
                    <p className="font-display text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] text-[#6D4A9C]/60 text-center mb-4">
                      <Bi zh="人类图 · 意识印记" en="Human Design" />
                    </p>
                    <HumanDesignChart hd={facts.humanDesign} />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            正文章节 
            ======================================================== */}
        {sections.map((content, i) => {
          const isSkippedNumberSection = i === 12 && /未提供手机号/.test(content);
          if (isSkippedNumberSection) return null;

          const bgNum = (i % 10) + 2; 
          const bgImageUrl = `/images/lifemap/page-${bgNum}.png`;
          const title = SECTION_TITLES[i] ?? { zh: `第${i + 1}章`, en: `Section ${i + 1}` };

          return (
            <div key={i} className="relative w-full aspect-[1/1.414] overflow-hidden rounded-[20px] shadow-2xl print:shadow-none print:w-full print:h-screen print:rounded-none page-break-after-always">
              <div className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url('${bgImageUrl}')` }} />
              
              <div className="absolute inset-0 z-10 flex flex-col justify-center items-center p-6 md:p-10">
                <div className="relative p-8 md:p-10 w-full max-h-[96%] overflow-y-auto custom-scrollbar flex flex-col rounded-[24px] border border-white/20 bg-white/5 backdrop-blur-[12px] shadow-[0_8px_32px_rgba(255,255,255,0.2)]">
                  
                  {/* 小巧的点缀 */}
                  <div className="absolute top-5 left-5 w-1.5 h-1.5 rounded-full bg-white/60" />
                  <div className="absolute top-5 right-5 w-1.5 h-1.5 rounded-full bg-white/60" />
                  <div className="absolute bottom-5 left-5 w-1.5 h-1.5 rounded-full bg-white/60" />
                  <div className="absolute bottom-5 right-5 w-1.5 h-1.5 rounded-full bg-white/60" />

                  {/* 标题区：极简留白与线条 */}
                  <div className="text-center mb-8 pb-4 border-b border-[#8C7FA8]/10">
                    <p className="font-display text-[10px] md:text-xs font-bold uppercase tracking-[0.4em] text-[#6D4A9C]/60 mb-2">
                      LIFE MAP · {String(i + 1).padStart(2, "0")} / {String(sections.length).padStart(2, "0")}
                    </p>
                    <h3 className="font-display text-2xl md:text-3xl font-light tracking-[0.1em] text-[#2E2742]">
                      <Bi zh={title.zh} en={title.en} />
                    </h3>
                  </div>
                  
                  {/* 正文：绝不溢出、充满呼吸感的排版 */}
                  <div className="prose prose-invert max-w-none text-[15px] md:text-[17px] leading-[2.2] tracking-wider text-[#2E2742]/90 flex-1 px-1">
                    {stripMarkdownArtifacts(content).split('\n').map((para, pIdx) => (
                      para.trim() === '' ? null :
                      (para.startsWith('【') && para.endsWith('】')) ? (
                        <h2 key={pIdx} className="text-lg md:text-xl text-[#6D4A9C] font-bold mt-6 mb-3 flex items-center gap-2 justify-center">
                          <span className="w-1.5 h-1.5 rotate-45 bg-[#6D4A9C]/50 inline-block" /> {para.replace(/【|】/g, '')} <span className="w-1.5 h-1.5 rotate-45 bg-[#6D4A9C]/50 inline-block" />
                        </h2>
                      ) : (
                        <p key={pIdx} className="mb-5 text-justify indent-8">
                          {para}
                        </p>
                      )
                    ))}
                  </div>

                  {/* 恢复图表嵌入及截图锚点 ref */}
                  <div className="mt-6 w-full" ref={(el) => { figureRefs.current[i] = el; }}>
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
    </div>
  );
}

// -----------------------------------------------------------------------------
// 高级图表组件 (完美适配极其通透的玻璃底色，全深色字体设计)
// -----------------------------------------------------------------------------

function NumberEnergyChart({ items }: { items: { label: string; total: number }[] }) {
  const colors = ["#E7A13C", "#3FA89C"];
  return (
    <div className="mt-4 grid grid-cols-2 gap-4 bg-white/30 p-5 rounded-2xl border border-white/40 shadow-sm">
      {items.map((it, idx) => {
        const norm = ((it.total - 1) % 30) + 1;
        const pct = (norm / 30) * 100;
        const color = colors[idx % colors.length];
        const r = 30, c = 2 * Math.PI * r;
        return (
          <div key={it.label} className="flex flex-col items-center">
            <svg viewBox="0 0 72 72" className="w-20 md:w-24">
              <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="5" />
              <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" strokeDasharray={`${c}`} strokeDashoffset={`${c * (1 - pct / 100)}`} transform="rotate(-90 36 36)" />
              <text x="36" y="41" textAnchor="middle" fontSize="16" fill="#2E2742" fontFamily="serif" fontWeight="bold">{it.total}</text>
            </svg>
            <p className="mt-2 text-center text-xs md:text-sm text-[#2E2742]/80 font-bold">{it.label}</p>
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
    <div className="mt-4 flex flex-col items-center gap-6 bg-white/30 p-6 rounded-2xl border border-white/40 shadow-sm sm:flex-row sm:items-center justify-center">
      <svg viewBox="0 0 260 260" className="w-48 md:w-56 shrink-0">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="1" />
        <circle cx={cx} cy={cy} r={r - 20} fill="none" stroke="rgba(0,0,0,0.03)" strokeWidth="1" />
        {hd.personality.map((g, i) => {
          const rad = ((g.longitude - 90) * Math.PI) / 180;
          const x = cx + r * Math.cos(rad);
          const y = cy + r * Math.sin(rad);
          const color = colors[i % colors.length];
          return (
            <g key={g.key}>
              <line x1={cx} y1={cy} x2={x} y2={y} stroke={color} strokeOpacity="0.5" strokeWidth="1" />
              <circle cx={x} cy={y} r="10" fill="rgba(255,255,255,0.9)" stroke={color} strokeWidth="1.5" />
              <text x={x} y={y + 3.5} textAnchor="middle" fontSize="10" fill={color}>{glyphs[g.key] || "•"}</text>
            </g>
          );
        })}
        <circle cx={cx} cy={cy} r="34" fill="rgba(240,200,104,0.15)" stroke="#E7A13C" strokeWidth="1" />
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize="13" fill="#2E2742" fontFamily="serif" fontWeight="bold">{hd.sunConsciousGate}</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize="8" fill="#6D4A9C" fontWeight="bold">门 {hd.sunUnconsciousGate}</text>
      </svg>
      <div className="grid flex-1 grid-cols-2 gap-x-3 gap-y-2 text-xs md:text-sm text-[#2E2742]/80 font-medium">
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
  const gridRings = [0.33, 0.66, 1].map((frac) => items.map((_, i) => `${CENTER + frac * MAX_R * Math.cos(-Math.PI / 2 + (i * 2 * Math.PI) / items.length)},${CENTER + frac * MAX_R * Math.sin(-Math.PI / 2 + (i * 2 * Math.PI) / items.length)}`).join(" "));
  
  return (
    <div className="mt-4 bg-white/30 p-5 rounded-2xl border border-white/40 shadow-sm">
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
        <svg viewBox={`0 0 ${RADAR_SIZE} ${RADAR_SIZE}`} className="h-32 w-32 shrink-0">
          {gridRings.map((pts, i) => <polygon key={i} points={pts} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="1" />)}
          <polygon points={radarPath} fill="rgba(154,123,217,0.2)" stroke="#9A7BD9" strokeWidth="1.5" />
          {radarPoints.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="2.6" fill={items[i].color} />)}
          {radarPoints.map((p, i) => <text key={i} x={p.labelX} y={p.labelY} textAnchor="middle" dominantBaseline="middle" fontSize="10" fill="#2E2742" fontWeight="bold">{items[i].label}</text>)}
        </svg>
        <div className="w-full flex-1 space-y-3">
        {items.map((it) => (
          <div key={it.label} className="flex items-center gap-3">
            <span className="w-6 shrink-0 font-display text-sm text-[#2E2742] font-bold">{it.label}</span>
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-black/5">
              <div className="h-full rounded-full" style={{ width: `${Math.max(6, (it.v / max) * 100)}%`, background: it.color }} />
            </div>
            <span className="w-5 shrink-0 text-right text-xs text-[#2E2742] font-bold">{it.v}</span>
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
    <div className="mt-4 grid grid-cols-3 gap-3 bg-white/30 p-5 rounded-2xl border border-white/40 shadow-sm">
      {items.map((it, idx) => {
        const pct = (it.v / 5) * 100;
        const r = 26, c = 2 * Math.PI * r;
        return (
          <div key={it.label} className="flex flex-col items-center">
            <svg viewBox="0 0 64 64" className="w-16">
              <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="4" />
              <circle cx="32" cy="32" r={r} fill="none" stroke={it.color} strokeWidth="4" strokeLinecap="round" strokeDasharray={`${c}`} strokeDashoffset={`${c * (1 - pct / 100)}`} transform="rotate(-90 32 32)" />
              <text x="32" y="37" textAnchor="middle" fontSize="15" fill="#2E2742" fontFamily="serif" fontWeight="bold">{it.v}</text>
            </svg>
            <p className="mt-2 text-center text-xs md:text-sm text-[#2E2742]/80 font-bold">{it.label}</p>
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
    <div className="mt-4 bg-white/30 p-4 md:p-5 rounded-2xl border border-white/40 shadow-sm">
      <div className="grid grid-cols-4 gap-1.5 md:gap-2">
        {ZIWEI_GRID_BRANCHES.flat().map((branch, i) => {
          if (branch === null) {
            if (i === 5) return (
              <div key="center" className="col-span-2 row-span-2 flex flex-col items-center justify-center rounded-xl border border-[#9A7BD9]/20 bg-[#9A7BD9]/10">
                <span className="font-display text-2xl text-[#6D4A9C] font-bold tracking-widest">紫微</span>
              </div>
            );
            return null;
          }
          const p = byBranch.get(branch);
          const color = auroraColors[i % auroraColors.length];
          return (
            <div key={branch} className="flex min-h-[80px] flex-col justify-between rounded-xl border p-2 bg-white/50" style={{ borderColor: p?.isSoulPalace ? color : "rgba(0,0,0,0.05)" }}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#6D4A9C]/80 font-bold">{branch}</span>
                {(p?.isSoulPalace || p?.isBodyPalace) && <span className="text-[9px] px-1 rounded-sm text-white" style={{ backgroundColor: color }}>{p?.isSoulPalace ? "命" : "身"}</span>}
              </div>
              <p className="text-xs md:text-sm font-bold text-[#2E2742] text-center">{p?.name ?? ""}</p>
              <p className="text-[9px] md:text-[10px] text-[#2E2742]/60 text-center">{p?.majorStars.map((s:any) => s.name).join("·") || "—"}</p>
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
    <div className="mt-4 bg-white/30 p-5 md:p-6 rounded-2xl border border-white/40 shadow-sm">
      <div className="relative pb-2 px-2">
        <div className="absolute left-2 right-2 top-3 h-0.5 bg-[#2E2742]/10" />
        <div className="flex justify-between relative z-10">
          {periods.map((age, i) => (
            <div key={age} className="flex flex-col items-center">
              <span className="h-6 w-6 rounded-full border-[3px] border-white shadow-sm" style={{ background: auroraColors[i % auroraColors.length] }} />
              <span className="mt-2 font-display text-xs md:text-sm font-bold text-[#2E2742]">{age}岁</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
