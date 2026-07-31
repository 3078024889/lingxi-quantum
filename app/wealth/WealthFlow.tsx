"use client";

import { useState } from "react";
import Link from "next/link";
import { useLang } from "@/lib/useLang";
import Bi from "@/components/Bi";
import PortalSpinner from "@/components/PortalSpinner";
import ErrorWithLoginPrompt from "@/components/ErrorWithLoginPrompt";
import { getProduct } from "@/lib/plans";
import { createClient } from "@/lib/supabase/client";
import { REVIEW_MODE } from "@/lib/reviewMode";

// v245：财富创造地图——跟生命韧性/桃花磁场同一套模式：免费快测（不
// 登录、不调用AI，纯计算）→ 付费11章节深度报告（AI现场生成、缓存）。
type WealthResult = {
  score: number; typeZh: string; typeEn: string;
  breakdown: { insight: number; build: number; connect: number; express: number; risk: number };
  sunSignZh: string; sunSignEn: string;
};

const DIM_LABELS: { key: keyof WealthResult["breakdown"]; zh: string; en: string }[] = [
  { key: "insight", zh: "洞察力", en: "Insight" },
  { key: "build", zh: "构建力", en: "Building Power" },
  { key: "connect", zh: "连接力", en: "Connecting Power" },
  { key: "express", zh: "表达力", en: "Expression Power" },
  { key: "risk", zh: "风险承担力", en: "Risk Capacity" },
];

const TEASER_CHAPTERS: { titleZh: string; titleEn: string; descZh: string; descEn: string }[] = [
  { titleZh: "财富创造源点", titleEn: "Where Your Creation Begins", descZh: "五个维度和你的创造类型放在一起，形成了怎样的整体气场——不是逐条翻译分数，是看整体形状。", descEn: "Your five dimensions and creation type together, forming your real overall field." },
  { titleZh: "天赋结构地图", titleEn: "Talent Structure Map", descZh: "具体展开你最突出的一到两项天赋，越具体越好，不是泛泛的\"你很有才华\"。", descEn: "A concrete unpacking of your one or two strongest gifts — specific, not generic flattery." },
  { titleZh: "价值表达方式", titleEn: "How Value Gets Expressed", descZh: "你的价值更容易通过思想、产品还是连接被世界接收到，具体说明为什么。", descEn: "Whether your value lands through ideas, creations, or connections — and specifically why." },
  { titleZh: "财富流动模式", titleEn: "Value Flow Pattern", descZh: "从创造到交换这条路径，你具体容易在哪个环节顺畅、哪个环节卡住。", descEn: "Exactly where your creation-to-exchange pipeline flows smoothly, and where it jams." },
  { titleZh: "资源连接方式", titleEn: "Resource Connection Style", descZh: "你更容易通过个人积累、人际网络还是环境变化获得机会，具体说明为什么。", descEn: "Whether your opportunities come from personal accumulation, networks, or shifting circumstances." },
  { titleZh: "创造阻碍模式", titleEn: "Creative Obstacle Pattern", descZh: "结合你具体的最低分维度，指出你最容易卡在哪个具体环节。", descEn: "Tied to your lowest score — the exact point where your creative flow tends to jam." },
  { titleZh: "长期复利结构", titleEn: "Long-Term Compounding Structure", descZh: "哪一类投入对你来说最值得长期培养、会随时间放大。", descEn: "The specific kind of investment most worth compounding for you, over time." },
  { titleZh: "合作与共创潜力", titleEn: "Collaboration Potential", descZh: "你更适合独立创造、伙伴合作还是团队生态，具体说明为什么。", descEn: "Whether you thrive alone, in partnership, or within a team ecosystem — and why." },
  { titleZh: "个人价值品牌", titleEn: "Personal Value Brand", descZh: "结合你的创造类型，具体说明你容易被记住的方式是什么。", descEn: "Tied to your creation type — the specific way you tend to be remembered." },
  { titleZh: "财富进化路径", titleEn: "Wealth Evolution Path", descZh: "不是变得更有钱，是让现有的创造能力形成系统——一件具体、可操作的小事。", descEn: "Not about getting richer — about turning what you have into a system. One concrete next step." },
  { titleZh: "财富创造总结", titleEn: "Wealth Creation Summary", descZh: "收尾指向前面提到过的具体分数或判断，给出你的\"创造者身份\"总结。", descEn: "A closing tied to a specific score already discussed — your creator identity, summarized." },
];

