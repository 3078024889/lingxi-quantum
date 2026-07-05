import LearnArticle, { ArticleData } from "@/components/LearnArticle";

export const metadata = {
  title: "清醒梦怎么做：入门方法与练习",
  description:
    "清醒梦是指在梦中意识到自己正在做梦，甚至能影响梦境。本文讲解清醒梦的原理、现实检验、MILD 与 WBTB 等入门方法，以及注意事项。How to lucid dream: methods for beginners.",
  alternates: { canonical: "/learn/lucid-dreaming" },
};

const data: ArticleData = {
  slug: "lucid-dreaming",
  eyebrowZh: "解梦 · 清醒梦", eyebrowEn: "Dreams · Lucid dreaming",
  titleZh: "清醒梦怎么做：入门指南", titleEn: "How to Lucid Dream: A Beginner's Guide",
  defZh: "清醒梦，是指你在梦中意识到「我正在做梦」，有时甚至能有意识地影响梦境。它是一种可以通过练习培养的能力——核心是提高你在梦中觉察的频率。对很多人来说，清醒梦是探索潜意识、面对恐惧、或单纯体验自由的奇妙入口。",
  defEn: "A lucid dream is one in which you become aware that 'I am dreaming,' sometimes even able to consciously influence the dream. It's a skill you can cultivate with practice — the core is raising how often you notice awareness within dreams. For many, lucid dreaming is a remarkable doorway to exploring the subconscious, facing fears, or simply experiencing freedom.",
  sections: [
    {
      hZh: "记梦 + 现实检验", hEn: "Dream journaling + reality checks",
      pZh: "两个基础：1) 坚持记梦——每天醒来写下梦，能大幅提升你对梦境的觉察与记忆，这是清醒梦的地基。2) 现实检验——白天反复问自己「我现在是在做梦吗」，并做个检验（看手、看时间两次、捏鼻子试着呼吸）。养成习惯后，你会在梦里也这么做，从而「醒」过来。",
      pEn: "Two basics: 1) Keep a dream journal — writing dreams each morning greatly improves your awareness and recall, the foundation of lucid dreaming. 2) Reality checks — throughout the day, ask 'am I dreaming right now?' and test it (look at your hands, check a clock twice, pinch your nose and try to breathe). Once it's a habit, you'll do it in dreams too — and 'wake up' inside them.",
    },
    {
      hZh: "MILD 与 WBTB 方法", hEn: "The MILD and WBTB methods",
      pZh: "MILD（记忆诱导）：入睡前反复默念「下次做梦时，我会知道自己在做梦」，并想象自己在梦中变清醒。WBTB（醒后回睡）：睡约 5 小时后醒来 20–30 分钟（看看记的梦），再带着清醒意图回睡——此时更接近快速眼动期，更易进入清醒梦。",
      pEn: "MILD (mnemonic induction): before sleep, repeat 'next time I'm dreaming, I'll know I'm dreaming,' and imagine becoming lucid in a dream. WBTB (wake back to bed): after about 5 hours of sleep, stay awake 20–30 minutes (review your dream journal), then return to sleep holding the intention to be lucid — you're closer to REM sleep then, making lucidity easier.",
    },
    {
      hZh: "注意事项", hEn: "A few cautions",
      pZh: "清醒梦总体安全，但有几点要知道：刻意频繁打断睡眠可能影响睡眠质量，别为追求清醒梦而牺牲休息；偶尔可能伴随睡眠瘫痪（俗称鬼压床），知道它无害、保持放松即可。如果你本就睡眠困难或有相关困扰，温和地练习、必要时咨询专业人士。",
      pEn: "Lucid dreaming is generally safe, but note: deliberately fragmenting sleep can affect sleep quality, so don't sacrifice rest chasing lucidity; it can occasionally come with sleep paralysis, which is harmless — knowing this and staying relaxed helps. If you already struggle with sleep, practice gently and consult a professional if needed.",
    },
  ],
  faq: [
    { q: "怎样才能做清醒梦？", a: "最有效的入门组合是：每天记梦、白天反复做现实检验（如看手、看两次时间），再配合 MILD（睡前默念会意识到在做梦）或 WBTB（睡约5小时后醒一会儿再带意图回睡）。坚持几周，多数人都能体验到清醒梦。" },
    { q: "清醒梦安全吗？", a: "对大多数人是安全的。需要注意的是别为追求清醒梦而过度打断睡眠、牺牲休息；偶尔可能伴随睡眠瘫痪，但它无害，保持放松即可。若本就睡眠困难，温和练习并在需要时咨询专业人士。" },
    { q: "记不住梦还能做清醒梦吗？", a: "先从提升记梦开始——每天醒来立刻写下任何梦的碎片，回忆能力会逐步增强。记梦是清醒梦的地基，记得越多，越容易在梦中察觉自己在做梦。" },
  ],
  cta: {
    titleZh: "从记梦开始", titleEn: "Begin with dream journaling",
    descZh: "在灵犀梦境解析里记录每一个梦，提升觉察，也为清醒梦打下地基。", descEn: "Record every dream in Lingxi to build awareness — and the foundation for lucid dreaming.",
    href: "/dream", btnZh: "进入梦境解析", btnEn: "Open dream interpretation",
  },
  related: [
    { href: "/learn/dream", zh: "如何解梦", en: "How to interpret dreams" },
    { href: "/learn/remember-dreams", zh: "如何记住梦", en: "How to remember dreams" },
  ],
};

export default function Page() {
  return <LearnArticle data={data} />;
}
