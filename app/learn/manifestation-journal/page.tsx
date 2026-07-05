import LearnArticle, { ArticleData } from "@/components/LearnArticle";

export const metadata = {
  title: "显化日记怎么写：脚本写作与每日记录法",
  description:
    "显化日记是用书写把愿望写入潜意识的方法，包括脚本写作、感恩日记、肯定句与已实现日记。本文给出可直接照做的显化日记模板。How to keep a manifestation journal.",
  alternates: { canonical: "/learn/manifestation-journal" },
};

const data: ArticleData = {
  slug: "manifestation-journal",
  eyebrowZh: "显化 · 书写", eyebrowEn: "Manifestation · Journaling",
  titleZh: "显化日记怎么写", titleEn: "How to Keep a Manifestation Journal",
  defZh: "显化日记，是用书写把你想要的现实一遍遍写入潜意识的练习。它之所以有效，是因为书写要求你具体、清晰，并在落笔时调动情绪——而具体加情绪，正是改写潜意识的两把钥匙。常见形式有脚本写作、已实现日记、感恩日记与肯定句。",
  defEn: "A manifestation journal is the practice of writing your desired reality into the subconscious, again and again. It works because writing demands that you be specific and clear, and stirs emotion as you put pen to paper — and specificity plus emotion are the two keys to rewriting the subconscious. Common forms: scripting, the 'already done' journal, gratitude journaling, and affirmations.",
  sections: [
    {
      hZh: "脚本写作（最常用）", hEn: "Scripting (the most common)",
      pZh: "用现在时，像写日记一样详细描述「你已经拥有那种生活」的一天：你在哪里、在做什么、和谁在一起、心里是什么感受。越具体、越带情绪越好。重点不是文笔，而是写的时候你能否真的「感受到」它已经发生。",
      pEn: "In present tense, describe in journal-like detail a day in which 'you already have that life': where you are, what you're doing, who you're with, how you feel inside. The more specific and emotional, the better. It's not about prose, but whether, as you write, you can truly feel it has already happened.",
    },
    {
      hZh: "已实现日记 / 感恩日记", hEn: "'Already done' & gratitude journals",
      pZh: "已实现日记：为「已经发生」的愿望提前写下感谢，例如「谢谢这份让我充满热情的工作」。感恩日记：每天写下 3–5 件真心感恩的事，把频率稳定调向丰盛。两者都在训练潜意识把「拥有」当作现状。",
      pEn: "The 'already done' journal: thank a wish in advance as if it has happened — e.g. 'thank you for this work that fills me with passion.' Gratitude journal: write 3–5 things you genuinely appreciate each day, steadily tuning to abundance. Both train the subconscious to treat 'having' as the present.",
    },
    {
      hZh: "一个简单模板", hEn: "A simple template",
      pZh: "每天 5 分钟：1) 三件感恩的事；2) 一句现在时肯定句（我是…/我拥有…/我值得…）；3) 几行脚本，描述理想的一天的一个片段；4) 一个今天会采取的小行动。坚持比完美更重要——每天写一点点，远胜偶尔写很多。",
      pEn: "Five minutes daily: 1) three gratitudes; 2) one present-tense affirmation (I am… / I have… / I deserve…); 3) a few lines of scripting describing a slice of your ideal day; 4) one small action you'll take today. Consistency beats perfection — a little each day far outweighs a lot occasionally.",
    },
  ],
  faq: [
    { q: "显化日记真的有用吗？", a: "有用之处在于：书写迫使你把愿望写得具体清晰，并在落笔时调动情绪，而具体加情绪正是改写潜意识的关键。它同时帮你每天回到对齐的状态。把它当作日常练习，而非保证结果的魔法。" },
    { q: "显化日记应该用现在时还是将来时？", a: "用现在时。像「我已经拥有/我正在体验」这样的现在时，向潜意识传递「这已是现状」，比「我将会」更有力。落笔时尽量带入已经实现的真实感受。" },
    { q: "每天都要写吗？", a: "每天写一点点比偶尔写很多更有效。哪怕只有 5 分钟：几句感恩、一句肯定句、几行脚本，就足以稳定地把愿望写入潜意识。" },
  ],
  cta: {
    titleZh: "把书写变成显化签到", titleEn: "Turn journaling into a check-in",
    descZh: "灵犀的显化签到，就是一个每日书写「已经拥有」状态的地方，并给你来自场的回响。", descEn: "Lingxi's daily check-in is a place to write the 'already have it' state each day, with a reflection from the field.",
    href: "/live-as", btnZh: "进入显化签到", btnEn: "Open the check-in",
  },
  related: [
    { href: "/learn/manifestation-methods", zh: "显化方法大全", en: "Manifestation methods" },
    { href: "/learn/manifestation", zh: "什么是显化", en: "What manifestation is" },
  ],
};

export default function Page() {
  return <LearnArticle data={data} />;
}
