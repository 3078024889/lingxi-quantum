"use client";

import { useEffect, useState } from "react";
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
];

export default function FullReportView({ id }: { id: string }) {
  const supabase = createClient();
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
  const [sections, setSections] = useState<string[]>([]);
  const [coreTypeName, setCoreTypeName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const run = async () => {
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
        const res = await fetch("/api/lifemap/generate-full", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
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
  }, [id, supabase]);

  if (status === "checking" || status === "generating") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        <div className="lm-core lm-core-active" />
        <p className="mt-8 font-display text-lg text-bone">
          {status === "checking" ? t("正在确认解锁状态…", "Confirming your unlock…") : t("灵犀正在为你，逐层展开这份完整命盘…", "Lingxi is unfolding your full chart, layer by layer…")}
        </p>
        <p className="mt-2 text-sm text-bone-dim/60">{t("这可能需要一点时间，请不要关闭页面。", "This may take a moment — please don't close this page.")}</p>
        <style>{`.lm-core { width: 90px; height: 90px; border-radius: 999px; background: radial-gradient(circle at 50% 45%, #fff6e8, #C9A5D8 45%, transparent 75%); animation: lm-breathe 1.5s ease-in-out infinite; } @keyframes lm-breathe { 0%,100% { transform: scale(1); opacity: .75; } 50% { transform: scale(1.18); opacity: 1; } }`}</style>
      </div>
    );
  }

  if (status === "locked") {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <p className="font-display text-2xl text-bone">🔒 <Bi zh="尚未解锁这份报告" en="This report isn't unlocked yet" /></p>
        <p className="mt-4 text-sm leading-7 text-bone-dim">
          <Bi zh="回到生命图谱页面，重新走一次解锁流程。" en="Head back to the Life Map page to complete the unlock." />
        </p>
        <a href="/life-map" className="mt-8 inline-block border border-lm-violet/40 px-8 py-3 font-display text-sm uppercase tracking-widest2 text-lm-violet transition hover:border-lm-violet hover:text-bone">
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

  return (
    <div className="px-6 py-20 print:py-6">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between print:hidden">
          <p className="font-display text-sm uppercase tracking-widest2 text-lm-violet">
            🌌 <Bi zh="完整生命频率图谱" en="Your Full Life Frequency Map" />
          </p>
          <button
            onClick={() => window.print()}
            className="rounded-sm border border-white/15 px-4 py-2 text-xs uppercase tracking-widest2 text-bone-dim transition hover:border-lm-violet hover:text-bone"
          >
            <Bi zh="下载 / 打印 PDF" en="Download / Print PDF" />
          </button>
        </div>
        <h1 className="mt-4 font-display text-3xl font-light text-bone">{coreTypeName}</h1>

        <div className="mt-12 space-y-14">
          {sections.map((content, i) => (
            <div key={i} className="break-inside-avoid">
              <p className="font-display text-xs uppercase tracking-widest2 text-lm-violet">
                {String(i + 1).padStart(2, "0")} · <Bi zh={SECTION_TITLES[i]?.zh ?? ""} en={SECTION_TITLES[i]?.en ?? ""} />
              </p>
              <div className="mt-3 whitespace-pre-line text-base leading-9 text-bone-dim">{content}</div>
            </div>
          ))}
        </div>

        <p className="mt-16 text-center text-xs leading-6 text-bone-dim/50 print:hidden">
          <Bi
            zh="这是一份自我探索与反思的参考，不是命运预言——生命的走向，始终由你自己选择。"
            en="This is a tool for self-exploration and reflection, not a prophecy — the direction of your life is always your own to choose."
          />
        </p>
      </div>
    </div>
  );
}
