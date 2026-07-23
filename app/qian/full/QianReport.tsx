"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLang } from "@/lib/useLang";
import Bi from "@/components/Bi";
import { LIFE_SIGNS, TIER_LABELS } from "@/lib/qian-data";
import ShareButton from "@/components/ShareButton";
import { REVIEW_MODE } from "@/lib/reviewMode";

// 四段解读对应doc21的报告设计——不是随便起的名字，是"三签怎么组合→
// 天赋数字地图→当前处在哪个阶段→接下来具体练什么"这条完整的自我
// 理解路径。
const LAYER_TITLES = [
  { zh: "① 生命三原型总览", en: "① Three Archetypes Overview" },
  { zh: "② 源流签深度解析", en: "② Origin Sign Deep Dive" },
  { zh: "③ 灵魂签深度解析", en: "③ Soul Sign Deep Dive" },
  { zh: "④ 行者签深度解析", en: "④ Walker Sign Deep Dive" },
  { zh: "⑤ 三签融合分析", en: "⑤ Three-Sign Fusion" },
  { zh: "⑥ 财富创造系统", en: "⑥ Wealth Creation System" },
  { zh: "⑦ 关系模式分析", en: "⑦ Relationship Pattern" },
  { zh: "⑧ 事业使命地图", en: "⑧ Career & Mission Map" },
  { zh: "⑨ 当前人生阶段", en: "⑨ Current Life Stage" },
  { zh: "⑩ 隐藏天赋", en: "⑩ Hidden Talents" },
  { zh: "⑪ 灵犀成长路径", en: "⑪ Growth Path" },
  { zh: "⑫ 生命宣言", en: "⑫ Life Declaration" },
];

type AbilityItem = { key: string; zh: string; en: string; score: number };
type LifeStage = { zh: string; en: string };

