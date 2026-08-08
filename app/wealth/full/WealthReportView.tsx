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
      // v300：统一改用档案式导出（原本只有生命韧性用了这套）。
      // 旧的 exportGlassPdf 是"把网页整段截图再按高度切片"，出来像
      // 网页截图；exportArchivePdf 是每章独立成页、PDF 原图整页铺满、
      // 文字压在半透明玻璃面板上，跟网页看到的是同一张脸。
      const { exportArchivePdf, ARCHIVE_THEMES } = await import("@/lib/pdf-export");
      await exportArchivePdf({
        chapters: sections.map((body, i) => ({
          title: (langEn ? SECTION_TITLES[i]?.titleEn : SECTION_TITLES[i]?.titleZh) ?? `第 ${i + 1} 章`,
          body,
        })),
        fileName: `灵犀财富创造地图-${name || "report"}.pdf`,
        titleZh: `${name || "你的"}财富创造地图`,
        titleEn: `${name || "Your"} Wealth Creation Map`,
        eyebrow: "WEALTH CREATION",
        theme: ARCHIVE_THEMES.wealth,
        coverImage: "/images/wealth-full/page-0.png",
        // 12 张素材：page-0 封面 / page-1..11 每章一张 / page-11 兼作尾页
        bodyImages: Array.from({ length: 11 }, (_, k) => `/images/wealth-full/page-${k + 1}.png`),
        endImage: "/images/wealth-full/page-11.png",
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
        <p className="font-display text-sm uppercase tracking-widest2 text-[#2E2742]">
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

        {/* v300：与生命韧性对齐——每章占满一屏、背景是完整的 PDF 原图、
            文字浮在浅色玻璃面板上。之前这里是深色遮罩小卡片
            （backgroundColor + rgba 深色渐变 + text-bone-dim 浅字），
            那是旧深色素材时代的写法；新素材是浅色晨雾水彩，深色遮罩
            会把画压死，而且跟下载下来的 PDF 完全是两种东西。 */}
        {sections.map((content, i) => {
          const bg = `/images/wealth-full/page-${Math.min(i + 1, 11)}.png`;
          const title = SECTION_TITLES[i] ?? { titleZh: `第${i + 1}段`, titleEn: `Section ${i + 1}` };
          return (
            <section
              key={i}
              className="relative mt-6 flex min-h-[92vh] items-center justify-center overflow-hidden rounded-sm"
              style={{ backgroundImage: `url(${bg})`, backgroundSize: "cover", backgroundPosition: "center" }}
            >
              <div className="lx-report-glass mx-5 my-10 max-w-2xl px-8 py-10 sm:px-10 sm:py-12">
                <p className="font-display text-[11px] uppercase tracking-[0.34em] text-[#8C7FA8]">
                  WEALTH CREATION · {String(i + 1).padStart(2, "0")} / {String(sections.length).padStart(2, "0")}
                </p>
                <h3 className="mt-4 font-display text-xl font-light tracking-[0.08em] text-[#3A2E52] sm:text-2xl">
                  <Bi zh={title.titleZh} en={title.titleEn} />
                </h3>
                <div className="mt-3 h-px w-14 bg-[#B9A6D6]" />
                <div className="mt-6 space-y-4 text-[15px] leading-[2] text-[#2E2742]">
                  {content.split("\n\n").filter(Boolean).map((para, k) => (
                    <p key={k}>{para}</p>
                  ))}
                </div>
              </div>
            </section>
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
