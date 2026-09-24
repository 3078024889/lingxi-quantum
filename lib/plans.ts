// 数字服务 · 当前在售产品
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
  group: "cultivation" | "manifestation" | "production" | "ai";
  sasiAmountFen?: number;
  aiAmountFen?: number;
};

// 旧版场域精测 / 意识显化 / 修炼技术已整体下架。
// 保留空导出仅用于兼容旧代码引用与历史订单读取；它们不再进入 allProducts，
// 因此 checkout / 微信 / 支付宝都无法再创建这些旧产品的新订单。
export const cultivationProducts: Product[] = [];
export const manifestationProducts: Product[] = [];
export const narrativeProducts: Product[] = [];
export const lifeMapProducts: Product[] = [];
export const relationshipProducts: Product[] = [];
export const qianProducts: Product[] = [];
export const tarotReadingProducts: Product[] = [];
export const resilienceProducts: Product[] = [];
export const romanceProducts: Product[] = [];
export const dailyTideProducts: Product[] = [];
export const wealthProducts: Product[] = [];
export const lifeArchetypeProducts: Product[] = [];

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
    id: String(id),
    name: String(name),
    nameEn: String(nameEn),
    priceRmb: Number(priceRmb),
    priceUsd: Number(priceUsd),
    type: "permanent" as const,
    note: "充值人民币余额，用于用户明确确认后的 SASI 创作与生产任务。",
    noteEn: "Top up RMB balance for SASI creation and production tasks explicitly approved by the user.",
    group: "production" as const,
    sasiAmountFen: Number(priceRmb) * 100,
  })),
];

export const aiBalanceProducts: Product[] = [
  ...[
    ["ai-balance-10","AI余额 ¥10","AI Balance ¥10",10,1.5],
    ["ai-balance-30","AI余额 ¥30","AI Balance ¥30",30,4.5],
    ["ai-balance-50","AI余额 ¥50","AI Balance ¥50",50,7.5],
    ["ai-balance-100","AI余额 ¥100","AI Balance ¥100",100,15],
    ["ai-balance-300","AI余额 ¥300","AI Balance ¥300",300,45],
    ["ai-balance-500","AI余额 ¥500","AI Balance ¥500",500,75],
  ].map(([id,name,nameEn,priceRmb,priceUsd])=>({
    id:String(id),
    name:String(name),
    nameEn:String(nameEn),
    priceRmb:Number(priceRmb),
    priceUsd:Number(priceUsd),
    type:"permanent" as const,
    note:"充值多少到账多少；按实际 AI 使用量扣费，未使用充值本金长期保留。",
    noteEn:"RMB balance for hosted AI usage.",
    group:"ai" as const,
    aiAmountFen:Number(priceRmb)*100,
  }))
];

export const allProducts = [...sasiProductionProducts, ...aiBalanceProducts];

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
