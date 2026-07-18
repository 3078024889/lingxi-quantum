"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Bi from "@/components/Bi";
import PortalSpinner from "@/components/PortalSpinner";

type Person = { name: string; year: string; month: string; day: string; hour: string; minute: string; hasTime: boolean };
const emptyPerson: Person = { name: "", year: "", month: "", day: "", hour: "12", minute: "0", hasTime: false };

// 之前这里的语言判断是"每次调用时，直接读一次 document.documentElement
// 的class"——这在渲染的那一刻能读到对的值，但切换语言那个按钮，只是
// 切换了html标签上的一个class，不会让这个组件重新渲染，所以点了EN，
// 这些用t()生成的占位符文字，会一直停留在切换前的语言，不会跟着变。
// 生命图谱那边（LifeMapFlow.tsx）已经用MutationObserver正确处理过这个
// 问题了，这里直接搬同一套做法过来：把"当前是不是英文"变成一份真正的
// React state，用MutationObserver监听class变化，语言一变就重新渲染。
function useLang() {
  const [langEn, setLangEn] = useState(false);
  useEffect(() => {
    setLangEn(document.documentElement.classList.contains("lang-en"));
    const observer = new MutationObserver(() => {
      setLangEn(document.documentElement.classList.contains("lang-en"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);
  return langEn;
}

// 这个组件之前是定义在 RelationshipFlow 函数体内部的一个局部箭头函数——
// 看起来没问题，但React每次组件重新渲染，都会把它当成一个"全新的
// 组件类型"（哪怕代码逻辑完全一样），导致输入框在每次按键之后，都被
// 整个卸载重装一遍，焦点跟着丢失——这正是"打一个字母就断"的真正原因，
// 不是网络问题。挪到模块顶层、变成一个独立稳定的组件，问题就消失了：
// React现在认得出"这还是同一个输入框"，不会每次按键都重新创建它。
function PersonForm({ person, setPerson, label }: { person: Person; setPerson: (p: Person) => void; label: string }) {
  const langEn = useLang();
  const t = (zh: string, en: string) => (langEn ? en : zh);
  return (
    <div className="bg-void-deep rounded-sm p-6">
      <p className="font-display text-sm uppercase tracking-widest2 text-lattice">{label}</p>
      <input
        value={person.name}
        onChange={(e) => setPerson({ ...person, name: e.target.value })}
        placeholder={t("姓名（或称呼，必填）", "Name (or however you refer to them) *")}
        className="mt-4 w-full rounded-sm border border-white/15 bg-void px-4 py-3 text-sm text-bone outline-none focus:border-lattice/60"
      />
      <p className="mt-3 text-xs text-bone-dim/60">{t("出生年月日（必填）", "Birth date (required)")}</p>
      <div className="mt-1.5 grid grid-cols-3 gap-2">
        <input value={person.year} onChange={(e) => setPerson({ ...person, year: e.target.value })} placeholder={t("年", "Year")} className="rounded-sm border border-white/15 bg-void px-3 py-3 text-sm text-bone outline-none focus:border-lattice/60" />
        <input value={person.month} onChange={(e) => setPerson({ ...person, month: e.target.value })} placeholder={t("月", "Month")} className="rounded-sm border border-white/15 bg-void px-3 py-3 text-sm text-bone outline-none focus:border-lattice/60" />
        <input value={person.day} onChange={(e) => setPerson({ ...person, day: e.target.value })} placeholder={t("日", "Day")} className="rounded-sm border border-white/15 bg-void px-3 py-3 text-sm text-bone outline-none focus:border-lattice/60" />
      </div>
      <label className="mt-3 flex items-center gap-2 text-xs text-bone-dim">
        <input type="checkbox" checked={person.hasTime} onChange={(e) => setPerson({ ...person, hasTime: e.target.checked })} />
        <Bi zh="知道具体出生时间（选填，能看得更细）" en="I know the exact birth time (optional, for a finer reading)" />
      </label>
      {person.hasTime && (
        <div className="mt-2 grid grid-cols-2 gap-2">
          <input value={person.hour} onChange={(e) => setPerson({ ...person, hour: e.target.value })} placeholder={t("时（0-23）", "Hour (0-23)")} className="rounded-sm border border-white/15 bg-void px-3 py-3 text-sm text-bone outline-none focus:border-lattice/60" />
          <input value={person.minute} onChange={(e) => setPerson({ ...person, minute: e.target.value })} placeholder={t("分", "Minute")} className="rounded-sm border border-white/15 bg-void px-3 py-3 text-sm text-bone outline-none focus:border-lattice/60" />
        </div>
      )}
    </div>
  );
}

export default function RelationshipFlow() {
  const router = useRouter();
  const langEn = useLang();
  const t = (zh: string, en: string) => (langEn ? en : zh);
  const [a, setA] = useState<Person>(emptyPerson);
  const [b, setB] = useState<Person>(emptyPerson);
  const [relationshipType, setRelationshipType] = useState<"romantic" | "business" | "general">("romantic");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const valid = (p: Person) => p.name.trim() && p.year && p.month && p.day;

  const submit = async () => {
    if (!valid(a) || !valid(b)) {
      setError(t("请把两个人的姓名和出生日期都填完整。", "Please fill in both people's names and birth dates."));
      return;
    }
    setError("");
    setSubmitting(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError(t("需要先登录，正在带你去登录页面…", "You'll need to sign in first — taking you there now…"));
      setTimeout(() => { window.location.href = "/account"; }, 1200);
      return;
    }

    const toPayload = (p: Person) => ({
      name: p.name.trim(),
      year: parseInt(p.year, 10), month: parseInt(p.month, 10), day: parseInt(p.day, 10),
      hour: p.hasTime ? parseInt(p.hour, 10) : 12, minute: p.hasTime ? parseInt(p.minute, 10) : 0,
      hasTime: p.hasTime,
    });

    try {
      const saveRes = await fetch("/api/relationship/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ a: toPayload(a), b: toPayload(b), relationshipType }),
      });
      const saveData = await saveRes.json();
      if (!saveRes.ok || !saveData.id) {
        setSubmitting(false);
        setError(saveData.error || t("提交失败，请稍后再试。", "Submission failed — please try again."));
        return;
      }

      // 已经解锁过"关系共振图谱"的人（买过一次，规则是永久解锁、可以
      // 反复测不同的两人），这里不应该再走一次付款——直接带去结果页，
      // 结果页那边的接口自己会认这份解锁状态。
      const { data: unlockRows } = await supabase.from("unlocks").select("product_id").eq("user_id", user.id);
      const already = (unlockRows ?? []).some((r: { product_id: string }) => r.product_id === "relationship-resonance" || r.product_id === "everything");
      if (already) {
        router.push(`/relationship/full?id=${saveData.id}`);
        return;
      }

      const payRes = await fetch("/api/pay/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: "relationship-resonance",
          submissionId: saveData.id,
          returnPath: `/relationship/full?id=${saveData.id}&paid=1`,
        }),
      });
      const payData = await payRes.json();
      if (payData.url) {
        window.location.href = payData.url;
      } else {
        setSubmitting(false);
        setError(payData.error || t("跳转支付失败，请稍后再试。", "Couldn't start checkout — please try again."));
      }
    } catch {
      setSubmitting(false);
      setError(t("连接场域时出错，请稍后再试。", "Error connecting to the field — please try again."));
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <p className="font-display text-sm uppercase tracking-widest2 text-lattice/80">
        <Bi zh="灵犀 · 关系共振图谱" en="Lingxi · Relationship Resonance Map" />
      </p>
      <h1 className="mt-4 font-display text-3xl font-light text-bone sm:text-4xl">
        <Bi zh="不是合不合，是能被看见的共振结构" en={'Not "do we match" — a resonance structure you can actually see'} />
      </h1>
      <p className="mt-4 max-w-xl text-base leading-8 text-bone-dim">
        <Bi
          zh="灵犀不会告诉你「你们很配」——它会照见，两个人各自的十项生命向量放在一起时，哪几项数值几乎重合（天然共鸣）、哪几项恰好互补对齐（天然分工）、哪几项同时冲得很高却没有另一端接住（真实的摩擦点）。这些数值，来自两份完整命盘——西方占星、中式八字、紫微斗数、玛雅Tzolkin、吠陀占星——彼此印证出的具体位置，不是「你水瓶座他天蝎座所以很配」这种笼统说法。"
          en={`Lingxi won't tell you "you're compatible." It will reveal, across ten life-vector dimensions, exactly where your two charts align almost precisely (natural resonance), where they land on opposite ends of the same axis (natural complementarity), and where you're both running hot on the same drive with nothing to balance it (a real friction point) — all traced to specific positions across two full charts (Western astrology, Chinese Bazi, Ziwei Doushu, Maya Tzolkin, Vedic astrology), not "you're an Aquarius, they're a Scorpio, so..."`}
        />
      </p>

      <div className="bg-void-deep mt-8 rounded-sm p-5">
        <p className="text-sm text-bone-dim"><Bi zh="这是什么关系？" en="What kind of relationship is this?" /></p>
        <div className="mt-2 flex flex-wrap gap-2">
          {([
            { id: "romantic", zh: "亲密关系", en: "Romantic" },
            { id: "business", zh: "合伙/商业", en: "Business" },
            { id: "general", zh: "其他关系", en: "Other" },
          ] as const).map((opt) => (
            <button
              key={opt.id}
              onClick={() => setRelationshipType(opt.id)}
              className={`rounded-sm border px-4 py-2 text-sm transition ${relationshipType === opt.id ? "border-lattice bg-lattice/10 text-lattice" : "border-white/15 text-bone-dim hover:border-lattice/40"}`}
            >
              <Bi zh={opt.zh} en={opt.en} />
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <PersonForm person={a} setPerson={setA} label={t("第一个人", "Person A")} />
        <PersonForm person={b} setPerson={setB} label={t("第二个人", "Person B")} />
      </div>

      {error && (
        <div className="bg-void-deep mt-4 rounded-sm border border-rose/30 p-4">
          <p className="text-sm text-rose">{error}</p>
        </div>
      )}

      <button
        onClick={submit}
        disabled={submitting}
        className="mt-8 flex w-full items-center justify-center gap-2 bg-lattice py-4 font-display text-sm uppercase tracking-widest2 text-void-deep transition hover:bg-amber disabled:opacity-50"
      >
        {submitting ? <><PortalSpinner /><Bi zh="正在准备…" en="Preparing…" /></> : <Bi zh="开始能量交换 · $9.9" en="Begin Energy Exchange · $9.9" />}
      </button>
      <div className="bg-void-deep mt-3 rounded-sm p-3 text-center">
        <p className="text-xs text-bone-dim/90">
          <Bi zh="一次交换，永久解锁——之后可以用不同的两个人再测，不用重复付费。" en="One exchange, unlocked forever — test as many pairs as you like afterward, no repeat payment." />
        </p>
      </div>
    </div>
  );
}
