export type SasiRefreshCandidate = {
  key: string;
  domain: string;
  ageDays: number;
  importance: number;
  volatility: number;
};

function unit(value: number) {
  return Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0;
}

export function sasiRefreshPriority(c: SasiRefreshCandidate) {
  const age = unit(c.ageDays / 365);
  return age * 0.45 + unit(c.volatility) * 0.35 + unit(c.importance) * 0.20;
}

export function planSasiRefresh(candidates: SasiRefreshCandidate[], limit = 100) {
  const n = Math.max(0, Math.min(Math.floor(limit), 1000));
  return [...candidates]
    .sort((a,b) => sasiRefreshPriority(b) - sasiRefreshPriority(a))
    .slice(0,n);
}
