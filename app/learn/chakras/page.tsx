import LearnArticle, { ArticleData } from "@/components/LearnArticle";

export const metadata = {
  title: "七脉轮入门：含义与平衡方法",
  description:
    "脉轮是身体中的七个能量中心，从海底轮到顶轮，各对应不同的身心主题。本文是脉轮新手入门：七脉轮的含义、失衡表现与平衡方法。A beginner's guide to the seven chakras.",
  alternates: { canonical: "/learn/chakras" },
};

const data: ArticleData = {
  slug: "chakras",
  eyebrowZh: "修炼 · 脉轮", eyebrowEn: "Practice · Chakras",
  titleZh: "七脉轮入门：含义与平衡", titleEn: "The Seven Chakras: Meaning and Balance",
  defZh: "脉轮（Chakra）源自古印度，指人体中沿脊柱分布的七个主要能量中心，从底部的海底轮到头顶的顶轮，各对应不同的身心主题——安全感、创造力、自我力量、爱、表达、直觉与连接。脉轮平衡，是一种把这些层面都照顾到、让能量顺畅流动的隐喻与练习。",
  defEn: "Chakras, from ancient India, are the seven main energy centers along the spine — from the root at the base to the crown at the top — each corresponding to a different body-mind theme: safety, creativity, personal power, love, expression, intuition, and connection. Balancing the chakras is a metaphor and practice for tending all these layers so energy flows freely.",
  sections: [
    {
      hZh: "七个脉轮", hEn: "The seven chakras",
      pZh: "海底轮（脊柱底·红）：安全感与根基。脐轮（下腹·橙）：情绪与创造力。太阳神经丛轮（上腹·黄）：自我力量与意志。心轮（胸·绿）：爱与慈悲。喉轮（喉·蓝）：表达与真实。眉心轮/第三眼（额·靛）：直觉与洞见。顶轮（头顶·紫/白）：连接更高意识与本源。",
      pEn: "Root (base of spine, red): safety and grounding. Sacral (lower belly, orange): emotion and creativity. Solar plexus (upper belly, yellow): personal power and will. Heart (chest, green): love and compassion. Throat (throat, blue): expression and truth. Third eye (brow, indigo): intuition and insight. Crown (top of head, violet/white): connection to higher consciousness and Source.",
    },
    {
      hZh: "失衡的表现", hEn: "Signs of imbalance",
      pZh: "当某个脉轮「失衡」（堵塞或过度活跃），常对应相关层面的困扰：海底轮失衡→缺乏安全感、焦虑；心轮失衡→难以给予或接受爱；喉轮失衡→不敢表达；第三眼失衡→直觉迟钝或过度幻想。把它当作一张「自我觉察地图」，比纠结术语更有用。",
      pEn: "When a chakra is 'imbalanced' (blocked or overactive), it often maps to troubles in that theme: root imbalance → insecurity, anxiety; heart imbalance → difficulty giving or receiving love; throat imbalance → fear of speaking up; third-eye imbalance → dull intuition or over-fantasy. Treat it as a 'self-awareness map' rather than fixating on terminology.",
    },
    {
      hZh: "如何平衡脉轮", hEn: "How to balance the chakras",
      pZh: "常见方法有：冥想与观想（想象对应颜色的光在该部位流动）、呼吸练习、对应的瑜伽体式、亲近自然、以及照顾那个层面的现实生活（如心轮——练习自我慈悲与表达爱）。在多数修行传统里，心轮都被视为承上启下的核心枢纽——许多练习都以回到心、让能量从心流动为中心。",
      pEn: "Common methods: meditation and visualization (imagine the corresponding color of light flowing at that center), breathing practices, related yoga poses, time in nature, and tending that theme in real life (for the heart — practicing self-compassion and expressing love). Across many traditions, the heart chakra is seen as the pivotal hub connecting the centers above and below it — many practices center on returning to the heart and letting energy flow from it.",
    },
  ],
  faq: [
    { q: "七个脉轮分别是什么？", a: "从下到上依次是：海底轮（安全感）、脐轮（情绪与创造）、太阳神经丛轮（自我力量）、心轮（爱）、喉轮（表达）、眉心轮/第三眼（直觉）、顶轮（连接更高意识）。每个对应不同的身心主题。" },
    { q: "如何平衡脉轮？", a: "常见方法包括冥想与观想对应颜色的光、呼吸练习、相关瑜伽体式、亲近自然，以及在现实中照顾对应的生活层面。把脉轮当作一张自我觉察地图，针对最需要的层面温柔练习即可。" },
    { q: "脉轮是真实存在的吗？", a: "脉轮是源自古印度的能量与意识模型，并非现代解剖学意义上的器官。把它理解为一套帮助自我觉察、组织身心练习的隐喻框架，会比纠结其「物理真实性」更有帮助。" },
  ],
  cta: {
    titleZh: "回到心的中枢", titleEn: "Return to the heart hub",
    descZh: "灵犀的「归零心诀」「上升心经」练习，帮你回到心、让能量流动。", descEn: "Lingxi's Heart Reset and Heart of Ascension practices return you to the heart and let energy flow.",
    href: "/practice", btnZh: "进入修炼技术", btnEn: "Open the practices",
  },
  related: [
    { href: "/learn/raise-frequency", zh: "如何提升意识频率", en: "Raise your frequency" },
    { href: "/learn/how-to-meditate", zh: "如何冥想", en: "How to meditate" },
  ],
};

export default function Page() {
  return <LearnArticle data={data} />;
}
