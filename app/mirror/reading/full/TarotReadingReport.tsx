"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLang } from "@/lib/useLang";
import Bi from "@/components/Bi";
import { TAROT_MAJOR_ARCANA, type TarotCard } from "@/lib/tarot-data";
import ShareButton from "@/components/ShareButton";
import { REVIEW_MODE } from "@/lib/reviewMode";
import WechatPayModal from "@/components/WechatPayModal";
import { getProduct } from "@/lib/plans";
import { stripRepeatedHeading } from "@/lib/text-clean";

// v237：12段合并成11段——财富创造地图+事业使命地图合并成"价值创造
// 地图"，三张牌（hidden/present/future）的具体解析内容完全没动。
const LAYER_TITLES = [
  { zh: "① 灵犀场连接声明", en: "① Field Connection Statement" },
  { zh: "② 潜意识镜像深度解析", en: "② Hidden Pattern Deep Dive" },
  { zh: "③ 当下共振深度解析", en: "③ Present Resonance Deep Dive" },
  { zh: "④ 未来展开深度解析", en: "④ Future Possibility Deep Dive" },
  { zh: "⑤ 三牌联合生命公式", en: "⑤ The Three-Card Life Formula" },
  { zh: "⑥ 价值创造地图", en: "⑥ Value Creation Map" },
  { zh: "⑦ 关系生命地图", en: "⑦ Relationship Life Map" },
  { zh: "⑧ 当前生命映射", en: "⑧ Current Life Mapping" },
  { zh: "⑨ 灵犀场实践", en: "⑨ A Personal Practice" },
  { zh: "⑩ 给未来自己的信", en: "⑩ A Letter to Your Future Self" },
  { zh: "⑪ 生命关键词", en: "⑪ Your Life Keywords" },
];

// v231：正文分组——按PDF设计文档的6页结构重新分组（v237更新为11段
// 后的新索引）：能量晶片展开（连接声明+三张牌解析）、意识波谱（联合公式+
// 财富+关系+事业）、量子洞察（生命阶段+成长路径），封印页（信+
// 关键词）单独处理。
const TAROT_PAGE_GROUPS = [
  { titleZh: "能量晶片展开", titleEn: "Energy Chip Unfolding", bg: "page-2", indices: [0, 1, 2, 3] },
  { titleZh: "意识波谱", titleEn: "Consciousness Spectrum", bg: "page-3", indices: [4, 5, 6] },
  { titleZh: "量子洞察", titleEn: "Quantum Insight", bg: "page-4", indices: [7, 8] },
];

type FrequencyItem = { key: string; zh: string; en: string; score: number };

