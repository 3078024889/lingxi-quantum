import { composeDendriticChapter, semanticBand, type ActivatedNode, type ChapterTrace, type DendriticNode, type EvidenceItem } from "@/lib/dendritic-engine";
import { stampClassicalReport } from "@/lib/classical-editorial";
import type { LifeVector } from "@/lib/life-vector";
import type { ElementRelation, MoonPhaseKey, NextTidePeak, RetrogradeInfo, TideTrajectory, TodayTransit } from "@/lib/daily-transit";

export const DAILY_TIDE_KNOWLEDGE_VERSION = "daily-tide-2026.08.2-classical";
type Lang = "zh" | "en";
type Scores = Record<string, number>;

export type DailyTideKnowledgeInput = {
  lang: Lang; seed: string; generatedDate: string; sunSignZh: string; sunSignEn: string;
  dayMasterElement: string; vector: LifeVector; transit: TodayTransit; relation: ElementRelation;
  retrogrades: RetrogradeInfo; ruler: { zh: string; en: string }; tide: number;
  nextTurningPoint: NextTidePeak;
  trajectories: { day7: TideTrajectory; day30: TideTrajectory; day90: TideTrajectory };
};

export type StaticDailyTideReport = {
  fullReport: string; traces: ChapterTrace[]; activatedNodeIds: string[];
  knowledgeVersion: string; scores: Scores;
};

const PHASE: Record<MoonPhaseKey, { zh: string; en: string }> = {
  new: { zh: "命名与播种", en: "naming and seeding" },
  waxingCrescent: { zh: "试探与续接", en: "testing and continuing" },
  firstQuarter: { zh: "选择与校准", en: "choosing and calibrating" },
  waxingGibbous: { zh: "精修与聚焦", en: "refining and focusing" },
  full: { zh: "看见与释放", en: "seeing and releasing" },
  waningGibbous: { zh: "消化与传递", en: "integrating and sharing" },
  lastQuarter: { zh: "取舍与收束", en: "editing and closing" },
  waningCrescent: { zh: "清空与恢复", en: "clearing and recovering" },
};

const ELEMENT_ACTION: Record<string, string> = {
  wood: "先扩展选项，再选一条能持续生长的路径",
  fire: "把热量集中在一个可见动作，而不是同时点燃多处",
  earth: "把抽象愿望落到顺序、边界与可交付物",
  metal: "删去噪音，定义标准，再作出清晰选择",
  water: "先读取信息与情绪流向，再从最小阻力处进入",
};

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
const relationScore = (r: ElementRelation) => r === "resonant" ? 82 : r === "flowing" ? 68 : 38;
const phaseScore = (p: MoonPhaseKey) => ({
  new: 54, waxingCrescent: 66, firstQuarter: 74, waxingGibbous: 84,
  full: 92, waningGibbous: 70, lastQuarter: 48, waningCrescent: 30,
})[p];

export function buildDailyTideScores(input: DailyTideKnowledgeInput): Scores {
  const v = input.vector, phase = phaseScore(input.transit.moonPhaseKey);
  const retroLoad = Math.min(18, input.retrogrades.length * 6);
  return {
    tideAmplitude: clamp(input.tide),
    actionReadiness: clamp(v.discipline * .34 + v.riskTolerance * .28 + phase * .22 + input.tide * .16),
    creativeFlow: clamp(v.creativity * .44 + v.adaptability * .2 + phase * .24 + input.tide * .12),
    connectionFlow: clamp(v.socialDrive * .36 + v.emotionalDepth * .24 + relationScore(input.relation) * .28 + input.tide * .12),
    valueDiscernment: clamp(v.ambition * .28 + v.discipline * .34 + v.introspection * .2 + phase * .18),
    inwardPull: clamp(v.introspection * .38 + v.emotionalDepth * .3 + (100 - phase) * .18 + retroLoad),
    adaptation: clamp(v.adaptability), structure: clamp(v.discipline),
  };
}

const LABELS: Record<string, { zh: string; en: string }> = {
  tideAmplitude: { zh: "日月排列潮汐指数", en: "lunar-solar tide index" },
  actionReadiness: { zh: "行动准备度", en: "action readiness" },
  creativeFlow: { zh: "创造流动度", en: "creative flow" },
  connectionFlow: { zh: "关系连接度", en: "connection flow" },
  valueDiscernment: { zh: "价值辨识度", en: "value discernment" },
  inwardPull: { zh: "向内牵引度", en: "inward pull" },
  adaptation: { zh: "适应弹性", en: "adaptability" },
  structure: { zh: "结构承载度", en: "structural capacity" },
};
const label = (key: string, lang: Lang) => LABELS[key]?.[lang] ?? key;

