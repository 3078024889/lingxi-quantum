import { composeDendriticChapter, semanticBand, type ActivatedNode, type ChapterTrace, type DendriticNode, type EvidenceItem } from "@/lib/dendritic-engine";
import { DIM_LABEL, type LifeVector, type LifeVectorDim } from "@/lib/life-vector";
import type { TarotCard } from "@/lib/tarot-data";

export const LIFE_MIRROR_KNOWLEDGE_VERSION = "life-mirror-2026.08.1";
type Lang = "zh" | "en";

export type MirrorFrequency = {
  key: "awareness" | "creation" | "connection" | "stability" | "manifestation";
  zh: string; en: string; score: number;
};
export type LifeMirrorInput = {
  cards: [TarotCard, TarotCard, TarotCard]; vector: LifeVector;
  facts: Record<string, unknown>; seed: string; lang: Lang;
};
export type StaticLifeMirrorReport = {
  fullReport: string; frequencyMap: MirrorFrequency[]; practice: { zh: string; en: string };
  traces: ChapterTrace[]; activatedNodeIds: string[]; knowledgeVersion: string;
};

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
const name = (c: TarotCard, lang: Lang) => lang === "zh" ? c.nameZh : c.nameEn;
const theme = (c: TarotCard, lang: Lang) => lang === "zh" ? c.themeZh : c.themeEn;
const symbol = (c: TarotCard, lang: Lang) => lang === "zh" ? c.symbolZh : c.symbolEn;
const words = (c: TarotCard, lang: Lang) => (lang === "zh" ? c.keywordsZh : c.keywordsEn).split("·").map(x => x.trim()).filter(Boolean);
const dimName = (d: LifeVectorDim, lang: Lang) => DIM_LABEL[d][lang];

export function buildMirrorFrequencyMap(v: LifeVector): MirrorFrequency[] {
  return [
    { key: "awareness", zh: "觉察力", en: "Awareness", score: clamp(v.introspection) },
    { key: "creation", zh: "创造力", en: "Creation", score: clamp(v.creativity) },
    { key: "connection", zh: "关系流动", en: "Connection", score: clamp(v.socialDrive) },
    { key: "stability", zh: "内在稳定", en: "Stability", score: clamp(v.discipline) },
    { key: "manifestation", zh: "现实转化", en: "Real-world Translation", score: clamp((v.riskTolerance + v.ambition) / 2) },
  ];
}

const PRACTICES = [
  { zh: "量子息法", en: "Quantum Breath", dim: "riskTolerance" as const,
    score: (v: LifeVector) => v.riskTolerance + v.adaptability,
    zhText: "当压力要求立刻决定时，先做十二轮四拍吸气、六拍呼气，再写最大可承受代价与停止信号。",
    enText: "When pressure demands a decision, take twelve slow breath cycles, then write the maximum acceptable cost and stop signal." },
  { zh: "上升心经", en: "Ascension Heart", dim: "emotionalDepth" as const,
    score: (v: LifeVector) => v.emotionalDepth + v.socialDrive,
    zhText: "当关系或评价牵动你时，分别写下感受、需要、边界，以及一个允许对方拒绝的请求。",
    enText: "When relationship or evaluation pulls at you, name the feeling, need, boundary, and one request the other person may decline." },
  { zh: "直觉丹道", en: "Intuition Alchemy", dim: "introspection" as const,
    score: (v: LifeVector) => v.introspection + v.creativity,
    zhText: "当多个解释同时出现时，分开记录第一感受、可观察事实和最小验证动作，不把感觉直接当成结论。",
    enText: "When several interpretations appear, separate first impression, observable facts, and the smallest test." },
  { zh: "归零心诀", en: "Zero-Point Reset", dim: "discipline" as const,
    score: (v: LifeVector) => v.stabilityNeed + v.discipline,
    zhText: "当信息过载时，暂停新增输入十分钟，只保留一个必须完成项、一个等待项和一个明确放下项。",
    enText: "When information overloads you, stop new input for ten minutes and retain one must-do, one can-wait, and one deliberate release." },
];
function selectPractice(v: LifeVector) {
  return [...PRACTICES].sort((a, b) => b.score(v) - a.score(v) || a.zh.localeCompare(b.zh))[0];
}

