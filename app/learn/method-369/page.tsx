import LearnArticle, { ArticleData } from "@/components/LearnArticle";

export const metadata = {
  title: "369 显化法怎么做：完整步骤、原理与常见问题",
  description:
    "369 显化法：每天早 3 遍、午 6 遍、晚 9 遍，用现在时肯定句书写愿望，用重复把它写入潜意识。本文讲 369 法完整步骤、背后原理、写什么、以及为什么不灵。The 369 manifestation method explained.",
  alternates: { canonical: "/learn/method-369" },
};

const data: ArticleData = {
  slug: "method-369",
  eyebrowZh: "显化 · 369 法", eyebrowEn: "Manifestation · 369",
  titleZh: "369 显化法怎么做：完整步骤与原理", titleEn: "The 369 Method: Steps & How It Works",
  defZh: "369 显化法是一种用「重复书写」把愿望写入潜意识的方法：每天早上写 3 遍、中午写 6 遍、晚上写 9 遍你的愿望，用现在时、肯定句书写。它之所以有效，不在数字本身，而在于稳定的重复 + 书写时进入「已经拥有」的真实感受。",
  defEn: "The 369 method imprints your desire into the subconscious through repeated writing: each day write your desire 3 times in the morning, 6 at noon, and 9 at night, in present-tense affirmations. It works not because of the numbers, but because of steady repetition plus entering the felt sense of already having it while you write.",
  sections: [
    {
      hZh: "完整步骤", hEn: "The full steps",
      pZh: "① 把愿望写成一句现在时、肯定句，像它已经发生（例如：「我很感恩我拥有一份热爱且丰盛的工作」）。② 早上刚醒时写 3 遍。③ 中午写 6 遍。④ 晚上睡前写 9 遍。⑤ 书写时不要机械抄，每一遍都尽量带入「已经拥有」的画面与情绪。坚持至少 21–45 天。",
      pEn: "1) Write your desire as one present-tense affirmation, as if it already happened (e.g. 'I am grateful I have work I love and that is abundant'). 2) On waking, write it 3 times. 3) At noon, 6 times. 4) Before sleep, 9 times. 5) Don't copy mechanically — each time, bring in the image and emotion of already having it. Keep it up for at least 21–45 days.",
    },
    {
      hZh: "背后的原理", hEn: "Why it works",
      pZh: "潜意识会忠实地接受你反复输入并相信的信念。369 法用「早中晚 + 重复」持续给潜意识同一个信号，把「我拥有」从一句话变成一种被身体记住的状态。数字 3、6、9 只是帮助你规律执行的框架，真正起作用的是重复的稳定性与书写时的情绪真实度。",
      pEn: "The subconscious faithfully accepts the beliefs you repeatedly input and believe. The 369 method sends the same signal to the subconscious across morning, noon, and night, turning 'I have it' from a sentence into a state the body remembers. The numbers 3, 6, 9 are just a framework for consistency; what truly works is the steadiness of repetition and the emotional truth while writing.",
    },
    {
      hZh: "为什么不灵 / 注意事项", hEn: "Why it may not work",
      pZh: "常见问题：① 只是机械抄写，没有进入感受；② 中途频繁更换愿望，信号不连贯；③ 写的时候内心其实充满怀疑与匮乏感，等于同时输入了相反信念；④ 写完就急着「检查现实」，用焦虑抵消了对齐。改法：一次只专注一个愿望，书写时带情绪，写完把结果交出去，只守住自己的意图。",
      pEn: "Common issues: 1) copying mechanically without feeling; 2) switching desires often, breaking the signal; 3) writing while inwardly full of doubt and lack, which inputs the opposite belief; 4) rushing to 'check reality' afterward, cancelling alignment with anxiety. Fix: focus on one desire at a time, write with emotion, then hand the outcome over and keep only your intent.",
    },
  ],
  faq: [
    { q: "369 显化法要写多久才有效？", a: "一般建议至少坚持 21–45 天。重要的不是凑够天数，而是每天稳定地写、并真切进入「已经拥有」的感受。如果中途频繁更换愿望，信号会不连贯，建议一个周期只专注一个愿望。" },
    { q: "369 法应该写什么？", a: "写一句现在时、肯定句的愿望，像它已经实现（例如「我很感恩……」）。聚焦一个具体愿望，避免否定词（不要写「我不再贫穷」，改写「我拥有丰盛」）。" },
    { q: "早中晚一定要卡准时间吗？", a: "不必严格卡点。3、6、9 只是帮助你规律执行的框架，大致在早、中、晚三个时段完成即可。清晨刚醒和睡前效果通常更好，因为此时更接近潜意识。" },
  ],
  cta: {
    titleZh: "把 369 变成每日对齐", titleEn: "Turn 369 into daily alignment",
    descZh: "灵犀的现实回路，帮你每天进入状态、写入潜意识，并收到来自场的回响。", descEn: "Lingxi's Reality Loop helps you enter the state daily, imprint it, and receive a reflection from the field.",
    href: "/live-as", btnZh: "进入现实回路", btnEn: "Open the Reality Loop",
  },
  related: [
    { href: "/learn/manifestation-methods", zh: "显化方法大全", en: "All manifestation methods" },
    { href: "/learn/manifestation-not-working", zh: "显化不灵怎么办", en: "When manifestation isn't working" },
  ],
};

export default function Page() {
  return <LearnArticle data={data} />;
}
