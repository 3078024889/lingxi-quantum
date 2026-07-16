"use client";

import { useEffect, useState } from "react";
import Bi from "@/components/Bi";
import { createClient } from "@/lib/supabase/client";

const isEn = () => typeof document !== "undefined" && document.documentElement.classList.contains("lang-en");
const t = (zh: string, en: string) => (isEn() ? en : zh);

const SECTION_TITLES = [
  { zh: "吸引来源", en: "Where the Attraction Comes From" },
  { zh: "关系动力", en: "Relationship Dynamics" },
  { zh: "冲突地图", en: "Conflict Map" },
  { zh: "长期潜力", en: "Long-Term Potential" },
  { zh: "成长方向", en: "Growth Direction" },
];

export default function RelationshipReportView({ id }: { id: string }) {
  const [status, setStatus] = useState<"checking" | "locked" | "generating" | "ready" | "error">("checking");
  const [error, setError] = useState("");
  const [names, setNames] = useState<{ a: string; b: string } | null>(null);
  const [sections, setSections] = useState<string[]>([]);

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
