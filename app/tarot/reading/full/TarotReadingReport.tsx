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

const LAYER_TITLES = [
  { zh: "① 灵犀场连接声明", en: "① Field Connection Statement" },
  { zh: "② 潜意识镜像深度解析", en: "② Hidden Pattern Deep Dive" },
  { zh: "③ 当下共振深度解析", en: "③ Present Resonance Deep Dive" },
  { zh: "④ 未来展开深度解析", en: "④ Future Possibility Deep Dive" },
  { zh: "⑤ 三牌联合生命公式", en: "⑤ The Three-Card Life Formula" },
  { zh: "⑥ 财富创造地图", en: "⑥ Wealth Creation Map" },
  { zh: "⑦ 关系生命地图", en: "⑦ Relationship Life Map" },
  { zh: "⑧ 事业使命地图", en: "⑧ Career & Mission Map" },
  { zh: "⑨ 当前生命阶段", en: "⑨ Current Life Stage" },
  { zh: "⑩ 灵犀场成长路径", en: "⑩ Growth Path" },
  { zh: "⑪ 给未来自己的信", en: "⑪ A Letter to Your Future Self" },
  { zh: "⑫ 生命关键词", en: "⑫ Your Life Keywords" },
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
      try {
        const res = await fetch("/api/tarot/reading/generate-full", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, lang: currentLangEn ? "en" : "zh" }),
        });
        if (res.status === 402) {
          setStatus("locked");
          return;
        }
        const data = await res.json();
        if (!res.ok || !data.fullReport) {
          setStatus("error");
          setError((data.error || t("生成失败，请稍后再试。", "Generation failed — please try again.")) + (data.detail ? ` (${data.detail})` : ""));
          return;
        }
        setSections(
          (data.fullReport as string)
            .split(/===\s*\d+\s*===/)
            .map((s: string) => s.trim())
            .filter(Boolean)
        );
        if (Array.isArray(data.frequencyMap)) setFrequencyMap(data.frequencyMap);
        setStatus("ready");
      } catch {
        setStatus("error");
        setError(t("连接场域时出错，请稍后再试。", "Error connecting to the field — please try again."));
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

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
      const { exportGlassPdf } = await import("@/lib/pdf-export");
      const chapterTitles = [
        ...(frequencyMap.length > 0 ? [{ titleZh: "当前意识频率", titleEn: "Current Consciousness Frequency" }] : []),
        ...LAYER_TITLES.map((l) => ({ titleZh: l.zh, titleEn: l.en })),
      ];
      await exportGlassPdf({
        containerRef: reportRef.current,
        fileName: `灵犀量子塔罗-${name || "reading"}.pdf`,
        reportTitleZh: "你的灵犀量子生命镜像",
        reportTitleEn: "Your Lingxi Quantum Life Mirror",
        chapterTitles,
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
        <div className="rounded-sm border border-lattice/25 bg-void-deep px-6 py-10">
          <div className="lx-checking-glow mx-auto h-14 w-14 rounded-full" />
          <p className="mt-6 text-sm leading-7 text-bone-dim">{t("场域正在展开你的完整生命镜像档案，第一次生成需要一点时间……", "The field is unfolding your full consciousness blueprint — the first generation takes a little while…")}</p>
          <p className="mt-3 text-xs text-bone-dim/60">{t("若长时间没有反应，按 F5 刷新一下页面即可，不会影响已经生成的内容。", "If nothing happens for a while, press F5 to refresh — this won't affect anything already generated.")}</p>
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
            productName={{ zh: "灵犀量子塔罗 · 生命镜像档案", en: "Lingxi Quantum Tarot · Life Mirror" }}
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
    <div className="mx-auto max-w-2xl px-6 py-16">
      <div className="rounded-sm border border-white/10 bg-void-deep px-6 py-4 text-center">
        <p className="font-display text-sm uppercase tracking-widest2 text-lattice/80">
          <Bi zh="灵犀量子塔罗 · 生命镜像档案" en="Lingxi Quantum Tarot · Personal Consciousness Blueprint" />
        </p>
      </div>

      <div className="mt-4 flex justify-center">
        <button
          onClick={downloadPdf}
          disabled={downloading}
          className="rounded-sm border border-lattice/40 px-6 py-2 text-xs uppercase tracking-widest2 text-lattice transition hover:border-lattice hover:text-bone disabled:opacity-50"
        >
          {downloading ? <Bi zh="正在生成 PDF…" en="Generating PDF…" /> : <Bi zh="下载完整报告 PDF" en="Download Full Report PDF" />}
        </button>
      </div>

      <div ref={reportRef}>
      {/* 封面——LOGO+标题+已揭示的三张牌，就是封面本身，不需要另外
          设计一张专门的封面插画。这个区块本身是reportRef的第一个
          直接子元素，PDF导出会把它当成独立的一页/一个章节截图。 */}
      <div className="rounded-sm border border-lattice/25 bg-void-deep px-6 py-12 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/lingxifield-logo.png" alt="LINGXIFIELD" className="mx-auto h-16 w-16" />
        <p className="mt-4 font-display text-xs uppercase tracking-widest2 text-lattice/70">
          LINGXI QUANTUM TAROT
        </p>
        <h1 className="mt-4 font-display text-3xl font-light text-bone sm:text-4xl">
          <Bi zh="你的灵犀量子生命镜像" en="Your Lingxi Quantum Life Mirror" />
        </h1>
        <p className="mt-1 font-display text-sm text-lattice/80">
          <Bi zh="灵犀量子生命镜像档案" en="Personal Consciousness Blueprint Report" />
        </p>
        <p className="mt-4 text-sm leading-7 text-bone-dim">
          <Bi zh="三张牌不是答案，而是你与自己深层意识的一次对话。" en="These three cards are not an answer — they are a conversation with your own deeper consciousness." />
        </p>

        <div className="mx-auto mt-8 grid max-w-md grid-cols-3 gap-3">
          {cards.map((c, i) => (
            <div key={i} className="overflow-hidden rounded-sm border border-lattice/25 text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/images/tarot/${String(c.index).padStart(2, "0")}.jpg`} alt={c.nameZh} className="block aspect-[2/3] w-full object-cover" />
            </div>
          ))}
        </div>
        <div className="mx-auto mt-3 grid max-w-md grid-cols-3 gap-3 text-center">
          {cards.map((c, i) => (
            <div key={i}>
              <p className="text-[10px] uppercase tracking-widest2 text-amber/80">
                <Bi zh={positions[i].zh} en={positions[i].en} />
              </p>
              <p className="mt-1 text-xs text-bone">
                <Bi zh={c.nameZh} en={c.nameEn} />
              </p>
            </div>
          ))}
        </div>

        <p className="mt-8 text-xs text-bone-dim/60">
          {name ? `${name} · ` : ""}{new Date().toLocaleDateString(langEn ? "en-US" : "zh-CN")}
        </p>
        <p className="mt-1 text-xs text-bone-dim/60">lingxifield.com</p>
      </div>

      {frequencyMap.length > 0 && (
        <div className="mt-8 rounded-sm border border-white/10 bg-void-deep p-6">
          <p className="text-xs uppercase tracking-widest2 text-lattice/70">
            <Bi zh="当前意识频率" en="Current Consciousness Frequency" />
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

      {sections.map((content, i) => (
        <div key={i} className="mt-5 rounded-sm border border-white/10 bg-void-deep p-6">
          {LAYER_TITLES[i] && (
            <p className="mb-3 text-xs uppercase tracking-widest2 text-lattice/70">
              <Bi zh={LAYER_TITLES[i].zh} en={LAYER_TITLES[i].en} />
            </p>
          )}
          <p className="whitespace-pre-line text-base leading-9 text-bone-dim">{content}</p>
        </div>
      ))}
      </div>

      <div className="mt-6 flex flex-col items-center gap-3 rounded-sm border border-white/10 bg-void-deep px-6 py-4 text-center">
        <p className="text-xs text-bone-dim/60">
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
