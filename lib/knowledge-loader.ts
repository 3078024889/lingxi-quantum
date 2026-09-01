import {
  DIM_LABEL,
  topTraits,
  type LifeVector,
  type LifeVectorDim,
  type ResonancePoint,
} from "@/lib/life-vector";
import { composeDendriticChapter, semanticBand } from "@/lib/dendritic-engine";
import {
  activateRelationshipProtocols,
  mergeRelationshipProtocols,
} from "@/lib/relationship-dendrites";

type Lang = "zh" | "en";
type RelationshipType = "romantic" | "business" | "general";

type ResonanceResult = {
  resonant: ResonancePoint[];
  complementary: { pairA: ResonancePoint; pairB: ResonancePoint; labelZh: string; labelEn: string }[];
  friction: { pairA: ResonancePoint; pairB: ResonancePoint; labelZh: string; labelEn: string }[];
};

export type RelationshipReportInput = {
  nameA: string;
  nameB: string;
  vectorA: LifeVector;
  vectorB: LifeVector;
  resonance: ResonanceResult;
  relationshipType?: string;
  lang?: Lang;
};

type Cell = {
  essence: string;
  gift: string;
  shadow: string;
  action: string;
  essenceEn: string;
  giftEn: string;
  shadowEn: string;
  actionEn: string;
};