function activate(chapter: string, cards: TarotCard[], dims: LifeVectorDim[], vector: LifeVector): ActivatedNode[] {
  const cardNodes = cards.map((card, index) => {
    const node: DendriticNode = {
      id: "life-mirror." + chapter + ".card-" + card.index,
      knowledgeVersion: LIFE_MIRROR_KNOWLEDGE_VERSION, product: "life-mirror", chapter,
      kind: index === 0 ? "narrative" : "cross", priority: 120 - index,
      conditions: { op: "context", key: "cardIndex", value: String(card.index) },
      dimensions: ["card:" + card.index], fragments: { judgment: card.themeZh },
      safetyTags: ["symbolic", "non-predictive", "agency"],
    };
    return { node, reason: "card:" + card.index, deterministicOrder: index };
  });
  const dimNodes = dims.map((dim, index) => {
    const band = semanticBand(vector[dim], 13);
    const node: DendriticNode = {
      id: "life-mirror." + chapter + "." + dim + ".b" + (band.index + 1) + "of13",
      knowledgeVersion: LIFE_MIRROR_KNOWLEDGE_VERSION, product: "life-mirror", chapter,
      kind: "basic", priority: 100 - index,
      conditions: { op: "score", dim, min: band.min, max: band.max }, dimensions: [dim],
      fragments: { mechanism: dim + ":" + band.min + "-" + band.max },
      safetyTags: ["counterevidence", "non-diagnostic", "agency"],
    };
    return { node, reason: "score:" + dim + ":" + band.min + "-" + band.max, deterministicOrder: cards.length + index };
  });
  return [...cardNodes, ...dimNodes];
}

function evidence(cards: TarotCard[], dims: LifeVectorDim[], vector: LifeVector, lang: Lang): EvidenceItem[] {
  return [
    ...cards.map(card => ({ key: "card-" + card.index, label: lang === "zh" ? "确定性牌位" : "deterministic card", value: name(card, lang) + " #" + card.index, source: "calculation" as const })),
    ...dims.map(dim => ({ key: dim, label: dimName(dim, lang), value: vector[dim], source: "calculation" as const })),
  ];
}
function evidenceLine(cards: TarotCard[], dims: LifeVectorDim[], vector: LifeVector, lang: Lang): string {
  const cs = cards.map(c => name(c, lang) + " #" + c.index).join(lang === "zh" ? "、" : ", ");
  const ds = dims.map(d => dimName(d, lang) + " " + vector[d]).join(lang === "zh" ? "、" : ", ");
  return lang === "zh"
    ? "结构证据：" + cs + "；" + ds + "。三张牌由出生事实确定性映射，用于组织自我观察；牌义不能证明人格、因果或未来事件。"
    : "Structural evidence: " + cs + "; " + ds + ". Cards are mapped deterministically from birth facts to organize reflection; they do not prove personality, causation, or future events.";
}

type Spec = {
  key: string; cards: TarotCard[]; dims: LifeVectorDim[]; judgment: string; mechanism: string;
  scenario: string; shadow: string; counter: string; action: string; narrative?: string;
};
function compose(input: LifeMirrorInput, spec: Spec) {
  return composeDendriticChapter({
    chapter: spec.key, knowledgeVersion: LIFE_MIRROR_KNOWLEDGE_VERSION,
    activated: activate(spec.key, spec.cards, spec.dims, input.vector),
    evidence: evidence(spec.cards, spec.dims, input.vector, input.lang),
    slots: {
      judgment: spec.judgment, evidence: evidenceLine(spec.cards, spec.dims, input.vector, input.lang),
      mechanism: spec.mechanism, scenario: spec.scenario, shadow: spec.shadow,
      counterevidence: spec.counter, action: spec.action, narrative: spec.narrative,
    },
  });
}

