"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLang } from "@/lib/useLang";
import Bi from "@/components/Bi";
import { LIFE_SIGNS, TIER_LABELS } from "@/lib/qian-data";

// 四段解读对应doc21的报告设计——不是随便起的名字，是"三签怎么组合→
// 天赋数字地图→当前处在哪个阶段→接下来具体练什么"这条完整的自我
// 理解路径。
const LAYER_TITLES = [
  { zh: "① 三签关系分析", en: "① Sign Relationship Analysis" },
  { zh: "② 天赋能力地图", en: "② Talent & Ability Map" },
  { zh: "③ 人生阶段分析", en: "③ Life Stage Analysis" },
  { zh: "④ 灵犀成长建议", en: "④ Lingxi Growth Guidance" },
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
        <p className="text-sm text-bone-dim">{t("正在读取你的生命灵签……", "Reading your life signs…")}</p>
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
          <Bi zh="灵犀生命灵签 · 生命灵签报告" en="Lingxi Life Oracle · Life Sign Report" />
        </p>
      </div>
      <h1 className="mt-6 text-center font-display text-3xl font-light text-bone">
        {name || t("你的", "Your")} <Bi zh="生命灵签报告" en="Life Sign Report" />
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

      <div className="mt-6 rounded-sm border border-white/10 bg-void-deep px-6 py-4 text-center">
        <p className="text-xs text-bone-dim/60">
          <Bi zh="这是一份自我探索与反思的参考，不是命运预言。" en="This is a reference for self-reflection, not a prophecy." />
        </p>
      </div>
    </div>
  );
}
