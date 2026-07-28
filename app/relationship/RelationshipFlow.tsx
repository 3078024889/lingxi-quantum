"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Bi from "@/components/Bi";
import PortalSpinner from "@/components/PortalSpinner";
import WechatPayModal from "@/components/WechatPayModal";
import { getProduct } from "@/lib/plans";
import FaqSection, { type BilingualFaqItem } from "@/components/FaqSection";

const RELATIONSHIP_FAQ: BilingualFaqItem[] = [
  {
    qZh: "关系共振图谱是怎么理解两个人的关系的？", qEn: "How does the Relationship Resonance Map understand the connection between two people?",
    aZh: "灵犀场关注的不是「你们适不适合」，因为真正重要的问题，从来不是「这个人是不是我的正确答案」，而是「我们为什么会相遇」「这段连接正在呈现什么结构」。关系共振图谱会将两个人的生命信息映射到同一片关系场中，观察哪些部分天然产生共鸣（像两种频率自然靠近）、哪些部分形成互补（一个人的优势正好成为另一个人的支持）、哪些部分容易产生摩擦（不是判断谁对谁错，是看见双方不同的表达方式）。它不是一句「合」或者「不合」，而是一张帮助你理解关系运行方式的地图。",
    aEn: "Lingxi Field isn't concerned with whether you two 'match.' The real question was never 'is this person my correct answer' — it's 'why did we meet' and 'what structure is this connection showing.' The Relationship Resonance Map maps both people's life information into the same relational field, observing where they naturally resonate (like two frequencies drawing close), where they complement each other (one person's strength becomes the other's support), and where friction tends to arise (not about who's right, but about seeing each other's different modes of expression). It isn't a verdict of 'compatible' or 'not' — it's a map that helps you understand how the relationship actually runs.",
  },
  {
    qZh: "关系共振图谱只能看情侣关系吗？", qEn: "Can the Relationship Resonance Map only be used for romantic couples?",
    aZh: "不是，关系是生命中最丰富的连接形式。灵犀场目前提供三种入口：亲密关系（探索彼此吸引的来源、情绪互动方式、长期相处中的共振与挑战）、合伙商业关系（探索价值观连接、创造方式、合作节奏、资源互补）、其他关系（朋友、家人、导师、重要生命伙伴）。不同关系会展开不同观察角度，因为爱情、友情、事业，本质上都是不同形式的生命连接。",
    aEn: "No — relationships are the richest form of connection in life. Lingxi Field currently offers three entrances: intimate relationships (exploring where attraction comes from, emotional interaction styles, and the resonance and challenges of long-term closeness), business partnerships (exploring shared values, creative style, working rhythm, and complementary resources), and other relationships (friends, family, mentors, significant life companions). Different relationships open different angles of observation, because romance, friendship, and work are all, at their core, different forms of life connection.",
  },
  {
    qZh: "一次场域入口开启，能看几段关系？", qEn: "How many relationships does one field entrance opening cover?",
    aZh: "每一次关系共振开启，都会生成对应这一段关系的探索档案，针对的是当前输入的这两个人。如果想探索另一段关系，可以重新开启一次新的关系连接。灵犀场希望每一次进入，都是真实面对一段关系，而不是批量生成大量没有意义的结果——生成过的档案会保存在你的场域入口里，随时可以回看。",
    aEn: "Each opening of Relationship Resonance generates an exploration record for that specific relationship, based on the two people entered. To explore a different relationship, you can open a new connection. Lingxi Field wants each entry to be a genuine encounter with one relationship, not a batch of meaningless results — records you've generated are saved in your field entrance and can be revisited anytime.",
  },
  {
    qZh: "关系共振图谱会说两个人合不合适吗？", qEn: "Does the Relationship Resonance Map say whether two people are compatible?",
    aZh: "不会。灵犀场不会替你决定「留下还是离开」，因为关系不是一道数学题。它会帮助你看见为什么彼此吸引、哪里容易理解彼此、哪里需要更多觉察——一段关系真正珍贵的地方，不只是结果，而是在相遇过程中，两个人如何共同成长。",
    aEn: "No. Lingxi Field won't decide 'stay or leave' for you — a relationship isn't a math problem. It helps you see why you're drawn to each other, where understanding comes easily, and where more awareness is needed. What's truly valuable in a relationship isn't just the outcome, but how two people grow together through the encounter.",
  },
];



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
      <p className="mt-3 text-xs text-bone-dim/82">{t("出生年月日（必填）", "Birth date (required)")}</p>
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
  const [showWechatPay, setShowWechatPay] = useState(false);
  const [payingSubmissionId, setPayingSubmissionId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [previewing, setPreviewing] = useState(false);
  const [preview, setPreview] = useState<{
    resonance: {
      resonant: { labelZh: string; labelEn: string; a: number; b: number }[];
      complementary: { labelZh: string; labelEn: string }[];
      friction: { labelZh: string; labelEn: string }[];
    };
    sunSignA: string; sunSignB: string; sunSignAEn: string; sunSignBEn: string;
  } | null>(null);

  const valid = (p: Person) => p.name.trim() && p.year && p.month && p.day;

  const runPreview = async () => {
    if (!valid(a) || !valid(b)) {
      setError(t("请把两个人的姓名和出生日期都填完整。", "Please fill in both people's names and birth dates."));
      return;
    }
    setError("");
    setPreviewing(true);
    const toBirth = (p: Person) => ({
      year: parseInt(p.year, 10), month: parseInt(p.month, 10), day: parseInt(p.day, 10),
      hour: p.hasTime ? parseInt(p.hour, 10) : 12, minute: p.hasTime ? parseInt(p.minute, 10) : 0,
      hasTime: p.hasTime,
    });
    try {
      const res = await fetch("/api/relationship/calc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ a: toBirth(a), b: toBirth(b) }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t("计算失败，请稍后再试。", "Calculation failed — please try again."));
        setPreviewing(false);
        return;
      }
      setPreview(data);
    } catch {
      setError(t("连接场域时出错，请稍后再试。", "Error connecting to the field — please try again."));
    } finally {
      setPreviewing(false);
    }
  };

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

      setPayingSubmissionId(saveData.id);
      setShowWechatPay(true);
      setSubmitting(false);
    } catch {
      setSubmitting(false);
      setError(t("连接场域时出错，请稍后再试。", "Error connecting to the field — please try again."));
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <p className="font-display text-sm uppercase tracking-widest2 text-lattice/80">
        <Bi zh="灵犀场 · 关系共振图谱" en="Lingxi Field · Relationship Resonance Map" />
      </p>
      <h1 className="mt-4 font-display text-3xl font-light text-bone sm:text-4xl">
        <Bi zh="不是合不合，而是看见两个生命如何相遇" en="Not whether you match — seeing how two lives meet" />
      </h1>
      <p className="mt-4 max-w-xl text-base leading-8 text-bone-dim">
        <Bi
          zh="灵犀场不会告诉你「你们很配」——它会照见，两个人各自的十项生命向量放在一起时，哪几项数值几乎重合（天然共鸣）、哪几项恰好互补对齐（天然分工）、哪几项同时冲得很高却没有另一端接住（真实的摩擦点）。这些数值，来自两份完整命盘——西方占星、中式八字、紫微斗数、玛雅Tzolkin、吠陀占星——彼此印证出的具体位置，不是「你水瓶座他天蝎座所以很配」这种笼统说法。"
          en={`Lingxi Field won't tell you "you're compatible." It will reveal, across ten life-vector dimensions, exactly where your two charts align almost precisely (natural resonance), where they land on opposite ends of the same axis (natural complementarity), and where you're both running hot on the same drive with nothing to balance it (a real friction point) — all traced to specific positions across two full charts (Western astrology, Chinese Bazi, Ziwei Doushu, Maya Tzolkin, Vedic astrology), not "you're an Aquarius, they're a Scorpio, so..."`}
        />
      </p>

      <div className="bg-void-deep mt-8 rounded-sm p-5">
        <p className="text-sm text-bone-dim"><Bi zh="你们之间，正在形成怎样的连接？" en="What connection is forming between you two?" /></p>
        <div className="mt-3 grid grid-cols-3 gap-3">
          {([
            { id: "romantic", zh: "亲密关系", en: "Romantic", img: "/images/relationship/romantic.jpg" },
            { id: "business", zh: "合伙/商业", en: "Business", img: "/images/relationship/business.jpg" },
            { id: "general", zh: "其他关系", en: "Other", img: "/images/relationship/general.jpg" },
          ] as const).map((opt) => (
            <button
              key={opt.id}
              onClick={() => setRelationshipType(opt.id)}
              className={`overflow-hidden rounded-sm border text-left transition ${relationshipType === opt.id ? "border-lattice ring-1 ring-lattice" : "border-white/15 hover:border-lattice/40"}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={opt.img} alt={opt.zh} className="block aspect-[2/3] w-full object-cover" />
              <p className={`px-2 py-2 text-center text-xs ${relationshipType === opt.id ? "text-lattice" : "text-bone-dim"}`}>
                <Bi zh={opt.zh} en={opt.en} />
              </p>
            </button>
          ))}
        </div>
        <div className="mt-4 text-sm leading-7 text-bone-dim">
          {relationshipType === "romantic" && (
            <Bi
              zh="💞 亲密关系共振——看见彼此吸引的来源、情感表达方式、深层需求差异，以及关系中的成长主题。"
              en="💞 Romantic Resonance — see where the attraction comes from, how you each express emotion, where your deeper needs differ, and the theme this relationship is growing you through."
            />
          )}
          {relationshipType === "business" && (
            <Bi
              zh="🤝 合伙商业共振——看见两个人在创造、决策、资源交换中的不同角色，探索谁更适合推动、谁更擅长稳定，哪些地方容易协同、哪些地方需要提前理解。"
              en="🤝 Partnership Resonance — see the different roles you each play in creating, deciding, and exchanging resources. Who's built to push forward, who's built to hold steady, where you naturally sync, and where it helps to understand each other first."
            />
          )}
          {relationshipType === "general" && (
            <Bi
              zh="🌌 其他关系共振——朋友、家人、导师、伙伴，每一次连接都有它形成的原因。探索彼此之间如何影响、如何支持，以及这段关系带来的生命意义。"
              en="🌌 Other Resonance — friends, family, mentors, companions. Every connection forms for a reason. Explore how you shape each other, how you support each other, and what this relationship means in your life."
            />
          )}
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

      {!preview ? (
        <button
          onClick={runPreview}
          disabled={previewing}
          className="mt-8 flex w-full items-center justify-center gap-2 bg-lattice py-4 font-display text-sm uppercase tracking-widest2 text-void-deep transition hover:bg-amber disabled:opacity-50"
        >
          {previewing ? <><PortalSpinner /><Bi zh="正在计算…" en="Calculating…" /></> : <Bi zh="免费看共鸣与互补点 →" en="See Resonance & Complementarity — Free →" />}
        </button>
      ) : (
        <div className="mt-8 rounded-sm border border-lattice/25 bg-void-deep p-6">
          <p className="text-center font-display text-sm uppercase tracking-widest2 text-lattice">
            <Bi zh={`${a.name} × ${b.name} · 免费预览`} en={`${a.name} × ${b.name} · Free Preview`} />
          </p>
          <p className="mt-2 text-center text-xs text-bone-dim/85">
            <Bi zh={`太阳星座：${preview.sunSignA} × ${preview.sunSignB}`} en={`Sun Signs: ${preview.sunSignAEn} × ${preview.sunSignBEn}`} />
          </p>

          {preview.resonance.resonant.length > 0 && (
            <div className="mt-5 border-t border-white/10 pt-5">
              <p className="text-xs uppercase tracking-widest2 text-amber"><Bi zh="共鸣点 · 共享的驱动力" en="Resonance · Shared Drives" /></p>
              <div className="mt-3 space-y-2">
                {preview.resonance.resonant.map((r, i) => (
                  <p key={i} className="text-sm text-bone-dim">
                    <Bi zh={r.labelZh} en={r.labelEn} /> <span className="text-bone-dim/70">({r.a} / {r.b})</span>
                  </p>
                ))}
              </div>
            </div>
          )}
          {preview.resonance.complementary.length > 0 && (
            <div className="mt-5 border-t border-white/10 pt-5">
              <p className="text-xs uppercase tracking-widest2 text-lattice"><Bi zh="互补点 · 天然分工" en="Complementary · Natural Division" /></p>
              <div className="mt-3 flex flex-wrap gap-2">
                {preview.resonance.complementary.map((c, i) => (
                  <span key={i} className="rounded-full border border-lattice/30 px-3 py-1 text-xs text-bone-dim">
                    <Bi zh={c.labelZh} en={c.labelEn} />
                  </span>
                ))}
              </div>
            </div>
          )}
          {preview.resonance.friction.length > 0 && (
            <div className="mt-5 border-t border-white/10 pt-5">
              <p className="text-xs uppercase tracking-widest2 text-rose"><Bi zh="摩擦点 · 值得留意" en="Friction · Worth Noticing" /></p>
              <div className="mt-3 flex flex-wrap gap-2">
                {preview.resonance.friction.map((f, i) => (
                  <span key={i} className="rounded-full border border-rose/30 px-3 py-1 text-xs text-bone-dim">
                    <Bi zh={f.labelZh} en={f.labelEn} />
                  </span>
                ))}
              </div>
            </div>
          )}

          <p className="mt-6 text-center text-xs leading-6 text-bone-dim/85">
            <Bi
              zh="这只是数值本身——为什么会共鸣、这段互补具体怎么发挥作用、摩擦点要怎么面对，完整报告会逐一写清楚。"
              en="These are just the raw numbers — why the resonance forms, how the complementarity actually plays out, how to work with the friction: the full report unpacks all of it."
            />
          </p>

          <button
            onClick={submit}
            disabled={submitting}
            className="mt-4 flex w-full items-center justify-center gap-2 bg-lattice py-4 font-display text-sm uppercase tracking-widest2 text-void-deep transition hover:bg-amber disabled:opacity-50"
          >
            {submitting ? <><PortalSpinner /><Bi zh="正在准备…" en="Preparing…" /></> : <Bi zh={`解锁完整报告 · ¥${getProduct("relationship-resonance")?.priceRmb}`} en={`Unlock Full Report · ¥${getProduct("relationship-resonance")?.priceRmb}`} />}
          </button>
        </div>
      )}
      {showWechatPay && payingSubmissionId && (
        <WechatPayModal
          productId="relationship-resonance"
          submissionId={payingSubmissionId}
          priceRmb={getProduct("relationship-resonance")?.priceRmb ?? 0}
          productName={{ zh: "灵犀关系共振图谱", en: "Lingxi Relationship Resonance" }}
          onClose={() => setShowWechatPay(false)}
          onSuccess={() => { window.location.href = `/relationship/full?id=${payingSubmissionId}&paid=1`; }}
        />
      )}
      <div className="bg-void-deep mt-3 rounded-sm p-3 text-center">
        <p className="text-sm text-bone-dim/90">
          <Bi zh="一次能量交换，为你和对方生成一份完整的关系共振图谱，保存在你的场域入口里，随时可以回看、下载。" en="One energy exchange generates a full Relationship Resonance Map for you and the other person, saved in your field entrance — revisit or download it anytime." />
        </p>
      </div>
      <FaqSection items={RELATIONSHIP_FAQ} />
    </div>
  );
}
