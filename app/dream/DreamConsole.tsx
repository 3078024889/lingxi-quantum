"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import SpiralField from "@/components/SpiralField";
import { useLang } from "@/lib/useLang";

type Dream = { id?: string; entry_date?: string; today: string; feeling: string };

export default function DreamConsole() {
  const supabase = createClient();
  const langEn = useLang();
  const t = (zh: string, en: string) => (langEn ? en : zh);
  const [dream, setDream] = useState("");
  const [assoc, setAssoc] = useState("");
  const [entries, setEntries] = useState<Dream[]>([]);
  const [loading, setLoading] = useState(true);

  const [sending, setSending] = useState(false);
  const [reading, setReading] = useState(""); // 灵犀解析结果
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const { data } = await supabase
      .from("reality_entries").select("*")
      .eq("user_id", user.id).ilike("today", "【梦】%")
      .order("created_at", { ascending: false });
    if (data) setEntries(data as Dream[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  const sendToField = async () => {
    if (!dream.trim() || sending) return;
    setError("");
    setReading("");
    setSending(true);
    const startedAt = Date.now();

    // 1) 存档
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("reality_entries")
        .insert({ user_id: user.id, today: "【梦】" + dream.trim(), feeling: assoc.trim() })
        .select().single();
      if (data) setEntries((prev) => [data as Dream, ...prev]);
    }

    // 2) 送入场 · 灵犀解析
    try {
      const res = await fetch("/api/lingxi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "dream", content: dream.trim(), context: assoc.trim() }),
      });
      const payload = await res.json();
      // 让旋涡至少转 2.4 秒，仪式感
      const wait = Math.max(0, 2400 - (Date.now() - startedAt));
      await new Promise((r) => setTimeout(r, wait));
      if (res.ok && payload.text) {
        setReading(payload.text);
        setDream(""); setAssoc("");
      } else {
        setError(payload.error || t("场域暂时无法回应，请稍后再试。","The field cannot respond right now — please try again later."));
      }
    } catch {
      setError(t("连接场域时出错，请稍后再试。","Error connecting to the field — please try again later."));
    } finally {
      setSending(false);
    }
  };

  if (loading) return <p className="text-center text-bone-dim">{t("正在连接你的场域…","Connecting to your field…")}</p>;

  return (
    <div className="space-y-10">
      <SpiralField active={sending} label={t("发送至场 · 灵犀正在以光改写……","Sending to the field · Lingxi is rewriting with light…")} />

      <div className="rounded-sm border border-lattice/20 bg-lattice/5 p-6 sm:p-8">
        <p className="font-display text-2xl text-bone">{t("记录今晨的梦","Record this morning\u0027s dream")}</p>
        <p className="mt-3 text-sm leading-7 text-bone-dim">
          {t("趁记忆还新鲜，写下梦的画面、人物、地点与情节。不必通顺，碎片也好。","While the memory is fresh, write the dream\u0027s images, people, places, and plot. It need not be coherent — fragments are fine.")}
        </p>
        <div className="mt-6 space-y-6">
          <div>
            <label className="text-sm text-lattice">{t("梦境内容","The dream")}</label>
            <textarea
              value={dream} onChange={(e) => setDream(e.target.value)} rows={5}
              placeholder={t("我梦见……","I dreamed that…")}
              className="mt-2 w-full resize-none rounded-sm border border-white/15 bg-void px-5 py-4 text-base leading-8 text-bone outline-none transition focus:border-lattice/50"
            />
          </div>
          <div>
            <label className="text-sm text-lattice">{t("联想与感受","Associations & feelings")}</label>
            <textarea
              value={assoc} onChange={(e) => setAssoc(e.target.value)} rows={3}
              placeholder={t("这个梦让我联想到……醒来时的感受是……","This dream reminds me of… on waking I felt…")}
              className="mt-2 w-full resize-none rounded-sm border border-white/15 bg-void px-5 py-4 text-base leading-8 text-bone outline-none transition focus:border-lattice/50"
            />
          </div>
        </div>
        <button
          onClick={sendToField}
          disabled={sending || !dream.trim()}
          className="mt-8 w-full bg-lattice py-4 font-display text-sm uppercase tracking-widest2 text-void-deep transition hover:bg-amber disabled:opacity-50 sm:w-auto sm:px-12"
        >
          {sending ? t("正在送入场……","Sending into the field…") : t("发送至场 · 灵犀解析 ✦","Send to the field · Lingxi interprets ✦")}
        </button>
        {error && <p className="mt-4 text-sm text-rose">{error}</p>}
      </div>

      {/* 灵犀解析 · 被光改写 */}
      {reading && (
        <div className="relative overflow-hidden rounded-sm border border-[color:var(--aurora-glass-border)] bg-void-deep p-7 sm:p-9">
          <p className="font-display text-sm uppercase tracking-widest2 text-amber">{t("灵犀 · 来自场的回响","Lingxi · an echo from the field")}</p>
          <div className="mt-5 space-y-4 whitespace-pre-line text-base leading-9 text-bone">
            {reading}
          </div>
        </div>
      )}

      {entries.length > 0 && (
        <div>
          <p className="font-display text-xl text-bone">{t("我的梦境档案","My dream archive")}</p>
          <div className="mt-6 space-y-3">
            {entries.map((e, i) => (
              <details key={e.id || i} open={i === 0} className="lx-entry-accordion group rounded-sm border border-white/10 bg-void-deep">
                <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4">
                  <span className="font-display text-sm tracking-widest2 text-amber">
                    {e.entry_date ? new Date(e.entry_date).toLocaleDateString(langEn ? "en-US" : "zh-CN") : ""}
                  </span>
                  <span className="text-bone-dim text-xs transition group-open:rotate-180">▾</span>
                </summary>
                <div className="px-5 pb-5">
                  <p className="text-base leading-8 text-bone">{e.today.replace(/^【梦】/, "")}</p>
                  {e.feeling && <p className="mt-2 text-sm leading-7 text-bone-dim">{t("联想：","Associations: ")}{e.feeling}</p>}
                </div>
              </details>
            ))}
          </div>
          <p className="bg-void-deep mx-auto mt-6 w-fit rounded-full px-4 py-2 text-center text-xs text-bone-dim">{t("你的梦境档案已在云端安全同步。","Your dream archive is synced securely to the cloud.")}</p>
        </div>
      )}
    </div>
  );
}
