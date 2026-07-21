"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useLang } from "@/lib/useLang";
import Bi from "@/components/Bi";
import PortalSpinner from "@/components/PortalSpinner";

export default function TarotDeepFlow() {
  const router = useRouter();
  const langEn = useLang();
  const t = (zh: string, en: string) => (langEn ? en : zh);

  const [name, setName] = useState("");
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [hasTime, setHasTime] = useState(false);
  const [hour, setHour] = useState("12");
  const [minute, setMinute] = useState("0");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!year || !month || !day || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError(t("需要先登录，正在带你去登录页面…", "You'll need to sign in first — taking you there now…"));
        window.location.href = "/account";
        return;
      }

      const saveRes = await fetch("/api/tarot/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          year: parseInt(year, 10), month: parseInt(month, 10), day: parseInt(day, 10),
          hour: hasTime ? parseInt(hour, 10) : 12, minute: hasTime ? parseInt(minute, 10) : 0,
          hasTime,
        }),
      });
      const saveData = await saveRes.json();
      if (!saveRes.ok || !saveData.id) {
        setError(saveData.error || t("保存失败，请稍后再试。", "Save failed — please try again."));
        setSubmitting(false);
        return;
      }

      const payRes = await fetch("/api/pay/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: "tarot-deep",
          submissionId: saveData.id,
          returnPath: `/tarot/deep/full?id=${saveData.id}`,
        }),
      });
      const payData = await payRes.json();
      if (payData.url) {
        window.location.href = payData.url;
      } else {
        setError(
          payData.error === "支付未配置"
            ? t("支付网关尚未配置，请联系站点管理员。", "Payment gateway isn't configured yet — please contact the site admin.")
            : payData.error || t("下单失败，请稍后再试。", "Order failed — please try again.")
        );
        // 已经存了提交记录，付款没走通——直接带去结果页，结果页会识别
        // "存在但未解锁"这个状态，展示解锁按钮，不用让用户的出生信息白填。
        router.push(`/tarot/deep/full?id=${saveData.id}`);
      }
    } catch {
      setError(t("连接场域时出错，请稍后再试。", "Error connecting to the field — please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <div className="rounded-sm border border-white/10 bg-void-deep p-6 sm:p-8">
        <p className="font-display text-sm uppercase tracking-widest2 text-lattice/80">
          <Bi zh="灵犀量子塔罗 · 深度探索" en="Lingxi Quantum Tarot · Deep Exploration" />
        </p>
        <h1 className="mt-4 font-display text-3xl font-light text-bone sm:text-4xl">
          <Bi zh="过去、现在、未来——你专属的三张牌" en="Past, Present, Future — your own three cards" />
        </h1>
        <p className="mt-4 text-base leading-8 text-bone-dim">
          <Bi
            zh="不是随机抽牌。这三张牌由你真实的命盘数据确定性算出——年柱月柱决定过去牌，日柱与太阳月亮决定现在牌，时柱与五行决定未来牌。同一份出生数据，重新打开看到的还是同样的三张牌，AI只负责把这三张牌交叉引用你的命盘，写成一段连贯的解读。"
            en="Not a random draw. These three cards are determined by your real chart data — year and month pillars decide the Past card, day pillar plus Sun and Moon decide Present, hour pillar and elemental balance decide Future. The same birth data always yields the same three cards; the AI's only job is weaving them into one reading, cross-referenced against your actual chart."
          />
        </p>
      </div>

      <div className="mt-6 rounded-sm border border-white/10 bg-void-deep p-6">
        <p className="text-sm text-bone-dim">{t("称呼（选填）", "Name (optional)")}</p>
        <input
          value={name} onChange={(e) => setName(e.target.value)}
          placeholder={t("怎么称呼你", "What should we call you")}
          className="mt-2 w-full rounded-sm border border-white/15 bg-void px-3 py-3 text-sm text-bone outline-none focus:border-lattice/60"
        />
        <p className="mt-4 text-sm text-bone-dim">{t("出生年月日", "Birth date")}</p>
        <div className="mt-2 grid grid-cols-3 gap-2">
          <input value={year} onChange={(e) => setYear(e.target.value)} placeholder={t("年", "Year")} className="rounded-sm border border-white/15 bg-void px-3 py-3 text-sm text-bone outline-none focus:border-lattice/60" />
          <input value={month} onChange={(e) => setMonth(e.target.value)} placeholder={t("月", "Month")} className="rounded-sm border border-white/15 bg-void px-3 py-3 text-sm text-bone outline-none focus:border-lattice/60" />
          <input value={day} onChange={(e) => setDay(e.target.value)} placeholder={t("日", "Day")} className="rounded-sm border border-white/15 bg-void px-3 py-3 text-sm text-bone outline-none focus:border-lattice/60" />
        </div>
        <label className="mt-3 flex items-center gap-2 text-xs text-bone-dim">
          <input type="checkbox" checked={hasTime} onChange={(e) => setHasTime(e.target.checked)} />
          <Bi zh="知道具体出生时间（选填，未来牌会算得更准）" en="I know the exact birth time (optional, sharpens the Future card)" />
        </label>
        {hasTime && (
          <div className="mt-2 grid grid-cols-2 gap-2">
            <input value={hour} onChange={(e) => setHour(e.target.value)} placeholder={t("时（0-23）", "Hour (0-23)")} className="rounded-sm border border-white/15 bg-void px-3 py-3 text-sm text-bone outline-none focus:border-lattice/60" />
            <input value={minute} onChange={(e) => setMinute(e.target.value)} placeholder={t("分", "Minute")} className="rounded-sm border border-white/15 bg-void px-3 py-3 text-sm text-bone outline-none focus:border-lattice/60" />
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 rounded-sm border border-rose/30 bg-void-deep p-4">
          <p className="text-sm text-rose">{error}</p>
        </div>
      )}

      <button
        onClick={submit}
        disabled={submitting || !year || !month || !day}
        className="mt-6 flex w-full items-center justify-center gap-2 bg-lattice py-4 font-display text-sm uppercase tracking-widest2 text-void-deep transition hover:bg-amber disabled:opacity-50"
      >
        {submitting ? <><PortalSpinner /><Bi zh="正在连接场域…" en="Connecting to the field…" /></> : <Bi zh="解锁我的三张牌 · $9.9" en="Unlock My Three Cards · $9.9" />}
      </button>
    </div>
  );
}
