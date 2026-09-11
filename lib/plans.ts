// 能量交换 · 定价结构（双语）
export type Product = {
  id: string;
  name: string;
  nameEn: string;
  priceUsd: number;
  priceRmb: number;
  type: "permanent" | "subscription";
  days?: number;
  note: string;
  noteEn: string;
  highlight?: boolean;
  group: "cultivation" | "manifestation" | "production";
  sasiAmountFen?: number;
};

export const cultivationProducts: Product[] = [
  { id: "breath", name: "量子息法", nameEn: "Quantum Breath Method", priceUsd: 0, priceRmb: 0, type: "permanent", note: "免费开放：让身体与注意力重新同步。", noteEn: "Free access: bring body and attention back into sync.", group: "cultivation" },
  { id: "intuition", name: "直觉丹道", nameEn: "The Intuitive Way", priceUsd: 0, priceRmb: 0, type: "permanent", note: "免费开放：练习辨认内在感知。", noteEn: "Free access: practise recognizing inner perception.", group: "cultivation" },
  { id: "heart-reset", name: "归零心诀", nameEn: "Heart Reset", priceUsd: 0, priceRmb: 0, type: "permanent", note: "免费开放：回到内在中心。", noteEn: "Free access: return to your inner center.", group: "cultivation" },
  { id: "ascending-heart", name: "上升心经", nameEn: "Ascending Heart", priceUsd: 0, priceRmb: 0, type: "permanent", note: "免费开放：让觉察进入行动与生活。", noteEn: "Free access: carry awareness into action and life.", group: "cultivation" },
];

export const manifestationProducts: Product[] = [
  { id: "day", name: "单日体验", nameEn: "One-Day Pass", priceUsd: 1.5, priceRmb: 9.9, type: "subscription", days: 1, note: "体验一天意识显化空间", noteEn: "Experience the manifestation space for one day.", group: "manifestation" },
  { id: "month", name: "月度探索", nameEn: "Monthly", priceUsd: 23, priceRmb: 168, type: "subscription", days: 30, note: "每月持续对齐", noteEn: "Stay aligned, month after month.", highlight: true, group: "manifestation" },
  { id: "year", name: "年度旅程", nameEn: "Yearly", priceUsd: 139, priceRmb: 999, type: "subscription", days: 365, note: "一年深度旅程，最佳价值", noteEn: "A year-long journey — best value.", group: "manifestation" },
];

// 多维叙事：短篇 $1，长篇 $5，一次能量交换，终身可看
// 旧叙事内容不再作为在售商品。保留空导出，避免历史订单读取路径崩溃。
export const narrativeProducts: Product[] = [];

export const lifeMapProducts: Product[] = [
  { id: "life-map-report", name: "生命图谱完整报告", nameEn: "Full Life Map Report", priceUsd: 9.9, priceRmb: 68, type: "permanent", note: "一次能量交换，解锁你的完整命盘解读，永久保存、随时回看", noteEn: "One exchange unlocks your full chart interpretation — yours to keep, revisit anytime.", group: "cultivation" },
];

export const relationshipProducts: Product[] = [
  { id: "relationship-resonance", name: "关系共振图谱", nameEn: "Relationship Resonance Map", priceUsd: 9.9, priceRmb: 68, type: "permanent", note: "一次能量交换，解锁你与任意一人的共振分析——深度关系、合伙商业或其他重要连接皆可，永久保存、可测多次", noteEn: "One exchange unlocks resonance analysis between you and anyone — a deep relationship, business partnership, or other important connection. Yours to keep, test as many pairs as you like.", group: "cultivation" },
];

export const qianProducts: Product[] = [
  { id: "qian-reading", name: "灵犀生命灵签 · 场域解读", nameEn: "Lingxi Life Oracle · Field Reading", priceUsd: 9.9, priceRmb: 68, type: "permanent", note: "一次能量交换，解锁属于你的三重生命签的完整解读——由你的真实命盘四柱确定，不是随机摇出，永久保存、可再读", noteEn: "One exchange unlocks the full reading of your three life signs — determined by your real chart pillars, not a random shake. Yours to keep, read again anytime.", group: "cultivation" },
];

export const tarotReadingProducts: Product[] = [
  { id: "tarot-reading", name: "灵犀量子生命镜像 · 三重镜像深度解读", nameEn: "Lingxi Quantum Life Mirror · Three-Mirror Deep Reading", priceUsd: 9.9, priceRmb: 68, type: "permanent", note: "一次能量交换，解锁专属于你的三张牌阵——潜意识镜像、当下共振、未来展开，由你的真实命盘数据确定，不是随机抽取，永久保存、可再读", noteEn: "One exchange unlocks your own three-card spread — hidden pattern, present resonance, future possibility — determined by your real chart data, not a random draw. Yours to keep, read again anytime.", group: "cultivation" },
];

