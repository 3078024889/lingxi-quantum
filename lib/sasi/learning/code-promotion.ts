import { canPromoteStrategy, type SasiPromotionInput } from "@/lib/sasi/learning/evolution-policy";
import { validateSasiCodeChangeRequest } from "@/lib/sasi/learning/code-evolution-policy";

export type SasiCodePromotionInput = {
  strategy: SasiPromotionInput;
  paths: string[];
  humanApproved: boolean;
  currentHeadSha: string;
  testedHeadSha: string;
};

export function canPromoteSasiCode(input: SasiCodePromotionInput) {
  const strategy = canPromoteStrategy(input.strategy);
  const change = validateSasiCodeChangeRequest({
    paths: input.paths,
    reason: "promotion",
    failureIds: [],
    strategyId: "promotion",
  });

  const reasons = [...strategy.reasons];

  if (!change.ok) reasons.push("CODE_ZONE_BLOCKED");
  if (!input.humanApproved) reasons.push("HUMAN_MERGE_APPROVAL_REQUIRED");
  if (!input.currentHeadSha || input.currentHeadSha !== input.testedHeadSha) {
    reasons.push("TESTED_HEAD_CHANGED");
  }

  return {
    ok: reasons.length === 0,
    reasons,
    fitness: strategy.fitness,
  };
}
