export type SasiTeacherBudget = {
  maxCalls: number;
  maxInputTokens?: number;
  maxOutputTokens?: number;
  maxCostMinor?: number;
  currency?: string;
};

export type SasiTeacherUsage = {
  calls: number;
  inputTokens: number;
  outputTokens: number;
  costMinor: number;
};

export function assertTeacherBudget(
  budget: SasiTeacherBudget,
  usage: SasiTeacherUsage,
) {
  if (!Number.isInteger(budget.maxCalls) || budget.maxCalls < 0) {
    throw new Error("INVALID_MAX_CALLS");
  }

  if (usage.calls >= budget.maxCalls) {
    throw new Error("TEACHER_CALL_BUDGET_EXHAUSTED");
  }

  if (
    budget.maxInputTokens != null &&
    usage.inputTokens >= budget.maxInputTokens
  ) {
    throw new Error("TEACHER_INPUT_TOKEN_BUDGET_EXHAUSTED");
  }

  if (
    budget.maxOutputTokens != null &&
    usage.outputTokens >= budget.maxOutputTokens
  ) {
    throw new Error("TEACHER_OUTPUT_TOKEN_BUDGET_EXHAUSTED");
  }

  if (budget.maxCostMinor != null && usage.costMinor >= budget.maxCostMinor) {
    throw new Error("TEACHER_COST_BUDGET_EXHAUSTED");
  }
}
