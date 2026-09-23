import type { SasiPostPromotionObservation, SasiHealthPolicy } from "@/lib/sasi/evaluation/post-promotion-health";
import { detectPromotionDegradation } from "@/lib/sasi/evaluation/post-promotion-health";

export type SasiPostPromotionDecision =
  | { action: "observe"; reasons: string[] }
  | { action: "keep"; reasons: string[] }
  | { action: "prepare-rollback"; reasons: string[] };

export function decidePostPromotionAction(input: {
  observation: SasiPostPromotionObservation;
  policy: SasiHealthPolicy;
}): SasiPostPromotionDecision {
  const result = detectPromotionDegradation(input.observation, input.policy);

  if (!result.decisive) {
    return { action: "observe", reasons: result.reasons };
  }
  if (result.degraded) {
    return { action: "prepare-rollback", reasons: result.reasons };
  }
  return { action: "keep", reasons: ["POST_PROMOTION_HEALTHY"] };
}
