"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Bi from "@/components/Bi";

const isEn = () => typeof document !== "undefined" && document.documentElement.classList.contains("lang-en");
const t = (zh: string, en: string) => (isEn() ? en : zh);

type Person = { name: string; year: string; month: string; day: string; hour: string; minute: string; hasTime: boolean };
const emptyPerson: Person = { name: "", year: "", month: "", day: "", hour: "12", minute: "0", hasTime: false };

export default function RelationshipFlow() {
  const router = useRouter();
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

  const PersonForm = ({ person, setPerson, label }: { person: Person; setPerson: (p: Person) => void; label: string }) => (
    <div className="bg-void-deep rounded-sm p-6">
      <p className="font-display text-sm uppercase tracking-widest2 text-lattice">{label}</p>
      <input
        value={person.name}
        onChange={(e) => setPerson({ ...person, name: e.target.value })}
        placeholder={t("姓名（或称呼）", "Name (or however you refer to them)")}
        className="mt-4 w-full rounded-sm border border-white/15 bg-void px-4 py-3 text-sm text-bone outline-none focus:border-lattice/60"
      />
      <div className="mt-3 grid grid-cols-3 gap-2">
        <input value={person.year} onChange={(e) => setPerson({ ...person, year: e.target.value })} placeholder={t("年", "Year")} className="rounded-sm border border-white/15 bg-void px-3 py-3 text-sm text-bone outline-none focus:border-lattice/60" />
        <input value={person.month} onChange={(e) => setPerson({ ...person, month: e.target.value })} placeholder={t("月", "Month")} className="rounded-sm border border-white/15 bg-void px-3 py-3 text-sm text-bone outline-none focus:border-lattice/60" />
        <input value={person.day} onChange={(e) => setPerson({ ...person, day: e.target.value })} placeholder={t("日", "Day")} className="rounded-sm border border-white/15 bg-void px-3 py-3 text-sm text-bone outline-none focus:border-lattice/60" />
      </div>
      <label className="mt-3 flex items-center gap-2 text-xs text-bone-dim">
        <input type="checkbox" checked={person.hasTime} onChange={(e) => setPerson({ ...person, hasTime: e.target.checked })} />
        <Bi zh="知道具体出生时间（选填，能算得更精确）" en="I know the exact birth time (optional, for more precision)" />
      </label>
      {person.hasTime && (
        <div className="mt-2 grid grid-cols-2 gap-2">
          <input value={person.hour} onChange={(e) => setPerson({ ...person, hour: e.target.value })} placeholder={t("时（0-23）", "Hour (0-23)")} className="rounded-sm border border-white/15 bg-void px-3 py-3 text-sm text-bone outline-none focus:border-lattice/60" />
          <input value={person.minute} onChange={(e) => setPerson({ ...person, minute: e.target.value })} placeholder={t("分", "Minute")} className="rounded-sm border border-white/15 bg-void px-3 py-3 text-sm text-bone outline-none focus:border-lattice/60" />
        </div>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <p className="font-display text-sm uppercase tracking-widest2 text-lattice/80">
        <Bi zh="灵犀 · 关系共振图谱" en="Lingxi · Relationship Resonance Map" />
      </p>
      <h1 className="mt-4 font-display text-3xl font-light text-bone sm:text-4xl">
        <Bi zh="两个人，一起看" en="Two people, one map" />
      </h1>
      <p className="mt-4 max-w-xl text-base leading-8 text-bone-dim">
        <Bi
          zh="伴侣、合伙人、任何一段你想看懂的关系——把两个人的出生信息都填上，灵犀会分别算出各自的生命向量，再看这两份向量放在一起，哪里天然共鸣、哪里天然互补、哪里容易起摩擦。"
          en="A partner, a business partner, any relationship you want to understand — enter both people's birth information, and Lingxi will compute each person's life vector, then see where the two naturally resonate, where they complement, and where friction is likely."
        />
      </p>

      <div className="mt-8">
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

      {error && <p className="mt-4 text-sm text-rose">{error}</p>}

      <button
        onClick={submit}
        disabled={submitting}
        className="mt-8 w-full bg-lattice py-4 font-display text-sm uppercase tracking-widest2 text-void-deep transition hover:bg-amber disabled:opacity-50"
      >
        {submitting ? <Bi zh="正在准备…" en="Preparing…" /> : <Bi zh="开始能量交换 · $9.9" en="Begin Energy Exchange · $9.9" />}
      </button>
      <p className="mt-3 text-center text-xs text-bone-dim/70">
        <Bi zh="一次交换，永久解锁——之后可以用不同的两个人再测，不用重复付费。" en="One exchange, unlocked forever — test as many pairs as you like afterward, no repeat payment." />
      </p>
    </div>
  );
}