function fact(facts: Record<string, unknown>, key: string, fallback: string): string {
  const value = facts[key];
  return typeof value === "string" && value ? value : fallback;
}

function zhSpecs(input: LifeMirrorInput, practice: ReturnType<typeof selectPractice>): Spec[] {
  const hidden = input.cards[0], present = input.cards[1], future = input.cards[2], v = input.vector;
  const hw = words(hidden, "zh"), pw = words(present, "zh"), fw = words(future, "zh");
  const ranked = (Object.keys(v) as LifeVectorDim[]).sort((a, b) => v[b] - v[a]);
  const top = ranked[0], second = ranked[1], low = ranked[ranked.length - 1];
  const sharedShadow = "阴影是把象征语言当成精准诊断，或只挑符合期待的句子。强烈共鸣不等于判断真实，也不能替代同意、责任与现实证据。";
  return [
    { key: "connection", cards: [hidden, present, future], dims: [top, second],
      judgment: "三张镜像形成路径：" + name(hidden,"zh") + "的“" + hw[0] + "”，经过" + name(present,"zh") + "的“" + pw[0] + "”，走向" + name(future,"zh") + "的“" + fw[0] + "”。这不是未来剧本，而是此刻值得检验的三段式问题。",
      mechanism: "牌阵把不同出生事实切片映射为三个位置。" + dimName(top,"zh") + " " + v[top] + "与" + dimName(second,"zh") + " " + v[second] + "解释你更容易从哪些能力进入主题，但不会赋予牌面因果力量。",
      scenario: "把一个现实困惑写成“我从哪里来、我现在看见什么、我愿意试什么”三句话。牌面只提供视角，决定仍回到事实、资源和责任。",
      shadow: sharedShadow, counter: "反证问题：三张牌中哪一张最不像你？列出两个不符合的现实例子，防止报告变成万能描述。",
      action: "选择一个十分钟可逆动作，写下继续条件与停止条件；行动后的反馈比阅读时的感动更有判断价值。" },
    { key: "hidden", cards: [hidden], dims: ["introspection","emotionalDepth"],
      judgment: "潜意识镜像" + name(hidden,"zh") + "呈现“" + theme(hidden,"zh") + "”。它对应年柱" + fact(input.facts,"yearPillar","未知") + "与月柱" + fact(input.facts,"monthPillar","未知") + "的映射，适合观察自动反应，不宣称发现被压抑的真相。",
      mechanism: symbol(hidden,"zh") + " 这句象征与内省" + v.introspection + "、情感深度" + v.emotionalDepth + "交叉后，更像一面提问镜：你在压力下会保护什么，又会忽略什么？",
      scenario: "回想最近一次反应快于思考的时刻，分开记录触发事件、身体反应、脑中解释和实际行为，不用牌名替代经历。",
      shadow: sharedShadow, counter: "反证问题：有哪些情境中你没有重复这张牌描述的模式？那些例外揭示了你已经拥有的选择能力。",
      action: "下一次同类触发出现时，停九十秒，命名事实与感受，再选择一个不重复旧反应的小动作。" },
    { key: "present", cards: [present], dims: ["discipline","adaptability"],
      judgment: "当下共振" + name(present,"zh") + "聚焦“" + theme(present,"zh") + "”，对应日柱" + fact(input.facts,"dayPillar","未知") + "、太阳" + fact(input.facts,"sunSignZh","未知") + "、月亮" + fact(input.facts,"moonSignZh","未知") + "。它提供观察角度，不替你决定留下、离开、承诺或拒绝。",
      mechanism: "纪律" + v.discipline + "与适应弹性" + v.adaptability + "决定你如何在结构和变化间移动。关键词“" + pw.slice(0,2).join("、") + "”只提供语言，不提供结论。",
      scenario: "把当前选择拆成已知事实、未知信息、可逆选项和不可逆代价。先补最便宜的一条信息，再决定。",
      shadow: sharedShadow, counter: "反证问题：若抽到完全相反主题的牌，你会怎样处理同一选择？两种答案的共同部分更接近真实优先级。",
      action: "完成一个能增加信息而不锁死未来的动作，并约定明确复盘时间。" },
    { key: "future", cards: [future], dims: ["riskTolerance","ambition","adaptability"],
      judgment: "未来展开" + name(future,"zh") + "指向“" + theme(future,"zh") + "”，对应时柱" + fact(input.facts,"hourPillar","未提供出生时间") + "与五行分布。这里的未来只表示可主动展开的可能性，不是事件预告或时间承诺。",
      mechanism: "风险偏好" + v.riskTolerance + "、目标驱动" + v.ambition + "与适应弹性" + v.adaptability + "决定可能性怎样被试验。" + symbol(future,"zh") + "应被翻译为行动假设，而不是预言。",
      scenario: "为想进入的方向写下最小实验、最大可承受损失、成功信号和退出日期。可能性经过反馈才会变成路径。",
      shadow: sharedShadow, counter: "反证问题：什么结果会证明这个方向暂时不适合？提前定义失败证据，保护资源和主权。",
      action: "七天内完成一个成本可控的现实实验；到期只依据结果复盘，不依据是否符合牌义评分。" },
    { key: "formula", cards: [hidden,present,future], dims: [top,second,low],
      judgment: "三牌联合公式是“" + hw[0] + " → " + pw[0] + " → " + fw[0] + "”。高位维度" + dimName(top,"zh") + " " + v[top] + "与" + dimName(second,"zh") + " " + v[second] + "提供动力，低位维度" + dimName(low,"zh") + " " + v[low] + "提示承载缺口。",
      mechanism: "联合公式不是牌义相加，而是寻找连续结构：旧模式怎样进入当下选择，当下选择又怎样打开下一种可验证可能。",
      scenario: "把公式代入真实项目：第一箭头写需要看见的旧惯性，第二箭头写今天选择，第三箭头写可观察结果。",
      shadow: "只谈优势会变成赞美文案，只谈低位会变成缺陷判决。结构价值来自张力与补偿。",
      counter: "反证问题：是否有一个重要领域完全不符合公式？若有，为该领域建立独立解释，不强行统一。",
      action: "本周记录三次触发—选择—结果链条，积累后再判断公式是否有用。" },
    { key: "value", cards: [hidden,present,future], dims: ["creativity","discipline","ambition"],
      judgment: "价值创造不由牌面预测。创造" + v.creativity + "、纪律" + v.discipline + "、目标驱动" + v.ambition + "提示：价值要经过发现问题、形成方案、稳定交付三步。",
      mechanism: name(hidden,"zh") + "提供素材，" + name(present,"zh") + "提供决策角度，" + name(future,"zh") + "提供实验方向；真正价值仍由用户需求、能力、交换与结果验证。",
      scenario: "选择一个能解决的具体问题，写出服务对象、现有痛点、最小交付和付费或采用证据。",
      shadow: "阴影是把财富、使命、显化牌义误读为收益保证，或忽略市场、合同、成本和法律责任。",
      counter: "反证问题：如果没有牌面鼓励，现有需求证据是否仍支持投入？若没有，先调研，不先下注。",
      action: "完成三次真实访谈或一次小额验证；金融、职业和法律决定结合合格专业意见。" },
    { key: "relationship", cards: [hidden,present], dims: ["socialDrive","emotionalDepth","freedomNeed"],
      judgment: "关系镜面由" + name(hidden,"zh") + "与" + name(present,"zh") + "形成：情感深度" + v.emotionalDepth + "、社交驱动" + v.socialDrive + "和自由需求" + v.freedomNeed + "共同参与，不能用来判断缘分或对方心意。",
      mechanism: "牌面帮助你拉开距离观察投射，却不能读取另一个人的思想。关系事实来自沟通、持续行为、边界与同意。",
      scenario: "用第三人称写五句话描述一段冲突，再分别写双方已表达需要与尚未确认的猜测。",
      shadow: "阴影是把吸引解释成命定，把冲突解释成业力，或用灵性语言绕开拒绝与责任。",
      counter: "反证问题：对方有哪些明确行为不支持你的期待？若语言与持续行为冲突，以持续行为和边界为准。",
      action: "提出一个具体、可拒绝、可讨论的请求；若对方拒绝，尊重答案并重新安排自己的选择。" },
    { key: "current", cards: [present,future], dims: ["adaptability","stabilityNeed"],
      judgment: "当前生命映射位于“" + pw[0] + "与" + fw[0] + "之间”：适应弹性" + v.adaptability + "推动变化，稳定需求" + v.stabilityNeed + "要求安全。阶段不是固定标签，而是两种需要如何协商。",
      mechanism: "成长不是从低级进入高级，而是在探索、转化、建设和扩展之间循环。不同生活领域可以处在不同阶段。",
      scenario: "为工作、关系和自我照顾分别标注阶段并写一条现实证据，避免用一个标签概括整个人生。",
      shadow: "阴影是因想快速升级而否定当前阶段，或用等待准备好延迟必要行动。",
      counter: "反证问题：哪个领域已经比报告描述更成熟？把那里的有效方法迁移到当前难题。",
      action: "只为最需要改变的一个领域设定十四天实验，其余领域维持基本稳定。" },
    { key: "practice", cards: [present], dims: [practice.dim,"adaptability"],
      judgment: "匹配实践为" + practice.zh + "。选择依据是" + dimName(practice.dim,"zh") + " " + v[practice.dim] + "与生命向量实际需求，不再由三张牌编号取模决定。",
      mechanism: "实践创造暂停、区分感觉与事实、连接触发与反应。它不是治疗，也不保证改变心理或身体状态。",
      scenario: practice.zhText, shadow: "阴影是把练习做成完美要求，或以持续练习替代求助、沟通和现实行动。",
      counter: "反证问题：练习后是否更清楚、更能行动？若连续三次只增加焦虑或负担，停止并更换方法。",
      action: "如果今天出现“" + pw[0] + "”相关触发，那么完成一次" + practice.zh + "，随后记录一个事实、一个感受和一个可逆动作。" },
    { key: "letter", cards: [hidden,present,future], dims: [top,low],
      judgment: "给未来自己的信不许诺结果。它保存三条证据：" + name(hidden,"zh") + "提醒看见来源，" + name(present,"zh") + "要求面对选择，" + name(future,"zh") + "邀请验证可能。",
      mechanism: "稍微拉开距离的书写能让人从正在经历切换到观察正在经历，但效果因人而异，不应包装成疗愈保证。",
      scenario: "亲爱的自己：不要问牌有没有替你说对答案。去看你是否识别了“" + hw[0] + "”的旧反应，是否在“" + pw[0] + "”处作过选择，是否为“" + fw[0] + "”完成过真实实验。",
      shadow: "阴影是让文字情绪很满却没有信息，或把未来自己想象成必然成功的版本。",
      counter: "反证问题：未来的你可能不同意今天哪项判断？为这种变化留下空间。",
      action: "写下日期、一个可观察承诺和复盘条件；到期允许修改方向，不把改变视为失败。" },
    { key: "keywords", cards: [hidden,present,future], dims: [top,second],
      judgment: "生命关键词：" + (hw[0] || "觉察") + "，" + (pw[0] || "选择") + "，" + (fw[0] || "展开") + "，" + dimName(top,"zh") + "，现实验证。",
      mechanism: "前三词来自卡牌原始关键词，第四词来自最高生命向量，第五词规定解释必须回到现实。它们是索引，不是身份标签。",
      scenario: "从五个词中选一个，写下今天对应的具体行为；无法对应行为的词暂时不使用。",
      shadow: "阴影是把漂亮词汇当成已经拥有的能力，或因某个低分否定自己。",
      counter: "反证问题：哪个词最不符合最近一个月的实际行为？用事实修正，而不是强迫认同。",
      action: "三十天后重新查看五个词，只保留被行动和反馈支持的部分。",
      narrative: "镜像不替你定义自己。你可以靠近、质疑、验证，也可以放下；解释权始终属于你。" },
  ];
}

