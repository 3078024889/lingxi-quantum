export type MembershipBenefit = {
  title: string;
  detail?: string;
};

export type MembershipContent = {
  description: string;
  benefits: MembershipBenefit[];
  closing?: string;
  cta: string;
};

/**
 * Shared publication copy for the web membership page and Mini Program.
 * Keeping one canonical source prevents the mobile experience from falling
 * back to generic commerce language when the web narrative evolves.
 */
export const MEMBERSHIP_CONTENT: Record<string, MembershipContent> = {
  everything: {
    description: "一年内解锁灵犀场全部内容，并自动包含有效期内未来新增的报告、修炼技术、叙事与场域模块。",
    benefits: [
      { title: "场域精测 · 不限次数", detail: "10个核心产品与完整生命档案。" },
      { title: "意识显化体系", detail: "探索意识与现实创造。" },
      { title: "梦境解析体系", detail: "理解梦境中的潜意识信息。" },
      { title: "全部修炼技术", detail: "包含当前四大路径与未来新增技术。" },
      { title: "多维叙事与订阅", detail: "持续阅读灵犀场原创意识记录。" },
      { title: "未来新增全部包含", detail: "新报告、新修炼技术与新场域模块自动加入。" },
    ],
    cta: "开启场域权益",
  },
  "narrative-all": {
    description: "一年内解锁全部多维叙事，包含今日后新增的全部内容。",
    benefits: [
      { title: "长篇意识传输" },
      { title: "现实重写记录" },
      { title: "场域观察档案" },
      { title: "场域观测日志" },
      { title: "持续更新的原创多维故事" },
    ],
    cta: "开启场域权益",
  },
  breath: {
    description: "进入身体与意识重新同步的入口。",
    benefits: [
      { title: "完整量子息法修炼路径" },
      { title: "呼吸节律引导" },
      { title: "日常意识回归练习" },
      { title: "从身体层面进入稳定状态的方法" },
    ],
    closing: "让呼吸成为连接身体、意识与当下的桥梁。",
    cta: "开启这项修炼",
  },
  intuition: {
    description: "开启内在感知与直觉连接。",
    benefits: [
      { title: "直觉觉察训练" },
      { title: "内在感知练习" },
      { title: "意识判断力提升路径" },
      { title: "深层自我连接方法" },
    ],
    closing: "让被日常噪音覆盖的感知能力，重新被唤醒。",
    cta: "开启这项修炼",
  },
  "heart-reset": {
    description: "回到内在中心的位置。",
    benefits: [
      { title: "情绪归零练习" },
      { title: "内在空间整理" },
      { title: "自我观察方法" },
      { title: "心念稳定训练" },
    ],
    closing: "在变化之中，重新找到自己的中心。",
    cta: "开启这项修炼",
  },
  "ascending-heart": {
    description: "从内在觉察走向生命展开。",
    benefits: [
      { title: "心意识扩展练习" },
      { title: "生命方向觉察" },
      { title: "内在成长路径" },
      { title: "长期修炼引导" },
    ],
    closing: "让意识成长，与现实创造同步展开。",
    cta: "开启这项修炼",
  },
  year: {
    description: "一年探索旅程，最佳价值。",
    benefits: [
      { title: "显化记录空间" },
      { title: "梦境探索档案" },
      { title: "长期意识成长轨迹" },
      { title: "年度生命主题回顾" },
    ],
    cta: "开启场域权益",
  },
  month: {
    description: "每月持续打开。",
    benefits: [
      { title: "每月显化观察" },
      { title: "梦境持续解析" },
      { title: "潜意识变化记录" },
      { title: "阶段性生命主题整理" },
    ],
    cta: "开启场域权益",
  },
};
