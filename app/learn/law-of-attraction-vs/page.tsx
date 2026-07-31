import LearnArticle, { ArticleData } from "@/components/LearnArticle";

export const metadata = {
  title: "显化和吸引力法则有什么区别？",
  description:
    "吸引力法则是「同频相吸」的原理，显化是把意图变成现实的整个实践。本文厘清两者的区别与联系，以及为什么只靠吸引力法则常常不够。Manifestation vs the law of attraction.",
  alternates: { canonical: "/learn/law-of-attraction-vs" },
};

const data: ArticleData = {
  slug: "law-of-attraction-vs",
  eyebrowZh: "显化 · 概念", eyebrowEn: "Manifestation · Concepts",
  titleZh: "显化和吸引力法则的区别", titleEn: "Manifestation vs. the Law of Attraction",
  defZh: "吸引力法则常被说成一条宇宙定律：你关注什么，就吸引什么。更经得起推敲的说法是——你持续关注和感受的东西，会改变你注意到什么、怎么反应、身体处在什么准备状态；而这些，会实实在在地改变你遇到什么、抓不抓得住。\n\n这不是把它降级，反而解释了为什么它有时候灵、有时候不灵：机制作用在你身上，不作用在世界的分配规则上。这也解释了另一句老话——担心什么来什么。它和心想事成是同一套机制的两个方向，都是对齐的结果。\n\n显化则是完整的实践：既包括调整内在状态，也包括清理旧信念、采取对齐的行动、以及放下对结果的紧盯。简单说：吸引力法则解释了机制，显化是把机制真正走完的那条路。",
  defEn: "The law of attraction is usually stated as a cosmic law: you attract what you focus on. A more defensible version: what you sustainedly attend to and feel changes what you notice, how you respond, and what state your body is prepared in — and those changes genuinely alter what you encounter and whether you can act on it.\n\nThis isn't a demotion. It explains why it sometimes seems to work and sometimes doesn't: the mechanism operates on you, not on the world's rules of allocation. It also explains the older saying that worry draws what it fears — that and intention drawing what it wants are two directions of one mechanism, both results of alignment.\n\nManifestation is the full practice: adjusting inner state, clearing old beliefs, taking aligned action, and loosening the grip on outcome. In short: the law of attraction names the mechanism; manifestation is walking it all the way through.",
  sections: [
    {
      hZh: "吸引力法则是什么", hEn: "What the law of attraction is",
      pZh: "吸引力法则主张：你的振动频率（由你的念头、情绪、信念组成）会吸引与之匹配的人事物。处在感恩与丰盛里，你更容易遇见好事；陷在恐惧与匮乏里，你往往强化了不想要的。它解释了「内在状态为何能影响外在现实」。",
      pEn: "The law of attraction holds that your vibrational frequency (made of your thoughts, emotions, and beliefs) attracts matching people and events. In gratitude and abundance, you more easily meet good things; stuck in fear and lack, you often reinforce what you don't want. It explains 'why inner state can shape outer reality.'",
    },
    {
      hZh: "为什么只靠它常常不够", hEn: "Why it often isn't enough alone",
      pZh: "很多人「只想好的」却没结果，因为吸引力法则只讲了一半：如果你表面积极、潜意识却深信「我不配」，真正主导的是潜意识。完整的显化因此还需要：清理限制性信念、采取对齐的行动、以及放手——不执着于结果。光靠正念冥想式的「吸引」，而不动手、不清理，往往原地打转。",
      pEn: "Many 'think only positive' yet see no results, because the law of attraction tells only half the story: if you're upbeat on the surface but your subconscious deeply believes 'I'm unworthy,' the subconscious wins. Complete manifestation therefore also needs: clearing limiting beliefs, taking aligned action, and releasing — not gripping the outcome. 'Attraction' alone, without acting or clearing, often spins in place.",
    },
    {
      hZh: "怎么把两者用好", hEn: "How to use both well",
      pZh: "把吸引力法则当作底层原理：每天有意识地校准你的状态与频率。再用完整显化把它落地：写下具体意图、改写旧信念、每天采取一个对齐的小行动、然后放手信任。原理 + 实践，内在 + 行动——这才是稳的路。",
      pEn: "Treat the law of attraction as the underlying principle: consciously calibrate your state and frequency each day. Then ground it with full manifestation: write specific intentions, rewrite old beliefs, take one aligned action daily, and release into trust. Principle plus practice, inner plus action — that's the steady path.",
    },
  ],
  faq: [
    { q: "显化和吸引力法则是一回事吗？", a: "不完全是。吸引力法则是「同频相吸」的原理（为什么内在状态能影响现实），显化是把意图变成现实的整个实践（怎么做），它包含吸引力法则，但还包括清理旧信念、采取行动和放手信任。" },
    { q: "为什么只用吸引力法则没效果？", a: "因为它只讲了一半。如果你表面积极、潜意识却相信「我不配」，主导的是潜意识。完整的显化还需要清理限制性信念、采取对齐的行动并放手，而不只是「想好的」。" },
    { q: "我应该用显化还是吸引力法则？", a: "两者结合最好：把吸引力法则当作底层原理（每天校准状态与频率），再用完整的显化把它落地（写下意图、改写信念、采取小行动、放手信任）。原理加实践，才是稳的路。" },
  ],
  cta: {
    titleZh: "把原理变成每日实践", titleEn: "Turn principle into daily practice",
    descZh: "灵犀场的显化签到，帮你每天对齐状态、采取行动、写入潜意识。", descEn: "Lingxi's daily check-in helps you align your state, take action, and imprint the subconscious.",
    href: "/live-as", btnZh: "进入显化签到", btnEn: "Open the check-in",
  },
  related: [
    { href: "/learn/manifestation", zh: "什么是显化", en: "What manifestation is" },
    { href: "/learn/manifestation-methods", zh: "显化方法大全", en: "Manifestation methods" },
  ],
};

export default function Page() {
  return <LearnArticle data={data} />;
}
