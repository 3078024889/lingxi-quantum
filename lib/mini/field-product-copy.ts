export type FieldResultMode = "core" | "primary" | "secondary" | "edge" | "quiet" | "cost" | "action" | "evidence" | "history" | "timeline";

export type FieldProductCopy = {
  field: string;
  layer: "field" | "convergence";
  nameZh: string;
  nameEn: string;
  cardDefinitionZh: string;
  cardDefinitionEn: string;
  keywordsZh: string[];
  keywordsEn: string[];
  ctaZh: string;
  ctaEn: string;
  coreTitleZh: string;
  coreTitleEn: string;
  overviewZh: string[];
  overviewEn: string[];
  readingZh: string;
  readingEn: string;
  structureZh: string[];
  structureEn: string[];
  resultOutline: Array<{ id: string; zh: string; en: string; mode: FieldResultMode }>;
};

export const FIELD_PRODUCT_COPY: Record<string, FieldProductCopy> = {
  "stellar-trace": {
    field: "00", layer: "field", nameZh: "灵犀场星迹 · 万里寻踪", nameEn: "Lingxi Stellar Trace",
    cardDefinitionZh: "循时而索迹，因星而见位；证不足，则止于证界。", cardDefinitionEn: "Trace through time and stars; stop where evidence ends.",
    keywordsZh: ["九域坐标", "四证合度", "推演边界", "七日有效"], keywordsEn: ["Nine-field Coordinates", "Four-evidence Convergence", "Inference Boundary", "Seven-day Access"],
    ctaZh: "建立寻踪档案 →", ctaEn: "Build a Stellar Trace Archive →",
    coreTitleZh: "让每一个方向结论先经过四证合度", coreTitleEn: "Make every directional claim pass four-evidence convergence",
    overviewZh: ["九域天文位置属于可复算事实；原典规则独立起局并进入圆周合度，九域实验投影不再冒充古法证据。", "用户提供的现实移动方向只在原典结果形成后核验偏差；证据不足或距离未校准时，不生成假精确坐标。"],
    overviewEn: ["Nine-field positions remain reproducible astronomical facts. Source-traced systems are calculated independently and then enter circular convergence; experimental astronomy never impersonates an ancient rule.", "A reported movement direction is used only after inference for reality validation. No false coordinate is produced when evidence or distance calibration is absent."],
    readingZh: "星迹读取的是模型证据资格，不是设备定位，也不声称知道人员现实位置。", readingEn: "Stellar Trace reads model eligibility, not device location, and never claims to know a person's real position.",
    structureZh: ["九域事实", "原典四证", "现实核验", "推演边界"], structureEn: ["Nine Fields", "Source-traced Evidence", "Reality Validation", "Inference Boundary"],
    resultOutline: [{id:"facts",zh:"九域事实层",en:"Nine-field Facts",mode:"evidence"},{id:"ancient",zh:"原典四证层",en:"Source-traced Evidence",mode:"secondary"},{id:"gate",zh:"独立圆周合度",en:"Independent Circular Convergence",mode:"core"},{id:"boundary",zh:"现实核验与推演边界",en:"Reality Validation and Boundary",mode:"cost"}],
  },
  "life-map-report": {
    field: "01", layer: "field", nameZh: "生命图谱", nameEn: "Life Blueprint",
    cardDefinitionZh: "看见长期反复出现的生命结构。", cardDefinitionEn: "See the life structures that persist across contexts.",
    keywordsZh: ["本源结构", "现实适应", "生命偏移", "当前状态"], keywordsEn: ["Origin", "Adaptation", "Drift", "Current State"],
    ctaZh: "展开我的生命图谱 →", ctaEn: "Unfold My Life Blueprint →",
    coreTitleZh: "看见长期反复出现的生命结构", coreTitleEn: "See the life structures that keep returning",
    overviewZh: ["生命图谱观察的不是某一个瞬间。它把你在不同环境中的选择放在一起：怎样开始、行动、连接、组织现实、面对变化，以及为了适应外部环境曾经改变了多少自己。", "真正值得看的不是单独分数，而是自然结构、现实适应与当前状态之间，是否仍然在同一条线上。"],
    overviewEn: ["Life Blueprint does not read a single moment. It compares how you begin, act, connect, organize reality and meet change across different contexts—including how much of yourself was altered to adapt.", "The meaningful question is not one score, but whether natural structure, real-world adaptation and present state still point in the same direction."],
    readingZh: "生命图谱读取跨情境仍然稳定出现的选择模式，并辨认长期结构、适应方式与当前偏移。", readingEn: "Life Blueprint reads choice patterns that remain stable across contexts, distinguishing long-term structure, adaptation and present drift.",
    structureZh: ["本源结构", "现实适应", "当前状态", "适应成本"], structureEn: ["Origin", "Adaptation", "Current State", "Adaptation Cost"],
    resultOutline: [{id:"current",zh:"当前生命结构",en:"Current Life Structure",mode:"core"},{id:"origin",zh:"本源结构",en:"Origin Structure",mode:"primary"},{id:"adaptation",zh:"现实适应层",en:"Real-world Adaptation",mode:"secondary"},{id:"vector",zh:"最稳定的生命向量",en:"Most Stable Life Vector",mode:"edge"},{id:"drift",zh:"当前偏移位置",en:"Present Drift",mode:"quiet"},{id:"cost",zh:"适应成本",en:"Adaptation Cost",mode:"cost"},{id:"return",zh:"正在重新靠近自己的部分",en:"What Is Returning to Self",mode:"history"},{id:"observe",zh:"一个现实观察",en:"One Reality Observation",mode:"action"}],
  },
  "relationship-resonance": {
    field: "02", layer: "field", nameZh: "关系共振", nameEn: "Relationship Resonance",
    cardDefinitionZh: "看见两个人之间真实形成的连接结构。", cardDefinitionEn: "See the connection structure actually formed between two people.",
    keywordsZh: ["靠近", "表达", "边界", "支持", "冲突", "修复"], keywordsEn: ["Approach", "Expression", "Boundary", "Support", "Conflict", "Repair"],
    ctaZh: "进入关系共振 →", ctaEn: "Enter Relationship Resonance →",
    coreTitleZh: "看见两个人之间，真实形成的关系结构", coreTitleEn: "See the relationship structure two people actually create",
    overviewZh: ["关系不是两个性格分数放在一起。当两个人真正进入互动，靠近速度、表达方式、个人边界、支持语言、冲突节奏和修复方式，会共同形成第三种结构：这段关系本身的运行方式。", "这里不输出匹配率。它观察个人进入重要关系后的模式；双方自愿参与时，再比较彼此感受与对方实际接收到的关系信号。"],
    overviewEn: ["A relationship is not two personality scores placed side by side. Approach, expression, boundaries, support, conflict rhythm and repair jointly create a third structure: how this relationship itself operates.", "No compatibility percentage is produced. With mutual participation, the reading can compare self-perception with the signals the other person actually receives."],
    readingZh: "关系共振读取重要关系中的真实互动，观察靠近、表达、安全、边界、冲突与修复。", readingEn: "Relationship Resonance reads lived interaction through approach, expression, safety, boundaries, conflict and repair.",
    structureZh: ["个人关系结构", "感知落差", "支持语言", "冲突节奏"], structureEn: ["Personal Pattern", "Perception Gap", "Support Language", "Conflict Rhythm"],
    resultOutline: [{id:"self",zh:"我的关系结构",en:"My Relationship Structure",mode:"core"},{id:"approach",zh:"我怎样允许别人靠近",en:"How I Allow Closeness",mode:"primary"},{id:"needs",zh:"怎样表达重要需要",en:"How Important Needs Are Expressed",mode:"secondary"},{id:"boundary",zh:"怎样保持自己的位置",en:"How I Keep My Position",mode:"quiet"},{id:"rupture",zh:"关系受扰以后发生什么",en:"What Happens After Rupture",mode:"cost"},{id:"repair",zh:"怎样重新回来",en:"How Connection Returns",mode:"action"},{id:"signal",zh:"支持语言与感知落差",en:"Support Language and Perception Gap",mode:"edge"},{id:"evidence",zh:"关系证据",en:"Relational Evidence",mode:"evidence"}],
  },
  "resilience-report": {
    field: "03", layer: "field", nameZh: "生命韧性指数", nameEn: "Life Resilience Index",
    cardDefinitionZh: "看见压力发生以后，自己究竟怎样回来。", cardDefinitionEn: "See how you actually return after pressure.",
    keywordsZh: ["恢复", "适应", "反弹", "坚持", "稳定"], keywordsEn: ["Recovery", "Adaptation", "Rebound", "Endurance", "Stability"],
    ctaZh: "展开我的生命韧性 →", ctaEn: "Unfold My Resilience →",
    coreTitleZh: "看见压力发生以后，自己究竟怎样回来", coreTitleEn: "See how you actually return after pressure",
    overviewZh: ["真正的韧性不只是撑住。面对突发冲击、持续压力、重复失败和长期低反馈，同一个人的反应可能完全不同。", "有人恢复很快但代价很大；有人启动很慢却能长期稳定承载。生命韧性指数把恢复速度与恢复成本拆开观察。"],
    overviewEn: ["Resilience is more than enduring. Sudden impact, sustained pressure, repeated failure and prolonged low feedback can activate very different responses in the same person.", "Fast recovery may carry a high hidden cost; a slow restart may still support long-term stability. This reading separates recovery capacity from recovery cost."],
    readingZh: "生命韧性读取不同压力类型下的恢复、适应、反弹、坚持与稳定，并观察背后消耗的内部资源。", readingEn: "Life Resilience compares recovery, adaptation, rebound, endurance and stability across pressure types, including their internal cost.",
    structureZh: ["突发冲击", "持续压力", "重复失败", "长期低反馈", "恢复成本"], structureEn: ["Sudden Impact", "Sustained Pressure", "Repeated Failure", "Low Feedback", "Recovery Cost"],
    resultOutline: [{id:"current",zh:"当前韧性结构",en:"Current Resilience Structure",mode:"core"},{id:"recover",zh:"压力恢复",en:"Pressure Recovery",mode:"primary"},{id:"adapt",zh:"变化适应",en:"Adaptation to Change",mode:"secondary"},{id:"rebound",zh:"危机反弹",en:"Crisis Rebound",mode:"edge"},{id:"endure",zh:"长期坚持与稳定承载",en:"Endurance and Stable Capacity",mode:"history"},{id:"cost",zh:"恢复成本",en:"Recovery Cost",mode:"cost"},{id:"support",zh:"当前最可靠的支撑方式",en:"Most Reliable Support Now",mode:"quiet"},{id:"experiment",zh:"七日恢复实验",en:"Seven-day Recovery Experiment",mode:"action"}],
  },
  "romance-report": {
    field: "04", layer: "field", nameZh: "桃花磁场指数", nameEn: "Romance Resonance Index",
    cardDefinitionZh: "看见吸引怎样被看见、靠近与回应。", cardDefinitionEn: "See how attraction becomes visibility, approach and response.",
    keywordsZh: ["吸引", "靠近", "回应", "筛选", "边界", "现实入口"], keywordsEn: ["Attraction", "Approach", "Response", "Discernment", "Boundary", "Real Entry"],
    ctaZh: "连接我的桃花磁场 →", ctaEn: "Connect My Romance Field →",
    coreTitleZh: "看见一段连接开始以前，吸引怎样流动", coreTitleEn: "See how attraction moves before a connection begins",
    overviewZh: ["吸引不只发生在“有没有人喜欢”。一个连接形成以前，要经过被看见、产生关注、释放与接收信号、回应、筛选，再进入现实互动。", "有些连接停在被看见以前，有些已经产生吸引却没有形成清晰回应。这里真正观察的是：当前互动信号流到了哪里。"],
    overviewEn: ["Attraction is more than whether someone likes you. Before a real connection forms, visibility, attention, signaling, reception, response, discernment and real interaction all matter.", "Some connections stop before visibility; others carry attraction without a clear response. This reading locates where the interaction signal currently reaches."],
    readingZh: "桃花磁场指数读取关系建立以前的互动信号，并辨认连接最容易停止的环节。", readingEn: "Romance Resonance reads interaction signals before relationship formation and locates where connection most often stops.",
    structureZh: ["可见度", "吸引表达", "信号接收", "回应方式", "筛选结构", "现实入口"], structureEn: ["Visibility", "Expression", "Reception", "Response", "Discernment", "Real Entry"],
    resultOutline: [{id:"field",zh:"当前吸引场",en:"Current Attraction Field",mode:"core"},{id:"seen",zh:"怎样被看见",en:"How You Are Seen",mode:"primary"},{id:"signal",zh:"吸引怎样自然表达",en:"How Attraction Is Expressed",mode:"secondary"},{id:"receive",zh:"怎样读取别人的靠近",en:"How Approach Is Received",mode:"edge"},{id:"filter",zh:"真正筛选什么",en:"What You Truly Filter",mode:"quiet"},{id:"break",zh:"当前连接断点",en:"Current Connection Breakpoint",mode:"cost"},{id:"entry",zh:"现实入口",en:"Real-world Entry",mode:"action"},{id:"experiment",zh:"七日现实实验",en:"Seven-day Reality Experiment",mode:"evidence"}],
  },
  "wealth-report": {
    field: "05", layer: "field", nameZh: "财富创造地图", nameEn: "Wealth Creation Map",
    cardDefinitionZh: "看见价值从哪里产生，又在哪里停止流动。", cardDefinitionEn: "See where value begins and where its movement stops.",
    keywordsZh: ["发现价值", "构建表达", "资源交换", "储存复制", "承接能力"], keywordsEn: ["Discovery", "Expression", "Exchange", "Replication", "Capacity"],
    ctaZh: "进入财富创造地图 →", ctaEn: "Enter My Wealth Creation Map →",
    coreTitleZh: "看见价值怎样从自己这里进入现实", coreTitleEn: "See how value moves from you into reality",
    overviewZh: ["财富创造不只发生在收到结果的一刻。价值要经过发现、创造、连接、深化、放大与承接，才真正进入现实。", "这里不读取“财运”。它寻找价值流在哪一环最强，以及启动、完成、曝光、定价、连接、放大或承接中的哪个环节正在停止流动。"],
    overviewEn: ["Wealth creation does not happen only when a result arrives. Value moves through discovery, creation, connection, mastery, amplification and capacity before it enters reality.", "This is not a fortune reading. It locates the strongest link in value flow and where initiation, completion, exposure, pricing, connection, amplification or capacity becomes blocked."],
    readingZh: "财富创造地图读取价值从想法进入现实的完整路径，并识别当前最明显的结构阻塞。", readingEn: "Wealth Creation Map reads the full path from idea to reality and identifies the clearest structural blockage.",
    structureZh: ["洞察", "创造", "连接", "深化", "放大", "承接"], structureEn: ["Insight", "Creation", "Connection", "Mastery", "Amplification", "Capacity"],
    resultOutline: [{id:"current",zh:"当前价值创造结构",en:"Current Value Creation Structure",mode:"core"},{id:"discover",zh:"发现价值",en:"Discovering Value",mode:"primary"},{id:"create",zh:"把价值做出来",en:"Making Value Real",mode:"secondary"},{id:"connect",zh:"让价值进入连接",en:"Moving Value into Connection",mode:"edge"},{id:"scale",zh:"深化、放大与传播",en:"Mastery, Amplification and Reach",mode:"history"},{id:"capacity",zh:"承接空间",en:"Capacity to Hold Results",mode:"quiet"},{id:"block",zh:"当前主要阻塞",en:"Current Primary Block",mode:"cost"},{id:"experiment",zh:"七日现实实验",en:"Seven-day Reality Experiment",mode:"action"}],
  },
  "daily-tide-report": {
    field: "06", layer: "field", nameZh: "今日潮汐", nameEn: "Today's Tide",
    cardDefinitionZh: "记录今天，也看见状态怎样流动。", cardDefinitionEn: "Record today and see how your state moves over time.",
    keywordsZh: ["今日状态", "关系窗口", "观察变量", "节律回看"], keywordsEn: ["Today", "Relational Window", "Variables", "Rhythm Review"],
    ctaZh: "感知我的今日潮汐 →", ctaEn: "Sense My Today's Tide →",
    coreTitleZh: "记录今天，也看见状态怎样流动", coreTitleEn: "Record today and see how state changes",
    overviewZh: ["今天的能量、情绪负荷、专注空间与连接容量，会随着现实持续变化。一次记录只描述今天；记录积累后，才逐渐形成属于自己的状态节律。", "缺失的一天永远是 Missing，不是 0。今日潮汐不把一次状态永久化，也不把它包装成今日运势。"],
    overviewEn: ["Energy, emotional load, focus space and relational capacity change with lived reality. One entry describes today; accumulated entries gradually reveal a personal rhythm.", "A missing day is always Missing, never zero. Today's Tide does not turn one state into a permanent identity or a daily fortune."],
    readingZh: "今日潮汐读取当前真实状态，并在用户持续记录后形成个人时间序列。", readingEn: "Today's Tide reads the present state and forms a personal time series through continued entries.",
    structureZh: ["能量", "情绪负荷", "专注空间", "连接容量", "今日焦点"], structureEn: ["Energy", "Emotional Load", "Focus", "Connection Capacity", "Today's Focus"],
    resultOutline: [{id:"today",zh:"今日状态",en:"Today's State",mode:"core"},{id:"four",zh:"四项状态结构",en:"Four State Dimensions",mode:"primary"},{id:"focus",zh:"今日关注领域",en:"Today's Focus",mode:"secondary"},{id:"observe",zh:"一句观察",en:"One Observation",mode:"action"},{id:"timeline",zh:"状态时间轴",en:"State Timeline",mode:"timeline"}],
  },
  "tarot-reading": {
    field: "07", layer: "field", nameZh: "灵犀量子生命镜像", nameEn: "Lingxi Quantum Life Mirror",
    cardDefinitionZh: "从三个观察面，重新看见正在经历的事情。", cardDefinitionEn: "See one lived situation again through three viewpoints.",
    keywordsZh: ["经验镜像", "当下镜像", "展开镜像", "现实路径"], keywordsEn: ["Experience", "Present", "Unfolding", "Real Path"],
    ctaZh: "与生命镜像连接 →", ctaEn: "Connect with the Life Mirror →",
    coreTitleZh: "同一件正在经历的事情，从三个观察面重新看见", coreTitleEn: "See one unfolding situation again from three viewpoints",
    overviewZh: ["有些事情一直想不清楚，不是因为信息不足，而是注意力停留在同一个位置。生命镜像从一个正在发生的问题进入，把它折射为经验、当下与展开三个观察面。", "“展开”指改变关键变量后可能出现的条件路径，不是未来预测。"],
    overviewEn: ["Some situations remain unclear not because information is missing, but because attention stays in one position. Life Mirror refracts one lived question through experience, present reality and unfolding conditions.", "Unfolding means conditional paths that may appear when a key variable changes—not prediction."],
    readingZh: "生命镜像分别观察已有经验、当前结构与条件路径，让同一事件从不同位置重新变得可见。", readingEn: "Life Mirror reads prior experience, present structure and conditional paths so one event becomes visible from different positions.",
    structureZh: ["当前问题", "经验镜像", "当下镜像", "展开镜像", "行动空间"], structureEn: ["Current Question", "Experience Mirror", "Present Mirror", "Unfolding Mirror", "Action Space"],
    resultOutline: [{id:"theme",zh:"当前核心主题",en:"Current Core Theme",mode:"core"},{id:"experience",zh:"经验镜像",en:"Experience Mirror",mode:"history"},{id:"present",zh:"当下镜像",en:"Present Mirror",mode:"primary"},{id:"unfold",zh:"展开镜像",en:"Unfolding Mirror",mode:"secondary"},{id:"connect",zh:"三镜之间的连接",en:"Connection Across Three Mirrors",mode:"edge"},{id:"variable",zh:"最值得移动的变量",en:"Variable Most Worth Moving",mode:"quiet"},{id:"experiment",zh:"一个三日实验",en:"One Three-day Experiment",mode:"action"}],
  },
  "qian-reading": {
    field: "08", layer: "field", nameZh: "灵犀生命灵签", nameEn: "Lingxi Life Oracle",
    cardDefinitionZh: "让一个正在发生的问题，形成此刻的意识坐标。", cardDefinitionEn: "Let a lived question form a coordinate for attention now.",
    keywordsZh: ["源流", "核心", "行者", "象征映照"], keywordsEn: ["Source", "Core", "Wayfarer", "Symbolic Reflection"],
    ctaZh: "开启我的生命灵签 →", ctaEn: "Open My Life Oracle →",
    coreTitleZh: "从一个正在发生的问题，把注意力落到最值得看见的位置", coreTitleEn: "Let a lived question place attention where it matters most",
    overviewZh: ["生命灵签保留灵犀场的象征语言，但小程序不采用随机抽取。用户先进入一个真实主题，再完成直觉选择；不同选择激活象征节点，形成此刻的意识坐标。", "重点不是“抽到了哪一签”，而是这组象征为什么在此刻与当前主题形成连接，并如何回到真实经历中确认。"],
    overviewEn: ["Life Oracle retains Lingxifield's symbolic language without random drawing. A real theme and intuitive choices activate symbolic nodes into a present coordinate for attention.", "The point is not which sign was drawn, but why these symbols connect with the current theme and how lived experience confirms them."],
    readingZh: "生命灵签把难以直接描述的问题转换成象征坐标，再将结果带回真实经历确认。", readingEn: "Life Oracle translates a difficult-to-name question into symbolic coordinates, then returns them to lived experience for confirmation.",
    structureZh: ["当前主题", "源流签", "灵魂签", "行者签", "现实观察"], structureEn: ["Current Theme", "Source Sign", "Soul Sign", "Wayfarer Sign", "Reality Observation"],
    resultOutline: [{id:"theme",zh:"当前主题",en:"Current Theme",mode:"core"},{id:"source",zh:"源流签",en:"Source Sign",mode:"history"},{id:"soul",zh:"灵魂签",en:"Soul Sign",mode:"primary"},{id:"walker",zh:"行者签",en:"Wayfarer Sign",mode:"action"},{id:"connection",zh:"三签之间的连接",en:"Connection Across Three Signs",mode:"edge"},{id:"why",zh:"为什么出现这组三签",en:"Why These Three Signs Appeared",mode:"evidence"},{id:"observe",zh:"一句现实观察",en:"One Reality Observation",mode:"quiet"}],
  },
  "life-archetype": {
    field: "09", layer: "convergence", nameZh: "生命原型 · 八流归一", nameEn: "Life Archetype · Eight Streams as One",
    cardDefinitionZh: "八条生命支流完成汇聚，原型由跨域结构自然显现。", cardDefinitionEn: "Eight life streams converge and reveal a cross-field archetype.",
    keywordsZh: ["八重汇流", "节点相连", "结构张力", "当前原型"], keywordsEn: ["Eight-field Convergence", "Node Links", "Structural Tension", "Current Archetype"],
    ctaZh: "查看八流归一进度 →", ctaEn: "View Convergence Progress →",
    coreTitleZh: "八条生命支流共同汇聚，整体原型自然显现", coreTitleEn: "Eight life streams converge and reveal the whole archetype",
    overviewZh: ["生命原型并非一次测定，而是由八条生命支流共同汇聚而成。自第一条支流完成之日起，365 天内完成并解锁八项场域精测；八流全部抵达后，系统自动生成报告并保存到“我的场域”。", "它呈现的不是八份结果的叠加，而是关系、韧性、创造、状态与生命结构交汇以后形成的主轴、增强回路、承接差与现实入口。八流汇聚，原型自现。"],
    overviewEn: ["Life Archetype is not one assessment. Complete and unlock all eight field readings within 365 days of the first completed stream; the system then generates and archives it automatically.", "It is not a summary of eight results. It reveals the primary axis, reinforcement loops, capacity gaps and reality entrance that emerge where the eight fields meet."],
    readingZh: "系统只读取本人已完成并授权保存的八个独立场域档案，以跨域节点关系生成八流归一结构，不设第九套问卷，也不单独售卖。", readingEn: "The system reads eight completed, user-authorized field archives and generates a cross-field structure—without a ninth questionnaire or separate purchase.",
    structureZh: ["当前原型", "八重贡献", "结构关系", "现实入口"], structureEn: ["Current Archetype", "Eight-field Contribution", "Structural Relations", "Reality Entry"],
    resultOutline: [{id:"archetype",zh:"当前原型",en:"Current Archetype",mode:"core"},{id:"why",zh:"为什么是它",en:"Why This Archetype",mode:"evidence"},{id:"contribution",zh:"八重场域贡献",en:"Eight-field Contribution",mode:"history"},{id:"relation",zh:"当前结构关系",en:"Current Structural Relations",mode:"edge"},{id:"tension",zh:"正在形成的张力",en:"Emerging Tension",mode:"quiet"},{id:"entry",zh:"当前现实入口",en:"Current Reality Entry",mode:"action"}],
  },
};

export function getFieldProductCopy(productId: string) {
  return FIELD_PRODUCT_COPY[productId];
}
