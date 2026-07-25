import LearnArticle, { ArticleData } from "@/components/LearnArticle";

export const metadata = {
  title: "梦是预兆吗？梦能预知未来吗",
  description:
    "梦到的事会成真吗？大多数梦是潜意识在处理情绪与信息，而非预言。本文理性地谈梦与预兆、似曾相识感，以及如何看待「预知梦」。Are dreams premonitions?",
  alternates: { canonical: "/learn/dreams-premonition" },
};

const data: ArticleData = {
  slug: "dreams-premonition",
  eyebrowZh: "解梦 · 预兆", eyebrowEn: "Dreams · Premonition",
  titleZh: "梦是预兆吗？梦能预知未来吗", titleEn: "Are Dreams Premonitions? Can Dreams Predict the Future?",
  defZh: "绝大多数梦不是对未来的预言，而是潜意识在处理你的情绪、记忆与日常信息。偶尔有梦「应验」，更多是因为：你的潜意识本就在默默分析现实、做出合理推测，加上记忆的选择性（你更容易记住应验的、忘掉没应验的）。把梦当作了解内在的窗口，比当作占卜更可靠也更有益。",
  defEn: "The vast majority of dreams aren't prophecies of the future but the subconscious processing your emotions, memories, and daily information. When a dream occasionally 'comes true,' it's usually because your subconscious was already quietly analyzing reality and making reasonable guesses — plus selective memory (you recall the hits and forget the misses). Treating dreams as a window into your inner world is more reliable and more useful than treating them as divination.",
  sections: [
    {
      hZh: "为什么有的梦像「应验」了", hEn: "Why some dreams seem to 'come true'",
      pZh: "你的潜意识全天都在吸收信息、感知模式。有时它比清醒的你更早察觉到某种趋势（一段关系在变、身体在发出信号），于是在梦里呈现出来——当事情随后发生，就像被「预知」了。再加上确认偏误：应验的梦让你印象深刻，没应验的早被忘掉。这不是超自然，而是潜意识的洞察力。",
      pEn: "Your subconscious absorbs information and senses patterns all day. Sometimes it notices a trend before your waking mind does (a relationship shifting, the body signaling), and shows it in a dream — so when things later unfold, it feels 'foreseen.' Add confirmation bias: dreams that hit leave a strong impression, while the misses are forgotten. This isn't supernatural — it's the subconscious's insight.",
    },
    {
      hZh: "似曾相识（déjà rêvé）", hEn: "Déjà vu and dreams",
      pZh: "有时你会觉得「这个场景我梦到过」。这种似曾相识感，更多与大脑记忆的处理方式有关，而非真的预知。它很迷人，但不必据此对未来下结论——把它当作一个温柔的提醒：留意此刻，而不是焦虑地解读命运。",
      pEn: "Sometimes you feel 'I dreamed this scene before.' This sense of déjà vu has more to do with how the brain processes memory than with genuine foresight. It's fascinating, but no basis for conclusions about the future — take it as a gentle nudge to notice the present, not to anxiously read fate.",
    },
    {
      hZh: "更有用的看待方式", hEn: "A more useful lens",
      pZh: "与其问「这个梦会不会成真」，不如问「这个梦在告诉我什么此刻的真相」。梦最大的价值，是照见你正在处理的情绪、回避的议题、渴望的方向。带着这份觉察行动，远比等待预言应验更能改变你的现实。",
      pEn: "Instead of 'will this dream come true,' ask 'what present truth is this dream showing me?' A dream's greatest value is revealing the emotions you're processing, the issues you avoid, the directions you long for. Acting on that awareness changes your reality far more than waiting for a prophecy to land.",
    },
  ],
  faq: [
    { q: "梦到的事会成真吗？", a: "大多数不会。梦主要是潜意识在处理情绪与信息，而非预言。偶尔「应验」，多是因为潜意识本就在分析现实、做出合理推测，加上你更容易记住应验的梦。把梦当作了解内在的窗口更可靠。" },
    { q: "为什么有些梦感觉像预知未来？", a: "因为潜意识全天感知模式，有时比清醒的你更早察觉某种趋势并在梦里呈现；事情随后发生就像被预知。再加上确认偏误——应验的印象深、没应验的被忘记。这是潜意识的洞察力，而非超自然。" },
    { q: "我该不该相信预知梦？", a: "与其据梦预测未来，不如把梦当作照见当下情绪与议题的镜子。问「这个梦在告诉我什么真相」，并带着觉察去行动——这比等待预言应验更能真正改变你的现实。" },
  ],
  cta: {
    titleZh: "读懂梦此刻的讯息", titleEn: "Read the dream's present message",
    descZh: "写下你的梦，发送至场，灵犀场帮你看见它在照见的此刻真相。", descEn: "Write your dream, send it to the field, and Lingxi helps you see the present truth it reflects.",
    href: "/dream", btnZh: "进入梦境解析", btnEn: "Open dream interpretation",
  },
  related: [
    { href: "/learn/dream", zh: "如何解梦", en: "How to interpret dreams" },
    { href: "/learn/dream-symbols", zh: "常见梦境象征", en: "Common dream symbols" },
  ],
};

export default function Page() {
  return <LearnArticle data={data} />;
}
