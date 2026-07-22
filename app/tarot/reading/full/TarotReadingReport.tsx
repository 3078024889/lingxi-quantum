"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLang } from "@/lib/useLang";
import Bi from "@/components/Bi";
import { TAROT_MAJOR_ARCANA, type TarotCard } from "@/lib/tarot-data";

const LAYER_TITLES = [
  { zh: "① 隐藏模式", en: "① Hidden Pattern" },
  { zh: "② 当下共振", en: "② Present Resonance" },
  { zh: "③ 未来方向", en: "③ Future Direction" },
  { zh: "④ 三牌合参", en: "④ Reading the Three Together" },
];

export default function TarotReadingReport({ id }: { id: string }) {
  const langEn = useLang();
  const t = (zh: string, en: string) => (langEn ? en : zh);
  const [status, setStatus] = useState<"checking" | "locked" | "ready" | "error">("checking");
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [cards, setCards] = useState<TarotCard[]>([]);
  const [sections, setSections] = useState<string[]>([]);
  const [unlocking, setUnlocking] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const positions = [
    { zh: "隐藏模式", en: "Hidden Pattern" },
    { zh: "当下共振", en: "Present Resonance" },
    { zh: "未来方向", en: "Future Direction" },
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
          setError(data.error || t("生成失败，请稍后再试。", "Generation failed — please try again."));
          return;
        }
        setSections(
          (data.fullReport as string)
            .split(/===\s*\d+\s*===/)
            .map((s: string) => s.trim())
            .filter(Boolean)
        );
        setStatus("ready");
      } catch {
        setStatus("error");
        setError(t("连接场域时出错，请稍后再试。", "Error connecting to the field — please try again."));
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const unlock = async () => {
    setUnlocking(true);
    try {
      const res = await fetch("/api/pay/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: "tarot-reading", submissionId: id, returnPath: `/tarot/reading/full?id=${id}` }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError((data.error || t("下单失败，请稍后再试。", "Order failed — please try again.")) + (data.detail ? ` (${data.detail})` : ""));
        setUnlocking(false);
      }
    } catch {
      setError(t("连接场域时出错，请稍后再试。", "Error connecting to the field — please try again."));
      setUnlocking(false);
    }
  };

  const downloadPdf = async () => {
    if (!reportRef.current) return;
    setDownloading(true);
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);
      const container = reportRef.current;
      const chapters = Array.from(container.children) as HTMLElement[];
      const PRINT_BG = "#0d0d1a";

      const pdf = new jsPDF({ unit: "pt", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const fillPageBackground = () => {
        pdf.setFillColor(13, 13, 26);
        pdf.rect(0, 0, pageWidth, pageHeight, "F");
      };
      fillPageBackground();

      let cursorY = 0;
      let placedAnything = false;

      for (const chapter of chapters) {
        if (!chapter || chapter.offsetHeight < 2) continue;
        const canvas = await html2canvas(chapter, { backgroundColor: PRINT_BG, scale: 2, useCORS: true });
        const imgData = canvas.toDataURL("image/jpeg", 0.92);
        const imgWidth = pageWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        if (imgHeight > pageHeight) {
          if (placedAnything) {
            pdf.addPage();
            fillPageBackground();
            cursorY = 0;
          }
          let heightLeft = imgHeight;
          let position = 0;
          pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
          while (heightLeft > 10) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            fillPageBackground();
            pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
          }
          cursorY = imgHeight % pageHeight;
          placedAnything = true;
          continue;
        }

        if (placedAnything && cursorY + imgHeight > pageHeight) {
          pdf.addPage();
          fillPageBackground();
          cursorY = 0;
        }
        pdf.addImage(imgData, "JPEG", 0, cursorY, imgWidth, imgHeight);
        cursorY += imgHeight;
        placedAnything = true;
      }

      pdf.save(`灵犀量子塔罗-${name || "reading"}.pdf`);
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
        <p className="text-sm text-bone-dim">{t("正在读取你的三张牌……", "Reading your three cards…")}</p>
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
          {unlocking ? <Bi zh="正在跳转…" en="Redirecting…" /> : <Bi zh="解锁三张牌阵深度解读 · $9.9" en="Unlock the Three-Card Reading · $9.9" />}
        </button>
        {error && <p className="mt-4 text-xs text-rose">{error}</p>}
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
          <Bi zh="灵犀量子塔罗 · 三张牌阵深度解读" en="Lingxi Quantum Tarot · Three-Card Deep Reading" />
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
      <h1 className="mt-6 text-center font-display text-3xl font-light text-bone">
        {name || t("你的", "Your")} <Bi zh="三张牌阵解读" en="Three-Card Reading" />
      </h1>

      <div className="mt-8 grid grid-cols-3 gap-3">
        {cards.map((c, i) => (
          <div key={i} className="overflow-hidden rounded-sm border border-lattice/25 bg-void-deep text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/images/tarot/${String(c.index).padStart(2, "0")}.jpg`} alt={c.nameZh} className="block aspect-[2/3] w-full object-cover" />
            <div className="p-2">
              <p className="text-[10px] uppercase tracking-widest2 text-amber/80">
                <Bi zh={positions[i].zh} en={positions[i].en} />
              </p>
              <p className="mt-1 text-xs text-bone">
                <Bi zh={c.nameZh} en={c.nameEn} />
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 space-y-5">
        {sections.map((content, i) => (
          <div key={i} className="rounded-sm border border-white/10 bg-void-deep p-6">
            {LAYER_TITLES[i] && (
              <p className="mb-3 text-xs uppercase tracking-widest2 text-lattice/70">
                <Bi zh={LAYER_TITLES[i].zh} en={LAYER_TITLES[i].en} />
              </p>
            )}
            <p className="whitespace-pre-line text-base leading-9 text-bone-dim">{content}</p>
          </div>
        ))}
      </div>
      </div>

      <div className="mt-6 rounded-sm border border-white/10 bg-void-deep px-6 py-4 text-center">
        <p className="text-xs text-bone-dim/60">
          <Bi zh="这是一份自我探索与反思的参考，不是命运预言。" en="This is a reference for self-reflection, not a prophecy." />
        </p>
      </div>
    </div>
  );
}
