export type SasiFailureCategory =
  | "knowledge-gap"
  | "reasoning-error"
  | "retrieval-error"
  | "tool-error"
  | "model-routing-error"
  | "format-error"
  | "latency-budget"
  | "cost-budget"
  | "regression"
  | "unknown";

export type SasiFailureAttribution = {
  id: string;
  runId?: string | null;
  taskFamily: string;
  failureCode: string;
  category: SasiFailureCategory;
  observation: string;
  likelyCauses: Array<{
    cause: string;
    confidence: number;
    evidenceRefs: string[];
  }>;
  affectedCapabilities: string[];
  severity: "low" | "medium" | "high" | "critical";
  reproducible: boolean;
  createdAt: string;
};

export function validateFailureAttribution(value: SasiFailureAttribution) {
  const errors: string[] = [];
  if (!value.failureCode.trim()) errors.push("FAILURE_CODE_REQUIRED");
  if (!value.observation.trim()) errors.push("OBSERVATION_REQUIRED");
  if (!value.taskFamily.trim()) errors.push("TASK_FAMILY_REQUIRED");
  if (value.likelyCauses.length === 0) errors.push("LIKELY_CAUSE_REQUIRED");

  for (const cause of value.likelyCauses) {
    if (!cause.cause.trim()) errors.push("EMPTY_CAUSE");
    if (
      !Number.isFinite(cause.confidence) ||
      cause.confidence < 0 ||
      cause.confidence > 1
    ) {
      errors.push("CAUSE_CONFIDENCE_OUT_OF_RANGE");
    }
  }

  return { ok: errors.length === 0, errors };
}
