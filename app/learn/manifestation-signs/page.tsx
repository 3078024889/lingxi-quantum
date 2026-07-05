import LearnArticle, { ArticleData } from "@/components/LearnArticle";

export const metadata = {
  title: "显化正在生效的 7 个征兆，以及如何确认",
  description:
    "显化生效的征兆包括：内在更平静、反复看到相关信号、机会突然增多、对结果不再焦虑。本文讲解如何识别显化正在发生，以及别误读的信号。Signs your manifestation is working.",
  alternates: { canonical: "/learn/manifestation-signs" },
};

const data: ArticleData = {
  slug: "manifestation-signs",
  eyebrowZh: "显化 · 征兆", eyebrowEn: "Manifestation · Signs",
  titleZh: "显化正在生效的 7 个征兆", titleEn: "7 Signs Your Manifestation Is Working",
  defZh: "显化正在生效，最可靠的征兆不是外在结果立刻出现，而是你的内在状态先变了：你更平静、对结果不再焦虑、开始反复遇到与目标相关的人事物、灵感和机会变多，并自然做出更对齐的选择。内在的转变，总是先于外在的显现。",
  defEn: "The most reliable sign your manifestation is working isn't an instant external result, but a shift in your inner state first: you feel calmer, less anxious about the outcome, start encountering people and events related to your goal, notice more ideas and opportunities, and naturally make more aligned choices. Inner change always precedes outer appearance.",
  sections: [
    {
      hZh: "7 个征兆", hEn: "Seven signs",
      pZh: "1) 内在变平静，对「它会不会来」不再纠结。2) 反复看到相关信号（数字、词语、画面）。3) 机会和邀约突然变多。4) 遇到能帮上忙的人。5) 灵感涌现，知道下一步该做什么。6) 旧的恐惧和匮乏感松动了。7) 你开始自然地像「已经拥有的自己」那样生活——这是最强的征兆。",
      pEn: "1) Inner calm; you stop agonizing over 'will it come.' 2) Repeated signs (numbers, words, images). 3) A sudden rise in opportunities and invitations. 4) Meeting people who can help. 5) Ideas arrive; you know the next step. 6) Old fear and lack loosen. 7) You begin living naturally as the version that 'already has it' — the strongest sign of all.",
    },
    {
      hZh: "别误读的信号", hEn: "Signals not to misread",
      pZh: "有时事情看似变糟，其实是「清理」：旧的关系、工作或模式离开，为新的腾位置。也别把每一个巧合都当作必然——征兆的意义在于它如何坚定你的状态，而非用来焦虑地占卜结果。保持觉察，但不迷信。",
      pEn: "Sometimes things seem to worsen, but it's clearing: old relationships, jobs, or patterns leave to make room. Also don't read every coincidence as destiny — a sign matters for how it steadies your state, not as anxious divination of outcomes. Stay aware, not superstitious.",
    },
    {
      hZh: "看到征兆后怎么做", hEn: "What to do when you see signs",
      pZh: "当征兆出现，最好的回应是：感恩、保持，并继续行动。不要因为「快成了」而突然用力或反复检查，那会重新引入匮乏。把征兆当作确认，而非终点——继续像那个版本的你一样过好每一天。",
      pEn: "When signs appear, the best response is: be grateful, hold steady, and keep acting. Don't suddenly grip or check repeatedly because it's 'almost here' — that reintroduces lack. Treat signs as confirmation, not the finish line — keep living each day as that version of you.",
    },
  ],
  faq: [
    { q: "如何知道显化成功了？", a: "最可靠的标志是内在状态先改变：你变平静、不再焦虑结果，并开始自然地像「已经拥有的自己」那样生活；外在则表现为相关的机会、人和信号反复出现。内在转变总是先于外在显现。" },
    { q: "显化前会有什么征兆？", a: "常见的有：内心突然平静、反复看到相关数字或词语、机会与邀约变多、遇到能帮你的人、灵感涌现。有时还会经历「清理」——旧的人事物离开，为新的腾出空间。" },
    { q: "事情变糟是不是显化失败了？", a: "不一定。有时表面变糟其实是清理过程，旧的模式在离开。关键看你的内在状态：如果你更笃定、更平静，往往是在对齐的路上，而非失败。" },
  ],
  cta: {
    titleZh: "记录你的显化征兆", titleEn: "Track your signs",
    descZh: "在灵犀每日签到里记录状态与征兆，看见自己一点点对齐。", descEn: "Log your state and signs in Lingxi's daily check-in and watch yourself align.",
    href: "/live-as", btnZh: "进入显化签到", btnEn: "Open the check-in",
  },
  related: [
    { href: "/learn/manifestation-not-working", zh: "显化没效果怎么办", en: "When it's not working" },
    { href: "/learn/manifestation-methods", zh: "显化方法大全", en: "Manifestation methods" },
  ],
};

export default function Page() {
  return <LearnArticle data={data} />;
}
