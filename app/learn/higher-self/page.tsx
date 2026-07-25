import LearnArticle, { ArticleData } from "@/components/LearnArticle";

export const metadata = {
  title: "什么是高我？如何与高我连接",
  description:
    "高我是你更深、更智慧、与本源相连的那部分意识。本文解释高我是什么、它与小我的区别，以及如何通过安静、直觉与心来与高我连接。What is the higher self and how to connect.",
  alternates: { canonical: "/learn/higher-self" },
};

const data: ArticleData = {
  slug: "higher-self",
  eyebrowZh: "体系 · 高我", eyebrowEn: "The System · Higher Self",
  titleZh: "什么是高我？如何与高我连接", titleEn: "What Is the Higher Self, and How to Connect",
  defZh: "高我，是你更深、更智慧、与本源相连的那部分意识——它超越日常的恐惧与念头，知道你真正是谁、真正想要什么。与高我连接，不是向外寻找某个神明，而是向内安静下来，听见那个一直都在的、更清明的自己。",
  defEn: "The higher self is the deeper, wiser part of your consciousness connected to Source — beyond daily fears and thoughts, it knows who you truly are and what you truly want. Connecting with it isn't seeking some external deity, but growing quiet within and hearing the clearer self that has always been there.",
  sections: [
    {
      hZh: "高我与小我的区别", hEn: "Higher self vs. the ego",
      pZh: "小我（日常自我）由恐惧、比较、生存焦虑驱动，声音急促而响亮；高我的声音通常安静、平和、笃定，不带恐慌。一个简单的辨别法：让你收缩、恐惧、急于证明的，多来自小我；让你扩展、平静、回到爱的，多来自高我。",
      pEn: "The ego (everyday self) is driven by fear, comparison, and survival anxiety — its voice is urgent and loud; the higher self's voice is usually quiet, peaceful, and certain, without panic. A simple test: what makes you contract, fear, and rush to prove yourself tends to come from the ego; what makes you expand, settle, and return to love tends to come from the higher self.",
    },
    {
      hZh: "如何连接高我", hEn: "How to connect",
      pZh: "1) 安静：冥想、独处、亲近自然，降低头脑的噪音。2) 回到心：把注意力从思考移到心的感受。3) 留意直觉：那些不带恐惧、反复出现的「轻声指引」。4) 提问与书写：写下一个问题，然后凭直觉自由书写答案。5) 信任：连接不是一次惊天的体验，而是日复一日越来越熟悉那份内在的清明。",
      pEn: "1) Quiet: meditation, solitude, time in nature lower the mind's noise. 2) Return to the heart: move attention from thinking to the heart's feeling. 3) Notice intuition: those fear-free, recurring 'quiet nudges.' 4) Ask and write: write a question, then free-write the answer from intuition. 5) Trust: connection isn't one dramatic experience but growing more familiar, day by day, with that inner clarity.",
    },
    {
      hZh: "连接之后", hEn: "After you connect",
      pZh: "与高我连接的目的，不是逃离生活，而是更清明地活在生活里：做选择时多一分笃定，面对恐惧时多一分稳定，对待自己与他人时多一分慈悲。高我不会替你过日子，但它会在你愿意安静下来时，给你方向。",
      pEn: "The point of connecting with the higher self isn't to escape life but to live it more clearly: a little more certainty in choices, a little more steadiness facing fear, a little more compassion toward yourself and others. The higher self won't live your life for you, but when you're willing to grow quiet, it offers direction.",
    },
  ],
  faq: [
    { q: "高我是什么？", a: "高我是你更深、更智慧、与本源相连的那部分意识，超越日常的恐惧与念头，知道你真正是谁、真正想要什么。" },
    { q: "怎样和高我连接？", a: "通过安静（冥想、独处、亲近自然）降低头脑噪音，把注意力回到心，留意那些不带恐惧、反复出现的直觉，并用书写向内提问。连接是日积月累地熟悉那份内在清明，而非一次性的惊人体验。" },
    { q: "怎么分辨是高我还是小我在说话？", a: "让你收缩、恐惧、急于证明自己的，多是小我；让你扩展、平静、回到爱与笃定的，多是高我。高我的声音通常安静而不带恐慌。" },
  ],
  cta: {
    titleZh: "向内，回到清明", titleEn: "Turn inward, return to clarity",
    descZh: "在重塑潜意识的「心灵·忆」里，与灵犀场一起向内探索，听见更深的自己。", descEn: "In the Mind gate, explore inward with Lingxi and hear your deeper self.",
    href: "/gate/mind", btnZh: "进入心灵之门", btnEn: "Open the Mind gate",
  },
  related: [
    { href: "/learn/wingmakers", zh: "主权与完整导览", en: "Sovereignty & Wholeness" },
    { href: "/learn/how-to-meditate", zh: "如何冥想", en: "How to meditate" },
  ],
};

export default function Page() {
  return <LearnArticle data={data} />;
}