export default function TarotReadingReport({ id }: { id: string }) {
  const langEn = useLang();
  const t = (zh: string, en: string) => (langEn ? en : zh);
  const [status, setStatus] = useState<"checking" | "locked" | "ready" | "error">("checking");
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [cards, setCards] = useState<TarotCard[]>([]);
  const [sections, setSections] = useState<string[]>([]);
  const [frequencyMap, setFrequencyMap] = useState<FrequencyItem[]>([]);
  const [unlocking, setUnlocking] = useState(false);
  const [showWechatPay, setShowWechatPay] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const positions = [
    { zh: "潜意识镜像", en: "Hidden Pattern" },
    { zh: "当下共振", en: "Present Resonance" },
    { zh: "未来展开", en: "Future Possibility" },
  ];

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: submission } = await supabase
        .from("tarot_reading_submissions")
        .select("name, hidden_index, present_index, future_index")
        .eq("id", id)
        .single();
      if (submission) {
        setName(submission.name || "");
        setCards([
          TAROT_MAJOR_ARCANA[submission.hidden_index],
          TAROT_MAJOR_ARCANA[submission.present_index],
          TAROT_MAJOR_ARCANA[submission.future_index],
        ]);
      }

      const currentLangEn = document.documentElement.classList.contains("lang-en");
      const fetchReport = (regenerate: boolean) =>
        fetch("/api/tarot/reading/generate-full", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, lang: currentLangEn ? "en" : "zh", regenerate }),
        });
      try {
        let res = await fetchReport(false);
        if (res.status === 402) {
          setStatus("locked");
          return;
        }
        let data = await res.json();
        if (!res.ok || !data.fullReport) {
          setStatus("error");
          setError(data.error || t("生成失败，请稍后再试。", "Generation failed — please try again."));
          return;
        }
        const parts = (data.fullReport as string)
          .replace(/<!--\s*classical-editorial:[^>]+-->/g, "")
          .split(/===\s*\d+\s*===/)
          .map((section: string) => section.trim())
          .filter(Boolean);
        if (parts.length !== LAYER_TITLES.length) {
          setStatus("error");
          setError(t("报告章节不完整，请稍后重新打开。", "The report is incomplete. Please reopen it shortly."));
          return;
        }
        setSections(parts);
        if (Array.isArray(data.frequencyMap)) setFrequencyMap(data.frequencyMap);
        setStatus("ready");
      } catch {
        setStatus("error");
        setError(t("连接场域时出错，请稍后再试。", "Error connecting to the field — please try again."));
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, langEn]);

  const unlock = () => {
    if (REVIEW_MODE) {
      setStatus("checking");
      window.location.reload();
      return;
    }
    setShowWechatPay(true);
  };

  const downloadPdf = async () => {
    if (!reportRef.current) return;
    setDownloading(true);
    try {
      // v300：改用档案式导出。之前用 exportGlassPdf（把网页整段截图
      // 再按高度切片），而网页这一版已经改成"整屏原图 + 浅色玻璃面板"，
      // 两边就对不上了——网页清透、PDF 还是网页截图的观感。
      // 这里按 11 个层级各自成章（不再按 3 个分组打包），每章一张专属
      // 素材，跟生命韧性/桃花/财富/潮汐走同一套排版。
      const { exportArchivePdf, ARCHIVE_THEMES } = await import("@/lib/pdf-export");
      await exportArchivePdf({
        chapters: sections
          .map((body, i) => ({
            title: (langEn ? LAYER_TITLES[i]?.en : LAYER_TITLES[i]?.zh) ?? (langEn ? `Chapter ${i + 1}` : `第 ${i + 1} 章`),
            body,
          }))
          .filter((c) => c.body && c.body.trim()),
        fileName: langEn ? `Lingxi-Quantum-Life-Mirror-${name || "reading"}.pdf` : `灵犀量子生命镜像-${name || "reading"}.pdf`,
        titleZh: "你的灵犀量子生命镜像",
        titleEn: "Your Lingxi Quantum Life Mirror",
        subjectName: name || "未署名",
        coverStatementZh: "三张牌非答案，乃你与自身深层意识的一次对话。",
        coverStatementEn: "Three cards are not an answer, but a dialogue with the deeper self.",
        archiveLabelZh: "灵犀量子生命镜像档案",
        language: langEn ? "en" : "zh",
        eyebrow: "QUANTUM LIFE MIRROR",
        theme: ARCHIVE_THEMES.tarot,
        coverImage: "/images/tarot-full/page-0.png",
        bodyImages: Array.from({ length: 11 }, (_, k) => `/images/tarot-full/page-${k + 1}.png`),
        endImage: "/images/tarot-full/page-11.png",
        featurePages: cards.map((card, i) => ({
          image: `/images/tarot/${String(card.index).padStart(2, "0")}.jpg`,
          title: langEn ? card.nameEn : card.nameZh,
          subtitle: langEn ? positions[i]?.en : positions[i]?.zh,
          eyebrow: `QUANTUM LIFE MIRROR · ${String(i + 1).padStart(2, "0")}`,
        })),
      });
    } catch (e) {
      console.error("PDF 生成失败:", e);
      alert(t("PDF 生成失败，请稍后再试，或改用浏览器打印功能另存为 PDF。", "PDF generation failed — please try again, or use your browser's print-to-PDF as a fallback."));
    } finally {
      setDownloading(false);
    }
  };

  if (status === "checking") {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <div className="lx-report-glass px-6 py-10">
          <div className="lx-checking-glow mx-auto h-14 w-14 rounded-full" />
          <p className="mt-6 text-sm leading-7 text-bone-dim">{t("场域正在编排你的完整生命镜像，三张牌与生命向量正在完成确定性组合……", "The field is composing your Life Mirror deterministically from three cards and your life vector…")}</p>
          <p className="mt-3 text-xs text-bone-soft">{t("每一章都在同步生成判断证据、反证问题与行动协议。", "Each chapter includes evidence, counterevidence, and an action protocol.")}</p>
        </div>
        <style>{`
          .lx-checking-glow { background: radial-gradient(circle, rgba(199,156,255,0.5), transparent 70%); filter: blur(14px); animation: lx-checking-breathe 2.2s ease-in-out infinite; }
          @keyframes lx-checking-breathe { 0%,100% { opacity: 0.5; transform: scale(0.9); } 50% { opacity: 0.9; transform: scale(1.1); } }
          @media (prefers-reduced-motion: reduce) { .lx-checking-glow { animation: none !important; } }
        `}</style>
      </div>
    );
  }

  if (status === "locked") {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <p className="font-display text-2xl text-bone">🔒 <Bi zh="尚未解锁这份三张牌阵深度解读" en="Not yet unlocked" /></p>
        <button
          onClick={unlock}
          disabled={unlocking}
          className="mt-8 bg-lattice px-8 py-3 font-display text-sm uppercase tracking-widest2 text-void-deep transition hover:bg-amber disabled:opacity-50"
        >
          <Bi zh={`开启完整生命镜像 · ¥${getProduct("tarot-reading")?.priceRmb}`} en={`Unlock the Full Life Mirror · ¥${getProduct("tarot-reading")?.priceRmb}`} />
        </button>
        {error && <p className="mt-4 text-xs text-rose">{error}</p>}
        {showWechatPay && (
          <WechatPayModal
            productId="tarot-reading"
            submissionId={id}
            priceRmb={getProduct("tarot-reading")?.priceRmb ?? 0}
            productName={{ zh: "灵犀量子生命镜像 · 完整档案", en: "Lingxi Quantum Life Mirror · Full Archive" }}
            onClose={() => setShowWechatPay(false)}
            onSuccess={() => window.location.reload()}
          />
        )}
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

  return (
    <div className="mx-auto max-w-4xl px-3 py-16 sm:px-6">
      <div className="flex items-center justify-between lx-report-glass px-6 py-4">
        <p className="font-display text-sm uppercase tracking-widest2 text-lattice">
          <Bi zh="灵犀量子生命镜像 · 完整档案" en="Lingxi Quantum Life Mirror · Personal Consciousness Blueprint" />
        </p>
        <button
          onClick={downloadPdf}
          disabled={downloading}
          className="flex shrink-0 items-center gap-2 rounded-sm border border-lattice/40 px-4 py-2 text-xs uppercase tracking-widest2 text-lattice transition hover:border-lattice hover:text-bone disabled:opacity-50"
        >
          {downloading ? <Bi zh="生成中…" en="Generating…" /> : <Bi zh="下载 PDF" en="Download PDF" />}
        </button>
      </div>

      <div ref={reportRef} className="lx-report-tone-light lx-theme-mirror">
      {/* 封面——LOGO+标题+已揭示的三张牌，就是封面本身，不需要另外
          设计一张专门的封面插画。这个区块本身是reportRef的第一个
          直接子元素，PDF导出会把它当成独立的一页/一个章节截图。 */}
      <div className="lx-publication-page lx-publication-cover lx-mirror-cover relative flex items-center justify-center overflow-hidden rounded-sm border border-lattice/25 px-6 py-12 text-center" style={{ backgroundColor: "#181030", backgroundImage: "url(/images/tarot-full/page-0.png)", backgroundSize: "cover", backgroundPosition: "center" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/lingxifield-logo.png" alt="LINGXIFIELD" className="mx-auto h-16 w-16" />
        <p className="mt-4 font-display text-xs uppercase tracking-widest2 text-lattice">
          LINGXI QUANTUM TAROT
        </p>
        <h1 className="mt-4 font-display text-3xl font-light text-bone sm:text-4xl">
          <Bi zh="你的灵犀量子生命镜像" en="Your Lingxi Quantum Life Mirror" />
        </h1>
        <p className="mt-1 font-display text-sm text-lattice">
          <Bi zh="灵犀量子生命镜像档案" en="Personal Consciousness Blueprint Report" />
        </p>
        <p className="mt-4 text-sm leading-7 text-bone-dim">
          <Bi zh="三张牌不是答案，而是你与自己深层意识的一次对话。" en="These three cards are not an answer — they are a conversation with your own deeper consciousness." />
        </p>


        <p className="mt-8 text-xs text-bone-soft">
          {name ? `${name} · ` : ""}{new Date().toLocaleDateString(langEn ? "en-US" : "zh-CN")}
        </p>
        <p className="mt-1 text-xs text-bone-soft">lingxifield.com</p>
      </div>

      {cards.map((card, i) => (
        <section
          key={`${card.index}-${i}`}
          className="lx-publication-page lx-publication-card-page relative mt-5 flex items-center justify-center overflow-hidden rounded-sm p-6 sm:p-10"
          style={{ backgroundImage: `url(/images/tarot-full/page-${(i % 3) + 1}.png)`, backgroundSize: "cover", backgroundPosition: "center" }}
        >
          <div className="lx-report-glass lx-report-glass-readable flex w-full flex-col items-center px-7 py-10 text-center sm:px-12">
            <p className="text-xs uppercase tracking-widest2 text-lattice"><Bi zh={positions[i].zh} en={positions[i].en} /></p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/images/tarot/${String(card.index).padStart(2, "0")}.jpg`} alt={langEn ? card.nameEn : card.nameZh} className="lx-publication-card-art mt-6" />
            <h2 className="mt-7 font-display text-3xl font-light sm:text-4xl"><Bi zh={card.nameZh} en={card.nameEn} /></h2>
            <p className="mt-3 text-sm leading-7 text-bone-dim"><Bi zh="让这一张牌单独停驻，作为此刻与你对话的意识镜面。" en="Let this card stand alone as the consciousness mirror for this moment." /></p>
          </div>
        </section>
      ))}

      {frequencyMap.length > 0 && (
        <div
          className="lx-publication-page lx-publication-cover lx-mirror-cover relative mt-8 flex items-center justify-center overflow-hidden rounded-sm border border-white/10 p-6"
          style={{ backgroundColor: "#181030", backgroundImage: "url(/images/tarot-full/page-1.png)", backgroundSize: "cover", backgroundPosition: "center" }}
        >
          <p className="text-center text-xs uppercase tracking-widest2 text-lattice/90">
            <Bi zh="量子意识矩阵 · Quantum Consciousness Matrix" en="Quantum Consciousness Matrix" />
          </p>
          <div className="mt-4 space-y-3">
            {frequencyMap.map((f) => (
              <div key={f.key}>
                <div className="flex items-center justify-between text-xs text-bone-dim">
                  <span><Bi zh={f.zh} en={f.en} /></span>
                  <span className="text-amber">{f.score}%</span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-lattice to-amber" style={{ width: `${f.score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {TAROT_PAGE_GROUPS.map((group, gi) => (
        <div
          key={gi}
          className="lx-publication-page relative mt-5 flex items-center justify-center overflow-hidden rounded-sm"
          style={{ backgroundImage: `url(/images/tarot-full/${group.bg}.png)`, backgroundSize: "cover", backgroundPosition: "center" }}
        >
          <div className="lx-report-glass lx-report-glass-readable my-10 px-8 py-10 sm:px-10 sm:py-12">
          <p className="mb-4 text-center text-xs uppercase tracking-widest2 text-lattice/90">
            <Bi zh={group.titleZh} en={group.titleEn} />
          </p>
          {group.indices.map((idx) => (
            sections[idx] ? (
              <div key={idx} className={idx !== group.indices[0] ? "mt-6 border-t border-white/10 pt-5" : ""}>
                {LAYER_TITLES[idx] && (
                  <p className="mb-3 text-xs uppercase tracking-widest2 text-lattice">
                    <Bi zh={LAYER_TITLES[idx].zh} en={LAYER_TITLES[idx].en} />
                  </p>
                )}
                <p className="whitespace-pre-line text-base leading-9 text-bone-dim">{stripRepeatedHeading(sections[idx], langEn ? LAYER_TITLES[idx]?.en ?? "" : LAYER_TITLES[idx]?.zh ?? "")}</p>
              </div>
            ) : null
          ))}
          </div>
        </div>
      ))}

      {(sections[9] || sections[10]) && (
        <div
          className="lx-publication-page relative mt-5 flex items-center justify-center overflow-hidden rounded-sm"
          style={{ backgroundImage: "url(/images/tarot-full/page-5.png)", backgroundSize: "cover", backgroundPosition: "center" }}
        >
          <div className="lx-report-glass lx-report-glass-readable my-10 px-8 py-10 sm:px-10 sm:py-12">
          {[9, 10].map((idx) =>
            sections[idx] ? (
              <div key={idx} className={idx !== 9 ? "mt-6 border-t border-white/10 pt-5" : ""}>
                {LAYER_TITLES[idx] && (
                  <p className="mb-3 text-xs uppercase tracking-widest2 text-lattice">
                    <Bi zh={LAYER_TITLES[idx].zh} en={LAYER_TITLES[idx].en} />
                  </p>
                )}
                <p className="whitespace-pre-line text-base leading-9 text-bone-dim">{stripRepeatedHeading(sections[idx], langEn ? LAYER_TITLES[idx]?.en ?? "" : LAYER_TITLES[idx]?.zh ?? "")}</p>
              </div>
            ) : null
          )}
          <div className="mt-6 border-t border-lattice/25 pt-5 text-center">
            <p className="font-display text-sm italic text-lattice/85">
              <Bi zh="每一种可能，都等待意识选择。" en="Every possibility exists until consciousness chooses." />
            </p>
          </div>
          </div>
        </div>
      )}
      </div>

      <div className="mt-6 flex flex-col items-center gap-3 lx-report-glass px-6 py-4 text-center">
        <p className="text-xs text-bone-soft">
          <Bi zh="这是一份自我探索与反思的参考，不是命运预言。" en="This is a reference for self-reflection, not a prophecy." />
        </p>
        <ShareButton
          text={t("我做了一份灵犀量子生命镜像，去看看你自己的：", "I got my Lingxi Quantum Life Mirror — check out your own:")}
          url="https://lingxifield.com/tarot"
          label={{ zh: "分享这份报告", en: "Share this reading" }}
        />
      </div>
    </div>
  );
}
