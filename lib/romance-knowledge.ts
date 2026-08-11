import {
  composeDendriticChapter,
  semanticBand,
  type ActivatedNode,
  type ChapterTrace,
  type DendriticNode,
  type EvidenceItem,
} from "@/lib/dendritic-engine";
import type {
  AttractionStyle,
  RomanceBreakdown,
  RomanceDim,
  RomanceProfile,
} from "@/lib/romance-calc";

type Lang = "zh" | "en";

export type StaticRomanceReportInput = {
  profile: RomanceProfile;
  seed: string;
  lang?: Lang;
};

export type StaticRomanceReport = {
  fullReport: string;
  traces: ChapterTrace[];
  activatedNodeIds: string[];
  knowledgeVersion: string;
};

type Cell = {
  label: string;
  essence: string;
  gift: string;
  shadow: string;
  scene: string;
  counter: string;
  action: string;
};

const KNOWLEDGE_VERSION = "romance-2026.08.1";
const SECTION_SEPARATOR = "\n\n===SECTION===\n\n";
const DIMS: RomanceDim[] = ["socialDrive", "creativity", "adaptability", "ambition", "emotionalDepth"];

const ZH: Record<RomanceDim, Cell> = {
  socialDrive: {
    label: "存在感",
    essence: "你通过共同经历、及时回应与可被感知的参与进入关系。吸引首先发生在别人能否感到你真实在场，而不是别人如何评价你。",
    gift: "它能让关系从想象进入真实互动，不必长期停留在猜测、试探与等待里。",
    shadow: "过度调用时，你可能为了维持回应而持续在线，把互动热度误作彼此了解，或在对方尚未准备好时推进过快。",
    scene: "在初次见面、群体活动或线上对话中，观察自己是否提供了一个可继续的话题、一次具体邀请，或一个清楚的结束信号。",
    counter: "如果最近三次关系启动都由你清楚发起，对方也有稳定回应，那么“没有被看见”不是当前主要阻点。",
    action: "下一次只发出一个清楚信号，并给对方完整选择空间；没有回应时，不追加解释、证明或追问。",
  },
  creativity: {
    label: "表达力",
    essence: "你通过语言、审美、幽默与细节选择让内在被辨认。表达不是表演，而是把真实偏好变成别人读得懂的信号。",
    gift: "它让对方看见一个具体的人，而不是一份为了迎合所有人而制作的安全简介。",
    shadow: "过度调用时，你可能不断优化呈现，让表达速度超过真实经验，最后连自己也要费力维持那个版本。",
    scene: "观察自己描述喜欢、拒绝与期待时，是使用具体经历，还是主要使用“都可以”“看感觉”这类难以回应的词。",
    counter: "如果熟悉你的人能准确复述你的偏好与边界，而且线上线下感受到的是同一个人，这项阻点就不成立。",
    action: "把一句抽象自我介绍改成一个真实片段：发生了什么、你如何选择、这个选择说明你在意什么。",
  },
  adaptability: {
    label: "开放度",
    essence: "你会读取反馈并调整靠近速度。开放不是接受所有可能，而是在保留边界时允许新信息修正原判断。",
    gift: "它让关系不必符合预设剧本，也能在真实差异中找到新的相处方式。",
    shadow: "过度调用时，你会把对方偏好变成自己的任务；关系看似顺畅，自己却逐渐不在场。",
    scene: "当计划变化、回复变慢或意见不同时，观察自己会先询问事实、立刻迁就，还是直接撤回投入。",
    counter: "如果你能在变化里同时说出自己的偏好，并允许对方不同，这项解释便不适用于当下。",
    action: "下一次调整前先说三件事：我听见了什么、我仍然需要什么、我们可以试多久。",
  },
  ambition: {
    label: "自信场",
    essence: "你愿意表达选择、承担发起后的不确定，并在回应不如预期时保留自我判断。这里衡量的是行动方向，不是个人价值。",
    gift: "它让喜欢、拒绝与关系目标不必依赖对方猜测，从而减少长期悬置。",
    shadow: "过度时会把双方探索变成单方推进；不足时又可能把一次拒绝扩写成对自己的总评。",
    scene: "回看最近一次心动或失望，分别写下“我想靠近”“对方是否愿意”和“这次结果不能说明我的价值”。",
    counter: "如果你既能主动表达，也能在明确拒绝后停止，而且不反复证明自己，这项阻点不成立。",
    action: "用一次完整表达代替反复试探：说明兴趣、提出邀请，同时明确尊重对方不同的答案。",
  },
  emotionalDepth: {
    label: "共振力",
    essence: "你能接收语气、停顿、情绪与未说出口的信息，并愿意让关系进入更深理解。深度仍要由事实校准，不能只靠感受补全。",
    gift: "它能看见表面互动之下真正需要被回应的部分，让关系不只交换信息。",
    shadow: "过度调用时，你可能用感受补全缺失信息，把短暂亲近当成长久承诺，或承担本应由对方处理的情绪。",
    scene: "当对方沉默或情绪变化，观察自己会先询问事实，还是已经在心里完成了一整段关系解释。",
    counter: "如果深度交流总伴随明确事实、双方投入与可持续行动，这项风险便不成立。",
    action: "进入深谈前先分开四项：事实、感受、推测、请求；只把请求交给对方回应。",
  },
};