export default function WealthFlow() {
  const langEn = useLang();
  const t = (zh: string, en: string) => (langEn ? en : zh);

  const [name, setName] = useState("");
  const [year, setYear] = useState(""); const [month, setMonth] = useState(""); const [day, setDay] = useState("");
  const [hour, setHour] = useState(""); const [minute, setMinute] = useState(""); const [hasTime, setHasTime] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState<WealthResult | null>(null);
  const [error, setError] = useState("");

  const [unlocking, setUnlocking] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);

  const calc = async () => {
    if (!year || !month || !day || calculating) return;
    setCalculating(true);
    setError("");
    try {
      const res = await fetch("/api/wealth/calc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          year: parseInt(year, 10), month: parseInt(month, 10), day: parseInt(day, 10),
          hour: hasTime ? parseInt(hour, 10) : 12, minute: hasTime ? parseInt(minute, 10) : 0, hasTime,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t("计算失败，请检查出生信息。", "Calculation failed — please check your birth details."));
        setCalculating(false);
        return;
      }
      setResult(data);
    } catch {
      setError(t("连接场域时出错，请稍后再试。", "Error connecting to the field — please try again."));
    } finally {
      setCalculating(false);
    }
  };

  const unlock = async () => {
    if (!year || !month || !day || unlocking) return;
    setUnlocking(true);
    setError("");
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError(t("需要先登录，正在带你去登录页面…", "You'll need to sign in first — taking you there now…"));
        setTimeout(() => { window.location.href = "/account"; }, 1200);
        return;
      }

      const res = await fetch("/api/wealth/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          year: parseInt(year, 10), month: parseInt(month, 10), day: parseInt(day, 10),
          hour: hasTime ? parseInt(hour, 10) : 12, minute: hasTime ? parseInt(minute, 10) : 0,
          hasTime, name,
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
        window.location.href = `/wealth/full?id=${data.id}`;
        return;
      }
      // v256：改成跳转到独立付款页，不再用弹窗。
      window.location.href = `/checkout?productId=wealth-report&submissionId=${data.id}&name=${encodeURIComponent(name)}&redirect=${encodeURIComponent(`/wealth/full?id=${data.id}`)}`;
    } catch {
      setError(t("连接场域时出错，请稍后再试。", "Error connecting to the field — please try again."));
      setUnlocking(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl px-6">
      {/* v264：财富创造地图之前是"表单+分数+完整档案预告"全部挤在同一个
          压着封面图的大盒子里，没有像生命韧性那样按内容性质拆成一段段
          独立卡片，看起来就是一整块颜色，没有呼吸感。这次拆开：介绍页
          单独一块（保留封面图氛围）、填写表单单独一块纯色卡片、算完
          之后的分数/维度/预告/解锁按钮也各自独立成块，跟生命韧性、
          桃花磁场现在的结构对齐。 */}
      <div className="lx-pdf-wealth p-6 text-center">
        <p className="font-display text-sm uppercase tracking-widest2 text-amber">
          <Bi zh="灵犀场 · 财富创造地图" en="Lingxi Field · Wealth Creation Map" />
        </p>
        <p className="mt-2 text-xs uppercase tracking-widest2 text-bone-mute">
          <Bi zh="找到你与生俱来的财富创造方式" en="Find the wealth-creation way you were born with" />
        </p>
        <p className="mt-4 text-sm leading-7 text-bone-dim">
          <Bi
            zh="财富不是简单的数字。它来自你如何发现机会、如何创造价值、如何连接资源、如何让你的能力进入现实世界——这份地图不是预测你会不会发财，是探索你携带而来的那种独特创造方式。"
            en="Wealth isn't just a number. It comes from how you spot opportunity, create value, connect resources, and bring your ability into the real world — this map isn't a prediction of whether you'll get rich, it's an exploration of the specific way you're built to create."
          />
        </p>
      </div>

      <div className="lx-pdf-wealth mt-4 p-6 text-center">
        <input
          type="text" value={name} onChange={(e) => setName(e.target.value)}
          placeholder={t("你的名字（选填）", "Your name (optional)")}
          className="w-full rounded-sm border border-white/15 bg-transparent px-3 py-2 text-center text-sm text-bone outline-none focus:border-amber/60"
        />
        <div className="mt-3 flex items-center justify-center gap-2">
          <input type="number" value={year} onChange={(e) => setYear(e.target.value)} placeholder={t("年", "Y")} className="w-20 rounded-sm border border-white/15 bg-transparent px-2 py-2 text-center text-sm text-bone outline-none focus:border-amber/60" />
          <input type="number" value={month} onChange={(e) => setMonth(e.target.value)} placeholder={t("月", "M")} className="w-16 rounded-sm border border-white/15 bg-transparent px-2 py-2 text-center text-sm text-bone outline-none focus:border-amber/60" />
          <input type="number" value={day} onChange={(e) => setDay(e.target.value)} placeholder={t("日", "D")} className="w-16 rounded-sm border border-white/15 bg-transparent px-2 py-2 text-center text-sm text-bone outline-none focus:border-amber/60" />
        </div>
        <label className="mt-3 flex items-center justify-center gap-2 text-xs text-bone-dim">
          <input type="checkbox" checked={hasTime} onChange={(e) => setHasTime(e.target.checked)} />
          <Bi zh="知道具体出生时间（选填，能看得更准）" en="I know my exact birth time (optional, more precise)" />
        </label>
        {hasTime && (
          <div className="mt-2 flex items-center justify-center gap-2">
            <input type="number" value={hour} onChange={(e) => setHour(e.target.value)} placeholder={t("时", "H")} className="w-16 rounded-sm border border-white/15 bg-transparent px-2 py-2 text-center text-sm text-bone outline-none focus:border-amber/60" />
            <input type="number" value={minute} onChange={(e) => setMinute(e.target.value)} placeholder={t("分", "Min")} className="w-16 rounded-sm border border-white/15 bg-transparent px-2 py-2 text-center text-sm text-bone outline-none focus:border-amber/60" />
          </div>
        )}

        {!result && (
          <button onClick={calc} disabled={calculating} className="mt-6 flex w-full items-center justify-center gap-2 bg-amber py-4 font-display text-sm uppercase tracking-widest2 text-void-deep transition hover:bg-lattice disabled:opacity-50">
            {calculating ? <><PortalSpinner /><Bi zh="正在计算…" en="Calculating…" /></> : <Bi zh="展开我的财富创造频率 →" en="Reveal My Creation Frequency →" />}
          </button>
        )}
        {error && !result && <ErrorWithLoginPrompt error={error} className="mt-3" />}
      </div>

      {result && (
        <>
          <div className="lx-pdf-wealth mt-4 p-6 text-center">
            <p className="text-xs text-bone-soft"><Bi zh={`太阳星座：${result.sunSignZh}`} en={`Sun Sign: ${result.sunSignEn}`} /></p>
            <p className="mt-4 font-display text-3xl text-amber">{result.score} <span className="text-base text-bone-dim">/ 100</span></p>
            <p className="mt-2 font-display text-xl text-bone">「{t(result.typeZh, result.typeEn)}」</p>
          </div>

          <div className="lx-pdf-wealth mt-4 p-6">
            <div className="space-y-3">
              {DIM_LABELS.map((d) => (
                <div key={d.key}>
                  <div className="flex items-center justify-between text-xs text-bone-dim">
                    <span><Bi zh={d.zh} en={d.en} /></span>
                    <span className="text-amber">{result.breakdown[d.key]}</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-gradient-to-r from-lattice to-amber" style={{ width: `${result.breakdown[d.key]}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-6 text-center text-xs leading-6 text-bone-soft">
              <Bi
                zh="这只是数值本身——为什么是这个创造类型、具体怎样把天赋变成现实价值，完整档案会逐一写清楚。"
                en="These are just the raw numbers — why this creation type, how to actually turn your gift into real value: the full archive unpacks all of it."
              />
            </p>
          </div>

          <div className="lx-pdf-wealth mt-4 p-6 text-center">
            <div className="space-y-5 text-left">
              <p className="text-center font-display text-sm uppercase tracking-widest2 text-amber">
                <Bi zh="完整档案会逐一展开" en="What the Full Archive Unfolds" />
              </p>
              {TEASER_CHAPTERS.map((c, i) => (
                <div key={i}>
                  <p className="font-display text-sm text-amber">{String(i + 1).padStart(2, "0")} · <Bi zh={c.titleZh} en={c.titleEn} /></p>
                  <p className="mt-1.5 text-sm leading-7 text-bone-dim">
                    <Bi zh={c.descZh} en={c.descEn} />
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* v264：解锁按钮独立成一块纯色卡片，不压在上面那张带封面图
              的预告卡里——跟桃花磁场、今日运势这次统一的处理方式一致。 */}
          <div className="lx-pdf-wealth mt-4 p-6 text-center">
            <button onClick={unlock} disabled={unlocking} className="flex w-full items-center justify-center gap-2 bg-amber py-4 font-display text-sm uppercase tracking-widest2 text-void-deep transition hover:bg-lattice disabled:opacity-50">
              {unlocking ? <><PortalSpinner /><Bi zh="正在准备…" en="Preparing…" /></> : <Bi zh={`开启我的财富创造档案 · ¥${getProduct("wealth-report")?.priceRmb}`} en={`Open My Wealth Creation Archive · $${getProduct("wealth-report")?.priceUsd}`} />}
            </button>
            {error && <ErrorWithLoginPrompt error={error} className="mt-3" />}
          </div>

          <div className="lx-pdf-wealth mt-4 p-6 text-center">
            <p className="text-xs leading-6 text-bone-soft">
              <Bi
                zh="地图看见的是你的创造结构；真正让价值落地，还需要一份持续的对齐与连贯——这是「意识显化」在做的事。"
                en="The map shows your creative structure — but landing that value in reality takes ongoing alignment and coherence. That's what Consciousness Manifestation is for."
              />
            </p>
            <Link href="/live-as" className="mt-3 inline-block border border-lattice/40 px-6 py-2 text-xs uppercase tracking-widest2 text-lattice transition hover:border-lattice hover:bg-lattice hover:text-void-deep">
              <Bi zh="了解意识显化 →" en="Explore Consciousness Manifestation →" />
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
