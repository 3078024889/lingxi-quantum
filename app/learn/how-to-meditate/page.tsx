import LearnArticle, { ArticleData } from "@/components/LearnArticle";

export const metadata = {
  title: "如何冥想：新手入门完整指南",
  description:
    "冥想是一种把注意力温柔带回当下的练习。本文给出新手也能照做的冥想步骤、常见误区，以及如何坚持下去。A complete beginner's guide to meditation.",
  alternates: { canonical: "/learn/how-to-meditate" },
};

const data: ArticleData = {
  slug: "how-to-meditate",
  eyebrowZh: "修炼 · 冥想", eyebrowEn: "Practice · Meditation",
  titleZh: "如何冥想：新手入门指南", titleEn: "How to Meditate: A Beginner's Guide",
  defZh: "冥想，是一种把注意力温柔地带回当下的练习——通常以呼吸为锚。它的目的不是「让脑子一片空白」，而是练习觉察：当念头飘走时，温和地注意到，再带回来。仅此一个动作，重复千百次，就在重塑你与自己念头和情绪的关系。",
  defEn: "Meditation is the practice of gently returning attention to the present — usually anchored on the breath. Its goal isn't 'emptying the mind' but training awareness: when thoughts wander, noticing gently and bringing attention back. That single move, repeated countless times, reshapes your relationship with your own thoughts and emotions.",
  sections: [
    {
      hZh: "5 步开始", hEn: "Start in five steps",
      pZh: "1) 找个安静的地方，舒服地坐着，背挺直但不僵硬。2) 闭上眼，做几次缓慢的深呼吸。3) 把注意力放在呼吸上——感受气息进出。4) 当你发现注意力飘走了（一定会），别自责，只是温柔地把它带回呼吸。5) 从 3–5 分钟开始，慢慢延长。重复第 4 步，就是整个冥想。",
      pEn: "1) Find a quiet spot, sit comfortably, spine upright but not rigid. 2) Close your eyes and take a few slow, deep breaths. 3) Rest attention on the breath — feel it flow in and out. 4) When you notice attention has wandered (it will), don't scold yourself; just gently bring it back to the breath. 5) Start with 3–5 minutes and gradually extend. Repeating step 4 is the whole of meditation.",
    },
    {
      hZh: "常见误区", hEn: "Common misconceptions",
      pZh: "「我停不下念头，所以我不会冥想」——这是最大的误解。念头不停是正常的，冥想不是消灭念头，而是练习不被念头带走。「必须盘腿坐很久」也不必——坐在椅子上、几分钟都可以。重要的是规律，而非时长或姿势的完美。",
      pEn: "'I can't stop my thoughts, so I can't meditate' — the biggest misconception. A nonstop mind is normal; meditation isn't eliminating thoughts but practicing not being swept away by them. Nor must you sit cross-legged for long — a chair and a few minutes are fine. What matters is regularity, not perfect duration or posture.",
    },
    {
      hZh: "如何坚持", hEn: "How to keep it up",
      pZh: "把冥想绑在已有的习惯上（比如刷牙后、睡前）；从短时间开始，让它容易完成；用呼吸练习或引导音频降低门槛。哪怕每天只有 3 分钟，规律地做，远胜偶尔的 30 分钟。日积月累，你会发现自己在生活里也更稳、更不易被情绪牵着走。",
      pEn: "Anchor meditation to an existing habit (after brushing teeth, before bed); start short so it's easy to complete; use breathing practices or guided audio to lower the barrier. Even 3 minutes daily, done regularly, far outweighs an occasional 30. Over time you'll find yourself steadier in daily life, less easily pulled around by emotion.",
    },
  ],
  faq: [
    { q: "新手如何开始冥想？", a: "找个安静处舒服坐好，闭眼做几次深呼吸，把注意力放在呼吸上；当念头飘走时，温柔地把它带回呼吸。从每天 3–5 分钟开始，慢慢延长。这个「飘走—带回」的动作，就是冥想的核心。" },
    { q: "冥想时停不下念头怎么办？", a: "这很正常，也正是练习的地方。冥想不是消灭念头，而是练习不被念头带走。每次发现走神、再温柔带回呼吸，就是一次有效的练习——走神越多，你练习的次数越多。" },
    { q: "冥想每天要多久？", a: "规律比时长更重要。每天 3–5 分钟、稳定地做，远胜偶尔的长时间冥想。熟悉后可逐渐延长到 10–20 分钟。" },
  ],
  cta: {
    titleZh: "从量子息法开始", titleEn: "Begin with quantum breathing",
    descZh: "灵犀场的量子息法练习，是最适合新手的入门冥想。", descEn: "Lingxi's quantum breathing is an ideal entry meditation for beginners.",
    href: "/practice/breath", btnZh: "进入量子息法", btnEn: "Open quantum breathing",
  },
  related: [
    { href: "/learn/raise-frequency", zh: "如何提升意识频率", en: "Raise your frequency" },
    { href: "/learn/higher-self", zh: "如何与高我连接", en: "Connect with your higher self" },
  ],
};

export default function Page() {
  return <LearnArticle data={data} />;
}