const EN: Record<RomanceDim, Cell> = {
  socialDrive: {
    label: "Presence",
    essence: "You enter connection through shared experience, timely response, and visible participation. Attraction begins with whether another person can feel your real presence.",
    gift: "It moves connection from imagination into real interaction rather than prolonged guessing.",
    shadow: "Overuse can maintain constant contact, confuse intensity with understanding, or move before the other person is ready.",
    scene: "In a first meeting, group setting, or online exchange, notice whether you offer a clear topic, invitation, or ending.",
    counter: "If you clearly initiated the last three connections and received steady responses, lack of visibility is not the current bottleneck.",
    action: "Send one clear signal and leave full room for choice. If there is no response, do not add pressure.",
  },
  creativity: {
    label: "Expression",
    essence: "Language, aesthetics, humor, and chosen detail make your inner world recognizable. Expression makes preference readable rather than performative.",
    gift: "It lets another person meet someone specific rather than a profile optimized for everyone.",
    shadow: "Overuse can make presentation move faster than lived reality and create a version that must be maintained.",
    scene: "Notice whether preference, refusal, and hope are described through concrete experience or signals too vague to answer.",
    counter: "If close people can state your preferences and boundaries accurately, this bottleneck does not apply.",
    action: "Replace one abstract description with a real scene: what happened, what you chose, and what it reveals.",
  },
  adaptability: {
    label: "Openness",
    essence: "You read feedback and adjust pace. Openness allows evidence to revise judgment without surrendering boundaries.",
    gift: "It allows connection to develop beyond a preset script and across real differences.",
    shadow: "Overuse can turn another person's preferences into your assignment until the relationship works but you disappear.",
    scene: "When plans change, replies slow, or opinions differ, notice whether you ask, accommodate immediately, or withdraw.",
    counter: "If you can state your preference during change while allowing the other person to differ, this reading does not apply.",
    action: "Before adapting, state what you heard, what you still need, and how long the experiment will run.",
  },
  ambition: {
    label: "Self-Assurance",
    essence: "You state choice, carry uncertainty after initiation, and keep self-judgment when responses disappoint. This measures direction, not worth.",
    gift: "It makes interest, refusal, and relationship intent less dependent on guessing.",
    shadow: "Too much direction creates unilateral momentum; too little can turn one refusal into an identity verdict.",
    scene: "Review one attraction and separate your wish to approach, the other person's choice, and your worth.",
    counter: "If you can initiate, stop after a clear refusal, and avoid repeatedly proving yourself, this bottleneck does not apply.",
    action: "Replace repeated testing with one complete statement that explicitly respects a different answer.",
  },
  emotionalDepth: {
    label: "Resonance",
    essence: "You register tone, pauses, emotion, and the unsaid. Depth still requires factual calibration.",
    gift: "It sees what needs response beneath surface interaction, so connection is more than information exchange.",
    shadow: "Overuse can fill missing information with feeling, mistake early intensity for commitment, or carry another person's emotions.",
    scene: "When the other person becomes quiet, notice whether you ask for facts or complete the story internally.",
    counter: "If deep exchange consistently includes facts, mutual investment, and sustainable action, this risk does not apply.",
    action: "Separate fact, feeling, interpretation, and request; ask the other person to answer only the request.",
  },
};