function trajectory(t: TideTrajectory, lang: Lang): string {
  return lang === "zh"
    ? `${t.days}日窗口从${t.start}走到${t.end}，区间${t.min}–${t.max}，均值${t.average}，上行${t.risingDays}日、下行${t.fallingDays}日、转换${t.turningPoints}次`
    : `${t.days}-day window ${t.start} to ${t.end}, range ${t.min}-${t.max}, average ${t.average}, ${t.turningPoints} turns`;
}

function activate(chapter: string, keys: string[], scores: Scores, contexts: string[]): ActivatedNode[] {
  const bands = keys.map((key, i) => {
    const band = semanticBand(scores[key], 13);
    const node: DendriticNode = {
      id: `daily-tide.${chapter}.${key}.b${band.index + 1}of13`,
      knowledgeVersion: DAILY_TIDE_KNOWLEDGE_VERSION, product: "daily-tide", chapter,
      kind: "basic", priority: 100 - i,
      conditions: { op: "score", dim: key, min: band.min, max: band.max },
      dimensions: [key], fragments: { mechanism: `${key}:${band.min}-${band.max}` },
      safetyTags: ["agency", "counterevidence", "non-predictive"],
    };
    return { node, reason: `score:${key}:${band.min}-${band.max}`, deterministicOrder: i };
  });
  return bands.concat(contexts.map((context, i) => {
    const node: DendriticNode = {
      id: `daily-tide.${chapter}.context.${context}`,
      knowledgeVersion: DAILY_TIDE_KNOWLEDGE_VERSION, product: "daily-tide", chapter,
      kind: "context", priority: 80 - i,
      conditions: { op: "context", key: "dailyContext", value: context },
      dimensions: [], fragments: { judgment: context }, safetyTags: ["symbolic", "uncertainty-boundary"],
    };
    return { node, reason: `context:${context}`, deterministicOrder: keys.length + i };
  }));
}

function evidence(input: DailyTideKnowledgeInput, keys: string[], scores: Scores): EvidenceItem[] {
  return [
    { key: "date", label: input.lang === "zh" ? "快照日期" : "snapshot date", value: input.generatedDate, source: "fact" },
    { key: "phase", label: input.lang === "zh" ? "月相" : "moon phase", value: input.lang === "zh" ? input.transit.moonPhaseZh : input.transit.moonPhaseEn, source: "calculation" },
    ...keys.map(key => ({ key, label: label(key, input.lang), value: scores[key], source: "calculation" as const })),
  ];
}

function evidenceLine(input: DailyTideKnowledgeInput, keys: string[], scores: Scores): string {
  const values = keys.map(key => `${label(key, input.lang)} ${scores[key]}`).join(input.lang === "zh" ? "、" : ", ");
  return input.lang === "zh"
    ? `结构证据：快照日${input.generatedDate}，${input.transit.moonPhaseZh}，月亮位于${input.transit.moonSignZh}，${values}。天文位置与指数可复算；个人意义属于解释框架，不是对事件、健康或收益的预测。`
    : `Structural evidence: snapshot ${input.generatedDate}, ${input.transit.moonPhaseEn}, Moon in ${input.transit.moonSignEn}, ${values}. Positions and indices are reproducible; personal meaning is interpretive, not a prediction of events, health, or returns.`;
}

type Spec = {
  key: string; keys: string[]; contexts: string[]; judgment: string; mechanism: string;
  scenario: string; shadow: string; counter: string; action: string; narrative?: string;
};

function compose(input: DailyTideKnowledgeInput, scores: Scores, spec: Spec) {
  return composeDendriticChapter({
    chapter: spec.key, knowledgeVersion: DAILY_TIDE_KNOWLEDGE_VERSION,
    activated: activate(spec.key, spec.keys, scores, spec.contexts),
    evidence: evidence(input, spec.keys, scores),
    slots: {
      judgment: spec.judgment, evidence: evidenceLine(input, spec.keys, scores),
      mechanism: spec.mechanism, scenario: spec.scenario, shadow: spec.shadow,
      counterevidence: spec.counter, action: spec.action, narrative: spec.narrative,
    },
  });
}

