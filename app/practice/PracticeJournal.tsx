"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLang } from "@/lib/useLang";
import Bi from "@/components/Bi";

type PracticeKey = "breath" | "intuition" | "heart-reset" | "ascending-heart" | "";

type Entry = { id: string; practice: PracticeKey; content: string; created_at: string };

const PRACTICE_LABEL: Record<Exclude<PracticeKey, "">, { zh: string; en: string }> = {
  breath: { zh: "量子息法", en: "Quantum Breath Method" },
  intuition: { zh: "直觉丹道", en: "The Intuitive Way" },
  "heart-reset": { zh: "归零心诀", en: "Heart Reset" },
  "ascending-heart": { zh: "上升心经", en: "Ascending Heart Sutra" },
};

// 修炼心得记录——小仙女自己平时修炼心脏呼吸，会把体会记在手机备忘录
// 里，这里给场域内一个更贴合视觉、能跨设备同步的地方去做同一件事。
// 不调用AI、不生成任何解读，纯粹是"我自己的记录"。
export default function PracticeJournal() {
  const supabase = createClient();
  const langEn = useLang();
  const t = (zh: string, en: string) => (langEn ? en : zh);
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [practice, setPractice] = useState<PracticeKey>("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
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
    const { data } = await supabase
      .from("practice_journal_entries")
      .select("id, practice, content, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(200);
    if (data) setEntries(data as Entry[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    if (!content.trim() || saving) return;
    setSaving(true);
    setError("");
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSaving(false);
      return;
    }
    const { data, error: err } = await supabase
      .from("practice_journal_entries")
      .insert({ user_id: user.id, practice: practice || null, content: content.trim() })
      .select("id, practice, content, created_at")
      .single();
    setSaving(false);
    if (err || !data) {
      setError(t("记录失败，请稍后再试。", "Couldn't save — please try again."));
      return;
    }
    setEntries((prev) => [data as Entry, ...prev]);
    setContent("");
  };

  const doDelete = async (id: string) => {
    await supabase.from("practice_journal_entries").delete().eq("id", id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
    setConfirmingId(null);
  };

  if (loading) return null;

  if (authed === false) {
    return (
      <div className="rounded-sm border border-white/10 bg-void-deep p-6 text-center">
        <p className="text-sm leading-7 text-bone-dim">
          <Bi
            zh="登录后即可开始记录你的修炼心得，云端安全同步，随时回看。"
            en="Sign in to start recording your practice notes — synced securely to the cloud, ready whenever you want to look back."
          />
        </p>
        <a
          href="/account"
          className="mt-5 inline-block bg-lattice px-8 py-3 font-display text-xs uppercase tracking-widest2 text-void-deep transition hover:bg-amber"
        >
          <Bi zh="进入场域" en="Enter the field" />
        </a>
      </div>
    );
  }

  return (
    <div className="rounded-sm border border-white/10 bg-void-deep p-6 sm:p-8">
      <p className="font-display text-sm uppercase tracking-widest2 text-lattice/80">
        <Bi zh="修炼心得记录" en="Practice Journal" />
      </p>
      <p className="mt-2 text-sm leading-7 text-bone-dim">
        <Bi
          zh="记下修炼时的体会、身体的感受、任何值得留住的一瞬——不会拿去生成任何解读，只属于你自己。"
          en="Jot down what came up during practice — a sensation, a shift, anything worth keeping. Nothing here is turned into a reading; it's yours alone."
        />
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          onClick={() => setPractice("")}
          className={`rounded-full border px-3 py-1.5 text-xs transition ${practice === "" ? "border-lattice bg-lattice/10 text-lattice" : "border-white/15 text-bone-dim hover:border-lattice/40"}`}
        >
          <Bi zh="不指定" en="General" />
        </button>
        {(Object.keys(PRACTICE_LABEL) as Exclude<PracticeKey, "">[]).map((k) => (
          <button
            key={k}
            onClick={() => setPractice(k)}
            className={`rounded-full border px-3 py-1.5 text-xs transition ${practice === k ? "border-lattice bg-lattice/10 text-lattice" : "border-white/15 text-bone-dim hover:border-lattice/40"}`}
          >
            <Bi zh={PRACTICE_LABEL[k].zh} en={PRACTICE_LABEL[k].en} />
          </button>
        ))}
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={4}
        placeholder={t("今天修炼时……", "During practice today…")}
        className="mt-4 w-full resize-none rounded-sm border border-white/15 bg-void px-5 py-4 text-base leading-8 text-bone outline-none transition focus:border-lattice/50"
      />
      <div className="mt-3 flex items-center justify-between gap-4">
        {error && <p className="text-sm text-rose">{error}</p>}
        <button
          onClick={save}
          disabled={saving || !content.trim()}
          className="ml-auto bg-lattice px-8 py-3 font-display text-xs uppercase tracking-widest2 text-void-deep transition hover:bg-amber disabled:opacity-50"
        >
          {saving ? <Bi zh="正在记录…" en="Saving…" /> : <Bi zh="记下这段心得" en="Save this note" />}
        </button>
      </div>

      {entries.length > 0 && (
        <div className="mt-8 space-y-3">
          {/* 折叠结构：跟「我的现实回路」同一套交互（lx-entry-accordion），
             默认只展开最新一条，其余收成一行摘要，点开再看全文。 */}
          {entries.map((e, i) => (
            <details key={e.id} open={i === 0} className="lx-entry-accordion group rounded-sm border border-white/10 bg-void">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-3">
                <span className="flex min-w-0 items-center gap-3">
                  <span className="shrink-0 font-display text-xs tracking-widest2 text-amber">
                    {new Date(e.created_at).toLocaleDateString(langEn ? "en-US" : "zh-CN")}
                  </span>
                  {e.practice && (
                    <span className="shrink-0 rounded-full border border-lattice/30 px-2 py-0.5 text-[10px] text-lattice">
                      <Bi zh={PRACTICE_LABEL[e.practice as Exclude<PracticeKey, "">]?.zh ?? ""} en={PRACTICE_LABEL[e.practice as Exclude<PracticeKey, "">]?.en ?? ""} />
                    </span>
                  )}
                  <span className="truncate text-sm text-bone-dim/70">{e.content.slice(0, 24)}</span>
                </span>
                <span className="shrink-0 text-xs text-bone-dim transition group-open:rotate-180">▾</span>
              </summary>
              <div className="px-5 pb-5">
                <p className="whitespace-pre-line text-base leading-8 text-bone">{e.content}</p>
                <div className="mt-3 flex justify-end">
                  {confirmingId === e.id ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => doDelete(e.id)}
                        className="rounded-sm border border-rose/50 px-2 py-1 text-[11px] text-rose transition hover:bg-rose/10"
                      >
                        <Bi zh="确认删除" en="Confirm" />
                      </button>
                      <button
                        onClick={() => setConfirmingId(null)}
                        className="rounded-sm border border-white/15 px-2 py-1 text-[11px] text-bone-dim transition hover:text-bone"
                      >
                        <Bi zh="取消" en="Cancel" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmingId(e.id)}
                      className="text-[11px] text-bone-dim/50 transition hover:text-rose"
                    >
                      <Bi zh="删除这条记录" en="Delete this note" />
                    </button>
                  )}
                </div>
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
