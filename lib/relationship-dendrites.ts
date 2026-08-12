import type { LifeVector, LifeVectorDim } from "@/lib/life-vector";
import type {
  ActivatedNode,
  ChapterSlots,
  DendriticCondition,
  DendriticFragments,
  DendriticNode,
} from "@/lib/dendritic-engine";
import { activateDendrites } from "@/lib/dendritic-engine";

type Lang = "zh" | "en";
type RelationshipType = "romantic" | "business" | "general";

const VERSION = "2026.08.2";

type ProtocolCopy = {
  id: string;
  chapter: string;
  type?: RelationshipType;
  priority: number;
  dimensions: LifeVectorDim[];
  condition: DendriticCondition;
  zh: DendriticFragments;
  en: DendriticFragments;
};

const contextCondition = (type: RelationshipType): DendriticCondition => ({
  op: "context",
  key: "relationshipType",
  value: type,
});

const withContext = (type: RelationshipType | undefined, condition: DendriticCondition): DendriticCondition =>
  type ? { op: "all", conditions: [contextCondition(type), condition] } : condition;

const PROTOCOLS: ProtocolCopy[] = [
  {
    id: "trust.signal-lag",
    chapter: "03",
    type: "romantic",
    priority: 96,
    dimensions: ["emotionalDepth"],
    condition: { op: "score", dim: "gap.emotionalDepth", min: 24 },
    zh: {
      mechanism: "信任的核心摩擦不一定来自爱得多少，而可能来自信号处理速度不同。较早察觉变化的人会不断补充问题，较晚确认的人则可能在压力中进一步沉默，于是追问与退后互相强化。",
      scenario: "现实场景：一方发现语气变化后希望立即说清，另一方需要先整理事实。前者把等待读成冷淡，后者把追问读成审讯。",
      shadow: "风险不在一次误读，而在双方逐渐只相信自己的解释，并停止核对原始事实。",
      counterevidence: "反证：如果最近三次不安都能在约定时间内被主动回应，且沉默方会说明何时回来，这个循环就不是当前主导模式。",
      action: "信任校准协议：先说事实，再说感受，最后提出一个可回答请求；需要暂停的一方必须给出具体返回时间，并由其主动重启对话。",
    },
    en: {
      mechanism: "The central trust friction may be signal-processing speed rather than depth of care. Early detection can trigger pursuit while slower processing triggers retreat, and each response amplifies the other.",
      scenario: "One person notices a tonal shift and wants immediate clarity; the other needs time to organise facts. Waiting is read as distance and questions as interrogation.",
      shadow: "The risk is not one misreading but a habit of trusting interpretation more than observable facts.",
      counterevidence: "If the last three concerns received a proactive response within an agreed window, this is not the dominant loop.",
      action: "Trust calibration: state the fact, the feeling, and one answerable request. Whoever pauses names a return time and reopens the conversation.",
    },
  },
  {
    id: "trust.mutual-sensitivity",
    chapter: "03",
    type: "romantic",
    priority: 92,
    dimensions: ["emotionalDepth"],
    condition: { op: "score", dim: "avg.emotionalDepth", min: 68 },
    zh: {
      mechanism: "双方都能感知细微信号时，亲密会很深，但未经核实的感受也容易被迅速放大。高敏感不是读心能力，它只说明系统更早收到变化。",
      scenario: "现实场景：一个短回复、一次晚归或一次走神，就可能同时触发两套完整解释。",
      shadow: "如果把感受到的变化直接当作对方意图，关系会被未经验证的故事占据。",
      counterevidence: "反证：若你们能够区分观察与推测，并允许对方给出不同解释，高敏感会成为精细协作而不是负担。",
      action: "双重核对：每人分别写下“我看见什么、我推测什么、我需要确认什么”，交换后只回答确认问题，不为推测辩护。",
    },
    en: {
      mechanism: "When both people register subtle signals, intimacy can deepen, but unverified feelings can also escalate quickly. Sensitivity is early detection, not mind reading.",
      scenario: "A short reply, a late arrival, or a distracted moment can trigger two complete stories at once.",
      shadow: "Treating sensed change as proven intention lets an untested story occupy the relationship.",
      counterevidence: "If observation and interpretation remain separate, sensitivity becomes coordination rather than burden.",
      action: "Double-check protocol: each person writes what was observed, inferred, and needs confirmation. Exchange and answer only the confirmation question.",
    },
  },
  {
    id: "boundary.freedom-stability",
    chapter: "04",
    type: "romantic",
    priority: 95,
    dimensions: ["freedomNeed", "stabilityNeed"],
    condition: { op: "all", conditions: [
      { op: "score", dim: "avg.freedomNeed", min: 55 },
      { op: "score", dim: "avg.stabilityNeed", min: 55 },
    ] },
    zh: {
      mechanism: "这段关系同时需要自主空间和可预期连接。真正的矛盾不是自由对抗承诺，而是双方没有把“可自由变化的部分”和“必须提前交代的部分”分开。",
      scenario: "现实场景：临时改变计划的一方觉得只是灵活，等待的一方却承担了时间、情绪或资源成本。",
      shadow: "用报备换自由会让连接像审批；完全不交代则会让自由由另一方承担代价。",
      counterevidence: "反证：如果临时变化不会把成本转嫁给对方，且双方都能使用同等自由，这项张力已经被良好管理。",
      action: "边界地图：共同列出三栏——无需报备、需要告知、必须协商。任何新事件先归栏，再讨论具体选择。",
    },
    en: {
      mechanism: "This bond needs both autonomy and predictable connection. The real tension is not freedom versus commitment, but failure to separate flexible areas from changes that require notice.",
      scenario: "One person experiences a last-minute change as flexibility while the other carries the time, emotional, or resource cost.",
      shadow: "Permission-seeking turns connection into approval; no notice makes the other person pay for freedom.",
      counterevidence: "If changes do not transfer cost and both people hold equal freedom, this tension is already managed.",
      action: "Boundary map: define three columns, no notice needed, notice required, and joint decision required. Classify before debating.",
    },
  },
  {
    id: "communication.processing-gap",
    chapter: "05",
    priority: 90,
    dimensions: ["introspection"],
    condition: { op: "score", dim: "gap.introspection", min: 26 },
    zh: {
      mechanism: "你们的沟通落差更像处理时序差，而不是表达能力高低。一方通过说话形成想法，另一方需要先在内部形成结构。",
      scenario: "现实场景：即时讨论中，先说的一方不断增加信息，后说的一方越来越难进入；对话结束后，后者才出现真正想说的内容。",
      shadow: "如果把即时流畅当作更有道理，较慢的一方会退出；如果把沉默当作更深思熟虑，较快的一方又会被贬低。",
      counterevidence: "反证：若书面与口头渠道都能得到同等重视，且最终决定不会在一方尚未处理完前做出，这项落差不会形成权力差。",
      action: "双通道协议：先进行十五分钟口头澄清，再保留一次书面补充窗口，最后只在双方都确认“信息完整”后进入决定。",
    },
    en: {
      mechanism: "The communication gap is processing sequence, not ability. One person forms thought through speech while the other needs internal structure first.",
      scenario: "In live discussion, one keeps adding information while the other loses entry; the missing response arrives after the conversation ends.",
      shadow: "Equating fluency with correctness or silence with depth creates an unfair hierarchy.",
      counterevidence: "If written and spoken channels carry equal weight and decisions wait for both, the gap does not become power.",
      action: "Two-channel protocol: fifteen minutes of spoken clarification, one written follow-up window, then decide only after both confirm the information is complete.",
    },
  },
  {
    id: "repair.high-activation",
    chapter: "06",
    type: "romantic",
    priority: 97,
    dimensions: ["emotionalDepth", "adaptability"],
    condition: { op: "all", conditions: [
      { op: "score", dim: "avg.emotionalDepth", min: 58 },
      { op: "score", dim: "gap.adaptability", min: 20 },
    ] },
    zh: {
      mechanism: "冲突升级后，一方更快切换策略，另一方仍在处理原始影响。前者以为已经翻篇，后者感到问题被跳过，于是旧事件会在新冲突中重新出现。",
      scenario: "现实场景：道歉已经发生，但没有说清影响、责任与下次改变，几天后同类触发再次出现。",
      shadow: "快速恢复若没有修复证据，只是结束不适；持续回看若没有明确请求，也会变成循环追责。",
      counterevidence: "反证：如果道歉后能观察到具体行为改变，且旧事件不再被用来证明人格，这项循环已经中断。",
      action: "四步修复：确认发生了什么；说清各自承担；约定一个可观察改变；七天后复盘一次，然后关闭该事件。",
    },
    en: {
      mechanism: "After escalation, one person changes strategy faster while the other still processes the original impact. Moving on can feel like skipping repair.",
      scenario: "An apology happened, but impact, ownership, and future change remained undefined, so the trigger returns.",
      shadow: "Fast recovery without evidence only ends discomfort; repeated review without a request becomes prosecution.",
      counterevidence: "If apology leads to observable change and the event is no longer used as a character verdict, the loop is interrupted.",
      action: "Four-step repair: name the event, assign ownership, define one observable change, review once after seven days, then close it.",
    },
  },
  {
    id: "business.risk-governance",
    chapter: "06",
    type: "business",
    priority: 99,
    dimensions: ["riskTolerance", "discipline"],
    condition: { op: "score", dim: "avg.riskTolerance", min: 62 },
    zh: {
      mechanism: "双方都偏向用行动获得信息时，合作会拥有启动速度，但风险会被分散到现金流、声誉和执行团队，直到出现损失才被看见。",
      scenario: "现实场景：机会窗口很短，双方在兴奋中同意推进，却没有写明预算上限、退出条件和谁承担尾部工作。",
      shadow: "共同乐观会制造无人负责的风险；事后再讨论谁同意过什么，容易把经营问题变成人际背叛。",
      counterevidence: "反证：如果每项试验都有书面上限、停止指标和唯一责任人，高行动力就是优势而不是隐患。",
      action: "试验闸门：任何新项目必须同时写出投入上限、最迟验证日期、停止指标、主责人和终止后的清理责任。缺一项不启动。",
    },
    en: {
      mechanism: "When both partners learn through action, speed is strong but risk disperses into cash flow, reputation, and the delivery team until loss makes it visible.",
      scenario: "A short opportunity window produces agreement without a budget cap, exit condition, or owner for residual work.",
      shadow: "Shared optimism creates ownerless risk and later turns an operating failure into personal betrayal.",
      counterevidence: "If every experiment has written limits, stop signals, and one owner, action bias is an advantage.",
      action: "Experiment gate: state the investment cap, validation date, stop signal, accountable owner, and cleanup owner. Missing one means no launch.",
    },
  },
  {
    id: "business.authority-gap",
    chapter: "08",
    type: "business",
    priority: 98,
    dimensions: ["ambition", "discipline"],
    condition: { op: "any", conditions: [
      { op: "score", dim: "gap.ambition", min: 24 },
      { op: "score", dim: "gap.discipline", min: 24 },
    ] },
    zh: {
      mechanism: "合伙中的权力冲突常伪装成观点分歧。推动规模的人与维护交付的人使用不同证据判断“现在是否该前进”，如果最终决定权没有预先分区，每次讨论都会重新争夺地位。",
      scenario: "现实场景：市场、产品、财务同时给出不同信号，双方都认为自己承担后果，因此都要求最后确认权。",
      shadow: "模糊的平等会让小事反复共识、大事临时独断；角色称谓存在，但决策边界并不存在。",
      counterevidence: "反证：如果各决策域都有明确主责、否决条件和升级路径，意见尖锐也不会等同于权力失衡。",
      action: "权责矩阵：按产品、市场、用人、合同、资金五域分别写明提议权、决定权、否决条件和争议升级人；季度复审，不在冲突现场改规则。",
    },
    en: {
      mechanism: "Power conflict often appears as disagreement. The growth driver and delivery guardian use different evidence, so undefined decision rights reopen status competition each time.",
      scenario: "Market, product, and finance signals diverge; both partners carry consequences and claim final confirmation.",
      shadow: "Vague equality creates consensus theatre for small issues and sudden unilateral control for large ones.",
      counterevidence: "Clear owners, veto conditions, and escalation routes allow sharp disagreement without power imbalance.",
      action: "Authority matrix: for product, market, hiring, contracts, and capital, name proposal rights, decision rights, veto conditions, and escalation owner. Review quarterly, never mid-conflict.",
    },
  },
  {
    id: "business.money-boundary",
    chapter: "08",
    type: "business",
    priority: 94,
    dimensions: ["stabilityNeed", "riskTolerance"],
    condition: { op: "score", dim: "gap.riskTolerance", min: 20 },
    zh: {
      mechanism: "资金分歧不是谁胆大谁保守，而是双方对可承受损失、验证周期和机会成本使用了不同口径。没有共同口径时，每笔投入都像对彼此判断力的投票。",
      scenario: "现实场景：一方看见错失窗口的代价，另一方看见现金流断裂的代价，双方都在谈风险，却不是同一种风险。",
      shadow: "如果只争预算数字，真正的假设不会暴露，关系会在“你不信任我”和“你不负责任”之间摆动。",
      counterevidence: "反证：若双方能用同一张表比较最好、基准、最坏三种情形，分歧就是正常治理。",
      action: "资金协议：每次投入同时填写最大损失、回收周期、验证指标、替代用途和谁有暂停权；先比较假设，再比较金额。",
    },
    en: {
      mechanism: "Capital disagreement is not courage versus caution. The partners use different definitions of tolerable loss, validation time, and opportunity cost.",
      scenario: "One sees the cost of a missed window while the other sees the cost of broken cash flow; both discuss risk, but not the same risk.",
      shadow: "Arguing only about the number hides assumptions and turns governance into trust accusations.",
      counterevidence: "If both compare upside, base, and downside cases on one sheet, disagreement is normal governance.",
      action: "Capital protocol: record maximum loss, recovery period, validation signal, alternative use, and pause authority. Compare assumptions before amounts.",
    },
  },
  {
    id: "general.closeness-boundary",
    chapter: "03",
    type: "general",
    priority: 93,
    dimensions: ["freedomNeed", "socialDrive"],
    condition: { op: "any", conditions: [
      { op: "score", dim: "gap.freedomNeed", min: 23 },
      { op: "score", dim: "gap.socialDrive", min: 23 },
    ] },
    zh: {
      mechanism: "其他关系最容易因“关系名称不明确”而承载过多期待。一方按高亲密度投入，另一方按普通协作或阶段性同行回应，落差会被误读为态度变化。",
      scenario: "现实场景：联系频率、资源帮助或隐私分享不断增加，但双方从未讨论这段关系实际承担什么。",
      shadow: "未经确认的期待会在付出后变成隐性债务；退后的一方不知道自己违反了什么约定。",
      counterevidence: "反证：如果双方能自然拒绝、重新协商频率，且帮助不附带未说明的回报，这段关系具有健康弹性。",
      action: "关系定标：分别回答“我愿意稳定提供什么、我不能承担什么、变化时如何告知”，只保留双方都明确同意的部分。",
    },
    en: {
      mechanism: "Undefined relationship categories can carry excessive expectations. One person invests at high intimacy while the other responds as ordinary cooperation or temporary companionship.",
      scenario: "Contact, support, or private disclosure increases without discussion of what the relationship actually carries.",
      shadow: "Unconfirmed expectations become hidden debt after giving; the other person never knew an agreement existed.",
      counterevidence: "If both can decline, renegotiate frequency, and help without hidden return, the bond has healthy elasticity.",
      action: "Relationship calibration: each states what can be offered consistently, what cannot be carried, and how change will be communicated. Keep only mutual agreements.",
    },
  },
  {
    id: "general.reciprocity",
    chapter: "08",
    type: "general",
    priority: 91,
    dimensions: ["discipline", "emotionalDepth"],
    condition: { op: "score", dim: "gap.discipline", min: 20 },
    zh: {
      mechanism: "互惠不要求每次对等，但需要长期可辨认。一方习惯用及时行动表达重视，另一方可能用倾听、信息或关键时刻出现表达，若只承认自己的语言，双方都会觉得自己付出更多。",
      scenario: "现实场景：日常小事总由同一人完成，另一人却在少数重大时刻承担较大责任，双方统计的是不同账本。",
      shadow: "把关系变成逐笔结算会失去温度；完全不谈交换则让长期失衡无法被看见。",
      counterevidence: "反证：如果双方都能具体说出最近收到的三种支持，互惠形式虽不同，仍然可见。",
      action: "互惠盘点：按时间、行动、情绪支持、资源四栏记录一个月；不追求数量相等，只修复长期只有单向流动的栏位。",
    },
    en: {
      mechanism: "Reciprocity need not be equal each time, but it must remain visible over time. Action, listening, information, and crisis support are different currencies.",
      scenario: "One person handles daily tasks while the other carries a few major moments, and each counts a different ledger.",
      shadow: "Transaction-by-transaction accounting removes warmth; never discussing exchange hides chronic imbalance.",
      counterevidence: "If both can name three recent forms of received support, reciprocity remains visible despite different forms.",
      action: "Reciprocity review: track time, action, emotional support, and resources for one month. Do not equalise counts; repair categories that flow only one way.",
    },
  },
  {
    id: "lifecycle.low-stability",
    chapter: "09",
    priority: 89,
    dimensions: ["stabilityNeed", "discipline"],
    condition: { op: "score", dim: "avg.stabilityNeed", max: 45 },
    zh: {
      mechanism: "这段关系更容易依靠当下动力而不是固定结构维持。它可以很有生命力，但在忙碌、距离或角色变化时，连接不会自动延续。",
      scenario: "现实场景：见面时一切自然，分开后双方都等待对方发起，关系质量随环境大幅波动。",
      shadow: "把自然等同于无需维护，会让重要关系在没有冲突的情况下逐渐变薄。",
      counterevidence: "反证：若过去三个月即使环境变化，仍有稳定而不勉强的联系节奏，说明你们已经形成自己的结构。",
      action: "最小维护协议：只约定一个低成本、可长期重复的连接动作，并明确谁在中断后负责重启。",
    },
    en: {
      mechanism: "This relationship relies more on present momentum than fixed structure. It can feel alive, yet connection does not automatically persist through distance, workload, or role change.",
      scenario: "Everything feels natural in person, but apart, both wait for the other to initiate.",
      shadow: "Equating naturalness with no maintenance lets an important bond thin without conflict.",
      counterevidence: "A stable and unforced rhythm through three months of change shows that structure already exists.",
      action: "Minimum maintenance: choose one low-cost repeatable connection and name who restarts it after interruption.",
    },
  },
  {
    id: "lifecycle.high-stability",
    chapter: "09",
    priority: 88,
    dimensions: ["stabilityNeed", "adaptability"],
    condition: { op: "score", dim: "avg.stabilityNeed", min: 70 },
    zh: {
      mechanism: "你们擅长维持连续性，长期优势明显；但稳定久了，旧分工可能继续运转，即使它已经不再符合当前阶段。",
      scenario: "现实场景：双方都可靠地完成原有职责，却很少再问这些职责是否仍公平、是否仍支持新的生活方向。",
      shadow: "稳定若只保护过去，会把忠诚变成惯性，让真实变化只能以突然退出的方式出现。",
      counterevidence: "反证：如果你们每个阶段都会主动重谈分工，而不是等到不满累积，稳定就是承载变化的容器。",
      action: "阶段复契约：每九十天保留、停止、新增各一项约定，并确认当前角色是主动选择，不是历史遗留。",
    },
    en: {
      mechanism: "You sustain continuity well, but old roles can keep running after they stop fitting the current stage.",
      scenario: "Both reliably fulfil historic duties while rarely asking whether those duties remain fair or support the next direction.",
      shadow: "Stability that protects only the past turns loyalty into inertia and forces change to arrive as sudden exit.",
      counterevidence: "If roles are renegotiated at each stage, stability becomes a container for change.",
      action: "Stage renewal every ninety days: retain one agreement, stop one, add one, and confirm each role is a present choice rather than a historical remainder.",
    },
  },
  {
    id: "transition.adaptive-pair",
    chapter: "10",
    priority: 87,
    dimensions: ["adaptability", "stabilityNeed"],
    condition: { op: "score", dim: "avg.adaptability", min: 65 },
    zh: {
      mechanism: "双方都能快速适应时，关系不容易被单次变化击断，但也可能连续调整到忘记原本共同选择的方向。",
      scenario: "现实场景：工作、城市、家庭责任连续变化，你们每次都解决了眼前问题，却没有重新确认长期目标。",
      shadow: "适应能力若缺少锚点，会把“还能继续”误当成“仍然想这样继续”。",
      counterevidence: "反证：如果每次重大调整后都会重新确认共同方向与退出条件，灵活性正在服务选择。",
      action: "转折复位：重大变化后三十天内回答三问——什么必须保留、什么允许改变、什么证据说明这条路不再适合。",
    },
    en: {
      mechanism: "When both adapt quickly, change rarely breaks the relationship, but repeated adjustment can obscure the direction originally chosen together.",
      scenario: "Work, location, and family duties keep changing; each immediate problem is solved without renewing the long-term aim.",
      shadow: "Adaptability without an anchor confuses being able to continue with still choosing to continue.",
      counterevidence: "If major adjustments renew direction and exit conditions, flexibility is serving choice.",
      action: "Transition reset within thirty days: what must remain, what may change, and what evidence would show this path no longer fits?",
    },
  },
];

