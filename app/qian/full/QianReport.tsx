"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLang } from "@/lib/useLang";
import Bi from "@/components/Bi";
import { LIFE_SIGNS, TIER_LABELS } from "@/lib/qian-data";
import ShareButton from "@/components/ShareButton";
import { REVIEW_MODE } from "@/lib/reviewMode";
import WechatPayModal from "@/components/WechatPayModal";
import { getProduct } from "@/lib/plans";

// 四段解读对应doc21的报告设计——不是随便起的名字，是"三签怎么组合→
// 天赋数字地图→当前处在哪个阶段→接下来具体练什么"这条完整的自我
// 理解路径。
// v237：12段合并成11段——财富创造系统+事业使命地图合并成一段"价值
// 创造地图"，其余章节按你的11章节命名方案重新命名（源流签/灵魂签/
// 行者签这三签的具体内容完全没动，这是这个产品最有价值的部分，不
// 会因为改名字就换掉）。
const LAYER_TITLES = [
  { zh: "① 生命三原型总览", en: "① Three Archetypes Overview" },
  { zh: "② 源流签深度解析", en: "② Origin Sign Deep Dive" },
  { zh: "③ 灵魂签深度解析", en: "③ Soul Sign Deep Dive" },
  { zh: "④ 行者签深度解析", en: "④ Walker Sign Deep Dive" },
  { zh: "⑤ 三签融合分析", en: "⑤ Three-Sign Fusion" },
  { zh: "⑥ 价值创造地图", en: "⑥ Value Creation Map" },
  { zh: "⑦ 关系映射", en: "⑦ Relationship Mapping" },
  { zh: "⑧ 当下生命主题", en: "⑧ Current Life Theme" },
  { zh: "⑨ 隐藏力量", en: "⑨ Hidden Strength" },
  { zh: "⑩ 灵犀场实践", en: "⑩ A Personal Practice" },
  { zh: "⑪ 生命灵签总结", en: "⑪ Oracle Summary" },
];

