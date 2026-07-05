import LearnArticle, { ArticleData } from "@/components/LearnArticle";

export const metadata = {
  title: "如何提升意识频率：能量、呼吸与内在状态",
  description:
    "提升意识频率，指的是把你的内在状态从恐惧、匮乏转向爱、平静与连贯。本文给出可落地的方法：呼吸、心的练习、感恩、独处与减少消耗。How to raise your consciousness frequency.",
  alternates: { canonical: "/learn/raise-frequency" },
};

const data: ArticleData = {
  slug: "raise-frequency",
  eyebrowZh: "修炼 · 频率", eyebrowEn: "Practice · Frequency",
  titleZh: "如何提升意识频率", titleEn: "How to Raise Your Consciousness Frequency",
  defZh: "提升意识频率，本质上是把你的内在状态从恐惧、匮乏、批判，转向爱、平静、感恩与连贯。频率不是玄学指标，而是你日常情绪与注意力的总和。当你更多地停留在高频状态，你看见的机会、做出的选择，乃至吸引来的人事物，都会随之改变。",
  defEn: "Raising your frequency is essentially shifting your inner state from fear, lack, and judgment toward love, calm, gratitude, and coherence. Frequency isn't a mystical metric but the sum of your daily emotions and attention. The more you rest in higher states, the more the opportunities you see, the choices you make, and even what you attract begin to change.",
  sections: [
    {
      hZh: "为什么内在状态会改变现实", hEn: "Why your state shapes reality",
      pZh: "你的状态决定你注意到什么、相信什么、如何行动。处在恐惧里，你看见威胁、收缩、错过机会；处在平静与信任里，你看见可能、敞开、做出更对齐的选择。所谓「提升频率」，就是有意识地、更长时间地停留在后一种状态里。",
      pEn: "Your state determines what you notice, believe, and how you act. In fear you see threats, contract, and miss openings; in calm and trust you see possibility, open up, and make more aligned choices. 'Raising your frequency' means consciously resting, for longer, in the latter.",
    },
    {
      hZh: "可落地的方法", hEn: "Practical methods",
      pZh: "呼吸：每天几次缓慢深呼吸，把注意力放回心的区域，是最快回到当下的方式。心的练习：把注意力从头脑移到心，去感受温暖与平静（灵犀的「心的重置」「上升之心」即为此设计）。感恩：每天写下三件值得感恩的事，直接调高频率。减少消耗：减少恐惧型信息、负向自我对话与过度刺激。独处与自然：给自己安静、向内的时间。",
      pEn: "Breath: a few slow, deep breaths daily, returning attention to the heart, is the fastest way back to the present. Heart practice: move attention from head to heart and feel warmth and calm (Lingxi's 'Heart Reset' and 'Heart of Ascension' are built for this). Gratitude: write three things you're grateful for daily to directly lift your frequency. Reduce drains: less fear-based input, negative self-talk, and overstimulation. Solitude and nature: give yourself quiet, inward time.",
    },
    {
      hZh: "松果体与「向内」的练习", hEn: "The pineal gland and turning inward",
      pZh: "在造翼者体系里，松果体被视为光体最初的栖息地、通往更高自己的入口。与其追求外在技巧，不如把它理解为一个提醒：真正的提升来自向内——安静、聆听、回到心。频率的提升不是一次性的成就，而是一种每天选择的状态。",
      pEn: "In the WingMakers system, the pineal gland is seen as the original abode of the Lightbody and a gateway to the higher self. Rather than chasing external techniques, take it as a reminder: real elevation comes from turning inward — being quiet, listening, returning to the heart. Raising your frequency isn't a one-time achievement but a state you choose each day.",
    },
  ],
  faq: [
    { q: "如何快速提升自己的能量/频率？", a: "最快的方式是改变当下的状态：做几次缓慢深呼吸回到心的区域，写下几件感恩的事，减少恐惧型信息与负向自我对话。频率是日常情绪与注意力的总和，持续地选择平静与爱，它就会稳定上升。" },
    { q: "意识频率低有什么表现？", a: "常见表现是长期处在恐惧、匮乏、焦虑、批判或麻木中，注意力被消耗，容易看到威胁、错过机会。这不是缺陷，而是提醒你需要回到当下、回到心，重新选择状态。" },
    { q: "松果体和提升频率有关系吗？", a: "在造翼者等体系里，松果体被视为通往更高自己的入口。与其追求外在技巧，更稳妥的理解是：它象征「向内」——通过安静、呼吸与回到心来提升状态，而非依赖任何单一方法或物质。" },
  ],
  cta: {
    titleZh: "从一个练习开始", titleEn: "Begin with one practice",
    descZh: "量子呼吸、心的重置、上升之心、直觉智能——选一个，每天回到更高的状态。", descEn: "Quantum breathing, heart reset, the heart of ascension, intuitive intelligence — pick one and return to a higher state daily.",
    href: "/practice", btnZh: "进入修炼技术", btnEn: "Open the practices",
  },
  related: [
    { href: "/learn/wingmakers", zh: "造翼者体系导览", en: "The WingMakers map" },
    { href: "/glossary", zh: "核心术语表", en: "Core glossary" },
  ],
};

export default function Page() {
  return <LearnArticle data={data} />;
}