function enSpecs(input: LifeMirrorInput, practice: ReturnType<typeof selectPractice>): Spec[] {
  const zh = zhSpecs(input, practice), cards = input.cards, v = input.vector;
  const judgments = [
    "The three mirrors form an observation path: " + name(cards[0],"en") + " to " + name(cards[1],"en") + " to " + name(cards[2],"en") + ". This is a question, not a future script.",
    name(cards[0],"en") + " is a hidden-pattern lens. It can prompt reflection on automatic responses, not reveal a proven subconscious truth.",
    name(cards[1],"en") + " is a present-resonance lens. It offers an angle without deciding whether you should stay, leave, commit, or refuse.",
    name(cards[2],"en") + " is a future-possibility lens. Future means a direction to test, not an event forecast or time promise.",
    "The three-card formula links origin, current choice, and testable possibility. Vector highs and lows add tension rather than praise or defect labels.",
    "Value creation requires discovering a real problem, shaping a solution, and delivering reliably. Cards do not predict income or returns.",
    "Relationship reflection combines social drive " + v.socialDrive + ", emotional depth " + v.emotionalDepth + ", and freedom need " + v.freedomNeed + "; it cannot read another mind.",
    "Current mapping holds adaptability " + v.adaptability + " beside stability need " + v.stabilityNeed + ". Stages are contextual and cyclical.",
    "The selected practice is " + practice.en + ", chosen from the life vector rather than card-number modulo.",
    "A letter to your future self stores present evidence; it does not promise an outcome or prescribe who you must become.",
    "Life keywords: " + words(cards[0],"en")[0] + ", " + words(cards[1],"en")[0] + ", " + words(cards[2],"en")[0] + ", evidence, agency.",
  ];
  return zh.map((x, index) => ({
    ...x, judgment: judgments[index],
    mechanism: "The deterministic card mapping and life vector organize a reflective perspective. Symbolic resonance is not proof of personality, causation, diagnosis, or future events.",
    scenario: index === 8 ? practice.enText : "Apply this lens to one real situation: separate observable facts, your interpretation, another plausible interpretation, and one reversible test.",
    shadow: "The shadow is selective recognition: accepting broad statements that feel personal while ignoring mismatch, consent, context, and evidence.",
    counter: "Counterevidence: identify two real examples that do not fit this interpretation. If stronger evidence conflicts, follow the evidence.",
    action: index === 8 ? "If the current theme is triggered, then complete one " + practice.en + " cycle and record one fact, one feeling, and one reversible action." : "Take one reversible action, define a stop condition, and review the result at a fixed time.",
    narrative: index === 10 ? "The mirror does not define you. You may approach it, question it, test it, or put it down; interpretation remains yours." : undefined,
  }));
}

export function generateStaticLifeMirrorReport(input: LifeMirrorInput): StaticLifeMirrorReport {
  const practice = selectPractice(input.vector);
  const specs = input.lang === "zh" ? zhSpecs(input, practice) : enSpecs(input, practice);
  const chapters = specs.map(spec => compose(input, spec));
  if (chapters.length !== 11) throw new Error("Life Mirror must produce exactly 11 chapters.");
  const traces = chapters.map(x => x.trace);
  return {
    fullReport: chapters.map((x, index) => "===" + (index + 1) + "===\n" + x.text).join("\n\n"),
    frequencyMap: buildMirrorFrequencyMap(input.vector), practice: { zh: practice.zh, en: practice.en },
    traces, activatedNodeIds: traces.flatMap(x => x.activatedNodeIds),
    knowledgeVersion: LIFE_MIRROR_KNOWLEDGE_VERSION,
  };
}