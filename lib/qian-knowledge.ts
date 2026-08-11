import {
  composeDendriticChapter,
  semanticBand,
  type ActivatedNode,
  type ChapterTrace,
  type DendriticNode,
  type EvidenceItem,
} from "@/lib/dendritic-engine";
import {
  DIM_LABEL,
  findConflictsWithFallback,
  wealthArchetypes,
  type LifeVector,
  type LifeVectorDim,
} from "@/lib/life-vector";
import type { LifeSign } from "@/lib/qian-data";

type Lang = "zh" | "en";

export type QianAbility = {
  key: "creativity" | "wealth" | "relationship" | "learning" | "leadership";
  zh: string;
  en: string;
  score: number;
};

export type QianLifeStage = {
  key: "exploration" | "transformation" | "building" | "manifestation";
  zh: string;
  en: string;
};

export type StaticQianInput = {
  signs: [LifeSign, LifeSign, LifeSign];
  vector: LifeVector;
  seed: string;
  lang?: Lang;
};

export type StaticQianReport = {
  fullReport: string;
  traces: ChapterTrace[];
  activatedNodeIds: string[];
  knowledgeVersion: string;
  abilityMap: QianAbility[];
  lifeStage: QianLifeStage;
};

type DimensionGuide = {
  giftZh: string;
  giftEn: string;
  shadowZh: string;
  shadowEn: string;
  actionZh: string;
  actionEn: string;
};

const KNOWLEDGE_VERSION = "qian-2026.08.1";
const DIMS = Object.keys(DIM_LABEL) as LifeVectorDim[];

const GUIDE: Record<LifeVectorDim, DimensionGuide> = {
  freedomNeed: {
    giftZh: "你能在旧路径失去活力时更早察觉，并主动寻找新的选择空间。",
    giftEn: "You detect when an old path has lost vitality and look for room to choose again.",
    shadowZh: "如果变化只负责解除不适，却没有验证方向，自由会变成连续撤离。",
    shadowEn: "If change only relieves discomfort without testing direction, freedom becomes repeated exit.",
    actionZh: "为下一次改变同时写出进入条件、试验期限和返回条件。",
    actionEn: "Define entry, test duration, and return conditions for the next change.",
  },
  stabilityNeed: {
    giftZh: "你能建立可预期节律，让关系、资源和工作在时间中积累信任。",
    giftEn: "You build predictable rhythm so trust and resources can compound.",
    shadowZh: "如果稳定开始保护已经失效的结构，它会把安全与不改变混为一谈。",
    shadowEn: "Stability can protect expired structures and confuse safety with non-change.",
    actionZh: "为一个长期规则写下复盘日期，以及触发调整的现实信号。",
    actionEn: "Give one long-term rule a review date and observable change trigger.",
  },
  creativity: {
    giftZh: "你能重组看似不相关的信息，把未定义问题转成新的表达或方案。",
    giftEn: "You recombine unrelated information into new expression or solutions.",
    shadowZh: "如果灵感没有进入验证与交付，它只会制造越来越多未完成入口。",
    shadowEn: "Without validation and delivery, inspiration creates unfinished entrances.",
    actionZh: "只选一个想法，写出最小成品、真实使用者和七天验证标准。",
    actionEn: "Choose one idea and define its smallest output, real user, and seven-day test.",
  },
  discipline: {
    giftZh: "你能把复杂任务压缩为步骤、标准和可重复执行的系统。",
    giftEn: "You compress complexity into steps, standards, and repeatable systems.",
    shadowZh: "当标准在探索之前启动，它会用尚不存在的完美压制刚出现的可能。",
    shadowEn: "When standards start before exploration, imagined perfection suppresses possibility.",
    actionZh: "把创造期与审查期分开，前者不修改，后者不新增方向。",
    actionEn: "Separate creation from review: no editing in the first, no new directions in the second.",
  },
  riskTolerance: {
    giftZh: "你能在信息不完整时行动，为机会争取时间窗口。",
    giftEn: "You act with incomplete information and preserve opportunity windows.",
    shadowZh: "如果没有损失上限与退出条件，行动力会被结果偏差放大。",
    shadowEn: "Without loss limits and exit conditions, action is distorted by outcome bias.",
    actionZh: "行动前写下最大损失、停止信号和四十八小时后仍成立的理由。",
    actionEn: "Write maximum loss, stop signal, and a reason that remains valid after forty-eight hours.",
  },
  emotionalDepth: {
    giftZh: "你能读取语言之下的情绪信息，让互动进入更真实的理解。",
    giftEn: "You read emotional information beneath language and deepen understanding.",
    shadowZh: "信息不足时，深度容易用感受补全事实，或替别人承担情绪责任。",
    shadowEn: "With missing information, depth can complete facts with feeling or carry another's emotion.",
    actionZh: "进入深谈前分开事实、感受、推测与请求，只把请求交给对方回答。",
    actionEn: "Separate fact, feeling, interpretation, and request before a deep conversation.",
  },
  introspection: {
    giftZh: "你能回看动机、识别重复模式，并修正原来的自我解释。",
    giftEn: "You review motives, detect repetition, and revise self-explanation.",
    shadowZh: "如果复盘没有截止点，洞察会变成延迟行动的精致理由。",
    shadowEn: "Without an endpoint, reflection becomes a refined reason to delay action.",
    actionZh: "复盘限定十五分钟，结束时只保留一个下一步和一个验证日期。",
    actionEn: "Limit reflection to fifteen minutes and keep one next step with a review date.",
  },
  socialDrive: {
    giftZh: "你能发起连接、协调差异，并让资源在人与人之间流动。",
    giftEn: "You initiate connection, coordinate difference, and move resources between people.",
    shadowZh: "如果被需要成为价值证明，你会承担过多无偿协调与情绪劳动。",
    shadowEn: "If being needed proves worth, you may absorb excessive coordination and emotional labor.",
    actionZh: "答应协助前先说明目标、你的责任、对方责任和结束条件。",
    actionEn: "Before helping, define goal, your role, their role, and the end condition.",
  },
  ambition: {
    giftZh: "你能把注意力推向更高目标，并愿意为可见成果承担责任。",
    giftEn: "You direct attention toward larger goals and carry responsibility for visible outcomes.",
    shadowZh: "如果结果被用来证明个人价值，目标会不断升级却无法带来完成感。",
    shadowEn: "If results prove worth, goals escalate without producing completion.",
    actionZh: "为一个目标同时写成果指标、代价上限和完成后的停止动作。",
    actionEn: "Give one goal an outcome metric, cost ceiling, and stopping action.",
  },
  adaptability: {
    giftZh: "你能读取反馈、改变方法，并在复杂环境里保持可行动性。",
    giftEn: "You read feedback, change method, and remain effective in complexity.",
    shadowZh: "如果适应没有边界，对方偏好会逐渐变成你的任务。",
    shadowEn: "Without boundaries, another person's preferences become your assignment.",
    actionZh: "调整前说清听见了什么、仍需要什么，以及试验会持续多久。",
    actionEn: "Before adapting, state what you heard, still need, and how long the trial lasts.",
  },
};

