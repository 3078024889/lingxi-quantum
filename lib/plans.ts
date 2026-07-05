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
  { id: "bundle", name: "四项合集", nameEn: "Four-in-One Set", priceUsd: 999, type: "permanent", note: "永久有效，免费享有日后新增的全部练习技术", noteEn: "Yours forever, including every future practice added later, free.", highlight: true, group: "cultivation" },
  { id: "breath", name: "量子呼吸", nameEn: "Quantum Breath", priceUsd: 268, type: "permanent", note: "单次能量交换，永久有效", noteEn: "A single energy exchange — yours forever.", group: "cultivation" },
  { id: "intuition", name: "直觉智能", nameEn: "Intuitive Intelligence", priceUsd: 268, type: "permanent", note: "单次能量交换，永久有效", noteEn: "A single energy exchange — yours forever.", group: "cultivation" },
  { id: "heart-reset", name: "心的重置", nameEn: "Heart Reset", priceUsd: 268, type: "permanent", note: "单次能量交换，永久有效", noteEn: "A single energy exchange — yours forever.", group: "cultivation" },
  { id: "ascending-heart", name: "上升之心", nameEn: "Ascending Heart", priceUsd: 268, type: "permanent", note: "单次能量交换，永久有效", noteEn: "A single energy exchange — yours forever.", group: "cultivation" },
];

export const manifestationProducts: Product[] = [
  { id: "day", name: "单日体验", nameEn: "One-Day Pass", priceUsd: 9.9, type: "subscription", days: 1, note: "体验一天显化与梦境解读", noteEn: "Experience Manifestation & Dream Interpretation for a day.", group: "manifestation" },
  { id: "month", name: "月度订阅", nameEn: "Monthly", priceUsd: 99, type: "subscription", days: 30, note: "每月持续对齐", noteEn: "Stay aligned, month after month.", highlight: true, group: "manifestation" },
  { id: "year", name: "年度订阅", nameEn: "Yearly", priceUsd: 999, type: "subscription", days: 365, note: "一年深度旅程，最佳价值", noteEn: "A year-long journey — best value.", group: "manifestation" },
];

// 多维叙事：每份 $9，一次能量交换，终身可看
export const narrativeProducts: Product[] = NARRATIVES.map((n) => ({
  id: n.slug, name: n.title, nameEn: n.titleEn, priceUsd: n.price, type: "permanent" as const,
  note: "一次能量交换，终身可看", noteEn: "One energy exchange — yours to read for life.",
  group: "cultivation" as const,
}));

export const allProducts = [...cultivationProducts, ...manifestationProducts, ...narrativeProducts];
export function getProduct(id: string) {
  return allProducts.find((p) => p.id === id);
}
