import "server-only";

// Internal procurement data. Never return this object from a public route.
export const SASI_PROVIDER_ECONOMICS = {
  "motion-essential": { supplierCostPerSecond: 0.36, settlementCurrency: "CNY" },
  "studio-balanced": { supplierCostPerSecond: 0.71, settlementCurrency: "CNY" },
  "signature-cinema": { supplierCostPerSecond: 2.13, settlementCurrency: "CNY" },
} as const;

export function estimateSupplierCost(routeId: keyof typeof SASI_PROVIDER_ECONOMICS, seconds: number) {
  const duration = Math.max(5, Math.min(600, Math.round(seconds)));
  const profile = SASI_PROVIDER_ECONOMICS[routeId];
  return Number((profile.supplierCostPerSecond * duration).toFixed(2));
}
