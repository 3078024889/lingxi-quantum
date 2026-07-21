"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLang } from "@/lib/useLang";
import Bi from "@/components/Bi";
import SpiralField from "@/components/SpiralField";
import { TAROT_MAJOR_ARCANA } from "@/lib/tarot-data";

type CardRef = { index: number; nameZh: string; nameEn: string; keywordsZh: string; keywordsEn: string };

export default function TarotDeepReport({ id }: { id: string }) {
  const langEn = useLang();
  const t = (zh: string, en: string) => (langEn ? en : zh);
  const [status, setStatus] = useState<"checking" | "locked" | "ready" | "error">("checking");
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [cards, setCards] = useState<{ past: CardRef; present: CardRef; future: CardRef } | null>(null);
  const [sections, setSections] = useState<string[]>([]);
  const [unlocking, setUnlocking] = useState(false);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: submission } = await supabase
        .from("tarot_submissions")
        .select("name, past_index, present_index, future_index")
        .eq("id", id)
        .single();
      if (submission) {
        setName(submission.name || "");
        setCards({
          past: TAROT_MAJOR_ARCANA[submission.past_index],
          present: TAROT_MAJOR_ARCANA[submission.present_index],
          future: TAROT_MAJOR_ARCANA[submission.future_index],
        });
      }

      const currentLangEn = document.documentElement.classList.contains("lang-en");
      try {
        const res = await fetch("/api/tarot/generate-full", {
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
            .split(/\n\s*\n/)
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
      body: JSON.stringify({ productId: "tarot-deep", submissionId: id, returnPath: `/tarot/deep/full?id=${id}` }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else setUnlocking(false);
  };

  if (status === "checking") {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <SpiralField active label={t("正在读取你的三张牌……", "Reading your three cards…")} />
      </div>
    );
  }

  if (status === "locked") {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <p className="font-display text-2xl text-bone">🔒 <Bi zh="尚未解锁这份深度探索" en="Not yet unlocked" /></p>
        <button
          onClick={unlock}
          disabled={unlocking}
          className="mt-8 bg-lattice px-8 py-3 font-display text-sm uppercase tracking-widest2 text-void-deep transition hover:bg-amber disabled:opacity-50"
        >
          {unlocking ? <Bi zh="正在跳转…" en="Redirecting…" /> : <Bi zh="解锁我的三张牌 · $9.9" en="Unlock My Three Cards · $9.9" />}
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

  const positions = cards
    ? [
        { label: t("过去", "Past"), card: cards.past },
        { label: t("现在", "Present"), card: cards.present },
        { label: t("未来", "Future"), card: cards.future },
      ]
    : [];

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <div className="rounded-sm border border-white/10 bg-void-deep px-6 py-4 text-center">
        <p className="font-display text-sm uppercase tracking-widest2 text-lattice/80">
          <Bi zh="灵犀量子塔罗 · 深度探索" en="Lingxi Quantum Tarot · Deep Exploration" />
        </p>
      </div>
      <h1 className="mt-6 text-center font-display text-3xl font-light text-bone">
        {name || t("你的", "Your")} <Bi zh="三张牌" en="Three Cards" />
      </h1>

      <div className="mt-8 grid grid-cols-3 gap-3">
        {positions.map((p, i) => (
          <div key={i} className="overflow-hidden rounded-sm border border-lattice/25 bg-void-deep">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/images/tarot/${String(p.card.index).padStart(2, "0")}.jpg`}
              alt={p.card.nameZh}
              className="block aspect-[2/3] w-full object-cover"
            />
            <div className="px-2 py-3 text-center">
              <p className="text-[10px] uppercase tracking-widest2 text-amber/80">
                <Bi zh={p.label} en={p.label} />
              </p>
              <p className="mt-1 font-display text-sm text-bone">
                <Bi zh={p.card.nameZh} en={p.card.nameEn} />
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 space-y-5">
        {sections.map((content, i) => (
          <div key={i} className="rounded-sm border border-white/10 bg-void-deep p-6">
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