function zhSpecs(i: DailyTideKnowledgeInput, s: Scores): Spec[] {
  const phase = PHASE[i.transit.moonPhaseKey].zh;
  const relation = i.relation === "resonant" ? "同元素共振" : i.relation === "flowing" ? "相生流动" : "异质摩擦";
  const retro = i.retrogrades.length ? i.retrogrades.map(x => x.planetZh).join("、") + "呈逆行视运动" : "三颗观察行星均未呈逆行视运动";
  const turn = `${i.nextTurningPoint.daysAway}日后抵达${i.nextTurningPoint.kind === "spring" ? "排列高点" : "排列低点"}`;
  return [
    { key:"overview", keys:["tideAmplitude","adaptation"], contexts:[i.transit.moonPhaseKey,i.relation],
      judgment:`今天不是好坏判决，而是一张节奏剖面：日月排列潮汐指数${s.tideAmplitude}，适应弹性${s.adaptation}。当前更适合以“${phase}”为主轴，把注意力从猜测结果转向选择动作。`,
      mechanism:"指数描述日月相对排列的周期位置，不等于所在地真实潮位。外部节律给出观察振幅，长期生命向量决定怎样承接；二者相遇形成的是待验证假设。",
      scenario:"把今天事项分成必须推进、适合观察、可以放下三栏。指数较高时减少并行目标，指数较低时减少强推，用节奏管理替代运势焦虑。",
      shadow:"阴影是把指数误读成命令：高分就冒进，低分就停摆。任何指数都不能替代现实信息、身体反馈和专业判断。",
      counter:"反证问题：如果睡眠、截止日期或现实资源与建议冲突，哪项证据更强？以现实证据为先。",
      action:"写下一件最重要的事、一个最小可逆动作和一个停止条件；十分钟后只根据新增证据决定是否继续。" },
    { key:"action", keys:["actionReadiness","structure"], contexts:[i.ruler.en.toLowerCase()],
      judgment:`行动准备度${s.actionReadiness}，结构承载度${s.structure}。重点不是做更多，而是让第一步与承载能力匹配；日主路径是：${ELEMENT_ACTION[i.dayMasterElement] ?? "先辨认最重要的一件事，再用可逆小步验证"}。`,
      mechanism:"行动准备度由纪律、风险承受、月相动量与排列指数共同形成，衡量启动速度和结构保护之间的配比，不是能力排名。",
      scenario:"面对沟通、提交或决定，先定义可交付的最小版本，再限定复核时间。准备度高时保护边界，准备度低时缩小动作。",
      shadow:"高准备度的阴影是把速度当成正确；低准备度的阴影是把迟疑包装成等待。两者都会脱离反馈。",
      counter:"反证问题：过去三次类似任务真正推动结果的是快速开始、充分准备，还是及时求助？采用自己的有效证据。",
      action:"如果开始前反复权衡，就先做十五分钟可撤销且能产生信息的动作；若已连续推进九十分钟，停五分钟检查目标是否漂移。" },
    { key:"creation", keys:["creativeFlow","adaptation"], contexts:[i.transit.moonPhaseKey,i.dayMasterElement],
      judgment:`创造流动度${s.creativeFlow}，适应弹性${s.adaptation}。${i.transit.moonPhaseZh}支持“${phase}”：让已有素材重新排列，形成更清楚的表达。`,
      mechanism:"创造流动由原创倾向、适应能力、月相阶段与排列振幅组成。高值适合发散后收束，低值适合编辑、归档和恢复输入。",
      scenario:"先生成三个方向，再用是否解决真实问题、是否能在现有资源内完成筛掉两个。灵感经过约束才会成为价值。",
      shadow:"阴影是把新鲜感误作洞察，或把暂时没有灵感误作能力下降。创造并不要求每天高产。",
      counter:"反证问题：换掉月相标签，只看素材、时间和用户反馈，今天最值得推进的仍是哪一项？",
      action:"设置二十五分钟创造窗：十分钟不评判地产出，十分钟保留一个核心，五分钟写下交付标准。" },
    { key:"relationship", keys:["connectionFlow","inwardPull"], contexts:[i.relation],
      judgment:`关系连接度${s.connectionFlow}，向内牵引度${s.inwardPull}；月亮元素与你的太阳元素呈${relation}。课题不是猜对方，而是补足表达、倾听或边界。`,
      mechanism:"连接度结合社交驱动、情感深度、元素关系与排列振幅；它描述互动手感，不证明两个人合不合。",
      scenario:"若对话摩擦，把评价句改为观察句：先说事实，再说感受与请求。若互动顺畅，也要确认共识。",
      shadow:"共振时容易过度投射，摩擦时容易过早防御，两者都可能用自己的解释覆盖对方。",
      counter:"反证问题：对方有哪些明确语言或行为不支持你的判断？至少寻找一条反向证据。",
      action:"完成一次事实—感受—需要—请求四句沟通，请求必须具体，也必须允许对方说不。" },
    { key:"value", keys:["valueDiscernment","structure"], contexts:[i.transit.moonPhaseKey],
      judgment:`价值辨识度${s.valueDiscernment}，结构承载度${s.structure}。这不是财富涨跌预测，而是检查资源是否流向重要、可持续并能验证的事项。`,
      mechanism:"价值辨识由目标驱动、纪律、内省和月相动量组成，衡量安排资源的准备度，不是收入或投资回报指数。",
      scenario:"把机会拆成预期价值、最坏代价、退出条件和下一条证据。没有退出条件的热情容易变成沉没成本。",
      shadow:"高辨识度时可能过度确信，低辨识度时可能把所有机会都留着；前者忽略未知，后者消耗注意力。",
      counter:"反证问题：若机会没有限时、稀缺、别人都在做的包装，你仍愿意投入吗？",
      action:"只审计一项资源流动：记录投入、证据、继续条件与退出日期；金融决策以持牌意见和可承受损失为准。" },
    { key:"inner", keys:["inwardPull","tideAmplitude"], contexts:[String(i.retrogrades.length)],
      judgment:`向内牵引度${s.inwardPull}，排列指数${s.tideAmplitude}；${retro}。这组结构适合观察认知负荷，而不是把每次迟疑解释成宇宙信号。`,
      mechanism:"向内牵引由内省、情感深度、月相动量和逆行语境构成。逆行是地球视角的视运动，不会直接造成情绪或设备故障。",
      scenario:"把未完成事项外化到纸面，标注今天处理、等待信息、明确放弃，让大脑不再替清单保管提醒。",
      shadow:"阴影是把正常疲劳神秘化，或因不确定反复寻求更多解读；追求绝对确定会延迟决定。",
      counter:"反证问题：睡眠、饮食、工作量、身体不适或人际事件，是否已经足以解释当前状态？",
      action:"做三分钟状态审计：身体感受、主要情绪、脑中任务和一个可控变量；持续痛苦或功能受损时寻求专业支持。" },
    { key:"day7", keys:["adaptation","actionReadiness"], contexts:["7d"],
      judgment:`未来七日不是直线：${trajectory(i.trajectories.day7,"zh")}。适应弹性${s.adaptation}决定能否随振幅调整方法，而非固守今天结论。`,
      mechanism:"七日轨迹逐日重算月相角度并统计区间、均值与方向转换；它描述天文周期代理，不预测七天内个人事件。",
      scenario:"把一周分成启动、推进、复核三个节点。靠近高点时压缩目标，靠近低点时整理系统和恢复输入。",
      shadow:"只看第七天会忽略中途转折，只看最高值会忽略恢复成本。周期价值来自整体路径。",
      counter:"反证问题：哪些固定日程、他人承诺与截止日期不会随潮汐改变？先固定硬约束。",
      action:"设置三次两分钟复盘：我预期什么、实际发生什么、下一步调整什么，用自己的记录校准报告。" },
    { key:"day30", keys:["structure","adaptation"], contexts:["30d",i.nextTurningPoint.kind],
      judgment:`未来三十日呈多个涨落段：${trajectory(i.trajectories.day30,"zh")}；最近转折为${turn}。重点不是最旺一天，而是跨周期结构。`,
      mechanism:"三十日覆盖约一个朔望周期，适合观察开始、增长、显现和收束。结构承载与适应弹性共同决定计划能否稳定又可调整。",
      scenario:"为月度目标定义启动证据、中段检查、完成标准与退出条件。每周只改一次策略，避免因单日感受频繁重置。",
      shadow:"阴影是用周期为拖延辩护，或等待高点才开始。任何一天都可以采取与资源匹配的小步。",
      counter:"反证问题：若未来曲线完全相反，你仍会保留哪些计划？这些行动应成为主干。",
      action:"写下四周协议：每周一个可见产出、一个反馈来源、一个恢复安排，到期只依据证据复盘。" },
    { key:"day90", keys:["adaptation","valueDiscernment"], contexts:["90d"],
      judgment:`九十日包含多个完整循环：${trajectory(i.trajectories.day90,"zh")}。长期判断不能由单日指数承担，值得观察的是跨周期重复的决策模式。`,
      mechanism:"时间尺度拉长后指数自然往复；可积累的不是运气，而是在启动、压力、反馈和恢复阶段形成的调节能力。",
      scenario:"把九十天目标拆成三个三十天实验：建立基线、调整方法、巩固有效结构，每段只验证一个关键假设。",
      shadow:"阴影是愿景宏大却无法检验，或用每天不同感受不断改变成功标准。",
      counter:"反证问题：三个月后什么可观察结果会证明方向无效？提前写下，保护自己免于沉没成本。",
      action:"建立九十日证据账本：每周记录产出、体验和代价指标；连续三周无进展时调整策略而非责备自己。" },
    { key:"practice", keys:["actionReadiness","inwardPull"], contexts:[i.transit.moonPhaseKey],
      judgment:`今日实践要把不确定性转化为可执行选择。行动准备度${s.actionReadiness}与向内牵引度${s.inwardPull}提示你在向外验证和向内澄清间搭桥。`,
      mechanism:"有效实践把触发线索与具体反应连接，并在行动后留下反馈；它不是重复积极句，也不要求相信报告。",
      scenario:"选一个真实触发点，例如进入会议、打开工作软件或准备消费，提前规定最小反应。",
      shadow:"阴影是把练习做成新的完美要求，漏做一次就放弃。目标是降低行动摩擦，不是证明自律。",
      counter:"反证问题：练习是否增加负担、羞耻或依赖？若是，缩小到两分钟或改用更直接支持。",
      action:"如果我在关键事项前反复寻找更多确定性，那么先写下现有证据、未知项和一个十分钟可逆动作，之后只根据反馈决定下一步。" },
    { key:"summary", keys:["tideAmplitude","actionReadiness","valueDiscernment"], contexts:[i.transit.moonPhaseKey,"summary"],
      judgment:`快照主线：排列指数${s.tideAmplitude}，行动准备度${s.actionReadiness}，价值辨识度${s.valueDiscernment}。它们指向注意力、动作与恢复的分配，不提供命运答案。`,
      mechanism:"天文数据提供日期坐标，生命向量提供长期倾向，树突节点把两者编排成可检验假设；每句都应能回答依据、反证与行动。",
      scenario:"再次打开报告时，不先问准不准，而看执行了哪项协议、获得什么反馈、哪个判断被现实推翻。",
      shadow:"最终风险是把辅助观察工具变成决定权来源。灵犀场不替你选择，也不诱导每天购买或依赖解释。",
      counter:"总反证：若今天最有效的行动与报告不同，记录差异并选择有效行动；直接经验、现实责任和专业意见优先。",
      action:"保留一个要推进的动作、一个要停止的消耗、一个今晚复盘的问题；明天只带走经过现实验证的部分。",
      narrative:"潮汐提供节奏，不提供命令；你看见水位、校准船身，也保有决定航向的主权。" },
  ];
}

