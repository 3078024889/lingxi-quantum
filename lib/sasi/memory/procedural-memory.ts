export type SasiProcedureStep = {
  order: number;
  action: string;
  rationale?: string;
  tool?: string;
  successCondition?: string;
};

export type SasiProceduralMemoryRecord = {
  id: string;
  taskFamily: string;
  strategyId?: string | null;
  title: string;
  steps: SasiProcedureStep[];
  successRate: number;
  sampleSize: number;
  lastUsedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export function shouldPromoteProcedure(input: {
  successRate: number;
  sampleSize: number;
  regressionCount: number;
}) {
  return (
    Number.isFinite(input.successRate) &&
    input.successRate >= 0.75 &&
    input.sampleSize >= 3 &&
    input.regressionCount === 0
  );
}
