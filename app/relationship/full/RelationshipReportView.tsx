"use client";

import { useEffect, useState } from "react";
import Bi from "@/components/Bi";
import { createClient } from "@/lib/supabase/client";

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

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: submission } = await supabase
        .from("relationship_submissions")
        .select("name_a, name_b")
        .eq("id", id)
        .single();
      if (submission) setNames({ a: submission.name_a, b: submission.name_b });

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
        const parts = (data.fullReport as string)
          .split(/===\s*\d+\s*===/)
          .map((s: string) => s.trim())
          .filter(Boolean);
        setSections(parts);
        if (data.resonance) setResonance(data.resonance);
        setStatus("ready");
      } catch {
        setStatus("error");
        setError(t("连接场域时出错，请稍后再试。", "Error connecting to the field — please try again."));
      }
    };
    load();
  }, [id]);

  if (status === "checking" || status === "generating") {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <p className="font-display text-lg text-lattice"><Bi zh="正在读取两份生命向量的共振…" en="Reading the resonance between two life vectors…" /></p>
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
      <p className="font-display text-sm uppercase tracking-widest2 text-lattice/80">
        <Bi zh="灵犀 · 关系共振图谱" en="Lingxi · Relationship Resonance Map" />
      </p>
      <h1 className="mt-4 font-display text-3xl font-light text-bone">
        {names ? `${names.a} × ${names.b}` : ""}
      </h1>

      {resonance && (
        <div className="bg-void-deep mt-8 space-y-6 rounded-sm p-6">
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
      <div className="mt-10 space-y-10">
        {sections.map((content, i) => (
          <div key={i}>
            <p className="font-display text-xs uppercase tracking-widest2 text-lattice">
              {String(i + 1).padStart(2, "0")} · <Bi zh={SECTION_TITLES[i]?.zh ?? ""} en={SECTION_TITLES[i]?.en ?? ""} />
            </p>
            <div className="mt-3 whitespace-pre-line text-base leading-9 text-bone-dim">{content}</div>
          </div>
        ))}
      </div>
      <p className="mt-14 text-center text-sm text-bone-dim/70">
        <Bi zh="这是一份自我探索与反思的参考，不是关系预言——关系的走向，始终由两个人共同选择。" en="This is a reference for reflection, not a prophecy about your relationship — its course is always shaped by both people, together." />
      </p>
    </div>
  );
}
