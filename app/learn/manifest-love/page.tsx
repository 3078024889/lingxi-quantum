import LearnArticle, { ArticleData } from "@/components/LearnArticle";

export const metadata = {
  title: "如何显化爱情与理想伴侣：先成为，再相遇",
  description:
    "显化爱情不是控制某个人，而是先成为你想遇见的人、清理旧的关系信念、进入被爱的状态。本文讲显化理想伴侣的具体做法与常见误区。How to manifest love and an ideal partner.",
  alternates: { canonical: "/learn/manifest-love" },
};

const data: ArticleData = {
  slug: "manifest-love",
  eyebrowZh: "显化 · 爱情", eyebrowEn: "Manifestation · Love",
  titleZh: "如何显化爱情与理想伴侣", titleEn: "How to Manifest Love & an Ideal Partner",
  defZh: "显化爱情的核心，不是去控制某个特定的人，而是先成为你想遇见的那个人、清理阻挡爱的旧信念、并让自己稳定地进入「被爱、值得爱」的状态。当你的频率改变，与之同频的关系自会靠近。",
  defEn: "Manifesting love is not about controlling a specific person, but about becoming the one you hope to meet, clearing old beliefs that block love, and steadily entering the state of being loved and worthy of love. When your frequency shifts, relationships on that frequency draw near.",
  sections: [
    {
      hZh: "先成为，而非追逐", hEn: "Become, don't chase",
      pZh: "关系是频率的相遇，不是占有。与其盯着「怎么让某人爱我」，不如先成为你理想关系里的那个自己——更安稳、更真诚、更懂得爱自己。你先给自己的爱，决定了别人能给你的爱的上限。先成为想遇见的人，同频者自会出现。",
      pEn: "Relationships are a meeting of frequencies, not possession. Rather than fixating on 'how to make someone love me,' first become the self you'd be in your ideal relationship — steadier, more honest, better at loving yourself. The love you give yourself sets the ceiling for the love others can give you. Become the person you hope to meet, and those on your frequency appear.",
    },
    {
      hZh: "清理旧的关系信念", hEn: "Clear old relationship beliefs",
      pZh: "很多人显化爱情不顺，卡在潜意识里的旧信念：「我不值得被好好爱」「爱总会受伤」「好的都轮不到我」。这些信念会替你把机会挡在门外。可以用书写把它们请出来，再逐条改写成新的：「我值得被温柔对待」「我可以安全地被爱」。先在心里原谅过去的关系，前路才会松开。",
      pEn: "Many stall on old subconscious beliefs: 'I don't deserve real love,' 'love always hurts,' 'the good ones never come to me.' Such beliefs bar opportunity for you. Write them out, then rewrite each into a new one: 'I deserve tenderness,' 'I can be loved safely.' Forgive past relationships inwardly first, and the road ahead loosens.",
    },
    {
      hZh: "写下理想关系的「感受」", hEn: "Write the feeling of the ideal bond",
      pZh: "写下你想要的关系时，重点不是外貌条件清单，而是「在一起时你是什么感受」：被理解、被尊重、轻松、安心。每天花几分钟进入那种感受，像它已经在你的生活里。真正吸引来的，是与你此刻状态同频的人——所以先让自己成为那份感受本身。",
      pEn: "When you write the relationship you want, focus not on a checklist of looks but on how you feel together: understood, respected, at ease, safe. Spend a few minutes daily entering that feeling, as if it's already in your life. What you attract matches your current state — so become that feeling first.",
    },
  ],
  faq: [
    { q: "可以显化一个特定的人吗？", a: "更健康、也更有效的做法，是显化「你想要的关系与感受」，而不是执着于某个特定的人。执着于控制某人，往往来自恐惧，反而降低频率。把焦点放回自己的状态与值得被爱的信念上，让合适的人自然靠近。" },
    { q: "显化爱情要多久？", a: "没有固定时间，它与「对齐」相关，而非与时间相关。当你真正相信自己值得、并稳定地活在被爱的状态里，改变可能比你以为的快。重点是每天稳定地对齐，而不是焦虑地等待。" },
    { q: "为什么我一直显化不到爱情？", a: "常见原因是潜意识里还有「我不值得」「爱会受伤」等旧信念，或在用力追逐、投射恐惧。先清理这些信念、先把爱给自己，频率改变后，关系场会随之重新校准。" },
  ],
  cta: {
    titleZh: "先回到被爱的状态", titleEn: "Return to the state of being loved",
    descZh: "灵犀场的现实回路，陪你每天进入「已经拥有」的感受，把值得被爱写进潜意识。", descEn: "Lingxi's Reality Loop helps you enter the felt sense of already having it, and write worthiness into the subconscious.",
    href: "/live-as", btnZh: "进入现实回路", btnEn: "Open the Reality Loop",
  },
  related: [
    { href: "/learn/manifestation-methods", zh: "显化方法大全", en: "Manifestation methods" },
    { href: "/learn/subconscious-power", zh: "潜意识的力量", en: "The power of the subconscious" },
  ],
};

export default function Page() {
  return <LearnArticle data={data} />;
}
