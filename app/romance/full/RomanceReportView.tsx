"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLang } from "@/lib/useLang";
import Bi from "@/components/Bi";
import ShareButton from "@/components/ShareButton";
import { REVIEW_MODE } from "@/lib/reviewMode";
import WechatPayModal from "@/components/WechatPayModal";
import { getProduct } from "@/lib/plans";

// v236：11章节，跟 app/api/romance/generate-full/route.ts 里
// buildChapters() 的顺序必须完全一致。
const SECTION_TITLES = [
  { titleZh: "① 桃花磁场源点", titleEn: "① Where Your Field Begins" },
  { titleZh: "② 吸引力类型", titleEn: "② Attraction Type" },
  { titleZh: "③ 情感表达模式", titleEn: "③ Emotional Expression Pattern" },
  { titleZh: "④ 关系需求地图", titleEn: "④ Relationship Needs Map" },
  { titleZh: "⑤ 隐藏魅力节点", titleEn: "⑤ Hidden Charm Point" },
  { titleZh: "⑥ 关系互动模式", titleEn: "⑥ Relationship Interaction Pattern" },
  { titleZh: "⑦ 吸引力成长方向", titleEn: "⑦ Attraction Growth Direction" },
  { titleZh: "⑧ 情感阻碍地图", titleEn: "⑧ Emotional Obstacle Map" },
  { titleZh: "⑨ 理想连接模式", titleEn: "⑨ Ideal Connection Style" },
  { titleZh: "⑩ 桃花磁场故事", titleEn: "⑩ A Symbolic Story" },
  { titleZh: "⑪ 桃花磁场总结", titleEn: "⑪ Field Summary" },
];

