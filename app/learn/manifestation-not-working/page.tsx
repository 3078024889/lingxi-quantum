import LearnArticle, { ArticleData } from "@/components/LearnArticle";

export const metadata = {
  title: "显化没效果？为什么显化失败，以及如何修正",
  description:
    "显化没效果，常见原因是内在抗拒、急于求成、与潜意识旧信念冲突，或只想不做。本文拆解显化失败的 6 个原因与对应的修正方法。Why manifestation isn't working and how to fix it.",
  alternates: { canonical: "/learn/manifestation-not-working" },
};

const data: ArticleData = {
  slug: "manifestation-not-working",
  eyebrowZh: "显化 · 进阶", eyebrowEn: "Manifestation · Deep dive",
  titleZh: "显化没效果？原因与修正", titleEn: "Manifestation Not Working? Why, and How to Fix It",
  defZh: "显化没效果，最常见的原因不是方法不对，而是你在「想要」的同时，潜意识里还持有「我不配」「不可能」的旧信念，或急于盯着结果、用力过猛。当内在状态与渴望相互矛盾，对齐就无法发生。修正的关键，是先化解抗拒、再放手对齐。",
  defEn: "When manifestation isn't working, the usual cause isn't the technique but a conflict: while you 'want' it, your subconscious still holds old beliefs like 'I'm unworthy' or 'impossible,' or you grip the outcome too tightly. When your inner state contradicts your desire, alignment can't happen. The fix is to dissolve resistance first, then release into alignment.",
  sections: [
    {
      hZh: "6 个常见原因", hEn: "Six common reasons",
      pZh: "1) 潜意识冲突：表面想要，深层觉得不配。2) 急于求成：每天「检查」它来了没，传递的是匮乏。3) 只想不做：从不采取那个版本的你会做的行动。4) 目标模糊：连自己想要什么都说不清。5) 自我怀疑：心里默认「不可能」。6) 抗拒现状：用对抗当下的方式去要未来，反而把它推远。",
      pEn: "1) Subconscious conflict: you want it on the surface but feel unworthy underneath. 2) Impatience: checking daily whether it arrived broadcasts lack. 3) Thinking without acting: never taking the actions that version would. 4) Vague goals: you can't even name what you want. 5) Self-doubt: a default 'impossible' running underneath. 6) Resisting the present: fighting now to demand later only pushes it away.",
    },
    {
      hZh: "怎么修正", hEn: "How to fix it",
      pZh: "先做减法：找出那条最响的「我不配/不可能」的旧信念，温柔质疑它、改写它。再把目标写得具体、可感。然后把注意力从「结果何时来」移回「此刻成为那个版本」——每天进入已经拥有的感受，并做一件对齐的小事。最后，练习放手：你播种、浇水，然后允许它按自己的节奏发生。",
      pEn: "Subtract first: find the loudest 'I'm unworthy / impossible' belief, question it gently, and rewrite it. Make the goal specific and felt. Then move attention from 'when will it arrive' back to 'becoming that version now' — each day enter the felt sense of already having it and take one aligned action. Finally, practice release: you plant and water, then allow it to unfold at its own pace.",
    },
    {
      hZh: "需要多久才有效", hEn: "How long does it take",
      pZh: "没有统一时间表。意识层面的转变可以在一个片刻发生，而它在现实中显现，取决于你能多稳定地维持新状态、以及现实需要多少步来重组。与其问「还要多久」，不如问「我今天是否更像那个版本」——这才是真正能掌控、也最能加速的部分。",
      pEn: "There is no fixed timeline. A shift in consciousness can happen in a moment, while its appearance in reality depends on how steadily you hold the new state and how many steps reality needs to reorganize. Instead of 'how much longer,' ask 'am I more like that version today' — that is the part you can actually control, and what accelerates it most.",
    },
  ],
  faq: [
    { q: "显化多久才会有效果？", a: "没有固定时间。意识层面的转变可在一瞬发生，但在现实中显现取决于你维持新状态的稳定度，以及现实重组所需的步骤。与其纠结时间，不如每天确认自己是否更接近那个版本。" },
    { q: "显化一直没用，是不是我不适合？", a: "不是。显化没用通常说明存在内在抗拒或潜意识冲突，而非你不适合。找出那条「我不配/不可能」的旧信念并温柔改写，把目标写具体，再配合微小行动，往往就会松动。" },
    { q: "为什么越想要越得不到？", a: "因为「紧盯结果、反复检查」传递的其实是匮乏感——你在不断提醒自己「现在还没有」。放手不是放弃，而是把注意力放回当下的状态与行动，让对齐自然发生。" },
  ],
  cta: {
    titleZh: "用每日签到化解抗拒", titleEn: "Dissolve resistance with daily check-in",
    descZh: "灵犀的显化签到帮你每天回到「已经拥有」的状态，并给你来自场的回响。", descEn: "Lingxi's daily check-in returns you to the 'already have it' state, with a reflection from the field.",
    href: "/live-as", btnZh: "进入显化签到", btnEn: "Open the check-in",
  },
  related: [
    { href: "/learn/manifestation", zh: "什么是显化", en: "What manifestation is" },
    { href: "/learn/manifestation-signs", zh: "显化生效的征兆", en: "Signs it's working" },
  ],
};

export default function Page() {
  return <LearnArticle data={data} />;
}
