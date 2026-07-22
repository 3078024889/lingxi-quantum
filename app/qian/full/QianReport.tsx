"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLang } from "@/lib/useLang";
import Bi from "@/components/Bi";
import { QIAN_SIGNS, IMPRINT_LABELS } from "@/lib/qian-data";

const LAYER_TITLES = [
  { zh: "生命原型", en: "Life Archetype" },
  { zh: "潜意识映射", en: "Subconscious Mapping" },
  { zh: "阴影觉察", en: "Shadow Awareness" },
  { zh: "创造方向", en: "Creation Direction" },
];

export default function QianReport({ id }: { id: string }) {
  const langEn = useLang();
  const t = (zh: string, en: string) => (langEn ? en : zh);
  const [status, setStatus] = useState<"checking" | "locked" | "ready" | "error">("checking");
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [signs, setSigns] = useState<typeof QIAN_SIGNS>([]);
  const [sections, setSections] = useState<string[]>([]);
  const [unlocking, setUnlocking] = useState(false);

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
        setSigns((submission.sign_indexes as number[]).map((i) => QIAN_SIGNS[i]));
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
    const res = await fetch("/api/pay/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: "qian-reading", submissionId: id, returnPath: `/qian/full?id=${id}` }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else setUnlocking(false);
  };

  if (status === "checking") {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <p className="text-sm text-bone-dim">{t("正在读取你的签……", "Reading your signs…")}</p>
      </div>
    );
  }

  if (status === "locked") {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <p className="font-display text-2xl text-bone">🔒 <Bi zh="尚未解锁这份场域解读" en="Not yet unlocked" /></p>
        <button
          onClick={unlock}
          disabled={unlocking}
          className="mt-8 bg-lattice px-8 py-3 font-display text-sm uppercase tracking-widest2 text-void-deep transition hover:bg-amber disabled:opacity-50"
        >
          {unlocking ? <Bi zh="正在跳转…" en="Redirecting…" /> : <Bi zh="解锁场域解读 · $9.9" en="Unlock the Field's Reading · $9.9" />}
        </button>
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
          <Bi zh="灵犀生命印记 · 场域解读" en="Lingxi Life Oracle · Field Reading" />
        </p>
      </div>
      <h1 className="mt-6 text-center font-display text-3xl font-light text-bone">
        {name || t("你的", "Your")} <Bi zh="三重生命印记" en="Three Life Imprints" />
      </h1>

      <div className="mt-8 grid grid-cols-3 gap-3">
        {signs.map((s, i) => (
          <div key={i} className="rounded-sm border border-lattice/25 bg-void-deep p-4 text-center">
            <p className="text-[10px] uppercase tracking-widest2 text-amber/80">
              <Bi zh={IMPRINT_LABELS[i].zh} en={IMPRINT_LABELS[i].en} />
            </p>
            <p className="font-display text-2xl text-amber">{s.ganzhi}</p>
            <p className="mt-2 text-xs text-bone">
              <Bi zh={s.nameZh} en={s.nameEn} />
            </p>
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

      <div className="mt-6 rounded-sm border border-white/10 bg-void-deep px-6 py-4 text-center">
        <p className="text-xs text-bone-dim/60">
          <Bi zh="这是一份自我探索与反思的参考，不是命运预言。" en="This is a reference for self-reflection, not a prophecy." />
        </p>
      </div>
    </div>
  );
}