// Editorially reviewed dendritic cells. Runtime only selects and crosses them.
const CELLS: Record<LifeVectorDim, Cell> = {
  freedomNeed: {
    essence: "通过选择权、移动空间和独立判断保持生命力；越被催促表态，越需要先确认自己的主权仍在",
    gift: "为关系打开新的可能，不让连接在习惯里失去空气",
    shadow: "把靠近误读成限制，把协商体验成被管理",
    action: "把需要的空间说成明确的时间范围，并约定何时重新连接",
    essenceEn: "stays alive through choice, movement, and independent judgment",
    giftEn: "opens possibilities and keeps the bond from becoming inert",
    shadowEn: "can misread closeness as restriction and coordination as control",
    actionEn: "name the space needed as a time window and agree when to reconnect",
  },
  stabilityNeed: {
    essence: "通过持续回应、明确承诺和可预期节奏建立安全；变化并不可怕，毫无交代的变化才真正消耗信任",
    gift: "给关系一块能够长期承重的地基",
    shadow: "在不确定里反复确认，让确认本身成为双方的负担",
    action: "用固定的周度校准代替临时追问，一次说清变化、责任和下一步",
    essenceEn: "builds safety through continuity, explicit commitment, and predictable rhythm",
    giftEn: "gives the bond a foundation that can carry weight over time",
    shadowEn: "can seek reassurance until reassurance itself becomes a burden",
    actionEn: "replace ad-hoc checking with a weekly alignment on change, ownership, and next steps",
  },
  creativity: {
    essence: "从尚未存在的可能性出发，先看见新的组合，再寻找实现路径",
    gift: "把僵局改写成第三种选择",
    shadow: "持续开启新方向，却低估收尾、维护和重复工作的重量",
    action: "每开启一个方向，先写下它替代什么、由谁收尾、何时复盘",
    essenceEn: "starts from possibilities that do not yet exist",
    giftEn: "turns deadlock into a third option",
    shadowEn: "can open new directions while underestimating closure and maintenance",
    actionEn: "for every new direction, state what it replaces, who closes it, and when it is reviewed",
  },
  discipline: {
    essence: "把兑现、次序和边界视为信任的证据；一件事能否持续，比一时表达得多热烈更重要",
    gift: "把共同愿望变成日历、分工和可以复用的秩序",
    shadow: "把个人标准默认为共同标准，失望时先纠正对方而不是解释期待",
    action: "把要求分成不可协商、可以试行、纯属偏好三类",
    essenceEn: "treats delivery, sequence, and boundaries as evidence of trust",
    giftEn: "turns intention into calendars, ownership, and reusable order",
    shadowEn: "can treat personal standards as shared standards",
    actionEn: "separate non-negotiables, experiments, and preferences",
  },
  riskTolerance: {
    essence: "通过行动获得信息，愿意在证据尚不完整时先迈出一步",
    gift: "在停滞时提供启动能量和突破窗口",
    shadow: "把速度当成信心，把对方的谨慎误读成不支持",
    action: "为重大决定设置可逆试验、损失上限和冷静期",
    essenceEn: "learns through action and can move before all evidence is available",
    giftEn: "provides ignition when the pair is stuck",
    shadowEn: "can confuse speed with confidence and caution with lack of support",
    actionEn: "use reversible trials, loss limits, and cooling periods",
  },
  emotionalDepth: {
    essence: "会接收语气、停顿和未说出口的信息；情绪不是附属内容，而是判断关系状态的重要数据",
    gift: "看见表面事件下面真正需要被回应的部分",
    shadow: "在信息不足时用感受补全答案，把短暂沉默扩写成关系结论",
    action: "先区分事实、感受、推测和请求，再进入深度对话",
    essenceEn: "reads tone, pauses, and what remains unsaid",
    giftEn: "sees what actually needs response beneath the surface event",
    shadowEn: "can fill missing information with feeling and turn a pause into a verdict",
    actionEn: "separate fact, feeling, interpretation, and request",
  },
  introspection: {
    essence: "遇到复杂问题先向内整理，形成完整理解后才愿意表达",
    gift: "让关系拥有反思能力，不被当下反应牵着走",
    shadow: "内部处理过久，让对方只能面对沉默并自行猜测",
    action: "尚未想清时也先说明：我听见了、我需要多久、我何时回来谈",
    essenceEn: "processes complexity inwardly before speaking",
    giftEn: "gives the bond reflective capacity beyond immediate reaction",
    shadowEn: "can process so long that the other person is left guessing",
    actionEn: "before clarity, state what was heard, how long is needed, and when the talk resumes",
  },
  socialDrive: {
    essence: "通过交流、共同经历和外部连接获得能量，关系需要在真实世界里流动",
    gift: "带来资源、见证者和更大的生活半径",
    shadow: "用更多交流覆盖真正困难的话题，热闹很多，核心问题仍未被触碰",
    action: "外部活动之后保留一次两人内部复盘，确认外界声音没有取代共同判断",
    essenceEn: "gains energy through exchange, shared experience, and outward connection",
    giftEn: "brings resources and a wider radius of life",
    shadowEn: "can cover the difficult conversation with more interaction",
    actionEn: "after outward activity, hold a private debrief",
  },
  ambition: {
    essence: "需要看见成长、影响和阶段成果；停滞会比辛苦更快消耗投入感",
    gift: "让关系不只维持，还能共同完成有分量的事情",
    shadow: "用成果衡量连接，把休息、脆弱或缓慢当作效率下降",
    action: "分别定义成果指标与关系健康指标，任何一项连续下降都暂停校准",
    essenceEn: "needs growth, impact, and visible milestones",
    giftEn: "helps the bond create something consequential",
    shadowEn: "can measure connection through output",
    actionEn: "define outcome and relationship-health measures separately",
  },
  adaptability: {
    essence: "快速读取环境并调整路线，不执着于最初方案，只在意系统继续向前",
    gift: "让连接在变化里不断线",
    shadow: "调整太快，对方尚未理解旧决定，新决定已经开始执行",
    action: "每次改道说明什么变了、什么没变、下一次检查点在哪里",
    essenceEn: "reads the environment quickly and changes route without clinging to the first plan",
    giftEn: "keeps the bond intact through change",
    shadowEn: "can pivot before the previous decision is understood",
    actionEn: "state what changed, what did not, and the next checkpoint",
  },
};

const DIMS = Object.keys(CELLS) as LifeVectorDim[];

function normalizeType(value?: string): RelationshipType {
  return value === "business" || value === "general" ? value : "romantic";
}

function dimLabel(dim: LifeVectorDim, lang: Lang): string {
  return lang === "en" ? DIM_LABEL[dim].en : DIM_LABEL[dim].zh;
}

function closest(a: LifeVector, b: LifeVector): LifeVectorDim {
  return [...DIMS].sort((x, y) => Math.abs(a[x] - b[x]) - Math.abs(a[y] - b[y]))[0];
}

function widest(a: LifeVector, b: LifeVector): LifeVectorDim {
  return [...DIMS].sort((x, y) => Math.abs(a[y] - b[y]) - Math.abs(a[x] - b[x]))[0];
}

