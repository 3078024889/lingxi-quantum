import type { SasiKnowledgeDomain } from "@/lib/sasi/knowledge/ontology";

export type SasiLearningPriority =
  | "critical"
  | "high"
  | "normal"
  | "low";

export type SasiActiveLearningItem = {
  id: string;
  question: string;
  domain: SasiKnowledgeDomain;
  reason:
    | "unknown"
    | "low-confidence"
    | "contradiction"
    | "stale"
    | "task-blocker"
    | "user-correction";
  priority: SasiLearningPriority;
  sourceContextIds: string[];
  createdAt: string;
};

const PRIORITY_SCORE: Record<SasiLearningPriority, number> = {
  critical: 4,
  high: 3,
  normal: 2,
  low: 1,
};

export function rankActiveLearningQueue(items: SasiActiveLearningItem[]) {
  return [...items].sort((a, b) => {
    const p = PRIORITY_SCORE[b.priority] - PRIORITY_SCORE[a.priority];
    if (p !== 0) return p;
    return a.createdAt.localeCompare(b.createdAt);
  });
}
