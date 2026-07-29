"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Bi from "@/components/Bi";
import PortalSpinner from "@/components/PortalSpinner";
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

// v235：三种关系类型，各自独立的措辞——不再统一用"免费预览"这个
// 听起来廉价的词，也不再用通用的"解锁完整报告"，换成贴合每种关系
// 具体语境的说法。
const TYPE_COPY: Record<"romantic" | "business" | "general", { previewLabel: { zh: string; en: string }; unlockLabel: { zh: string; en: string } }> = {
  romantic: {
    previewLabel: { zh: "关系星图入口已开启", en: "Your Star Map Has Opened" },
    unlockLabel: { zh: "展开完整亲密关系档案", en: "Unfold the Full Relationship Archive" },
  },
  business: {
    previewLabel: { zh: "商业共振入口已开启", en: "Your Business Resonance Has Opened" },
    unlockLabel: { zh: "开启商业共振地图", en: "Open the Business Resonance Map" },
  },
  general: {
    previewLabel: { zh: "关系共振入口已开启", en: "Your Connection Field Has Opened" },
    unlockLabel: { zh: "展开双生命连接档案", en: "Unfold the Full Connection Archive" },
  },
};


const TEASER_CHAPTERS: Record<"romantic" | "business" | "general", { titleZh: string; titleEn: string; descZh: string; descEn: string }[]> = {
  romantic: [
    { titleZh: "\u53cc\u751f\u547d\u661f\u56fe", titleEn: "Dual Life Star Map", descZh: "\u4e24\u4efd\u751f\u547d\u7ed3\u6784\u7b2c\u4e00\u6b21\u53e0\u5728\u4e00\u8d77\uff0c\u4f1a\u5f62\u6210\u4ec0\u4e48\u6837\u7684\u6574\u4f53\u6c14\u573a\u2014\u2014\u4e0d\u662f\u5206\u522b\u770b\u4f60\u548c\u5bf9\u65b9\uff0c\u662f\u770b\u4e24\u4e2a\u4eba\u653e\u5728\u4e00\u8d77\u4e4b\u540e\uff0c\u957f\u51fa\u6765\u7684\u8fd9\u4e2a\u65b0\u4e1c\u897f\u3002", descEn: "What emerges the moment your two life structures overlap \u2014 not you, not them, but the third thing the two of you create together." },
    { titleZh: "\u521d\u59cb\u5438\u5f15\u6765\u6e90", titleEn: "Where the Attraction Began", descZh: "\u5177\u4f53\u5230\u662f\u5171\u9e23\u70b9\u7684\u54ea\u4e00\u9879\u3001\u8fd8\u662f\u4e92\u8865\u70b9\u7684\u54ea\u4e00\u7ec4\uff0c\u8ba9\u4f60\u4eec\u7b2c\u4e00\u6b21\u6709\"\u5bf9\u4e0a\u4e86\"\u7684\u611f\u89c9\u2014\u2014\u8fd9\u4efd\u5438\u5f15\u80fd\u88ab\u6307\u8ba4\u51fa\u6765\uff0c\u4e0d\u662f\u7384\u5b66\u3002", descEn: "Traced to the exact resonance point or complementary pair that made you feel \"this one fits\" \u2014 named specifically, not left as a mystery." },
    { titleZh: "\u60c5\u7eea\u8fde\u63a5\u6a21\u5f0f", titleEn: "Emotional Connection Pattern", descZh: "\u4f60\u4eec\u5404\u81ea\u4e60\u60ef\u7528\u4ec0\u4e48\u65b9\u5f0f\u8868\u8fbe\u5728\u4e4e\u2014\u2014\u8bed\u8a00\u3001\u884c\u52a8\u3001\u966a\u4f34\u8fd8\u662f\u7406\u89e3\uff0c\u8fd9\u4efd\u5dee\u5f02\u5177\u4f53\u4f1a\u9020\u6210\u4ec0\u4e48\u6837\u7684\u8bef\u4f1a\uff0c\u53c8\u4f1a\u5e26\u6765\u4ec0\u4e48\u6837\u7684\u60ca\u559c\u3002", descEn: "How each of you actually shows you care \u2014 and exactly where that difference creates friction, and where it creates delight." },
    { titleZh: "\u4ef7\u503c\u89c2\u5171\u632f\u5730\u56fe", titleEn: "Values Resonance Map", descZh: "\u4f60\u4eec\u5728\u5b89\u5168\u611f\u3001\u6210\u957f\u3001\u81ea\u7531\u8fd9\u4e9b\u5e95\u5c42\u4ef7\u503c\u4e0a\uff0c\u54ea\u4e9b\u662f\u771f\u7684\u5171\u4eab\uff0c\u54ea\u4e9b\u53ea\u662f\u8868\u9762\u91cd\u5408\u2014\u2014\u8bf4\u6e05\u695a\uff0c\u4e0d\u662f\u7b3c\u7edf\u5730\u8bf4\"\u4e09\u89c2\u4e00\u81f4\"\u3002", descEn: "Which core values you genuinely share, and which only look aligned on the surface \u2014 spelled out, not waved at." },
    { titleZh: "\u6c9f\u901a\u8bed\u8a00\u5730\u56fe", titleEn: "Communication Language Map", descZh: "\u4e24\u4eba\u63a5\u6536\u4fe1\u606f\u7684\u65b9\u5f0f\u6709\u4ec0\u4e48\u5177\u4f53\u4e0d\u540c\uff0c\u7ed9\u51fa\u771f\u6b63\u80fd\u843d\u5730\u7684\u6c9f\u901a\u5efa\u8bae\uff0c\u4e0d\u662f\"\u591a\u6c9f\u901a\"\u8fd9\u79cd\u8c01\u90fd\u4f1a\u8bf4\u7684\u8bdd\u3002", descEn: "The real difference in how you each take in information \u2014 with an actual, usable suggestion, not \"just communicate more.\"" },
    { titleZh: "\u51b2\u7a81\u89e6\u53d1\u7ed3\u6784", titleEn: "Conflict Trigger Structure", descZh: "\u8fd9\u6bb5\u5173\u7cfb\u6700\u5bb9\u6613\u5728\u4ec0\u4e48\u5177\u4f53\u573a\u666f\u4e0b\u8d77\u51b2\u7a81\u3001\u901a\u5e38\u600e\u4e48\u5347\u7ea7\u2014\u2014\u63d0\u524d\u770b\u89c1\uff0c\u6bd4\u4e8b\u540e\u6536\u62fe\u8981\u7701\u529b\u5f97\u591a\u3002", descEn: "The exact scenarios most likely to spark conflict between you two, and how it tends to escalate \u2014 seeing it coming beats cleaning up after." },
    { titleZh: "\u5173\u7cfb\u6210\u957f\u8def\u5f84", titleEn: "Relationship Growth Path", descZh: "\u4ece\u5438\u5f15\u5230\u7406\u89e3\u5230\u5171\u521b\uff0c\u4f60\u4eec\u5177\u4f53\u4f1a\u7ecf\u5386\u4ec0\u4e48\u6837\u7684\u9636\u6bb5\u6027\u8bfe\u9898\u2014\u2014\u7ed3\u5408\u4f60\u4eec\u7684\u5177\u4f53\u7279\u8d28\uff0c\u4e0d\u662f\u5957\u7528\"\u4e09\u9636\u6bb5\u8bba\"\u3002", descEn: "The specific stage-by-stage lessons your particular pairing tends to move through \u2014 not a generic three-stage template." },
    { titleZh: "\u9690\u85cf\u4e92\u8865\u529b\u91cf", titleEn: "Hidden Complementary Strength", descZh: "\u5bf9\u65b9\u8eab\u4e0a\u6709\u54ea\u4e9b\u5177\u4f53\u7279\u8d28\uff0c\u6070\u597d\u8865\u4e0a\u4f60\u81ea\u5df1\u5bb9\u6613\u5ffd\u7565\u7684\u5730\u65b9\u2014\u2014\u662f\u53cc\u5411\u7684\u793c\u7269\uff0c\u4e0d\u662f\u5355\u65b9\u9762\u7684\u4ed8\u51fa\u3002", descEn: "The specific traits in your partner that quietly cover your own blind spots \u2014 a two-way gift, not a one-sided trade." },
    { titleZh: "\u957f\u671f\u5171\u632f\u6f5c\u529b", titleEn: "Long-Term Resonance Potential", descZh: "\u8fd9\u6bb5\u5173\u7cfb\u9700\u8981\u5177\u4f53\u5efa\u7acb\u4ec0\u4e48\u6837\u7684\u5171\u8bc6\u6216\u5206\u5de5\uff0c\u624d\u80fd\u8d70\u5f97\u8fdc\u2014\u2014\u4e0d\u662f\u9884\u6d4b\u7ed3\u679c\uff0c\u662f\u6307\u51fa\u6761\u4ef6\u3002", descEn: "The specific agreements or divisions of labor this relationship needs to actually last \u2014 not a prediction, a set of conditions." },
    { titleZh: "\u53cc\u751f\u547d\u672a\u6765\u53d9\u4e8b", titleEn: "A Shared Future Narrative", descZh: "\u7528\u6709\u753b\u9762\u611f\u7684\u8bed\u8a00\uff0c\u63cf\u7ed8\u5982\u679c\u7ee7\u7eed\u540c\u884c\uff0c\u4e24\u4eba\u4f1a\u5f62\u6210\u4ec0\u4e48\u6837\u5177\u4f53\u7684\u76f8\u5904\u5f62\u6001\u3002", descEn: "A vivid, specific picture of the shape your life together could take if you keep walking this path." },
    { titleZh: "\u5173\u7cfb\u5171\u632f\u603b\u7ed3", titleEn: "Resonance Summary", descZh: "\u4e24\u4eba\u5404\u4e00\u6761\u5177\u4f53\u3001\u53ef\u64cd\u4f5c\u7684\u5efa\u8bae\uff0c\u6536\u675f\u6574\u4efd\u62a5\u544a\u2014\u2014\u4e0d\u662f\u7a7a\u6cdb\u7684\u795d\u798f\u8bed\u3002", descEn: "One concrete, actionable note for each of you \u2014 not a closing greeting-card line." },
  ],
  business: [
    { titleZh: "\u53cc\u521b\u9020\u8005\u661f\u56fe", titleEn: "Dual Creator Star Map", descZh: "\u4e24\u4efd\u521b\u9020\u9a71\u52a8\u529b\u53e0\u52a0\u5728\u4e00\u8d77\uff0c\u4f1a\u5f62\u6210\u4ec0\u4e48\u6837\u7684\u6574\u4f53\u6c14\u573a\u2014\u2014\u8fd9\u662f\u770b\u61c2\u8fd9\u6bb5\u5408\u4f5c\u7684\u7b2c\u4e00\u5c42\u3002", descEn: "What emerges when your two creative drives overlap \u2014 the first layer of understanding this partnership." },
    { titleZh: "\u5546\u4e1a\u9a71\u52a8\u529b\u5206\u6790", titleEn: "Business Drive Analysis", descZh: "\u4f60\u4eec\u5404\u81ea\u4e3a\u4ec0\u4e48\u60f3\u505a\u8fd9\u4ef6\u4e8b\u2014\u2014\u63a2\u7d22\u65b0\u673a\u4f1a\u3001\u5efa\u7acb\u957f\u671f\u4f53\u7cfb\u3001\u6269\u5927\u5f71\u54cd\u529b\u8fd8\u662f\u89e3\u51b3\u771f\u5b9e\u9700\u6c42\uff0c\u5177\u4f53\u8bf4\u6e05\u695a\u662f\u54ea\u4e00\u79cd\u3002", descEn: "Why each of you actually wants to build this \u2014 named specifically, not left as a vague \"shared vision.\"" },
    { titleZh: "\u80fd\u529b\u4e92\u8865\u7ed3\u6784", titleEn: "Complementary Capability Structure", descZh: "\u6218\u7565\u3001\u6267\u884c\u3001\u8d44\u6e90\u6574\u5408\u3001\u8868\u8fbe\u8fd9\u51e0\u7c7b\u80fd\u529b\u4e0a\uff0c\u8c01\u66f4\u9002\u5408\u8d1f\u8d23\u54ea\u4e00\u5757\u2014\u2014\u4e0d\u662f\"\u5404\u6709\u6240\u957f\"\u8fd9\u79cd\u8c01\u90fd\u80fd\u8bf4\u7684\u7a7a\u8bdd\u3002", descEn: "Who's actually better suited for strategy, execution, resources, or voice \u2014 not a generic \"you both have strengths.\"" },
    { titleZh: "\u51b3\u7b56\u6a21\u5f0f\u5730\u56fe", titleEn: "Decision-Making Map", descZh: "\u9762\u5bf9\u673a\u4f1a\u548c\u98ce\u9669\u65f6\uff0c\u4f60\u4eec\u662f\u5148\u884c\u52a8\u9a8c\u8bc1\u3001\u8fd8\u662f\u5148\u7814\u7a76\u964d\u4f4e\u98ce\u9669\uff0c\u8fd9\u79cd\u5dee\u5f02\u5177\u4f53\u4f1a\u600e\u6837\u5f71\u54cd\u5408\u4f5c\u8282\u594f\u3002", descEn: "Whether each of you leaps first or researches first \u2014 and exactly how that gap shapes your working rhythm." },
    { titleZh: "\u8d44\u6e90\u8fde\u63a5\u5730\u56fe", titleEn: "Resource Connection Map", descZh: "\u4f60\u4eec\u5404\u81ea\u66f4\u5bb9\u6613\u5e26\u6765\u4ec0\u4e48\u7c7b\u578b\u7684\u8d44\u6e90\uff0c\u7ec4\u5408\u8d77\u6765\u5177\u4f53\u80fd\u653e\u5927\u51fa\u4ec0\u4e48\u3002", descEn: "What each of you actually brings to the table, and what the combination specifically unlocks." },
    { titleZh: "\u98ce\u9669\u51b2\u7a81\u5730\u56fe", titleEn: "Risk & Conflict Map", descZh: "\u5408\u4f5c\u4e2d\u6700\u5bb9\u6613\u5728\u54ea\u4e2a\u5177\u4f53\u51b3\u7b56\u573a\u666f\u8d77\u51b2\u7a81\uff0c\u7ed9\u51fa\u771f\u6b63\u80fd\u7528\u7684\u5904\u7406\u65b9\u5411\uff0c\u4e0d\u662f\"\u8981\u591a\u6c9f\u901a\"\u3002", descEn: "The exact decision points most likely to spark conflict, with a direction that's actually usable." },
    { titleZh: "\u5408\u4f5c\u5468\u671f\u5730\u56fe", titleEn: "Partnership Cycle Map", descZh: "\u4ece\u63a2\u7d22\u671f\u5230\u5efa\u8bbe\u671f\u5230\u6269\u5c55\u671f\uff0c\u4f60\u4eec\u8fd9\u4e2a\u5177\u4f53\u7ec4\u5408\u5728\u54ea\u4e2a\u9636\u6bb5\u6700\u5bb9\u6613\u53d1\u6325\u4f18\u52bf\u3001\u54ea\u4e2a\u9636\u6bb5\u6700\u5bb9\u6613\u6389\u94fe\u5b50\u3002", descEn: "Where your specific pairing shines and where it stumbles, across the explore-build-scale arc." },
    { titleZh: "\u5546\u4e1a\u4ef7\u503c\u653e\u5927\u70b9", titleEn: "Value Amplification Point", descZh: "\u4f60\u4eec\u6700\u53ef\u80fd\u5728\u54ea\u4e2a\u65b9\u5411\u4e0a\u4ea7\u751f1+1>2\u7684\u6548\u679c\u2014\u2014\u54c1\u724c\u3001\u4ea7\u54c1\u8fd8\u662f\u7528\u6237\u7f51\u7edc\uff0c\u5177\u4f53\u8bf4\u660e\u4e3a\u4ec0\u4e48\u3002", descEn: "Exactly where this partnership is most likely to produce more than the sum of its parts, and why." },
    { titleZh: "\u56e2\u961f\u89d2\u8272\u5b9a\u4f4d", titleEn: "Team Role Positioning", descZh: "\u8c01\u66f4\u9002\u5408\u5b9a\u65b9\u5411\u3001\u8c01\u66f4\u9002\u5408\u5efa\u7cfb\u7edf\u3001\u8c01\u66f4\u9002\u5408\u8fde\u63a5\u8d44\u6e90\u2014\u2014\u7ed3\u5408\u4f60\u4eec\u7684\u5177\u4f53\u7279\u8d28\uff0c\u4e0d\u662f\u7b3c\u7edf\u7684\u89d2\u8272\u63cf\u8ff0\u3002", descEn: "Who should set direction, who should build the system, who should connect resources \u2014 specific to you two." },
    { titleZh: "\u957f\u671f\u5171\u521b\u6a21\u578b", titleEn: "Long-Term Co-Creation Model", descZh: "\u8fd9\u6bb5\u5408\u4f5c\u8981\u6301\u7eed\u8fdb\u5316\uff0c\u5177\u4f53\u9700\u8981\u5efa\u7acb\u4ec0\u4e48\u6837\u7684\u89c4\u5219\u6216\u673a\u5236\uff0c\u4e0d\u662f\u7a7a\u6cdb\u5730\u8bf4\"\u8981\u6709\u9ed8\u5951\"\u3002", descEn: "The actual rules or mechanisms this partnership needs to keep evolving \u2014 not \"just trust each other.\"" },
    { titleZh: "\u53cc\u521b\u9020\u8005\u5546\u4e1a\u53d9\u4e8b", titleEn: "A Shared Business Narrative", descZh: "\u7528\u6709\u753b\u9762\u611f\u7684\u8bed\u8a00\uff0c\u63cf\u7ed8\u4f60\u4eec\u5982\u679c\u7ee7\u7eed\u5408\u4f5c\uff0c\u4f1a\u5f62\u6210\u4ec0\u4e48\u6837\u5177\u4f53\u7684\u521b\u9020\u7cfb\u7edf\u3002", descEn: "A vivid, specific picture of the creative system you two could build if you keep going." },
  ],
  general: [
    { titleZh: "\u53cc\u751f\u547d\u8fde\u63a5\u56fe", titleEn: "Dual Life Connection Map", descZh: "\u4e24\u4efd\u751f\u547d\u7ed3\u6784\u7b2c\u4e00\u6b21\u4ea7\u751f\u8fde\u63a5\uff0c\u662f\u4ec0\u4e48\u6837\u7684\u6574\u4f53\u6c14\u573a\u2014\u2014\u770b\u61c2\u8fd9\u6bb5\u5173\u7cfb\u7684\u7b2c\u4e00\u5c42\u3002", descEn: "What forms the moment your two life structures first connect \u2014 the first layer of this relationship." },
    { titleZh: "\u76f8\u9047\u4e3b\u9898", titleEn: "The Theme of This Meeting", descZh: "\u8fd9\u6bb5\u5173\u7cfb\u66f4\u50cf\u5e26\u6765\u966a\u4f34\u3001\u542f\u53d1\u3001\u5b66\u4e60\u8fd8\u662f\u6311\u6218\uff0c\u5177\u4f53\u662f\u54ea\u4e00\u79cd\u3001\u4e3a\u4ec0\u4e48\u2014\u2014\u4e0d\u662f\"\u6bcf\u79cd\u90fd\u6709\u4e00\u70b9\"\u3002", descEn: "Whether this connection is really about companionship, inspiration, learning, or challenge \u2014 named specifically." },
    { titleZh: "\u4e92\u52a8\u6a21\u5f0f", titleEn: "Interaction Pattern", descZh: "\u4f60\u4eec\u66f4\u503e\u5411\u901a\u8fc7\u601d\u60f3\u4ea4\u6d41\u3001\u884c\u52a8\u652f\u6301\u8fd8\u662f\u60c5\u7eea\u966a\u4f34\u5efa\u7acb\u8fde\u63a5\uff0c\u5177\u4f53\u63cf\u8ff0\u8fd9\u79cd\u6a21\u5f0f\u5728\u65e5\u5e38\u91cc\u957f\u4ec0\u4e48\u6837\u3002", descEn: "Whether you connect through ideas, action, or emotional presence \u2014 and what that actually looks like day to day." },
    { titleZh: "\u4fe1\u4efb\u5efa\u7acb\u65b9\u5f0f", titleEn: "How Trust Forms", descZh: "\u5bf9\u4f60\u4eec\u6765\u8bf4\uff0c\u4fe1\u4efb\u5177\u4f53\u662f\u9760\u4ec0\u4e48\u79ef\u7d2f\u8d77\u6765\u7684\uff0c\u9700\u8981\u591a\u957f\u7684\u8fc7\u7a0b\u3002", descEn: "What actually builds trust between you two, and roughly how long that process tends to take." },
    { titleZh: "\u4ea4\u6d41\u9891\u7387\u5730\u56fe", titleEn: "Communication Frequency Map", descZh: "\u4e24\u4eba\u63a5\u6536\u4fe1\u606f\u7684\u5177\u4f53\u5dee\u5f02\uff0c\u4f1a\u600e\u6837\u5f71\u54cd\u4ea4\u6d41\u7684\u987a\u7545\u7a0b\u5ea6\u3002", descEn: "The specific gap in how you each take in information, and how it shapes how smoothly you talk." },
    { titleZh: "\u5dee\u5f02\u7406\u89e3\u5730\u56fe", titleEn: "Understanding the Differences", descZh: "\u4f60\u4eec\u6700\u5927\u7684\u5177\u4f53\u5dee\u5f02\u662f\u4ec0\u4e48\uff0c\u8fd9\u4efd\u5dee\u5f02\u5177\u4f53\u600e\u6837\u624d\u80fd\u53d8\u6210\u6210\u957f\u5165\u53e3\uff0c\u800c\u4e0d\u662f\u6469\u64e6\u3002", descEn: "Your biggest concrete difference, and exactly how it can become a doorway to growth instead of friction." },
    { titleZh: "\u652f\u6301\u5173\u7cfb\u7ed3\u6784", titleEn: "Support Structure", descZh: "\u5bf9\u65b9\u771f\u6b63\u9700\u8981\u7684\u652f\u6301\u65b9\u5f0f\uff0c\u8ddf\u4f60\u4e60\u60ef\u7ed9\u51fa\u7684\u652f\u6301\u65b9\u5f0f\u662f\u5426\u5bf9\u5f97\u4e0a\u3002", descEn: "Whether the support you naturally give is actually the support they need." },
    { titleZh: "\u5171\u540c\u6210\u957f\u65b9\u5411", titleEn: "Shared Growth Direction", descZh: "\u8fd9\u6bb5\u5173\u7cfb\u5177\u4f53\u80fd\u5728\u54ea\u4e2a\u65b9\u5411\u4e0a\u63a8\u52a8\u4f60\u4eec\u4e00\u8d77\u6210\u957f\uff0c\u4e3a\u4ec0\u4e48\u662f\u8fd9\u4e2a\u65b9\u5411\u3002", descEn: "The specific direction this relationship can push you both to grow, and why that direction." },
    { titleZh: "\u5173\u7cfb\u8fb9\u754c\u5730\u56fe", titleEn: "Boundary Map", descZh: "\u8fd9\u6bb5\u5173\u7cfb\u8981\u4fdd\u6301\u5065\u5eb7\uff0c\u5177\u4f53\u9700\u8981\u5728\u54ea\u4e9b\u5730\u65b9\u4fdd\u7559\u5404\u81ea\u7684\u72ec\u7acb\u7a7a\u95f4\u3002", descEn: "Exactly where you each need to keep independent space for this connection to stay healthy." },
    { titleZh: "\u6df1\u5c42\u8fde\u63a5\u4ef7\u503c", titleEn: "Deeper Value of the Connection", descZh: "\u8fd9\u6bb5\u5173\u7cfb\u5177\u4f53\u5e26\u6765\u4e86\u4ec0\u4e48\u6837\u7684\u9690\u85cf\u610f\u4e49\u2014\u2014\u4e0d\u662f\u6cdb\u6cdb\u7684\"\u5f88\u73cd\u8d35\"\u3002", descEn: "The specific hidden meaning this relationship carries \u2014 not just \"it's precious.\"" },
    { titleZh: "\u5173\u7cfb\u8c61\u5f81\u6545\u4e8b", titleEn: "A Symbolic Story", descZh: "\u7528\u6709\u753b\u9762\u611f\u7684\u6bd4\u55bb\uff0c\u63cf\u7ed8\u8fd9\u6bb5\u5173\u7cfb\u7684\u8d28\u5730\u3002", descEn: "A vivid metaphor capturing the texture of this particular connection." },
  ],
};