function enSpecs(i: DailyTideKnowledgeInput, s: Scores): Spec[] {
  const zh = zhSpecs(i, s);
  const judgments = [
    `This is a rhythm profile, not a verdict: tide index ${s.tideAmplitude}, adaptability ${s.adaptation}, phase theme ${PHASE[i.transit.moonPhaseKey].en}.`,
    `Action readiness is ${s.actionReadiness} and structural capacity ${s.structure}; match the first move to present capacity.`,
    `Creative flow is ${s.creativeFlow}, with adaptability ${s.adaptation}; rearrange existing material before seeking novelty.`,
    `Connection flow is ${s.connectionFlow} and inward pull ${s.inwardPull}; improve expression, listening, or boundaries without guessing another mind.`,
    `Value discernment is ${s.valueDiscernment}; this is a resource audit, not a money or investment forecast.`,
    `Inward pull is ${s.inwardPull}; apparent retrograde motion does not cause emotions, failures, or events.`,
    `The next seven days form a path: ${trajectory(i.trajectories.day7,"en")}.`,
    `The thirty-day window covers a fuller cycle: ${trajectory(i.trajectories.day30,"en")}.`,
    `The ninety-day window contains repeated cycles: ${trajectory(i.trajectories.day90,"en")}.`,
    `Today's practice bridges action readiness ${s.actionReadiness} and inward pull ${s.inwardPull} through one testable choice.`,
    `Snapshot: tide index ${s.tideAmplitude}, action readiness ${s.actionReadiness}, value discernment ${s.valueDiscernment}.`,
  ];
  return zh.map((x,n) => ({ ...x, judgment: judgments[n],
    mechanism:"Astronomical positions provide a reproducible date coordinate; the life vector provides stable personal input. Their combination is interpretive and open to correction.",
    scenario:"Choose one current task or conversation. Define the smallest reversible move, the evidence it should produce, and the condition that would make you stop.",
    shadow:"The shadow is turning an index into certainty, using a label to avoid action, or treating a strong feeling as proof.",
    counter:"Counterevidence: identify one fact that does not support this reading. Follow sleep, deadlines, resources, consent, health, and qualified advice when they conflict.",
    action:n===9 ? "If I seek more certainty before a key task, then I will list known facts, unknowns, and one reversible ten-minute action; feedback decides the next step." : "Take one reversible step, record what happened, and review it at a fixed time. Keep only what your evidence supports.",
    narrative:n===10 ? "The tide offers rhythm, not commands. You remain the observer, navigator, and owner of the decision." : undefined,
  }));
}

