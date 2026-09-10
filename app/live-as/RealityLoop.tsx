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
      if (process.env.NODE_ENV !== "production" && process.env.NEXT_PUBLIC_REVIEW_MODE === "true") {
        setAuthed(true);
        setLoading(false);
        return;
      }
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
      if (vision.trim()) {
        const { error: visionError } = await supabase
          .from("visions")
          .upsert({ user_id: user.id, vision: vision.trim(), updated_at: new Date().toISOString() });
        if (visionError) {
          setError(t("愿景没有保存成功，请稍后重试。", "Your vision was not saved. Please try again."));
          setSending(false);
          return;
        }
      }
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
    <div className="mf-loop">
      <div className="mf-loop-grid">
        <div className="mf-checkin-count"><div className="mf-checkin-ring"><span>✓</span></div><p>{t("已签到","Checked in")}</p><strong>{streak}<small>{t(" 天"," days")}</small></strong><i>{t("每一次返回，都留下真实记录。","Every return leaves a real record.")}</i></div>
        <label className="mf-loop-field"><span>✦</span><b>{t("我正在显化的（我的愿景）","What I am manifesting")}</b><textarea value={vision} onChange={(e) => setVision(e.target.value)} rows={3} placeholder={t("例如：我正在稳定地活出更健康、更自由的生活……","For example: I am steadily living a healthier, freer life…")} /></label>
        <label className="mf-loop-field"><span>↗</span><b>{t("今天我在做什么","What I am doing today")}</b><textarea value={today} onChange={(e) => setToday(e.target.value)} rows={3} placeholder={t("写下今天为此采取的具体行动……","Write the concrete action you are taking today…")} /></label>
        <label className="mf-loop-field"><span>♡</span><b>{t("此刻我的感受","How I feel right now")}</b><textarea value={feeling} onChange={(e) => setFeeling(e.target.value)} rows={3} placeholder={t("写下此刻身体、情绪或信念中的真实感受……","Name what you genuinely feel in body, emotion or belief…")} /></label>
        <div className="mf-checkin-action"><button onClick={checkIn} disabled={sending}>{sending ? t("正在保存……","Saving…") : saved ? t("今日连接已记录 ✦","Today's connection is recorded ✦") : t("今日签到，连接灵犀场 →","Check in and connect →")}</button><p>{t("愿景只在你修改时更新；行动与感受形成今天的记录。","Your vision updates only when changed; action and feeling form today's entry.")}</p></div>
      </div>
      {error && <p className="mf-loop-error">{error}</p>}

      <SpiralField active={sending} label={t("发送至场 · 灵犀场正在以光改写……","Sending to the field · Lingxi Field is rewriting with light…")} />

      {reading && (
        <div className="mf-loop-reading">
          <p>{t("灵犀场 · 今日回响","Lingxi Field · today's echo")}</p>
          <div>{reading}</div>
        </div>
      )}

      {entries.length > 0 && (
        <div className="mf-loop-history">
          <h3>{t("我的现实回路","My Reality Loop")}</h3>
          {/* 折叠结构：条目会随着每天签到不断变多，全部展开既拖慢渲染也不好看。
              默认只有最新一条展开，其余收成一行日期，点开再看内容——数据全部
              还在，只是视觉上和渲染上都轻量很多。 */}
          <div>
            {entries.map((e, i) => (
              <details key={e.id || i} open={i === 0}>
                <summary>
                  <span>
                    {e.entry_date
                      ? new Date(e.entry_date).toLocaleDateString(langEn ? "en-US" : "zh-CN")
                      : ""}
                  </span>
                  <span>▾</span>
                </summary>
                <div>
                  {e.today && (
                    <p>{e.today}</p>
                  )}
                  {e.feeling && (
                    <p>
                      {t("感受：","Feeling: ")}{e.feeling}
                    </p>
                  )}
                </div>
              </details>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