const STAGES: QianLifeStage[] = [
  { key: "exploration", zh: "探索期", en: "Exploration Phase" },
  { key: "transformation", zh: "转化期", en: "Transformation Phase" },
  { key: "building", zh: "建设期", en: "Building Phase" },
  { key: "manifestation", zh: "显化期", en: "Manifestation Phase" },
];

type FusionLens = {
  key: string;
  mechanismZh: string;
  mechanismEn: string;
  sceneZh: string;
  sceneEn: string;
  shadowZh: string;
  shadowEn: string;
  counterZh: string;
  counterEn: string;
  actionZh: string;
  actionEn: string;
};

const FUSION_LENSES: FusionLens[] = [
  {
    key: "continuity-change",
    mechanismZh: "这组三签的交叉重点是连续性与变化如何分工：源流负责保留不能丢失的底座，灵魂负责识别何时旧结构已经失去意义，行者负责把改变限制在可观察、可退出的范围内。三者真正协作时，改变不再等同于推翻，稳定也不再等同于停滞。",
    mechanismEn: "This fusion separates continuity from change: Origin protects the base, Soul detects when structure has lost meaning, and Walker keeps change observable and reversible.",
    sceneZh: "现实中，这类张力常出现在换工作、迁移、关系升级或长期项目转向时。你会同时听见“不能继续这样”和“不能失去已有积累”两种声音；高价值动作不是压掉其中一端，而是先确认哪些资产可迁移。",
    sceneEn: "This tension appears in career change, movement, relationship transition, or project redirection. The useful question is which assets can travel with the change.",
    shadowZh: "如果源流签独占决定权，所有变化都会被解释成风险；如果行者签独占决定权，解除不适会被误作找到方向；如果灵魂签只负责追问意义却不接受期限，选择会长期悬置。",
    shadowEn: "Origin alone turns change into risk, Walker alone confuses relief with direction, and Soul without deadlines suspends choice.",
    counterZh: "反证条件是：最近三次重要改变都同时保留了核心资源、设定试验期限并完成复盘。若这些事实成立，这组张力已经得到有效整合。",
    counterEn: "Counterevidence exists when three changes preserved core resources, used test periods, and completed review.",
    actionZh: "建立迁移清单：必须保留三项、可以试验三项、明确停止一项。任何重大变化先通过这张清单。",
    actionEn: "Create a migration list: three things to preserve, three to test, and one to stop.",
  },
  {
    key: "depth-expression",
    mechanismZh: "这组三签的交叉重点是内部感受如何变成别人可以理解和回答的信息。源流保存情绪与经验，灵魂提取真正需要，行者把需要转成边界、请求或作品。深度只有进入可读形式，才不会长期困在内部循环。",
    mechanismEn: "This fusion turns inner feeling into answerable information: Origin retains experience, Soul extracts need, and Walker gives it readable form.",
    sceneZh: "它最容易出现在亲密对话、创作发布和冲突修复中：你已经感受很多，却迟迟没有说出事实与请求；等到表达时，累积内容又让对方难以辨认最重要的一句。",
    sceneEn: "It appears in intimate conversation, creative release, and repair: much is felt, but the central fact and request remain hidden.",
    shadowZh: "深度未经事实校准时，会把推测写成答案；表达为了避免误解而不断加长时，重点反而消失；行动为了尽快结束不适时，又可能跳过对方的选择。",
    shadowEn: "Uncalibrated depth turns interpretation into fact, over-explanation hides the point, and hurried action can skip consent.",
    counterZh: "反证条件是：重要对话中，对方能准确复述你的核心意思、可以安全地给出不同答案，而且双方都知道下一步是什么。",
    counterEn: "Counterevidence exists when the other person can restate the meaning, differ safely, and identify the next step.",
    actionZh: "使用四栏表达：事实、感受、推测、请求。删去无法归类的句子，只把请求交给对方回答。",
    actionEn: "Use four columns: fact, feeling, interpretation, and request. Ask the other person to answer only the request.",
  },
  {
    key: "vision-delivery",
    mechanismZh: "这组三签的交叉重点是愿景如何穿过验证并抵达交付。源流提供长期问题意识，灵魂生成新组合，行者把组合压缩为最小成品。愿景不是越大越有价值，而是越能明确改变谁的什么现实，越接近可交换成果。",
    mechanismEn: "This fusion moves vision through validation into delivery: Origin holds the long problem, Soul recombines possibilities, and Walker produces the smallest usable result.",
    sceneZh: "它常出现在创业、创作、学习与产品设计中：前期构想丰富，真正困难发生在选择一个版本、让真实使用者接触，并接受反馈可能否定原来的自我想象。",
    sceneEn: "It appears in entrepreneurship, creation, learning, and product design, especially when one version must meet real users.",
    shadowZh: "源流会因为问题重要而无限扩大范围，灵魂会因新灵感不断改写方向，行者会为了完成而过早收缩价值。三者没有阶段边界时，项目就在扩张与砍掉之间摆动。",
    shadowEn: "Origin expands scope, Soul rewrites direction, and Walker can shrink value too early when stages are not separated.",
    counterZh: "反证条件是：最近三个项目都有明确用户、最小版本、发布日期和复盘证据，并且至少一个形成了重复使用或稳定交付。",
    counterEn: "Counterevidence exists when three projects had a user, minimum version, release date, and review evidence.",
    actionZh: "为当前愿景写一页交付契约：服务对象、唯一核心问题、七天成品、成功指标和停止条件。",
    actionEn: "Write a one-page delivery contract: user, one core problem, seven-day output, success metric, and stop condition.",
  },
  {
    key: "connection-boundary",
    mechanismZh: "这组三签的交叉重点是连接如何在不牺牲边界的情况下产生协作。源流识别值得维护的关系资产，灵魂读取互动中的真实需要，行者明确责任、交换和结束条件。连接的质量不由认识人数决定，而由互相性和可持续性决定。",
    mechanismEn: "This fusion creates collaboration without surrendering boundaries: Origin identifies durable relational assets, Soul reads need, and Walker defines responsibility and exchange.",
    sceneZh: "它常出现在团队协作、资源介绍、亲密照顾和客户关系中：你很快看见双方可以如何互补，也容易在规则尚未说清之前先承担中间协调。",
    sceneEn: "It appears in teamwork, introductions, care, and client relationships where complementarity is seen before rules are clear.",
    shadowZh: "当被需要成为价值证明，源流会舍不得结束旧关系，灵魂会替别人解释需求，行者会用更多执行修补规则缺失，最终形成只有你在维持的连接。",
    shadowEn: "When being needed proves worth, old ties remain, needs are interpreted for others, and extra work compensates for missing rules.",
    counterZh: "反证条件是：合作双方能各自说明目标与责任，拒绝不会带来惩罚，结束合作也不会被解释成背叛。",
    counterEn: "Counterevidence exists when both sides can state goals and roles, refuse safely, and end without punishment.",
    actionZh: "下一次连接前写清四项：共同目标、各自贡献、决策方式、结束条件。缺一项就不急于进入深度合作。",
    actionEn: "Before connecting, define shared goal, contributions, decision method, and end condition.",
  },
];