function lowest(v: LifeVector): LifeVectorDim {
  return [...DIMS].sort((x, y) => v[x] - v[y])[0];
}

function evidence(nameA: string, nameB: string, dim: LifeVectorDim, a: LifeVector, b: LifeVector, lang: Lang): string {
  const distance = Math.abs(a[dim] - b[dim]);
  return lang === "en"
    ? "Structural evidence: " + dimLabel(dim, lang) + " is " + a[dim] + " for " + nameA + " and " + b[dim] + " for " + nameB + ". The " + distance + "-point distance locates an interaction pattern; it is not a compatibility score."
    : "结构证据：" + nameA + " 的" + dimLabel(dim, lang) + "为 " + a[dim] + "，" + nameB + " 为 " + b[dim] + "，两者相距 " + distance + "。数字用于定位互动结构，不是给关系打“合不合”的分。";
}

function join(paragraphs: string[]): string {
  return paragraphs.filter(Boolean).join("\n\n");
}

function context(type: RelationshipType, lang: Lang) {
  if (lang === "en") {
    if (type === "business") return { field: "partnership", event: "decision", future: "operating system" };
    if (type === "general") return { field: "connection", event: "interaction", future: "shared path" };
    return { field: "intimate bond", event: "conversation", future: "shared life" };
  }
  if (type === "business") return { field: "合作场", event: "决策", future: "共创系统" };
  if (type === "general") return { field: "连接场", event: "互动", future: "同行路径" };
  return { field: "亲密场", event: "对话", future: "共同生活" };
}