export function generateStaticDailyTideReport(input: DailyTideKnowledgeInput): StaticDailyTideReport {
  const scores = buildDailyTideScores(input);
  const specs = input.lang === "zh" ? zhSpecs(input, scores) : enSpecs(input, scores);
  const chapters = specs.map(spec => compose(input, scores, spec));
  if (chapters.length !== 11) throw new Error("Daily Tide must produce exactly 11 chapters.");
  const traces = chapters.map(x => x.trace);
  return {
    fullReport: input.lang === "zh"
      ? stampClassicalReport(chapters.map(x => x.text).join("\n\n===SECTION===\n\n"))
      : chapters.map(x => x.text).join("\n\n===SECTION===\n\n"),
    traces, activatedNodeIds: traces.flatMap(x => x.activatedNodeIds),
    knowledgeVersion: DAILY_TIDE_KNOWLEDGE_VERSION, scores,
  };
}

export function generateDailyTidePreview(input: {
  lang: Lang; generatedDate: string; transit: TodayTransit; relation: ElementRelation;
  tide: number; nextTurningPoint: NextTidePeak;
}): string {
  const phase = PHASE[input.transit.moonPhaseKey][input.lang];
  const relation = input.relation === "resonant"
    ? (input.lang === "zh" ? "同元素共振" : "same-element resonance")
    : input.relation === "flowing" ? (input.lang === "zh" ? "相生流动" : "supportive flow")
    : (input.lang === "zh" ? "异质摩擦" : "elemental friction");
  return input.lang === "zh"
    ? `${input.generatedDate}的日月排列潮汐指数为${input.tide}/100，月亮位于${input.transit.moonSignZh}，处于${input.transit.moonPhaseZh}，形成${relation}。今天可把“${phase}”作为观察主轴：先选一件现实中最重要的事，定义十分钟可逆动作与停止条件，再用结果决定是否继续。${input.nextTurningPoint.daysAway}日后抵达下一处${input.nextTurningPoint.kind === "spring" ? "排列高点" : "排列低点"}。这是可复算的日月周期，不是个人事件预言或所在地真实潮位；若睡眠、截止日期或资源与建议冲突，以现实证据为先。`
    : `On ${input.generatedDate}, the lunar-solar tide index is ${input.tide}/100, with the Moon in ${input.transit.moonSignEn} during the ${input.transit.moonPhaseEn}, forming ${relation}. Use ${phase} as a reflection lens: choose one real priority, define a reversible ten-minute action and a stop condition, then let feedback determine the next step. The next alignment turning point is in ${input.nextTurningPoint.daysAway} days. This is a reproducible cycle, not a prediction of personal events or local sea level; follow stronger real-world evidence when it conflicts.`;
}