const STYLE: Record<AttractionStyle, { zh: string; en: string; zhMechanism: string; enMechanism: string }> = {
  independent: {
    zh: "独立探索型", en: "Independent Explorer",
    zhMechanism: "你的吸引力在保有选择权与移动空间时最自然。靠近需要是主动选择，而不是被关系吞没。",
    enMechanism: "Attraction is most natural when choice and movement remain available. Closeness needs to be chosen, not consuming.",
  },
  magnetic: {
    zh: "磁场吸引型", en: "Social Magnet",
    zhMechanism: "你的吸引力先通过可见度、轻盈互动与现场反应被感知，深度通常在互动之后建立。",
    enMechanism: "Attraction is felt first through visibility and responsive interaction; depth follows contact.",
  },
  devoted: {
    zh: "深度专一型", en: "Depth-Oriented",
    zhMechanism: "你的吸引力来自持续投入、情绪辨识与关系承重，而不是高频展示。",
    enMechanism: "Attraction grows through sustained investment, emotional recognition, and relational weight.",
  },
  gentle: {
    zh: "温和渗透型", en: "Gentle Presence",
    zhMechanism: "你的吸引力不在最初瞬间用尽，而是在安全、熟悉与反复相处中逐渐被看见。",
    enMechanism: "Attraction becomes visible gradually through safety, familiarity, and repeated contact.",
  },
};

function ranked(scores: RomanceBreakdown): RomanceDim[] {
  return [...DIMS].sort((a, b) => scores[b] - scores[a] || a.localeCompare(b));
}

function intensity(score: number, lang: Lang): string {
  if (lang === "en") {
    if (score < 25) return "rarely activates without explicit safety and invitation";
    if (score < 45) return "activates selectively, especially in familiar settings";
    if (score < 65) return "changes with context rather than acting as a fixed trait";
    if (score < 85) return "activates readily and is visible to other people";
    return "activates almost automatically, so boundaries matter more than amplification";
  }
  if (score < 25) return "目前很少自动启动，需要明确的安全条件与邀请";
  if (score < 45) return "使用较为选择性，在熟悉或安全情境中更容易出现";
  if (score < 65) return "会随情境变化，不适合被读成固定性格";
  if (score < 85) return "较容易启动，也更容易被别人感知";
  return "几乎会自动启动，因此重点不是继续放大，而是建立边界";
}

function activate(chapter: string, dims: RomanceDim[], scores: RomanceBreakdown): ActivatedNode[] {
  return dims.map((dim, index) => {
    const band = semanticBand(scores[dim], 13);
    const node: DendriticNode = {
      id: `romance.${chapter}.${dim}.b${band.index + 1}of13`,
      knowledgeVersion: KNOWLEDGE_VERSION,
      product: "romance",
      chapter,
      kind: index === 0 ? "basic" : "cross",
      priority: 100 - index,
      conditions: { op: "score", dim, min: band.min, max: band.max },
      dimensions: [dim],
      fragments: { judgment: ZH[dim].essence },
      safetyTags: ["agency", "consent", "non-diagnostic", "non-predictive"],
    };
    return { node, reason: `score:${dim}:${band.min}-${band.max}`, deterministicOrder: index };
  });
}

