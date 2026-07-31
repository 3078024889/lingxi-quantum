"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLang } from "@/lib/useLang";
import Bi from "@/components/Bi";
import SpiralField from "@/components/SpiralField";

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
  // 之前这里在组件最顶层直接 const supabase = createClient()——这行
  // 代码在"每次渲染"都会执行，包括 Next.js 构建阶段对这个页面做服务器
  // 端预渲染的那一次也会执行到。预渲染发生在构建环境里，不一定能拿到
  // 跟运行时完全一致的环境变量，一旦拿不到，@supabase/ssr 会直接抛出
  // "缺少 URL/Key" 的错误，整个 `npm run build` 直接失败，其他所有页面
  // 都会被这一个页面拖累发不出去——这正是构建日志里报的那个错。
  // 改成只在真正要用到supabase的地方（下面 load/save/doDelete 各自
  // 的函数体内）才创建客户端，不在组件渲染的时候就创建——这几个函数
  // 只会在浏览器里被真正调用（页面加载后的effect、用户点击按钮），
  // 服务器端预渲染那一次根本不会执行到这几行，自然不会再报这个错。
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
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setAuthed(false);
      setLoading(false);
      return;
    }
    setAuthed(true);
    const { data, error: err } = await supabase
      .from("practice_journal_entries")
      .select("id, practice, content, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(200);
    if (err) console.error("[PracticeJournal] 读取历史记录失败，Supabase 原始错误:", err);
    if (data) setEntries(data as Entry[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    if (!content.trim() || saving) return;
    setSaving(true);
    setError("");
    const startedAt = Date.now();
    const supabase = createClient();
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
    // 直接写数据库，通常几百毫秒就结束——不加一个最短展示时长的话，
    // 九彩螺旋场会一闪而过，用户根本看不清，等于白做了这个效果。
    // 跟签到（RealityLoop.tsx）用的是同一个手法：保证至少显示够
    // 一段时间，体感上像是"场域真的在处理这件事"，不是纯粹为了拖时间。
    const wait = Math.max(0, 1800 - (Date.now() - startedAt));
    await new Promise((r) => setTimeout(r, wait));
    setSaving(false);
    if (err || !data) {
      // 把真实错误打到控制台——"记录失败，请稍后再试"这句话本身，
      // 之前完全没有区分"网络抖动"和"这张表在数据库里根本还没建出来"
      // 这两种情况，导致这条反馈完全没法用来定位问题。
      console.error("[PracticeJournal] 保存失败，Supabase 原始错误:", err);
      if (err?.code === "42P01") {
        // Postgres错误码 42P01 = relation does not exist，这是最可能的
        // 原因：新表还没在 Supabase 项目里建出来（需要在 Supabase 的
        // SQL Editor 里重新跑一次 supabase/schema.sql）。
        setError(t(
          "记录失败：数据库里还没有这张表。需要在 Supabase 后台的 SQL Editor 里，重新运行一次 schema.sql 这个文件（不会影响已有数据），建出 practice_journal_entries 这张表。",
          "Save failed: this table doesn't exist in the database yet. Re-run supabase/schema.sql in the Supabase SQL Editor (this won't affect existing data) to create the practice_journal_entries table."
        ));
      } else {
        setError(t("记录失败，请稍后再试。", "Couldn't save — please try again."));
      }
      return;
    }
    setEntries((prev) => [data as Entry, ...prev]);
    setContent("");
  };

  const doDelete = async (id: string) => {
    const supabase = createClient();
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
      <p className="font-display text-sm uppercase tracking-widest2 text-lattice">
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
        <SpiralField active={saving} label={t("正在记下这段心得……", "Recording this note…")} />
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
                    <span className="shrink-0 rounded-full border border-lattice/30 px-2 py-0.5 text-[11px] text-lattice">
                      <Bi zh={PRACTICE_LABEL[e.practice as Exclude<PracticeKey, "">]?.zh ?? ""} en={PRACTICE_LABEL[e.practice as Exclude<PracticeKey, "">]?.en ?? ""} />
                    </span>
                  )}
                  <span className="truncate text-sm text-bone-soft">{e.content.slice(0, 24)}</span>
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
                        className="rounded-sm border border-rose/50 px-2 py-1 text-xs text-rose transition hover:bg-rose/10"
                      >
                        <Bi zh="确认删除" en="Confirm" />
                      </button>
                      <button
                        onClick={() => setConfirmingId(null)}
                        className="rounded-sm border border-white/15 px-2 py-1 text-xs text-bone-dim transition hover:text-bone"
                      >
                        <Bi zh="取消" en="Cancel" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmingId(e.id)}
                      className="text-xs text-bone-soft transition hover:text-rose"
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
