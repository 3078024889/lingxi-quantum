import type { SasiKnowledgeCandidate } from "@/lib/sasi/knowledge/candidate";

export type SasiTeacherReviewVerdict =
  | "support"
  | "challenge"
  | "insufficient-evidence"
  | "out-of-domain";

export type SasiTeacherReview = {
  id: string;
  candidateId: string;
  teacherId: string;
  verdict: SasiTeacherReviewVerdict;
  confidence: number;
  issues: string[];
  suggestedCorrections: string[];
  evidenceRequests: string[];
  createdAt: string;
};

export function aggregateTeacherReviews(
  candidate: SasiKnowledgeCandidate,
  reviews: SasiTeacherReview[],
) {
  const relevant = reviews.filter((review) => review.candidateId === candidate.id);
  const support = relevant.filter((r) => r.verdict === "support");
  const challenge = relevant.filter((r) => r.verdict === "challenge");
  const insufficient = relevant.filter(
    (r) => r.verdict === "insufficient-evidence",
  );

  const weighted = (items: SasiTeacherReview[]) =>
    items.reduce(
      (sum, item) =>
        sum +
        (Number.isFinite(item.confidence)
          ? Math.max(0, Math.min(1, item.confidence))
          : 0),
      0,
    );

  const supportWeight = weighted(support);
  const challengeWeight = weighted(challenge);

  return {
    reviewCount: relevant.length,
    supportCount: support.length,
    challengeCount: challenge.length,
    insufficientEvidenceCount: insufficient.length,
    supportWeight,
    challengeWeight,
    consensus:
      relevant.length >= 2 &&
      supportWeight > challengeWeight * 1.5 &&
      challenge.length === 0,
    needsMoreEvidence:
      insufficient.length > 0 || challengeWeight >= supportWeight,
    issues: [...new Set(relevant.flatMap((r) => r.issues))],
    evidenceRequests: [
      ...new Set(relevant.flatMap((r) => r.evidenceRequests)),
    ],
  };
}
