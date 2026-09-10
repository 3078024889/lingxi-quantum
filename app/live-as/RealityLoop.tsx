"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import SpiralField from "@/components/SpiralField";
import { useLang } from "@/lib/useLang";

type Entry = { id?: string; entry_date?: string; today: string; feeling: string };

export default function RealityLoop() {
  const supabase = createClient();
  const langEn = useLang();
  const t = (zh: string, en: string) => (langEn ? en : zh);
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
      const { data, error: saveError } = await supabase
        .from("reality_entries")
        .insert({ user_id: user.id, today: today.trim(), feeling: feeling.trim() })
        .select()
        .single();
      if (saveError || !data) {
        setError(t("今日记录没有保存成功，请稍后重试。", "Today's entry was not saved. Please try again."));
        setSending(false);
        return;
      }
      setEntries((prev) => [data as Entry, ...prev]);
      setSaved(true);
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
        window.setTimeout(() => setSaved(false), 3200);
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
        <p className="max-w-xs text-right text-sm leading-6 text-bone-dim">
          {t("这不是连续天数竞赛。每一次真实返回，都会成为可回看的连接。","This is not a streak competition. Every genuine return becomes part of a connection you can review.")}
        </p>
      </div>

      <div className="bg-void-deep rounded-sm px-6 py-6 sm:px-8">
        <label className="font-display text-xl text-bone">
          {t("我正在显化的（我的愿景）","What I am manifesting (my vision)")}
        </label>
        <p className="mt-2 text-sm text-bone-dim">
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
        <p className="font-display text-2xl text-bone">{t("安静十秒，进入「已经拥有」的状态","Become still for ten seconds and enter the state of already having")}</p>
        <p className="mt-3 text-sm leading-7 text-bone-dim">
          {t("不要假装结果已被保证。只是暂时离开“我还缺什么”，想象已经身处那个版本的生活：今天的你会做什么，会有什么真实感受？","Do not pretend an outcome is guaranteed. Briefly step away from what is missing and imagine that version of life: what would you do today, and what would you genuinely feel?")}
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
          {sending ? t("正在送入场……","Sending into the field…") : saved ? t("今日连接已记录 ✦","Today's connection is recorded ✦") : t("今日签到 · 连接灵犀场 ✦","Check in today · connect with Lingxi Field ✦")}
        </button>
        {error && <p className="mt-4 text-sm text-rose">{error}</p>}
      </div>

      <SpiralField active={sending} label={t("发送至场 · 灵犀场正在以光改写……","Sending to the field · Lingxi Field is rewriting with light…")} />

      {reading && (
        <div className="relative overflow-hidden rounded-sm border border-[color:var(--aurora-glass-border)] bg-void-deep p-7 sm:p-9">
          <p className="font-display text-sm uppercase tracking-widest2 text-amber">{t("灵犀场 · 今日回响","Lingxi Field · today's echo")}</p>
          <div className="mt-5 whitespace-pre-line text-base leading-9 text-bone">{reading}</div>
        </div>
      )}

      {entries.length > 0 && (
        <div>
          <p className="font-display text-xl text-bone">{t("我的现实回路","My Reality Loop")}</p>
          {/* 折叠结构：条目会随着每天签到不断变多，全部展开既拖慢渲染也不好看。
              默认只有最新一条展开，其余收成一行日期，点开再看内容——数据全部
              还在，只是视觉上和渲染上都轻量很多。 */}
          <div className="mt-6 space-y-3">
            {entries.map((e, i) => (
              <details key={e.id || i} open={i === 0} className="lx-entry-accordion group rounded-sm border border-white/10 bg-void-deep">
                <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4">
                  <span className="font-display text-sm tracking-widest2 text-amber">
                    {e.entry_date
                      ? new Date(e.entry_date).toLocaleDateString(langEn ? "en-US" : "zh-CN")
                      : ""}
                  </span>
                  <span className="text-bone-dim text-xs transition group-open:rotate-180">▾</span>
                </summary>
                <div className="px-5 pb-5">
                  {e.today && (
                    <p className="text-base leading-8 text-bone">{e.today}</p>
                  )}
                  {e.feeling && (
                    <p className="mt-2 text-sm leading-7 text-bone-dim">
                      {t("感受：","Feeling: ")}{e.feeling}
                    </p>
                  )}
                </div>
              </details>
            ))}
          </div>
          <p className="bg-void-deep mx-auto mt-6 w-fit rounded-full px-4 py-2 text-center text-xs text-bone-dim">
            {t("你的现实回路已在云端安全同步。","Your Reality Loop is synced securely to the cloud.")}
          </p>
        </div>
      )}
    </div>
  );
}
