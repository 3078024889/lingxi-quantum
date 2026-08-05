"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLang } from "@/lib/useLang";
import Bi from "@/components/Bi";
import ShareButton from "@/components/ShareButton";
import { REVIEW_MODE } from "@/lib/reviewMode";
import WechatPayModal from "@/components/WechatPayModal";
import { getProduct } from "@/lib/plans";

// v297修复：这份数组之前是从 resilience 组件直接复制过来的，
// 12 条韧性主题标题，跟 app/api/wealth/generate-full/route.ts 里
// buildChapters() 实际返回的 11 条财富主题章节完全对不上——用户看到
// 的每一章标题都是错的（比如财富报告第一章内容是"财富创造源点"，
// 标题却显示"① 生命韧性源点"）。现在改成跟后端 buildChapters()
// 顺序、数量完全一致的 11 条财富主题标题，且财富后端没有像
// resilience 那样在最前面插入一个额外的总览段落，所以这里不加
// 序号前缀的 0 号项。
const SECTION_TITLES = [
  { titleZh: "① 财富创造源点", titleEn: "① Where Your Creation Begins" },
  { titleZh: "② 天赋结构地图", titleEn: "② Talent Structure Map" },
  { titleZh: "③ 价值表达方式", titleEn: "③ How Value Gets Expressed" },
  { titleZh: "④ 财富流动模式", titleEn: "④ Value Flow Pattern" },
  { titleZh: "⑤ 资源连接方式", titleEn: "⑤ Resource Connection Style" },
  { titleZh: "⑥ 创造阻碍模式", titleEn: "⑥ Creative Obstacle Pattern" },
  { titleZh: "⑦ 长期复利结构", titleEn: "⑦ Long-Term Compounding Structure" },
  { titleZh: "⑧ 合作与共创潜力", titleEn: "⑧ Collaboration Potential" },
  { titleZh: "⑨ 个人价值品牌", titleEn: "⑨ Personal Value Brand" },
  { titleZh: "⑩ 财富进化路径", titleEn: "⑩ Wealth Evolution Path" },
  { titleZh: "⑪ 财富创造总结", titleEn: "⑪ Wealth Creation Summary" },
];

