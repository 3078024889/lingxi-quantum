"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import SpiralField from "@/components/SpiralField";

const isEn = () => typeof document !== "undefined" && document.documentElement.classList.contains("lang-en");
const t = (zh: string, en: string) => (isEn() ? en : zh);

type Entry = { id?: string; entry_date?: string; today: string; feeling: string };

export default function RealityLoop() {
  const supabase = createClient();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [vision, setVision] = useState("");
  const [today, setToday] = useState("");
  const [feeling, setFeeling] = useState("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [saved, setSaved] = useState(false);
  const [sending, setSending] = useState(false);
  const [reading, setReading] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setAuthed(false);
      setLoading(false);
      return;
    }
    setAuthed(true);
    // 读愿景
    const { data: v } = await supabase
      .from("visions")
      .select("vision")
      .eq("user_id", user.id)
      .single();
    if (v?.vision) setVision(v.vision);
    // 读历史
    const { data: e } = await supabase
      .from("reality_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (e) setEntries(e as Entry[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    load();
  }, [load]);

  const saveVision = async (val: string) => {
    setVision(val);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    await supabase
      .from("visions")
      .upsert({ user_id: user.id, vision: val, updated_at: new Date().toISOString() });
  };

  const checkIn = async () => {
    if ((!today.trim() && !feeling.trim()) || sending) return;
    setError("");
    setReading("");
    setSending(true);
    const startedAt = Date.now();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("reality_entries")
        .insert({ user_id: user.id, today: today.trim(), feeling: feeling.trim() })
        .select()
        .single();
      if (data) setEntries((prev) => [data as Entry, ...prev]);
    }
    try {
      const res = await fetch("/api/lingxi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "manifest", content: today.trim(), context: feeling.trim() }),
      });
      const payload = await res.json();
      const wait = Math.max(0, 2400 - (Date.now() - startedAt));
      await new Promise((r) => setTimeout(r, wait));
      if (res.ok && payload.text) {
        setReading(payload.text);
        setToday("");
        setFeeling("");
      } else {
        setError(payload.error || t("场域暂时无法回应，请稍后再试。","The field cannot respond right now — please try again later."));
      }
    } catch {
      setError(t("连接场域时出错，请稍后再试。","Error connecting to the field — please try again later."));
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <p className="text-center text-bone-dim">{t("正在连接你的场域…","Connecting to your field…")}</p>;
  }

  if (authed === false) {
    return (
      <div className="rounded-sm border border-lattice/20 bg-lattice/5 p-8 text-center">
        <p className="font-display text-2xl text-bone">{t("先连接到你的意识场","First, connect to your field of consciousness")}</p>
        <p className="mt-4 text-base leading-8 text-bone-dim">
          {t("登录后，你的愿景与每日现实回路将在云端安全同步，换任何设备都能继续。","Once signed in, your vision and daily Reality Loop sync securely to the cloud, so you can continue on any device.")}
        </p>
        <a
          href="/account"
          className="mt-8 inline-block bg-lattice px-10 py-4 font-display text-sm uppercase tracking-widest2 text-void-deep transition hover:bg-amber"
        >
          {t("进入场域","Enter the field")}
        </a>
      </div>
    );
  }

  const streak = new Set(
    entries.map((e) => (e.entry_date || "").slice(0, 10)).filter(Boolean)
  ).size;

  return (
    <div className="space-y-12">
      <div className="flex items-center justify-between rounded-sm border border-white/10 bg-void-deep px-6 py-5">
        <div>
          <p className="text-sm text-bone-dim">{t("已签到","Checked in")}</p>
          <p className="font-display text-3xl text-lattice">{streak}{t(" 天"," days")}</p>
        </div>
        <p className="max-w-xs text-right text-sm leading-6 text-bone-dim/80">
          {t("每天重复，保持对齐。显化与时间无关，与对齐相关。","Repeat daily, stay aligned. Manifestation has nothing to do with time and everything to do with alignment.")}
        </p>
      </div>

      <div>
        <label className="font-display text-xl text-bone">
          {t("我正在显化的（我的愿景）","What I am manifesting (my vision)")}
        </label>
        <p className="mt-2 text-sm text-bone-dim/80">
          {t("用现在时、肯定句，像它已经属于你一样写下来。这一项会一直保留。","Write it in the present tense, as an affirmation, as if it already belongs to you. This entry stays saved.")}
        </p>
        <textarea
          value={vision}
          onChange={(e) => saveVision(e.target.value)}
          rows={3}
          placeholder={t("例如：我拥有一栋河边的房子，庭院里有一棵荔枝树……","e.g. I have a house by the river, with a lychee tree in the yard…")}
          className="mt-4 w-full resize-none rounded-sm border border-white/15 bg-void px-5 py-4 text-base leading-8 text-bone outline-none transition focus:border-lattice/50"
        />
      </div>

      <div className="rounded-sm border border-lattice/20 bg-lattice/5 p-6 sm:p-8">
        <p className="font-display text-2xl text-bone">{t("进入「已经拥有」的状态","Enter the state of already having it")}</p>
        <p className="mt-3 text-sm leading-7 text-bone-dim">
          {t("想象你已身处那个版本的生活。今天，处于这种状态中的你，要做什么？会有什么感受？","Imagine you already live that version of life. Today, in this state, what would you do? How would you feel?")}
        </p>
        <div className="mt-6 space-y-6">
          <div>
            <label className="text-sm text-lattice">{t("今天我在做什么","What I am doing today")}</label>
            <textarea
              value={today}
              onChange={(e) => setToday(e.target.value)}
              rows={3}
              placeholder={t("坐在庭院里喝茶，上午亲手洗车，下午在草坪上散步……","Sipping tea in the yard, washing the car in the morning, walking on the lawn in the afternoon…")}
              className="mt-2 w-full resize-none rounded-sm border border-white/15 bg-void px-5 py-4 text-base leading-8 text-bone outline-none transition focus:border-lattice/50"
            />
          </div>
          <div>
            <label className="text-sm text-lattice">{t("此刻我的感受","How I feel right now")}</label>
            <textarea
              value={feeling}
              onChange={(e) => setFeeling(e.target.value)}
              rows={3}
              placeholder={t("平静、丰盛、被支持，深深地感恩……","calm, abundant, supported, deeply grateful…")}
              className="mt-2 w-full resize-none rounded-sm border border-white/15 bg-void px-5 py-4 text-base leading-8 text-bone outline-none transition focus:border-lattice/50"
            />
          </div>
        </div>
        <button
          onClick={checkIn}
          disabled={sending}
          className="mt-8 w-full bg-lattice py-4 font-display text-sm uppercase tracking-widest2 text-void-deep transition hover:bg-amber disabled:opacity-50 sm:w-auto sm:px-12"
        >
          {sending ? t("正在送入场……","Sending into the field…") : saved ? t("已记录 · 感恩 ✦","Recorded · gratitude ✦") : t("今日签到 · 发送至场 ✦","Check in today · send to the field ✦")}
        </button>
        {error && <p className="mt-4 text-sm text-rose">{error}</p>}
      </div>

      <SpiralField active={sending} label={t("发送至场 · 灵犀正在以光改写……","Sending to the field · Lingxi is rewriting with light…")} />

      {reading && (
        <div className="relative overflow-hidden rounded-sm border border-amber/30 bg-gradient-to-b from-amber/5 to-lattice/5 p-7 sm:p-9">
          <p className="font-display text-sm uppercase tracking-widest2 text-amber">{t("灵犀 · 来自场的回响","Lingxi · an echo from the field")}</p>
          <div className="mt-5 whitespace-pre-line text-base leading-9 text-bone">{reading}</div>
        </div>
      )}

      {entries.length > 0 && (
        <div>
          <p className="font-display text-xl text-bone">{t("我的现实回路","My Reality Loop")}</p>
          <div className="mt-6 space-y-5">
            {entries.map((e, i) => (
              <div
                key={e.id || i}
                className="rounded-sm border border-white/10 bg-void-deep p-5"
              >
                <p className="font-display text-sm tracking-widest2 text-amber">
                  {e.entry_date
                    ? new Date(e.entry_date).toLocaleDateString(isEn() ? "en-US" : "zh-CN")
                    : ""}
                </p>
                {e.today && (
                  <p className="mt-3 text-base leading-8 text-bone">{e.today}</p>
                )}
                {e.feeling && (
                  <p className="mt-2 text-sm leading-7 text-bone-dim">
                    {t("感受：","Feeling: ")}{e.feeling}
                  </p>
                )}
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-xs text-bone-dim/60">
            {t("你的现实回路已在云端安全同步。","Your Reality Loop is synced securely to the cloud.")}
          </p>
        </div>
      )}
    </div>
  );
}
