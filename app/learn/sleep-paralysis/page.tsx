import LearnArticle, { ArticleData } from "@/components/LearnArticle";

export const metadata = {
  title: "鬼压床（睡眠瘫痪）是什么？原因与应对",
  description:
    "鬼压床其实是睡眠瘫痪——醒来时身体短暂无法动弹、有时伴随幻觉。它是一种常见且无害的睡眠现象。本文解释成因、如何缓解与预防。Sleep paralysis explained.",
  alternates: { canonical: "/learn/sleep-paralysis" },
};

const data: ArticleData = {
  slug: "sleep-paralysis",
  eyebrowZh: "解梦 · 睡眠", eyebrowEn: "Sleep · Paralysis",
  titleZh: "鬼压床（睡眠瘫痪）是什么？", titleEn: "What Is Sleep Paralysis ('Ghost Pressing')?",
  defZh: "「鬼压床」在科学上叫睡眠瘫痪：在入睡或刚醒来时，意识已清醒、但身体还处在快速眼动期的肌肉抑制状态，于是短暂无法动弹，有时伴随压迫感或幻觉。它令人害怕，但本质上是一种常见且无害的睡眠现象，通常几秒到一两分钟就会过去。",
  defEn: "'Ghost pressing' is scientifically called sleep paralysis: while falling asleep or just waking, your mind is awake but your body is still in the muscle-suppressed state of REM sleep, so you briefly can't move, sometimes with a feeling of pressure or hallucinations. It's frightening but essentially a common and harmless sleep phenomenon, usually passing in seconds to a minute or two.",
  sections: [
    {
      hZh: "为什么会发生", hEn: "Why it happens",
      pZh: "做梦时,大脑会暂时「关闭」肌肉，防止你把梦演出来。睡眠瘫痪就是意识抢先于身体恢复——你醒了，肌肉抑制却还没解除。常见诱因包括：睡眠不足、作息紊乱、压力大、仰卧睡姿。它与超自然无关，是大脑与身体「醒来时间没对齐」的结果。",
      pEn: "During dreaming, the brain temporarily 'switches off' muscles so you don't act out dreams. Sleep paralysis is your awareness recovering ahead of your body — you're awake, but the muscle suppression hasn't lifted. Common triggers: sleep deprivation, irregular schedules, high stress, sleeping on your back. It has nothing to do with the supernatural — it's the brain and body 'waking up out of sync.'",
    },
    {
      hZh: "发作时怎么办", hEn: "What to do during an episode",
      pZh: "记住：它无害，很快会过去。别拼命对抗（越紧张越难受），而是放松、把注意力放在呼吸上，或试着轻轻动一下手指、脚趾或眼睛——这些小肌肉常常先「解锁」，能帮你整个醒过来。提醒自己「这只是睡眠瘫痪」，恐惧就会减轻很多。",
      pEn: "Remember: it's harmless and passes quickly. Don't fight it desperately (tension makes it worse); instead relax, focus on your breath, or try to gently move a finger, toe, or your eyes — these small muscles often 'unlock' first and help you fully wake. Reminding yourself 'this is just sleep paralysis' greatly reduces the fear.",
    },
    {
      hZh: "如何预防", hEn: "How to prevent it",
      pZh: "改善睡眠是最有效的预防：保证充足且规律的睡眠、减少睡前刺激与压力、尽量侧卧。偶尔发生很正常；但如果频繁发作、严重影响睡眠或日间状态，建议咨询医生，排查是否与其他睡眠问题有关。",
      pEn: "Improving sleep is the most effective prevention: get enough regular sleep, reduce pre-sleep stimulation and stress, and try sleeping on your side. Occasional episodes are normal; but if it happens frequently and seriously affects your sleep or daytime functioning, see a doctor to check whether it's linked to other sleep issues.",
    },
  ],
  faq: [
    { q: "鬼压床是怎么回事？", a: "鬼压床即睡眠瘫痪：刚醒或将睡时意识清醒、身体仍处在快速眼动期的肌肉抑制状态，于是短暂动弹不得，有时伴随压迫感或幻觉。它是常见且无害的睡眠现象，与超自然无关，通常很快过去。" },
    { q: "鬼压床发作时怎么解除？", a: "保持放松、别拼命对抗，把注意力放在呼吸上，并试着轻轻动一下手指、脚趾或眼睛——这些小肌肉常先解锁，能帮你完全醒来。提醒自己「这只是睡眠瘫痪、很快会过去」，恐惧会明显减轻。" },
    { q: "经常鬼压床要紧吗？", a: "偶尔发生很正常，多与睡眠不足、作息紊乱或压力有关。但如果频繁发作并严重影响睡眠或白天状态，建议咨询医生，排查是否与其他睡眠障碍相关。" },
  ],
  note: "温柔提示：本文为一般科普，不替代专业医疗建议。若睡眠瘫痪频繁发作或严重影响你的睡眠与情绪，请咨询医生或睡眠专科。",
  noteEn: "A gentle note: occasional sleep paralysis is common and harmless. If episodes are frequent, severely affect your sleep, or come with intense fear, please consult a doctor or sleep specialist. Lingxi offers gentle perspective, not medical advice.",
  cta: {
    titleZh: "回到呼吸，安住身体", titleEn: "Return to breath, settle the body",
    descZh: "灵犀的量子呼吸练习，帮你在睡前放松神经、安住身体。", descEn: "Lingxi's quantum breathing helps relax your nervous system and settle the body before sleep.",
    href: "/practice/breath", btnZh: "进入量子呼吸", btnEn: "Open quantum breathing",
  },
  related: [
    { href: "/learn/lucid-dreaming", zh: "清醒梦怎么做", en: "How to lucid dream" },
    { href: "/learn/dream", zh: "如何解梦", en: "How to interpret dreams" },
  ],
};

export default function Page() {
  return <LearnArticle data={data} />;
}
