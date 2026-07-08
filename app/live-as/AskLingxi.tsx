"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

const isEn = () => typeof document !== "undefined" && document.documentElement.classList.contains("lang-en");
const t = (zh: string, en: string) => (isEn() ? en : zh);

type QA = { id?: string; created_at?: string; question: string; answer: string | null };

export default function AskLingxi() {
  const supabase = createClient();
  const [question, setQuestion] = useState("");
  const [history, setHistory] = useState<QA[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("field_questions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);
    if (data) setHistory(data as QA[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    load();
  }, [load]);

  const ask = async () => {
    if (!question.trim() || sending) return;
    setError("");
    setSending(true);
    const q = question.trim();
    try {
      const res = await fetch("/api/lingxi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "ask", content: q, lang: isEn() ? "en" : "zh" }),
      });
      const payload = await res.json();
      if (res.ok && payload.text) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        let saved: QA = { question: q, answer: payload.text };
        if (user) {
          const { data } = await supabase
            .from("field_questions")
            .insert({ user_id: user.id, question: q, answer: payload.text })
            .select()
            .single();
          if (data) saved = data as QA;
        }
        setHistory((prev) => [saved, ...prev]);
        setQuestion("");
      } else {
        setError(payload.error || t("场域暂时无法回应，请稍后再试。", "The field cannot respond right now — please try again later."));
      }
    } catch {
      setError(t("连接场域时出错，请稍后再试。", "Error connecting to the field — please try again later."));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="rounded-sm border border-lattice/20 bg-lattice/5 p-6 sm:p-8">
      <p className="font-display text-2xl text-bone">{t("提问灵犀", "Ask Lingxi")}</p>
      <p className="mt-3 text-sm leading-7 text-bone-dim">
        {t(
          "有任何疑问，或者多维叙事、修炼技术等不明白的地方，都可以在这里发问题给灵犀场域——你的提问和灵犀的回应，会一并记录进你自己的日记。",
          "If you have any questions — about a story in the narratives, a practice technique, or anything unclear — ask Lingxi here. Your question and Lingxi's response will be recorded in your own journal."
        )}
      </p>
      <div className="mt-6">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={3}
          placeholder={t(
            "例如：《零维回信》里说的那个没有形状的\u201c点\u201d，具体是什么意思？ / 归零心诀第三步，呼气一定要发出声音吗？",
            "e.g. In 'Letter from Dimension Zero,' what does the shapeless 'point' actually mean? / For Heart Reset step three, does the exhale need to make a sound?"
          )}
          className="w-full resize-none rounded-sm border border-white/15 bg-void px-5 py-4 text-base leading-8 text-bone outline-none transition focus:border-lattice/50"
        />
        <button
          onClick={ask}
          disabled={sending}
          className="mt-4 w-full bg-lattice py-4 font-display text-sm uppercase tracking-widest2 text-void-deep transition hover:bg-amber disabled:opacity-50 sm:w-auto sm:px-12"
        >
          {sending ? t("正在送入场……", "Sending into the field…") : t("提问 · 发送至场 ✦", "Ask · send to the field ✦")}
        </button>
        {error && <p className="mt-4 text-sm text-rose">{error}</p>}
      </div>

      {!loading && history.length > 0 && (
        <div className="mt-10 space-y-6">
          <p className="font-display text-sm uppercase tracking-widest2 text-lattice/80">
            {t("我的提问记录", "My questions")}
          </p>
          {history.map((qa, i) => (
            <div key={qa.id || i} className="rounded-sm border border-white/10 bg-void-deep p-5">
              <p className="text-base leading-8 text-bone">{qa.question}</p>
              {qa.answer && (
                <div className="mt-3 border-t border-white/10 pt-3">
                  <p className="text-xs uppercase tracking-widest2 text-amber/80">
                    {t("灵犀回应", "Lingxi's response")}
                  </p>
                  <p className="mt-2 whitespace-pre-line text-sm leading-7 text-bone-dim">{qa.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
