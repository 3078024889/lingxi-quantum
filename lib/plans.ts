// 能量交换 · 定价结构（双语）
import { NARRATIVES } from "./narratives";
export type Product = {
  id: string;
  name: string;
  nameEn: string;
  priceUsd: number;
  type: "permanent" | "subscription";
  days?: number;
  note: string;
  noteEn: string;
  highlight?: boolean;
  group: "cultivation" | "manifestation";
};

export const cultivationProducts: Product[] = [
  { id: "bundle", name: "四项合集", nameEn: "Four-in-One Set", priceUsd: 199, type: "permanent", note: "永久有效，免费享有日后新增的全部练习技术", noteEn: "Yours forever, including every future practice added later, free.", highlight: true, group: "cultivation" },
  { id: "breath", name: "量子息法", nameEn: "Quantum Breath Method", priceUsd: 66, type: "permanent", note: "单次能量交换，永久有效", noteEn: "A single energy exchange — yours forever.", group: "cultivation" },
  { id: "intuition", name: "直觉丹道", nameEn: "The Intuitive Way", priceUsd: 66, type: "permanent", note: "单次能量交换，永久有效", noteEn: "A single energy exchange — yours forever.", group: "cultivation" },
  { id: "heart-reset", name: "归零心诀", nameEn: "Heart Reset", priceUsd: 66, type: "permanent", note: "单次能量交换，永久有效", noteEn: "A single energy exchange — yours forever.", group: "cultivation" },
  { id: "ascending-heart", name: "上升心经", nameEn: "Ascending Heart", priceUsd: 66, type: "permanent", note: "单次能量交换，永久有效", noteEn: "A single energy exchange — yours forever.", group: "cultivation" },
  { id: "narrative-all", name: "多维叙事 · 全解锁", nameEn: "All Narratives · Unlocked", priceUsd: 199, type: "permanent", note: "一次交换，解锁全部多维叙事，含日后新增的全部篇目", noteEn: "One exchange unlocks every narrative, including all added later.", highlight: true, group: "cultivation" },
  { id: "everything", name: "灵犀 · 全构造解锁", nameEn: "Lingxi · Everything Unlocked", priceUsd: 1688, type: "permanent", note: "终身有效，解锁全部多维叙事与全部修炼技术，含日后新增的一切", noteEn: "Lifetime access to every narrative and every practice technique, including everything added later.", highlight: true, group: "cultivation" },
];

export const manifestationProducts: Product[] = [
  { id: "day", name: "单日体验", nameEn: "One-Day Pass", priceUsd: 9.9, type: "subscription", days: 1, note: "体验一天显化与梦境解读", noteEn: "Experience Manifestation & Dream Interpretation for a day.", group: "manifestation" },
  { id: "month", name: "月度订阅", nameEn: "Monthly", priceUsd: 99, type: "subscription", days: 30, note: "每月持续对齐", noteEn: "Stay aligned, month after month.", highlight: true, group: "manifestation" },
  { id: "year", name: "年度订阅", nameEn: "Yearly", priceUsd: 999, type: "subscription", days: 365, note: "一年深度旅程，最佳价值", noteEn: "A year-long journey — best value.", group: "manifestation" },
];

// 多维叙事：短篇 $1，长篇 $5，一次能量交换，终身可看
export const narrativeProducts: Product[] = NARRATIVES.map((n) => ({
  id: n.slug, name: n.title, nameEn: n.titleEn, priceUsd: n.price, type: "permanent" as const,
  note: "一次能量交换，终身可看", noteEn: "One energy exchange — yours to read for life.",
  group: "cultivation" as const,
}));

export const lifeMapProducts: Product[] = [
  { id: "life-map-report", name: "生命图谱完整报告", nameEn: "Full Life Map Report", priceUsd: 9.9, type: "permanent", note: "一次能量交换，解锁你的完整命盘解读，永久保存、随时回看", noteEn: "One exchange unlocks your full chart interpretation — yours to keep, revisit anytime.", group: "cultivation" },
];

export const relationshipProducts: Product[] = [
  { id: "relationship-resonance", name: "关系共振图谱", nameEn: "Relationship Resonance Map", priceUsd: 9.9, type: "permanent", note: "一次能量交换，解锁你与任意一人的共振分析——亲密关系、合伙、任何两人关系皆可，永久保存、可测多次", noteEn: "One exchange unlocks resonance analysis between you and anyone — romantic, business, or any pairing. Yours to keep, test as many pairs as you like.", group: "cultivation" },
];

export const qianProducts: Product[] = [
  { id: "qian-reading", name: "灵犀生命灵签 · 场域解读", nameEn: "Lingxi Life Oracle · Field Reading", priceUsd: 9.9, type: "permanent", note: "一次能量交换，解锁属于你的三重生命签的完整解读——由你的真实命盘四柱确定，不是随机摇出，永久保存、可再读", noteEn: "One exchange unlocks the full reading of your three life signs — determined by your real chart pillars, not a random shake. Yours to keep, read again anytime.", group: "cultivation" },
];

export const tarotReadingProducts: Product[] = [
  { id: "tarot-reading", name: "灵犀量子塔罗 · 三张牌阵深度解读", nameEn: "Lingxi Quantum Tarot · Three-Card Deep Reading", priceUsd: 9.9, type: "permanent", note: "一次能量交换，解锁专属于你的三张牌阵——隐藏模式、当下共振、未来方向，由你的真实命盘数据确定，不是随机抽取，永久保存、可再读", noteEn: "One exchange unlocks your own three-card spread — hidden pattern, present resonance, future direction — determined by your real chart data, not a random draw. Yours to keep, read again anytime.", group: "cultivation" },
];

export const allProducts = [...cultivationProducts, ...manifestationProducts, ...narrativeProducts, ...lifeMapProducts, ...relationshipProducts, ...qianProducts, ...tarotReadingProducts];
export function getProduct(id: string) {
  return allProducts.find((p) => p.id === id);
}
