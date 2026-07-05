import LearnArticle, { ArticleData } from "@/components/LearnArticle";

export const metadata = {
  title: "放不下一个人怎么办：不是忘记，是完成",
  description:
    "放不下一个人，不是因为爱得太深，而是那段能量还未完成。本文讲清「放下」的真正含义：不是删除记忆，而是在心里完成告别，把能量收回自己的场。",
  alternates: { canonical: "/learn/letting-go" },
};

const data: ArticleData = {
  slug: "letting-go",
  eyebrowZh: "关系 · 疗愈", eyebrowEn: "Relationships · Healing",
  titleZh: "放不下一个人怎么办", titleEn: "When You Can't Let Someone Go",
  defZh: "你删了联系方式，却删不掉半夜想起他的那一秒。所有人都劝你「放下」，可没人告诉你放下究竟是什么。放下不是忘记——记忆无法被删除；放下是完成：那段关系里没说完的话、没得到的答案、没做成的告别，都还牵着你的一缕能量。完成它，能量回到你自己的场，你就自由了。",
  defEn: "You deleted their contact, but not the second you think of them at 3 a.m. Everyone tells you to 'let go,' yet no one says what that means. Letting go is not forgetting — memory cannot be deleted. Letting go is completing: the unsaid words, the unanswered why, the farewell that never happened — each still holds a strand of your energy. Complete it, and the energy returns to your own field. Then you are free.",
  sections: [
    {
      hZh: "你放不下的，往往不是他", hEn: "It is often not them you can't release",
      pZh: "诚实地看一眼：你放不下的，是那个人，还是他在场时的你自己——被爱着的、有盼头的、发着光的那个你？很多执念的真相是：我们把自己的一部分存放在了对方身上，以为失去他，就失去了那个版本的自己。但那份光从来不是他给的，是你在爱里自然亮起来的。他离开了，灯还是你的。第一步，是把「那个版本的我」认领回来。",
      pEn: "Look honestly: is it the person you can't release — or the you that existed around them: loved, hopeful, glowing? The truth of many obsessions is that we deposited a part of ourselves in the other, and believe losing them means losing that version of us. But that light was never given by them; it was you, naturally lit within love. They left — the lamp is still yours. Step one is to reclaim that version of yourself.",
    },
    {
      hZh: "在心里完成那场没有发生的告别", hEn: "Complete the farewell that never happened",
      pZh: "找一个安静的时刻，拿一张纸，把所有没说出口的话写给他——愤怒的、不甘的、感谢的、祝福的，全部写完，不必寄出。然后轻声说三句话：谢谢你带来的一切；我把不属于我的还给你；我把属于我的收回来。这不是仪式感的表演，而是在你的内在世界里，真正为这段能量画上句点。先在心里原谅与完成，现实里的松开常会随后到来。",
      pEn: "Find a quiet moment and a sheet of paper. Write everything unsaid — the anger, the ache, the gratitude, the blessing — all of it, never to be sent. Then say three lines softly: thank you for all of it; I return what was never mine; I take back what is mine. This is no performance of ritual — it is a true full stop for that current within your inner world. Forgive and complete inwardly first, and the outward release often follows.",
    },
    {
      hZh: "把腾出来的能量，用来成为", hEn: "Spend the freed energy on becoming",
      pZh: "执念占用的能量惊人——那些反复回放、检查动态、假设「如果当初」的时刻，都是你的生命力在向过去漏水。完成告别之后，把这股能量导向一个新的方向：写下你想成为的样子，每天用几分钟活进去。你会发现一个安静的规律：当你不再追，愿意留下的自己留了下来；当你先成为想遇见的人，同频者自会出现。放下的终点不是空，是新的开始。",
      pEn: "Obsession consumes staggering energy — every replay, every check of their feed, every 'what if' is life-force leaking into the past. After the farewell, direct that current somewhere new: write who you wish to become, and live into it a few minutes a day. A quiet law reveals itself: when you stop gripping, what is willing to stay, stays; become the one you hope to meet, and those of one frequency appear. The end of letting go is not emptiness — it is a beginning.",
    },
  ],
  faq: [
    { q: "放下一个人需要多长时间？", a: "没有标准时长——放下与时间无关，与完成相关。有人十年放不下，是因为那场告别从未真正发生；有人几周就走了出来，是因为他在心里完成了它。与其数日子，不如去做那件完成的事：写下没说的话，收回属于自己的能量。" },
    { q: "总是梦见他，是不是说明缘分未尽？", a: "更可靠的理解是：你们之间未完结的能量还在你的场域里回响，夜里借他的样子浮现。这个梦不是预言，是提醒——它在指给你那件还没完成的事。读懂并完成它，梦往往自然改变或停止。" },
    { q: "还爱着他，但知道不该继续，怎么办？", a: "爱与继续，是两回事。你可以承认爱真实存在过，同时选择不再让它主导你的现在——这正是主权：不否认感受，但由你决定能量的去向。祝福他，然后把能量收回来，用于成为你自己。" },
  ],
  cta: {
    titleZh: "把回放的夜，换成完成的仪式", titleEn: "Trade the replaying nights for completion",
    descZh: "在现实回路里写下告别与新的开始；反复的梦，交给探索梦境读懂它。", descEn: "Write the farewell and the new beginning in the Reality Loop; give the recurring dream to Dream Interpretation to be understood.",
    href: "/live-as", btnZh: "进入现实回路", btnEn: "Open the Reality Loop",
  },
  related: [
    { href: "/learn/dream-same-person", zh: "总是梦见同一个人", en: "Dreaming of the same person" },
    { href: "/learn/manifest-love", zh: "如何显化爱情", en: "Manifest love" },
  ],
};

export default function Page() {
  return <LearnArticle data={data} />;
}