function metric(vectorA: LifeVector, vectorB: LifeVector, dim: LifeVectorDim) {
  return {
    avg: Math.round((vectorA[dim] + vectorB[dim]) / 2),
    gap: Math.abs(vectorA[dim] - vectorB[dim]),
  };
}

export function relationshipActivationScores(vectorA: LifeVector, vectorB: LifeVector): Record<string, number> {
  const scores: Record<string, number> = {};
  for (const dim of Object.keys(vectorA) as LifeVectorDim[]) {
    const values = metric(vectorA, vectorB, dim);
    scores[`avg.${dim}`] = values.avg;
    scores[`gap.${dim}`] = values.gap;
  }
  return scores;
}

export function relationshipProtocolNodes(lang: Lang): DendriticNode[] {
  return PROTOCOLS.map((protocol) => ({
    id: `relationship.${protocol.id}.${lang}`,
    knowledgeVersion: VERSION,
    product: "relationship-resonance",
    chapter: protocol.chapter,
    kind: "cross",
    priority: protocol.priority,
    conditions: withContext(protocol.type, protocol.condition),
    dimensions: protocol.dimensions,
    fragments: lang === "zh" ? protocol.zh : protocol.en,
    safetyTags: ["agency", "counterevidence", "non-diagnostic"],
  }));
}

