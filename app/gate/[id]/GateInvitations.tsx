"use client";

import { useState } from "react";
import Bi from "@/components/Bi";
import { createClient } from "@/lib/supabase/client";
import { useLang } from "@/lib/useLang";

function shuffle<T>(pool: T[]): T[] {
  const a = [...pool];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function GateInvitations({
  gateId,
  gateTitle,
  gateLine,
  pool,
  poolEn,
}: {
  gateId: string;
  gateTitle: string;
  gateLine: string;
  pool: string[];
  poolEn?: string[];
}) {
  const [mood, setMood] = useState("");
  const [invites, setInvites] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState("");
  const [done, setDone] = useState(false);
  const isEn = useLang();
  const localFallback = () => {
    const en = isEn;
    const base = en && poolEn && poolEn.length ? poolEn : pool;
    return shuffle(base).slice(0, 9);
  };

  const generate = async () => {
    if (loading) return;
    setLoading(true);
    setNote("");
    const en = isEn;
    try {
      // 取近期记录作为补充语境（登录用户）
      let context = "";
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from("reality_entries")
            .select("today,feeling")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(5);
          if (data && data.length) {
            context = data
              .map((e: { today: string; feeling: string }) =>
                `- ${(e.today || "").replace(/^【梦】/, "梦：")}${e.feeling ? "；感受：" + e.feeling : ""}`
              )
              .join("\n");
          }
        }
      } catch { /* 未登录或读取失败，忽略 */ }

      const res = await fetch("/api/lingxi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "invite",
          lang: en ? "en" : "zh",
          content: en ? `The Gate of ${gateTitle}` : `${gateTitle}之门：${gateLine}`,
          mood,
          context,
        }),
      });
      const payload = await res.json();
      if (res.ok && Array.isArray(payload.invites) && payload.invites.length) {
        setInvites(payload.invites);
        setDone(true);
        setNote(
          en
            ? "Lingxi generated these from your state today."
            : "灵犀依你今天的状态，为你生成。"
        );
      } else {
        setInvites(localFallback());
        setDone(true);
        setNote(
          en
            ? "Lingxi couldn't generate just now — here is a gentle set for today."
            : "灵犀此刻未能生成，先为你准备了一组温柔的邀请。"
        );
      }
    } catch {
      setInvites(localFallback());
      setDone(true);
      setNote(
        isEn
          ? "Connection to the field failed — here is a gentle set for today."
          : "连接场域出错，先为你准备了一组温柔的邀请。"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-16">
      <p className="font-display text-sm uppercase tracking-widest2 text-amber">
        <Bi zh="与自己对话" en="A dialogue with yourself" />
      </p>
      <h2 className="mt-4 font-display text-3xl font-light text-bone">
        <Bi zh="九个邀请" en="Nine invitations" />
      </h2>
      <p className="mt-4 text-base leading-8 text-bone-dim">
        <Bi
          zh="先说说此刻的你，灵犀会依你今天的状态，为这道门生成九个专属的自我对话邀请。"
          en="Tell Lingxi how you are right now, and it will generate nine self-inquiry invitations for this gate, attuned to your state today."
        />
      </p>

      {/* 今日状态 */}
      <div className="mt-6">
        <label className="font-display text-sm tracking-widest2 text-lattice/80">
          <Bi zh="此刻，你带着怎样的心情或心事来到这道门？" en="What mood or thought do you bring to this gate right now?" />
        </label>
        <textarea
          value={mood}
          onChange={(e) => setMood(e.target.value)}
          rows={3}
          placeholder={isEn ? "e.g. a little tired, something on my mind about work…" : "例如：有点累，心里挂着一件工作上的事……（可留空）"}
          className="mt-3 w-full resize-none rounded-sm border border-white/15 bg-void-deep px-4 py-3 text-base leading-7 text-bone placeholder:text-bone-dim/40 focus:border-lattice/50 focus:outline-none"
        />
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          onClick={generate}
          disabled={loading}
          className="bg-lattice px-7 py-3.5 font-display text-sm tracking-widest2 text-void-deep transition hover:bg-amber disabled:opacity-50"
        >
          {loading ? (
            <Bi zh="灵犀正在为你生成……" en="Lingxi is generating…" />
          ) : done ? (
            <Bi zh="✦ 依当前状态重新生成" en="✦ Regenerate from my state" />
          ) : (
            <Bi zh="✦ 让灵犀为我生成九个邀请" en="✦ Generate my nine invitations" />
          )}
        </button>
      </div>

      {invites.length > 0 && (
        <div className="mt-8 space-y-4">
          {invites.map((p, i) => (
            <div key={i} className="rounded-sm border border-white/10 bg-void-deep px-6 py-5">
              <span className="font-display text-sm text-amber/70">{String(i + 1).padStart(2, "0")}</span>
              <p className="mt-2 text-base leading-8 text-bone">{p}</p>
            </div>
          ))}
        </div>
      )}
      {note && <p className="mt-4 text-sm text-bone-dim/70">{note}</p>}
    </div>
  );
}