export default function RomanceReportView({ id }: { id: string }) {
  const langEn = useLang();
  const t = (zh: string, en: string) => (langEn ? en : zh);
  const [status, setStatus] = useState<"checking" | "locked" | "ready" | "error">("checking");
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [sections, setSections] = useState<string[]>([]);
  const [showWechatPay, setShowWechatPay] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: submission } = await supabase
        .from("romance_submissions")
        .select("name")
        .eq("id", id)
        .single();
      if (submission) setName(submission.name || "");

      const currentLangEn = document.documentElement.classList.contains("lang-en");
      try {
        const res = await fetch("/api/romance/generate-full", {
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
          setError(data.error || t("生成失败，请稍后再试。", "Generation failed — please try again."));
          return;
        }
        setSections((data.fullReport as string).split("===SECTION===").map((s) => s.trim()).filter(Boolean));
        setStatus("ready");
      } catch (e) {
        console.error("[report view] 请求失败:", e);
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
      await exportGlassPdf({
        containerRef: reportRef.current,
        fileName: `灵犀桃花磁场档案-${name || "report"}.pdf`,
        reportTitleZh: `${name || "你的"}桃花磁场档案`,
        reportTitleEn: `${name || "Your"} Romance Magnetism Archive`,
        chapterTitles: SECTION_TITLES,
        bgColorRgb: [44, 20, 32],
        bgColorHex: "#2c1420",
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
        <div className="lx-pdf-romance px-6 py-10">
          <div className="lx-checking-glow mx-auto h-14 w-14 rounded-full" />
          <p className="mt-6 text-sm leading-7 text-bone-dim">{t("场域正在展开你的完整桃花磁场档案，第一次生成需要一点时间……", "The field is unfolding your full Resilience Archive — the first generation takes a little while…")}</p>
        </div>
        <style>{`
          .lx-checking-glow { background: radial-gradient(circle, rgba(242,145,176,0.5), transparent 70%); filter: blur(14px); animation: lx-checking-breathe 2.2s ease-in-out infinite; }
          @keyframes lx-checking-breathe { 0%,100% { opacity: 0.5; transform: scale(0.9); } 50% { opacity: 0.9; transform: scale(1.1); } }
          @media (prefers-reduced-motion: reduce) { .lx-checking-glow { animation: none !important; } }
        `}</style>
      </div>
    );
  }

  if (status === "locked") {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <p className="font-display text-2xl text-bone">🔒 <Bi zh="尚未解锁这份桃花磁场档案" en="Not yet unlocked" /></p>
        <button
          onClick={unlock}
          className="mt-8 bg-lattice px-8 py-3 font-display text-sm uppercase tracking-widest2 text-void-deep transition hover:bg-amber"
        >
          <Bi zh={`解锁完整档案 · ¥${getProduct("romance-report")?.priceRmb}`} en={`Unlock Full Archive · ¥${getProduct("romance-report")?.priceRmb}`} />
        </button>
        {error && <p className="mt-4 text-xs text-rose">{error}</p>}
        {showWechatPay && (
          <WechatPayModal
            productId="romance-report"
            submissionId={id}
            priceRmb={getProduct("romance-report")?.priceRmb ?? 0}
            productName={{ zh: "生命韧性指数 · 完整档案", en: "Life Resilience Index · Full Archive" }}
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
      <div className="flex items-center justify-between lx-pdf-romance px-6 py-4">
        <p className="font-display text-sm uppercase tracking-widest2 text-rose/80">
          <Bi zh="灵犀场 · 桃花磁场档案" en="Lingxi Field · Romance Magnetism Archive" />
        </p>
        <button
          onClick={downloadPdf}
          disabled={downloading}
          className="flex shrink-0 items-center gap-2 rounded-sm border border-rose/40 px-4 py-2 text-xs uppercase tracking-widest2 text-rose transition hover:border-rose hover:text-bone disabled:opacity-50"
        >
          {downloading ? <Bi zh="生成中…" en="Generating…" /> : <Bi zh="下载 PDF" en="Download PDF" />}
        </button>
      </div>

      <div ref={reportRef} className="mt-4">
        <div
          className="relative overflow-hidden rounded-sm"
          style={{ aspectRatio: "3 / 4", backgroundImage: "url(/images/romance-full/page-0.jpg)", backgroundSize: "cover", backgroundPosition: "center" }}
        >
          <div className="absolute inset-x-0 top-[30%] text-center">
            <h1 className="font-display text-2xl font-light text-white" style={{ textShadow: "0 2px 18px rgba(0,0,0,0.6)" }}>
              {name || t("你的", "Your")} <Bi zh="桃花磁场档案" en="Resilience Archive" />
            </h1>
          </div>
        </div>

        {sections.map((content, i) => {
          const bg = `/images/romance-full/page-${(i % 4) + 1}.jpg`;
          const title = SECTION_TITLES[i] ?? { titleZh: `第${i + 1}段`, titleEn: `Section ${i + 1}` };
          return (
            <div
              key={i}
              className="relative mt-4 overflow-hidden rounded-sm"
              style={{ backgroundColor: "#2c1420", backgroundImage: `linear-gradient(rgba(44,20,32,0.55), rgba(44,20,32,0.55)), url(${bg})`, backgroundSize: "cover", backgroundPosition: "center" }}
            >
              <div className="p-8">
                <p className="font-display text-sm uppercase tracking-widest2 text-rose/90">
                  <Bi zh={title.titleZh} en={title.titleEn} />
                </p>
                <p className="mt-4 whitespace-pre-line text-base leading-9 text-bone-dim">{content}</p>
              </div>
            </div>
          );
        })}

        <div
          className="relative mt-4 flex items-end justify-center overflow-hidden rounded-sm p-8"
          style={{ aspectRatio: "3 / 4", backgroundImage: "url(/images/romance-full/page-5.jpg)", backgroundSize: "cover", backgroundPosition: "center" }}
        >
          <p className="font-display text-sm italic text-white" style={{ textShadow: "0 2px 14px rgba(0,0,0,0.7)" }}>
            <Bi zh="你的生命场，自然绽放。" en="Your field blooms naturally." />
          </p>
        </div>
      </div>

      <div className="mt-6 text-center">
        <ShareButton
          text={t("我做了一份灵犀桃花磁场档案，去看看你自己的：", "I got my Lingxi Romance Magnetism Archive — check out your own:")}
          url="https://lingxifield.com/romance"
          label={{ zh: "分享这份结果", en: "Share this result" }}
        />
      </div>
    </div>
  );
}
