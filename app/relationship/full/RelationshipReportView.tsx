"use client";

import { useEffect, useRef, useState } from "react";
import Bi from "@/components/Bi";
import { createClient } from "@/lib/supabase/client";
import { stripMarkdownArtifacts } from "@/lib/text-clean";
import { DIM_LABEL, type LifeVector, type LifeVectorDim } from "@/lib/life-vector";
import SpiralField from "@/components/SpiralField";
import PortalSpinner from "@/components/PortalSpinner";
import ShareButton from "@/components/ShareButton";

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

// v235：升级成11章节结构，三种关系类型（亲密/商业/其他）各自一套
// 独立的11个章节标题——必须跟 app/api/relationship/generate-full/
// route.ts 里对应类型的 XXX_CHAPTERS 数组顺序完全一致，这些标题本身
// 不是AI生成的，是固定结构（这就是"结构固定、秒开"的部分），下面
// 具体每章写了什么才是AI现场生成、缓存后复用的部分。
const CHAPTER_TITLES: Record<"romantic" | "business" | "general", { zh: string; en: string }[]> = {
  romantic: [
    { zh: "双生命星图", en: "Dual Life Star Map" },
    { zh: "初始吸引来源", en: "Where the Attraction Began" },
    { zh: "情绪连接模式", en: "Emotional Connection Pattern" },
    { zh: "价值观共振地图", en: "Values Resonance Map" },
    { zh: "沟通语言地图", en: "Communication Language Map" },
    { zh: "冲突触发结构", en: "Conflict Trigger Structure" },
    { zh: "关系成长路径", en: "Relationship Growth Path" },
    { zh: "隐藏互补力量", en: "Hidden Complementary Strength" },
    { zh: "长期共振潜力", en: "Long-Term Resonance Potential" },
    { zh: "双生命未来叙事", en: "A Shared Future Narrative" },
    { zh: "关系共振总结", en: "Resonance Summary" },
  ],
  business: [
    { zh: "双创造者星图", en: "Dual Creator Star Map" },
    { zh: "商业驱动力分析", en: "Business Drive Analysis" },
    { zh: "能力互补结构", en: "Complementary Capability Structure" },
    { zh: "决策模式地图", en: "Decision-Making Map" },
    { zh: "资源连接地图", en: "Resource Connection Map" },
    { zh: "风险冲突地图", en: "Risk & Conflict Map" },
    { zh: "合作周期地图", en: "Partnership Cycle Map" },
    { zh: "商业价值放大点", en: "Value Amplification Point" },
    { zh: "团队角色定位", en: "Team Role Positioning" },
    { zh: "长期共创模型", en: "Long-Term Co-Creation Model" },
    { zh: "双创造者商业叙事", en: "A Shared Business Narrative" },
  ],
  general: [
    { zh: "双生命连接图", en: "Dual Life Connection Map" },
    { zh: "相遇主题", en: "The Theme of This Meeting" },
    { zh: "互动模式", en: "Interaction Pattern" },
    { zh: "信任建立方式", en: "How Trust Forms" },
    { zh: "交流频率地图", en: "Communication Frequency Map" },
    { zh: "差异理解地图", en: "Understanding the Differences" },
    { zh: "支持关系结构", en: "Support Structure" },
    { zh: "共同成长方向", en: "Shared Growth Direction" },
    { zh: "关系边界地图", en: "Boundary Map" },
    { zh: "深层连接价值", en: "Deeper Value of the Connection" },
    { zh: "关系象征故事", en: "A Symbolic Story" },
  ],
};

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
  // v300：档案式导出需要把图表单独截图嵌进玻璃面板，所以这两块
  // 图表要能被单独拿到。radarRef = 双生命雷达图（第1章插图），
  // resonanceRef = 共鸣/互补/摩擦三组分数条（第2章插图）。
  const radarRef = useRef<HTMLDivElement>(null);
  const resonanceRef = useRef<HTMLDivElement>(null);

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
      const fetchReport = (regenerate: boolean) =>
        fetch("/api/relationship/generate-full", {
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
        // 兜底清理一层：老缓存可能是在"禁止markdown"这条规则加上去之前
        // 生成的，展示前再过滤一次星号，双保险。
        // v235：正则同时兼容旧的"===数字==="分隔符（升级前生成、还
        // 缓存着的报告）和新的"===SECTION==="分隔符，不然老用户已经
        // 付费生成过的报告，这次升级后会突然解析不出来、整段展示成
        // 一大团文字。
        let parts = stripMarkdownArtifacts(data.fullReport as string)
          .split(/===\s*(?:\d+|SECTION)\s*===/)
          .map((s: string) => s.trim())
          .filter(Boolean);
        // v235：升级前生成、缓存下来的报告只有5段——这次章节结构升级
        // 到了11段，直接展示这份旧缓存会导致内容和新的11个章节标题
        // 对不上（比如第6段的旧内容，被贴上新结构里"关系成长路径"
        // 这个标签，其实完全是两回事）。检测到缓存明显偏短，就自动
        // 触发一次重新生成，把这份报告升级成新结构，不用用户自己手动
        // 点"重新生成"。
        if (parts.length > 0 && parts.length < 8) {
          console.error("[relationship report] 检测到旧版本缓存（" + parts.length + "段），自动升级为11章节新结构");
          res = await fetchReport(true);
          data = await res.json();
          if (res.ok && data.fullReport) {
            parts = stripMarkdownArtifacts(data.fullReport as string)
              .split(/===\s*(?:\d+|SECTION)\s*===/)
              .map((s: string) => s.trim())
              .filter(Boolean);
          }
        }
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
      // v300：迁到档案式导出，与其余产品统一。
      // 关系共振以前没迁，是因为报告里有真实图表（双生命雷达图、
      // 共鸣/互补/摩擦分数条），而当时的 exportArchivePdf 只接受纯文本
      // 章节，硬迁会把图表弄丢。现在导出器支持章节挂载 DOM 元素，
      // 图表会被单独截图、作为插图嵌进玻璃面板，不再丢失。
      const { exportArchivePdf, ARCHIVE_THEMES } = await import("@/lib/pdf-export");
      const relKeyForPdf: "romantic" | "business" | "general" =
        relType === "business" ? "business" : relType === "general" ? "general" : "romantic";
      const titles = CHAPTER_TITLES[relKeyForPdf];
      const reportTitle = names ? `${names.a} × ${names.b}` : "report";
      // v300：之前不管测的是哪一种关系，导出的文件名一律叫
      // "灵犀关系共振-A × B.pdf"，标题也只写"关系共振图谱"。
      // 关系共振底下其实是三个独立产品（亲密 / 合伙商业 / 其他），
      // 三份档案的章节结构、素材、解读角度都不一样，文件名却看不出
      // 区别——用户测了两种关系，下载下来两个文件长得一模一样，
      // 存到微信里根本分不清哪份是哪份。这里让关系类型进文件名和标题。
      const relLabel =
        relType === "business"
          ? { zh: "合伙商业关系共振", en: "Business Partnership Resonance" }
          : relType === "general"
          ? { zh: "其他关系共振", en: "Other Relationship Resonance" }
          : { zh: "亲密关系共振", en: "Romantic Relationship Resonance" };
      await exportArchivePdf({
        chapters: sections.map((body, i) => ({
          title: (langEn ? titles[i]?.en : titles[i]?.zh) ?? `第 ${i + 1} 章`,
          body,
          // 第 1 章配双生命雷达图，第 2 章配共振分数条——把图放在
          // 它真正说明的那一章旁边，而不是全堆在封面后面。
          figure: i === 0 ? radarRef.current : i === 1 ? resonanceRef.current : null,
          figureCaption:
            i === 0
              ? t("两份生命向量叠放在同一张图上——重合处是共鸣，错开处是互补。",
                  "Two life vectors laid over one another — where they overlap is resonance; where they diverge is complement.")
              : i === 1
              ? t("共鸣点 · 互补点 · 摩擦点，按强度排列。",
                  "Resonance, complement, and friction — ordered by intensity.")
              : undefined,
        })),
        fileName: `灵犀${relLabel.zh}档案-${reportTitle}.pdf`,
        titleZh: `${reportTitle} · ${relLabel.zh}图谱`,
        titleEn: `${reportTitle} · ${relLabel.en}`,
        eyebrow: "RELATIONSHIP RESONANCE",
        theme: ARCHIVE_THEMES.relationship,
        // 三种关系各有一整套专属素材，不共用——亲密偏暖、商业偏理性、
        // 其他偏开阔，这是三个产品而不是一个产品的三个选项。
        coverImage: `/images/relationship-full/${relKeyForPdf}/page-0.png`,
        bodyImages: Array.from({ length: 11 }, (_, k) => `/images/relationship-full/${relKeyForPdf}/page-${k + 1}.png`),
        endImage: `/images/relationship-full/${relKeyForPdf}/page-11.png`,
      });
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
        <p className="font-display text-sm uppercase tracking-widest2 text-lattice">
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
      <p className="mt-2 text-xs text-bone-soft print:hidden">
        <Bi
          zh="不用急着现在下载——这份图谱会一直留在「场域入口」里，随时可以回来查看。"
          en="No need to download it right now — this map stays saved under Field Entrance, and you can come back to it anytime."
        />
      </p>

      <div
        ref={reportRef}
        className={printMode ? "rel-print-mode lx-report-tone-light mt-8 px-1 py-4" : "lx-report-tone-light mt-8 px-1 py-4"}
        style={{
          backgroundImage: `url(/images/relationship-full/${relType === "business" ? "business" : relType === "general" ? "general" : "romantic"}/page-0.png)`,
          backgroundSize: "cover", backgroundPosition: "top center", backgroundAttachment: "local",
        }}
      >
        <p className="text-center font-display text-xs uppercase tracking-widest2 text-amber">
          {relType === "business" ? (
            <Bi zh="合伙商业关系共振" en="Business Partnership Resonance" />
          ) : relType === "general" ? (
            <Bi zh="其他关系共振" en="Other Relationship Resonance" />
          ) : (
            <Bi zh="亲密关系共振" en="Romantic Relationship Resonance" />
          )}
        </p>
        <h1 className="mt-2 font-display text-3xl font-light text-bone text-center">
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
          <div className="mt-6" ref={radarRef}>
            <ResonanceRadar vA={vectors.a} vB={vectors.b} nameA={names?.a || "A"} nameB={names?.b || "B"} langEn={langEn} />
          </div>
        )}

        {resonance && (
          <div className="lx-report-glass mt-6 space-y-6 p-6" ref={resonanceRef}>
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

        {sections.map((content, i) => {
          const isSeal = i === sections.length - 1;
          const folder = relType === "business" ? "business" : relType === "general" ? "general" : "romantic";
          // 三类关系都已具备 page-1..11，每章使用自己的出版底图。
          const bgIndex = Math.min(i + 1, 11);
          const relKey: "romantic" | "business" | "general" = relType === "business" ? "business" : relType === "general" ? "general" : "romantic";
          const chapterTitle = CHAPTER_TITLES[relKey][i];
          return (
            <div
              key={i}
              className="relative mt-6 flex min-h-[78vh] items-center overflow-hidden rounded-sm p-4 sm:min-h-[920px] sm:p-8"
              style={{
                backgroundImage: `url(/images/relationship-full/${folder}/page-${bgIndex}.png)`,
                backgroundSize: "cover", backgroundPosition: "center",
              }}
            >
              <div className="lx-report-glass w-full px-6 py-8 sm:px-10 sm:py-12">
              <p className="font-display text-xs uppercase tracking-widest2 text-lattice">
                {String(i + 1).padStart(2, "0")} · <Bi zh={chapterTitle?.zh ?? ""} en={chapterTitle?.en ?? ""} />
              </p>
              <div className="mt-5 whitespace-pre-line text-[15px] leading-[2] tracking-[0.02em] text-bone-dim sm:text-lg sm:leading-[2.05]">{stripMarkdownArtifacts(content)}</div>
              {isSeal && (
                <div className="mt-6 border-t border-lattice/25 pt-5 text-center">
                  <p className="font-display text-sm italic text-lattice/85">
                    <Bi zh="每一次连接，都会形成一个新的场。" en="Every connection creates a field." />
                  </p>
                </div>
              )}
              </div>
            </div>
          );
        })}

        <div className="lx-report-glass mt-6 p-5 text-center">
          <p className="text-sm text-bone-dim">
            <Bi zh="这是一份自我探索与反思的参考，不是关系预言——关系的走向，始终由两个人共同选择。" en="This is a reference for reflection, not a prophecy about your relationship — its course is always shaped by both people, together." />
          </p>
        </div>
        <div className="mt-4 text-center">
          <ShareButton
            text={t("我做了一份灵犀关系共振图谱，去看看你们的：", "I got a Lingxi Field Relationship Resonance Map — check out yours:")}
            url="https://lingxifield.com/relationship"
            label={{ zh: "分享这份报告", en: "Share this reading" }}
          />
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
    <div className="lx-report-glass p-5">
      <p className="text-xs uppercase tracking-widest2 text-lattice"><Bi zh="生命向量对比" en="Life Vector Comparison" /></p>
      <div className="mt-4 flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="h-56 w-56 shrink-0">
          {gridRings.map((pts, i) => (
            <polygon key={i} points={pts} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
          ))}
          <polygon points={pointsFor(vA)} fill="rgba(140,210,255,0.22)" stroke="#8CD2FF" strokeWidth="1.5" />
          <polygon points={pointsFor(vB)} fill="rgba(232,183,101,0.20)" stroke="#E8B765" strokeWidth="1.5" />
          {labelPoints.map((p, i) => (
            <text key={i} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" fontSize="8.5" fill="var(--report-chart-text)">
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
          <p className="mt-3 max-w-[12rem] text-xs leading-5 text-bone-soft">
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
