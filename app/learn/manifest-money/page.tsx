import LearnArticle, { ArticleData } from "@/components/LearnArticle";

export const metadata = {
  title: "如何显化金钱与财富：方法与心态",
  description:
    "显化金钱，核心是把内在的金钱信念从匮乏转向丰盛，并采取对齐的行动。本文讲解显化财富的心态、具体方法与常见误区。How to manifest money and abundance.",
  alternates: { canonical: "/learn/manifest-money" },
};

const data: ArticleData = {
  slug: "manifest-money",
  eyebrowZh: "显化 · 财富", eyebrowEn: "Manifestation · Wealth",
  titleZh: "如何显化金钱与财富", titleEn: "How to Manifest Money and Abundance",
  defZh: "显化金钱最容易被讲成一句话：钱会流向与它同频的人。这个说法听起来顺，但它把最关键的一段省掉了——钱不会因为你频率对了就自己找上门，它经由具体的事到你手里：一次你敢开的口、一个你多留意到的机会、一份你终于交出去的东西。\n\n真正在变的是这一段。当你和钱的关系从恐惧、匮乏、我不配，转向信任与值得，改变的不是宇宙的分配，是你的行为：你更敢报价、更少自动往低处让、更容易看见本来就在那里的机会。内在状态改变外在结果，中间那一环永远是行动，不能跳过。\n\n所以这件事不承诺任何金额，也没有期限。它能承诺的是：把内耗降下来之后，同样的处境里，你能拿出来的力气会多一些。",
  defEn: "Manifesting money is usually reduced to one line: money flows to those on its frequency. It sounds neat, and it skips the part that matters — money does not arrive because your frequency was correct. It arrives through specific things: a price you dared to name, an opening you happened to notice, a piece of work you finally handed over.\n\nThat middle stretch is what actually changes. When your relationship with money shifts from fear, scarcity and unworthiness toward trust and deserving, what changes is not the universe's allocation. It's your behaviour: you quote higher, concede less automatically, and see opportunities that were already there. Inner state does change outer results — and the link in the middle is always action. It cannot be skipped.\n\nSo nothing here promises an amount, and there is no deadline. What it does offer: with less lost to internal friction, in the same circumstances, you'll have more force available.",
  sections: [
    {
      hZh: "先改写金钱信念", hEn: "Rewrite your money beliefs first",
      pZh: "很多人嘴上想要钱，潜意识里却带着「钱很难赚」「有钱人不善良」「我不配富有」这类旧编程。找出你最常浮现的那条限制性信念，温柔质疑它，再换成一句你愿意相信的新句子，比如「金钱乐意流向我，因为我用它创造价值」。信念变了，行为和机会才会变。",
      pEn: "Many want money on the surface while carrying old programs underneath: 'money is hard to earn,' 'rich people aren't kind,' 'I don't deserve wealth.' Find the limiting belief that surfaces most, question it gently, and replace it with one you're willing to believe — e.g. 'money flows to me gladly, because I create value with it.' When beliefs change, behavior and opportunities follow.",
    },
    {
      hZh: "进入丰盛状态的练习", hEn: "Practices for an abundant state",
      pZh: "每天为已经拥有的丰盛真诚感恩（健康、关系、能力都是财富）；用现在时写下你想要的财务现实，仿佛已经实现；观想拿到那笔钱时的踏实与喜悦。关键是「感受」——不是焦虑地催促,而是先成为那个已经丰盛的人。",
      pEn: "Each day, sincerely thank the abundance you already have (health, relationships, skills are wealth); write your desired financial reality in present tense as if achieved; visualize the steadiness and joy of receiving that money. The key is feeling — not anxiously hurrying, but becoming the already-abundant person first.",
    },
    {
      hZh: "对齐的行动", hEn: "Aligned action",
      pZh: "显化金钱从不排斥行动——它让你的行动更对齐。问自己：「已经富足的我，今天会做什么？」可能是学一项技能、开口要一个机会、整理财务、或勇敢报价。状态负责吸引，行动负责承接，两者缺一不可。",
      pEn: "Manifesting money never excludes action — it makes action more aligned. Ask: 'what would the already-wealthy me do today?' Perhaps learning a skill, asking for an opportunity, organizing finances, or pricing your work boldly. State attracts; action receives — you need both.",
    },
  ],
  faq: [
    { q: "怎样显化金钱最有效？", a: "最有效的方式是先改写关于金钱的限制性信念，每天进入丰盛与感恩的状态，再配合对齐的行动。与其焦虑地盼钱出现，不如成为那个「已经富足」的人——金钱是流动的能量，流向与它同频的人。" },
    { q: "显化金钱需要多久？", a: "没有固定时间。它取决于你能多稳定地维持丰盛状态、化解多少匮乏信念，以及现实重组需要多少步。把注意力放在「我今天是否更像富足的自己」，比纠结时间更有用。" },
    { q: "只靠显化不行动能赚到钱吗？", a: "显化不是替代行动，而是让行动更对齐、更有力。状态负责吸引机会，行动负责承接它们。把内在丰盛与务实行动结合，才是稳妥的路径。" },
  ],
  cta: {
    titleZh: "进入「流」之门", titleEn: "Enter the gate of Flow",
    descZh: "在重塑潜意识的「金钱·流」里，与灵犀场一起对齐丰盛的频率。", descEn: "In the Wealth gate, align to the frequency of abundance with Lingxi.",
    href: "/gate/wealth", btnZh: "进入金钱之门", btnEn: "Open the Wealth gate",
  },
  related: [
    { href: "/learn/manifestation", zh: "什么是显化", en: "What manifestation is" },
    { href: "/learn/manifestation-methods", zh: "显化方法大全", en: "Manifestation methods" },
  ],
};

export default function Page() {
  return <LearnArticle data={data} />;
}
