import {
  composeDendriticChapter,
  semanticBand,
  type ActivatedNode,
  type ChapterTrace,
  type DendriticNode,
  type EvidenceItem,
} from "@/lib/dendritic-engine";
import { stampClassicalReport } from "@/lib/classical-editorial";
import {
  DIM_LABEL,
  calculateResilience,
  findConflictsWithFallback,
  topTraits,
  wealthArchetypes,
  type LifeVector,
  type LifeVectorDim,
} from "@/lib/life-vector";
import { calculateRomance, type RomanceProfile } from "@/lib/romance-calc";

type Lang = "zh" | "en";
type UnknownRecord = Record<string, unknown>;

export type StaticLifeMapInput = {
  facts: UnknownRecord;
  vector: LifeVector;
  submission: {
    id: string;
    core_type_name?: string | null;
    energy_level?: number | null;
    clarity_level?: number | null;
    alignment_level?: number | null;
    focus?: string | null;
    current_state?: string | null;
    name?: string | null;
  };
  seed: string;
  lang?: Lang;
};

export type StaticLifeMapReport = {
  fullReport: string;
  traces: ChapterTrace[];
  activatedNodeIds: string[];
  knowledgeVersion: string;
  resilience: ReturnType<typeof calculateResilience>;
  romance: RomanceProfile;
};

const KNOWLEDGE_VERSION = "life-map-2026.08.2-classical";
const DIMS = Object.keys(DIM_LABEL) as LifeVectorDim[];

const DIM_MECHANISM_ZH: Record<LifeVectorDim, string> = {
  freedomNeed: "自由需求通过选择空间、变化半径与对新经验的接近速度表现出来。",
  stabilityNeed: "稳定需求通过可预期节律、承诺连续性与资源底座表现出来。",
  creativity: "创造倾向负责重组信息、打开新路径，并对重复方案产生敏锐反应。",
  discipline: "秩序纪律负责把想法压缩为步骤、标准和能够重复交付的结构。",
  riskTolerance: "风险偏好决定你愿意在信息不完整时投入多少资源并承担多大波动。",
  emotionalDepth: "情感深度决定一次互动会留下多少内部信息，以及你需要多长时间消化。",
  introspection: "内省倾向负责回看动机、发现内部矛盾并修正原来的自我解释。",
  socialDrive: "社交驱动负责进入群体、发起互动和让资源在人与人之间流动。",
  ambition: "成就驱动把注意力推向更高目标、影响范围与可被看见的现实成果。",
  adaptability: "适应弹性读取环境反馈并改变方法，但不应替代核心边界。",
};

const DIM_MECHANISM_EN: Record<LifeVectorDim, string> = {
  freedomNeed: "Freedom appears through room for choice, movement, and new experience.",
  stabilityNeed: "Stability appears through predictable rhythm, continuity, and a reliable resource base.",
  creativity: "Creative drive recombines information and opens paths beyond repeated solutions.",
  discipline: "Discipline turns ideas into steps, standards, and repeatable delivery.",
  riskTolerance: "Risk tolerance shapes how much uncertainty and volatility you can carry.",
  emotionalDepth: "Emotional depth shapes how much inner information an interaction leaves behind.",
  introspection: "Introspection reviews motives, detects inner tension, and revises self-explanation.",
  socialDrive: "Social drive initiates contact and moves resources between people.",
  ambition: "Ambition directs attention toward larger goals, influence, and visible outcomes.",
  adaptability: "Adaptability reads feedback and changes method without replacing core boundaries.",
};

function record(value: unknown): UnknownRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? value as UnknownRecord : {};
}

function text(value: unknown, fallback = "未记录"): string {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return fallback;
}

