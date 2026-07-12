"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import Bi from "@/components/Bi";

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
  const reportRef = useRef<HTMLDivElement>(null);
  const [sections, setSections] = useState<string[]>([]);
  const [coreTypeName, setCoreTypeName] = useState("");
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
        .select("core_type_name")
        .eq("id", id)
        .single();
      if (submission?.core_type_name) setCoreTypeName(submission.core_type_name);

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
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);
      const canvas = await html2canvas(reportRef.current, {
        backgroundColor: "#1c1830",
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
    }
  };

  return (
    <div className="px-6 py-20 print:py-6">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between print:hidden">
          <p className="font-display text-sm uppercase tracking-widest2 text-lm2-violet">
            🌌 <Bi zh="完整生命频率图谱" en="Your Full Life Frequency Map" />
          </p>
          <button
            onClick={downloadPdf}
            disabled={downloading}
            className="rounded-sm border border-lm2-text/15 px-4 py-2 text-xs uppercase tracking-widest2 text-lm2-text-dim transition hover:border-lm2-violet hover:text-lm2-text disabled:opacity-50"
          >
            {downloading ? <Bi zh="正在生成 PDF…" en="Generating PDF…" /> : <Bi zh="下载 PDF" en="Download PDF" />}
          </button>
        </div>
        <div ref={reportRef} className="bg-lm2-bg px-1 py-4">
        <h1 className="mt-4 font-display text-3xl font-light text-lm2-text">{coreTypeName}</h1>

        <div className="mt-12 space-y-14">
          {sections.map((content, i) => (
            <div key={i} className="break-inside-avoid">
              <p className="font-display text-xs uppercase tracking-widest2 text-lm2-violet">
                {String(i + 1).padStart(2, "0")} · <Bi zh={SECTION_TITLES[i]?.zh ?? ""} en={SECTION_TITLES[i]?.en ?? ""} />
              </p>
              <div className="mt-3 whitespace-pre-line text-base leading-9 text-lm2-text-dim">{content}</div>
            </div>
          ))}
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
