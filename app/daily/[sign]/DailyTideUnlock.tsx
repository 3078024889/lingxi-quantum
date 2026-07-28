"use client";

import { useState } from "react";
import Bi from "@/components/Bi";
import WechatPayModal from "@/components/WechatPayModal";
import { getProduct } from "@/lib/plans";
import { REVIEW_MODE } from "@/lib/reviewMode";
import { useLang } from "@/lib/useLang";

// v237：今日运势潮汐的付费深度报告入口——免费的星座今日运势（这个
// 页面本身）完全不用出生时间，但深度报告需要真实出生数据才能算日主
// 五行、交叉引用今天的具体天文数据，所以这里单独收集一次，跟星座
// 选择是两件事。
export default function DailyTideUnlock() {
  const langEn = useLang();
  const t = (zh: string, en: string) => (langEn ? en : zh);
  const [expanded, setExpanded] = useState(false);
  const [name, setName] = useState("");
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [unlocking, setUnlocking] = useState(false);
  const [error, setError] = useState("");
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [showWechatPay, setShowWechatPay] = useState(false);

  const unlock = async () => {
    if (!year || !month || !day || unlocking) return;
    setUnlocking(true);
    setError("");
    try {
      const res = await fetch("/api/daily-tide/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          year: parseInt(year, 10), month: parseInt(month, 10), day: parseInt(day, 10),
          hour: 12, minute: 0, hasTime: false, name,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.id) {
        setError(data.error || t("保存失败，请稍后再试。", "Save failed — please try again."));
        setUnlocking(false);
        return;
      }
      setSubmissionId(data.id);
      if (REVIEW_MODE) {
        window.location.href = `/daily/full?id=${data.id}`;
        return;
      }
      setShowWechatPay(true);
      setUnlocking(false);
    } catch {
      setError(t("连接场域时出错，请稍后再试。", "Error connecting to the field — please try again."));
      setUnlocking(false);
    }
  };

  return (
    <div className="lx-glass mt-6 p-6 text-center">
      <p className="font-display text-sm uppercase tracking-widest2 text-lattice">
        <Bi zh="想看得更深？" en="Want to go deeper?" />
      </p>
      <p className="mt-2 text-sm leading-7 text-bone-dim">
        <Bi
          zh="这只是今天的星座运势——加上你真实的出生信息，能展开一份从今天开始的深度潮汐报告：今日六重潮汐，加上未来7/30/90天真实算出来的潮汐趋势，可以下载、永久保存。"
          en="This is just today's sign-level reading — add your real birth data to unfold a deep tide report starting today: six daily tides, plus real 7/30/90-day tide trends, downloadable and yours to keep."
        />
      </p>

      {!expanded ? (
        <button
          onClick={() => setExpanded(true)}
          className="mt-4 border border-lattice/40 px-6 py-2 text-xs uppercase tracking-widest2 text-lattice transition hover:border-lattice hover:text-bone"
        >
          <Bi zh="展开今日运势潮汐深度报告 →" en="Unfold the Deep Tide Report →" />
        </button>
      ) : (
        <div className="mt-4">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <input
              type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder={t("你的名字（选填）", "Your name (optional)")}
              className="w-full max-w-xs rounded-sm border border-white/15 bg-transparent px-3 py-2 text-center text-sm text-bone outline-none focus:border-lattice/60"
            />
          </div>
          <div className="mt-2 flex items-center justify-center gap-2">
            <input type="number" value={year} onChange={(e) => setYear(e.target.value)} placeholder={t("年", "Y")} className="w-20 rounded-sm border border-white/15 bg-transparent px-2 py-2 text-center text-sm text-bone outline-none focus:border-lattice/60" />
            <input type="number" value={month} onChange={(e) => setMonth(e.target.value)} placeholder={t("月", "M")} className="w-16 rounded-sm border border-white/15 bg-transparent px-2 py-2 text-center text-sm text-bone outline-none focus:border-lattice/60" />
            <input type="number" value={day} onChange={(e) => setDay(e.target.value)} placeholder={t("日", "D")} className="w-16 rounded-sm border border-white/15 bg-transparent px-2 py-2 text-center text-sm text-bone outline-none focus:border-lattice/60" />
          </div>
          <button
            onClick={unlock}
            disabled={unlocking}
            className="mt-4 w-full max-w-xs bg-lattice py-3 font-display text-sm uppercase tracking-widest2 text-void-deep transition hover:bg-amber disabled:opacity-50"
          >
            {unlocking ? <Bi zh="准备中…" en="Preparing…" /> : <Bi zh={`展开深度潮汐报告 · ¥${getProduct("daily-tide-report")?.priceRmb}`} en={`Unfold the Deep Report · $${getProduct("daily-tide-report")?.priceUsd}`} />}
          </button>
        </div>
      )}
      {error && <p className="mt-3 text-xs text-rose">{error}</p>}

      {showWechatPay && submissionId && (
        <WechatPayModal
          productId="daily-tide-report"
          submissionId={submissionId}
          priceRmb={getProduct("daily-tide-report")?.priceRmb ?? 0}
          productName={{ zh: "今日运势潮汐 · 深度报告", en: "Daily Fortune Tide · Deep Report" }}
          onClose={() => setShowWechatPay(false)}
          onSuccess={() => { window.location.href = `/daily/full?id=${submissionId}`; }}
        />
      )}
    </div>
  );
}
