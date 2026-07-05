import LearnArticle, { ArticleData } from "@/components/LearnArticle";

export const metadata = {
  title: "新月显化与满月释放：月相显化指南",
  description:
    "新月适合设定意图与种下愿望，满月适合释放与感恩。本文讲解新月显化与满月释放的含义、仪式步骤，以及如何顺应月相的节奏。New moon manifesting & full moon releasing.",
  alternates: { canonical: "/learn/moon-manifestation" },
};

const data: ArticleData = {
  slug: "moon-manifestation",
  eyebrowZh: "显化 · 月相", eyebrowEn: "Manifestation · Moon",
  titleZh: "新月显化与满月释放", titleEn: "New Moon Manifesting & Full Moon Releasing",
  defZh: "月相显化，是顺着月亮的盈亏节奏来设定与释放意图的一种练习。新月（看不见月亮的那几天）象征新的开始，适合种下愿望、设定意图；满月象征圆满与高峰，适合释放不再需要的东西、表达感恩。它的力量不在月亮本身，而在于借一个自然节律，给你的意图一个稳定的仪式。",
  defEn: "Moon manifestation aligns setting and releasing intentions with the moon's waxing and waning. The new moon (when the moon is dark) symbolizes new beginnings — ideal for planting wishes and setting intentions; the full moon symbolizes fullness and peak — ideal for releasing what's no longer needed and giving thanks. Its power isn't in the moon itself but in using a natural rhythm to give your intentions a steady ritual.",
  sections: [
    {
      hZh: "新月：种下愿望", hEn: "New moon: plant wishes",
      pZh: "新月那几天，找一个安静的时刻：写下你想在接下来这个月周期里显化的意图，用现在时、肯定句。可以点一支蜡烛、深呼吸、把愿望大声读出来，再带着已实现的感受收起这张清单。新月是「开始」的能量，适合启动新计划、新习惯、新方向。",
      pEn: "Around the new moon, find a quiet moment: write the intentions you want to manifest in the coming lunar cycle, in present-tense affirmations. You might light a candle, breathe deeply, read your wishes aloud, then put the list away holding the felt sense of fulfillment. The new moon carries 'beginning' energy — good for launching new plans, habits, and directions.",
    },
    {
      hZh: "满月：释放与感恩", hEn: "Full moon: release & give thanks",
      pZh: "满月时，回顾这个周期：写下你想放下的——旧情绪、限制性信念、不再服务于你的关系或模式，然后象征性地「释放」它们（撕掉、烧掉或只是郑重地放手）。同时,为已经收获和正在到来的一切表达感恩。满月是「圆满与放手」的能量。",
      pEn: "At the full moon, review the cycle: write what you want to let go of — old emotions, limiting beliefs, relationships or patterns no longer serving you — then symbolically 'release' them (tearing, burning, or simply a deliberate letting-go). Also give thanks for what you've received and what's arriving. The full moon carries 'fullness and release' energy.",
    },
    {
      hZh: "顺应节奏，而非依赖它", hEn: "Use the rhythm, don't depend on it",
      pZh: "月相不是魔法开关，而是一个帮你定期停下、设定与清理的天然提醒。即使你错过了确切的日子，前后一两天同样有效。真正起作用的，永远是你的意图与状态——月相只是给它一个稳定的容器。",
      pEn: "Moon phases aren't a magic switch but a natural reminder to pause, set, and clear regularly. Even if you miss the exact day, a day or two on either side works just as well. What truly works is always your intention and state — the moon just gives it a steady container.",
    },
  ],
  faq: [
    { q: "新月显化怎么做？", a: "在新月那几天，找一个安静时刻，用现在时、肯定句写下你想在接下来一个月里显化的意图，配合深呼吸或点蜡烛等小仪式，带着已实现的感受收好清单。新月象征新的开始，适合启动新愿望与方向。" },
    { q: "满月适合做什么？", a: "满月适合释放与感恩：写下你想放下的旧情绪、限制信念或不再服务你的模式，象征性地放手，同时为已有和将来的收获表达感恩。满月是圆满与放手的能量。" },
    { q: "错过了新月/满月当天还有效吗？", a: "有效。月相只是一个帮你定期设定与清理的自然提醒，前后一两天同样可以。真正起作用的是你的意图与状态，月相只是给它一个稳定的仪式容器。" },
  ],
  cta: {
    titleZh: "把意图写入场", titleEn: "Write your intention into the field",
    descZh: "无论哪个月相，灵犀的显化签到都陪你设定意图、释放旧编程。", descEn: "Whatever the moon phase, Lingxi's check-in helps you set intentions and release old programming.",
    href: "/live-as", btnZh: "进入显化签到", btnEn: "Open the check-in",
  },
  related: [
    { href: "/learn/manifestation-methods", zh: "显化方法大全", en: "Manifestation methods" },
    { href: "/learn/manifestation-journal", zh: "显化日记怎么写", en: "Manifestation journaling" },
  ],
};

export default function Page() {
  return <LearnArticle data={data} />;
}
