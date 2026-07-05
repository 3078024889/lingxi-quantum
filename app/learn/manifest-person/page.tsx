import LearnArticle, { ArticleData } from "@/components/LearnArticle";

export const metadata = {
  title: "如何显化一个人或一段关系（健康的方式）",
  description:
    "显化一个具体的人或一段关系，关键不是控制对方，而是先成为那段关系所需要的自己，并对齐爱与连接的频率。本文讲解健康显化关系的方法与边界。How to manifest a specific person, ethically.",
  alternates: { canonical: "/learn/manifest-person" },
};

const data: ArticleData = {
  slug: "manifest-person",
  eyebrowZh: "显化 · 关系", eyebrowEn: "Manifestation · Love",
  titleZh: "如何显化一个人或一段关系", titleEn: "How to Manifest a Specific Person or Relationship",
  defZh: "显化一段关系，健康的核心不是「让某个人非你不可」，而是先成为那段关系所需要的自己，并对齐爱、安全感与连接的频率。你无法、也不应剥夺他人的自由意志；但你可以成为爱的来源，从而自然吸引同频的人——无论是那个人，还是更适合你的人。",
  defEn: "Manifesting a relationship, done healthily, isn't about making someone 'unable to live without you,' but becoming the self that relationship needs and aligning with the frequency of love, safety, and connection. You cannot and should not override another's free will; but you can become a source of love and naturally attract someone on your frequency — whether that person, or someone better suited to you.",
  sections: [
    {
      hZh: "先回到自己", hEn: "Return to yourself first",
      pZh: "最强的关系显化，从你与自己的关系开始。当你内在充盈、不再从匮乏出发去抓取，你散发的频率自然吸引健康的连接。问自己：「在理想关系里，我是怎样的我？」然后从今天起，先成为那个版本——更平静、更自爱、更敢于真实。",
      pEn: "The strongest relationship manifestation begins with your relationship to yourself. When you're inwardly full and no longer grasping from lack, the frequency you radiate naturally attracts healthy connection. Ask: 'who am I in my ideal relationship?' Then start becoming that version today — calmer, more self-loving, more willing to be real.",
    },
    {
      hZh: "对齐而非控制", hEn: "Align, don't control",
      pZh: "试图用显化「逼」某个人爱你，既不道德也常常适得其反——它出自恐惧，传递的是匮乏。更好的做法是：观想你们之间那种相互尊重、自在流动的感觉，对齐爱本身的频率，同时真诚地祝福对方自由。若你们本就同频，连接会更顺；若不是，宇宙常会带来更契合的人。",
      pEn: "Trying to 'force' someone to love you through manifestation is neither ethical nor effective — it comes from fear and broadcasts lack. Better: visualize the feeling of mutual respect and easy flow between you, align with the frequency of love itself, while sincerely wishing the other person freedom. If you're truly on the same frequency, connection flows; if not, the universe often brings someone more aligned.",
    },
    {
      hZh: "放手与信任", hEn: "Release and trust",
      pZh: "显化关系最难也最关键的一步是放手：不监控对方的一举一动，不把全部价值押在一个结果上。你保持自己的丰盛与开放，信任最适合你的连接会到来。执着会收紧能量，放手才让爱有空间流动。",
      pEn: "The hardest and most crucial step is release: don't monitor their every move or stake all your worth on one outcome. Stay abundant and open within yourself, trusting that the connection most right for you will come. Attachment tightens energy; release gives love room to flow.",
    },
  ],
  faq: [
    { q: "可以显化一个具体的人爱上我吗？", a: "你可以对齐爱与连接的频率、成为理想关系里的自己，从而自然吸引同频的人；但你无法、也不应剥夺他人的自由意志。健康的显化是成为爱的来源并放手信任，而非控制或「逼」某人爱你。" },
    { q: "显化前任复合可行吗？", a: "与其聚焦「复合」这个结果，不如先疗愈那段关系留下的情绪、成为更完整的自己。若你们真正同频，连接可能自然恢复；若不是，放手往往为更适合你的关系腾出空间。把焦点放回自己，是最稳的路。" },
    { q: "为什么我越想显化关系越没结果？", a: "因为从匮乏和执着出发的显化，传递的是「我现在很缺」。试着先回到自我充盈的状态，放下对单一结果的紧抓，让爱有空间流动——状态一变，吸引力才会真正启动。" },
  ],
  cta: {
    titleZh: "进入「络」之门", titleEn: "Enter the gate of Connection",
    descZh: "在重塑潜意识的「关系·络」里，先回到自己的中心，再让连接自然流动。", descEn: "In the Relationship gate, return to your center first, then let connection flow.",
    href: "/gate/relation", btnZh: "进入关系之门", btnEn: "Open the Relationship gate",
  },
  related: [
    { href: "/learn/manifestation", zh: "什么是显化", en: "What manifestation is" },
    { href: "/learn/manifestation-not-working", zh: "显化没效果怎么办", en: "When it's not working" },
  ],
};

export default function Page() {
  return <LearnArticle data={data} />;
}