function numberValue(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function rank(vector: LifeVector): LifeVectorDim[] {
  return [...DIMS].sort((a, b) => vector[b] - vector[a] || a.localeCompare(b));
}

function label(dim: LifeVectorDim, lang: Lang): string {
  return lang === "en" ? DIM_LABEL[dim].en : DIM_LABEL[dim].zh;
}

function mechanism(dim: LifeVectorDim, lang: Lang): string {
  return lang === "en" ? DIM_MECHANISM_EN[dim] : DIM_MECHANISM_ZH[dim];
}

function activate(chapter: string, dims: LifeVectorDim[], vector: LifeVector): ActivatedNode[] {
  return dims.map((dim, index) => {
    const band = semanticBand(vector[dim], 13);
    const node: DendriticNode = {
      id: "life-map." + chapter + "." + dim + ".b" + (band.index + 1) + "of13",
      knowledgeVersion: KNOWLEDGE_VERSION,
      product: "life-map",
      chapter,
      kind: index === 0 ? "basic" : "cross",
      priority: 100 - index,
      conditions: { op: "score", dim, min: band.min, max: band.max },
      dimensions: [dim],
      fragments: { judgment: DIM_MECHANISM_ZH[dim] },
      safetyTags: ["agency", "cultural-lens", "non-diagnostic", "non-predictive"],
    };
    return {
      node,
      reason: "score:" + dim + ":" + band.min + "-" + band.max,
      deterministicOrder: index,
    };
  });
}

function evidence(vector: LifeVector, dims: LifeVectorDim[], lang: Lang, extras: EvidenceItem[] = []): EvidenceItem[] {
  return [
    ...dims.map((dim) => ({
      key: dim,
      label: label(dim, lang),
      value: vector[dim],
      source: "calculation" as const,
    })),
    ...extras,
  ];
}

function evidenceLine(vector: LifeVector, dims: LifeVectorDim[], lang: Lang, extra?: string): string {
  const scores = dims.map((dim) => label(dim, lang) + " " + vector[dim]).join(lang === "zh" ? "、" : ", ");
  if (lang === "en") {
    return "Structural evidence: " + scores + (extra ? "; " + extra : "") + ". Scores locate interpretive pathways; they do not rank worth or predict events.";
  }
  return "结构证据：" + scores + (extra ? "；" + extra : "") + "。分数用于定位解释路径，不衡量个人价值，也不预测事件。";
}

function compose(args: {
  key: string;
  vector: LifeVector;
  lang: Lang;
  dims: LifeVectorDim[];
  judgment: string;
  mechanism: string;
  scenario: string;
  shadow: string;
  counter: string;
  action: string;
  narrative?: string;
  extraEvidence?: EvidenceItem[];
  evidenceExtra?: string;
}) {
  return composeDendriticChapter({
    chapter: args.key,
    knowledgeVersion: KNOWLEDGE_VERSION,
    activated: activate(args.key, args.dims, args.vector),
    evidence: evidence(args.vector, args.dims, args.lang, args.extraEvidence),
    slots: {
      judgment: args.judgment,
      evidence: evidenceLine(args.vector, args.dims, args.lang, args.evidenceExtra),
      mechanism: args.mechanism,
      scenario: args.scenario,
      shadow: args.shadow,
      counterevidence: args.counter,
      action: args.action,
      narrative: args.narrative,
    },
  });
}

function planetPlacement(facts: UnknownRecord, key: string, lang: Lang): string {
  const value = record(facts[key]);
  const sign = lang === "en"
    ? text(value.signEn ?? value.sign, "unrecorded")
    : text(value.signZh ?? value.sign, "未记录");
  return sign;
}

function baziDetail(facts: UnknownRecord, key: string): UnknownRecord {
  return record(facts[key]);
}

function pillarSummary(detail: UnknownRecord, fallback: unknown): string {
  return text(detail.ganZhi ?? fallback);
}

function ziweiSummary(facts: UnknownRecord, lang: Lang): string {
  const ziwei = record(facts.ziwei);
  if (Object.keys(ziwei).length === 0) {
    return lang === "en"
      ? "Ziwei data is unavailable because a precise birth hour was not recorded."
      : "未记录精确出生时辰，因此本章不补造紫微星曜，只保留缺失说明。";
  }
  const palaces = Array.isArray(ziwei.palaces) ? ziwei.palaces.map(record) : [];
  const soul = palaces.find((palace) => palace.isSoulPalace === true);
  const body = palaces.find((palace) => palace.isBodyPalace === true);
  const stars = (palace?: UnknownRecord) => {
    const list = Array.isArray(palace?.majorStars) ? palace!.majorStars.map(record) : [];
    return list.length ? list.map((star) => text(star.name)).join("、") : (lang === "en" ? "no recorded major star" : "无已记录主星，需参考对宫");
  };
  return lang === "en"
    ? "Life Palace " + text(ziwei.soulPalaceBranch, "unrecorded") + " (" + stars(soul) + "); Body Palace " + text(ziwei.bodyPalaceBranch, "unrecorded") + " (" + stars(body) + ")."
    : "命宫在" + text(ziwei.soulPalaceBranch) + "（" + stars(soul) + "）；身宫在" + text(ziwei.bodyPalaceBranch) + "（" + stars(body) + "）；" + text(ziwei.fiveElementsClass, "五行局未记录") + "。";
}

function parseNumberEnergy(focus: string): { label: string; total: number }[] {
  const result: { label: string; total: number }[] = [];
  const phone = /手机号数字能量：\S+（总和(\d+)/.exec(focus);
  const plate = /车牌号数字能量：\S+（总和(\d+)/.exec(focus);
  if (phone) result.push({ label: "手机号", total: Number.parseInt(phone[1], 10) });
  if (plate) result.push({ label: "车牌号", total: Number.parseInt(plate[1], 10) });
  return result;
}

export function generateStaticLifeMapReport(input: StaticLifeMapInput): StaticLifeMapReport {
  const lang: Lang = input.lang === "en" ? "en" : "zh";
  const zh = lang === "zh";
  const facts = input.facts;
  const vector = input.vector;
  const ranked = rank(vector);
  const [first, second, third, fourth, fifth] = ranked;
  const conflicts = findConflictsWithFallback(vector);
  const conflict = conflicts[0];
  const wealth = wealthArchetypes(vector, 2);
  const resilience = calculateResilience(vector);
  const romance = calculateRomance(vector, {
    yearPillar: text(facts.yearPillar, ""),
    monthPillar: text(facts.monthPillar, ""),
    dayPillar: text(facts.dayPillar, ""),
    hourPillar: typeof facts.hourPillar === "string" ? facts.hourPillar : null,
  });
  const selfScores = {
    energy: numberValue(input.submission.energy_level, 3),
    clarity: numberValue(input.submission.clarity_level, 3),
    alignment: numberValue(input.submission.alignment_level, 3),
  };
  const focus = text(input.submission.focus, zh ? "未填写特定探索主题" : "No specific focus recorded");
  const currentState = text(input.submission.current_state, zh ? "未填写当前状态" : "No current state recorded");
  const coreType = text(input.submission.core_type_name, zh ? "生命结构待命名" : "Unnamed life structure");
  const numbers = parseNumberEnergy(focus);

  const planets = [
    ["太阳", planetPlacement(facts, "sun", lang) === "未记录" ? text(facts.sunSignZh) : planetPlacement(facts, "sun", lang)],
    ["月亮", planetPlacement(facts, "moon", lang) === "未记录" ? text(facts.moonSignZh) : planetPlacement(facts, "moon", lang)],
    ["水星", planetPlacement(facts, "mercury", lang)],
    ["金星", planetPlacement(facts, "venus", lang)],
    ["火星", planetPlacement(facts, "mars", lang)],
    ["木星", planetPlacement(facts, "jupiter", lang)],
    ["土星", planetPlacement(facts, "saturn", lang)],
  ];
  const planetText = planets.map(([name, value]) => name + " " + value).join("、");

  const year = baziDetail(facts, "yearDetail");
  const month = baziDetail(facts, "monthDetail");
  const day = baziDetail(facts, "dayDetail");
  const hour = baziDetail(facts, "timeDetail");
  const pillars = [
    "年柱 " + pillarSummary(year, facts.yearPillar),
    "月柱 " + pillarSummary(month, facts.monthPillar),
    "日柱 " + pillarSummary(day, facts.dayPillar),
    "时柱 " + (Object.keys(hour).length ? pillarSummary(hour, facts.hourPillar) : "未记录"),
  ].join("、");
  const wx = record(facts.wuXingCount);
  const wxText = "木" + numberValue(wx.wood) + "、火" + numberValue(wx.fire) + "、土" + numberValue(wx.earth) + "、金" + numberValue(wx.metal) + "、水" + numberValue(wx.water);
  const maya = record(facts.maya);
  const ziwei = ziweiSummary(facts, lang);

  const genericCounter = zh
    ? "如果最近三次现实行为没有呈现这一模式，应以直接经验为准，暂时撤销本章假设，而不是让报告覆盖事实。"
    : "If three recent observations do not show this pattern, lived evidence takes priority and this hypothesis should be withdrawn.";

  const chapters = [
    compose({
      key: "01-planets", vector, lang, dims: [first, second, fifth],
      judgment: zh ? "七颗行星不被逐项翻译成七个性格标签。本章只观察它们如何共同支持“" + label(first, lang) + "”，又如何被“" + label(fifth, lang) + "”校准。" : "The seven planets are not translated into seven labels. This chapter reads how they support " + label(first, lang) + " and are calibrated by " + label(fifth, lang) + ".",
      mechanism: (zh ? "星盘记录：" : "Recorded placements: ") + planetText + "。" + mechanism(first, lang) + mechanism(second, lang),
      scenario: zh ? "回看你在陌生任务、亲密互动和重大选择中的第一反应：是先争取空间、建立秩序、理解情绪，还是寻找可见成果。这个第一动作比单独背诵星座关键词更可验证。" : "Compare your first move in unfamiliar work, close connection, and major choice. The repeated action is more testable than isolated sign keywords.",
      shadow: zh ? "当最高维度连续替其他能力工作时，优势会变成单一路径：无论问题需要倾听、等待还是试验，你都先使用最熟悉的解决方式。" : "When the strongest dimension solves every problem, strength becomes a single path regardless of what the situation requires.",
      counter: genericCounter,
      action: zh ? "未来七天记录三次“第一反应”，并在行动前增加一个问题：此刻真正缺少的是更强的" + label(first, lang) + "，还是尚未启动的" + label(fifth, lang) + "？" : "Record three first reactions and ask whether the moment needs more " + label(first, lang) + " or the less-used " + label(fifth, lang) + ".",
      evidenceExtra: planetText,
    }),
    compose({
      key: "02-bazi", vector, lang, dims: [second, fourth, fifth],
      judgment: zh ? "四柱在本报告中是一套传统时间结构语言，不是对人生结果的判决。重点不是逐柱贴标签，而是观察日主、月柱和五行分布共同形成的行动张力。" : "Bazi is used here as a traditional language of time structure, not a verdict. The focus is the interaction between day master, month pillar, and element distribution.",
      mechanism: (zh ? "原始记录：" : "Recorded data: ") + pillars + "；" + wxText + "。" + mechanism(second, lang) + mechanism(fourth, lang),
      scenario: zh ? "当外部要求与内部节律冲突时，观察你是先服从结构、先保护选择权，还是先消化情绪。用最近一次真实决定校验，而不是仅凭出生符号接受结论。" : "When external demand conflicts with inner rhythm, observe whether you first follow structure, protect choice, or process emotion.",
      shadow: zh ? "把传统符号写成固定人格，会忽略成长、环境和选择，也会让文化解释被误读成事实证明。" : "Turning traditional symbols into fixed personality ignores growth, context, and choice.",
      counter: genericCounter,
      action: zh ? "从四柱章节只保留一个可测试命题：下一次压力出现时，记录你最先保护的资源，以及这个动作带来的收益和代价。" : "Keep one testable proposition: under pressure, record the first resource you protect and the benefit and cost.",
      narrative: zh ? "文化说明：四柱、十神、纳音与五行属于传统解释体系，本报告不把它们伪装成统计学或医学结论。" : "Cultural note: pillars, ten gods, Na Yin, and five elements are traditional interpretive systems, not statistical or medical conclusions.",
      evidenceExtra: pillars + "；" + wxText,
    }),
    compose({
      key: "03-ziwei", vector, lang, dims: [first, third],
      judgment: zh ? "紫微章节只使用实际保存的宫位和星曜；没有主星或没有时辰时明确保留空白，不用想象补齐命盘。" : "This chapter uses only recorded palaces and stars. Missing birth-hour or major-star data remains explicitly missing.",
      mechanism: ziwei + mechanism(first, lang) + mechanism(third, lang),
      scenario: zh ? "把命宫理解为常用自我组织方式，把身宫理解为行动逐渐稳定后的落点，再用你近三年的选择检查两者是否真的形成呼应。" : "Treat Life Palace as a common way of organizing self and Body Palace as a maturing action pattern, then test both against three years of choices.",
      shadow: zh ? "风险不在传统系统本身，而在读者为了获得确定答案，把没有记录的星曜、宫位或未来事件自行补全。" : "The risk is filling missing stars, palaces, or events in order to obtain certainty.",
      counter: genericCounter,
      action: zh ? "写下一个“我如何开始”和一个“我最终如何落实”的真实案例；若两者与宫位解释不符，保留事实，放下解释。" : "Write one example of how you begin and one of how you finally implement. Keep the facts if they conflict with the reading.",
      evidenceExtra: ziwei,
    }),
    compose({
      key: "04-origin-palaces", vector, lang, dims: [third, fifth],
      judgment: zh ? "胎元、命宫、身宫被放在一条时间线上阅读：早期底色、核心驱动和逐渐形成的行动方式。它们不是三份重复性格说明。" : "Fetal Origin, Life Palace, and Body Palace are read as a timeline: early tone, core drive, and maturing action.",
      mechanism: (zh ? "记录：" : "Recorded: ") + "胎元 " + text(facts.taiYuan) + "、命宫 " + text(facts.mingGong) + "、身宫 " + text(facts.shenGong) + "。" + mechanism(third, lang) + mechanism(fifth, lang),
      scenario: zh ? "比较十八岁以前、进入成人责任后和最近两年的自己：哪些选择一直没变，哪些能力是在承担后才出现。" : "Compare yourself before adulthood, after taking adult responsibility, and in the last two years.",
      shadow: zh ? "把时间线写成“越往后越好”会制造虚假进步叙事；成熟也可能表现为更会放弃不适合的目标。" : "A timeline should not become a false story that later always means better.",
      counter: genericCounter,
      action: zh ? "列出一项持续至今的底色、一项已经修正的旧策略和一项近年才稳定出现的能力。" : "List one enduring tone, one revised strategy, and one capacity that became stable only recently.",
    }),
    compose({
      key: "05-maya", vector, lang, dims: [first, fifth],
      judgment: zh ? "玛雅印记作为象征语言，用来提出观察问题，而不是证明身份。" : "The Maya imprint is used as symbolic language for inquiry, not proof of identity.",
      mechanism: (zh ? "记录：" : "Recorded: ") + text(maya.tone) + " " + text(maya.sign) + "，" + text(maya.meaning) + "；" + text(maya.toneMeaning) + "。" + mechanism(first, lang),
      scenario: zh ? "观察这个象征最容易在哪类现实行动中被看见：开始、连接、整理、表达或完成。只有出现重复行为，象征才具有个人意义。" : "Observe whether the symbol repeats in starting, connecting, organizing, expressing, or finishing.",
      shadow: zh ? "如果象征只带来悦耳认同，却不能指出具体行为和代价，它就只是装饰性语言。" : "If a symbol creates pleasant recognition without behavior or cost, it remains decorative.",
      counter: genericCounter,
      action: zh ? "选择象征描述中的一个动词，连续七天记录它是否真实出现、由什么触发、造成什么结果。" : "Choose one verb from the symbol and track its trigger and result for seven days.",
    }),
    compose({
      key: "06-cycles", vector, lang, dims: [first, fourth],
      judgment: zh ? "大运章节不预测未来事件，而是把起运年龄与十年尺度当作复盘坐标，检查哪些能力在不同责任阶段被放大。" : "Major cycles are used as review coordinates, not event predictions.",
      mechanism: (zh ? "起运年龄记录约为 " : "Recorded cycle start age: approximately ") + text(facts.daYunStartAge) + (zh ? " 岁。" : ". ") + mechanism(first, lang) + mechanism(fourth, lang),
      scenario: zh ? "把已经经历的十年按学习、工作、关系、迁移与健康节律标记，寻找真实转折发生前后，你的决策方式发生了什么变化。" : "Mark past decades by learning, work, relationship, movement, and health rhythm, then compare decision changes around real transitions.",
      shadow: zh ? "把周期当作事件日历，会让人忽略现实条件，也可能为了符合解释而重写记忆。" : "Treating cycles as an event calendar ignores conditions and can rewrite memory to fit a story.",
      counter: genericCounter,
      action: zh ? "只用已发生事实建立周期档案：每个阶段写一个主要责任、一次真实转折、一项形成的能力和一项付出的代价。" : "Build the cycle archive only from facts: responsibility, transition, capacity, and cost.",
    }),
    compose({
      key: "07-self-assessment", vector, lang, dims: [first, fifth],
      judgment: zh ? "当前自测不是命盘附属品，而是检验长期结构在今天是否可用的即时数据。" : "The current self-assessment tests whether long-term structure is available today.",
      mechanism: (zh ? "当前自评：能量 " : "Current self-ratings: energy ") + selfScores.energy + (zh ? "、清晰 " : ", clarity ") + selfScores.clarity + (zh ? "、对齐 " : ", alignment ") + selfScores.alignment + "。" + mechanism(first, lang),
      scenario: zh ? "如果三项都高，检查这种高分是否经受过真实压力；如果三项都低，区分短期耗竭与长期模式；如果落差很大，优先研究最高项如何掩盖最低项。" : "If all are high, test them under real pressure; if low, separate temporary depletion from long patterns; if uneven, study how the highest may conceal the lowest.",
      shadow: zh ? "自评分数会受当天情绪、社会期待和评分习惯影响，不能单次用于确认固定状态。" : "Self-ratings reflect mood, social expectation, and scoring habits, so one sample cannot confirm a fixed state.",
      counter: zh ? "若连续四周记录稳定且现实功能与评分一致，这组自测的可信度才会明显提高。" : "Confidence rises when four weeks of records align with daily functioning.",
      action: zh ? "未来四周每周同一时间重测一次，并同时记录睡眠、未完成任务和一次边界事件，用行为校准分数。" : "Repeat weekly for four weeks and record sleep, unfinished work, and one boundary event.",
      evidenceExtra: "energy=" + selfScores.energy + ", clarity=" + selfScores.clarity + ", alignment=" + selfScores.alignment,
    }),
    compose({
      key: "08-wealth-career", vector, lang, dims: [first, second, fourth],
      judgment: zh ? "你的财富路径优先匹配“" + wealth[0].labelZh + "”，其次是“" + wealth[1].labelZh + "”。这描述价值创造方式，不承诺收入结果。" : "Your primary value-creation path is " + wealth[0].labelEn + ", supported by " + wealth[1].labelEn + ". This describes method, not income outcome.",
      mechanism: zh ? "匹配度分别为 " + wealth[0].score + " 与 " + wealth[1].score + "。当前探索主题是“" + focus + "”。" + mechanism(first, lang) + mechanism(second, lang) : "Fit scores are " + wealth[0].score + " and " + wealth[1].score + ". Current focus: " + focus + ". " + mechanism(first, lang),
      scenario: zh ? "在最近一次创造价值的经历中，区分你真正解决的问题、使用的核心能力、别人愿意交换的结果，以及无法持续的隐性成本。" : "In one recent value-creation event, separate the problem, core capacity, exchangeable outcome, and hidden cost.",
      shadow: zh ? "把擅长误作商业模式，或把忙碌误作价值，会让能力长期没有进入可重复交换。" : "Mistaking skill for a business model or activity for value prevents repeatable exchange.",
      counter: zh ? "如果现实收入、复购或转介绍长期来自另一种路径，应以市场证据修正类型匹配。" : "If revenue, repeat use, or referral consistently comes from another path, market evidence should revise the type.",
      action: zh ? "为一个真实问题写四行：服务谁、改善什么、如何验证、如何重复。不能回答的部分，就是下一轮最值得补的商业证据。" : "Write who is served, what improves, how it is verified, and how it repeats.",
    }),
    compose({
      key: "09-relationship", vector, lang, dims: [conflict.a, conflict.b, "emotionalDepth"],
      judgment: zh ? "关系章节的核心不是“适合谁”，而是你如何在“" + conflict.labelZh + "”这组张力中发出信号、读取反馈并保护互相性。" : "The core is not who fits, but how you signal, read feedback, and preserve mutuality across " + conflict.labelEn + ".",
      mechanism: mechanism(conflict.a, lang) + mechanism(conflict.b, lang) + (zh ? "当前状态记录为：“" + currentState + "”。" : "Current state: " + currentState + "."),
      scenario: zh ? "回看最近一次靠近、冲突或退出：谁先发起、谁改变节奏、谁说出边界、谁承担修复。关系结构藏在这些双向动作里。" : "Review initiation, pace change, boundary, and repair in one recent connection.",
      shadow: zh ? "最常见的误读，是把自己的投入当作双方承诺，或用理解对方替代对方清楚表达。" : "A common error is treating personal investment as mutual commitment or interpreting instead of receiving clear expression.",
      counter: genericCounter,
      action: zh ? "下一次重要互动只完成三件事：说清一个事实、提出一个可回答请求、允许一个不同答案。" : "State one fact, make one answerable request, and allow a different answer.",
    }),
    compose({
      key: "10-navigation", vector, lang, dims: [first, fifth],
      judgment: zh ? "人生周期导航采用 30、90、365 天三个行动尺度，不预测会发生什么，只规定你如何收集证据和复盘。" : "Navigation uses 30-, 90-, and 365-day action horizons without predicting events.",
      mechanism: mechanism(first, lang) + mechanism(fifth, lang) + (zh ? "短周期负责发现，季度周期负责验证，年度周期负责形成可持续结构。" : "Short horizons discover, quarterly horizons validate, and yearly horizons build sustainable structure."),
      scenario: zh ? "30 天观察" + label(first, lang) + "如何自动启动；90 天训练" + label(fifth, lang) + "在关键节点参与；365 天检查两者是否形成新的协作，而不是互相替代。" : "Observe " + label(first, lang) + " for 30 days, train " + label(fifth, lang) + " for 90 days, and review their collaboration over 365 days.",
      shadow: zh ? "把长期目标写成情绪口号，或把短期波动当成方向错误，都会破坏尺度之间的分工。" : "Turning long goals into slogans or short fluctuations into directional failure breaks the horizon design.",
      counter: zh ? "如果目标没有可观察行为、复盘日期和退出条件，它还不是导航，只是愿望。" : "Without observable behavior, review date, and exit condition, a goal remains a wish.",
      action: zh ? "今天建立三行计划：30 天记录什么、90 天验证什么、365 天保留什么；每行只放一个指标。" : "Create three lines: what to record in 30 days, validate in 90, and retain in 365.",
    }),
    compose({
      key: "11-practice", vector, lang, dims: [fifth, first],
      judgment: zh ? "你的专属练习不追求神秘体验，而是训练在自动反应与选择之间增加一个可用间隔。" : "The practice trains a usable interval between automatic reaction and choice.",
      mechanism: zh ? "当" + label(first, lang) + "快速启动、" + label(fifth, lang) + "尚未参与时，注意力会沿最熟悉路径运行。呼吸用于减速，不用于证明任何超常状态。" : "When " + label(first, lang) + " starts before " + label(fifth, lang) + ", attention follows the most familiar path. Breath is used for pacing, not proof of extraordinary states.",
      scenario: zh ? "在回复重要消息、接受请求或做资源决定前练习三分钟：吸气四拍、停一拍、呼气六拍，共十二轮。" : "Before an important reply or resource decision, inhale for four, pause for one, exhale for six, for twelve rounds.",
      shadow: zh ? "练习不能替代医疗、心理或安全支持；若呼吸引起明显不适，应立即停止并恢复自然呼吸。" : "Practice does not replace medical, psychological, or safety support. Stop if discomfort appears.",
      counter: zh ? "若减速后决定没有变化，也不代表练习失败；它的目标是确认选择，而不是制造不同答案。" : "An unchanged decision does not mean failure; the goal is confirmed choice.",
      action: zh ? "结束后写四个词：事实、感受、推测、请求。只对请求采取下一步行动。" : "Afterward write fact, feeling, interpretation, and request. Act only on the request.",
    }),
    compose({
      key: "12-imprint", vector, lang, dims: [first, second],
      judgment: zh ? "这一章是明确标注的创意叙事，不是真实记忆、历史证明或未来预言。" : "This chapter is explicitly creative narrative, not memory, historical proof, or prediction.",
      mechanism: zh ? "如果把“" + label(first, lang) + "”与“" + label(second, lang) + "”写成一幅象征画面，你像一位在海港整理星图的人：既要让船离岸，也要确保返航坐标仍然存在。" : "As a symbolic image, " + label(first, lang) + " and " + label(second, lang) + " resemble a chart keeper at a harbor, enabling departure while preserving a route home.",
      scenario: zh ? "画面中的工作不是占卜，而是替现实问题换一个观看距离：你正在让什么离岸，又在为哪一种返回保留坐标？" : "The image asks what you are allowing to depart and what route home you are preserving.",
      shadow: zh ? "如果象征故事被当成事实，它会夺走现实证据与个人选择；游戏感必须始终清楚可见。" : "If symbolic story is treated as fact, it displaces evidence and choice.",
      counter: zh ? "这段叙事不需要被证实，也不能用于解释疾病、关系结果、身份或历史经历。" : "This narrative requires no proof and must not explain illness, relationship outcome, identity, or history.",
      action: zh ? "从画面中取一个现实动作：整理一份尚未完成的计划，并同时写清出发条件与返回条件。" : "Take one real action from the image: define both departure and return conditions for an unfinished plan.",
    }),
    compose({
      key: "13-number-energy", vector, lang, dims: [third, fifth],
      judgment: numbers.length
        ? (zh ? "本章读取用户主动提供的号码总和，作为民俗数字象征，不把号码与人格、财富或事件建立因果关系。" : "This chapter reads voluntarily provided number totals as folk symbolism, without causal claims.")
        : (zh ? "（未提供手机号或车牌号，跳过此节）" : "(No phone or plate number was provided; this section is skipped.)"),
      mechanism: numbers.length
        ? (zh ? "已记录：" + numbers.map((item) => item.label + "总和 " + item.total).join("、") + "。这些总和只提供反思提示；真正有意义的是号码使用场景与用户赋予它的现实功能。" : "Recorded totals: " + numbers.map((item) => item.label + " " + item.total).join(", ") + ".")
        : (zh ? "没有原始号码数据，因此不补造数字、灵动数或吉凶说明。" : "No source number exists, so no total or meaning is invented."),
      scenario: numbers.length ? (zh ? "观察你为何选择、保留或关注这个号码，以及它在沟通、出行或身份呈现中承担什么现实功能。" : "Observe why the number is retained and what real function it serves.") : (zh ? "此处保留数据缺失，避免以想象填补个人信息。" : "The missing data remains explicit."),
      shadow: zh ? "将民俗数字解释写成统计结论、投资建议或安全判断，会超出它能支持的范围。" : "Folk number interpretation cannot support statistical, financial, or safety conclusions.",
      counter: zh ? "任何数字联想只要与现实使用经验冲突，就应立即放下；它没有高于事实的解释权。" : "Any association that conflicts with lived use should be discarded.",
      action: numbers.length ? (zh ? "只保留一个有帮助的问题：这个号码提醒我在哪个具体沟通或出行习惯上做一次改进？" : "Keep one useful question about a concrete communication or travel habit.") : (zh ? "若以后主动补充号码，再由确定性计算生成；当前无需采取行动。" : "If data is later provided, calculate then; no action is needed now."),
      evidenceExtra: numbers.length ? numbers.map((item) => item.label + "=" + item.total).join(",") : "no-number-data",
    }),
    compose({
      key: "14-resilience", vector, lang, dims: ["adaptability", "discipline", "emotionalDepth"],
      judgment: zh ? "生命韧性总分为 " + resilience.score + "。这不是“坚强等级”，而是五种恢复资源在当前结构中的组合。" : "Life Resilience is " + resilience.score + ". It is a combination of recovery resources, not a strength ranking.",
      mechanism: zh ? "压力恢复 " + resilience.breakdown.stressRecovery + "、变化适应 " + resilience.breakdown.adaptability + "、危机反弹 " + resilience.breakdown.crisisRebound + "、长期坚持 " + resilience.breakdown.persistence + "、精神稳定 " + resilience.breakdown.emotionalStability + "。最高项是现成支点，最低项决定恢复最容易卡在哪里。" : "Stress recovery " + resilience.breakdown.stressRecovery + ", adaptability " + resilience.breakdown.adaptability + ", rebound " + resilience.breakdown.crisisRebound + ", persistence " + resilience.breakdown.persistence + ", emotional stability " + resilience.breakdown.emotionalStability + ".",
      scenario: zh ? "回看最近一次低谷：你是靠改变环境、维持纪律、寻求连接还是重新解释经历恢复。恢复路径应与最高维度产生对应。" : "Review one setback and identify whether recovery came through changing context, discipline, connection, or reframing.",
      shadow: zh ? "高分可能掩盖恢复代价，低分也不代表缺乏能力；关键是需要多少时间、支持和资源才能回到可用状态。" : "A high score can hide recovery cost, while a low score does not mean absence of capacity.",
      counter: genericCounter,
      action: zh ? "建立个人低谷卡片：最早预警、可立即停止的消耗、一个可靠支点、需要联系的人。低谷出现时按卡片行动，不重新发明方案。" : "Create a setback card with early warning, stoppable drain, reliable support, and a person to contact.",
    }),
    compose({
      key: "15-romance", vector, lang, dims: ["socialDrive", "creativity", "emotionalDepth"],
      judgment: zh ? "桃花磁场指数为 " + romance.score + "，风格为“" + ({ independent: "独立探索型", magnetic: "磁场吸引型", devoted: "深度专一型", gentle: "温和渗透型" }[romance.style]) + "”。它描述吸引如何被感知，不预测脱单或关系结果。" : "Romance Magnetism is " + romance.score + " with style " + romance.style + ". It describes how attraction is perceived, not relationship outcomes.",
      mechanism: zh ? "存在感 " + romance.breakdown.socialDrive + "、表达力 " + romance.breakdown.creativity + "、开放度 " + romance.breakdown.adaptability + "、自信场 " + romance.breakdown.ambition + "、共振力 " + romance.breakdown.emotionalDepth + "。五项共同决定信号、节奏与深度。" : "Presence " + romance.breakdown.socialDrive + ", expression " + romance.breakdown.creativity + ", openness " + romance.breakdown.adaptability + ", self-assurance " + romance.breakdown.ambition + ", resonance " + romance.breakdown.emotionalDepth + ".",
      scenario: zh ? "在最近一次新连接中，观察别人首先看见的是你的在场、表达、适应、方向还是情绪理解；再检查对方是否也提供了同等清楚的信号。" : "In one new connection, observe which signal appeared first and whether the other person offered equal clarity.",
      shadow: zh ? "互动热度不能替代彼此了解，深度感受不能替代事实，主动表达也不能替代对方同意。" : "Intensity cannot replace knowing, feeling cannot replace fact, and initiative cannot replace consent.",
      counter: genericCounter,
      action: zh ? "下一次只发出一个清楚信号，等待完整回应周期；明确拒绝后停止，模糊回应只澄清一次。" : "Send one clear signal, wait one full response cycle, stop after refusal, and clarify ambiguity only once.",
      narrative: zh
        ? (romance.taoHua.hasTaoHua ? "传统桃花标记出现在" + romance.taoHua.foundIn.join("、") + "。它只作为文化观察镜头，不构成事件预言。" : "未命中传统桃花标记不表示吸引力不足；报告以可观察的五维互动结构为核心。")
        : "Traditional peach-blossom symbolism is treated only as a cultural lens.",
    }),
  ];

  const traces: ChapterTrace[] = chapters.map((chapter) => chapter.trace);
  const joinedReport = chapters
    .map((chapter, index) => "===" + (index + 1) + "===\n" + chapter.text)
    .join("\n\n");
  const fullReport = zh ? stampClassicalReport(joinedReport) : joinedReport;

  return {
    fullReport,
    traces,
    activatedNodeIds: traces.flatMap((trace) => trace.activatedNodeIds),
    knowledgeVersion: KNOWLEDGE_VERSION,
    resilience,
    romance,
  };
}