export default function WealthReportView({ id }: { id: string }) {
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
        .from("wealth_submissions")
        .select("name")
        .eq("id", id)
        .single();
      if (submission) setName(submission.name || "");

      const currentLangEn = document.documentElement.classList.contains("lang-en");
      try {
        const res = await fetch("/api/wealth/generate-full", {
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
        fileName: `灵犀财富创造档案-${name || "report"}.pdf`,
        reportTitleZh: `${name || "你的"}财富创造档案`,
        reportTitleEn: `${name || "Your"} Wealth Creation Archive`,
        chapterTitles: SECTION_TITLES,
        bgColorRgb: [246, 244, 240],
        bgColorHex: "#F6F4F0",
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
          <p className="mt-6 text-sm leading-7 text-bone-dim">{t("场域正在展开你的完整财富创造地图，第一次生成需要一点时间……", "The field is unfolding your full Wealth Creation Archive — the first generation takes a little while…")}</p>
        </div>
        <style>{`
          .lx-checking-glow { background: radial-gradient(circle, rgba(232,183,101,0.5), transparent 70%); filter: blur(14px); animation: lx-checking-breathe 2.2s ease-in-out infinite; }
          @keyframes lx-checking-breathe { 0%,100% { opacity: 0.5; transform: scale(0.9); } 50% { opacity: 0.9; transform: scale(1.1); } }
          @media (prefers-reduced-motion: reduce) { .lx-checking-glow { animation: none !important; } }
        `}</style>
      </div>
    );
  }

  if (status === "locked") {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <p className="font-display text-2xl text-bone">🔒 <Bi zh="尚未解锁这份财富创造地图" en="Not yet unlocked" /></p>
        <button
          onClick={unlock}
          className="mt-8 bg-lattice px-8 py-3 font-display text-sm uppercase tracking-widest2 text-void-deep transition hover:bg-amber"
        >
          <Bi zh={`解锁完整档案 · ¥${getProduct("wealth-report")?.priceRmb}`} en={`Unlock Full Archive · ¥${getProduct("wealth-report")?.priceRmb}`} />
        </button>
        {error && <p className="mt-4 text-xs text-rose">{error}</p>}
        {showWechatPay && (
          <WechatPayModal
            productId="wealth-report"
            submissionId={id}
            priceRmb={getProduct("wealth-report")?.priceRmb ?? 0}
            productName={{ zh: "财富创造地图 · 完整档案", en: "Wealth Creation Map · Full Archive" }}
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
      <div className="flex items-center justify-between lx-report-glass px-6 py-4">
        <p className="font-display text-sm uppercase tracking-widest2 text-amber/80">
          <Bi zh="灵犀场 · 财富创造地图" en="Lingxi Field · Wealth Creation Map" />
        </p>
        <button
          onClick={downloadPdf}
          disabled={downloading}
          className="flex shrink-0 items-center gap-2 rounded-sm border border-amber/40 px-4 py-2 text-xs uppercase tracking-widest2 text-amber transition hover:border-amber hover:text-bone disabled:opacity-50"
        >
          {downloading ? <Bi zh="生成中…" en="Generating…" /> : <Bi zh="下载 PDF" en="Download PDF" />}
        </button>
      </div>

      <div ref={reportRef} className="mt-4">
        <div
          className="relative overflow-hidden rounded-sm"
          style={{ aspectRatio: "3 / 4", backgroundImage: "url(/images/wealth-full/page-0.png)", backgroundSize: "cover", backgroundPosition: "center" }}
        >
          <div className="absolute inset-x-0 top-[30%] text-center">
            <h1 className="font-display text-2xl font-light text-[#3A2E52]" style={{ textShadow: "0 2px 20px rgba(255,255,255,0.85), 0 1px 2px rgba(255,255,255,0.9)" }}>
              {name || t("你的", "Your")} <Bi zh="财富创造地图" en="Wealth Creation Map" />
            </h1>
          </div>
        </div>

        {sections.map((content, i) => {
          const bg = `/images/wealth-full/page-${(i % 4) + 1}.png`;
          const title = SECTION_TITLES[i] ?? { titleZh: `第${i + 1}段`, titleEn: `Section ${i + 1}` };
          return (
            <div
              key={i}
              className="relative mt-4 overflow-hidden rounded-sm"
              style={{ backgroundColor: "#1a2038", backgroundImage: `linear-gradient(rgba(30,34,64,0.52), rgba(30,34,64,0.52)), url(${bg})`, backgroundSize: "cover", backgroundPosition: "center" }}
            >
              <div className="p-8">
                <p className="font-display text-sm uppercase tracking-widest2 text-amber/90">
                  <Bi zh={title.titleZh} en={title.titleEn} />
                </p>
                <p className="mt-4 whitespace-pre-line text-base leading-9 text-bone-dim">{content}</p>
              </div>
            </div>
          );
        })}

        <div
          className="relative mt-4 flex items-end justify-center overflow-hidden rounded-sm p-8"
          style={{ aspectRatio: "3 / 4", backgroundImage: "url(/images/wealth-full/page-11.png)", backgroundSize: "cover", backgroundPosition: "center" }}
        >
          <p className="font-display text-sm italic text-[#2E2742]" style={{ textShadow: "0 2px 16px rgba(255,255,255,0.85), 0 1px 2px rgba(255,255,255,0.9)" }}>
            <Bi zh="价值不是被找到的，是被创造出来的。" en="Value isn't found. It's created." />
          </p>
        </div>
      </div>

      <div className="mt-6 text-center">
        <ShareButton
          text={t("我做了一份灵犀财富创造地图，去看看你自己的：", "I got my Lingxi Wealth Creation Map — check out your own:")}
          url="https://lingxifield.com/wealth"
          label={{ zh: "分享这份结果", en: "Share this result" }}
        />
      </div>
    </div>
  );
}