function evidence(scores: RomanceBreakdown, dims: RomanceDim[], lang: Lang): EvidenceItem[] {
  const cells = lang === "zh" ? ZH : EN;
  return dims.map((dim) => ({ key: dim, label: cells[dim].label, value: scores[dim], source: "calculation" }));
}

function joinEvidence(scores: RomanceBreakdown, dims: RomanceDim[], lang: Lang): string {
  const cells = lang === "zh" ? ZH : EN;
  const values = dims.map((dim) => `${cells[dim].label} ${scores[dim]}`).join(lang === "zh" ? "、" : ", ");
  return lang === "zh"
    ? `结构证据：${values}。这些数值定位互动路径，不衡量“值不值得被爱”，也不预测关系结果。`
    : `Structural evidence: ${values}. These values locate interaction pathways; they do not measure desirability or predict outcomes.`;
}

function compose(args: {
  key: string;
  profile: RomanceProfile;
  lang: Lang;
  dims: RomanceDim[];
  judgment: string;
  mechanism: string;
  scene: string;
  shadow: string;
  counter: string;
  action: string;
  narrative?: string;
}) {
  return composeDendriticChapter({
    chapter: args.key,
    knowledgeVersion: KNOWLEDGE_VERSION,
    activated: activate(args.key, args.dims, args.profile.breakdown),
    evidence: evidence(args.profile.breakdown, args.dims, args.lang),
    slots: {
      judgment: args.judgment,
      evidence: joinEvidence(args.profile.breakdown, args.dims, args.lang),
      mechanism: args.mechanism,
      scenario: args.scene,
      shadow: args.shadow,
      counterevidence: args.counter,
      action: args.action,
      narrative: args.narrative,
    },
  });
}

