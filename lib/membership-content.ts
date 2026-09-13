export type MembershipBenefit = {
  title: string;
  detail?: string;
  titleEn?: string;
  detailEn?: string;
};

export type MembershipContent = {
  description: string;
  descriptionEn: string;
  benefits: MembershipBenefit[];
  closing?: string;
  closingEn?: string;
  cta: string;
  ctaEn: string;
};

/**
 * Shared publication copy for the web membership page and Mini Program.
 * Keeping one canonical source prevents the mobile experience from falling
 * back to generic commerce language when the web narrative evolves.
 */
export const MEMBERSHIP_CONTENT: Record<string, MembershipContent> = {
  everything: {
    description: "一年内解锁灵犀场全部内容，并自动包含有效期内未来新增的报告、修炼技术、叙事与场域模块。",
    descriptionEn: "Unlock the whole Lingxi Field for one year, including every new report, practice, narrative and field module released while access is active.",
    benefits: [
      { title: "场域精测 · 不限次数", detail: "10个核心产品与完整生命档案。", titleEn: "Unlimited Field Insight", detailEn: "Ten core products and your complete living archive." },
      { title: "意识显化体系", detail: "探索意识与现实创造。", titleEn: "Living Manifestation", detailEn: "Explore how awareness participates in creating reality." },
      { title: "显化行动档案", detail: "记录愿景、观察与现实行动的对齐过程。", titleEn: "Manifestation Action Archive", detailEn: "Track alignment across vision, observation and real-world action." },
      { title: "全部修炼技术", detail: "包含当前四大路径与未来新增技术。", titleEn: "All Practice Systems", detailEn: "The four current paths and every practice added later." },
      { title: "多维叙事与订阅", detail: "持续阅读灵犀场原创意识记录。", titleEn: "Narratives and Dispatches", detailEn: "Ongoing access to original Lingxi Field records." },
      { title: "未来新增全部包含", detail: "新报告、新修炼技术与新场域模块自动加入。", titleEn: "Future Releases Included", detailEn: "New reports, practices and field modules join automatically." },
    ],
    cta: "开启场域权益",
    ctaEn: "ENTER THE WHOLE FIELD",
  },
  "narrative-all": {
    description: "一年内解锁全部多维叙事，包含今日后新增的全部内容。",
    descriptionEn: "Unlock every multidimensional narrative for one year, including all new works released from today onward.",
    benefits: [
      { title: "长篇意识传输", titleEn: "Long-form consciousness transmissions" },
      { title: "现实重写记录", titleEn: "Reality-rewriting records" },
      { title: "场域观察档案", titleEn: "Field observation archives" },
      { title: "场域观测日志", titleEn: "Living field journals" },
      { title: "持续更新的原创多维故事", titleEn: "Continuously released original narratives" },
    ],
    cta: "开启场域权益",
    ctaEn: "OPEN THE NARRATIVE FIELD",
  },
  breath: {
    description: "进入身体与意识重新同步的入口。",
    descriptionEn: "An entrance through which body and awareness return to one rhythm.",
    benefits: [
      { title: "完整量子息法修炼路径", titleEn: "Complete Quantum Breath path" },
      { title: "呼吸节律引导", titleEn: "Guided breathing rhythms" },
      { title: "日常意识回归练习", titleEn: "Daily awareness-return practice" },
      { title: "从身体层面进入稳定状态的方法", titleEn: "Body-first methods for restoring stability" },
    ],
    closing: "让呼吸成为连接身体、意识与当下的桥梁。",
    closingEn: "Let breath become the bridge between body, awareness and the present moment.",
    cta: "开启这项修炼",
    ctaEn: "BEGIN THIS PRACTICE",
  },
  intuition: {
    description: "开启内在感知与直觉连接。",
    descriptionEn: "Reopen the connection between inner perception and intuitive knowing.",
    benefits: [
      { title: "直觉觉察训练", titleEn: "Intuitive awareness training" },
      { title: "内在感知练习", titleEn: "Inner-perception practice" },
      { title: "意识判断力提升路径", titleEn: "A path toward clearer discernment" },
      { title: "深层自我连接方法", titleEn: "Methods for deeper self-connection" },
    ],
    closing: "让被日常噪音覆盖的感知能力，重新被唤醒。",
    closingEn: "Awaken the perception that everyday noise has covered over.",
    cta: "开启这项修炼",
    ctaEn: "BEGIN THIS PRACTICE",
  },
  "heart-reset": {
    description: "回到内在中心的位置。",
    descriptionEn: "Return to the inner position from which you can meet change without losing yourself.",
    benefits: [
      { title: "情绪归零练习", titleEn: "Emotional reset practice" },
      { title: "内在空间整理", titleEn: "Inner-space clearing" },
      { title: "自我观察方法", titleEn: "Methods of self-observation" },
      { title: "心念稳定训练", titleEn: "Training for steadier attention" },
    ],
    closing: "在变化之中，重新找到自己的中心。",
    closingEn: "Find your center again while life is still changing.",
    cta: "开启这项修炼",
    ctaEn: "BEGIN THIS PRACTICE",
  },
  "ascending-heart": {
    description: "从内在觉察走向生命展开。",
    descriptionEn: "Move from inward awareness toward a life that can actually unfold.",
    benefits: [
      { title: "心意识扩展练习", titleEn: "Expanded heart-awareness practice" },
      { title: "生命方向觉察", titleEn: "Life-direction discernment" },
      { title: "内在成长路径", titleEn: "A path for inner development" },
      { title: "长期修炼引导", titleEn: "Long-term practice guidance" },
    ],
    closing: "让意识成长，与现实创造同步展开。",
    closingEn: "Let inner development and real-world creation unfold together.",
    cta: "开启这项修炼",
    ctaEn: "BEGIN THIS PRACTICE",
  },
  day: {
    description: "完成一次完整的场域进入", descriptionEn: "Enter the field for one complete experience.",
    benefits: [{ title: "进入灵犀场 · 开启一次意识显化", titleEn: "Enter Lingxi Field and begin manifestation" }],
    cta: "选择单日连接", ctaEn: "CHOOSE ONE DAY",
  },
  month: {
    description: "让每一次进入彼此相连", descriptionEn: "Let each return connect with the last.",
    benefits: [{ title: "持续进入 · 承接变化 · 形成轨迹", titleEn: "Return, meet change and form your trajectory" }],
    cta: "选择月度连接", ctaEn: "CHOOSE 30 DAYS",
  },
  year: {
    description: "让长期经历逐渐汇成你的场域轨迹", descriptionEn: "Let your experiences gradually become a lasting field trajectory.",
    benefits: [{ title: "长期连接 · 深度实践 · 场域沉淀", titleEn: "Sustained connection, deeper practice and lasting experience" }],
    cta: "选择年度连接", ctaEn: "CHOOSE 365 DAYS",
  },
};
