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
  defZh: "显化金钱，核心不是凭空盼着钱出现，而是先把你与金钱的内在关系，从恐惧、匮乏与「我不配」转向信任、丰盛与值得。当你稳定地处在丰盛的状态，你会更敢于行动、更易看见机会、也更容易做出带来收入的选择——金钱是流动的能量，它流向与它同频的人。",
  defEn: "Manifesting money isn't waiting for cash to appear from nowhere, but first shifting your inner relationship with money from fear, lack, and 'I'm unworthy' toward trust, abundance, and worthiness. When you steadily hold an abundant state, you act more boldly, notice more opportunities, and make choices that bring income — money is flowing energy, drawn to those on its frequency.",
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