export function generateStaticRomanceReport(input: StaticRomanceReportInput): StaticRomanceReport {
  const lang: Lang = input.lang === "en" ? "en" : "zh";
  const zh = lang === "zh";
  const cells = zh ? ZH : EN;
  const scores = input.profile.breakdown;
  const [highDim, supportDim, middleDim, tensionDim, lowDim] = ranked(scores);
  const high = cells[highDim];
  const support = cells[supportDim];
  const middle = cells[middleDim];
  const tension = cells[tensionDim];
  const low = cells[lowDim];
  const style = STYLE[input.profile.style];
  const styleName = zh ? style.zh : style.en;
  const styleMechanism = zh ? style.zhMechanism : style.enMechanism;
  const taoHua = input.profile.taoHua;
  const cultural = zh
    ? taoHua.hasTaoHua
      ? `传统桃花标记出现在${taoHua.foundIn.join("、")}，对应地支“${taoHua.taohuaBranch}”。它在本报告中只作为文化观察镜头，不构成事件预言。`
      : "命盘未命中传统桃花标记。这不表示吸引力不足；本报告仍以可观察的五维互动结构为核心。"
    : taoHua.hasTaoHua
      ? "A traditional peach-blossom marker is present. It is used only as a cultural lens, never as an event prediction."
      : "No traditional peach-blossom marker appears. This does not imply reduced attraction.";

  const genericCounter = zh
    ? "如果连续三次现实记录与本章判断相反，应以实际行为为准，暂时撤销本章假设，而不是用文字覆盖经验。"
    : "If three consecutive observations contradict this reading, lived behavior takes priority and the hypothesis should be withdrawn.";

  const chapters = [
    compose({
      key: "01-origin", profile: input.profile, lang, dims: [highDim, supportDim, lowDim],
      judgment: zh ? `你的桃花磁场不是单一分数，而是一条由“${high.label}”领航、“${support.label}”支撑、“${low.label}”调节的关系路径。总指数 ${input.profile.score} 指向可见方式，不是魅力等级。` : `Your field is a pathway led by ${high.label}, supported by ${support.label}, and regulated by ${low.label}. The total of ${input.profile.score} is not a ranking of worth.`,
      mechanism: `${high.essence}${zh ? "" : " "}${support.gift} ${zh ? `当前${high.label} ${scores[highDim]} 分，${intensity(scores[highDim], lang)}；${low.label} ${scores[lowDim]} 分决定这份吸引能否被现实校准。` : `${high.label} is ${scores[highDim]} and ${intensity(scores[highDim], lang)}; ${low.label} at ${scores[lowDim]} determines calibration.`}`,
      scene: `${high.scene} ${zh ? "同时记录对方是否也在发起、回应和修正，而不是只记录自己的投入。" : "Also record whether the other person initiates, responds, and adjusts."}`,
      shadow: `${low.shadow} ${zh ? `当${high.label}先启动而${low.label}尚未跟上，最容易把“我已经投入”误认成“我们已经建立”。` : "Personal investment can then be mistaken for mutual formation."}`,
      counter: genericCounter,
      action: zh ? "建立一张七日磁场记录：每次互动只写事实、自己的动作、对方的动作与下一次边界，不写对未来的推断。" : "Keep a seven-day field log with facts, each person's action, and the next boundary; omit future predictions.",
      narrative: cultural,
    }),
    compose({
      key: "02-type", profile: input.profile, lang, dims: [highDim, supportDim],
      judgment: zh ? `你的吸引力风格是“${styleName}”。它描述靠近路径，不是固定身份，也不要求你永远保持同一种状态。` : `Your attraction style is ${styleName}. It describes a pathway, not a fixed identity.`,
      mechanism: `${styleMechanism} ${high.gift} ${support.essence}`,
      scene: zh ? `在一次新认识中，你通常先用${high.label}建立入口，再由${support.label}决定是否继续。观察对方是否得到足够信息决定靠近或离开。` : `${high.label} opens a new connection and ${support.label} determines continuation. Observe whether the other person receives enough information to choose.`,
      shadow: `${high.shadow} ${support.shadow}`,
      counter: genericCounter,
      action: zh ? "分别写下“我如何让人看见我”“我如何确认彼此愿意继续”“我如何接受不继续”，每项只保留一个可执行动作。" : "Write one action for being seen, confirming mutual continuation, and accepting non-continuation.",
    }),
    compose({
      key: "03-expression", profile: input.profile, lang, dims: ["creativity", "emotionalDepth", "ambition"],
      judgment: zh ? "你的情感表达由可读性、情绪深度与承担选择的能力共同构成。表达得多不等于表达清楚，沉默也不自动等于深情。" : "Expression combines readability, depth, and willingness to carry a choice. More expression is not always clearer expression.",
      mechanism: `${cells.creativity.essence} ${cells.emotionalDepth.essence} ${zh ? `自信场 ${scores.ambition} 分决定感受能否变成对方可以回应的请求。` : `Self-Assurance at ${scores.ambition} affects whether feeling becomes an answerable request.`}`,
      scene: zh ? "选取最近一次喜欢、失望或犹豫，把原话逐句标记为事实、感受、请求，或希望对方自行猜到的部分。" : "Take one recent moment and label every sentence as fact, feeling, request, or expectation to be guessed.",
      shadow: `${cells.creativity.shadow} ${cells.emotionalDepth.shadow}`,
      counter: zh ? "若对方能准确复述你的意思、无需防御就能回答，而且你能接受不同答案，你的表达链路已经有效。" : "If the other person can restate your meaning, answer without defense, and differ safely, the pathway is working.",
      action: zh ? "采用四句表达协议：我观察到；我感受到；这对我意味着；我希望你明确回答。说完后停止补充，让回应真正发生。" : "Use four statements: observation, feeling, meaning, and request. Then stop adding explanation.",
    }),
    compose({
      key: "04-needs", profile: input.profile, lang, dims: [supportDim, lowDim, middleDim],
      judgment: zh ? `你在关系中的需要不只由最高分决定。更关键的是${support.label}想获得什么，以及${low.label}需要什么条件才能参与。` : `Needs are not defined only by the highest score. What ${support.label} seeks and what ${low.label} requires are equally important.`,
      mechanism: `${support.essence} ${low.essence} ${zh ? "成熟需要同时包含：我想要什么、对方是否愿意、如果得不到我如何照顾自己。" : "A mature need includes what you want, whether the other person consents, and how you care for yourself if it is unavailable."}`,
      scene: zh ? "回想一次关系摩擦：争论表面在谈时间、回复或承诺，底层究竟在保护安全、自由、确认、成长还是被理解？只选一个核心需要。" : "Review one conflict and identify the underlying need: safety, freedom, confirmation, growth, or understanding.",
      shadow: `${tension.shadow} ${zh ? "未被命名的需要常伪装成标准、批评或反复测试，让对方只感到压力。" : "An unnamed need often appears as a standard, criticism, or repeated test."}`,
      counter: genericCounter,
      action: zh ? "把一个抱怨改写成可协商请求，包含频率、场景与期限；不评价对方人格，只说明可被执行的下一步。" : "Turn one complaint into a negotiable request with frequency, context, and a time frame.",
    }),
    compose({
      key: "05-hidden", profile: input.profile, lang, dims: [lowDim, middleDim],
      judgment: zh ? `你较少主动展示的魅力藏在“${low.label}”里。它不是缺陷，而是一种需要条件才出现的能力。` : `A less visible form of attraction rests in ${low.label}. It is a capacity that requires conditions, not a defect.`,
      mechanism: `${low.gift} ${low.essence} ${zh ? `分数 ${scores[lowDim]} 表示调用频率与条件，不表示能力不存在。` : `The score of ${scores[lowDim]} reflects activation conditions, not absence.`}`,
      scene: low.scene,
      shadow: zh ? `若只依赖${high.label}，别人会先看到你最熟练的一面，却较晚才接触到${low.label}提供的关系信息，双方容易在错误期待上开始。` : `If only ${high.label} is used, others meet your most practiced side before receiving information carried by ${low.label}.`,
      counter: low.counter,
      action: `${low.action} ${zh ? "完成后记录对方是接住、忽略还是越界；魅力的展开必须与安全和互相性同行。" : "Record whether it is received, ignored, or crossed; visibility must remain mutual and safe."}`,
    }),
    compose({
      key: "06-interaction", profile: input.profile, lang, dims: ["socialDrive", "adaptability", "emotionalDepth"],
      judgment: zh ? "你的互动是一条“发出信号、读取反馈、形成深度”的三段循环。任何一段过快或缺席，都会改变关系体验。" : "Interaction is a loop of signaling, reading feedback, and forming depth.",
      mechanism: zh ? `存在感 ${scores.socialDrive} 分负责启动，开放度 ${scores.adaptability} 分负责校准，共振力 ${scores.emotionalDepth} 分负责深化。差值越大，越需要放慢最强环节。` : `Presence ${scores.socialDrive} starts, Openness ${scores.adaptability} calibrates, and Resonance ${scores.emotionalDepth} deepens.`,
      scene: zh ? "把一次互动画成时间线：谁发起、谁改变话题、谁提出下一步、谁承担取消、谁修复误解。关系质量藏在双向动作里，不藏在消息数量里。" : "Map who initiated, changed topic, proposed the next step, handled cancellation, and repaired misunderstanding.",
      shadow: `${cells.socialDrive.shadow} ${cells.adaptability.shadow} ${cells.emotionalDepth.shadow}`,
      counter: zh ? "若双方持续轮流发起、拒绝后仍安全、误解后能修复，当前互动已经具备健康的互相性。" : "If both alternate initiation, remain safe after refusal, and repair misunderstanding, mutuality is present.",
      action: zh ? "采用“三回合检查”：至少一次由对方发起、一次由你明确边界、一次由双方确认下一步。缺一项就先观察，不追加投入。" : "Use a three-round check: their initiation, your boundary, and a jointly confirmed next step.",
    }),
    compose({
      key: "07-growth", profile: input.profile, lang, dims: [lowDim, highDim],
      judgment: zh ? `成长不是把${low.label}训练成最高分，而是让它在需要时可用，同时避免${high.label}替它完成所有任务。` : `Growth does not mean turning ${low.label} into the highest score, but making it available when needed.`,
      mechanism: `${low.essence} ${high.gift} ${zh ? "真正整合发生在你既保留强项，又能在关键节点切换工具。" : "Integration keeps the strength while enabling a deliberate shift."}`,
      scene: zh ? `当你最想自动使用${high.label}时，暂停十秒，判断此刻缺少的是更强信号，还是更多${low.label}。` : `When relying on ${high.label}, pause and ask whether the moment needs a stronger signal or more ${low.label}.`,
      shadow: zh ? "把成长理解成修正自己会催生迎合；把成长理解成只做自己又会拒绝反馈。两者都让关系失去共同建构。" : "Self-correction produces compliance; ignoring all feedback removes co-creation.",
      counter: genericCounter,
      action: zh ? `未来十四天只练一个微动作：${low.action}每次记录触发条件、身体感受、对方反馈与自己是否仍有选择。` : `For fourteen days, practice one micro-action: ${low.action}`,
    }),
    compose({
      key: "08-obstacle", profile: input.profile, lang, dims: [highDim, lowDim, tensionDim],
      judgment: zh ? `当前最需留意的不是“桃花够不够”，而是${high.label}与${low.label}之间的节奏差。能力可能被另一维度抢先代偿或阻断。` : `The key obstacle is the pacing gap between ${high.label} and ${low.label}, not whether attraction is sufficient.`,
      mechanism: zh ? `当${high.label} ${scores[highDim]} 分先启动，${low.label} ${scores[lowDim]} 分尚未校准，你会用最熟练的能力解决本应由另一项能力处理的问题。` : `When ${high.label} at ${scores[highDim]} starts before ${low.label} at ${scores[lowDim]}, a strength may solve the wrong problem.`,
      scene: zh ? "识别一个重复模式：开始很快、确认很慢；理解很多、请求很少；适应很多、边界很晚；或等待很多、可见信号很少。用三次事实验证。" : "Identify a repeated pattern and verify it against three events rather than intuition.",
      shadow: `${high.shadow} ${low.shadow}`,
      counter: zh ? "如果最近三次事实没有重复同一模式，就不要把本章当成性格结论；它只是一个待验证假设。" : "If three events do not repeat the pattern, do not turn it into a personality conclusion.",
      action: zh ? "建立阻断协议：发现旧模式时不加码，等待一个完整回应周期；收到明确拒绝就停止，收到模糊回应只澄清一次。" : "Do not escalate; wait one response cycle, stop after clear refusal, and clarify ambiguity only once.",
    }),
    compose({
      key: "09-ideal", profile: input.profile, lang, dims: [highDim, supportDim, middleDim],
      judgment: zh ? `适合你的不是某种“理想对象”，而是一种能容纳${high.label}、回应${support.label}、允许${middle.label}持续校准的连接结构。` : `What fits is a structure that holds ${high.label}, responds to ${support.label}, and lets ${middle.label} calibrate.`,
      mechanism: zh ? "健康连接至少具备四个可观察条件：发起具有互相性，边界可以被说出，差异不会变成惩罚，承诺与行动在时间上相符。" : "Healthy connection includes mutual initiation, speakable boundaries, difference without punishment, and alignment between words and action.",
      scene: zh ? "不要先问“是不是对的人”，先观察四周：计划是否能协商、拒绝是否被尊重、冲突后是否修复、双方生活是否仍保持完整。" : "Observe four weeks of negotiation, refusal, repair, and whether both lives remain whole.",
      shadow: zh ? "理想化会把强烈感受当成结构证据；过度审查又让关系无法展开。判断应依赖重复行为，而不是单个高光或单次失误。" : "Idealization treats intensity as evidence; over-screening prevents development. Use repeated behavior.",
      counter: genericCounter,
      action: zh ? "设定四个不涉及外貌与身份的结构标准，并为每项写出可观察行为；四周后再评估，不在最初热度中提前定论。" : "Set four structural standards, define observable behavior, and review after four weeks.",
    }),
    compose({
      key: "10-practice", profile: input.profile, lang, dims: [lowDim, tensionDim, highDim],
      judgment: zh ? "吸引力训练的目标不是增加他人注意，而是提升真实信号、互相选择与安全退出的质量。" : "Attraction practice improves truthful signals, mutual choice, and safe exits rather than gaining attention.",
      mechanism: zh ? `有效顺序是先让${low.label}获得最低可用性，再用${tension.label}校准边界，最后让${high.label}自然工作。` : `Make ${low.label} available, use ${tension.label} to calibrate boundaries, then let ${high.label} work naturally.`,
      scene: zh ? "选择低风险关系练习，例如朋友邀约、兴趣社群或轻量对话，不把高情绪关系当作第一次实验场。" : "Practice in a low-risk connection rather than making an emotionally intense relationship the first experiment.",
      shadow: zh ? "如果练习变成话术、操控回应或刻意制造稀缺，就已经偏离主权与互相性；有效练习允许对方无压力地说不。" : "If practice becomes scripting, manipulation, or manufactured scarcity, it has left agency and mutuality.",
      counter: genericCounter,
      action: zh ? "执行二十一天协议：每周一次真实表达、一次边界练习、一次事实复盘。只记录行为变化，不以获得关系作为成功标准。" : "Run a twenty-one-day protocol: one truthful expression, one boundary practice, and one factual review each week.",
    }),
    compose({
      key: "11-summary", profile: input.profile, lang, dims: [highDim, supportDim, lowDim],
      judgment: zh ? `你的核心结构可以压缩为一句话：让${high.label}负责被看见，让${support.label}负责持续，让${low.label}负责校准，不让任何一维独自承担整段关系。` : `Let ${high.label} create visibility, ${support.label} sustain connection, and ${low.label} calibrate it.`,
      mechanism: zh ? `总指数 ${input.profile.score}、风格“${styleName}”与五维分布共同描述当前路径。它们可复算、可验证，也会被新的现实经验重新理解。` : `The total ${input.profile.score}, style ${styleName}, and five dimensions describe a testable current pathway.`,
      scene: zh ? "未来遇到心动、迟疑或变化时，回到三个问题：事实发生了什么；双方各自做了什么；下一步是否同时尊重真实、边界与选择。" : "Ask what happened, what each person did, and whether the next step respects truth, boundary, and choice.",
      shadow: zh ? "不要把这份报告变成新标签，也不要用它解释对方、替对方决定或证明一段关系应该继续。它只负责提升观察分辨率。" : "Do not use this report to label or explain another person, decide for them, or prove a relationship should continue.",
      counter: zh ? "任何判断只要与持续、清楚的现实证据冲突，就应被修正。你的直接经验与安全感受始终高于报告文本。" : "Any judgment that conflicts with sustained evidence should be revised. Direct experience and safety remain primary.",
      action: zh ? "在下一次重要互动后，用“证据、机制、边界、选择”四栏复盘。若出现控制、威胁、跟踪或安全风险，停止练习并寻求可信支持。" : "Review evidence, mechanism, boundary, and choice. If control, threats, stalking, or safety risks appear, stop and seek trusted support.",
      narrative: zh ? "这不是对未来的宣告，而是一张返回自身的航图：它不替你选择，只帮助你更早看见自己正在怎样选择。" : "This is not a declaration about the future, but a map back to yourself.",
    }),
  ];

  const traces = chapters.map((chapter) => chapter.trace);
  return {
    fullReport: chapters.map((chapter) => chapter.text).join(SECTION_SEPARATOR),
    traces,
    activatedNodeIds: traces.flatMap((trace) => trace.activatedNodeIds),
    knowledgeVersion: KNOWLEDGE_VERSION,
  };
}
