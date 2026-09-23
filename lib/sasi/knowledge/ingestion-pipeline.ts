import type { SasiKnowledgeCandidate } from "@/lib/sasi/knowledge/candidate";
import type { SasiIngestionSource } from "@/lib/sasi/knowledge/source-types";
import { sourceCanGroundFacts } from "@/lib/sasi/knowledge/source-types";
import type { SasiTeacherReview } from "@/lib/sasi/teachers/review";
import { aggregateTeacherReviews } from "@/lib/sasi/teachers/review";

export type SasiIngestionDecision =
  | {
      action: "reject";
      reasons: string[];
    }
  | {
      action: "needs-evidence";
      reasons: string[];
      evidenceRequests: string[];
    }
  | {
      action: "candidate-ready";
      reasons: string[];
      confidenceCeiling: number;
    };

export function decideKnowledgeCandidate(
  candidate: SasiKnowledgeCandidate,
  sources: SasiIngestionSource[],
  reviews: SasiTeacherReview[],
): SasiIngestionDecision {
  const reasons: string[] = [];
  const sourceById = new Map(sources.map((source) => [source.id, source]));
  const candidateSources = candidate.sourceIds
    .map((id) => sourceById.get(id))
    .filter((source): source is SasiIngestionSource => Boolean(source));

  if (candidateSources.length !== candidate.sourceIds.length) {
    return { action: "reject", reasons: ["UNKNOWN_SOURCE_REFERENCE"] };
  }

  const groundingSources = candidateSources.filter(sourceCanGroundFacts);
  const review = aggregateTeacherReviews(candidate, reviews);

  if (review.challengeCount > 0) {
    reasons.push("TEACHER_CHALLENGE_PRESENT");
  }

  if (groundingSources.length === 0) {
    return {
      action: "needs-evidence",
      reasons: [...reasons, "NO_NON_MODEL_GROUNDING_SOURCE"],
      evidenceRequests: [
        ...review.evidenceRequests,
        "Find at least one non-model grounding source.",
      ],
    };
  }

  if (review.needsMoreEvidence) {
    return {
      action: "needs-evidence",
      reasons: [...reasons, "TEACHER_REVIEW_REQUIRES_MORE_EVIDENCE"],
      evidenceRequests: review.evidenceRequests,
    };
  }

  const independentGroundingKeys = new Set(
    groundingSources.map((source) => source.url || source.contentHash),
  );

  const confidenceCeiling =
    independentGroundingKeys.size >= 2 && review.consensus ? 0.95 : 0.85;

  return {
    action: "candidate-ready",
    reasons: ["GROUNDED_CANDIDATE_READY_FOR_PROMOTION_POLICY"],
    confidenceCeiling,
  };
}
