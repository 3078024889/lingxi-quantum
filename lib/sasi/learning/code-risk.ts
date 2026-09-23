import { classifySasiCodePath } from "@/lib/sasi/learning/code-evolution-policy";

export type SasiCodeRiskLevel = "low" | "medium" | "high" | "blocked";

export type SasiCodeRiskAssessment = {
  level: SasiCodeRiskLevel;
  reasons: string[];
  requiresHumanReview: boolean;
};

export function assessCodeProposalRisk(input: {
  paths: string[];
  totalBytes: number;
  fileCount: number;
  touchesExports: boolean;
  addsNetworkCall: boolean;
  addsPersistenceWrite: boolean;
}) : SasiCodeRiskAssessment {
  const reasons: string[] = [];

  for (const path of input.paths) {
    const zone = classifySasiCodePath(path);
    if (zone === "immutable" || zone === "protected") {
      return {
        level: "blocked",
        reasons: [`BLOCKED_ZONE:${path}:${zone}`],
        requiresHumanReview: true,
      };
    }
  }

  let score = 0;
  if (input.fileCount > 3) {
    score += 2;
    reasons.push("MULTI_FILE_CHANGE");
  }
  if (input.totalBytes > 64 * 1024) {
    score += 2;
    reasons.push("LARGE_CHANGE");
  }
  if (input.touchesExports) {
    score += 1;
    reasons.push("PUBLIC_EXPORT_CHANGE");
  }
  if (input.addsNetworkCall) {
    score += 3;
    reasons.push("NETWORK_BEHAVIOR_CHANGE");
  }
  if (input.addsPersistenceWrite) {
    score += 3;
    reasons.push("PERSISTENCE_BEHAVIOR_CHANGE");
  }

  const level: SasiCodeRiskLevel =
    score >= 5 ? "high" : score >= 2 ? "medium" : "low";

  return {
    level,
    reasons,
    requiresHumanReview: true,
  };
}