export function generateStaticRelationshipReport(input: RelationshipReportInput): string {
  const lang: Lang = input.lang === "en" ? "en" : "zh";
  const zh = lang === "zh";
  const type = normalizeType(input.relationshipType);
  const nameA = input.nameA;
  const nameB = input.nameB;
  const a = input.vectorA;
  const b = input.vectorB;
  const resonance = input.resonance;
  const words = context(type, lang);
  const topA = topTraits(a, 3);
  const topB = topTraits(b, 3);
  const shared = resonance.resonant[0]?.dim ?? closest(a, b);
  const gap = widest(a, b);
  const lowA = lowest(a);
  const lowB = lowest(b);
  const growth = a[lowA] + b[lowA] <= a[lowB] + b[lowB] ? lowA : lowB;
  const emotion: LifeVectorDim = Math.max(a.emotionalDepth, b.emotionalDepth) >= Math.max(a.socialDrive, b.socialDrive) ? "emotionalDepth" : "socialDrive";
  const communication: LifeVectorDim = Math.abs(a.introspection - b.introspection) >= Math.abs(a.adaptability - b.adaptability) ? "introspection" : "adaptability";
  const valueDims: LifeVectorDim[] = ["stabilityNeed", "freedomNeed", "discipline", "ambition"];
  const valueDim = valueDims.sort((x, y) => a[y] + b[y] - a[x] - b[x])[0];
  const complement = resonance.complementary[0];
  const friction = resonance.friction[0];
  const s = CELLS[shared];
  const g = CELLS[gap];
  const e = CELLS[emotion];
  const c = CELLS[communication];
  const v = CELLS[valueDim];
  const grow = CELLS[growth];

  const chapters = zh ? [
    join([
      nameA + " 的三条主轴是" + topA.map((x) => x.labelZh + " " + x.score).join("、") + "；" + nameB + " 的三条主轴是" + topB.map((x) => x.labelZh + " " + x.score).join("、") + "。这不是把两份人格简介并排摆放，而是这段" + words.field + "的力学起点：一方带进来的力量，只有经过另一方的接收方式，才会显出它是支持、压力，还是尚未被翻译的善意。",
      "两份向量叠合后，最先显影的是" + dimLabel(shared, lang) + "：" + s.essence + "。正确使用时，它会" + s.gift + "；当双方都把自己的方式当成默认答案，同频也会成为共同盲区。",
      evidence(nameA, nameB, shared, a, b, lang),
    ]),
    join([
      "你们最初容易“对上”的地方，不一定是兴趣相同，而是" + dimLabel(shared, lang) + "所代表的节奏彼此可辨认。吸引真正来自“我的某种运行方式在这里不需要被缩小”。",
      "这条树突的礼物是：" + s.gift + "。但熟悉感不能取代继续认识。你们可以各自补完一句：“我欣赏你这一点，但我使用它的方式与你不同。”相似因此成为可以讨论、修订和共同使用的资产。",
      evidence(nameA, nameB, shared, a, b, lang),
    ]),
    join([
      "你们的情绪连接主要经由" + dimLabel(emotion, lang) + "进入。分数更高的一方会更早捕捉变化，分数较低的一方更可能等到信息足够明确才回应。这不是谁更在乎，而是两套感知系统的采样频率不同。",
      e.essence + "。它能" + e.gift + "；压力状态下却容易" + e.shadow + "。先确认收到什么，再说明各自如何理解，最后才讨论要做什么。",
      evidence(nameA, nameB, emotion, a, b, lang),
    ]),
    join([
      "这段关系的价值主轴落在" + dimLabel(valueDim, lang) + "：" + v.essence + "。这条轴决定你们怎样理解承诺、进展和“认真对待”，也解释了同一件事为什么在一方看来是负责，在另一方看来却可能是施压。",
      "把“以后要更好”拆成三个问题：什么行为代表仍在同一方向；什么变化必须提前告知；出现分歧时谁负责发起复盘。价值观只有落到行为，才从漂亮的话变成能承重的结构。",
      evidence(nameA, nameB, valueDim, a, b, lang),
    ]),
    join([
      "沟通里最值得管理的不是措辞，而是" + dimLabel(communication, lang) + "的落差。" + c.essence + "。一方已在内部完成三轮推演时，另一方可能仍在等待第一条状态反馈。",
      "你们需要一条不依赖情绪状态的协议：" + c.action + "。每次重要" + words.event + "只处理一个层级：确认事实、表达影响，或做出决定。三个层级混在一起，沟通自然过载。",
      evidence(nameA, nameB, communication, a, b, lang),
    ]),
    join([
      "最容易触发摩擦的是" + (friction ? friction.labelZh : dimLabel(gap, lang)) + "。" + (friction ? "这里不是简单差异，而是同一种力量同时加速，关系里缺少负责减速或换挡的人。" : "双方会对“此刻最重要的是什么”形成不同排序。"),
      g.shadow + "。冲突升级往往不是原始问题太大，而是双方都在证明自己的反应合理，没人先处理系统负荷。止损动作是：" + g.action + "。这不是回避，而是防止短时压力替关系做长期决定。",
      evidence(nameA, nameB, gap, a, b, lang),
    ]),
    join([
      "这段关系真正的成长课题，不是让分数较低的一方追上另一方，而是让" + dimLabel(growth, lang) + "形成两人都能调用的共同能力。现在它更像散落的经验：偶尔做对，却还没有稳定方法。",
      "连续四周，每周只观察一次相关事件：当时发生了什么、两人各自先做了什么、哪个动作让场重新连贯。第四周不讨论谁对谁错，只提炼一条以后可以直接复用的共同规则。",
      "关键不是抽象地“改善关系”，而是把偶然成功变成关系自己的知识。具体动作：" + grow.action + "。",
    ]),
    join([
      (complement ? "隐藏互补出现在" + complement.labelZh + "。" : "虽然没有命中强互补阈值，" + dimLabel(gap, lang) + "仍是一条可发展的分工轴。") + "互补不是“一人擅长、一人不擅长”的标签，而是关键时刻谁先启动、谁负责校准、谁拥有最后确认权。",
      "把一次真实任务拆成“开路、判断、收尾”三个阶段，再按各自高分维度分配主责。主责不等于独断：另一方保留提出风险和请求复盘的权利，但不在执行中持续夺回方向盘。",
      evidence(nameA, nameB, gap, a, b, lang),
    ]),
    join([
      "长期潜力取决于两件事：能否持续使用" + dimLabel(shared, lang) + "带来的共同语言，以及能否在" + dimLabel(gap, lang) + "出现分歧时不把差异人格化。",
      "建立一份只属于这段" + words.field + "的运行约定：固定复盘节奏；重大变化的提前告知窗口；冲突暂停词；各自不可被代替的责任；一次约定失效后如何修订。稳定不是从不变化，而是变化发生时仍知道怎样重新找到彼此。",
      s.gift + "；同时记住：" + g.action + "。一条负责保持生命力，一条负责控制损耗。",
    ]),
    join([
      "如果这段关系继续成熟，它不会变成两个人越来越相似，而会成为一套更精确的" + words.future + "：" + dimLabel(shared, lang) + "提供共同方向，" + dimLabel(gap, lang) + "提供视角差，" + dimLabel(growth, lang) + "成为下一阶段共同学习的能力。",
      "重要变化到来时，一个人先说出观察，另一个人补上遗漏；一个人推动，另一个人校准；完成之后，两人都能指出“这一次我们是怎样一起走过来的”。",
      "这不是预言，而是当现有优势被正确组织后，最可实现的关系形态。" + e.action + "。",
    ]),
    join([
      "这份图谱最后留下的不是“合适”或“不合适”，而是三条可验证判断：你们靠" + dimLabel(shared, lang) + "认出彼此；在" + dimLabel(gap, lang) + "上最容易误读彼此；下一阶段需要把" + dimLabel(growth, lang) + "从个人能力变成共同机制。",
      "给 " + nameA + " 的行动：自己的高分力量启动时先说明意图，不让对方只看见强度。给 " + nameB + " 的行动：感到节奏不对时提出具体请求，不用沉默等待对方自行理解。共同的行动：未来七天选一次真实" + words.event + "，使用“事实—影响—请求—确认”四步。",
      "一份有价值的关系报告不替你们决定未来。它应该让下一次关键时刻多一个可用动作。核心动作是：" + g.action + "。当它能够被重复调用，这段关系才真正拥有了自己的知识。",
    ]),
  ] : [
    join([nameA + " leads with " + topA.map((x) => x.labelEn + " " + x.score).join(", ") + "; " + nameB + " leads with " + topB.map((x) => x.labelEn + " " + x.score).join(", ") + ".", "The first shared trunk is " + dimLabel(shared, lang) + ": it " + s.essenceEn + ". Used well, it " + s.giftEn + ".", evidence(nameA, nameB, shared, a, b, lang)]),
    join(["Recognition begins through " + dimLabel(shared, lang) + ". Neither person needs to shrink this part to be understood.", "Each person should name what they admire and how they use the same quality differently.", evidence(nameA, nameB, shared, a, b, lang)]),
    join(["Emotional connection enters mainly through " + dimLabel(emotion, lang) + ".", "It " + e.giftEn + ", but under pressure it " + e.shadowEn + ". " + e.actionEn + ".", evidence(nameA, nameB, emotion, a, b, lang)]),
    join(["The values axis is " + dimLabel(valueDim, lang) + ": it " + v.essenceEn + ".", "Define which behaviour signals alignment, which changes require notice, and who initiates review.", evidence(nameA, nameB, valueDim, a, b, lang)]),
    join(["Communication is shaped by " + dimLabel(communication, lang) + ".", c.actionEn + ". Keep each important " + words.event + " at one level: facts, impact, or decision.", evidence(nameA, nameB, communication, a, b, lang)]),
    join(["The likely trigger is " + (friction ? friction.labelEn : dimLabel(gap, lang)) + ".", g.shadowEn + ". Circuit breaker: " + g.actionEn + ".", evidence(nameA, nameB, gap, a, b, lang)]),
    join(["Growth means turning " + dimLabel(growth, lang) + " into a shared capability.", "For four weeks, record what happened, each person's first move, and what restored coherence. Extract one reusable rule.", grow.actionEn + "."]),
    join([(complement ? "The hidden complement appears in " + complement.labelEn + "." : dimLabel(gap, lang) + " can become a useful division-of-labour axis."), "Split one task into opening, judging, and closing. Assign ownership while preserving the right to raise risk.", evidence(nameA, nameB, gap, a, b, lang)]),
    join(["Long-term potential depends on preserving " + dimLabel(shared, lang) + " without personalising differences in " + dimLabel(gap, lang) + ".", "Create an operating agreement: review rhythm, notice window, pause word, responsibilities, and revision process.", s.giftEn + "; meanwhile, " + g.actionEn + "."]),
    join(["A mature bond becomes a more precise " + words.future + ": shared direction, useful difference, and a jointly learned capability.", "This is not a prediction. It is the most achievable form when movement does not silence either person.", evidence(nameA, nameB, growth, a, b, lang)]),
    join(["Three testable findings remain: recognition through " + dimLabel(shared, lang) + ", misreading through " + dimLabel(gap, lang) + ", and growth through " + dimLabel(growth, lang) + ".", nameA + ": state intention before intensity. " + nameB + ": make a concrete request. Together, use fact, impact, request, and confirmation once this week.", "Core action: " + g.actionEn + "."]),
  ];

  const chapterDims: LifeVectorDim[] = [
    shared, shared, emotion, valueDim, communication, gap,
    growth, gap, shared, growth, gap,
  ];
  const seenEditorialParagraphs = new Set<string>();
  const enriched = chapters.map((chapter, index) => {
    const dim = chapterDims[index];
    const cell = CELLS[dim];
    const bandA = semanticBand(a[dim], 13);
    const bandB = semanticBand(b[dim], 13);
    const counterevidence = zh
      ? "反证校验：如果你们在最近三次相关事件里，都没有出现上述反应顺序，或角色始终相反，就不要把这项判断当成事实。请以真实记录为准，并在复盘时标记这条树突需要修订。"
      : "Counter-check: if none of the last three relevant events followed this sequence, or the roles were consistently reversed, do not treat this judgment as fact. Use the observed record and mark this dendrite for review.";
    const scene = zh
      ? "现实观察：未来七天只记录一次与" + dimLabel(dim, lang) + "有关的具体事件，包括触发点、两人的第一反应、恢复连接所需时间。"
      : "Reality check: during the next seven days, record one event involving " + dimLabel(dim, lang) + ", including the trigger, each first response, and time to reconnect.";
    const chapterId = String(index + 1).padStart(2, "0");
    const activated = activateRelationshipProtocols({
      vectorA: a,
      vectorB: b,
      relationshipType: type,
      lang,
      seed: [nameA, nameB, type, chapterId].join("|"),
      chapter: chapterId,
    });
    const slots = mergeRelationshipProtocols({
        judgment: chapter,
        evidence: evidence(nameA, nameB, dim, a, b, lang),
        mechanism: zh
          ? "深层机制：" + cell.essence + "。当前精确值分别落在 13 带语义层的第 " + (bandA.index + 1) + " 带与第 " + (bandB.index + 1) + " 带，带内仍保留原始分数，不用标签替代数值。"
          : "Mechanism: " + cell.essenceEn + ". Exact scores remain available inside semantic bands " + (bandA.index + 1) + " and " + (bandB.index + 1) + " of 13.",
        scenario: scene,
        shadow: zh ? "阴影机制：" + cell.shadow + "。" : "Shadow mechanism: it " + cell.shadowEn + ".",
        counterevidence,
        action: zh ? "行动协议：" + cell.action + "。" : "Action protocol: " + cell.actionEn + ".",
    }, activated);
    const composed = composeDendriticChapter({
      chapter: chapterId,
      livingProduct: type === "business" ? "relationship-business" : type === "general" ? "relationship-other" : "relationship-deep",
      slots,
      activated,
      presentation: "editorial",
      editorialIndex: index + (type === "business" ? 24 : type === "general" ? 48 : 0),
      evidence: [
        { key: dim + ".a", label: nameA + " " + dimLabel(dim, lang), value: a[dim], source: "comparison" },
        { key: dim + ".b", label: nameB + " " + dimLabel(dim, lang), value: b[dim], source: "comparison" },
      ],
    });
    // A protocol may activate in several chapters, but a paid archive should not
    // print the same paragraph twice. Keep the first, best contextual occurrence.
    return composed.text
      .split(/\n\s*\n/)
      .filter((paragraph) => {
        const key = paragraph.replace(/\s+/g, " ").trim();
        if (!key || seenEditorialParagraphs.has(key)) return false;
        seenEditorialParagraphs.add(key);
        return true;
      })
      .join("\n\n");
  });

  return enriched.map((chapter, index) => "===" + String(index + 1).padStart(2, "0") + "===" + String.fromCharCode(10) + chapter).join(String.fromCharCode(10));
}
