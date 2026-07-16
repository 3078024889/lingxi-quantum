"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import Bi from "@/components/Bi";
import NatalChartWheel from "../NatalChartWheel";

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
  { zh: "专属灵犀练习", en: "A Personal Lingxi Practice" },
  { zh: "前世今生印记 · 纯属脑洞", en: "Past & Future Imprint · Just for Fun" },
  { zh: "数字能量解读（手机号 / 车牌号）", en: "Number Energy Reading (Phone & Plate)" },
];

export default function FullReportView({ id }: { id: string }) {
  // 同 LifeMapFlow：首次渲染固定为 false，避免 hydration 不匹配报错，挂载后再同步真实语言。
  const [langEn, setLangEn] = useState(false);
  useEffect(() => {
    setLangEn(document.documentElement.classList.contains("lang-en"));
    const observer = new MutationObserver(() => {
      setLangEn(document.documentElement.classList.contains("lang-en"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);
  const isEn = () => langEn;
  const t = (zh: string, en: string) => (langEn ? en : zh);

  const [status, setStatus] = useState<"checking" | "locked" | "generating" | "ready" | "error">("checking");
  const [downloading, setDownloading] = useState(false);
  const [printMode, setPrintMode] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);
  const [sections, setSections] = useState<string[]>([]);
  const [coreTypeName, setCoreTypeName] = useState("");
  const [facts, setFacts] = useState<ChartFacts | null>(null);
  const [freqScores, setFreqScores] = useState<{ energy: number; clarity: number; alignment: number } | null>(null);
  const [numberEnergy, setNumberEnergy] = useState<{ label: string; total: number }[]>([]);
  const [freePreview, setFreePreview] = useState<{ echoText: string; stageName: string; stageDesc: string; keywords: { word: string; desc: string }[] } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const run = async () => {
      // 客户端在此处才真正创建 Supabase 实例——只在 useEffect（挂载后才执行）内部创建，
      // 绝不放在组件顶层：放在顶层会在 Next.js 构建时的服务端预渲染阶段也执行到，
      // 如果那个阶段环境变量不可用，会直接导致整个页面构建失败。
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
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
      // 老报告（"人类图·门"这个板块上线之前生成的）facts 里没有 humanDesign
      // 这一项——出生信息本身是存过的，天文计算又是确定性的，这里自动补算
      // 一次，不需要用户自己发现"少了一节"再来找我们。
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
        } catch {
          // 补算失败就算了，不影响报告其余部分正常显示
        }
      }
      if (submission) {
        setFreqScores({
          energy: submission.energy_level ?? 3,
          clarity: submission.clarity_level ?? 3,
          alignment: submission.alignment_level ?? 3,
        });
      }
      // 手机号/车牌号的数字能量数据，是提交时折进 focus 字段里存的（格式固定，
      // 见 LifeMapFlow.tsx 里 trySaveSubmission 调用处），这里用同样的格式
      // 反向解析出总和数，画成图。数据来源和文字解读是同一份，不是另外编的。
      // 这是生命图谱"结合当下生活状态"的一部分，跟星盘/八字/紫微等一起
      // 常驻显示在报告里，不再挂一个可以关掉的开关按钮。
      if (submission?.focus) {
        const matches: { label: string; total: number }[] = [];
        const phoneMatch = /手机号数字能量：\S+（总和(\d+)/.exec(submission.focus);
        if (phoneMatch) matches.push({ label: "手机号", total: parseInt(phoneMatch[1], 10) });
        const plateMatch = /车牌号数字能量：\S+（总和(\d+)/.exec(submission.focus);
        if (plateMatch) matches.push({ label: "车牌号", total: parseInt(plateMatch[1], 10) });
        setNumberEnergy(matches);
      }
      // 免费预览里那段"当前生命阶段 + 三个关键词"，其实早就存进了
      // free_narrative 字段（跟当初免费预览页面显示的是同一份数据）——
      // 之前完整报告页面只顾着展示付费才生成的12/13段内容，没把这段
      // 免费阶段就有的内容也带进来，等于用户在免费预览里看到的东西，
      // 花钱之后反而在完整报告里找不到了。这里用跟免费预览完全一样的
      // 解析逻辑，把这段内容也摆进完整报告。
      if (submission?.free_narrative) {
        const parts = (submission.free_narrative as string).split(/\n\s*\n/).map((s: string) => s.trim()).filter(Boolean);
        const echoText = parts[0] || "";
        const [stageName, stageDesc] = (parts[1] || "").split("|").map((s) => s?.trim());
        const keywordParts = (parts[2] || "").split("|").map((s) => s.trim()).filter(Boolean);
        const keywords = keywordParts.map((kp) => {
          const [w, d] = kp.split(",").map((s) => s?.trim());
          return { word: w || "", desc: d || "" };
        });
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
        if (!res.ok || !data.fullReport) {
          setError(data.error || t("生成失败，请刷新重试。", "Generation failed — please refresh and try again."));
          setStatus("error");
          return;
        }
        const parts = (data.fullReport as string)
          .split(/===\s*\d+\s*===/)
          .map((s) => s.trim())
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
          {status === "checking" ? t("正在确认解锁状态…", "Confirming your unlock…") : t("灵犀正在为你，逐层展开这份完整命盘…", "Lingxi is unfolding your full chart, layer by layer…")}
        </p>
        <p className="mt-2 text-sm text-lm2-text-dim/60">{t("这可能需要一点时间，请不要关闭页面。", "This may take a moment — please don't close this page.")}</p>
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
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <p className="text-sm text-rose">{error}</p>
      </div>
    );
  }

  const downloadPdf = async () => {
    if (!reportRef.current) return;
    setDownloading(true);
    setPrintMode(true);
    // 等两帧，确保打印模式的样式（彩虹背景+黑字）真的重绘完成，再截图，
    // 不然html2canvas可能截到样式切换前的旧画面。
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);
      const canvas = await html2canvas(reportRef.current, {
        backgroundColor: "#1a1440", // 跟 .lm2-print-mode 渐变的起始色对齐，不再是旧的深藏青
        scale: 2,
        useCORS: true,
      });
      const imgData = canvas.toDataURL("image/jpeg", 0.92);
      // A4 比例分页：把长截图，按A4宽高比，切成若干页
      const pdf = new jsPDF({ unit: "pt", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      pdf.save(`灵犀生命图谱-${coreTypeName || "report"}.pdf`);
    } catch (e) {
      console.error("PDF 生成失败:", e);
      alert(t("PDF 生成失败，请稍后再试，或改用浏览器打印功能另存为 PDF。", "PDF generation failed — please try again, or use your browser's print-to-PDF as a fallback."));
    } finally {
      setDownloading(false);
      setPrintMode(false);
    }
  };

  return (
    <div className="px-6 py-20 print:py-6">
      <style>{`
        .lm2-print-mode {
          /* 之前这里是深藏青色打底、只在边角叠一点点极光色，截出来的PDF
             看着就是一片深色，跟网站其他地方（首页、OG图）那种明亮饱和
             的七彩极光完全不是一个调子。这次改成跟品牌视觉一致的做法：
             以多组更饱和、覆盖范围更大的极光色块打底，压深色的比例，
             让粉紫、天青、金橙这几个品牌色都能被看见，同时仍然留出
             足够的深浅对比，白色文字才读得清楚。 */
          background:
            radial-gradient(ellipse 85% 60% at 10% -8%, rgba(255,182,213,0.38), transparent 62%),
            radial-gradient(ellipse 80% 65% at 100% 5%, rgba(140,210,255,0.42), transparent 62%),
            radial-gradient(ellipse 75% 60% at 50% 105%, rgba(216,184,255,0.40), transparent 64%),
            radial-gradient(ellipse 60% 50% at 90% 90%, rgba(255,214,153,0.30), transparent 58%),
            radial-gradient(ellipse 55% 45% at 5% 60%, rgba(150,232,210,0.26), transparent 55%),
            linear-gradient(160deg, #1a1440 0%, #241a4a 30%, #17335c 65%, #0d2440 100%);
          border-radius: 4px;
        }
        /* 打印模式下的标题/正文颜色，配合上面更亮的极光底重新调过一次——
           之前那组浅蓝白（#DDE6FF）是给深藏青底设计的，现在底色亮了不少，
           同一套颜色对比度会打折扣，这里同步调得更亮、更暖一点，跟标题
           的暖紫金色（lm2-print-title）呼应起来。 */
        /* 截图那一刻，画面必须是"静止"的：卡片的呼吸光、玫瑰饼图的描边动画、
           进度环的发光动效，这些原本在网页上是好看的，但 html2canvas 只能
           拍下某一个瞬间的静止画面——如果正好拍在动画中途（比如渐变条纹
           滑到一半），截出来的图会带着这个"半成品"的痕迹，PDF 里出现过的
           那种莫名白色横纹，很可能就是这么来的。这里在打印模式下把所有
           动画都关掉，画面先"定住"再截图。 */
        .lm2-print-mode, .lm2-print-mode * {
          animation: none !important;
        }
        .lm2-print-mode h1,
        .lm2-print-mode p,
        .lm2-print-mode span,
        .lm2-print-mode div { color: #DDE6FF !important; }
        .lm2-print-mode .lm2-print-title { color: #D8B8FF !important; font-weight: 600; }
        .lm2-print-mode svg text { fill: #DDE6FF !important; }
        /* 报告里的子卡片（星盘/五行/紫微/频率）在打印模式下也要跟外层的
           深色极光底保持一致的玻璃质感，不能用网页版那套半透明深色
           （半透明深色叠在同样是深色的打印底上，边界会糊成一团看不清）。
           这里给它们在打印模式下加一层更亮一点的玻璃亮度，卡片轮廓才
           分得清楚。 */
        .lm2-print-mode .bg-lm2-card {
          background: rgba(255,255,255,0.08) !important;
          border-color: rgba(160,224,255,0.4) !important;
        }
      `}</style>
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between print:hidden">
          <p className="font-display text-sm uppercase tracking-widest2 text-lm2-violet">
            🌌 <Bi zh="完整生命频率图谱" en="Your Full Life Frequency Map" />
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={downloadPdf}
              disabled={downloading}
              className="rounded-sm border border-lm2-text/15 px-4 py-2 text-xs uppercase tracking-widest2 text-lm2-text-dim transition hover:border-lm2-violet hover:text-lm2-text disabled:opacity-50"
            >
              {downloading ? <Bi zh="正在生成 PDF…" en="Generating PDF…" /> : <Bi zh="下载 PDF" en="Download PDF" />}
            </button>
          </div>
        </div>
        <div ref={reportRef} className={printMode ? "lm2-print-mode px-1 py-4" : "bg-lm2-report px-1 py-4"}>
        <h1 className="mt-4 font-display text-3xl font-light text-lm2-text lm2-print-title">{coreTypeName}</h1>

        {facts && (
          <div className="mt-8 rounded-sm border border-lm2-text/10 bg-lm2-card p-6 backdrop-blur-xl">
            <p className="text-center font-display text-sm uppercase tracking-widest2 text-lm2-violet">
              <Bi zh="你的星盘" en="Your Natal Chart" />
            </p>
            <NatalChartWheel
              sunLongitude={facts.sunLongitude} moonLongitude={facts.moonLongitude}
              mercury={facts.mercury.longitude} venus={facts.venus.longitude} mars={facts.mars.longitude}
              jupiter={facts.jupiter.longitude} saturn={facts.saturn.longitude}
            />
          </div>
        )}

        {freePreview && (
          <div className="bg-void-deep mt-10 p-6 sm:p-8">
            {freePreview.echoText && (
              <p className="text-base leading-9 text-lm2-text">{freePreview.echoText}</p>
            )}
            {freePreview.stageName && (
              <div className="mt-6 border-t border-lm2-text/10 pt-6">
                <p className="font-display text-sm uppercase tracking-widest2 text-lm2-violet">
                  <Bi zh="当前生命阶段" en="Your Current Life Stage" />
                </p>
                <h3 className="mt-2 font-display text-2xl text-lm2-text">「{freePreview.stageName}」</h3>
                <p className="mt-3 text-base leading-8 text-lm2-text-dim">{freePreview.stageDesc}</p>
              </div>
            )}
            {freePreview.keywords.length > 0 && (
              <div className="mt-6 border-t border-lm2-text/10 pt-6">
                <p className="font-display text-sm uppercase tracking-widest2 text-lm2-violet">
                  <Bi zh="你的三个关键词" en="Your Three Keywords" />
                </p>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {freePreview.keywords.map((k, i) => (
                    <div key={i} className="bg-lm2-card rounded-sm p-4 text-center backdrop-blur-xl">
                      <p className="font-display text-xl text-lm2-text">✨ {k.word}</p>
                      <p className="mt-1 text-xs text-lm2-text-dim">{k.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {facts?.humanDesign && (
          <div className="bg-void-deep mt-8 p-6 sm:p-8">
            <p className="font-display text-sm uppercase tracking-widest2 text-lm2-violet">
              <Bi zh="人类图 · 门" en="Human Design · Gates" />
            </p>
            <p className="mt-2 text-xs leading-6 text-lm2-text-dim">
              <Bi
                zh="太阳门是人类图里权重最高的单一信息（约占人格印记70%），已经用真实天文计算得出，下面列出的每一个门也是如此。完整的类型与内在权威解读，将在后续版本中加入。"
                en="The Sun gate is the single highest-weighted piece of information in Human Design (roughly 70% of the personality imprint), and it's computed from real astronomy — as is every gate listed below. Full Type and Authority readings will arrive in a future update."
              />
            </p>
            <HumanDesignChart hd={facts.humanDesign} />
          </div>
        )}

        <div className="mt-12 space-y-14">
          {sections.map((content, i) => {
            // 第13章（索引12）是手机号/车牌号的数字能量解读——只有当时真的没填
            // 手机号也没填车牌号，AI 才会写"未提供…"这段占位文字，这种情况下
            // 跳过；只要填了任意一项，就正常展示，是生命图谱里结合当下生活
            // 状态的一部分，不能弄丢。
            const isSkippedNumberSection = i === 12 && /未提供手机号或车牌号/.test(content);
            if (isSkippedNumberSection) return null;
            return (
            <div key={i} className="break-inside-avoid">
              <p className="font-display text-xs uppercase tracking-widest2 text-lm2-violet">
                {String(i + 1).padStart(2, "0")} · <Bi zh={SECTION_TITLES[i]?.zh ?? ""} en={SECTION_TITLES[i]?.en ?? ""} />
              </p>
              <div className="mt-3 whitespace-pre-line text-base leading-9 text-lm2-text-dim">{content}</div>
              {i === 1 && facts && <WuXingChart wx={facts.wuXingCount} />}
              {i === 2 && facts?.ziwei && <ZiweiGrid palaces={facts.ziwei.palaces} />}
              {i === 5 && facts && <DaYunTimeline startAge={facts.daYunStartAge} />}
              {i === 6 && freqScores && <FrequencyChart scores={freqScores} />}
              {i === 12 && numberEnergy.length > 0 && <NumberEnergyChart items={numberEnergy} />}
            </div>
            );
          })}
        </div>

        <p className="mt-16 text-center text-xs leading-6 text-lm2-text-dim/50 print:hidden">
          <Bi
            zh="这是一份自我探索与反思的参考，不是命运预言——生命的走向，始终由你自己选择。"
            en="This is a tool for self-exploration and reflection, not a prophecy — the direction of your life is always your own to choose."
          />
        </p>
        </div>
      </div>
    </div>
  );
}

// 五行分布图：横向条形图，五种元素各自的强度一目了然，配合第2章八字解读一起看
// 数字能量环形图——跟频率自测那组圆环用的是同一套视觉语言，总和灵动数
// 换算成 0-81 的进度画一圈发光的环，不是干巴巴的一段文字。
function NumberEnergyChart({ items }: { items: { label: string; total: number }[] }) {
  const colors = ["#F0C868", "#8EDBD2"];
  return (
    <div className="mt-5 grid grid-cols-2 gap-4 rounded-sm border border-lm2-text/10 bg-lm2-card p-5 backdrop-blur-xl">
      {items.map((it, idx) => {
        const norm = ((it.total - 1) % 30) + 1; // 跟 lib/number-energy-calc.ts 里的 normalize81 逻辑对齐
        const pct = (norm / 30) * 100;
        const color = colors[idx % colors.length];
        const r = 30, c = 2 * Math.PI * r;
        return (
          <div key={it.label} className="flex flex-col items-center">
            <svg viewBox="0 0 72 72" className="w-20" style={{ filter: `drop-shadow(0 0 8px ${color}70)` }}>
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
            <p className="mt-1 text-center text-[11px] text-lm2-text-dim">{it.label}</p>
          </div>
        );
      })}
    </div>
  );
}

// 人类图门位环——跟星盘用的是同一种"角度即位置"的画法：每颗星体按它
// 真实的黄道经度，摆在圆周上对应的角度，中心显示太阳门（意识/潜意识）
// 这个人类图里权重最高的信息，不再是一串纯文字列表。
function HumanDesignChart({ hd }: { hd: HumanDesignResult }) {
  const cx = 130, cy = 130, r = 96;
  const glyphs: Record<string, string> = {
    sun: "☉", earth: "⊕", moon: "☽", mercury: "☿", venus: "♀",
    mars: "♂", jupiter: "♃", saturn: "♄", uranus: "♅", neptune: "♆", pluto: "♇",
  };
  const colors = ["#F0C868", "#8EDBD2", "#D8B8FF", "#FF9FD6"];
  return (
    <div className="mt-5 flex flex-col items-center gap-5 rounded-sm border border-lm2-text/10 bg-lm2-card p-6 backdrop-blur-xl sm:flex-row sm:items-start">
      <svg viewBox="0 0 260 260" className="w-56 shrink-0">
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
      <div className="grid flex-1 grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-lm2-text-dim sm:grid-cols-3">
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
  // 五边雷达图——五行本来就是五个维度的平衡关系，用五边形的"形状"一眼
  // 就能看出是均衡还是偏科，比横条更直观，也不依赖认得汉字：外国用户
  // 看不懂"木火土金水"这几个字，但看得懂一个五边形是不是长歪了。
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
    <div className="mt-5 rounded-sm border border-lm2-text/10 bg-lm2-card p-5 backdrop-blur-xl">
      <p className="text-xs uppercase tracking-widest2 text-lm2-violet"><Bi zh="命局五行分布" en="Element Balance" /></p>
      <div className="mt-4 flex flex-col items-center gap-6 sm:flex-row sm:items-center">
        <svg viewBox={`0 0 ${RADAR_SIZE} ${RADAR_SIZE}`} className="h-36 w-36 shrink-0">
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
        <div className="w-full flex-1 space-y-3">
        {items.map((it, idx) => (
          <div key={it.label} className="flex items-center gap-3">
            <span className="w-10 shrink-0 font-display text-sm text-lm2-text">{it.label}</span>
            <div className="h-3 flex-1 overflow-hidden rounded-full bg-lm2-text/10">
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
            <span className="w-4 shrink-0 text-right text-xs text-lm2-text-dim">{it.v}</span>
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

// 频率自测图：三项分数用环形进度呈现，比纯数字更直观
function FrequencyChart({ scores }: { scores: { energy: number; clarity: number; alignment: number } }) {
  const items = [
    { label: "能量水平", en: "Energy", v: scores.energy, color: "#FF8FD1" },
    { label: "头脑清晰度", en: "Clarity", v: scores.clarity, color: "#5FE8FF" },
    { label: "内外对齐感", en: "Alignment", v: scores.alignment, color: "#FFCB61" },
  ];
  return (
    <div className="mt-5 grid grid-cols-3 gap-4 rounded-sm border border-lm2-text/10 bg-lm2-card p-5 backdrop-blur-xl">
      {items.map((it, idx) => {
        const pct = (it.v / 5) * 100;
        const r = 26, c = 2 * Math.PI * r;
        return (
          <div key={it.label} className="flex flex-col items-center">
            <svg viewBox="0 0 64 64" className="w-16" style={{ filter: `drop-shadow(0 0 6px ${it.color}70)` }}>
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
            <p className="mt-1 text-center text-[11px] text-lm2-text-dim">{it.label}</p>
          </div>
        );
      })}
    </div>
  );
}

// 紫微十二宫方形图：传统命盘本来就是这样按地支固定方位排布的——
// 地支顺时针从"巳"起手在左上角，寅丑子亥收在左下角，中间空出来放核心信息。
const ZIWEI_GRID_BRANCHES = [
  ["巳", "午", "未", "申"],
  ["辰", null, null, "酉"],
  ["卯", null, null, "戌"],
  ["寅", "丑", "子", "亥"],
];

function ZiweiGrid({
  palaces,
}: {
  palaces: { name: string; earthlyBranch: string; majorStars: { name: string; brightness: string }[]; isSoulPalace: boolean; isBodyPalace: boolean }[];
}) {
  const byBranch = new Map(palaces.map((p) => [p.earthlyBranch, p]));
  const auroraColors = ["#FF8FD1", "#FFCB61", "#7FE7C4", "#5FE8FF", "#C79CFF"];
  return (
    <div className="mt-5 rounded-sm border border-lm2-text/10 bg-lm2-card p-5 backdrop-blur-xl">
      <p className="text-xs uppercase tracking-widest2 text-lm2-violet"><Bi zh="紫微十二宫" en="The Twelve Ziwei Palaces" /></p>
      <div className="mt-4 grid grid-cols-4 gap-1.5">
        {ZIWEI_GRID_BRANCHES.flat().map((branch, i) => {
          if (branch === null) {
            // 中央2x2留白区域，只在第一个空格渲染一次、跨2x2
            if (i === 5) {
              return (
                <div key="center" className="col-span-2 row-span-2 flex flex-col items-center justify-center rounded-sm border border-lm2-violet/20 bg-lm2-violet/5">
                  <span className="lm2-ziwei-glow font-display text-lg text-lm2-violet">紫微</span>
                  <span className="mt-1 text-[9px] text-lm2-text-dim">Ziwei Doushu</span>
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
              className="flex min-h-[74px] flex-col justify-between rounded-sm border p-1.5"
              style={{
                borderColor: p?.isSoulPalace || p?.isBodyPalace ? color : "rgba(255,255,255,0.1)",
                background: p?.isSoulPalace ? `${color}18` : "transparent",
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-lm2-text-dim">{branch}</span>
                {(p?.isSoulPalace || p?.isBodyPalace) && (
                  <span className="text-[8px]" style={{ color }}>
                    {p?.isSoulPalace ? "命" : ""}{p?.isBodyPalace ? "身" : ""}
                  </span>
                )}
              </div>
              <p className="text-[10px] font-medium text-lm2-text">{p?.name ?? ""}</p>
              <p className="text-[8px] leading-tight text-lm2-text-dim">
                {p?.majorStars.map((s) => s.name).join("·") || "—"}
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

// 大运时间轴：从起运年龄开始，横向展开几个十年周期，比一段段文字更容易一眼看懂节奏
function DaYunTimeline({ startAge }: { startAge: number | null }) {
  const start = startAge ?? 8;
  const periods = Array.from({ length: 5 }).map((_, i) => start + i * 10);
  const auroraColors = ["#FF8FD1", "#FFCB61", "#7FE7C4", "#5FE8FF", "#C79CFF"];
  return (
    <div className="mt-5 rounded-sm border border-lm2-text/10 bg-lm2-card p-5 backdrop-blur-xl">
      <p className="text-xs uppercase tracking-widest2 text-lm2-violet"><Bi zh="大运时间轴" en="Major Luck Cycle Timeline" /></p>
      <div className="relative mt-6 pb-2">
        <div className="absolute left-0 right-0 top-3 h-0.5 bg-gradient-to-r from-lm2-rose via-lm2-amber via-lm2-mint to-lm2-violet opacity-40" />
        <div className="flex justify-between">
          {periods.map((age, i) => (
            <div key={age} className="flex flex-col items-center">
              <span
                className="lm2-dayun-dot h-3 w-3 rounded-full"
                style={{ background: auroraColors[i % auroraColors.length], animationDelay: `${i * 0.4}s` }}
              />
              <span className="mt-2 font-display text-xs text-lm2-text">{age}<Bi zh="岁" en="" /></span>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        .lm2-dayun-dot { animation: lm2-dayun-glow 2.4s ease-in-out infinite; }
        @keyframes lm2-dayun-glow { 0%,100% { transform: scale(1); filter: brightness(1); } 50% { transform: scale(1.3); filter: brightness(1.4); } }
      `}</style>
    </div>
  );
}
