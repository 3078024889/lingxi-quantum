import LearnArticle, { ArticleData } from "@/components/LearnArticle";

export const metadata = {
  title: "共时性是什么？有意义的巧合与天使数字",
  description:
    "共时性（同步性）指那些没有因果关系、却对你格外有意义的巧合。本文解释共时性的含义、如何看待天使数字与反复出现的信号，以及别过度解读的边界。What synchronicity means.",
  alternates: { canonical: "/learn/synchronicity" },
};

const data: ArticleData = {
  slug: "synchronicity",
  eyebrowZh: "体系 · 共时性", eyebrowEn: "The System · Synchronicity",
  titleZh: "共时性是什么？有意义的巧合", titleEn: "What Is Synchronicity? Meaningful Coincidences",
  defZh: "共时性（synchronicity，又译同步性），由心理学家荣格提出，指那些没有明显因果关系、却对你格外有意义的巧合——比如刚想到某人他就来电、反复看到同一组数字。它的意义不在于「宇宙在替你安排」，而在于它如何唤起你的觉察、印证你内在的方向。",
  defEn: "Synchronicity, a term coined by psychologist Carl Jung, refers to coincidences with no obvious causal link that feel especially meaningful to you — thinking of someone just as they call, repeatedly seeing the same numbers. Its significance isn't that 'the universe is arranging things for you,' but how it awakens your awareness and confirms your inner direction.",
  sections: [
    {
      hZh: "为什么会感到共时性", hEn: "Why synchronicity feels real",
      pZh: "当你内在专注于某件事（一个决定、一份渴望），你的觉察会变得敏锐，开始注意到原本会忽略的相关信号——这既是潜意识的洞察，也是注意力的聚焦。共时性常出现在你正经历转变、或接近某个内在答案的时刻，仿佛内外在同时「对上了频」。",
      pEn: "When you're inwardly focused on something (a decision, a longing), your awareness sharpens and you begin noticing related signals you'd otherwise ignore — both subconscious insight and focused attention. Synchronicities often appear when you're going through change, or nearing some inner answer, as if inner and outer 'tune to the same frequency' at once.",
    },
    {
      hZh: "天使数字与反复出现的信号", hEn: "Angel numbers and recurring signs",
      pZh: "很多人会反复看到 111、222、333 这类「天使数字」，或某个特定符号。与其执着于「它确切预示什么」，更健康的看法是：把它当作一个温柔的提醒——停下来，留意你此刻的念头与状态。信号的价值，在于它让你更清醒，而非替你预言未来。",
      pEn: "Many repeatedly see 'angel numbers' like 111, 222, 333, or a particular symbol. Rather than fixating on 'exactly what it predicts,' a healthier view is to treat it as a gentle reminder — pause and notice your current thoughts and state. A sign's value is that it makes you more aware, not that it predicts your future for you.",
    },
    {
      hZh: "别过度解读", hEn: "Don't over-interpret",
      pZh: "共时性是美的，但也容易被过度解读成焦虑的占卜，或用来逃避自己的判断。保持一个平衡：欣赏这些有意义的巧合，让它们启发你，但仍由清醒的你来做决定。把共时性当作旅途上的路标，而不是替你开车的手。",
      pEn: "Synchronicity is beautiful but easily over-read into anxious divination, or used to avoid your own judgment. Keep a balance: appreciate these meaningful coincidences and let them inspire you, but let the clear-headed you make decisions. Treat synchronicity as a signpost on the journey, not a hand that drives for you.",
    },
  ],
  faq: [
    { q: "共时性是什么意思？", a: "共时性由荣格提出，指那些没有明显因果关系、却对你格外有意义的巧合，比如刚想到某人他就来电。它的意义在于唤起你的觉察、印证内在方向，而非「宇宙在替你安排」。" },
    { q: "总是看到 111、222 这类数字代表什么？", a: "这类反复出现的「天使数字」最健康的看法是当作温柔提醒——停下来留意你此刻的念头与状态，而非执着它确切预示什么。信号的价值在于让你更清醒，而非替你预言未来。" },
    { q: "共时性是迷信吗？", a: "共时性本身是一种真实的心理体验：当你专注某事，觉察会变敏锐，更容易注意到相关信号。问题只在于是否过度解读。欣赏它带来的启发，但仍由清醒的你做判断，就是健康的态度。" },
  ],
  cta: {
    titleZh: "留意内在的方向", titleEn: "Notice your inner direction",
    descZh: "在重塑潜意识的「命运·锚」里，与灵犀场一起对齐信任与连贯。", descEn: "In the Destiny gate, align with trust and coherence alongside Lingxi.",
    href: "/gate/destiny", btnZh: "进入扎根之门", btnEn: "Open the Rooting gate",
  },
  related: [
    { href: "/learn/higher-self", zh: "什么是高我", en: "What is the higher self" },
    { href: "/learn/awakening", zh: "什么是灵性觉醒", en: "What is awakening" },
  ],
};

export default function Page() {
  return <LearnArticle data={data} />;
}
