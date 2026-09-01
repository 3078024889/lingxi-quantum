export type ReportProductKey =
  | "life-map"
  | "relationship-deep"
  | "relationship-business"
  | "relationship-other"
  | "resilience"
  | "romance"
  | "wealth"
  | "daily-tide"
  | "life-mirror"
  | "life-oracle";

export type EvidenceLeafV340 = {
  id: string;
  product: ReportProductKey;
  dimension: string;
  context: string;
  answerSemantic: string;
  strength: number;
  confidence: number;
  supports: string[];
  challenges: string[];
  realityTags: string[];
};

export type LivingNode = {
  id: string;
  product: ReportProductKey;
  titleZh: string;

  // 此节点究竟解决用户哪个现实问题
  userPain: string;

  // 不能直接输出给用户，属于作者层的“真判断”
  coreTruth: string;

  // 何种证据才有资格触发
  requiresAny: string[];
  requiresAll?: string[];
  forbidsIf?: string[];

  // 一正一反，不允许只写好话
  strengthWhenActive: string;
  costWhenOverused: string;
  suppressedForm: string;

  // 现实场景必须落地
  livedScenes: string[];
  falsifiers: string[];

  // 文言不是翻译，而是最终语言原料
  classicalLexicon: string[];
  modernEvidenceLexicon: string[];
};

export type CrossEvidencePattern = {
  primary: LivingNode;
  support: LivingNode | null;
  counter: LivingNode | null;
  leaves: EvidenceLeafV340[];
  contradictions: EvidenceLeafV340[];
  confidence: "clear" | "strong" | "forming" | "conditional" | "open";
};

export type LivingChapterSpec = {
  id: string;
  product: ReportProductKey;
  titleZh: string;

  // 这一章必须回答的一个问题
  question: string;

  // 用户读完必须得到的现实价值
  resolves: string;

  minIndependentContexts: number;
  requiredDimensions: string[];
  optionalDimensions: string[];

  realityDomains: Array<
    "relationship"|"work"|"money"|"decision"|"stress"|"boundary"|"creation"|"daily"
  >;
};

export type LivingChapter = {
  id: string;
  titleZh: string;
  verdictZh: string;
  bodyZh: string;
  verificationZh: string;
  evidenceLevelZh: "已成主轴"|"证据清晰"|"正在形成"|"因境而异"|"尚不立论";
  evidenceTrace: Array<{leafId:string; dimension:string; context:string}>;
};