// v231：正文分组——按PDF设计文档的6页结构分成3个视觉分组页 + 1个
// 封印页，索引对应LAYER_TITLES的顺序（v237更新为11段后的新索引）。
const QIAN_PAGE_GROUPS = [
  { titleZh: "灵签核心页 · 三签解析", titleEn: "Oracle Symbol · The Three Signs", bg: "page-2", indices: [0, 1, 2, 3] },
  { titleZh: "生命象征解析", titleEn: "Symbol Interpretation", bg: "page-3", indices: [4, 5, 6] },
  { titleZh: "金色生命卷轴", titleEn: "Golden Life Scroll", bg: "page-4", indices: [7, 8, 9] },
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
  const [showWechatPay, setShowWechatPay] = useState(false);
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
      const fetchReport = (regenerate: boolean) =>
        fetch("/api/qian/generate-full", {
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
          setError((data.error || t("生成失败，请稍后再试。", "Generation failed — please try again.")) + (data.detail ? ` (${data.detail})` : ""));
          return;
        }
        let parts = (data.fullReport as string)
          .split(/===\s*\d+\s*===/)
          .map((s: string) => s.trim())
          .filter(Boolean);
        // v237：升级前生成、缓存下来的报告是12段（财富创造+事业使命还
        // 没合并），这次合并成了11段——检测到缓存段数偏多，自动触发
        // 一次重新生成，升级成新结构，不用用户自己点"重新生成"。
        if (parts.length > 11) {
          console.error("[qian report] 检测到旧版本缓存（" + parts.length + "段），自动升级为11章节新结构");
          res = await fetchReport(true);
          data = await res.json();
          if (res.ok && data.fullReport) {
            parts = (data.fullReport as string)
              .split(/===\s*\d+\s*===/)
              .map((s: string) => s.trim())
              .filter(Boolean);
          }
        }
        setSections(parts);
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

  const unlock = () => {
    if (REVIEW_MODE) {
      setStatus("checking");
      window.location.reload();
      return;
    }
    setShowWechatPay(true);
  };

  // 目录页要列的章节标题——lifeStage、abilityMap这两块是条件渲染的，
  // 有没有要看实际数据，构建目录列表的时候要跟正文实际渲染出来的
  // 直接子元素顺序完全对应，不然目录和实际内容会对不上。
  const downloadPdf = async () => {
    if (!reportRef.current) return;
    setDownloading(true);
    try {
      // v300：改用档案式导出，与生命韧性/桃花/财富/潮汐/量子生命镜像
      // 统一。之前是 exportGlassPdf（网页整段截图再切片），出来的观感
      // 是"网页截图集"；现在每章独立成页、素材整页铺满、文字压在浅色
      // 玻璃面板上，跟网页看到的是同一张脸。
      const { exportArchivePdf, ARCHIVE_THEMES } = await import("@/lib/pdf-export");
      await exportArchivePdf({
        chapters: sections
          .map((body, i) => ({
            title: (langEn ? LAYER_TITLES[i]?.en : LAYER_TITLES[i]?.zh) ?? `第 ${i + 1} 章`,
            body,
          }))
          .filter((c) => c.body && c.body.trim()),
        fileName: `灵犀生命灵签-${name || "report"}.pdf`,
        titleZh: `${name || "你的"}生命原型档案`,
        titleEn: `${name || "Your"} Life Archetype Blueprint`,
        eyebrow: "LIFE ORACLE",
        theme: ARCHIVE_THEMES.qian,
        coverImage: "/images/qian-full/page-0.png",
        bodyImages: Array.from({ length: 11 }, (_, k) => `/images/qian-full/page-${k + 1}.png`),
        endImage: "/images/qian-full/page-11.png",
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
          <p className="mt-6 text-sm leading-7 text-bone-dim">{t("场域正在编排你的完整生命原型档案……", "The field is composing your full life archetype blueprint locally…")}</p>
          <p className="mt-3 text-xs text-bone-soft">{t("三重签象与生命向量正在完成确定性组合。", "The three signs and life vector are being composed deterministically.")}</p>
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
        <p className="font-display text-2xl text-bone">🔒 <Bi zh="尚未解锁这份深度生命解读" en="Not yet unlocked" /></p>
        <button
          onClick={unlock}
          disabled={unlocking}
          className="mt-8 bg-lattice px-8 py-3 font-display text-sm uppercase tracking-widest2 text-void-deep transition hover:bg-amber disabled:opacity-50"
        >
          <Bi zh={`开启完整生命解码 · ¥${getProduct("qian-reading")?.priceRmb}`} en={`Unlock the Full Decoding · ¥${getProduct("qian-reading")?.priceRmb}`} />
        </button>
        {error && <p className="mt-4 text-xs text-rose">{error}</p>}
        {showWechatPay && (
          <WechatPayModal
            productId="qian-reading"
            submissionId={id}
            priceRmb={getProduct("qian-reading")?.priceRmb ?? 0}
            productName={{ zh: "灵犀生命灵签 · 完整解读", en: "Lingxi Life Oracle · Full Reading" }}
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
    <div className="mx-auto max-w-4xl px-3 py-16 sm:px-6">
      <div className="flex items-center justify-between lx-report-glass px-6 py-4">
        <p className="font-display text-sm uppercase tracking-widest2 text-lattice">
          <Bi zh="灵犀生命灵签 · 生命原型档案" en="Lingxi Life Oracle · Personal Life Archetype Blueprint" />
        </p>
        <button
          onClick={downloadPdf}
          disabled={downloading}
          className="flex shrink-0 items-center gap-2 rounded-sm border border-lattice/40 px-4 py-2 text-xs uppercase tracking-widest2 text-lattice transition hover:border-lattice hover:text-bone disabled:opacity-50"
        >
          {downloading ? <Bi zh="生成中…" en="Generating…" /> : <Bi zh="下载 PDF" en="Download PDF" />}
        </button>
      </div>

      <div ref={reportRef} className="lx-report-tone-light">
      <div
        className="lx-publication-page lx-publication-cover relative flex items-center justify-center overflow-hidden rounded-sm"
        style={{ backgroundImage: "url(/images/qian-full/page-0.png)", backgroundSize: "cover", backgroundPosition: "top" }}
      >
        <div className="lx-report-glass lx-report-glass-readable my-8 px-6 py-12 text-center sm:mx-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/lingxifield-logo.png" alt="LINGXIFIELD" className="mx-auto h-16 w-16" />
        <p className="mt-4 font-display text-xs uppercase tracking-widest2 text-lattice">
          LINGXI LIFE ORACLE
        </p>
        <h1 className="mt-4 font-display text-3xl font-light sm:text-4xl">
          {name || t("你的", "Your")} <Bi zh="生命原型档案" en="Life Archetype Blueprint" />
        </h1>
        <p className="mt-1 font-display text-sm text-lattice">
          <Bi zh="灵犀生命灵签 · 生命原型档案" en="Lingxi Life Oracle · Personal Life Archetype Blueprint" />
        </p>
        <p className="mt-4 text-sm leading-7 text-bone-dim">
          <Bi zh="三枚灵签，三个维度，一张属于你的生命地图。" en="Three signs, three dimensions — one life map that's entirely your own." />
        </p>

        <div className="mx-auto mt-8 grid max-w-md grid-cols-3 gap-3">
          {signs.map((s, i) => (
            <div key={i} className="overflow-hidden rounded-sm border border-lattice/25 text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/images/qian/${String(s.index).padStart(2, "0")}.jpg`} alt={s.nameZh} className="block aspect-[2/3] w-full object-cover" />
            </div>
          ))}
        </div>
        <div className="mx-auto mt-3 grid max-w-md grid-cols-3 gap-3 text-center">
          {signs.map((s, i) => (
            <div key={i}>
              <p className="text-[11px] uppercase tracking-widest2 text-amber/80">
                <Bi zh={TIER_LABELS[s.tier].zh} en={TIER_LABELS[s.tier].en} />
              </p>
              <p className="mt-1 text-xs text-bone">
                <Bi zh={s.nameZh} en={s.nameEn} />
              </p>
            </div>
          ))}
        </div>

        <p className="mt-8 text-xs text-bone-soft">
          {name ? `${name} · ` : ""}{new Date().toLocaleDateString(langEn ? "en-US" : "zh-CN")}
        </p>
        <p className="mt-1 text-xs text-bone-soft">lingxifield.com</p>
        </div>
      </div>

      {(lifeStage || abilityMap.length > 0) && (
        <div
          className="lx-publication-page relative mt-6 flex items-center justify-center overflow-hidden rounded-sm"
          style={{ backgroundImage: "url(/images/qian-full/page-1.png)", backgroundSize: "cover", backgroundPosition: "top" }}
        >
          <div className="lx-report-glass lx-report-glass-readable my-8 p-6 sm:mx-6">
            <p className="text-center text-xs uppercase tracking-widest2 text-amber/90">
              <Bi zh="灵签生成页面 · Oracle Activation" en="Oracle Activation" />
            </p>
            {lifeStage && (
              <div className="mt-4 text-center">
                <p className="text-xs uppercase tracking-widest2 text-amber/80">
                  <Bi zh="当前所处阶段" en="Current Life Stage" />
                </p>
                <p className="mt-1 font-display text-lg">
                  <Bi zh={lifeStage.zh} en={lifeStage.en} />
                </p>
              </div>
            )}
            {abilityMap.length > 0 && (
              <div className="mt-5 space-y-3 border-t border-white/10 pt-5">
                <p className="text-xs uppercase tracking-widest2 text-lattice">
                  <Bi zh="天赋能力地图" en="Talent & Ability Map" />
                </p>
                {abilityMap.map((a) => (
                  <div key={a.key}>
                    <div className="flex items-center justify-between text-xs text-bone-dim">
                      <span><Bi zh={a.zh} en={a.en} /></span>
                      <span className="text-amber">{a.score}</span>
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[#3A2E52]/12">
                      <div className="h-full rounded-full bg-gradient-to-r from-lattice to-amber" style={{ width: `${a.score}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* v231：正文分组——12段原样保留（源流签深度解析这些具体章节，
         是这次会话里反复打磨过的内容，一个字没改），只是展示层面按
         PDF设计文档的6页结构重新分组：灵签核心页（总览+三签解析）、
         生命象征解析（融合/财富/关系/事业）、金色生命卷轴（人生阶段/
         隐藏天赋/成长路径）、封印页（生命宣言，上一版已做）。 */}
      {QIAN_PAGE_GROUPS.map((group, gi) => (
        <div
          key={gi}
          className="lx-publication-page relative mt-5 flex items-center justify-center overflow-hidden rounded-sm"
          style={{ backgroundImage: `url(/images/qian-full/${group.bg}.png)`, backgroundSize: "cover", backgroundPosition: "top" }}
        >
          <div className="lx-report-glass lx-report-glass-readable my-8 p-6 sm:mx-6 sm:p-8">
            <p className="mb-4 text-center text-xs uppercase tracking-widest2 text-amber/90">
              <Bi zh={group.titleZh} en={group.titleEn} />
            </p>
            {group.indices.map((idx) => (
              sections[idx] ? (
                <div key={idx} className={idx !== group.indices[0] ? "mt-6 border-t border-white/10 pt-5" : ""}>
                  {LAYER_TITLES[idx] && (
                    <p className="mb-3 text-xs uppercase tracking-widest2 text-lattice">
                      <Bi zh={LAYER_TITLES[idx].zh} en={LAYER_TITLES[idx].en} />
                    </p>
                  )}
                  <p className="whitespace-pre-line text-base leading-9 text-bone-dim">{sections[idx]}</p>
                </div>
              ) : null
            ))}
          </div>
        </div>
      ))}

      {sections[sections.length - 1] && (
        <div
          className="lx-publication-page relative mt-5 flex items-center justify-center overflow-hidden rounded-sm"
          style={{ backgroundImage: "url(/images/qian-full/page-5.png)", backgroundSize: "cover", backgroundPosition: "top" }}
        >
          <div className="lx-report-glass lx-report-glass-readable my-8 p-6 sm:mx-6 sm:p-8">
            {LAYER_TITLES[sections.length - 1] && (
              <p className="mb-3 text-xs uppercase tracking-widest2 text-lattice">
                <Bi zh={LAYER_TITLES[sections.length - 1].zh} en={LAYER_TITLES[sections.length - 1].en} />
              </p>
            )}
            <p className="whitespace-pre-line text-base leading-9 text-bone-dim">{sections[sections.length - 1]}</p>
            <div className="mt-6 border-t border-lattice/25 pt-5 text-center">
              <p className="font-display text-sm italic text-lattice/85">
                <Bi zh="场已回应。" en="The field has spoken." />
              </p>
            </div>
          </div>
        </div>
      )}
      </div>

      <div className="mt-6 flex flex-col items-center gap-3 lx-report-glass px-6 py-4 text-center">
        <p className="text-xs text-bone-soft">
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