export default function QianReport({ id }: { id: string }) {
  const langEn = useLang();
  const t = (zh: string, en: string) => (langEn ? en : zh);
  const [status, setStatus] = useState<"checking" | "locked" | "ready" | "error">("checking");
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [signs, setSigns] = useState<typeof LIFE_SIGNS>([]);
  const [sections, setSections] = useState<string[]>([]);
  const [abilityMap, setAbilityMap] = useState<AbilityItem[]>([]);
  const [lifeStage, setLifeStage] = useState<LifeStage | null>(null);
  const [unlocking, setUnlocking] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: submission } = await supabase
        .from("qian_submissions")
        .select("name, sign_indexes")
        .eq("id", id)
        .single();
      if (submission) {
        setName(submission.name || "");
        setSigns((submission.sign_indexes as number[]).map((i) => LIFE_SIGNS[i]));
      }

      const currentLangEn = document.documentElement.classList.contains("lang-en");
      try {
        const res = await fetch("/api/qian/generate-full", {
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
        if (Array.isArray(data.abilityMap)) setAbilityMap(data.abilityMap);
        if (data.lifeStage) setLifeStage(data.lifeStage);
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
    if (REVIEW_MODE) {
      setStatus("checking");
      window.location.reload();
      return;
    }
    setUnlocking(true);
    try {
      const res = await fetch("/api/pay/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: "qian-reading", submissionId: id, returnPath: `/qian/full?id=${id}` }),
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

  // 跟生命图谱、关系共振用的是同一套导出方式：按每个章节单独截图，
  // 再逐张贴进A4页面，不会撞浏览器canvas的最大尺寸限制（见
  // app/life-map/full/FullReportView.tsx 里 downloadPdf 的详细注释）。
  const downloadPdf = async () => {
    if (!reportRef.current) return;
    setDownloading(true);
    try {
      // 之前这里点了就立刻开始截图，网页自定义字体（font-display那套）
      // 如果这时候还没加载完，html2canvas会拿浏览器默认字体的度量去
      // 排版截图，等真字体一到位，文字宽度/行高对不上，看起来就是标题
      // 和副标题重叠、文字挤在一起糊成一团。这里先等字体真正加载完成，
      // 再多留200毫秒给排版稳定下来，才开始截图。
      await document.fonts.ready;
      await new Promise((r) => setTimeout(r, 200));

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

      pdf.save(`灵犀生命灵签-${name || "report"}.pdf`);
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
        <p className="text-sm text-bone-dim">{t("场域正在展开你的完整生命原型档案，第一次生成需要一点时间……", "The field is unfolding your full life archetype blueprint — the first generation takes a little while…")}</p>
      </div>
    );
  }

  if (status === "locked") {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <p className="font-display text-2xl text-bone">🔒 <Bi zh="尚未解锁这份深度生命解读" en="Not yet unlocked" /></p>
        <button
          onClick={unlock}
          disabled={unlocking}
          className="mt-8 bg-lattice px-8 py-3 font-display text-sm uppercase tracking-widest2 text-void-deep transition hover:bg-amber disabled:opacity-50"
        >
          {unlocking ? <Bi zh="正在跳转…" en="Redirecting…" /> : <Bi zh="开启完整生命解码 · $9.9" en="Unlock the Full Decoding · $9.9" />}
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
          <Bi zh="灵犀生命灵签 · 生命原型档案" en="Lingxi Life Oracle · Personal Life Archetype Blueprint" />
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
        {name || t("你的", "Your")} <Bi zh="生命原型档案" en="Life Archetype Blueprint" />
      </h1>
      <p className="mt-2 text-center text-sm text-bone-dim">
        <Bi zh="三枚灵签，三个维度，一张属于你的生命地图。" en="Three signs, three dimensions — one life map that's entirely your own." />
      </p>

      <div className="mt-8 grid grid-cols-3 gap-3">
        {signs.map((s, i) => (
          <div key={i} className="overflow-hidden rounded-sm border border-lattice/25 bg-void-deep text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/images/qian/${String(s.index).padStart(2, "0")}.jpg`} alt={s.nameZh} className="block aspect-[2/3] w-full object-cover" />
            <div className="p-3">
              <p className="text-[10px] uppercase tracking-widest2 text-amber/80">
                <Bi zh={TIER_LABELS[s.tier].zh} en={TIER_LABELS[s.tier].en} />
              </p>
              <p className="mt-1 text-xs text-bone">
                <Bi zh={s.nameZh} en={s.nameEn} />
              </p>
            </div>
          </div>
        ))}
      </div>

      {lifeStage && (
        <div className="mt-6 rounded-sm border border-amber/25 bg-amber/5 px-6 py-3 text-center">
          <p className="text-xs uppercase tracking-widest2 text-amber/80">
            <Bi zh="当前所处阶段" en="Current Life Stage" />
          </p>
          <p className="mt-1 font-display text-lg text-bone">
            <Bi zh={lifeStage.zh} en={lifeStage.en} />
          </p>
        </div>
      )}

      {abilityMap.length > 0 && (
        <div className="mt-4 rounded-sm border border-white/10 bg-void-deep p-6">
          <p className="text-xs uppercase tracking-widest2 text-lattice/70">
            <Bi zh="天赋能力地图" en="Talent & Ability Map" />
          </p>
          <div className="mt-4 space-y-3">
            {abilityMap.map((a) => (
              <div key={a.key}>
                <div className="flex items-center justify-between text-xs text-bone-dim">
                  <span><Bi zh={a.zh} en={a.en} /></span>
                  <span className="text-amber">{a.score}</span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-lattice to-amber" style={{ width: `${a.score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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

      <div className="mt-6 flex flex-col items-center gap-3 rounded-sm border border-white/10 bg-void-deep px-6 py-4 text-center">
        <p className="text-xs text-bone-dim/60">
          <Bi zh="这是一份自我探索与反思的参考，不是命运预言。" en="This is a reference for self-reflection, not a prophecy." />
        </p>
        <ShareButton
          text={t("我做了一份灵犀生命灵签报告，去看看你自己的：", "I got my Lingxi Life Oracle reading — check out your own:")}
          url="https://lingxifield.com/qian"
          label={{ zh: "分享这份报告", en: "Share this reading" }}
        />
      </div>
    </div>
  );
}
