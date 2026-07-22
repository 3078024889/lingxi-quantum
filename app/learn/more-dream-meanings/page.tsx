import LearnArticle, { ArticleData } from "@/components/LearnArticle";

export const metadata = {
  title: "更多常见梦境含义：怀孕、水、火、掉头发、结婚、死亡",
  description:
    "梦见怀孕、水或海啸、火、掉头发、结婚、死亡或亲人去世各代表什么？本文继续解读常见梦境象征的可能含义，强调用自己的联想去理解。More common dream meanings.",
  alternates: { canonical: "/learn/more-dream-meanings" },
};

const data: ArticleData = {
  slug: "more-dream-meanings",
  eyebrowZh: "解梦 · 象征（二）", eyebrowEn: "Dreams · Symbols II",
  titleZh: "更多常见梦境含义", titleEn: "More Common Dream Meanings",
  defZh: "这是常见梦境象征的第二辑。和上一篇一样，下面的含义只是「可能的起点」——同一个象征对不同人意义不同。真正读懂一个梦，靠的是你自己的联想和它唤起的情绪，而非套用任何固定答案。",
  defEn: "This is a second set of common dream symbols. As before, the meanings below are only 'possible starting points' — the same symbol means different things to different people. Truly understanding a dream relies on your own associations and the emotion it evokes, not any fixed answer.",
  sections: [
    {
      hZh: "怀孕 · 水 · 火", hEn: "Pregnancy · water · fire",
      pZh: "梦见怀孕：常象征「新的开始」——一个新计划、新创造、新身份正在你内在孕育，不一定与生育有关。梦见水或海啸：多关联情绪——平静的水指内在安定，汹涌的海啸常指被强烈情绪淹没的感觉。梦见火：可以是愤怒、激情、转化或毁灭，看它在梦里带给你的是温暖还是失控。",
      pEn: "Dreaming of pregnancy: often symbolizes 'a new beginning' — a new project, creation, or identity gestating within you, not necessarily about childbirth. Dreaming of water or a tsunami: relates to emotion — calm water suggests inner steadiness, a raging tsunami often suggests being overwhelmed by intense feeling. Dreaming of fire: can be anger, passion, transformation, or destruction — note whether it brings warmth or chaos in the dream.",
    },
    {
      hZh: "掉头发 · 结婚", hEn: "Hair loss · marriage",
      pZh: "梦见掉头发：常关联对衰老、健康、形象或「失去力量/自信」的担忧，也可能映照一段消耗你的处境。梦见结婚：未必关于婚姻本身，常象征两个部分的「结合」——内在的整合、对某种承诺的渴望，或人生进入新阶段的过渡。",
      pEn: "Dreaming of hair loss: often tied to worries about aging, health, image, or 'losing power/confidence,' and may mirror a draining situation. Dreaming of marriage: not necessarily about marriage itself, often symbolizing a 'union' of two parts — inner integration, a longing for some commitment, or a transition into a new life stage.",
    },
    {
      hZh: "死亡与亲人去世", hEn: "Death and a loved one dying",
      pZh: "梦见死亡：在象征层面，死亡极少指真正的死亡，而常代表「结束与新生」——某段关系、某个旧自我、某种生活方式正在结束，为新的让路。梦见还在世的亲人去世：通常不是预兆，而是你在处理对失去的恐惧、关系的变化，或对方在你心中角色的转变。请温柔对待这类梦——它触动的是你与爱和失去的关系。",
      pEn: "Dreaming of death: symbolically, death rarely means literal death, often representing 'endings and renewal' — a relationship, an old self, or a way of living ending to make room for the new. Dreaming of a living loved one dying: usually not an omen, but your processing of the fear of loss, a changing relationship, or a shift in their role in your life. Be gentle with such dreams — they touch your relationship with love and loss.",
    },
  ],
  faq: [
    { q: "梦见怀孕是什么意思？", a: "梦见怀孕常象征新的开始——一个新计划、新创造或新身份正在你内在孕育，不一定和生育有关。结合你近期是否在酝酿某件新事物，往往更能读懂它。" },
    { q: "梦见亲人去世是预兆吗？", a: "通常不是预兆。梦见还在世的亲人去世，多是你在处理对失去的恐惧、关系的变化，或对方在你心中角色的转变。死亡在梦里常象征「结束与新生」，而非字面的死亡。请温柔看待这类梦。" },
    { q: "梦见水/海啸代表什么？", a: "水常关联情绪：平静的水面多指内在安定，汹涌的海啸常代表被强烈情绪淹没的感觉。可以问自己：最近有没有一种情绪大到快要「淹没」我？" },
  ],
  note: "温柔提示：若梦见亲人去世让你长期不安，记得这通常只是象征，与现实无关；如果情绪持续低落，和信任的人聊聊或寻求专业支持都会有帮助。",
  noteEn: "A gentle note: dream symbols are references, not verdicts. If a dream connects to lasting distress or trauma, please consider professional support. Lingxi's readings are companionship and inspiration, not a substitute for professional help.",
  cta: {
    titleZh: "读懂你自己的象征", titleEn: "Read your own symbols",
    descZh: "象征只是起点。写下你的梦，灵犀场会结合你的情绪与近况温柔解读。", descEn: "Symbols are a start. Write your dream; Lingxi Field reads it with your feelings and context.",
    href: "/dream", btnZh: "进入梦境解析", btnEn: "Open dream interpretation",
  },
  related: [
    { href: "/learn/dream-symbols", zh: "常见梦境象征（一）", en: "Common dream symbols I" },
    { href: "/learn/dream", zh: "如何解梦", en: "How to interpret dreams" },
  ],
};

export default function Page() {
  return <LearnArticle data={data} />;
}