export default function RelationshipFlow() {
  const router = useRouter();
  const langEn = useLang();
  const t = (zh: string, en: string) => (langEn ? en : zh);
  const [a, setA] = useState<Person>(emptyPerson);
  const [b, setB] = useState<Person>(emptyPerson);
  const [relationshipType, setRelationshipType] = useState<"romantic" | "business" | "general">("romantic");
  const [submitting, setSubmitting] = useState(false);
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

      setSubmitting(false);
      // v256：改成跳转到独立付款页，不再用弹窗。
      window.location.href = `/checkout?productId=relationship-resonance&submissionId=${saveData.id}&redirect=${encodeURIComponent(`/relationship/full?id=${saveData.id}`)}`;
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
          {previewing ? <><PortalSpinner /><Bi zh="正在计算…" en="Calculating…" /></> : <Bi zh="展开共鸣与互补点 →" en="Reveal Resonance & Complementarity →" />}
        </button>
      ) : (
        <div
          className="lx-glass mt-8 p-6"
          style={{
            backgroundImage: `linear-gradient(rgba(20,16,30,0.38), rgba(20,16,30,0.38)), url(/images/relationship-full/${relationshipType}/page-0.jpg)`,
            backgroundSize: "cover", backgroundPosition: "center",
          }}
        >
          <p className="text-center font-display text-sm uppercase tracking-widest2 text-lattice">
            <Bi zh={`${a.name} × ${b.name} · ${TYPE_COPY[relationshipType].previewLabel.zh}`} en={`${a.name} × ${b.name} · ${TYPE_COPY[relationshipType].previewLabel.en}`} />
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

          <div className="mt-8 space-y-5 border-t border-white/10 pt-8 text-left">
            <p className="text-center font-display text-sm uppercase tracking-widest2 text-lattice">
              <Bi zh="完整档案会逐一展开" en="What the Full Archive Unfolds" />
            </p>
            {TEASER_CHAPTERS[relationshipType].map((c, i) => (
              <div key={i}>
                <p className="font-display text-sm text-lattice">{String(i + 1).padStart(2, "0")} · <Bi zh={c.titleZh} en={c.titleEn} /></p>
                <p className="mt-1.5 text-sm leading-7 text-bone-dim">
                  <Bi zh={c.descZh} en={c.descEn} />
                </p>
              </div>
            ))}
          </div>

          <button
            onClick={submit}
            disabled={submitting}
            className="mt-8 flex w-full items-center justify-center gap-2 bg-lattice py-4 font-display text-sm uppercase tracking-widest2 text-void-deep transition hover:bg-amber disabled:opacity-50"
          >
            {submitting ? <><PortalSpinner /><Bi zh="正在准备…" en="Preparing…" /></> : <Bi zh={`${TYPE_COPY[relationshipType].unlockLabel.zh} · ¥${getProduct("relationship-resonance")?.priceRmb}`} en={`${TYPE_COPY[relationshipType].unlockLabel.en} · ¥${getProduct("relationship-resonance")?.priceRmb}`} />}
          </button>
        </div>
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