function clamp(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function buildQianAbilityMap(vector: LifeVector): QianAbility[] {
  return [
    { key: "creativity", zh: "创造力", en: "Creativity", score: clamp(vector.creativity) },
    { key: "wealth", zh: "价值建构", en: "Value Building", score: clamp(vector.ambition * 0.5 + vector.discipline * 0.5) },
    { key: "relationship", zh: "关系协作", en: "Relational Collaboration", score: clamp(vector.socialDrive * 0.55 + vector.emotionalDepth * 0.45) },
    { key: "learning", zh: "学习洞察", en: "Learning Insight", score: clamp(vector.introspection * 0.6 + vector.adaptability * 0.4) },
    { key: "leadership", zh: "组织引导", en: "Organizing Leadership", score: clamp(vector.discipline * 0.55 + vector.ambition * 0.45) },
  ];
}

export function pickQianLifeStage(signs: [LifeSign, LifeSign, LifeSign], vector: LifeVector): QianLifeStage {
  const signal =
    signs[0].tierIndex * 3 +
    signs[1].tierIndex * 5 +
    signs[2].tierIndex * 7 +
    Math.round(vector.adaptability / 10) +
    Math.round(vector.discipline / 10);
  return STAGES[signal % STAGES.length];
}

function rank(vector: LifeVector): LifeVectorDim[] {
  return [...DIMS].sort((a, b) => vector[b] - vector[a] || a.localeCompare(b));
}

function label(dim: LifeVectorDim, lang: Lang): string {
  return lang === "en" ? DIM_LABEL[dim].en : DIM_LABEL[dim].zh;
}

function keyword(sign: LifeSign, lang: Lang, index = 0): string {
  const source = lang === "en" ? sign.keywordsEn : sign.keywordsZh;
  return source.split(/[·]/).map((part) => part.trim()).filter(Boolean)[index] ?? source;
}

function signName(sign: LifeSign, lang: Lang): string {
  return lang === "en" ? sign.nameEn : sign.nameZh;
}

function signMeaning(sign: LifeSign, lang: Lang): string {
  return lang === "en" ? sign.meaningEn : sign.meaningZh;
}

function activation(chapter: string, signs: LifeSign[], dims: LifeVectorDim[], vector: LifeVector): ActivatedNode[] {
  const signNodes = signs.map((sign, index) => {
    const node: DendriticNode = {
      id: "qian." + chapter + ".sign-" + sign.index,
      knowledgeVersion: KNOWLEDGE_VERSION,
      product: "qian",
      chapter,
      kind: index === 0 ? "narrative" : "cross",
      priority: 120 - index,
      conditions: { op: "context", key: "signIndex", value: String(sign.index) },
      dimensions: ["sign:" + sign.index],
      fragments: { judgment: sign.meaningZh },
      safetyTags: ["agency", "symbolic", "non-predictive"],
    };
    return { node, reason: "sign:" + sign.index, deterministicOrder: index };
  });
  const dimNodes = dims.map((dim, index) => {
    const band = semanticBand(vector[dim], 13);
    const node: DendriticNode = {
      id: "qian." + chapter + "." + dim + ".b" + (band.index + 1) + "of13",
      knowledgeVersion: KNOWLEDGE_VERSION,
      product: "qian",
      chapter,
      kind: "basic",
      priority: 100 - index,
      conditions: { op: "score", dim, min: band.min, max: band.max },
      dimensions: [dim],
      fragments: { mechanism: GUIDE[dim].giftZh },
      safetyTags: ["agency", "counterevidence", "non-diagnostic"],
    };
    return { node, reason: "score:" + dim + ":" + band.min + "-" + band.max, deterministicOrder: signs.length + index };
  });
  return [...signNodes, ...dimNodes];
}

function evidence(signs: LifeSign[], dims: LifeVectorDim[], vector: LifeVector, lang: Lang): EvidenceItem[] {
  return [
    ...signs.map((sign) => ({
      key: "sign-" + sign.index,
      label: lang === "en" ? "Sign archetype" : "签象原型",
      value: signName(sign, lang) + " #" + sign.index,
      source: "calculation" as const,
    })),
    ...dims.map((dim) => ({
      key: dim,
      label: label(dim, lang),
      value: vector[dim],
      source: "calculation" as const,
    })),
  ];
}

function evidenceText(signs: LifeSign[], dims: LifeVectorDim[], vector: LifeVector, lang: Lang): string {
  const signPart = signs.map((sign) => signName(sign, lang) + " #" + sign.index).join(lang === "zh" ? "、" : ", ");
  const dimPart = dims.map((dim) => label(dim, lang) + " " + vector[dim]).join(lang === "zh" ? "、" : ", ");
  return lang === "zh"
    ? "结构证据：" + signPart + "；" + dimPart + "。签象来自四柱哈希映射，向量来自同一出生事实；两者用于组织反思，不证明人格或未来事件。"
    : "Structural evidence: " + signPart + "; " + dimPart + ". Signs are mapped deterministically from birth pillars and used for reflection, not proof of personality or future events.";
}

function compose(args: {
  key: string;
  signs: LifeSign[];
  dims: LifeVectorDim[];
  vector: LifeVector;
  lang: Lang;
  judgment: string;
  mechanism: string;
  scenario: string;
  shadow: string;
  counter: string;
  action: string;
  narrative?: string;
}) {
  return composeDendriticChapter({
    chapter: args.key,
    knowledgeVersion: KNOWLEDGE_VERSION,
    activated: activation(args.key, args.signs, args.dims, args.vector),
    evidence: evidence(args.signs, args.dims, args.vector, args.lang),
    slots: {
      judgment: args.judgment,
      evidence: evidenceText(args.signs, args.dims, args.vector, args.lang),
      mechanism: args.mechanism,
      scenario: args.scenario,
      shadow: args.shadow,
      counterevidence: args.counter,
      action: args.action,
      narrative: args.narrative,
    },
  });
}

function practiceFor(vector: LifeVector): { zh: string; en: string; dim: LifeVectorDim; protocolZh: string; protocolEn: string } {
  const candidates = [
    {
      zh: "量子息法", en: "Quantum Breath", dim: "riskTolerance" as const,
      score: vector.riskTolerance + vector.adaptability,
      protocolZh: "当冲动、压力或变化要求你立刻决定时，先完成十二轮四拍吸气、六拍呼气，再写下最大损失与停止信号。",
      protocolEn: "When pressure demands an immediate decision, complete twelve rounds of a four-count inhale and six-count exhale, then write the maximum loss and stop signal.",
    },
    {
      zh: "上升心经", en: "Ascension Heart", dim: "ambition" as const,
      score: vector.ambition + vector.socialDrive,
      protocolZh: "当目标、评价或影响力让你加速时，把手放在胸口，分别说出想完成的结果、不能牺牲的关系和必须保留的恢复时间。",
      protocolEn: "When goals or evaluation accelerate you, name the outcome, the relationship that cannot be sacrificed, and the recovery time that must remain.",
    },
    {
      zh: "心场复位", en: "Heart Field Reset", dim: "emotionalDepth" as const,
      score: vector.emotionalDepth + vector.stabilityNeed,
      protocolZh: "当你开始替别人补全情绪或答案时，写开事实、感受、推测、请求四栏，只对事实和请求采取行动。",
      protocolEn: "When you complete another person's feelings or answers, separate fact, feeling, interpretation, and request, then act only on fact and request.",
    },
    {
      zh: "直觉丹道", en: "Intuition Alchemy", dim: "introspection" as const,
      score: vector.introspection + vector.creativity,
      protocolZh: "当思考超过十五分钟仍没有下一步时，停止分析，写下一个最小验证动作，并在二十四小时内完成。",
      protocolEn: "When reflection exceeds fifteen minutes without a next step, stop analysis, define one minimum test, and complete it within twenty-four hours.",
    },
  ];
  return candidates.sort((a, b) => b.score - a.score || a.zh.localeCompare(b.zh))[0];
}

export function generateStaticQianReport(input: StaticQianInput): StaticQianReport {
  const lang: Lang = input.lang === "en" ? "en" : "zh";
  const zh = lang === "zh";
  const [origin, soul, walker] = input.signs;
  const vector = input.vector;
  const [first, second, third, fourth, fifth, , , , , lowest] = rank(vector);
  const conflict = findConflictsWithFallback(vector)[0];
  const wealth = wealthArchetypes(vector, 2);
  const abilityMap = buildQianAbilityMap(vector);
  const lifeStage = pickQianLifeStage(input.signs, vector);
  const practice = practiceFor(vector);
  const formula = keyword(origin, lang) + " → " + keyword(soul, lang) + " → " + keyword(walker, lang);
  const fusionLens = FUSION_LENSES[(origin.index + soul.index + walker.index) % FUSION_LENSES.length];
  const genericCounter = zh
    ? "请用最近三次真实行为验证。如果没有重复出现，或只有一次偶然事件支持，就不要把这项解读当成稳定模式。"
    : "Test this against three recent behaviors. If it does not repeat, do not treat the reading as a stable pattern.";

  const chapters = [
    compose({
      key: "01-overview", signs: [origin, soul, walker], dims: [first, second, lowest], vector, lang,
      judgment: zh ? "你的三签公式是“" + formula + "”。源流签提供背景，灵魂签提供内驱，行者签决定如何把内驱转成现实动作。" : "Your three-sign formula is " + formula + ". Origin provides context, Soul provides motive, and Walker turns motive into action.",
      mechanism: signMeaning(origin, lang) + " " + signMeaning(soul, lang) + " " + signMeaning(walker, lang) + (zh ? "三者叠加后，重点不是三个好听标签，而是背景、动机与行动是否沿同一方向工作。" : " The value lies in whether context, motive, and action work in one direction."),
      scenario: zh ? "回看一件从想法走到结果的事：最初由什么经验触发，中途真正想满足什么，最后用什么动作完成。三段分别对应三枚签的可验证位置。" : "Review one completed project: what triggered it, what motive sustained it, and what action finished it.",
      shadow: zh ? "若只认同签名中悦耳的部分，却不检查代价、失败条件和现实行为，这份报告就会退化成任何人都能接受的模糊反馈。" : "Accepting only flattering language without cost, failure conditions, or behavior turns the report into vague feedback.",
      counter: genericCounter,
      action: zh ? "写下一次完整事件的“触发—动机—行动—结果”，再标记哪一段最弱；后续训练只补最弱段。" : "Map trigger, motive, action, and result for one event, then train only the weakest link.",
      narrative: zh ? "象征说明：64 枚签是灵犀场的生命主题语言，不是心理测量量表，也不承担吉凶预测。" : "Symbolic note: the 64 signs are a reflective language, not a psychometric test or fortune prediction.",
    }),
    compose({
      key: "02-origin", signs: [origin], dims: [second, fourth], vector, lang,
      judgment: zh ? "源流签“" + origin.nameZh + "”描述你更容易从哪类既有经验开始组织世界，不表示家族历史或前世事实。" : "Origin Sign " + origin.nameEn + " describes the kind of inherited context from which you tend to organize experience, not literal lineage or past-life fact.",
      mechanism: signMeaning(origin, lang) + " " + (zh ? GUIDE[second].giftZh + GUIDE[fourth].shadowZh : GUIDE[second].giftEn + " " + GUIDE[fourth].shadowEn),
      scenario: zh ? "在进入新团队、新关系或新城市时，观察你最先寻找的是规则、空间、信任、信息还是可发挥的角色；这个第一寻找动作就是源流签落地的位置。" : "In a new team, relationship, or city, observe whether you first seek rules, room, trust, information, or a useful role.",
      shadow: zh ? "源流优势被过度使用时，会把熟悉策略当作唯一安全策略，使新环境只能被旧经验解释。" : "Overused origin strength turns a familiar strategy into the only safe strategy.",
      counter: genericCounter,
      action: zh ? "下一次进入新情境，先写下一个旧策略，再刻意收集一条会修正它的新证据。" : "In the next new context, name one old strategy and collect one piece of evidence that could revise it.",
    }),
    compose({
      key: "03-soul", signs: [soul], dims: [first, fifth], vector, lang,
      judgment: zh ? "灵魂签“" + soul.nameZh + "”描述持续驱动注意力的内部问题：你反复想理解、修复、创造或完成什么。" : "Soul Sign " + soul.nameEn + " describes the inner question that repeatedly directs attention.",
      mechanism: signMeaning(soul, lang) + " " + (zh ? GUIDE[first].giftZh + GUIDE[fifth].shadowZh : GUIDE[first].giftEn + " " + GUIDE[fifth].shadowEn),
      scenario: zh ? "比较三件你无人要求却仍愿意投入的事。共同出现的动作，比职业名称或自我评价更能说明内驱。" : "Compare three things you pursued without being asked. The repeated action reveals motive better than a title.",
      shadow: zh ? "内驱如果被拿来证明价值，就会从持续能量变成无法停止的任务；完成之后也难以产生真正结束感。" : "When motive proves worth, it becomes an endless assignment rather than sustainable energy.",
      counter: genericCounter,
      action: zh ? "为当前目标写一句“即使没有掌声，我仍愿意做，因为它改善了什么现实”；无法回答时先缩小目标。" : "Write why the current goal remains worth doing without applause and what reality it improves.",
    }),
    compose({
      key: "04-walker", signs: [walker], dims: [third, first], vector, lang,
      judgment: zh ? "行者签“" + walker.nameZh + "”描述从意图到行动的常用通道，不代表行动结果必然成功。" : "Walker Sign " + walker.nameEn + " describes a common route from intention to action, not guaranteed success.",
      mechanism: signMeaning(walker, lang) + " " + (zh ? GUIDE[third].giftZh + GUIDE[first].shadowZh : GUIDE[third].giftEn + " " + GUIDE[first].shadowEn),
      scenario: zh ? "观察一个最近完成和一个最近搁置的任务：两者在启动方式、伙伴、反馈速度和截止条件上有什么差异。" : "Compare one completed and one stalled task across start method, partners, feedback speed, and deadline.",
      shadow: zh ? "把行动偏好当成固定身份，会拒绝学习另一种通道；真正成熟的行者能在情境变化时切换方法。" : "Treating an action preference as identity blocks alternate routes.",
      counter: genericCounter,
      action: zh ? GUIDE[third].actionZh + "完成后记录动作是否真的改变结果，而不只记录感觉。" : GUIDE[third].actionEn + " Record whether it changed the result, not just the feeling.",
    }),
    compose({
      key: "05-fusion", signs: [origin, soul, walker], dims: [first, second, lowest], vector, lang,
      judgment: zh ? "三签融合后的核心任务是：让“" + keyword(origin, lang) + "”成为底座，让“" + keyword(soul, lang) + "”提供方向，再由“" + keyword(walker, lang) + "”形成可复核结果。" : "Fusion uses " + keyword(origin, lang) + " as the base, " + keyword(soul, lang) + " as direction, and " + keyword(walker, lang) + " as testable action.",
      mechanism: (zh ? fusionLens.mechanismZh : fusionLens.mechanismEn) + " " + (zh
        ? "最高向量是" + label(first, lang) + " " + vector[first] + "，第二向量是" + label(second, lang) + " " + vector[second] + "，最低向量是" + label(lowest, lang) + " " + vector[lowest] + "。融合质量取决于强项是否为较少使用的能力留下参与位置。"
        : "The highest vectors are " + label(first, lang) + " " + vector[first] + " and " + label(second, lang) + " " + vector[second] + "; the lowest is " + label(lowest, lang) + " " + vector[lowest] + "."),
      scenario: (zh ? fusionLens.sceneZh : fusionLens.sceneEn) + " " + (zh
        ? "当你最熟练的能力快速解决问题时，检查它是否同时制造了新代价，例如推进很快但确认不足、理解很深但请求不清、结构完整但试验太晚。"
        : "When the strongest capacity solves a problem, inspect the new cost it creates."),
      shadow: (zh ? fusionLens.shadowZh : fusionLens.shadowEn) + " " + (zh
        ? "融合不是把三枚签都说成优势，而是承认它们之间可能发生代偿、阻断和节奏差。"
        : "Fusion includes compensation, blockage, and pacing gaps rather than declaring all three signs strengths."),
      counter: (zh ? fusionLens.counterZh : fusionLens.counterEn) + " " + genericCounter,
      action: (zh ? fusionLens.actionZh : fusionLens.actionEn) + " " + (zh
        ? "为一个进行中项目分配三项职责：底座由谁维护、方向由什么证据确认、行动以什么结果结束。"
        : "Assign a keeper of the base, evidence for direction, and a finishing result to one live project."),
    }),
    compose({
      key: "06-value", signs: [origin, soul, walker], dims: [first, second, fourth], vector, lang,
      judgment: zh ? "你的主要价值创造路径是“" + wealth[0].labelZh + "”，辅助路径是“" + wealth[1].labelZh + "”。这描述交换机制，不承诺财富结果。" : "Your primary value path is " + wealth[0].labelEn + ", supported by " + wealth[1].labelEn + ". It describes exchange, not guaranteed wealth.",
      mechanism: zh ? "匹配度为 " + wealth[0].score + " 与 " + wealth[1].score + "。能力地图中，" + abilityMap.map((item) => item.zh + " " + item.score).join("、") + "。原始分数未经保底抬高，因此差异可以被真实看见。" : "Fit scores are " + wealth[0].score + " and " + wealth[1].score + ". Ability map: " + abilityMap.map((item) => item.en + " " + item.score).join(", ") + ".",
      scenario: zh ? "回看最近一次别人愿意为你的结果投入时间、信任或金钱的经历：对方购买的究竟是创意、结构、连接、专业判断还是风险承担。" : "Review what another person actually exchanged time, trust, or money for.",
      shadow: zh ? "签象中的“使命”若没有用户、问题、结果和重复方式，就只是身份想象，不能构成事业方向。" : "A mission without user, problem, outcome, and repetition remains identity fantasy.",
      counter: zh ? "如果市场证据持续来自另一种路径，应以复购、转介绍和结果数据修正签象分类。" : "If market evidence consistently points elsewhere, repeat use and outcomes should revise the classification.",
      action: zh ? "写四行价值证据：服务谁、改善什么、如何证明、怎样重复。缺失的一行就是下一步实验。" : "Write who is served, what improves, how it is proven, and how it repeats.",
    }),
    compose({
      key: "07-relationship", signs: [soul, walker], dims: [conflict.a, conflict.b, "emotionalDepth"], vector, lang,
      judgment: zh ? "关系中的主要张力落在“" + conflict.labelZh + "”。灵魂签描述你寻找的体验，行者签描述你如何靠近，两者并不自动一致。" : "The main relational tension is " + conflict.labelEn + ". Soul describes the experience sought; Walker describes how you approach.",
      mechanism: signMeaning(soul, lang) + " " + signMeaning(walker, lang) + (zh ? GUIDE[conflict.a].shadowZh + GUIDE[conflict.b].giftZh : GUIDE[conflict.a].shadowEn + " " + GUIDE[conflict.b].giftEn),
      scenario: zh ? "回看最近一次靠近、冲突或退出：谁发起、谁改变节奏、谁说边界、谁承担修复。关系结构藏在双向动作里，不藏在强烈感受里。" : "Review initiation, pace change, boundary, and repair in one connection.",
      shadow: zh ? "最容易发生的误读，是把自己的投入当作双方承诺，或用理解对方替代对方清楚表达。" : "The common error is treating personal investment as mutual commitment or interpreting instead of receiving clear expression.",
      counter: genericCounter,
      action: zh ? "下一次重要互动只完成三件事：说清一个事实、提出一个可回答请求、允许一个不同答案。" : "State one fact, make one answerable request, and allow a different answer.",
    }),
    compose({
      key: "08-stage", signs: [origin, soul, walker], dims: ["adaptability", "discipline"], vector, lang,
      judgment: zh ? "当前象征阶段为“" + lifeStage.zh + "”。阶段由三签索引与向量共同确定，是复盘坐标，不是时间预言。" : "The current symbolic stage is " + lifeStage.en + ". It is a review coordinate, not a time prediction.",
      mechanism: zh ? (lifeStage.key === "exploration" ? "探索期负责扩大样本，不急于把第一次尝试变成长期身份。" : lifeStage.key === "transformation" ? "转化期负责停止失效策略，并保留新旧结构之间的安全过渡。" : lifeStage.key === "building" ? "建设期负责把有效尝试压缩成流程、节律和可重复交付。" : "显化期负责让内部能力进入现实交换，并接受外部证据修正。") : (lifeStage.key === "exploration" ? "Exploration expands samples before identity." : lifeStage.key === "transformation" ? "Transformation stops expired strategies and protects transition." : lifeStage.key === "building" ? "Building turns effective trials into repeatable structure." : "Manifestation brings internal capacity into external exchange and feedback."),
      scenario: zh ? "检查过去九十天：你新增了多少样本、停止了什么旧策略、建立了什么重复结构、获得了什么外部反馈。最突出的那一项才是阶段证据。" : "Review ninety days of new samples, stopped strategies, repeated structures, and external feedback.",
      shadow: zh ? "阶段标签容易让人选择性寻找支持证据，因此必须同时记录一条反例。" : "Stage labels invite confirmation bias, so one counterexample must also be recorded.",
      counter: genericCounter,
      action: zh ? "为当前阶段设置一个三十天任务和一个结束指标；指标到达后重新计算，不无限延长标签。" : "Give the stage one thirty-day task and one completion metric, then reassess.",
    }),
    compose({
      key: "09-hidden", signs: [origin, soul], dims: [lowest, first], vector, lang,
      judgment: zh ? "较少被使用的力量不是另一枚神秘签，而是向量中最低的“" + label(lowest, lang) + "”如何在需要时参与。分数 " + vector[lowest] + " 表示调用条件，不表示能力不存在。" : "The hidden capacity is how the lower-used " + label(lowest, lang) + " becomes available when needed. Its score of " + vector[lowest] + " reflects conditions, not absence.",
      mechanism: zh ? GUIDE[lowest].giftZh + "当前" + label(first, lang) + " " + vector[first] + " 分更容易自动启动，因此常替较低维度完成任务。" : GUIDE[lowest].giftEn + " " + label(first, lang) + " at " + vector[first] + " activates more automatically.",
      scenario: zh ? "当你最想使用" + label(first, lang) + "时，暂停十秒，判断问题真正缺少的是更强信号，还是更多" + label(lowest, lang) + "。" : "When reaching for " + label(first, lang) + ", ask whether the situation actually needs more " + label(lowest, lang) + ".",
      shadow: zh ? "把低分写成缺陷会制造迎合；把高分写成天赋又会忽略它在错误情境中的代价。" : "Calling a low score a defect produces compliance; calling a high score a gift hides contextual cost.",
      counter: genericCounter,
      action: zh ? GUIDE[lowest].actionZh + "连续记录三次，只有行为结果改善时才保留这项训练。" : GUIDE[lowest].actionEn + " Keep the practice only if three outcomes improve.",
    }),
    compose({
      key: "10-practice", signs: [walker], dims: [practice.dim, lowest], vector, lang,
      judgment: zh ? "你的实践路径是“" + practice.zh + "”。推荐依据来自能力结构，不再因为所有人的第三枚都是行者签而给出同一练习。" : "Your practice path is " + practice.en + ". It is selected from the ability structure rather than assigning the same practice to every Walker sign.",
      mechanism: zh ? "核心触发维度是" + label(practice.dim, lang) + " " + vector[practice.dim] + "，较少使用的校准维度是" + label(lowest, lang) + " " + vector[lowest] + "。" : "The trigger dimension is " + label(practice.dim, lang) + " " + vector[practice.dim] + ", calibrated by " + label(lowest, lang) + " " + vector[lowest] + ".",
      scenario: zh ? practice.protocolZh : practice.protocolEn,
      shadow: zh ? "练习若变成表演、逃避现实决定或替代医疗与心理支持，就已经超出它的适用范围。" : "Practice must not become performance, avoidance, or a replacement for medical or psychological support.",
      counter: zh ? "如果连续七次练习没有改善决策清晰度、边界或行动完成度，应停止并更换方法。" : "If seven uses do not improve clarity, boundary, or completion, stop and change method.",
      action: zh ? "写成实施意图：如果上述触发情境出现，我就执行这项协议；完成后记录事实结果，而不是只记录感受。" : "Use an implementation intention: if the trigger appears, then run the protocol and record the factual outcome.",
    }),
    compose({
      key: "11-summary", signs: [origin, soul, walker], dims: [first, second, lowest], vector, lang,
      judgment: zh ? "这份生命灵签最终保留的不是三个身份标签，而是一条可验证路径：“" + formula + "”。" : "The report retains a testable path, not three identity labels: " + formula + ".",
      mechanism: zh ? "源流签说明从哪里开始，灵魂签说明为何持续，行者签说明如何行动；" + label(first, lang) + "提供现成力量，" + label(lowest, lang) + "负责避免强项变成单一路径。" : "Origin explains context, Soul motive, and Walker action; " + label(first, lang) + " provides available power while " + label(lowest, lang) + " prevents a single path.",
      scenario: zh ? "未来面对重要决定时，只问四个问题：事实是什么、我真正想满足什么、下一步能否验证、什么证据会让我停止。" : "For an important decision, ask what is factual, what is sought, what next step can test it, and what evidence would stop it.",
      shadow: zh ? "不要用签象解释别人、替别人决定，或证明一段关系和事业必须继续。象征只有在提升观察精度时才有价值。" : "Do not use signs to explain others, decide for them, or prove that a relationship or project must continue.",
      counter: zh ? "任何结论只要与持续、清楚的现实证据冲突，就应被修正；直接经验始终高于报告文本。" : "Any conclusion that conflicts with sustained evidence should be revised.",
      action: zh ? "我的生命宣言是：我从" + keyword(origin, lang) + "出发，以" + keyword(soul, lang) + "确认方向，用" + keyword(walker, lang) + "完成下一步。我不靠标签证明自己；我用事实、边界与行动修正这张地图。" : "My declaration: I begin with " + keyword(origin, lang) + ", orient through " + keyword(soul, lang) + ", and act through " + keyword(walker, lang) + ". I revise this map with evidence, boundaries, and action.",
      narrative: zh ? "签象不是命令。它完成使命的方式，是把选择权完整交还给你。" : "A sign is not a command. Its purpose is to return choice to you.",
    }),
  ];

  const traces = chapters.map((chapter) => chapter.trace);
  return {
    fullReport: chapters.map((chapter, index) => "===" + (index + 1) + "===\n" + chapter.text).join("\n\n"),
    traces,
    activatedNodeIds: traces.flatMap((trace) => trace.activatedNodeIds),
    knowledgeVersion: KNOWLEDGE_VERSION,
    abilityMap,
    lifeStage,
  };
}
