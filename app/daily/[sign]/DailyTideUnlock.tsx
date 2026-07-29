"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Bi from "@/components/Bi";
import { getProduct } from "@/lib/plans";
import { REVIEW_MODE } from "@/lib/reviewMode";
import { useLang } from "@/lib/useLang";
import ErrorWithLoginPrompt from "@/components/ErrorWithLoginPrompt";

// v237：今日运势潮汐的付费深度报告入口——免费的星座今日运势（这个
// 页面本身）完全不用出生时间，但深度报告需要真实出生数据才能算日主
// 五行、交叉引用今天的具体天文数据，所以这里单独收集一次，跟星座
// 选择是两件事。
const TEASER_CHAPTERS: { titleZh: string; titleEn: string; descZh: string; descEn: string }[] = [
  { titleZh: "\u4eca\u65e5\u6f6e\u6c50\u5165\u53e3", titleEn: "Today's Tide Gate", descZh: "\u7ed3\u5408\u4f60\u7684\u592a\u9633\u661f\u5ea7\u3001\u65e5\u4e3b\u4e94\u884c\uff0c\u548c\u4eca\u5929\u771f\u5b9e\u7684\u6f6e\u6c50\u5f3a\u5ea6\u3001\u6708\u4eae\u4f4d\u7f6e\uff0c\u5199\u51fa\u4eca\u5929\u5bf9\u4f60\u5177\u4f53\u610f\u5473\u7740\u4ec0\u4e48\u2014\u2014\u4e0d\u662f\u901a\u7528\u7684\"\u4eca\u65e5\u63d0\u793a\"\u3002", descEn: "Your fixed chart crossed with today's real tide and moon position \u2014 what today specifically means for you." },
  { titleZh: "\u4eca\u65e5\u884c\u52a8\u6f6e", titleEn: "Today's Action Tide", descZh: "\u7ed3\u5408\u6f6e\u6c50\u5f3a\u5ea6\u548c\u5f53\u65e5\u5b88\u62a4\u661f\uff0c\u5177\u4f53\u8bf4\u4eca\u5929\u9002\u5408\u5f80\u54ea\u4e2a\u65b9\u5411\u7528\u529b\u3001\u8282\u594f\u8be5\u5feb\u8fd8\u662f\u8be5\u7a33\u3002", descEn: "Tied to today's tide strength and ruling planet \u2014 where to push, and at what pace." },
  { titleZh: "\u4eca\u65e5\u521b\u9020\u6f6e", titleEn: "Today's Creation Tide", descZh: "\u7ed3\u5408\u4f60\u7684\u65e5\u4e3b\u4e94\u884c\u548c\u4eca\u5929\u7684\u6708\u76f8\uff0c\u5177\u4f53\u8bf4\u7075\u611f\u66f4\u5bb9\u6613\u5728\u4ec0\u4e48\u573a\u666f\u4e0b\u51fa\u73b0\u3002", descEn: "Tied to your element and today's moon phase \u2014 where inspiration is most likely to show up." },
  { titleZh: "\u4eca\u65e5\u5173\u7cfb\u6f6e", titleEn: "Today's Connection Tide", descZh: "\u7ed3\u5408\u6708\u4eae\u5143\u7d20\u4e0e\u4f60\u672c\u547d\u5143\u7d20\u7684\u5173\u7cfb\uff0c\u5177\u4f53\u8bf4\u4eca\u5929\u7684\u4eba\u9645\u4e92\u52a8\u5bb9\u6613\u987a\u7545\u8fd8\u662f\u5bb9\u6613\u6709\u6469\u64e6\u3002", descEn: "Tied to how today's moon element relates to your own \u2014 whether today favors ease or friction with others." },
  { titleZh: "\u4eca\u65e5\u4ef7\u503c\u6d41\u52a8\u6f6e", titleEn: "Today's Value Flow Tide", descZh: "\u4e0d\u5199\u53d1\u8d22\u9884\u6d4b\uff0c\u5199\u4eca\u5929\u9002\u5408\u89c2\u5bdf\u8d44\u6e90\u3001\u673a\u4f1a\u3001\u5408\u4f5c\u7684\u54ea\u4e2a\u5177\u4f53\u65b9\u9762\u3002", descEn: "Not a money prediction \u2014 where to actually look for resources, opportunity, or collaboration today." },
  { titleZh: "\u4eca\u65e5\u5185\u5728\u6f6e\u6c50", titleEn: "Today's Inner Tide", descZh: "\u7ed3\u5408\u6f6e\u6c50\u5f3a\u5ea6\u548c\u9006\u884c\u60c5\u51b5\uff0c\u5177\u4f53\u8bf4\u4eca\u5929\u66f4\u9002\u5408\u5411\u5916\u63a2\u7d22\u8fd8\u662f\u5411\u5185\u6574\u7406\u3002", descEn: "Tied to today's tide and any retrogrades \u2014 whether to reach outward or turn inward today." },
  { titleZh: "\u672a\u67657\u65e5\u6f6e\u6c50\u8d8b\u52bf", titleEn: "The Next 7 Days", descZh: "7\u5929\u540e\u6f6e\u6c50\u5f3a\u5ea6\u4f1a\u5230\u591a\u5c11\u2014\u2014\u771f\u5b9e\u7b97\u51fa\u6765\u7684\u6570\u5b57\uff0c\u4e0d\u662f\u7f16\u7684\uff0c\u63cf\u8ff0\u63a5\u4e0b\u6765\u4e00\u5468\u80fd\u91cf\u632f\u5e45\u600e\u6837\u53d8\u5316\u3002", descEn: "A real, calculated tide number seven days out \u2014 how the coming week's amplitude actually shifts." },
  { titleZh: "\u672a\u676530\u65e5\u6f6e\u6c50\u8d8b\u52bf", titleEn: "The Next 30 Days", descZh: "30\u5929\u540e\u6f6e\u6c50\u5f3a\u5ea6\u3001\u7ed3\u5408\u771f\u5b9e\u7684\u4e0b\u4e00\u6b21\u5927\u6f6e/\u5c0f\u6f6e\u65f6\u95f4\u70b9\uff0c\u5177\u4f53\u63cf\u8ff0\u8fd9\u4e00\u4e2a\u6708\u7684\u80fd\u91cf\u8282\u594f\u8d70\u5411\u3002", descEn: "A real tide number thirty days out, tied to the actual next spring or neap tide \u2014 the month's real rhythm." },
  { titleZh: "\u672a\u676590\u65e5\u80fd\u91cf\u5468\u671f", titleEn: "The Next 90 Days", descZh: "90\u5929\u540e\u6f6e\u6c50\u5f3a\u5ea6\uff0c\u63cf\u8ff0\u8fd9\u4e2a\u66f4\u957f\u5468\u671f\u91cc\uff0c\u80fd\u91cf\u662f\u5728\u79ef\u84c4\u3001\u91ca\u653e\u8fd8\u662f\u8f6c\u5316\u3002", descEn: "A real tide number ninety days out \u2014 whether this longer cycle is building, releasing, or transforming." },
  { titleZh: "\u7075\u7280\u573a\u4eca\u65e5\u8fde\u63a5", titleEn: "Today's Practice", descZh: "\u4e00\u4e2a\u5177\u4f53\u3001\u53ef\u6267\u884c\u7684\u4eca\u65e5\u5c0f\u7ec3\u4e60\uff0c\u7ed3\u5408\u524d\u9762\u63d0\u5230\u7684\u5177\u4f53\u6f6e\u6c50\u72b6\u6001\uff0c\u4e0d\u662f\"\u6df1\u547c\u5438\"\u8fd9\u79cd\u901a\u7528\u5efa\u8bae\u3002", descEn: "A specific, doable practice for today, tied to your actual tide state \u2014 not \"just breathe.\"" },
  { titleZh: "\u4eca\u65e5\u8fd0\u52bf\u6f6e\u6c50\u603b\u7ed3", titleEn: "Tide Summary", descZh: "\u6536\u5c3e\u5fc5\u987b\u6307\u5411\u524d\u9762\u63d0\u5230\u8fc7\u7684\u5177\u4f53\u6f6e\u6c50\u6570\u5b57\u6216\u5224\u65ad\uff0c\u4e0d\u662f\u9760\u60c5\u7eea\u8bcd\u6536\u5c3e\u3002", descEn: "A closing tied to a specific tide number already discussed \u2014 not a warm-and-fuzzy sendoff." },
];

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

  const unlock = async () => {
    if (!year || !month || !day || unlocking) return;
    setUnlocking(true);
    setError("");
    try {
      // v244：之前这里没有提前检查登录状态，未登录的用户点"解锁"
      // 之后，只能等后端返回"请先登录"这句纯文字提示，找不到
      // 登录入口在哪——这里改成提交前先本地检查一次，没登录就
      // 直接带去登录页，跟关系共振那边已经在用的处理方式一致。
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError(t("需要先登录，正在带你去登录页面…", "You'll need to sign in first — taking you there now…"));
        setTimeout(() => { window.location.href = "/account"; }, 1200);
        return;
      }

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
      // v256：改成跳转到独立付款页，不再用弹窗。
      window.location.href = `/checkout?productId=daily-tide-report&submissionId=${data.id}&redirect=${encodeURIComponent(`/daily/full?id=${data.id}`)}`;
    } catch {
      setError(t("连接场域时出错，请稍后再试。", "Error connecting to the field — please try again."));
      setUnlocking(false);
    }
  };

  return (
    <div
      className="lx-glass mt-6 p-6 text-center"
      style={{ backgroundImage: "linear-gradient(rgba(10,20,42,0.38), rgba(10,20,42,0.38)), url(/images/daily-tide-full/page-0.jpg)", backgroundSize: "cover", backgroundPosition: "center" }}
    >
      <p className="font-display text-sm uppercase tracking-widest2 text-lattice">
        <Bi zh="想看得更深？" en="Want to go deeper?" />
      </p>
      <p className="mt-2 text-sm leading-7 text-bone-dim">
        <Bi
          zh="这只是今天的星座运势——加上你真实的出生信息，能展开一份从今天开始的深度潮汐报告：今日六重潮汐，加上未来7/30/90天真实算出来的潮汐趋势，可以下载、永久保存。"
          en="This is just today's sign-level reading — add your real birth data to unfold a deep tide report starting today: six daily tides, plus real 7/30/90-day tide trends, downloadable and yours to keep."
        />
      </p>

      <div className="mt-6 space-y-5 border-t border-white/10 pt-6 text-left">
        <p className="text-center font-display text-sm uppercase tracking-widest2 text-lattice">
          <Bi zh="完整档案会逐一展开" en="What the Full Archive Unfolds" />
        </p>
        {TEASER_CHAPTERS.map((c, i) => (
          <div key={i}>
            <p className="font-display text-sm text-lattice">{String(i + 1).padStart(2, "0")} · <Bi zh={c.titleZh} en={c.titleEn} /></p>
            <p className="mt-1.5 text-sm leading-7 text-bone-dim">
              <Bi zh={c.descZh} en={c.descEn} />
            </p>
          </div>
        ))}
      </div>

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
      {error && <ErrorWithLoginPrompt error={error} className="mt-3" />}

      
    </div>
  );
}
