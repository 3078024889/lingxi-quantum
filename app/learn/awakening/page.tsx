import LearnArticle, { ArticleData } from "@/components/LearnArticle";

export const metadata = {
  title: "什么是灵性觉醒？征兆与如何度过",
  description:
    "灵性觉醒，指你开始看穿旧有的自我认同与信念，向更真实、更连接的自己转变。本文讲解觉醒的常见征兆、可能的困惑，以及如何温柔地度过这段历程。What is spiritual awakening.",
  alternates: { canonical: "/learn/awakening" },
};

const data: ArticleData = {
  slug: "awakening",
  eyebrowZh: "体系 · 觉醒", eyebrowEn: "The System · Awakening",
  titleZh: "什么是灵性觉醒？", titleEn: "What Is Spiritual Awakening?",
  defZh: "灵性觉醒，指你开始看穿过去赖以定义自己的信念、角色与「应该」，向一个更真实、更连接的自己转变。它常以一种「我不能再这样活下去」的感觉开始——旧的不再合身，新的尚未清晰。觉醒不是一次终点，而是一个持续展开的过程：从社会驯化的自我，走向主权而完整的自己。",
  defEn: "Spiritual awakening is when you begin to see through the beliefs, roles, and 'shoulds' you once defined yourself by, shifting toward a truer, more connected self. It often begins with a sense of 'I can't keep living like this' — the old no longer fits, the new isn't yet clear. Awakening isn't a destination but an unfolding process: from the socially conditioned self toward the sovereign, whole one.",
  sections: [
    {
      hZh: "常见征兆", hEn: "Common signs",
      pZh: "对曾经在意的东西（地位、消费、随大流）忽然失去兴趣；开始质疑「我到底是谁、想要什么」；对真实与意义的渴望变强；对他人和世界的痛苦更敏感；独处与内省的需要增加；有时伴随一段迷茫、孤独或「与过去的自己告别」的悲伤。这些都是转变正在发生的迹象。",
      pEn: "Sudden loss of interest in what once mattered (status, consumption, going with the crowd); questioning 'who am I really, what do I want'; a stronger longing for truth and meaning; greater sensitivity to the pain of others and the world; an increased need for solitude and reflection; sometimes a stretch of confusion, loneliness, or grief at 'saying goodbye to who you were.' These are signs that a shift is underway.",
    },
    {
      hZh: "为什么会感到痛苦或迷茫", hEn: "Why it can feel painful",
      pZh: "觉醒常伴随不适，因为它要求你放下旧的身份与安全感，而新的还没成形。这不是你出了问题，而是「旧系统」在松动——是从被外界期待驯化的「社会人」，走向真正自己的过程。成长的阵痛，往往正是转变的证据。",
      pEn: "Awakening often comes with discomfort, because it asks you to release old identities and securities before the new has formed. This isn't something wrong with you, but the 'old system' loosening — the move from the 'social self' conditioned by outside expectation toward the true self. The growing pains are often the very evidence of transformation.",
    },
    {
      hZh: "如何温柔地度过", hEn: "How to move through it gently",
      pZh: "给自己时间和耐心，不必急着「搞懂一切」；保持身体的稳定（规律作息、呼吸、亲近自然）；找到能理解你的人或社群；用书写整理内在；并记得回到心——在最迷茫时，安静地回到呼吸与当下，往往比想出答案更有帮助。如果情绪持续低落到难以承受，寻求专业支持是有力量的选择。",
      pEn: "Give yourself time and patience; you don't have to 'figure it all out' at once; keep the body steady (regular rhythm, breath, nature); find people or community who understand you; use writing to sort the inner world; and remember to return to the heart — in the most confusing moments, quietly returning to breath and the present often helps more than thinking out an answer. If low mood becomes hard to bear, seeking professional support is a powerful choice.",
    },
  ],
  faq: [
    { q: "灵性觉醒有哪些征兆？", a: "常见的有：对旧有在意之物失去兴趣、开始质疑自己是谁与想要什么、对真实与意义的渴望变强、对痛苦更敏感、需要更多独处，有时伴随一段迷茫或与过去自己告别的悲伤。这些都是转变正在发生的迹象。" },
    { q: "为什么觉醒过程这么痛苦？", a: "因为觉醒要求你放下旧的身份与安全感，而新的还没成形。这不是你出了问题，而是旧系统在松动。把成长的阵痛理解为转变的证据，会让这段路好走一些。" },
    { q: "觉醒时该怎么照顾自己？", a: "给自己时间和耐心，保持身体稳定（作息、呼吸、亲近自然），找到能理解你的人，用书写整理内在，并常回到心与当下。如果情绪持续低落到难以承受，寻求专业支持是有力量的选择。" },
  ],
  note: "温柔提示：灵性觉醒中的迷茫与情绪起伏是常见的。但若你长期感到极度低落、空虚或难以应对，请认真对待，并考虑寻求心理咨询师等专业人士的支持——这与灵性成长并不冲突。",
  noteEn: "A gentle note: awakening can bring intense emotions and shifts in perception. If the process leaves you unable to function or in lasting distress, please seek professional support alongside your inner work — caring for yourself is part of the path.",
  cta: {
    titleZh: "在转变中回到自己", titleEn: "Return to yourself amid change",
    descZh: "从「出身·源」之门开始，松开旧编程，回到先于一切标签的本源自己。", descEn: "Begin at the Origin gate — loosen old programming and return to the source self before all labels.",
    href: "/gate/origin", btnZh: "进入出身之门", btnEn: "Open the Origin gate",
  },
  related: [
    { href: "/learn/higher-self", zh: "什么是高我", en: "What is the higher self" },
    { href: "/learn/inner-sovereignty", zh: "主权与完整导览", en: "Sovereignty & Wholeness" },
  ],
};

export default function Page() {
  return <LearnArticle data={data} />;
}
