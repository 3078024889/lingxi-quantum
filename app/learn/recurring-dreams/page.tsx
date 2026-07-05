import LearnArticle, { ArticleData } from "@/components/LearnArticle";

export const metadata = {
  title: "为什么反复做同一个梦？重复梦境的含义",
  description:
    "反复做同一个梦，通常意味着潜意识有一个未被处理的情绪、压力或议题在反复提醒你。本文解释重复梦境的成因、常见类型，以及如何回应。Why you keep having the same dream.",
  alternates: { canonical: "/learn/recurring-dreams" },
};

const data: ArticleData = {
  slug: "recurring-dreams",
  eyebrowZh: "解梦 · 重复梦", eyebrowEn: "Dreams · Recurring",
  titleZh: "为什么反复做同一个梦？", titleEn: "Why Do You Keep Having the Same Dream?",
  defZh: "反复做同一个梦，通常意味着潜意识里有一个尚未被处理或承认的情绪、压力或议题，在用同样的画面反复提醒你。重复梦不是诅咒，而是一封被退回、等待你拆开的信——一旦你在清醒中真正面对它所指向的事，梦往往就会改变或停止。",
  defEn: "Recurring dreams usually mean there is an unprocessed or unacknowledged emotion, stress, or issue in the subconscious, reminding you through the same imagery. A recurring dream isn't a curse but a returned letter waiting to be opened — once you truly face what it points to while awake, the dream often changes or stops.",
  sections: [
    {
      hZh: "为什么会重复", hEn: "Why it repeats",
      pZh: "梦是潜意识处理情绪的方式。当某件事没有被真正面对——一段未愈的关系、长期的压力、被压抑的恐惧或需求——潜意识会一再用同一个梦把它推到你面前。重复，本身就是「这件事还没完」的信号。压力大的时期，重复梦往往更频繁。",
      pEn: "Dreams are how the subconscious processes emotion. When something isn't truly faced — an unhealed relationship, ongoing stress, a suppressed fear or need — the subconscious keeps pushing it forward through the same dream. The repetition itself signals 'this isn't finished.' In stressful periods, recurring dreams often become more frequent.",
    },
    {
      hZh: "常见的重复梦", hEn: "Common recurring dreams",
      pZh: "考试/迟到：常关联现实中的压力与「准备不足」的感觉。被追：指向你在回避的某件事或情绪。坠落：常映照失控或需要放手。回到旧地方/旧关系：提示某段经历仍未被整合。读懂它的钥匙不在情节本身，而在它每次唤起的那种相同的情绪。",
      pEn: "Exams/being late: often tied to real-life pressure and a sense of being 'unprepared.' Being chased: points to something or some emotion you're avoiding. Falling: often mirrors loss of control or a need to let go. Returning to an old place or relationship: suggests an experience not yet integrated. The key isn't the plot but the same emotion it evokes each time.",
    },
    {
      hZh: "如何回应，让它停下", hEn: "How to respond so it stops",
      pZh: "试着在清醒时「拆信」：写下梦境与它唤起的情绪，问自己「现实中，什么让我有同样的感觉？」然后温柔地面对那件事——哪怕只是承认它的存在。很多人发现，一旦那个被回避的议题被看见、被处理，反复的梦就自然松开了。",
      pEn: "Try 'opening the letter' while awake: write down the dream and the emotion it evokes, and ask 'what in real life gives me the same feeling?' Then face that thing gently — even just acknowledging it. Many find that once the avoided issue is seen and addressed, the recurring dream naturally lets go.",
    },
  ],
  faq: [
    { q: "反复做同一个梦是什么意思？", qEn: "What does it mean to have the same dream repeatedly?", a: "通常意味着潜意识里有一个未被处理或承认的情绪、压力或议题，在用同样的画面反复提醒你。重复是「这件事还没完」的信号；当你在清醒中真正面对它，梦往往就会改变或停止。", aEn: "It usually means the subconscious holds an unprocessed emotion, stress, or issue, reminding you with the same imagery again and again. Repetition is the signal that 'this is not finished'; once you truly face it while awake, the dream tends to change or stop." },
    { q: "怎样才能不再做这个重复的梦？", qEn: "How can I stop having this recurring dream?", a: "试着写下梦境与它唤起的情绪，问自己现实中什么让你有同样的感觉，然后温柔地面对那个被回避的议题。一旦它被看见、被处理，反复的梦常会自然停止。", aEn: "Write down the dream and the emotion it stirs, ask what in waking life gives you the same feeling, then gently face the avoided issue. Once it is seen and addressed, the recurring dream usually lets go on its own." },
    { q: "重复的噩梦需要担心吗？", qEn: "Should I worry about recurring nightmares?", a: "偶尔的重复梦很常见，多与压力有关。但如果重复的噩梦严重影响睡眠和情绪、长期不缓解，或与创伤经历有关，寻求心理专业人士的帮助会更稳妥。", aEn: "Occasional recurring dreams are common and mostly stress-related. But if recurring nightmares seriously affect your sleep and mood, persist long-term, or relate to trauma, seeking help from a mental-health professional is the safer path." },
  ],
  note: "温柔提示：如果某个反复出现的梦让你长期痛苦、严重影响睡眠或情绪，或与创伤有关，请考虑寻求心理咨询师等专业人士的支持。灵犀的解读是温柔的陪伴与启发，不替代专业帮助。",
  noteEn: "A gentle note: if a recurring dream causes lasting distress, seriously affects your sleep or mood, or relates to trauma, please consider the support of a counselor or other professional. Lingxi's readings are gentle companionship and inspiration, not a substitute for professional help.",
  cta: {
    titleZh: "让灵犀陪你拆开这封信", titleEn: "Open the letter with Lingxi",
    descZh: "写下这个反复出现的梦，发送至场，灵犀会以象征与心理的视角温柔回应。", descEn: "Write down the recurring dream, send it to the field, and Lingxi will respond gently.",
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
