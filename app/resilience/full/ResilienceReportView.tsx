"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLang } from "@/lib/useLang";
import Bi from "@/components/Bi";
import ShareButton from "@/components/ShareButton";
import { REVIEW_MODE } from "@/lib/reviewMode";
import WechatPayModal from "@/components/WechatPayModal";
import { getProduct } from "@/lib/plans";

// v236：11章节，跟 app/api/resilience/generate-full/route.ts 里
// buildChapters() 的顺序必须完全一致。
const SECTION_TITLES = [
  { titleZh: "① 生命韧性源点", titleEn: "① Where Your Resilience Begins" },
  { titleZh: "② 压力恢复能力", titleEn: "② Stress Recovery" },
  { titleZh: "③ 变化适应能力", titleEn: "③ Adaptability to Change" },
  { titleZh: "④ 危机反弹能力", titleEn: "④ Crisis Rebound" },
  { titleZh: "⑤ 长期坚持能力", titleEn: "⑤ Long-Term Persistence" },
  { titleZh: "⑥ 精神稳定结构", titleEn: "⑥ Emotional Stability Structure" },
  { titleZh: "⑦ 隐藏恢复模式", titleEn: "⑦ Hidden Recovery Pattern" },
  { titleZh: "⑧ 能量消耗地图", titleEn: "⑧ Energy Drain Map" },
  { titleZh: "⑨ 韧性进化路径", titleEn: "⑨ Resilience Growth Path" },
  { titleZh: "⑩ 灵犀场恢复实践", titleEn: "⑩ A Personal Recovery Practice" },
  { titleZh: "⑪ 生命韧性总结", titleEn: "⑪ Resilience Summary" },
];