export const resilienceProducts: Product[] = [
  { id: "resilience-report", name: "生命韧性指数 · 完整档案", nameEn: "Life Resilience Index · Full Archive", priceUsd: 9.9, priceRmb: 68, type: "permanent", note: "一次能量交换，解锁完整的生命韧性档案——五项分数背后的具体结构、再生循环、隐藏力量，由你的真实出生信息确定，永久保存、可再读", noteEn: "One exchange unlocks your full Resilience Archive — the structure behind your five scores, your recovery cycle, your hidden strength — determined by your real birth data. Yours to keep, read again anytime.", group: "cultivation" },
];

export const romanceProducts: Product[] = [
  { id: "romance-report", name: "桃花磁场指数 · 完整档案", nameEn: "Romance Resonance Index · Full Archive", priceUsd: 9.9, priceRmb: 68, type: "permanent", note: "一次能量交换，解锁完整的桃花磁场档案——五个磁场维度、吸引力风格、命理桃花星，由你的真实出生信息确定，永久保存、可再读", noteEn: "One exchange unlocks your full Romance Resonance Archive — five field dimensions, attraction style, and traditional chart signals — determined by your real birth data. Yours to keep and revisit anytime.", group: "cultivation" },
];

export const dailyTideProducts: Product[] = [
  { id: "daily-tide-report", name: "今日潮汐 · 深度报告", nameEn: "Today’s Tide · Deep Report", priceUsd: 9.9, priceRmb: 68, type: "permanent", note: "一次能量交换，解锁从今天起的深度潮汐报告——今日六重潮汐 + 未来7/30/90天真实潮汐趋势，永久保存、可再读", noteEn: "One exchange unlocks a deep tide report starting today — six daily tides plus real 7/30/90-day tide trends. Yours to keep, read again anytime.", group: "cultivation" },
];

export const wealthProducts: Product[] = [
  { id: "wealth-report", name: "财富创造地图 · 完整档案", nameEn: "Wealth Creation Map · Full Archive", priceUsd: 9.9, priceRmb: 68, type: "permanent", note: "一次能量交换，解锁完整的财富创造地图——五个创造维度、创造类型、价值流动路径，由你的真实出生信息确定，永久保存、可再读", noteEn: "One exchange unlocks your full Wealth Creation Map — your five creative dimensions, creation type, and value flow path — determined by your real birth data. Yours to keep, read again anytime.", group: "cultivation" },
];

export const lifeArchetypeProducts: Product[] = [
  { id: "life-archetype", name: "生命原型", nameEn: "Life Archetype", priceUsd: 0, priceRmb: 0, type: "permanent", note: "一年内八个独立场域全部开启后自动生成，不单独售卖。", noteEn: "Generated automatically after all eight independent fields are opened within one year; not sold separately.", group: "cultivation" },
];

export const sasiProductionProducts: Product[] = [
  ...[
    ["sasi-balance-10", "轻量体验", "Starter", 10, 1.5],
    ["sasi-credit-entry", "创作启程", "Creative Start", 20, 3],
    ["sasi-balance-50", "单次制作", "Single Production", 50, 7.5],
    ["sasi-credit-studio", "持续制作", "Studio Flow", 100, 15],
    ["sasi-balance-200", "系列起步", "Series Start", 200, 30],
    ["sasi-credit-reserve", "工作室储备", "Studio Reserve", 500, 75],
    ["sasi-balance-1000", "系列制作", "Series Production", 1000, 150],
    ["sasi-balance-2000", "长期制作", "Long Production", 2000, 300],
    ["sasi-balance-10000", "大型项目", "Major Production", 10000, 1500],
  ].map(([id, name, nameEn, priceRmb, priceUsd]) => ({
    id: String(id), name: String(name), nameEn: String(nameEn), priceRmb: Number(priceRmb), priceUsd: Number(priceUsd),
    type: "permanent" as const, note: "充值人民币余额，用于用户明确确认后的 SASI 任务。", noteEn: "Top up the RMB balance for tasks explicitly approved by the user.",
    group: "production" as const, sasiAmountFen: Number(priceRmb) * 100,
  })),
];

export const allProducts = [...cultivationProducts, ...manifestationProducts, ...narrativeProducts, ...lifeMapProducts, ...relationshipProducts, ...qianProducts, ...tarotReadingProducts, ...resilienceProducts, ...romanceProducts, ...dailyTideProducts, ...wealthProducts, ...lifeArchetypeProducts, ...sasiProductionProducts];
export function getProduct(id: string) {
  const configured = allProducts.find((p) => p.id === id);
  if (configured) return configured;
  const custom = /^sasi-balance-custom-(\d{1,5})$/.exec(id);
  const amountRmb = custom ? Number(custom[1]) : 0;
  if (!Number.isInteger(amountRmb) || amountRmb < 10 || amountRmb > 10000) return undefined;
  return {
    id,
    name: `SASI 余额充值 ¥${amountRmb}`,
    nameEn: `SASI RMB balance ¥${amountRmb}`,
    priceUsd: Number((amountRmb * 0.15).toFixed(2)),
    priceRmb: amountRmb,
    type: "permanent" as const,
    note: "自定义人民币余额充值。",
    noteEn: "Custom RMB balance top-up.",
    group: "production" as const,
    sasiAmountFen: amountRmb * 100,
  };
}
