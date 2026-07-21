"use client";

import { useEffect, useRef, useState } from "react";
import Bi from "@/components/Bi";
import { createClient } from "@/lib/supabase/client";
import { stripMarkdownArtifacts } from "@/lib/text-clean";
import { DIM_LABEL, type LifeVector, type LifeVectorDim } from "@/lib/life-vector";
import SpiralField from "@/components/SpiralField";
import PortalSpinner from "@/components/PortalSpinner";

// 同一个 bug、同一个修法：见 RelationshipFlow.tsx 里的注释——直接读
// document.documentElement 的class不会随语言切换按钮重新渲染，改用
// MutationObserver 监听class变化，变成真正的React state。
function useLang() {
  const [langEn, setLangEn] = useState(false);
  useEffect(() => {
    setLangEn(document.documentElement.classList.contains("lang-en"));
    const observer = new MutationObserver(() => {
      setLangEn(document.documentElement.classList.contains("lang-en"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);
  return langEn;
}

const SECTION_TITLES = [
  { zh: "吸引来源", en: "Where the Attraction Comes From" },
  { zh: "关系动力", en: "Relationship Dynamics" },
  { zh: "冲突地图", en: "Conflict Map" },
  { zh: "长期潜力", en: "Long-Term Potential" },
  { zh: "成长方向", en: "Growth Direction" },
];

export default function RelationshipReportView({ id }: { id: string }) {
  const langEn = useLang();
  const t = (zh: string, en: string) => (langEn ? en : zh);
  const [status, setStatus] = useState<"checking" | "locked" | "generating" | "ready" | "error">("checking");
  const [error, setError] = useState("");
  const [names, setNames] = useState<{ a: string; b: string } | null>(null);
  const [sections, setSections] = useState<string[]>([]);
  const [resonance, setResonance] = useState<{
    resonant: { labelZh: string; labelEn: string; a: number; b: number }[];
    complementary: { labelZh: string; labelEn: string }[];
    friction: { labelZh: string; labelEn: string }[];
  } | null>(null);
  const [vectors, setVectors] = useState<{ a: LifeVector; b: LifeVector } | null>(null);
  const [relType, setRelType] = useState<string>("romantic");
  const [downloading, setDownloading] = useState(false);
  const [printMode, setPrintMode] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: submission } = await supabase
        .from("relationship_submissions")
        .select("name_a, name_b, relationship_type")
        .eq("id", id)
        .single();
      if (submission) {
        setNames({ a: submission.name_a, b: submission.name_b });
        if (submission.relationship_type) setRelType(submission.relationship_type);
      }

      const currentLangEn = document.documentElement.classList.contains("lang-en");
      try {
        const res = await fetch("/api/relationship/generate-full", {
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
        // 兜底清理一层：老缓存可能是在"禁止markdown"这条规则加上去之前
        // 生成的，展示前再过滤一次星号，双保险。
        const parts = stripMarkdownArtifacts(data.fullReport as string)
          .split(/===\s*\d+\s*===/)
          .map((s: string) => s.trim())
          .filter(Boolean);
        setSections(parts);
        if (data.resonance) setResonance(data.resonance);
        if (data.vectors) setVectors(data.vectors);
        setStatus("ready");
      } catch {
        setStatus("error");
        setError(t("连接场域时出错，请稍后再试。", "Error connecting to the field — please try again."));
      }
    };
    load();
  }, [id]);

  // 跟生命图谱完整报告用的是同一套导出方式（见 app/life-map/full/
  // FullReportView.tsx 里 downloadPdf 的详细注释）：按"每个章节"单独
  // 截图，再逐张贴进A4页面，不会撞浏览器canvas的最大尺寸限制。
  const downloadPdf = async () => {
    if (!reportRef.current) return;
    setDownloading(true);
    setPrintMode(true);
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);
      const container = reportRef.current;
      const chapters = Array.from(container.children) as HTMLElement[];
      const PRINT_BG = "#241a44";

      const pdf = new jsPDF({ unit: "pt", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const fillPageBackground = () => {
        pdf.setFillColor(36, 26, 68);
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

      pdf.save(`灵犀关系共振-${names ? `${names.a}×${names.b}` : "report"}.pdf`);
    } catch (e) {
      console.error("PDF 生成失败:", e);
      alert(t("PDF 生成失败，请稍后再试，或改用浏览器打印功能另存为 PDF。", "PDF generation failed — please try again, or use your browser's print-to-PDF as a fallback."));
    } finally {
      setDownloading(false);
      setPrintMode(false);
    }
  };

  if (status === "checking" || status === "generating") {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <SpiralField active label={t("正在读取两份生命向量的共振…", "Reading the resonance between two life vectors…")} />
      </div>
    );
  }

  if (status === "locked") {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <p className="font-display text-2xl text-bone">🔒 <Bi zh="尚未解锁这份图谱" en="This map isn't unlocked yet" /></p>
        <a href="/relationship" className="mt-8 inline-block border border-lattice/40 px-8 py-3 font-display text-sm uppercase tracking-widest2 text-lattice transition hover:border-lattice hover:text-bone">
          <Bi zh="返回关系共振图谱" en="Back to Relationship Resonance" />
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

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <style>{`
        /* 跟生命图谱PDF导出用同一套打印底色方案，两份报告的PDF看起来
           是同一个产品家族，不是风格不统一的两套东西。 */
        .rel-print-mode {
          background:
            radial-gradient(ellipse 85% 60% at 10% -8%, rgba(255,182,213,0.38), transparent 62%),
            radial-gradient(ellipse 80% 65% at 100% 5%, rgba(140,210,255,0.42), transparent 62%),
            radial-gradient(ellipse 75% 60% at 50% 105%, rgba(216,184,255,0.40), transparent 64%),
            radial-gradient(ellipse 60% 50% at 90% 90%, rgba(255,214,153,0.30), transparent 58%),
            radial-gradient(ellipse 55% 45% at 5% 60%, rgba(150,232,210,0.26), transparent 55%),
            linear-gradient(160deg, #1a1440 0%, #241a4a 30%, #17335c 65%, #0d2440 100%);
          border-radius: 4px;
        }
        .rel-print-mode, .rel-print-mode * { animation: none !important; }
        .rel-print-mode h1, .rel-print-mode p, .rel-print-mode span, .rel-print-mode div { color: #DDE6FF !important; }
        .rel-print-mode svg text { fill: #DDE6FF !important; }
        .rel-print-mode .bg-void-deep { background: rgba(255,255,255,0.08) !important; }
      `}</style>
      <div className="flex items-center justify-between print:hidden">
        <p className="font-display text-sm uppercase tracking-widest2 text-lattice/80">
          <Bi zh="灵犀 · 关系共振图谱" en="Lingxi · Relationship Resonance Map" />
        </p>
        <button
          onClick={downloadPdf}
          disabled={downloading}
          className="flex items-center gap-2 rounded-sm border border-bone/15 px-4 py-2 text-xs uppercase tracking-widest2 text-bone-dim transition hover:border-lattice hover:text-bone disabled:opacity-50"
        >
          {downloading ? <><PortalSpinner /><Bi zh="正在生成 PDF…" en="Generating PDF…" /></> : <Bi zh="下载 PDF" en="Download PDF" />}
        </button>
      </div>
      <p className="mt-2 text-xs text-bone-dim/70 print:hidden">
        <Bi
          zh="不用急着现在下载——这份图谱会一直留在「场域入口」里，随时可以回来查看。"
          en="No need to download it right now — this map stays saved under Field Entrance, and you can come back to it anytime."
        />
      </p>

      <div ref={reportRef} className={printMode ? "rel-print-mode mt-8 px-1 py-4" : "mt-8 px-1 py-4"}>
        <h1 className="font-display text-3xl font-light text-bone">
          {names ? `${names.a} × ${names.b}` : ""}
        </h1>

        <div className="mt-4 flex justify-center">
          <div className="overflow-hidden rounded-sm border border-lattice/20" style={{ maxWidth: 220 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/images/relationship/${relType === "business" ? "business" : relType === "general" ? "general" : "romantic"}.jpg`}
              alt={relType}
              className="block w-full"
            />
          </div>
        </div>

        {vectors && (
          <div className="mt-6">
            <ResonanceRadar vA={vectors.a} vB={vectors.b} nameA={names?.a || "A"} nameB={names?.b || "B"} langEn={langEn} />
          </div>
        )}

        {resonance && (
          <div className="bg-void-deep mt-6 space-y-6 rounded-sm p-6">
            {resonance.resonant.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-widest2 text-lattice"><Bi zh="共鸣点 · 共享的驱动力" en="Resonance · Shared Drives" /></p>
                <div className="mt-3 space-y-2">
                  {resonance.resonant.map((r, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <span className="w-28 shrink-0 text-bone-dim">{t(r.labelZh, r.labelEn)}</span>
                      <div className="flex h-2 flex-1 gap-0.5 overflow-hidden rounded-full bg-white/5">
                        <div className="h-full rounded-l-full bg-lattice" style={{ width: `${r.a}%` }} />
                        <div className="h-full rounded-r-full bg-amber" style={{ width: `${r.b}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {resonance.complementary.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-widest2 text-amber"><Bi zh="互补点 · 天然分工" en="Complementary · Natural Division" /></p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {resonance.complementary.map((c, i) => (
                    <span key={i} className="rounded-full border border-amber/30 bg-amber/10 px-3 py-1 text-xs text-amber">{t(c.labelZh, c.labelEn)}</span>
                  ))}
                </div>
              </div>
            )}
            {resonance.friction.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-widest2 text-rose"><Bi zh="摩擦点 · 需要留意" en="Friction · Worth Watching" /></p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {resonance.friction.map((c, i) => (
                    <span key={i} className="rounded-full border border-rose/30 bg-rose/10 px-3 py-1 text-xs text-rose">{t(c.labelZh, c.labelEn)}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {sections.map((content, i) => (
          <div key={i} className="bg-void-deep mt-6 rounded-sm p-6">
            <p className="font-display text-xs uppercase tracking-widest2 text-lattice">
              {String(i + 1).padStart(2, "0")} · <Bi zh={SECTION_TITLES[i]?.zh ?? ""} en={SECTION_TITLES[i]?.en ?? ""} />
            </p>
            <div className="mt-3 whitespace-pre-line text-base leading-9 text-bone-dim">{stripMarkdownArtifacts(content)}</div>
          </div>
        ))}

        <div className="bg-void-deep mt-6 rounded-sm p-5 text-center">
          <p className="text-sm text-bone-dim/80">
            <Bi zh="这是一份自我探索与反思的参考，不是关系预言——关系的走向，始终由两个人共同选择。" en="This is a reference for reflection, not a prophecy about your relationship — its course is always shaped by both people, together." />
          </p>
        </div>
      </div>
    </div>
  );
}

// 双人生命向量雷达图——把之前"文字为主、只有一个横条+几个标签"的关系
// 报告，加上一张一眼能看懂的图：两个人的十个生命向量维度，叠在同一张
// 雷达图上，形状重叠的地方就是共鸣，形状差得远的地方就是互补或摩擦，
// 不需要先读完文字才知道"两人像不像"，一张图就有直观感受——这是
// 回应"要图文并茂、要看得到共振"这条反馈的核心改动。
const RADAR_DIMS: LifeVectorDim[] = [
  "freedomNeed", "stabilityNeed", "creativity", "discipline", "riskTolerance",
  "emotionalDepth", "introspection", "socialDrive", "ambition", "adaptability",
];

function ResonanceRadar({ vA, vB, nameA, nameB, langEn }: { vA: LifeVector; vB: LifeVector; nameA: string; nameB: string; langEn: boolean }) {
  const SIZE = 220, CENTER = 110, MAX_R = 82;
  const angleFor = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / RADAR_DIMS.length;
  const pointsFor = (v: LifeVector) =>
    RADAR_DIMS.map((dim, i) => {
      const angle = angleFor(i);
      const r = Math.max(0.08, v[dim] / 100) * MAX_R;
      return `${CENTER + r * Math.cos(angle)},${CENTER + r * Math.sin(angle)}`;
    }).join(" ");
  const gridRings = [0.33, 0.66, 1].map((frac) =>
    RADAR_DIMS.map((_, i) => {
      const angle = angleFor(i);
      return `${CENTER + frac * MAX_R * Math.cos(angle)},${CENTER + frac * MAX_R * Math.sin(angle)}`;
    }).join(" ")
  );
  const labelPoints = RADAR_DIMS.map((dim, i) => {
    const angle = angleFor(i);
    return {
      x: CENTER + (MAX_R + 20) * Math.cos(angle),
      y: CENTER + (MAX_R + 20) * Math.sin(angle),
      label: langEn ? DIM_LABEL[dim].en : DIM_LABEL[dim].zh,
    };
  });

  return (
    <div className="rounded-sm border border-bone/10 bg-void-deep p-5 backdrop-blur-xl">
      <p className="text-xs uppercase tracking-widest2 text-lattice"><Bi zh="生命向量对比" en="Life Vector Comparison" /></p>
      <div className="mt-4 flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="h-56 w-56 shrink-0">
          {gridRings.map((pts, i) => (
            <polygon key={i} points={pts} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
          ))}
          <polygon points={pointsFor(vA)} fill="rgba(140,210,255,0.22)" stroke="#8CD2FF" strokeWidth="1.5" />
          <polygon points={pointsFor(vB)} fill="rgba(232,183,101,0.20)" stroke="#E8B765" strokeWidth="1.5" />
          {labelPoints.map((p, i) => (
            <text key={i} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" fontSize="8.5" fill="#DDE6FF">
              {p.label}
            </text>
          ))}
        </svg>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#8CD2FF" }} />
            <span className="text-bone-dim">{nameA}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#E8B765" }} />
            <span className="text-bone-dim">{nameB}</span>
          </div>
          <p className="mt-3 max-w-[12rem] text-[11px] leading-5 text-bone-dim/70">
            <Bi
              zh="两个形状重叠的地方，是两人共享的驱动力；差得远的地方，往往就是下方文字里写到的互补或摩擦点。"
              en="Where the two shapes overlap is shared drive; where they differ most is usually the complementary or friction point discussed below."
            />
          </p>
        </div>
      </div>
    </div>
  );
}