export function activateRelationshipProtocols(args: {
  vectorA: LifeVector;
  vectorB: LifeVector;
  relationshipType: RelationshipType;
  lang: Lang;
  seed: string;
  chapter: string;
}): ActivatedNode[] {
  return activateDendrites(relationshipProtocolNodes(args.lang), {
    product: "relationship-resonance",
    scores: relationshipActivationScores(args.vectorA, args.vectorB),
    context: { relationshipType: args.relationshipType },
    seed: args.seed,
    locale: args.lang,
  }, args.chapter, 2);
}

function append(base: string, additions: Array<string | undefined>): string {
  return [base, ...additions.filter((value): value is string => Boolean(value?.trim()))].join("\n\n");
}

export function mergeRelationshipProtocols(slots: ChapterSlots, activated: ActivatedNode[]): ChapterSlots {
  return {
    judgment: slots.judgment,
    evidence: slots.evidence,
    mechanism: append(slots.mechanism, activated.map(({ node }) => node.fragments.mechanism)),
    scenario: append(slots.scenario, activated.map(({ node }) => node.fragments.scenario)),
    shadow: append(slots.shadow, activated.map(({ node }) => node.fragments.shadow)),
    counterevidence: append(slots.counterevidence, activated.map(({ node }) => node.fragments.counterevidence)),
    action: append(slots.action, activated.map(({ node }) => node.fragments.action)),
    narrative: append(slots.narrative ?? "", activated.map(({ node }) => node.fragments.narrative)),
  };
}

export const RELATIONSHIP_KNOWLEDGE_VERSION = VERSION;
export const RELATIONSHIP_PROTOCOL_COUNT = PROTOCOLS.length;