export default function ResilienceReportView({ id }: { id: string }) {
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
        .from("resilience_submissions")
        .select("name")
        .eq("id", id)
        .single();
      if (submission) setName(submission.name || "");

      const currentLangEn = document.documentElement.classList.contains("lang-en");
      try {
        const res = await fetch("/api/resilience/generate-full", {
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
      // v290：换用档案式导出——每章独立一页、PDF 原图铺满整页、
      // 文字压在半透明玻璃面板上。之前是 html2canvas 把网页截图再切片，
      // 结果是图被裁、底色写死成墨绿（新素材是浅色，WPS 里打开发黑）、
      // 一页塞两三章显得内容单薄。
      const { exportArchivePdf } = await import("@/lib/pdf-export");
      await exportArchivePdf({
        chapters: sections.map((body, i) => ({ title: (langEn ? SECTION_TITLES[i]?.titleEn : SECTION_TITLES[i]?.titleZh) ?? `第 ${i + 1} 章`, body })),
        fileName: `灵犀生命韧性档案-${name || "report"}.pdf`,
        titleZh: `${name || "你的"}生命韧性档案`,
        titleEn: `${name || "Your"} Life Resilience Archive`,
        coverImage: "/images/resilience-full/page-0.png",
        bodyImages: [1, 2, 3, 4].map((n) => `/images/resilience-full/page-${n}.png`),
        endImage: "/images/resilience-full/page-5.png",
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
        <div className="lx-glass-resilience px-6 py-10">
          <div className="lx-checking-glow mx-auto h-14 w-14 rounded-full" />
          <p className="mt-6 text-sm leading-7 text-bone-dim">{t("场域正在展开你的完整生命韧性档案，第一次生成需要一点时间……", "The field is unfolding your full Resilience Archive — the first generation takes a little while…")}</p>
        </div>
        <style>{`
          .lx-checking-glow { background: radial-gradient(circle, rgba(126,232,196,0.5), transparent 70%); filter: blur(14px); animation: lx-checking-breathe 2.2s ease-in-out infinite; }
          @keyframes lx-checking-breathe { 0%,100% { opacity: 0.5; transform: scale(0.9); } 50% { opacity: 0.9; transform: scale(1.1); } }
          @media (prefers-reduced-motion: reduce) { .lx-checking-glow { animation: none !important; } }
        `}</style>
      </div>
    );
  }

  if (status === "locked") {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <p className="font-display text-2xl text-bone">🔒 <Bi zh="尚未解锁这份生命韧性档案" en="Not yet unlocked" /></p>
        <button
          onClick={unlock}
          className="mt-8 bg-lattice px-8 py-3 font-display text-sm uppercase tracking-widest2 text-void-deep transition hover:bg-amber"
        >
          <Bi zh={`解锁完整档案 · ¥${getProduct("resilience-report")?.priceRmb}`} en={`Unlock Full Archive · ¥${getProduct("resilience-report")?.priceRmb}`} />
        </button>
        {error && <p className="mt-4 text-xs text-rose">{error}</p>}
        {showWechatPay && (
          <WechatPayModal
            productId="resilience-report"
            submissionId={id}
            priceRmb={getProduct("resilience-report")?.priceRmb ?? 0}
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
      <div className="flex items-center justify-between lx-glass-resilience px-6 py-4">
        <p className="font-display text-sm uppercase tracking-widest2 text-emerald-300/80">
          <Bi zh="灵犀场 · 生命韧性档案" en="Lingxi Field · Life Resilience Archive" />
        </p>
        <button
          onClick={downloadPdf}
          disabled={downloading}
          className="flex shrink-0 items-center gap-2 rounded-sm border border-emerald-400/40 px-4 py-2 text-xs uppercase tracking-widest2 text-emerald-300 transition hover:border-emerald-300 hover:text-bone disabled:opacity-50"
        >
          {downloading ? <Bi zh="生成中…" en="Generating…" /> : <Bi zh="下载 PDF" en="Download PDF" />}
        </button>
      </div>

      <div
        ref={reportRef}
        className="mt-4 rounded-sm"
        style={{
          // 整份报告共用一张连续背景，fixed 让它在滚动时像一整张长卷
          // 在下面延展，而不是每章各自一张缩略图。
          backgroundImage: "url(/images/resilience-full/page-1.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}>
        <div
          className="relative overflow-hidden rounded-sm"
          style={{ aspectRatio: "3 / 4", backgroundImage: "url(/images/resilience-full/page-0.png)", backgroundSize: "cover", backgroundPosition: "center" }}
        >
          <div className="absolute inset-x-0 top-[30%] text-center">
            <h1 className="font-display text-2xl font-light text-white" style={{ textShadow: "0 2px 18px rgba(0,0,0,0.6)" }}>
              {name || t("你的", "Your")} <Bi zh="生命韧性档案" en="Resilience Archive" />
            </h1>
          </div>
        </div>

        {/* v291：每章原本各贴一张不同的 PDF 图 + 墨绿遮罩，
            结果整份报告读下来像一堆截图拼在一起，而且墨绿是旧素材
            时代的颜色，跟现在的浅色新素材冲突。
            改为：整份报告共用一张连续的背景（在外层容器上，
            background-attachment: fixed，滚动时像一整张长卷在下面延展），
            各章用玻璃面板浮在上面——面板之间因此有了统一感，
            背景也真正透得出来。 */}
        {/* v292：每章从"小灰框"改为整屏沉浸式画面。
            之前是一堆卡片堆叠，用户截图发微信时截到的是一个灰框，
            没有收藏欲。现在每章占满一屏、背景是完整的 PDF 原图、
            文字浮在玻璃面板上——用户随手一截就是一整张艺术画面。 */}
        {sections.map((content, i) => {
          const bg = `/images/resilience-full/page-${(i % 4) + 1}.png`;
          const posY = ["12%", "50%", "88%"][Math.floor(i / 4) % 3];
          const title = SECTION_TITLES[i] ?? { titleZh: `第${i + 1}段`, titleEn: `Section ${i + 1}` };
          return (
            <section
              key={i}
              className="relative mt-6 flex min-h-[92vh] items-center justify-center overflow-hidden rounded-sm"
              style={{
                backgroundImage: `url(${bg})`,
                backgroundSize: "cover",
                backgroundPosition: `center ${posY}`,
              }}
            >
              <div className="lx-glass-resilience mx-5 my-10 max-w-2xl px-8 py-10 sm:px-10 sm:py-12">
                <p className="font-display text-[11px] uppercase tracking-[0.34em] text-bone-mute">
                  LIFE RESILIENCE · {String(i + 1).padStart(2, "0")} / {String(sections.length).padStart(2, "0")}
                </p>
                <h3 className="mt-4 font-display text-xl font-light tracking-[0.08em] text-bone sm:text-2xl">
                  <Bi zh={title.titleZh} en={title.titleEn} />
                </h3>
                <div className="mt-3 h-px w-14 bg-amber/50" />
                <div className="mt-6 space-y-4 text-[15px] leading-[2] text-bone-dim">
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
          style={{ aspectRatio: "3 / 4", backgroundImage: "url(/images/resilience-full/page-5.png)", backgroundSize: "cover", backgroundPosition: "center" }}
        >
          <p className="font-display text-sm italic text-white" style={{ textShadow: "0 2px 14px rgba(0,0,0,0.7)" }}>
            <Bi zh="生命会弯曲，生命会成长，生命会继续展开。" en="Life bends. Life grows. Life continues." />
          </p>
        </div>
      </div>

      <div className="mt-6 text-center">
        <ShareButton
          text={t("我做了一份灵犀生命韧性档案，去看看你自己的：", "I got my Lingxi Life Resilience Archive — check out your own:")}
          url="https://lingxifield.com/resilience"
          label={{ zh: "分享这份结果", en: "Share this result" }}
        />
      </div>
    </div>
  );
}
